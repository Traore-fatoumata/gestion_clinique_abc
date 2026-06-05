const pool = require("../config/db")
const { notifyUtilisateur } = require("../services/notificationService")

// GET /api/notifications — notifs du médecin connecté
const getNotifications = async (req, res) => {
  try {
    const { rows } = await pool.query(
      `SELECT id, docteur_id, titre, patient_nom, motif, service, lu, created_at, type_notif, patient_id
       FROM notifications WHERE docteur_id=$1 ORDER BY created_at DESC LIMIT 50`,
      [req.user.id]
    )
    const notifications = rows.map(r => ({
      id:         r.id,
      docteurId:  r.docteur_id,
      titre:      r.titre,
      patientNom: r.patient_nom,
      motif:      r.motif,
      service:    r.service,
      lu:         r.lu,
      typeNotif:  r.type_notif,
      patientId:  r.patient_id,
      createdAt:  r.created_at,
    }))
    return res.json({ success: true, notifications })
  } catch (err) {
    console.error("getNotifications:", err)
    return res.status(500).json({ success: false, message: "Erreur serveur." })
  }
}

// POST /api/notifications — créer une notif (secrétaire/chef)
const creerNotification = async (req, res) => {
  const { docteur_id, titre, patient_nom, motif, service, type_notif, patient_id } = req.body
  try {
    await notifyUtilisateur(docteur_id, {
      titre:       titre || "Nouveau patient assigné",
      patient_nom,
      motif,
      service,
      type_notif:  type_notif || "assignation",
      patient_id,
    })
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