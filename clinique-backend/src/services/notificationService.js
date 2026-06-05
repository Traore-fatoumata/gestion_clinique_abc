const pool = require("../config/db")
const { sendEmail } = require("./emailService")

const notifyUtilisateur = async (utilisateurId, { titre, patient_nom, motif, service, type_notif, patient_id }) => {
  await pool.query(
    `INSERT INTO notifications (docteur_id, titre, patient_nom, motif, service, type_notif, patient_id)
     VALUES ($1,$2,$3,$4,$5,$6,$7)`,
    [utilisateurId, titre, patient_nom || null, motif || null, service || null, type_notif || "info", patient_id || null]
  )

  const { rows } = await pool.query(
    "SELECT email, nom FROM utilisateurs WHERE id=$1 AND actif=TRUE",
    [utilisateurId]
  )
  if (rows[0]?.email) {
    await sendEmail({
      to:      rows[0].email,
      subject: `[Clinique] ${titre}`,
      text:    `${titre}\n\nPatient : ${patient_nom || "—"}\n${motif ? `Motif : ${motif}\n` : ""}${service ? `Service : ${service}` : ""}`,
    })
  }
}

const notifyRole = async (role, payload) => {
  const { rows } = await pool.query(
    "SELECT id FROM utilisateurs WHERE role=$1 AND actif=TRUE",
    [role]
  )
  for (const u of rows) {
    await notifyUtilisateur(u.id, payload)
  }
}

const notifyMedecinEtLabo = async ({ medecin_id, patient_nom, motif, service, patient_id, examens }) => {
  if (medecin_id) {
    await notifyUtilisateur(medecin_id, {
      titre:       "Examens prescrits — en attente de résultats",
      patient_nom,
      motif:       motif || (examens?.length ? `${examens.length} examen(s)` : null),
      service,
      type_notif:  "examens_labo",
      patient_id,
    })
  }
  await notifyRole("labo", {
    titre:       `Nouveaux examens — ${patient_nom}`,
    patient_nom,
    motif:       examens?.map(e => e.nom).join(", ") || motif,
    service,
    type_notif:  "examens_labo",
    patient_id,
  })
}

module.exports = { notifyUtilisateur, notifyRole, notifyMedecinEtLabo }
