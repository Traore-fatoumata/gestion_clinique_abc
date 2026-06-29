const pool = require("../config/db")
const { notifyUtilisateur } = require("../services/notificationService")

// Helper to calculate default consultation fee
const getDefaultConsultationTarif = (dateNaissance) => {
  if (!dateNaissance) return 20000
  const birthDate = new Date(dateNaissance)
  const age = new Date().getFullYear() - birthDate.getFullYear()
  return age <= 15 ? 15000 : 20000
}

/**
 * POST /api/references
 * Référer un patient vers un ou plusieurs services simultanément
 */
const creerReferences = async (req, res) => {
  const { patient_id, services_destinataires, motif_reference, priorite = "Normale", commentaires } = req.body
  const medecin_demandeur_id = req.user.id
  const service_origine = req.user.specialite || "Médecine générale"

  if (!patient_id) {
    return res.status(400).json({ success: false, message: "patient_id requis." })
  }
  if (!services_destinataires || !Array.isArray(services_destinataires) || services_destinataires.length === 0) {
    return res.status(400).json({ success: false, message: "Au moins un service destinataire est requis." })
  }
  if (!motif_reference?.trim()) {
    return res.status(400).json({ success: false, message: "Le motif de la référence est obligatoire." })
  }

  const client = await pool.connect()
  try {
    await client.query("BEGIN")

    // Fetch patient name for notifications
    const { rows: patRows } = await client.query("SELECT nom FROM patients WHERE id=$1", [patient_id])
    const patientNom = patRows[0]?.nom || "Patient inconnu"

    // Find if there is an active parcours for the patient today
    const { rows: parcRows } = await client.query(
      `SELECT id FROM parcours_patient 
       WHERE patient_id=$1 AND date_sortie IS NULL 
       ORDER BY date_entree DESC LIMIT 1`,
      [patient_id]
    )
    let parcoursId = parcRows[0]?.id || null

    // If no active parcours, create one
    if (!parcoursId) {
      const { rows: newParc } = await client.query(
        `INSERT INTO parcours_patient (patient_id, service_actuel, motif_admission, statut)
         VALUES ($1, $2, $3, 'en_consultation')
         RETURNING id`,
        [patient_id, service_origine, motif_reference]
      )
      parcoursId = newParc[0].id
    }

    const referencesCrees = []

    for (const serviceDest of services_destinataires) {
      const { rows: refRows } = await client.query(
        `INSERT INTO references_services 
           (parcours_id, patient_id, medecin_demandeur_id, service_origine, service_destinataire, motif_reference, priorite, statut, commentaires)
         VALUES ($1, $2, $3, $4, $5, $6, $7, 'En attente', $8)
         RETURNING *`,
        [parcoursId, patient_id, medecin_demandeur_id, service_origine, serviceDest, motif_reference, priorite, commentaires]
      )
      referencesCrees.push(refRows[0])

      // Find doctors of destination service
      const { rows: docs } = await client.query(
        `SELECT id, nom, specialite FROM utilisateurs 
         WHERE LOWER(specialite) = LOWER($1) AND role IN ('medecin', 'medecin_chef') AND actif=TRUE`,
        [serviceDest]
      )

      // Add patient to file_attente for each destination doctor
      const today = new Date().toISOString().slice(0, 10)
      const now = new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })
      
      for (const doc of docs) {
        // Check if patient is already in this doctor's file for today
        const { rows: existing } = await client.query(
          `SELECT id FROM file_attente 
           WHERE patient_id=$1 AND medecin_id=$2 AND date_entree=$3 AND statut != 'termine'`,
          [patient_id, doc.id, today]
        )
        
        if (existing.length === 0) {
          // Add patient to destination doctor's waiting list
          await client.query(
            `INSERT INTO file_attente 
             (patient_id, medecin_id, service, motif, date_entree, heure_arrivee, type_visite, statut, priorite, observations)
             VALUES ($1, $2, $3, $4, $5, $6, 'reference', 'en_attente', $7, $8)
             RETURNING id`,
            [patient_id, doc.id, serviceDest, motif_reference, today, now, priorite, `Référé par ${service_origine}: ${motif_reference}`]
          )
        }

        // Notify doctors of destination service
        await notifyUtilisateur(doc.id, {
          titre: `Nouvelle référence (${priorite}) — ${patientNom}`,
          patient_nom: patientNom,
          motif: `${motif_reference} (Référé par Dr. ${req.user.nom})`,
          service: serviceDest,
          type_notif: "reference_recue",
          patient_id
        })
      }
    }

    // Update current parcours stage
    await client.query(
      `UPDATE parcours_patient 
       SET service_actuel = $1, updated_at = NOW() 
       WHERE id = $2`,
      [service_origine, parcoursId]
    )

    await client.query("COMMIT")
    return res.status(201).json({ success: true, message: "Référence(s) enregistrée(s) avec succès.", references: referencesCrees })

  } catch (err) {
    await client.query("ROLLBACK")
    console.error("creerReferences:", err)
    return res.status(500).json({ success: false, message: "Erreur lors de la création de la référence." })
  } finally {
    client.release()
  }
}

/**
 * GET /api/references/service/:service
 * Lister les références entrantes pour un service destinataire
 */
const listerReferencesRecues = async (req, res) => {
  const { service } = req.params
  const { statut } = req.query

  try {
    let query = `
      SELECT 
        r.id, r.parcours_id, r.patient_id, r.medecin_demandeur_id,
        r.service_origine, r.service_destinataire, r.motif_reference,
        r.priorite, r.statut, r.commentaires, r.date_creation, r.date_mise_a_jour,
        p.nom AS patient_nom, p.pid, p.date_naissance AS patient_date_naissance, p.sexe AS patient_sexe, p.telephone AS patient_telephone,
        u.nom AS medecin_demandeur_nom
      FROM references_services r
      JOIN patients p ON p.id = r.patient_id
      JOIN utilisateurs u ON u.id = r.medecin_demandeur_id
      WHERE LOWER(r.service_destinataire) = LOWER($1)
    `
    const params = [service]
    
    if (statut) {
      query += ` AND r.statut = $2`
      params.push(statut)
    }

    query += " ORDER BY r.date_creation DESC"
    const { rows } = await pool.query(query, params)

    const formatted = rows.map(r => ({
      id: r.id,
      parcoursId: r.parcours_id,
      patientId: r.patient_id,
      pid: r.pid,
      patientNom: r.patient_nom,
      patientDateNaissance: r.patient_date_naissance,
      patientSexe: r.patient_sexe,
      patientTelephone: r.patient_telephone,
      medecinDemandeurId: r.medecin_demandeur_id,
      medecinDemandeurNom: r.medecin_demandeur_nom,
      serviceOrigine: r.service_origine,
      serviceDestinataire: r.service_destinataire,
      motifReference: r.motif_reference,
      priorite: r.priorite,
      statut: r.statut,
      commentaires: r.commentaires,
      dateCreation: r.date_creation,
      dateMiseAJour: r.date_mise_a_jour
    }))

    return res.json({ success: true, references: formatted })
  } catch (err) {
    console.error("listerReferencesRecues:", err)
    return res.status(500).json({ success: false, message: "Erreur serveur lors de la récupération des références." })
  }
}

/**
 * GET /api/references/envoyees
 * Lister les références envoyées par le médecin connecté
 */
const listerReferencesEnvoyees = async (req, res) => {
  try {
    const query = `
      SELECT 
        r.id, r.parcours_id, r.patient_id, r.medecin_demandeur_id,
        r.service_origine, r.service_destinataire, r.motif_reference,
        r.priorite, r.statut, r.commentaires, r.date_creation, r.date_mise_a_jour,
        p.nom AS patient_nom, p.pid,
        u.nom AS medecin_demandeur_nom
      FROM references_services r
      JOIN patients p ON p.id = r.patient_id
      JOIN utilisateurs u ON u.id = r.medecin_demandeur_id
      WHERE r.medecin_demandeur_id = $1
      ORDER BY r.date_creation DESC
    `
    const { rows } = await pool.query(query, [req.user.id])
    return res.json({ success: true, references: rows })
  } catch (err) {
    console.error("listerReferencesEnvoyees:", err)
    return res.status(500).json({ success: false, message: "Erreur serveur." })
  }
}

/**
 * PATCH /api/references/:id/statut
 * Mettre à jour le statut d'une référence
 */
const mettreAJourStatutReference = async (req, res) => {
  const { id } = req.params
  const { statut, commentaires_maj } = req.body

  if (!statut) {
    return res.status(400).json({ success: false, message: "statut requis." })
  }

  const client = await pool.connect()
  try {
    await client.query("BEGIN")

    // Fetch the reference
    const { rows: refRows } = await client.query(
      "SELECT patient_id, service_destinataire, service_origine, motif_reference, parcours_id FROM references_services WHERE id=$1",
      [id]
    )
    if (refRows.length === 0) {
      await client.query("ROLLBACK")
      return res.status(404).json({ success: false, message: "Référence introuvable." })
    }

    const { patient_id, service_destinataire, service_origine, motif_reference, parcours_id } = refRows[0]

    // Update reference status
    const { rows: updatedRows } = await client.query(
      `UPDATE references_services 
       SET statut = $1, commentaires = COALESCE($2, commentaires), date_mise_a_jour = NOW() 
       WHERE id = $3 
       RETURNING *`,
      [statut, commentaires_maj || null, id]
    )

    // If reference is accepted, place the patient on the waitlist (file_attente) for the destination service
    if (statut === "Acceptée") {
      const nowTime = new Date().toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })

      // Get patient date of birth
      const { rows: patRows } = await client.query("SELECT date_naissance FROM patients WHERE id=$1", [patient_id])
      const birth = patRows[0]?.date_naissance || null
      const fee = getDefaultConsultationTarif(birth)

      // Add to waitlist
      await client.query(
        `INSERT INTO file_attente 
           (patient_id, medecin_id, type_visite, statut, motif, service, arrivee, montant_consultation, type_consultation)
         VALUES ($1, $2, 'consultation', 'en_attente', $3, $4, $5, $6, 'standard')
         ON CONFLICT DO NOTHING`,
        [patient_id, req.user.id, `Référé: ${motif_reference}`, service_destinataire, nowTime, fee]
      )

      // Update patient journey stage
      if (parcours_id) {
        await client.query(
          `UPDATE parcours_patient 
           SET service_actuel = $1, statut = 'en_consultation', updated_at = NOW() 
           WHERE id = $2`,
          [service_destinataire, parcours_id]
        )
      }
    } else if (statut === "Terminée") {
      // If reference finished, check if other references are active on this parcours. If not, close the parcours
      if (parcours_id) {
        const { rows: activeRefs } = await client.query(
          "SELECT 1 FROM references_services WHERE parcours_id = $1 AND statut IN ('En attente', 'Acceptée', 'En cours')",
          [parcours_id]
        )
        if (activeRefs.length === 0) {
          await client.query(
            "UPDATE parcours_patient SET date_sortie = NOW(), statut = 'sorti', updated_at = NOW() WHERE id = $1",
            [parcours_id]
          )
        }
      }
    }

    await client.query("COMMIT")
    return res.json({ success: true, message: `Statut mis à jour vers "${statut}".`, reference: updatedRows[0] })

  } catch (err) {
    await client.query("ROLLBACK")
    console.error("mettreAJourStatutReference:", err)
    return res.status(500).json({ success: false, message: "Erreur serveur." })
  } finally {
    client.release()
  }
}

/**
 * GET /api/parcours/patient/:patient_id
 * Traçabilité complète du parcours du patient
 */
const listerParcoursPatient = async (req, res) => {
  const { patient_id } = req.params
  try {
    const { rows: parcours } = await pool.query(
      `SELECT 
        p.id, p.date_entree, p.date_sortie, p.statut, p.service_actuel, p.motif_admission,
        (SELECT json_agg(json_build_object(
          'id', r.id,
          'medecin_demandeur', u.nom,
          'service_origine', r.service_origine,
          'service_destinataire', r.service_destinataire,
          'motif', r.motif_reference,
          'priorite', r.priorite,
          'statut', r.statut,
          'date', r.date_creation
        ) ORDER BY r.date_creation ASC)
         FROM references_services r
         JOIN utilisateurs u ON u.id = r.medecin_demandeur_id
         WHERE r.parcours_id = p.id) AS references
      FROM parcours_patient p
      WHERE p.patient_id = $1
      ORDER BY p.date_entree DESC`,
      [patient_id]
    )
    return res.json({ success: true, parcours })
  } catch (err) {
    console.error("listerParcoursPatient:", err)
    return res.status(500).json({ success: false, message: "Erreur serveur." })
  }
}

module.exports = {
  creerReferences,
  listerReferencesRecues,
  listerReferencesEnvoyees,
  mettreAJourStatutReference,
  listerParcoursPatient
}
