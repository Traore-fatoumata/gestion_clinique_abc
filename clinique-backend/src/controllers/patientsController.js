const pool = require("../config/db")
const { v4: uuidv4 } = require('uuid')

// ── Générer un PID unique ────────────────────────────────
const genPid = async () => {
  const num = Math.floor(100000 + Math.random() * 900000)
  const pid = `P-${num}`
  const { rows } = await pool.query("SELECT id FROM patients WHERE pid = $1", [pid])
  if (rows.length > 0) return genPid() // collision rare → retry
  return pid
}

// ────────────────────────────────────────────────────────
//  GET /api/patients  — liste tous les patients (avec UUID)
// ────────────────────────────────────────────────────────
const listerPatients = async (req, res) => {
  const { q } = req.query
  try {
    let query = `
      SELECT id, uuid, pid, nom, date_naissance, sexe, telephone,
             quartier, secteur, profession, responsable, created_at
      FROM patients
    `
    const params = []
    if (q) {
      query += ` WHERE nom ILIKE $1 OR pid ILIKE $1 OR telephone ILIKE $1
                 OR quartier ILIKE $1 OR profession ILIKE $1`
      params.push(`%${q}%`)
    }
    query += " ORDER BY created_at DESC"

    const { rows } = await pool.query(query, params)
    return res.json({ success: true, patients: rows })
  } catch (err) {
    console.error("listerPatients:", err)
    return res.status(500).json({ success: false, message: "Erreur serveur." })
  }
}

// ────────────────────────────────────────────────────────
//  GET /api/patients/:id  — par ID ou UUID
// ────────────────────────────────────────────────────────
const getPatient = async (req, res) => {
  try {
    const { id } = req.params
    // Vérifier si c'est un UUID
    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id)
    
    const query = isUuid
      ? `SELECT id, uuid, pid, nom, date_naissance, sexe, telephone,
                quartier, secteur, profession, responsable, created_at
         FROM patients WHERE uuid = $1`
      : `SELECT id, uuid, pid, nom, date_naissance, sexe, telephone,
                quartier, secteur, profession, responsable, created_at
         FROM patients WHERE id = $1`

    const { rows } = await pool.query(query, [id])
    if (rows.length === 0)
      return res.status(404).json({ success: false, message: "Patient introuvable." })
    return res.json({ success: true, patient: rows[0] })
  } catch (err) {
    console.error("getPatient:", err)
    return res.status(500).json({ success: false, message: "Erreur serveur." })
  }
}

// ────────────────────────────────────────────────────────
//  POST /api/patients  — créer un patient (avec UUID auto)
// ────────────────────────────────────────────────────────
const creerPatient = async (req, res) => {
  const { nom, date_naissance, sexe, telephone, quartier, secteur, profession, responsable } = req.body

  if (!nom?.trim())
    return res.status(400).json({ success: false, message: "Le nom est obligatoire." })

  try {
    // Vérifier doublon par nom exact (insensible à la casse)
    const doublon = await pool.query(
      "SELECT id, pid FROM patients WHERE LOWER(nom) = LOWER($1)",
      [nom.trim()]
    )
    if (doublon.rows.length > 0) {
      return res.status(409).json({
        success: false,
        message: `Patient déjà enregistré sous le dossier ${doublon.rows[0].pid}.`,
        patient: doublon.rows[0],
      })
    }

    const pid = await genPid()
    const { rows } = await pool.query(
      `INSERT INTO patients (pid, nom, date_naissance, sexe, telephone, quartier, secteur, profession, responsable)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)
       RETURNING id, uuid, pid, nom, date_naissance, sexe, telephone, quartier, secteur, profession, responsable, created_at`,
      [pid, nom.trim(), date_naissance || null, sexe || null, telephone || null,
       quartier || null, secteur || null, profession || null, responsable || null]
    )
    return res.status(201).json({ success: true, patient: rows[0] })
  } catch (err) {
    console.error("creerPatient:", err)
    // Ne pas exposer le message d'erreur interne en production
    return res.status(500).json({ success: false, message: "Erreur serveur." })
  }
}

// ────────────────────────────────────────────────────────
//  PUT /api/patients/:id  — modifier un patient (par ID ou UUID)
// ────────────────────────────────────────────────────────
const modifierPatient = async (req, res) => {
  const { nom, date_naissance, sexe, telephone, quartier, secteur, profession, responsable } = req.body
  const { id } = req.params
  
  try {
    // Vérifier si c'est un UUID
    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id)
    
    // Vérifier que le patient existe
    const checkQuery = isUuid
      ? "SELECT id FROM patients WHERE uuid = $1"
      : "SELECT id FROM patients WHERE id = $1"
    
    const checkResult = await pool.query(checkQuery, [id])
    if (checkResult.rows.length === 0)
      return res.status(404).json({ success: false, message: "Patient introuvable." })

    const updateQuery = isUuid
      ? `UPDATE patients SET
           nom=$1, date_naissance=$2, sexe=$3, telephone=$4,
           quartier=$5, secteur=$6, profession=$7, responsable=$8,
           updated_at=NOW()
         WHERE uuid=$9
         RETURNING id, uuid, pid, nom, date_naissance, sexe, telephone, quartier, secteur, profession, responsable, created_at, updated_at`
      : `UPDATE patients SET
           nom=$1, date_naissance=$2, sexe=$3, telephone=$4,
           quartier=$5, secteur=$6, profession=$7, responsable=$8,
           updated_at=NOW()
         WHERE id=$9
         RETURNING id, uuid, pid, nom, date_naissance, sexe, telephone, quartier, secteur, profession, responsable, created_at, updated_at`

    const { rows } = await pool.query(updateQuery, [
      nom, date_naissance || null, sexe || null, telephone || null,
      quartier || null, secteur || null, profession || null, responsable || null,
      id
    ])
    
    if (rows.length === 0)
      return res.status(404).json({ success: false, message: "Patient introuvable." })
    
    return res.json({ success: true, patient: rows[0] })
  } catch (err) {
    console.error("modifierPatient:", err)
    return res.status(500).json({ success: false, message: "Erreur serveur." })
  }
}

// ────────────────────────────────────────────────────────
//  DELETE /api/patients/:id  — supprimer un patient
// ────────────────────────────────────────────────────────
const supprimerPatient = async (req, res) => {
  const { id } = req.params
  
  try {
    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id)
    
    const deleteQuery = isUuid
      ? "DELETE FROM patients WHERE uuid = $1 RETURNING id, uuid, pid, nom"
      : "DELETE FROM patients WHERE id = $1 RETURNING id, uuid, pid, nom"

    const { rows } = await pool.query(deleteQuery, [id])
    
    if (rows.length === 0)
      return res.status(404).json({ success: false, message: "Patient introuvable." })
    
    return res.json({ 
      success: true, 
      message: `Patient ${rows[0].nom} (${rows[0].pid}) supprimé avec succès.` 
    })
  } catch (err) {
    console.error("supprimerPatient:", err)
    return res.status(500).json({ success: false, message: "Erreur serveur." })
  }
}

module.exports = { listerPatients, getPatient, creerPatient, modifierPatient, supprimerPatient }
