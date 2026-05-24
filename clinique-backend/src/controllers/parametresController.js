const pool = require("../config/db")

// ═══════════════════════════════════════════════════════════════
//  GET /api/parametres — Liste tous les paramètres
// ═══════════════════════════════════════════════════════════════
const listerParametres = async (req, res) => {
  try {
    const { rows } = await pool.query(
      "SELECT cle, valeur, updated_at FROM parametres_clinique ORDER BY cle ASC"
    )

    const parametres = {}
    rows.forEach(r => {
      parametres[r.cle] = {
        valeur: r.valeur,
        updatedAt: r.updated_at
      }
    })

    return res.json({ success: true, parametres })
  } catch (err) {
    console.error("listerParametres:", err)
    return res.status(500).json({ success: false, message: "Erreur serveur." })
  }
}

// ═══════════════════════════════════════════════════════════════
//  GET /api/parametres/:cle — Récupérer un paramètre
// ═══════════════════════════════════════════════════════════════
const getParametre = async (req, res) => {
  const { cle } = req.params
  try {
    const { rows } = await pool.query(
      "SELECT cle, valeur, updated_at FROM parametres_clinique WHERE cle = $1",
      [cle]
    )

    if (rows.length === 0)
      return res.status(404).json({ success: false, message: "Paramètre introuvable." })

    return res.json({ 
      success: true, 
      parametre: {
        cle: rows[0].cle,
        valeur: rows[0].valeur,
        updatedAt: rows[0].updated_at
      }
    })
  } catch (err) {
    console.error("getParametre:", err)
    return res.status(500).json({ success: false, message: "Erreur serveur." })
  }
}

// ═══════════════════════════════════════════════════════════════
//  POST /api/parametres — Créer un paramètre
// ═══════════════════════════════════════════════════════════════
const creerParametre = async (req, res) => {
  const { cle, valeur } = req.body

  if (!cle || !valeur)
    return res.status(400).json({ 
      success: false, 
      message: "La clé et la valeur sont requises." 
    })

  try {
    const { rows } = await pool.query(
      `INSERT INTO parametres_clinique (cle, valeur)
       VALUES ($1, $2)
       ON CONFLICT (cle) DO UPDATE SET valeur = EXCLUDED.valeur, updated_at = NOW()
       RETURNING cle, valeur, updated_at`,
      [cle, valeur]
    )

    return res.status(201).json({
      success: true,
      parametre: {
        cle: rows[0].cle,
        valeur: rows[0].valeur,
        updatedAt: rows[0].updated_at
      }
    })
  } catch (err) {
    console.error("creerParametre:", err)
    return res.status(500).json({ success: false, message: "Erreur serveur." })
  }
}

// ═══════════════════════════════════════════════════════════════
//  PATCH /api/parametres/:cle — Mettre à jour un paramètre
// ═══════════════════════════════════════════════════════════════
const updateParametre = async (req, res) => {
  const { cle } = req.params
  const { valeur } = req.body

  if (valeur === undefined)
    return res.status(400).json({ 
      success: false, 
      message: "La valeur est requise." 
    })

  try {
    const { rows } = await pool.query(
      `UPDATE parametres_clinique 
       SET valeur = $1, updated_at = NOW()
       WHERE cle = $2
       RETURNING cle, valeur, updated_at`,
      [valeur, cle]
    )

    if (rows.length === 0)
      return res.status(404).json({ success: false, message: "Paramètre introuvable." })

    return res.json({
      success: true,
      parametre: {
        cle: rows[0].cle,
        valeur: rows[0].valeur,
        updatedAt: rows[0].updated_at
      }
    })
  } catch (err) {
    console.error("updateParametre:", err)
    return res.status(500).json({ success: false, message: "Erreur serveur." })
  }
}

// ═══════════════════════════════════════════════════════════════
//  PATCH /api/parametres/batch — Mettre à jour plusieurs paramètres
// ═══════════════════════════════════════════════════════════════
const updateParametres = async (req, res) => {
  const parametres = req.body

  if (!parametres || typeof parametres !== 'object' || Object.keys(parametres).length === 0)
    return res.status(400).json({ 
      success: false, 
      message: "Aucun paramètre à mettre à jour." 
    })

  try {
    const updated = []
    
    for (const [cle, valeur] of Object.entries(parametres)) {
      const { rows } = await pool.query(
        `UPDATE parametres_clinique 
         SET valeur = $1, updated_at = NOW()
         WHERE cle = $2
         RETURNING cle, valeur, updated_at`,
        [valeur, cle]
      )

      if (rows.length > 0) {
        updated.push({
          cle: rows[0].cle,
          valeur: rows[0].valeur,
          updatedAt: rows[0].updated_at
        })
      }
    }

    return res.json({ success: true, parametres: updated })
  } catch (err) {
    console.error("updateParametres:", err)
    return res.status(500).json({ success: false, message: "Erreur serveur." })
  }
}

module.exports = {
  listerParametres,
  getParametre,
  creerParametre,
  updateParametre,
  updateParametres
}