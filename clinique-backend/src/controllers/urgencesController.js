const pool = require("../config/db")

/**
 * POST /api/urgences
 * Enregistrer une prise en charge d'urgence / premiers soins
 */
const creerPriseEnChargeUrgence = async (req, res) => {
  const {
    id, // if provided, we are updating
    patient_id,
    constantes_vitales,
    observations_initiales,
    soins_administres = [],
    medicaments_urgence = [],
    consommables_utilises = [],
    examens_urgents_commandes = [],
    signe = false
  } = req.body

  const personnel_soignant_id = req.user.id

  if (!patient_id) {
    return res.status(400).json({ success: false, message: "patient_id requis." })
  }

  const client = await pool.connect()
  try {
    await client.query("BEGIN")

    // 1. Récupérer la configuration globale des urgences
    const { rows: configRows } = await client.query(
      "SELECT regle_paiement_urgences FROM configuration_clinique WHERE id = 1"
    )
    const regle = configRows[0]?.regle_paiement_urgences || "soigner_d_abord"

    // 2. Calculer le montant total de la facture
    const totalMedicaments = medicaments_urgence.reduce((sum, item) => sum + ((parseInt(item.quantite) || 0) * (parseInt(item.prix) || 0)), 0)
    const totalConsommables = consommables_utilises.reduce((sum, item) => sum + ((parseInt(item.quantite) || 0) * (parseInt(item.prix) || 0)), 0)
    const totalSoins = (soins_administres || []).length * 15000 // 15,000 GNF par acte
    const totalFacture = totalMedicaments + totalConsommables + totalSoins + 10000 // Tarif de base (10,000 GNF)

    let ficheUrgenceId = id
    let fileId
    let paiementId
    let statutPaiement = regle === "soigner_d_abord" ? "non_paye" : "en_attente"

    if (id) {
      // UPDATE existing record
      const { rows: existingRows } = await client.query(
        "SELECT facture_generee_id, statut_paiement FROM prises_en_charge_urgence WHERE id = $1",
        [id]
      )
      if (existingRows.length === 0) {
        await client.query("ROLLBACK")
        return res.status(404).json({ success: false, message: "Fiche d'urgence introuvable." })
      }
      
      paiementId = existingRows[0].facture_generee_id
      statutPaiement = existingRows[0].statut_paiement

      // Find file_id from payment
      const { rows: payRows } = await client.query(
        "SELECT file_id FROM paiements_consultation WHERE id = $1",
        [paiementId]
      )
      fileId = payRows[0]?.file_id

      // Update prises_en_charge_urgence
      await client.query(
        `UPDATE prises_en_charge_urgence
         SET constantes_vitales = $1,
             observations_initiales = $2,
             soins_administres = $3,
             medicaments_urgence = $4,
             consommables_utilises = $5,
             examens_urgents_commandes = $6,
             signe = $7,
             signe_le = CASE WHEN $7::boolean THEN NOW() ELSE signe_le END,
             signe_par = CASE WHEN $7::boolean THEN $8 ELSE signe_par END
         WHERE id = $9`,
        [
          JSON.stringify(constantes_vitales),
          observations_initiales,
          soins_administres,
          medicaments_urgence.map(m => typeof m === "string" ? m : JSON.stringify(m)),
          consommables_utilises.map(c => typeof c === "string" ? c : JSON.stringify(c)),
          examens_urgents_commandes.map(ex => typeof ex === "string" ? ex : ex.nom),
          signe,
          req.user.nom,
          id
        ]
      )

      // Update file_attente
      const statutFile = signe ? "termine" : (regle === "soigner_d_abord" ? "en_cours" : "en_attente")
      await client.query(
        `UPDATE file_attente 
         SET montant_consultation = $1, statut = $2, updated_at = NOW()
         WHERE id = $3`,
        [totalFacture, statutFile, fileId]
      )

      // Update paiements_consultation amount
      await client.query(
        `UPDATE paiements_consultation
         SET montant = $1
         WHERE id = $2`,
        [totalFacture, paiementId]
      )

    } else {
      // INSERT new record
      // 3. Créer un parcours patient pour l'urgence
      const { rows: newParc } = await client.query(
        `INSERT INTO parcours_patient (patient_id, service_actuel, motif_admission, statut)
         VALUES ($1, 'Urgences', $2, 'en_soins_urgence')
         RETURNING id`,
        [patient_id, observations_initiales || "Prise en charge d'urgence"]
      )
      const parcoursId = newParc[0].id

      // 4. Créer l'entrée dans la file d'attente
      const statutFile = signe ? "termine" : (regle === "soigner_d_abord" ? "en_cours" : "en_attente")
      const nowTime = new Date().toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })

      const { rows: fileRows } = await client.query(
        `INSERT INTO file_attente 
           (patient_id, medecin_id, type_visite, statut, motif, service, arrivee, montant_consultation, type_consultation)
         VALUES ($1, $2, 'urgence', $3, $4, 'Urgences', $5, $6, 'standard')
         RETURNING id`,
        [patient_id, personnel_soignant_id, statutFile, observations_initiales || "Urgence", nowTime, totalFacture]
      )
      fileId = fileRows[0].id

      // 5. Créer la facture associée dans paiements_consultation
      const { rows: payRows } = await client.query(
        `INSERT INTO paiements_consultation 
           (file_id, patient_id, statut, montant, methode, note, date_paiement)
         VALUES ($1, $2, $3, $4, 'cash', 'Facture Premiers Soins Urgence', CURRENT_DATE)
         RETURNING id`,
        [fileId, patient_id, statutPaiement, totalFacture]
      )
      paiementId = payRows[0].id

      // 6. Insérer la fiche de prise en charge d'urgence
      const { rows: urgRows } = await client.query(
        `INSERT INTO prises_en_charge_urgence 
           (parcours_id, patient_id, personnel_soignant_id, constantes_vitales, observations_initiales, 
            soins_administres, medicaments_urgence, consommables_utilises, examens_urgents_commandes, 
            facture_generee_id, statut_paiement, signe, signe_le, signe_par)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
         RETURNING id`,
        [
          parcoursId,
          patient_id,
          personnel_soignant_id,
          JSON.stringify(constantes_vitales),
          observations_initiales,
          soins_administres,
          medicaments_urgence.map(m => typeof m === "string" ? m : JSON.stringify(m)),
          consommables_utilises.map(c => typeof c === "string" ? c : JSON.stringify(c)),
          examens_urgents_commandes.map(ex => typeof ex === "string" ? ex : ex.nom),
          paiementId,
          statutPaiement,
          signe,
          signe ? new Date() : null,
          signe ? req.user.nom : null
        ]
      )
      ficheUrgenceId = urgRows[0].id
    }

    // 7. Gérer les examens commandés
    await client.query("DELETE FROM examens_commandes WHERE file_id = $1", [fileId])
    
    if (examens_urgents_commandes && examens_urgents_commandes.length > 0) {
      for (const ex of examens_urgents_commandes) {
        const exNom = typeof ex === "string" ? ex : ex.nom
        const exPrix = typeof ex === "string" ? 0 : (parseInt(ex.prix) || 0)
        await client.query(
          `INSERT INTO examens_commandes (file_id, nom, prix, categorie)
           VALUES ($1, $2, $3, 'Laboratoire - Urgence')`,
          [fileId, exNom, exPrix]
        )
      }
    }

    await client.query("COMMIT")

    return res.status(201).json({
      success: true,
      message: "Prise en charge d'urgence enregistrée avec succès.",
      id: ficheUrgenceId,
      facture: {
        paiementId,
        montant: totalFacture,
        statut: statutPaiement,
        reglePaiement: regle
      }
    })

  } catch (err) {
    await client.query("ROLLBACK")
    console.error("creerPriseEnChargeUrgence:", err)
    return res.status(500).json({ success: false, message: "Erreur lors de l'enregistrement de la prise en charge d'urgence." })
  } finally {
    client.release()
  }
}

/**
 * GET /api/urgences/config
 * Lire la configuration de paiement des urgences
 */
const getUrgenceConfig = async (req, res) => {
  try {
    const { rows } = await pool.query(
      "SELECT regle_paiement_urgences FROM configuration_clinique WHERE id = 1"
    )
    return res.json({ success: true, config: rows[0] || { regle_paiement_urgences: "soigner_d_abord" } })
  } catch (err) {
    console.error("getUrgenceConfig:", err)
    return res.status(500).json({ success: false, message: "Erreur serveur." })
  }
}

/**
 * PUT /api/urgences/config
 * Modifier la configuration de paiement (Medecin Chef ou Admin uniquement)
 */
const modifierUrgenceConfig = async (req, res) => {
  const { regle_paiement_urgences } = req.body

  if (regle_paiement_urgences !== "payer_d_abord" && regle_paiement_urgences !== "soigner_d_abord") {
    return res.status(400).json({ success: false, message: "Régle invalide. Doit être 'payer_d_abord' ou 'soigner_d_abord'." })
  }

  try {
    const { rows } = await pool.query(
      `INSERT INTO configuration_clinique (id, regle_paiement_urgences, updated_at, updated_by)
       VALUES (1, $1, NOW(), $2)
       ON CONFLICT (id)
       DO UPDATE SET regle_paiement_urgences = EXCLUDED.regle_paiement_urgences, updated_at = NOW(), updated_by = EXCLUDED.updated_by
       RETURNING *`,
      [regle_paiement_urgences, req.user.id]
    )
    return res.json({ success: true, message: "Configuration mise à jour avec succès.", config: rows[0] })
  } catch (err) {
    console.error("modifierUrgenceConfig:", err)
    return res.status(500).json({ success: false, message: "Erreur serveur lors de la mise à jour de la configuration." })
  }
}

/**
 * GET /api/urgences/patient/:patient_id
 * Récupérer l'historique des urgences pour un patient
 */
const listerUrgencesPatient = async (req, res) => {
  const { patient_id } = req.params
  try {
    const { rows } = await pool.query(
      `SELECT u.id, u.parcours_id, u.patient_id, u.date_heure_arrivee, u.constantes_vitales,
              u.observations_initiales, u.soins_administres, u.medicaments_urgence, u.consommables_utilises,
              u.examens_urgents_commandes, u.facture_generee_id, u.statut_paiement, u.created_at,
              u.signe, u.signe_le, u.signe_par,
              s.nom AS soignant_nom,
              (SELECT json_agg(json_build_object('nom', ec.nom, 'prix', ec.prix))
               FROM examens_commandes ec
               WHERE ec.file_id = (SELECT file_id FROM paiements_consultation WHERE id = u.facture_generee_id)
              ) AS examens_avec_prix
       FROM prises_en_charge_urgence u
       JOIN utilisateurs s ON u.personnel_soignant_id = s.id
       WHERE u.patient_id = $1
       ORDER BY u.date_heure_arrivee DESC`,
      [patient_id]
    )
    
    // Parser les médicaments/consommables stockés sous forme de chaînes JSON dans le tableau Postgres
    const formatted = rows.map(r => ({
      ...r,
      medicaments_urgence: (r.medicaments_urgence || []).map(m => typeof m === "string" ? JSON.parse(m) : m),
      consommables_utilises: (r.consommables_utilises || []).map(c => typeof c === "string" ? JSON.parse(c) : c),
      examens_avec_prix: r.examens_avec_prix || []
    }))

    return res.json({ success: true, urgences: formatted })
  } catch (err) {
    console.error("listerUrgencesPatient:", err)
    return res.status(500).json({ success: false, message: "Erreur serveur." })
  }
}

module.exports = {
  creerPriseEnChargeUrgence,
  getUrgenceConfig,
  modifierUrgenceConfig,
  listerUrgencesPatient
}
