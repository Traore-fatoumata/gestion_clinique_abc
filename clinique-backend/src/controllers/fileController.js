const pool = require("../config/db")

const getDefaultConsultationTarif = (dateNaissance) => {
  if (!dateNaissance) return 20000
  const birthDate = new Date(dateNaissance)
  const age = new Date().getFullYear() - birthDate.getFullYear()
  return age <= 15 ? 15000 : 20000
}

// ────────────────────────────────────────────────────────
//  GET /api/file  — file du jour (avec infos patient)
// ────────────────────────────────────────────────────────
const getFile = async (req, res) => {
  const { date, medecin_id, statut } = req.query
  const dateFiltre = date || new Date().toISOString().slice(0, 10)

  try {
    let query = `
      SELECT
        f.id, f.patient_id, f.medecin_id, f.type_visite, f.statut,
        f.motif, f.service, f.arrivee, f.date_entree,
        f.montant_consultation, f.type_consultation, f.rdv_id,
        f.created_at,
        p.pid, p.nom, p.date_naissance, p.sexe, p.telephone,
        u.nom AS medecin_nom, u.specialite AS medecin_specialite,
        pc.statut     AS paiement_consultation_statut,
        pc.montant    AS paiement_consultation_montant,
        pc.methode    AS paiement_consultation_methode,
        pc.note       AS paiement_consultation_note,
        pc.date_paiement AS paiement_consultation_date,
        pe.montant_total  AS examens_total,
        pe.montant_paye   AS examens_paye,
        pe.statut         AS examens_statut,
        pe.methode        AS examens_methode,
        pe.note           AS examens_note
      FROM file_attente f
      JOIN patients p ON p.id = f.patient_id
      LEFT JOIN utilisateurs u ON u.id = f.medecin_id
      LEFT JOIN paiements_consultation pc ON pc.file_id = f.id
      LEFT JOIN paiements_examens pe ON pe.file_id = f.id
      WHERE f.date_entree = $1
    `
    const params = [dateFiltre]
    let idx = 2

    if (medecin_id) { query += ` AND f.medecin_id = $${idx++}`; params.push(medecin_id) }
    if (statut)     { query += ` AND f.statut = $${idx++}`;     params.push(statut) }

    query += " ORDER BY f.arrivee ASC"

    const { rows } = await pool.query(query, params)

    // Enrichir avec les examens commandés
    const fileIds = rows.map(r => r.id)
    let examensMap = {}
    if (fileIds.length > 0) {
      const { rows: examens } = await pool.query(
        `SELECT file_id, nom, prix FROM examens_commandes WHERE file_id = ANY($1)`,
        [fileIds]
      )
      examens.forEach(e => {
        if (!examensMap[e.file_id]) examensMap[e.file_id] = []
        examensMap[e.file_id].push({ nom: e.nom, prix: e.prix })
      })
    }

    // Formatter pour correspondre au format frontend
    const formatted = rows.map(r => ({
      id:          r.id,
      patientId:   r.patient_id,
      pid:         r.pid,
      nom:         r.nom,
      dateNaissance: r.date_naissance,
      sexe:        r.sexe,
      telephone:   r.telephone,
      docteurId:   r.medecin_id,
      docteur:     r.medecin_nom,
      service:     r.service || r.medecin_specialite,
      typeVisite:  r.type_visite,
      statut:      r.statut,
      motif:       r.motif,
      arrivee:     r.arrivee ? r.arrivee.slice(0, 5) : null,
      dateEntree:  r.date_entree,
      montantConsultation: r.montant_consultation,
      typeConsultation:    r.type_consultation,
      rdvId:       r.rdv_id,
      paiementConsultation: r.paiement_consultation_statut ? {
        statut:  r.paiement_consultation_statut,
        montant: r.paiement_consultation_montant,
        methode: r.paiement_consultation_methode,
        note:    r.paiement_consultation_note,
        date:    r.paiement_consultation_date,
      } : null,
      fraisExamens:    (examensMap[r.id] || []).reduce((s, e) => s + (Number(e.prix) || 0), 0) || Number(r.examens_total) || 0,
      examensCommandes: examensMap[r.id] || [],
      paiementExamens: r.examens_statut ? {
        montantPaye: r.examens_paye,
        statut:      r.examens_statut,
        methode:     r.examens_methode,
        note:        r.examens_note,
      } : null,
    }))

    return res.json({ success: true, file: formatted })
  } catch (err) {
    console.error("getFile:", err)
    return res.status(500).json({ success: false, message: "Erreur serveur." })
  }
}

// ────────────────────────────────────────────────────────
//  POST /api/file  — ajouter un patient à la file
// ────────────────────────────────────────────────────────
const ajouterFile = async (req, res) => {
  const {
    patient_id, medecin_id, type_visite = "consultation",
    motif, service, montant_consultation, type_consultation = "standard", rdv_id,
  } = req.body

  if (!patient_id)
    return res.status(400).json({ success: false, message: "patient_id requis." })

  try {
    // Vérifier que le patient n'est pas déjà dans la file aujourd'hui
    const deja = await pool.query(
      `SELECT id FROM file_attente
       WHERE patient_id = $1 AND date_entree = CURRENT_DATE AND statut != 'termine'`,
      [patient_id]
    )
    if (deja.rows.length > 0) {
      return res.status(409).json({
        success: false,
        message: "Ce patient est déjà dans la file d'attente aujourd'hui.",
      })
    }

    const now = new Date().toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })
    
    // ── Consultation GRATUITE le vendredi uniquement pour la PREMIÈRE consultation du patient ──
    const today = new Date()
    const isFriday = today.getDay() === 5  // 5 = vendredi

    const { rows: patientRows } = await pool.query(
      "SELECT date_naissance FROM patients WHERE id=$1",
      [patient_id]
    )
    const dateNaissance = patientRows[0]?.date_naissance || null
    const rawMontant = Number(montant_consultation)
    let finalMontant = rawMontant > 0
      ? rawMontant
      : type_visite === "consultation"
        ? getDefaultConsultationTarif(dateNaissance)
        : 0

    if (isFriday) {
      const { rows: consults } = await pool.query(
        `SELECT 1 FROM consultations WHERE patient_id = $1 LIMIT 1`,
        [patient_id]
      )
      const hasPriorConsult = consults.length > 0
      if (!hasPriorConsult) {
        finalMontant = 0
      }
    }

    const { rows } = await pool.query(
      `INSERT INTO file_attente
         (patient_id, medecin_id, type_visite, statut, motif, service,
          arrivee, montant_consultation, type_consultation, rdv_id)
       VALUES ($1,$2,$3,'en_attente',$4,$5,$6,$7,$8,$9)
       RETURNING *`,
      [patient_id, medecin_id || null, type_visite, motif || null,
       service || null, now, finalMontant, type_consultation, rdv_id || null]
    )

    return res.status(201).json({ 
      success: true, 
      entree: rows[0],
      gratuite: isFriday,  // Indiquer si consultation gratuite
      message: isFriday ? "Consultation gratuite (vendredi)" : null
    })
  } catch (err) {
    console.error("ajouterFile:", err)
    return res.status(500).json({ success: false, message: "Erreur serveur." })
  }
}

// ────────────────────────────────────────────────────────
//  PATCH /api/file/:id  — mettre à jour une entrée
//  (statut, médecin assigné, frais examens…)
// ────────────────────────────────────────────────────────
const updateFile = async (req, res) => {
  const {
    statut, medecin_id, frais_examens, service, motif,
    examens_commandes,           // [{nom, prix}]
    paiement_consultation,       // {statut, montant, methode, note}
    paiement_examens,            // {montant_paye, statut, methode, note}
    montant_consultation,
  } = req.body

  const client = await pool.connect()
  try {
    await client.query("BEGIN")

    // Mise à jour de la file
    const champs = []
    const vals   = []
    let idx = 1

    if (statut)     { champs.push(`statut=$${idx++}`);     vals.push(statut) }
    if (medecin_id !== undefined && medecin_id !== null) {
      champs.push(`medecin_id=$${idx++}`)
      vals.push(medecin_id)
    }
    if (service)    { champs.push(`service=$${idx++}`);    vals.push(service) }
    if (motif !== undefined) { champs.push(`motif=$${idx++}`); vals.push(motif || null) }
    if (frais_examens !== undefined) { champs.push(`updated_at=NOW()`); }
    if (montant_consultation !== undefined) { champs.push(`montant_consultation=$${idx++}`); vals.push(montant_consultation) }

    if (champs.length > 0) {
      vals.push(req.params.id)
      await client.query(
        `UPDATE file_attente SET ${champs.join(",")}, updated_at=NOW() WHERE id=$${idx}`,
        vals
      )
    }

    // Examens commandés → remplacer
    if (examens_commandes !== undefined) {
      await client.query("DELETE FROM examens_commandes WHERE file_id=$1", [req.params.id])
      for (const e of examens_commandes) {
        await client.query(
          "INSERT INTO examens_commandes (file_id, nom, prix) VALUES ($1,$2,$3)",
          [req.params.id, e.nom, e.prix || 0]
        )
      }
    }

    // Paiement consultation → upsert
    if (paiement_consultation) {
      const pc = paiement_consultation
      // Récupérer patient_id
      const { rows: fileRows } = await client.query(
        "SELECT patient_id, type_visite, montant_consultation FROM file_attente WHERE id=$1",
        [req.params.id]
      )
      if (fileRows.length > 0) {
        await client.query(
          `INSERT INTO paiements_consultation (file_id, patient_id, statut, montant, methode, note, date_paiement)
           VALUES ($1,$2,$3,$4,$5,$6,CURRENT_DATE)
           ON CONFLICT (file_id) DO UPDATE SET
             statut=$3, montant=$4, methode=$5, note=$6, date_paiement=CURRENT_DATE`,
          [req.params.id, fileRows[0].patient_id,
           pc.statut, pc.montant || fileRows[0].montant_consultation,
           pc.methode || "cash", pc.note || null]
        )

        // If the payment is completed and it's an emergency visit
        if (pc.statut === "paye" && fileRows[0].type_visite === "urgence") {
          // Update waitlist status to 'en_cours' so care can proceed
          await client.query(
            "UPDATE file_attente SET statut = 'en_cours', updated_at = NOW() WHERE id = $1 AND statut = 'en_attente'",
            [req.params.id]
          )
          // Update the payment status in prises_en_charge_urgence to 'paye'
          await client.query(
            "UPDATE prises_en_charge_urgence SET statut_paiement = 'paye' WHERE facture_generee_id = (SELECT id FROM paiements_consultation WHERE file_id = $1)",
            [req.params.id]
          )
        }
      }
    }

    // Paiement examens → upsert
    if (paiement_examens) {
      const pe = paiement_examens
      const { rows: fileRows } = await client.query(
        "SELECT patient_id FROM file_attente WHERE id=$1", [req.params.id]
      )
      // Calculer le total des examens
      const { rows: exRows } = await client.query(
        "SELECT COALESCE(SUM(prix),0) AS total FROM examens_commandes WHERE file_id=$1",
        [req.params.id]
      )
      if (fileRows.length > 0) {
        await client.query(
          `INSERT INTO paiements_examens
             (file_id, patient_id, montant_total, montant_paye, statut, methode, note, date_paiement)
           VALUES ($1,$2,$3,$4,$5,$6,$7,CURRENT_DATE)
           ON CONFLICT (file_id) DO UPDATE SET
             montant_paye=$4, statut=$5, methode=$6, note=$7,
             date_paiement=CURRENT_DATE, updated_at=NOW()`,
          [req.params.id, fileRows[0].patient_id,
           exRows[0].total, pe.montant_paye,
           pe.statut, pe.methode || "cash", pe.note || null]
        )
      }
    }

    await client.query("COMMIT")
    return res.json({ success: true, message: "Entrée mise à jour." })
  } catch (err) {
    await client.query("ROLLBACK")
    console.error("updateFile:", err)
    return res.status(500).json({ success: false, message: "Erreur serveur." })
  } finally {
    client.release()
  }
}

module.exports = { getFile, ajouterFile, updateFile }