const pool = require("../config/db")

// ═══════════════════════════════════════════════════════════════
//  GET /api/soins — Liste les soins infirmiers
// ═══════════════════════════════════════════════════════════════
const listerSoins = async (req, res) => {
  const { statut, patient_id, date_programmee, infirmier_id, urgent } = req.query
  try {
    let query = `
      SELECT
        s.id, s.patient_id, s.infirmier_id, s.type_soin, s.zone,
        s.medicament, s.dose, s.voie, s.observations, s.tolerance,
        s.statut, s.urgent, s.date_programmee, s.heure_programmee,
        s.heure_execution, s.created_at, s.updated_at,
        p.nom AS patient_nom, p.pid, p.sexe, p.date_naissance,
        u.nom AS infirmier_nom, u.specialite
      FROM soins s
      JOIN patients p ON p.id = s.patient_id
      LEFT JOIN utilisateurs u ON u.id = s.infirmier_id
      WHERE 1=1
    `
    const params = []
    let idx = 1

    if (statut)         { query += ` AND s.statut = $${idx++}`; params.push(statut) }
    if (patient_id)     { query += ` AND s.patient_id = $${idx++}`; params.push(patient_id) }
    if (date_programmee){ query += ` AND s.date_programmee = $${idx++}`; params.push(date_programmee) }
    if (infirmier_id)   { query += ` AND s.infirmier_id = $${idx++}`; params.push(infirmier_id) }
    if (urgent)         { query += ` AND s.urgent = $${idx++}`; params.push(urgent === 'true') }

    query += " ORDER BY s.urgent DESC, s.date_programmee DESC, s.heure_programmee ASC"

    const { rows } = await pool.query(query, params)

    const soins = rows.map(s => ({
      id: s.id,
      patientId: s.patient_id,
      patient: {
        id: s.patient_id,
        nom: s.patient_nom,
        pid: s.pid,
        sexe: s.sexe,
        dateNaissance: s.date_naissance
      },
      infirmierId: s.infirmier_id,
      infirmier: s.infirmier_nom || '—',
      typeSoin: s.type_soin,
      zone: s.zone,
      medicament: s.medicament,
      dose: s.dose,
      voie: s.voie,
      observations: s.observations,
      tolerance: s.tolerance,
      statut: s.statut,
      urgent: s.urgent,
      dateProgrammee: s.date_programmee,
      heureProgrammee: s.heure_programmee ? s.heure_programmee.slice(0, 5) : null,
      heureExecution: s.heure_execution ? s.heure_execution.slice(0, 5) : null,
      createdAt: s.created_at,
      updatedAt: s.updated_at
    }))

    return res.json({ success: true, soins })
  } catch (err) {
    console.error("listerSoins:", err)
    return res.status(500).json({ success: false, message: "Erreur serveur." })
  }
}

// ═══════════════════════════════════════════════════════════════
//  GET /api/soins/:id — Détail d'un soin
// ═══════════════════════════════════════════════════════════════
const getSoinById = async (req, res) => {
  const { id } = req.params
  try {
    const { rows } = await pool.query(
      `SELECT
        s.id, s.patient_id, s.infirmier_id, s.type_soin, s.zone,
        s.medicament, s.dose, s.voie, s.observations, s.tolerance,
        s.statut, s.urgent, s.date_programmee, s.heure_programmee,
        s.heure_execution, s.created_at, s.updated_at,
        p.nom AS patient_nom, p.pid, p.sexe, p.date_naissance, p.telephone, p.quartier,
        u.nom AS infirmier_nom, u.specialite
      FROM soins s
      JOIN patients p ON p.id = s.patient_id
      LEFT JOIN utilisateurs u ON u.id = s.infirmier_id
      WHERE s.id = $1`,
      [id]
    )

    if (rows.length === 0)
      return res.status(404).json({ success: false, message: "Soin introuvable." })

    const s = rows[0]
    const soin = {
      id: s.id,
      patientId: s.patient_id,
      patient: {
        id: s.patient_id,
        nom: s.patient_nom,
        pid: s.pid,
        sexe: s.sexe,
        dateNaissance: s.date_naissance,
        telephone: s.telephone,
        quartier: s.quartier
      },
      infirmierId: s.infirmier_id,
      infirmier: s.infirmier_nom || '—',
      typeSoin: s.type_soin,
      zone: s.zone,
      medicament: s.medicament,
      dose: s.dose,
      voie: s.voie,
      observations: s.observations,
      tolerance: s.tolerance,
      statut: s.statut,
      urgent: s.urgent,
      dateProgrammee: s.date_programmee,
      heureProgrammee: s.heure_programmee ? s.heure_programmee.slice(0, 5) : null,
      heureExecution: s.heure_execution ? s.heure_execution.slice(0, 5) : null,
      createdAt: s.created_at,
      updatedAt: s.updated_at
    }

    return res.json({ success: true, soin })
  } catch (err) {
    console.error("getSoinById:", err)
    return res.status(500).json({ success: false, message: "Erreur serveur." })
  }
}

// ═══════════════════════════════════════════════════════════════
//  POST /api/soins — Créer un soin
// ═══════════════════════════════════════════════════════════════
const creerSoin = async (req, res) => {
  const {
    patient_id, infirmier_id, type_soin, zone,
    medicament, dose, voie, observations,
    date_programmee, heure_programmee, urgent
  } = req.body

  if (!patient_id || !type_soin || !date_programmee)
    return res.status(400).json({ 
      success: false, 
      message: "patient_id, type_soin et date_programmee sont requis." 
    })

  try {
    const { rows } = await pool.query(
      `INSERT INTO soins 
        (patient_id, infirmier_id, type_soin, zone, medicament, dose, voie, 
         observations, date_programmee, heure_programmee, urgent)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
       RETURNING *`,
      [
        patient_id,
        infirmier_id || null,
        type_soin,
        zone || null,
        medicament || null,
        dose || null,
        voie || null,
        observations || null,
        date_programmee,
        heure_programmee || null,
        urgent || false
      ]
    )

    const soin = rows[0]
    return res.status(201).json({ 
      success: true, 
      soin: {
        id: soin.id,
        patientId: soin.patient_id,
        infirmierId: soin.infirmier_id,
        typeSoin: soin.type_soin,
        zone: soin.zone,
        medicament: soin.medicament,
        dose: soin.dose,
        voie: soin.voie,
        observations: soin.observations,
        tolerance: soin.tolerance,
        statut: soin.statut,
        urgent: soin.urgent,
        dateProgrammee: soin.date_programmee,
        heureProgrammee: soin.heure_programmee ? soin.heure_programmee.slice(0, 5) : null,
        createdAt: soin.created_at
      }
    })
  } catch (err) {
    console.error("creerSoin:", err)
    return res.status(500).json({ success: false, message: "Erreur serveur." })
  }
}

// ═══════════════════════════════════════════════════════════════
//  PATCH /api/soins/:id/demarrer — Démarrer un soin
// ═══════════════════════════════════════════════════════════════
const demarrerSoin = async (req, res) => {
  const { id } = req.params
  const { infirmier_id } = req.body

  try {
    const champs = ["statut = 'en_cours'"]
    const params = []
    let idx = 1

    if (infirmier_id) {
      champs.push(`infirmier_id = $${idx++}`)
      params.push(infirmier_id)
    }

    params.push(id)
    const { rows } = await pool.query(
      `UPDATE soins SET ${champs.join(', ')} WHERE id = $${idx} AND statut = 'programme' RETURNING *`,
      params
    )

    if (rows.length === 0)
      return res.status(404).json({ 
        success: false, 
        message: "Soin introuvable ou déjà démarré." 
      })

    return res.json({ success: true, message: "Soin démarré." })
  } catch (err) {
    console.error("demarrerSoin:", err)
    return res.status(500).json({ success: false, message: "Erreur serveur." })
  }
}

// ═══════════════════════════════════════════════════════════════
//  PATCH /api/soins/:id/executer — Valider l'exécution d'un soin
// ═══════════════════════════════════════════════════════════════
const validerExecution = async (req, res) => {
  const { id } = req.params
  const { observations, tolerance, infirmier_id, heure_execution } = req.body

  if (!tolerance)
    return res.status(400).json({ 
      success: false, 
      message: "La tolérance est requise." 
    })

  try {
    const champs = ["statut = 'fait'"]
    const params = []
    let idx = 1

    if (observations !== undefined) {
      champs.push(`observations = $${idx++}`)
      params.push(observations)
    }

    champs.push(`tolerance = $${idx++}`)
    params.push(tolerance)

    if (infirmier_id) {
      champs.push(`infirmier_id = $${idx++}`)
      params.push(infirmier_id)
    }

    if (heure_execution) {
      champs.push(`heure_execution = $${idx++}`)
      params.push(heure_execution)
    } else {
      champs.push(`heure_execution = CURRENT_TIME`)
    }

    params.push(id)
    const { rows } = await pool.query(
      `UPDATE soins SET ${champs.join(', ')} WHERE id = $${idx} RETURNING *`,
      params
    )

    if (rows.length === 0)
      return res.status(404).json({ 
        success: false, 
        message: "Soin introuvable." 
      })

    return res.json({ success: true, message: "Soin exécuté." })
  } catch (err) {
    console.error("validerExecution:", err)
    return res.status(500).json({ success: false, message: "Erreur serveur." })
  }
}

// ═══════════════════════════════════════════════════════════════
//  PATCH /api/soins/:id/retarder — Retarder un soin
// ═══════════════════════════════════════════════════════════════
const retarderSoin = async (req, res) => {
  const { id } = req.params

  try {
    const { rows } = await pool.query(
      `UPDATE soins SET statut = 'retarde' WHERE id = $1 AND statut = 'programme' RETURNING *`,
      [id]
    )

    if (rows.length === 0)
      return res.status(404).json({ 
        success: false, 
        message: "Soin introuvable ou ne peut être retardé." 
      })

    return res.json({ success: true, message: "Soin retardé." })
  } catch (err) {
    console.error("retarderSoin:", err)
    return res.status(500).json({ success: false, message: "Erreur serveur." })
  }
}

// ═══════════════════════════════════════════════════════════════
//  PATCH /api/soins/:id/annuler — Annuler un soin
// ═══════════════════════════════════════════════════════════════
const annulerSoin = async (req, res) => {
  const { id } = req.params

  try {
    const { rows } = await pool.query(
      `UPDATE soins SET statut = 'annule' 
       WHERE id = $1 AND statut IN ('programme', 'retarde', 'en_cours')
       RETURNING *`,
      [id]
    )

    if (rows.length === 0)
      return res.status(404).json({ 
        success: false, 
        message: "Soin introuvable ou ne peut être annulé." 
      })

    return res.json({ success: true, message: "Soin annulé." })
  } catch (err) {
    console.error("annulerSoin:", err)
    return res.status(500).json({ success: false, message: "Erreur serveur." })
  }
}

// ═══════════════════════════════════════════════════════════════
//  DELETE /api/soins/:id — Supprimer un soin
// ═══════════════════════════════════════════════════════════════
const supprimerSoin = async (req, res) => {
  const { id } = req.params

  try {
    const { rows } = await pool.query(
      "DELETE FROM soins WHERE id = $1 RETURNING id",
      [id]
    )

    if (rows.length === 0)
      return res.status(404).json({ 
        success: false, 
        message: "Soin introuvable." 
      })

    return res.json({ success: true, message: "Soin supprimé." })
  } catch (err) {
    console.error("supprimerSoin:", err)
    return res.status(500).json({ success: false, message: "Erreur serveur." })
  }
}

module.exports = {
  listerSoins,
  getSoinById,
  creerSoin,
  demarrerSoin,
  validerExecution,
  retarderSoin,
  annulerSoin,
  supprimerSoin
}