const pool = require("../config/db")

// ────────────────────────────────────────────────────────
//  GET /api/consultations
// ────────────────────────────────────────────────────────
const listerConsultations = async (req, res) => {
  const { medecin_id, patient_id, date } = req.query
  try {
    let query = `
      SELECT
        c.id, c.patient_id, c.medecin_id, c.date_consult, c.service,
        c.motif, c.plaintes, c.diagnostics, c.traitements,
        c.frais_examens, c.type_consultation,
        c.signe, c.signe_le, c.signe_par, c.created_at,
        p.nom AS patient_nom, p.pid,
        u.nom AS medecin_nom, u.specialite,
        -- Récupérer le statut de paiement depuis file_attente/paiements_consultation
        pc.statut AS statut_paiement,
        pc.montant AS montant_paiement,
        fa.montant_consultation
      FROM consultations c
      JOIN patients p ON p.id = c.patient_id
      JOIN utilisateurs u ON u.id = c.medecin_id
      LEFT JOIN file_attente fa ON fa.patient_id = c.patient_id 
        AND fa.date_entree = c.date_consult
      LEFT JOIN paiements_consultation pc ON pc.file_id = fa.id
      WHERE 1=1
    `
    const params = []
    let idx = 1
    if (medecin_id) { query += ` AND c.medecin_id=$${idx++}`; params.push(medecin_id) }
    if (patient_id) { query += ` AND c.patient_id=$${idx++}`; params.push(patient_id) }
    if (date)       { query += ` AND c.date_consult=$${idx++}`; params.push(date) }

    query += " ORDER BY c.date_consult DESC, c.created_at DESC"

    const { rows } = await pool.query(query, params)

    // Formater pour le frontend
    const formatted = rows.map(r => ({
      id:              r.id,
      patientId:       r.patient_id,
      docteurId:       r.medecin_id,
      date:            r.date_consult,
      service:         r.service,
      motif:           r.motif,
      plaintes:        r.plaintes,
      diagnostics:     r.diagnostics || [],
      traitements:     r.traitements || [],
      fraisExamens:    r.frais_examens,
      typeConsultation: r.type_consultation,
      signe:           r.signe,
      signeLe:         r.signe_le,
      signePar:        r.signe_par,
      nom:             r.patient_nom,
      pid:             r.pid,
      medecinNom:      r.medecin_nom,
      // Ajouter les champs pour statistiques
      statut:          r.statut_paiement || (r.signe ? "paye" : "en_attente"),
      montant:         r.montant_paiement || r.montant_consultation || 0,
    }))

    return res.json({ success: true, consultations: formatted })
  } catch (err) {
    console.error("listerConsultations:", err)
    return res.status(500).json({ success: false, message: "Erreur serveur." })
  }
}

// ────────────────────────────────────────────────────────
//  POST /api/consultations  — créer ou mettre à jour
// ────────────────────────────────────────────────────────
const sauvegarderConsultation = async (req, res) => {
  const {
    patient_id, medecin_id, date, service,
    motif, plaintes, diagnostics, traitements,
    frais_examens = 0, type_consultation = "standard",
    examens_commandes,
  } = req.body

  if (!patient_id || !medecin_id)
    return res.status(400).json({ success: false, message: "patient_id et medecin_id requis." })

  const client = await pool.connect()
  try {
    await client.query("BEGIN")

    const dateConsult = date || new Date().toISOString().slice(0, 10)

    // Upsert consultation (une seule par patient/médecin/jour)
    const { rows } = await client.query(
      `INSERT INTO consultations
         (patient_id, medecin_id, date_consult, service, motif, plaintes,
          diagnostics, traitements, frais_examens, type_consultation)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)
       ON CONFLICT (patient_id, medecin_id, date_consult)
       DO UPDATE SET
         motif=$5, plaintes=$6, diagnostics=$7, traitements=$8,
         frais_examens=$9, type_consultation=$10, updated_at=NOW()
       RETURNING id`,
      [patient_id, medecin_id, dateConsult, service || null,
       motif || null, plaintes || null,
       diagnostics || [], traitements || [],
       frais_examens, type_consultation]
    )

    const consultId = rows[0].id

    // Mettre à jour les examens commandés dans la file
    if (examens_commandes && frais_examens > 0) {
      const fileRes = await client.query(
        `SELECT id FROM file_attente
         WHERE patient_id=$1 AND date_entree=$2 AND statut != 'termine'
         ORDER BY created_at DESC LIMIT 1`,
        [patient_id, dateConsult]
      )
      if (fileRes.rows.length > 0) {
        const fileId = fileRes.rows[0].id
        await client.query("DELETE FROM examens_commandes WHERE file_id=$1", [fileId])
        for (const e of examens_commandes) {
          await client.query(
            `INSERT INTO examens_commandes (file_id, consultation_id, nom, prix)
             VALUES ($1,$2,$3,$4)`,
            [fileId, consultId, e.nom, e.prix || 0]
          )
        }
      }
    }

    await client.query("COMMIT")
    return res.status(201).json({ success: true, consultationId: consultId })
  } catch (err) {
    await client.query("ROLLBACK")
    console.error("sauvegarderConsultation:", err)
    return res.status(500).json({ success: false, message: "Erreur serveur." })
  } finally {
    client.release()
  }
}

// ────────────────────────────────────────────────────────
//  PATCH /api/consultations/:id/signer
// ────────────────────────────────────────────────────────
const signerConsultation = async (req, res) => {
  const { signe_par } = req.body
  const client = await pool.connect()
  try {
    await client.query("BEGIN")

    const { rows } = await client.query(
      `UPDATE consultations
       SET signe=TRUE, signe_le=NOW(), signe_par=$1, updated_at=NOW()
       WHERE id=$2
       RETURNING patient_id, medecin_id, date_consult`,
      [signe_par || req.user.nom, req.params.id]
    )

    if (rows.length === 0) {
      await client.query("ROLLBACK")
      return res.status(404).json({ success: false, message: "Consultation introuvable." })
    }

    // Marquer le patient comme terminé dans la file
    await client.query(
      `UPDATE file_attente SET statut='termine', updated_at=NOW()
       WHERE patient_id=$1 AND date_entree=$2 AND statut != 'termine'`,
      [rows[0].patient_id, rows[0].date_consult]
    )

    await client.query("COMMIT")
    return res.json({ success: true, message: "Consultation signée." })
  } catch (err) {
    await client.query("ROLLBACK")
    console.error("signerConsultation:", err)
    return res.status(500).json({ success: false, message: "Erreur serveur." })
  } finally {
    client.release()
  }
}

module.exports = { listerConsultations, sauvegarderConsultation, signerConsultation }