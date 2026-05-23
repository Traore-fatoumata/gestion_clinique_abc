const pool = require("../config/db")

// GET /api/notifications — notifs du médecin connecté
const getNotifications = async (req, res) => {
  try {
    const { rows } = await pool.query(
      `SELECT id, docteur_id, titre, patient_nom, motif, service, lu, created_at
       FROM notifications WHERE docteur_id=$1 ORDER BY created_at DESC LIMIT 50`,
      [req.user.id]
    )
    return res.json({ success: true, notifications: rows })
  } catch (err) {
    console.error("getNotifications:", err)
    return res.status(500).json({ success: false, message: "Erreur serveur." })
  }
}

// POST /api/notifications — créer une notif (secrétaire/chef)
const creerNotification = async (req, res) => {
  const { docteur_id, titre, patient_nom, motif, service } = req.body
  try {
    await pool.query(
      `INSERT INTO notifications (docteur_id, titre, patient_nom, motif, service)
       VALUES ($1,$2,$3,$4,$5)`,
      [docteur_id, titre || "Nouveau patient assigné", patient_nom, motif || null, service || null]
    )
    return res.status(201).json({ success: true })
  } catch (err) {
    console.error("creerNotification:", err)
    return res.status(500).json({ success: false, message: "Erreur serveur." })
  }
}

// PATCH /api/notifications/:id/lue
const marquerLue = async (req, res) => {
  try {
    await pool.query(
      "UPDATE notifications SET lu=TRUE WHERE id=$1 AND docteur_id=$2",
      [req.params.id, req.user.id]
    )
    return res.json({ success: true })
  } catch (err) {
    return res.status(500).json({ success: false, message: "Erreur serveur." })
  }
}

// PATCH /api/notifications/toutes-lues
const marquerToutesLues = async (req, res) => {
  try {
    await pool.query(
      "UPDATE notifications SET lu=TRUE WHERE docteur_id=$1",
      [req.user.id]
    )
    return res.json({ success: true })
  } catch (err) {
    return res.status(500).json({ success: false, message: "Erreur serveur." })
  }
}

module.exports = { getNotifications, creerNotification, marquerLue, marquerToutesLues }