const pool = require("../config/db")

// ────────────────────────────────────────────────────────
//  GET /api/rdv  — liste les RDV (filtrés par médecin/date)
// ────────────────────────────────────────────────────────
const listerRdv = async (req, res) => {
  const { medecin_id, patient_id, date } = req.query
  try {
    let query = `
      SELECT
        r.id, r.patient_id, r.medecin_id, r.date_rdv, r.heure_rdv,
        r.motif, r.service, r.rappel_envoye, r.statut, r.created_at,
        p.nom AS patient_nom, p.pid,
        u.nom AS medecin_nom, u.specialite
      FROM rendez_vous r
      JOIN patients p ON p.id = r.patient_id
      JOIN utilisateurs u ON u.id = r.medecin_id
      WHERE 1=1
    `
    const params = []
    let idx = 1
    if (medecin_id) { query += ` AND r.medecin_id = $${idx++}`; params.push(medecin_id) }
    if (patient_id) { query += ` AND r.patient_id = $${idx++}`; params.push(patient_id) }
    if (date)       { query += ` AND r.date_rdv = $${idx++}`;   params.push(date) }

    query += " ORDER BY r.date_rdv ASC, r.heure_rdv ASC"

    const { rows } = await pool.query(query, params)

    const formatted = rows.map(r => ({
      id:           r.id,
      patientId:    r.patient_id,
      patient:      r.patient_nom,
      pid:          r.pid,
      docteurId:    r.medecin_id,
      docteur:      r.medecin_nom,
      service:      r.service || r.specialite,
      date:         r.date_rdv,
      heure:        r.heure_rdv ? r.heure_rdv.slice(0, 5) : null,
      motif:        r.motif,
      rappelEnvoye: r.rappel_envoye,
      statut:       r.statut,
    }))

    return res.json({ success: true, rdv: formatted })
  } catch (err) {
    console.error("listerRdv:", err)
    return res.status(500).json({ success: false, message: "Erreur serveur." })
  }
}

// ────────────────────────────────────────────────────────
//  POST /api/rdv  — créer un RDV
// ────────────────────────────────────────────────────────
const creerRdv = async (req, res) => {
  const { patient_id, medecin_id, date_rdv, heure_rdv, motif, service } = req.body

  if (!patient_id || !medecin_id || !date_rdv || !heure_rdv)
    return res.status(400).json({ success: false, message: "patient_id, medecin_id, date_rdv et heure_rdv sont requis." })

  try {
    const { rows } = await pool.query(
      `INSERT INTO rendez_vous (patient_id, medecin_id, date_rdv, heure_rdv, motif, service)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING id`,
      [patient_id, medecin_id, date_rdv, heure_rdv, motif || null, service || null]
    )

    // Récupérer le RDV complet avec infos patient/médecin
    const { rows: full } = await pool.query(
      `SELECT r.id, r.patient_id, r.medecin_id, r.date_rdv, r.heure_rdv,
              r.motif, r.service, r.rappel_envoye, r.statut,
              p.nom AS patient_nom, p.pid,
              u.nom AS medecin_nom, u.specialite
       FROM rendez_vous r
       JOIN patients p ON p.id = r.patient_id
       JOIN utilisateurs u ON u.id = r.medecin_id
       WHERE r.id = $1`,
      [rows[0].id]
    )

    const r = full[0]
    return res.status(201).json({
      success: true,
      rdv: {
        id:           r.id,
        patientId:    r.patient_id,
        patient:      r.patient_nom,
        pid:          r.pid,
        docteurId:    r.medecin_id,
        docteur:      r.medecin_nom,
        service:      r.service || r.specialite,
        date:         r.date_rdv,
        heure:        r.heure_rdv ? r.heure_rdv.slice(0, 5) : null,
        motif:        r.motif,
        rappelEnvoye: r.rappel_envoye,
        statut:       r.statut,
      }
    })
  } catch (err) {
    console.error("creerRdv:", err)
    return res.status(500).json({ success: false, message: "Erreur serveur." })
  }
}

// ────────────────────────────────────────────────────────
//  PATCH /api/rdv/:id  — modifier (rappel, statut)
// ────────────────────────────────────────────────────────
const updateRdv = async (req, res) => {
  const { rappel_envoye, statut } = req.body
  try {
    const champs = []
    const vals   = []
    let idx = 1

    if (rappel_envoye !== undefined) { champs.push(`rappel_envoye=$${idx++}`); vals.push(rappel_envoye) }
    if (statut)                      { champs.push(`statut=$${idx++}`);        vals.push(statut) }

    if (champs.length === 0)
      return res.status(400).json({ success: false, message: "Aucun champ à mettre à jour." })

    vals.push(req.params.id)
    await pool.query(
      `UPDATE rendez_vous SET ${champs.join(",")} WHERE id=$${idx}`,
      vals
    )
    return res.json({ success: true, message: "RDV mis à jour." })
  } catch (err) {
    console.error("updateRdv:", err)
    return res.status(500).json({ success: false, message: "Erreur serveur." })
  }
}

// ────────────────────────────────────────────────────────
//  DELETE /api/rdv/:id  — annuler/supprimer un RDV
// ────────────────────────────────────────────────────────
const supprimerRdv = async (req, res) => {
  try {
    const { rows } = await pool.query(
      "DELETE FROM rendez_vous WHERE id=$1 RETURNING id",
      [req.params.id]
    )
    if (rows.length === 0)
      return res.status(404).json({ success: false, message: "RDV introuvable." })
    return res.json({ success: true, message: "RDV supprimé." })
  } catch (err) {
    console.error("supprimerRdv:", err)
    return res.status(500).json({ success: false, message: "Erreur serveur." })
  }
}

module.exports = { listerRdv, creerRdv, updateRdv, supprimerRdv }