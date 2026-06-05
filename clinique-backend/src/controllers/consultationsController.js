const pool = require("../config/db")
const { notifyUtilisateur, notifyRole, notifyMedecinEtLabo } = require("../services/notificationService")

const listerConsultations = async (req, res) => {
  const { medecin_id, patient_id, date } = req.query
  try {
    let query = `
      SELECT
        c.id, c.patient_id, c.medecin_id, c.date_consult, c.service,
        c.motif, c.plaintes, c.diagnostics, c.traitements,
        c.frais_examens, c.type_consultation,
        c.signe, c.signe_le, c.signe_par,
        c.attente_resultats_labo, c.labo_demande_id, c.donnees_brouillon,
        p.nom AS patient_nom, p.pid,
        u.nom AS medecin_nom, u.specialite,
        pc.statut AS statut_paiement,
        pc.montant AS montant_paiement,
        fa.montant_consultation,
        dl.valide AS labo_valide
      FROM consultations c
      JOIN patients p ON p.id = c.patient_id
      JOIN utilisateurs u ON u.id = c.medecin_id
      LEFT JOIN file_attente fa ON fa.patient_id = c.patient_id
        AND fa.date_entree = c.date_consult
      LEFT JOIN paiements_consultation pc ON pc.file_id = fa.id
      LEFT JOIN demandes_labo dl ON dl.id = c.labo_demande_id
      WHERE 1=1
    `
    const params = []
    let idx = 1
    if (medecin_id) { query += ` AND c.medecin_id=$${idx++}`; params.push(medecin_id) }
    if (patient_id) { query += ` AND c.patient_id=$${idx++}`; params.push(patient_id) }
    if (date)       { query += ` AND c.date_consult=$${idx++}`; params.push(date) }

    query += " ORDER BY c.date_consult DESC, c.created_at DESC"

    const { rows } = await pool.query(query, params)

    const consultIds = rows.map(r => r.id)
    let examensMap = {}
    if (consultIds.length > 0) {
      const { rows: exRows } = await pool.query(
        `SELECT consultation_id, nom, prix FROM examens_commandes WHERE consultation_id = ANY($1)`,
        [consultIds]
      )
      exRows.forEach(e => {
        if (!examensMap[e.consultation_id]) examensMap[e.consultation_id] = []
        examensMap[e.consultation_id].push({ nom: e.nom, prix: e.prix })
      })
    }

    const formatted = rows.map(r => {
      const b = (typeof r.donnees_brouillon === "object" && r.donnees_brouillon) ? r.donnees_brouillon : {}
      return {
        id:                    r.id,
        patientId:             r.patient_id,
        docteurId:             r.medecin_id,
        date:                  r.date_consult,
        service:               r.service,
        motif:                 r.motif,
        plaintes:              r.plaintes,
        diagnostics:           r.diagnostics || [],
        traitements:           r.traitements || [],
        fraisExamens:          r.frais_examens,
        typeConsultation:      r.type_consultation,
        signe:                 r.signe,
        signeLe:               r.signe_le,
        signePar:              r.signe_par,
        attenteResultatsLabo:  r.attente_resultats_labo,
        laboDemandeId:         r.labo_demande_id,
        laboValide:            r.labo_valide === true,
        nom:                   r.patient_nom,
        pid:                   r.pid,
        medecinNom:            r.medecin_nom,
        statut:                r.statut_paiement || (r.signe ? "paye" : "en_attente"),
        montant:               r.montant_paiement || r.montant_consultation || 0,
        examensCommandes:      examensMap[r.id] || b.examensCommandes || [],
        ...b,
      }
    })

    return res.json({ success: true, consultations: formatted })
  } catch (err) {
    console.error("listerConsultations:", err)
    return res.status(500).json({ success: false, message: "Erreur serveur." })
  }
}

async function creerDemandeLaboDepuisConsult(client, {
  patient_id, medecin_id, medecin_nom, service, dateConsult,
  examens_commandes, file_id, consultation_id,
}) {
  const { rows: exist } = await client.query(
    `SELECT id FROM demandes_labo WHERE consultation_id=$1 LIMIT 1`,
    [consultation_id]
  )
  if (exist.length > 0) return exist[0].id

  const { rows: demandeRows } = await client.query(
    `INSERT INTO demandes_labo
       (patient_id, medecin_prescripteur, medecin_id, service, date_demande, heure_demande,
        file_id, consultation_id)
     VALUES ($1,$2,$3,$4,$5,CURRENT_TIME,$6,$7)
     RETURNING id`,
    [patient_id, medecin_nom || null, medecin_id, service || null, dateConsult, file_id || null, consultation_id]
  )
  const demandeId = demandeRows[0].id

  for (const e of examens_commandes) {
    await client.query(
      `INSERT INTO examens_labo (demande_id, nom, prix) VALUES ($1,$2,$3)`,
      [demandeId, e.nom, e.prix || 0]
    )
  }

  await client.query(
    `UPDATE consultations SET attente_resultats_labo=TRUE, labo_demande_id=$1, updated_at=NOW() WHERE id=$2`,
    [demandeId, consultation_id]
  )

  return demandeId
}

const sauvegarderConsultation = async (req, res) => {
  const {
    patient_id, medecin_id, date, service,
    motif, plaintes, diagnostics, traitements,
    frais_examens = 0, type_consultation = "standard",
    examens_commandes, signe, signe_par, envoyer_labo, donnees_brouillon,
  } = req.body

  if (!patient_id || !medecin_id)
    return res.status(400).json({ success: false, message: "patient_id et medecin_id requis." })

  const aDesExamens = examens_commandes && examens_commandes.length > 0
  const signeVal = signe === true

  if (signeVal && aDesExamens) {
    const { rows: chk } = await pool.query(
      `SELECT c.attente_resultats_labo, dl.valide
       FROM consultations c
       LEFT JOIN demandes_labo dl ON dl.id = c.labo_demande_id
       WHERE c.patient_id=$1 AND c.medecin_id=$2 AND c.date_consult=$3`,
      [patient_id, medecin_id, date || new Date().toISOString().slice(0, 10)]
    )
    if (chk.length > 0 && chk[0].attente_resultats_labo && !chk[0].valide) {
      return res.status(400).json({
        success: false,
        message: "Impossible de signer : les résultats du laboratoire ne sont pas encore validés.",
      })
    }
  }

  const client = await pool.connect()
  try {
    await client.query("BEGIN")

    const dateConsult = date || new Date().toISOString().slice(0, 10)
    const doitAttendreLabo = aDesExamens && !signeVal

    const brouillon = donnees_brouillon && typeof donnees_brouillon === "object" ? donnees_brouillon : {}

    const { rows } = await client.query(
      `INSERT INTO consultations
         (patient_id, medecin_id, date_consult, service, motif, plaintes,
          diagnostics, traitements, frais_examens, type_consultation,
          signe, signe_par, signe_le, attente_resultats_labo, donnees_brouillon)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15)
       ON CONFLICT (patient_id, medecin_id, date_consult)
       DO UPDATE SET
         motif=$5, plaintes=$6, diagnostics=$7, traitements=$8,
         frais_examens=$9, type_consultation=$10,
         donnees_brouillon=$15,
         attente_resultats_labo=CASE WHEN $14::boolean THEN TRUE ELSE consultations.attente_resultats_labo END,
         signe=CASE WHEN $11::boolean THEN TRUE ELSE consultations.signe END,
         signe_par=CASE WHEN $11::boolean THEN $12 ELSE consultations.signe_par END,
         signe_le=CASE WHEN $11::boolean THEN NOW() ELSE consultations.signe_le END,
         updated_at=NOW()
       RETURNING id`,
      [patient_id, medecin_id, dateConsult, service || null,
       motif || null, plaintes || null,
       diagnostics || [], traitements || [],
       frais_examens, type_consultation,
       signeVal, signe_par || req.user?.nom || null, signeVal ? new Date() : null,
       doitAttendreLabo || (envoyer_labo && aDesExamens),
       JSON.stringify(brouillon)]
    )

    const consultId = rows[0].id
    let fileId = null

    if (aDesExamens) {
      const fileRes = await client.query(
        `SELECT id FROM file_attente
         WHERE patient_id=$1 AND date_entree=$2 AND statut != 'termine'
         ORDER BY created_at DESC LIMIT 1`,
        [patient_id, dateConsult]
      )
      if (fileRes.rows.length > 0) {
        fileId = fileRes.rows[0].id
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

    if ((envoyer_labo || doitAttendreLabo) && aDesExamens) {
      const { rows: med } = await client.query("SELECT nom FROM utilisateurs WHERE id=$1", [medecin_id])
      const { rows: pat } = await client.query("SELECT nom FROM patients WHERE id=$1", [patient_id])

      const demandeId = await creerDemandeLaboDepuisConsult(client, {
        patient_id,
        medecin_id,
        medecin_nom: med[0]?.nom,
        service,
        dateConsult,
        examens_commandes,
        file_id: fileId,
        consultation_id: consultId,
      })

      await client.query("COMMIT")

      await notifyMedecinEtLabo({
        medecin_id,
        patient_nom: pat[0]?.nom,
        motif:       plaintes || motif,
        service,
        patient_id,
        examens:     examens_commandes,
      })

      return res.status(201).json({
        success: true,
        consultationId: consultId,
        laboDemandeId: demandeId,
        message: "Examens envoyés au laboratoire. Signature possible après validation des résultats.",
      })
    }

    if (signeVal) {
      await client.query(
        `UPDATE file_attente SET statut='termine', updated_at=NOW()
         WHERE patient_id=$1 AND date_entree=$2 AND statut != 'termine'`,
        [patient_id, dateConsult]
      )
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

const signerConsultation = async (req, res) => {
  const { signe_par } = req.body
  const client = await pool.connect()
  try {
    await client.query("BEGIN")

    const { rows: consult } = await client.query(
      `SELECT c.patient_id, c.medecin_id, c.date_consult, c.attente_resultats_labo, dl.valide
       FROM consultations c
       LEFT JOIN demandes_labo dl ON dl.id = c.labo_demande_id
       WHERE c.id=$1`,
      [req.params.id]
    )

    if (consult.length === 0) {
      await client.query("ROLLBACK")
      return res.status(404).json({ success: false, message: "Consultation introuvable." })
    }

    const c = consult[0]
    if (c.attente_resultats_labo && !c.valide) {
      await client.query("ROLLBACK")
      return res.status(400).json({
        success: false,
        message: "Signature impossible : en attente des résultats du laboratoire.",
      })
    }

    await client.query(
      `UPDATE consultations
       SET signe=TRUE, signe_le=NOW(), signe_par=$1, attente_resultats_labo=FALSE, updated_at=NOW()
       WHERE id=$2`,
      [signe_par || req.user.nom, req.params.id]
    )

    await client.query(
      `UPDATE file_attente SET statut='termine', updated_at=NOW()
       WHERE patient_id=$1 AND date_entree=$2 AND statut != 'termine'`,
      [c.patient_id, c.date_consult]
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

const supprimerConsultation = async (req, res) => {
  try {
    const { rowCount } = await pool.query(
      "DELETE FROM consultations WHERE id = $1",
      [req.params.id]
    )
    if (rowCount === 0)
      return res.status(404).json({ success: false, message: "Consultation introuvable." })
    return res.json({ success: true, message: "Consultation supprimée." })
  } catch (err) {
    console.error("supprimerConsultation:", err)
    return res.status(500).json({ success: false, message: "Erreur serveur." })
  }
}

module.exports = { listerConsultations, sauvegarderConsultation, signerConsultation, supprimerConsultation }
