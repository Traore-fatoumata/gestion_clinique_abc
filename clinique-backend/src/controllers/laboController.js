const pool = require("../config/db")
const { notifyUtilisateur } = require("../services/notificationService")

// ═══════════════════════════════════════════════════════════════
//  GET /api/labo — Liste les demandes de laboratoire
// ═══════════════════════════════════════════════════════════════
const listerDemandes = async (req, res) => {
  const { statut, patient_id, date_demande, urgent } = req.query
  try {
    let query = `
      SELECT
        dl.id, dl.patient_id, dl.medecin_prescripteur, dl.service,
        dl.date_demande, dl.heure_demande, dl.date_prelevement, dl.heure_prelevement,
        dl.date_rendu, dl.heure_rendu, dl.statut, dl.urgent,
        dl.commentaire_global, dl.valide, dl.valide_par, dl.valide_le,
        p.nom AS patient_nom, p.pid, p.sexe, p.date_naissance,
        u.nom AS medecin_nom, u.specialite
      FROM demandes_labo dl
      JOIN patients p ON p.id = dl.patient_id
      LEFT JOIN utilisateurs u ON u.id = dl.medecin_id
      WHERE 1=1
    `
    const params = []
    let idx = 1

    if (statut)      { query += ` AND dl.statut = $${idx++}`; params.push(statut) }
    if (patient_id)  { query += ` AND dl.patient_id = $${idx++}`; params.push(patient_id) }
    if (date_demande){ query += ` AND dl.date_demande = $${idx++}`; params.push(date_demande) }
    if (urgent)      { query += ` AND dl.urgent = $${idx++}`; params.push(urgent === 'true') }

    query += " ORDER BY dl.urgent DESC, dl.date_demande DESC, dl.heure_demande DESC"

    const { rows } = await pool.query(query, params)

    // Récupérer les examens pour chaque demande
    const demandes = await Promise.all(rows.map(async (d) => {
      const { rows: examensRows } = await pool.query(
        `SELECT id, nom, prix, resultat, unite, valeur_normale 
         FROM examens_labo WHERE demande_id = $1`,
        [d.id]
      )
      
      return {
        id: d.id,
        patientId: d.patient_id,
        patient: {
          id: d.patient_id,
          nom: d.patient_nom,
          pid: d.pid,
          sexe: d.sexe,
          dateNaissance: d.date_naissance
        },
        medecinPrescripteur: d.medecin_nom || d.medecin_prescripteur || '—',
        service: d.service,
        dateDemande: d.date_demande,
        heureDemande: d.heure_demande ? d.heure_demande.slice(0, 5) : null,
        datePrelevement: d.date_prelevement,
        heurePrelevement: d.heure_prelevement ? d.heure_prelevement.slice(0, 5) : null,
        dateRendu: d.date_rendu,
        heureRendu: d.heure_rendu ? d.heure_rendu.slice(0, 5) : null,
        statut: d.statut,
        urgent: d.urgent,
        commentaireGlobal: d.commentaire_global,
        valide: d.valide,
        validePar: d.valide_par,
        valideLe: d.valide_le,
        examens: examensRows.map(e => ({
          id: e.id,
          nom: e.nom,
          prix: e.prix,
          resultat: e.resultat,
          unite: e.unite,
          valeurNormale: e.valeur_normale
        }))
      }
    }))

    return res.json({ success: true, demandes })
  } catch (err) {
    console.error("listerDemandes:", err)
    return res.status(500).json({ success: false, message: "Erreur serveur." })
  }
}

// ═══════════════════════════════════════════════════════════════
//  GET /api/labo/:id — Détail d'une demande
// ═══════════════════════════════════════════════════════════════
const getDemandeById = async (req, res) => {
  const { id } = req.params
  try {
    const { rows } = await pool.query(
      `SELECT
        dl.id, dl.patient_id, dl.medecin_prescripteur, dl.service,
        dl.date_demande, dl.heure_demande, dl.date_prelevement, dl.heure_prelevement,
        dl.date_rendu, dl.heure_rendu, dl.statut, dl.urgent,
        dl.commentaire_global, dl.valide, dl.valide_par, dl.valide_le,
        p.nom AS patient_nom, p.pid, p.sexe, p.date_naissance, p.telephone, p.quartier,
        u.nom AS medecin_nom, u.specialite
      FROM demandes_labo dl
      JOIN patients p ON p.id = dl.patient_id
      LEFT JOIN utilisateurs u ON u.id = dl.medecin_id
      WHERE dl.id = $1`,
      [id]
    )

    if (rows.length === 0)
      return res.status(404).json({ success: false, message: "Demande introuvable." })

    const d = rows[0]
    const { rows: examensRows } = await pool.query(
      `SELECT id, nom, prix, resultat, unite, valeur_normale 
       FROM examens_labo WHERE demande_id = $1`,
      [id]
    )

    const demande = {
      id: d.id,
      patientId: d.patient_id,
      patient: {
        id: d.patient_id,
        nom: d.patient_nom,
        pid: d.pid,
        sexe: d.sexe,
        dateNaissance: d.date_naissance,
        telephone: d.telephone,
        quartier: d.quartier
      },
      medecinPrescripteur: d.medecin_nom || d.medecin_prescripteur || '—',
      service: d.service,
      dateDemande: d.date_demande,
      heureDemande: d.heure_demande ? d.heure_demande.slice(0, 5) : null,
      datePrelevement: d.date_prelevement,
      heurePrelevement: d.heure_prelevement ? d.heure_prelevement.slice(0, 5) : null,
      dateRendu: d.date_rendu,
      heureRendu: d.heure_rendu ? d.heure_rendu.slice(0, 5) : null,
      statut: d.statut,
      urgent: d.urgent,
      commentaireGlobal: d.commentaire_global,
      valide: d.valide,
      validePar: d.valide_par,
      valideLe: d.valide_le,
      examens: examensRows.map(e => ({
        id: e.id,
        nom: e.nom,
        prix: e.prix,
        resultat: e.resultat,
        unite: e.unite,
        valeurNormale: e.valeur_normale
      }))
    }

    return res.json({ success: true, demande })
  } catch (err) {
    console.error("getDemandeById:", err)
    return res.status(500).json({ success: false, message: "Erreur serveur." })
  }
}

// ═══════════════════════════════════════════════════════════════
//  POST /api/labo — Créer une demande de laboratoire
// ═══════════════════════════════════════════════════════════════
const creerDemande = async (req, res) => {
  const {
    patient_id, medecin_prescripteur, service,
    date_demande, heure_demande, urgent, examens
  } = req.body

  if (!patient_id || !examens || examens.length === 0)
    return res.status(400).json({ 
      success: false, 
      message: "patient_id et au moins un examen sont requis." 
    })

  try {
    // Créer la demande
    const { rows: demandeRows } = await pool.query(
      `INSERT INTO demandes_labo 
        (patient_id, medecin_prescripteur, service, date_demande, heure_demande, urgent)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING id`,
      [
        patient_id, 
        medecin_prescripteur || null, 
        service || null, 
        date_demande || new Date().toISOString().split('T')[0],
        heure_demande || new Date().toTimeString().slice(0, 5),
        urgent || false
      ]
    )

    const demandeId = demandeRows[0].id

    // Créer les examens
    for (const examen of examens) {
      await pool.query(
        `INSERT INTO examens_labo (demande_id, nom, prix, unite, valeur_normale)
         VALUES ($1, $2, $3, $4, $5)`,
        [demandeId, examen.nom, examen.prix || 0, examen.unite || null, examen.valeurNormale || null]
      )
    }

    // Retourner la demande complète
    const result = await getDemandeById({ params: { id: demandeId } }, { 
      status: () => ({ json: (data) => data }) 
    })
    
    return res.status(201).json({ success: true, demande: result.demande })
  } catch (err) {
    console.error("creerDemande:", err)
    return res.status(500).json({ success: false, message: "Erreur serveur." })
  }
}

// ═══════════════════════════════════════════════════════════════
//  PATCH /api/labo/:id/prelever — Démarrer le prélèvement
// ═══════════════════════════════════════════════════════════════
const demarrerPrelevement = async (req, res) => {
  const { id } = req.params
  try {
    const { rows } = await pool.query(
      `UPDATE demandes_labo 
       SET statut = 'en_cours', 
           date_prelevement = CURRENT_DATE,
           heure_prelevement = CURRENT_TIME
       WHERE id = $1 AND statut = 'en_attente'
       RETURNING id`,
      [id]
    )

    if (rows.length === 0)
      return res.status(404).json({ 
        success: false, 
        message: "Demande introuvable ou déjà prélevée." 
      })

    return res.json({ success: true, message: "Prélèvement démarré." })
  } catch (err) {
    console.error("demarrerPrelevement:", err)
    return res.status(500).json({ success: false, message: "Erreur serveur." })
  }
}

// ═══════════════════════════════════════════════════════════════
//  PATCH /api/labo/:id/resultats — Sauvegarder les résultats
// ═══════════════════════════════════════════════════════════════
const sauvegarderResultats = async (req, res) => {
  const { id } = req.params
  const { resultats, commentaire_global } = req.body

  if (!resultats || typeof resultats !== 'object')
    return res.status(400).json({ 
      success: false, 
      message: "Les résultats sont requis." 
    })

  try {
    // Mettre à jour chaque examen avec son résultat
    for (const [examenNom, donnees] of Object.entries(resultats)) {
      await pool.query(
        `UPDATE examens_labo 
         SET resultat = $1, unite = $2, valeur_normale = $3
         WHERE demande_id = $4 AND nom = $5`,
        [
          donnees.resultat || null,
          donnees.unite || null,
          donnees.valeurNormale || null,
          id,
          examenNom
        ]
      )
    }

    // Mettre à jour le commentaire global
    if (commentaire_global !== undefined) {
      await pool.query(
        `UPDATE demandes_labo SET commentaire_global = $1 WHERE id = $2`,
        [commentaire_global, id]
      )
    }

    return res.json({ success: true, message: "Résultats sauvegardés." })
  } catch (err) {
    console.error("sauvegarderResultats:", err)
    return res.status(500).json({ success: false, message: "Erreur serveur." })
  }
}

// ═══════════════════════════════════════════════════════════════
//  PATCH /api/labo/:id/valider — Valider une demande
// ═══════════════════════════════════════════════════════════════
const validerDemande = async (req, res) => {
  const { id } = req.params
  const { valide_par, resultats, commentaire_global } = req.body

  try {
    // Mettre à jour les résultats si fournis
    if (resultats) {
      for (const [examenNom, donnees] of Object.entries(resultats)) {
        await pool.query(
          `UPDATE examens_labo 
           SET resultat = $1, unite = $2, valeur_normale = $3
           WHERE demande_id = $4 AND nom = $5`,
          [
            donnees.resultat || null,
            donnees.unite || null,
            donnees.valeurNormale || null,
            id,
            examenNom
          ]
        )
      }
    }

    // Valider la demande
    const { rows } = await pool.query(
      `UPDATE demandes_labo 
       SET statut = 'termine', 
           date_rendu = CURRENT_DATE,
           heure_rendu = CURRENT_TIME,
           valide = TRUE,
           valide_par = $1,
           valide_le = CURRENT_TIMESTAMP,
           commentaire_global = COALESCE($2, commentaire_global)
       WHERE id = $3
       RETURNING id`,
      [valide_par || null, commentaire_global, id]
    )

    if (rows.length === 0)
      return res.status(404).json({ 
        success: false, 
        message: "Demande introuvable." 
      })

    const { rows: info } = await pool.query(
      `SELECT dl.medecin_id, dl.consultation_id, dl.patient_id, p.nom AS patient_nom
       FROM demandes_labo dl
       JOIN patients p ON p.id = dl.patient_id
       WHERE dl.id=$1`,
      [id]
    )
    if (info[0]?.medecin_id) {
      await notifyUtilisateur(info[0].medecin_id, {
        titre:       `Résultats labo disponibles — ${info[0].patient_nom}`,
        patient_nom: info[0].patient_nom,
        motif:       "Vous pouvez maintenant signer et valider la consultation.",
        type_notif:  "resultats_labo",
        patient_id:  info[0].patient_id,
      })
    }

    return res.json({ success: true, message: "Demande validée." })
  } catch (err) {
    console.error("validerDemande:", err)
    return res.status(500).json({ success: false, message: "Erreur serveur." })
  }
}

// ═══════════════════════════════════════════════════════════════
//  DELETE /api/labo/:id — Supprimer une demande
// ═══════════════════════════════════════════════════════════════
const supprimerDemande = async (req, res) => {
  const { id } = req.params
  try {
    const { rows } = await pool.query(
      "DELETE FROM demandes_labo WHERE id = $1 RETURNING id",
      [id]
    )

    if (rows.length === 0)
      return res.status(404).json({ 
        success: false, 
        message: "Demande introuvable." 
      })

    return res.json({ success: true, message: "Demande supprimée." })
  } catch (err) {
    console.error("supprimerDemande:", err)
    return res.status(500).json({ success: false, message: "Erreur serveur." })
  }
}

// PATCH /api/labo/:id/tarifs — fixer les prix (laboratoire)
const fixerTarifs = async (req, res) => {
  const { examens } = req.body
  if (!examens || !Array.isArray(examens))
    return res.status(400).json({ success: false, message: "Liste examens requise." })

  const client = await pool.connect()
  try {
    await client.query("BEGIN")

    const { rows: demande } = await client.query(
      "SELECT file_id, patient_id FROM demandes_labo WHERE id=$1",
      [req.params.id]
    )
    if (demande.length === 0) {
      await client.query("ROLLBACK")
      return res.status(404).json({ success: false, message: "Demande introuvable." })
    }

    const fileId = demande[0].file_id

    for (const ex of examens) {
      if (ex.id) {
        await client.query(
          "UPDATE examens_labo SET prix=$1 WHERE id=$2 AND demande_id=$3",
          [ex.prix || 0, ex.id, req.params.id]
        )
      }
      if (fileId && ex.nom) {
        await client.query(
          `UPDATE examens_commandes SET prix=$1
           WHERE file_id=$2 AND nom=$3`,
          [ex.prix || 0, fileId, ex.nom]
        )
      }
    }

    if (fileId) {
      const { rows: sum } = await client.query(
        "SELECT COALESCE(SUM(prix),0) AS total FROM examens_commandes WHERE file_id=$1",
        [fileId]
      )
      const total = Number(sum[0].total)
      await client.query(
        `INSERT INTO paiements_examens (file_id, patient_id, montant_total, montant_paye, statut)
         VALUES ($1,$2,$3,0,'en_attente')
         ON CONFLICT (file_id) DO UPDATE SET montant_total=$3, updated_at=NOW()`,
        [fileId, demande[0].patient_id, total]
      )
    }

    await client.query("COMMIT")
    return res.json({ success: true, message: "Tarifs enregistrés. Le patient peut payer à la comptabilité." })
  } catch (err) {
    await client.query("ROLLBACK")
    console.error("fixerTarifs:", err)
    return res.status(500).json({ success: false, message: "Erreur serveur." })
  } finally {
    client.release()
  }
}

module.exports = {
  listerDemandes,
  getDemandeById,
  creerDemande,
  demarrerPrelevement,
  sauvegarderResultats,
  validerDemande,
  supprimerDemande,
  fixerTarifs,
}