const pool = require("../config/db")

// ═══════════════════════════════════════════════════════════════
//  GET /api/paiements — Liste tous les paiements (file du jour)
// ═══════════════════════════════════════════════════════════════
const listerPaiements = async (req, res) => {
  try {
    const { date = new Date().toISOString().slice(0, 10) } = req.query

    // Récupérer la file d'attente avec les patients et paiements
    const { rows } = await pool.query(`
      SELECT 
        f.id,
        f.patient_id,
        f.medecin_id,
        f.type_visite,
        f.statut,
        f.motif,
        f.service,
        f.arrivee,
        f.date_entree,
        f.montant_consultation,
        f.type_consultation,
        p.nom as patient_nom,
        p.pid,
        p.date_naissance,
        p.telephone,
        p.sexe,
        u.nom as medecin_nom,
        -- Paiement consultation
        pc.statut as paiement_consultation_statut,
        pc.montant as paiement_consultation_montant,
        pc.methode as paiement_consultation_methode,
        pc.note as paiement_consultation_note,
        pc.date_paiement as paiement_consultation_date,
        -- Paiement examens
        pe.statut as paiement_examens_statut,
        pe.montant_total as paiement_examens_montant_total,
        pe.montant_paye as paiement_examens_montant_paye,
        pe.methode as paiement_examens_methode,
        pe.note as paiement_examens_note,
        pe.date_paiement as paiement_examens_date
      FROM file_attente f
      LEFT JOIN patients p ON f.patient_id = p.id
      LEFT JOIN utilisateurs u ON f.medecin_id = u.id
      LEFT JOIN paiements_consultation pc ON f.id = pc.file_id
      LEFT JOIN paiements_examens pe ON f.id = pe.file_id
      WHERE f.date_entree = $1
      ORDER BY f.arrivee DESC
    `, [date])

    const paiements = rows.map(r => ({
      id: r.id,
      patientId: r.patient_id,
      patient: {
        id: r.patient_id,
        nom: r.patient_nom,
        pid: r.pid,
        dateNaissance: r.date_naissance,
        telephone: r.telephone,
        sexe: r.sexe
      },
      medecin: {
        id: r.medecin_id,
        nom: r.medecin_nom
      },
      typeVisite: r.type_visite,
      statut: r.statut,
      motif: r.motif,
      service: r.service,
      arrivee: r.arrivee,
      dateEntree: r.date_entree,
      montantConsultation: r.montant_consultation,
      typeConsultation: r.type_consultation,
      paiementConsultation: r.paiement_consultation_statut ? {
        statut: r.paiement_consultation_statut,
        montant: r.paiement_consultation_montant,
        methode: r.paiement_consultation_methode,
        note: r.paiement_consultation_note,
        date: r.paiement_consultation_date
      } : null,
      paiementExamens: r.paiement_examens_statut ? {
        statut: r.paiement_examens_statut,
        montantTotal: r.paiement_examens_montant_total,
        montantPaye: r.paiement_examens_montant_paye,
        methode: r.paiement_examens_methode,
        note: r.paiement_examens_note,
        date: r.paiement_examens_date
      } : null
    }))

    // Calculer les totaux
    const stats = {
      totalAEncaisser: 0,
      totalEncaisse: 0,
      nbAttente: 0
    }

    paiements.forEach(p => {
      // Consultation
      if (p.typeVisite !== 'rendez_vous' && p.montantConsultation > 0) {
        if (p.paiementConsultation?.statut === 'paye') {
          stats.totalEncaisse += p.paiementConsultation.montant || 0
        } else {
          stats.totalAEncaisser += p.montantConsultation || 0
          stats.nbAttente++
        }
      }
      
      // Examens
      if (p.paiementExamens) {
        stats.totalEncaisse += p.paiementExamens.montantPaye || 0
        const restant = (p.paiementExamens.montantTotal || 0) - (p.paiementExamens.montantPaye || 0)
        if (restant > 0) {
          stats.totalAEncaisser += restant
        }
      }
    })

    return res.json({ success: true, paiements, stats })
  } catch (err) {
    console.error("listerPaiements:", err)
    return res.status(500).json({ success: false, message: "Erreur serveur." })
  }
}

// ═══════════════════════════════════════════════════════════════
//  GET /api/paiements/stats — Statistiques financières
// ═══════════════════════════════════════════════════════════════
const getStatistiques = async (req, res) => {
  try {
    const { debut, fin } = req.query
    
    // Stats globales
    const { rows: statsRows } = await pool.query(`
      SELECT 
        COUNT(DISTINCT f.id) as total_file,
        COUNT(DISTINCT pc.id) as total_paiements_consultation,
        COUNT(DISTINCT pe.id) as total_paiements_examens,
        COALESCE(SUM(CASE WHEN pc.statut = 'paye' THEN pc.montant ELSE 0 END), 0) as total_encaisse_consultation,
        COALESCE(SUM(CASE WHEN pe.statut = 'paye' THEN pe.montant_paye ELSE 0 END), 0) as total_encaisse_examens,
        COALESCE(SUM(CASE WHEN pc.statut != 'paye' THEN f.montant_consultation ELSE 0 END), 0) as total_attente_consultation,
        COALESCE(SUM(pe.montant_total - pe.montant_paye), 0) as total_attente_examens
      FROM file_attente f
      LEFT JOIN paiements_consultation pc ON f.id = pc.file_id
      LEFT JOIN paiements_examens pe ON f.id = pe.file_id
      WHERE ($1::date IS NULL OR f.date_entree >= $1::date)
        AND ($2::date IS NULL OR f.date_entree <= $2::date)
    `, [debut || null, fin || null])

    // Activité par jour (7 derniers jours)
    const { rows: activiteRows } = await pool.query(`
      SELECT 
        f.date_entree,
        COUNT(*) as nb_paiements,
        COALESCE(SUM(CASE WHEN pc.statut = 'paye' THEN pc.montant ELSE 0 END), 0) as montant_encaisse
      FROM file_attente f
      LEFT JOIN paiements_consultation pc ON f.id = pc.file_id
      WHERE f.date_entree >= CURRENT_DATE - INTERVAL '7 days'
      GROUP BY f.date_entree
      ORDER BY f.date_entree DESC
    `)

    // Recette du Jour
    const { rows: jourRows } = await pool.query(`
      SELECT 
        (SELECT COALESCE(SUM(montant), 0) FROM paiements_consultation WHERE date_paiement = CURRENT_DATE) as consult,
        (SELECT COALESCE(SUM(montant_paye), 0) FROM paiements_examens WHERE date_paiement = CURRENT_DATE) as examens
    `)
    const recetteJour = Number(jourRows[0].consult) + Number(jourRows[0].examens)

    // Recette du Mois
    const { rows: moisRows } = await pool.query(`
      SELECT 
        (SELECT COALESCE(SUM(montant), 0) FROM paiements_consultation WHERE DATE_TRUNC('month', date_paiement) = DATE_TRUNC('month', CURRENT_DATE)) as consult,
        (SELECT COALESCE(SUM(montant_paye), 0) FROM paiements_examens WHERE DATE_TRUNC('month', date_paiement) = DATE_TRUNC('month', CURRENT_DATE)) as examens
    `)
    const recetteMois = Number(moisRows[0].consult) + Number(moisRows[0].examens)

    // Recette Totale
    const { rows: totalRows } = await pool.query(`
      SELECT 
        (SELECT COALESCE(SUM(montant), 0) FROM paiements_consultation) as consult,
        (SELECT COALESCE(SUM(montant_paye), 0) FROM paiements_examens) as examens
    `)
    const recetteTotal = Number(totalRows[0].consult) + Number(totalRows[0].examens)

    const stats = statsRows[0]
    const activite = activiteRows

    return res.json({
      success: true,
      stats: {
        totalEncaisse: parseInt(stats.total_encaisse_consultation) + parseInt(stats.total_encaisse_examens),
        totalAttente: parseInt(stats.total_attente_consultation) + parseInt(stats.total_attente_examens),
        nbPaiements: parseInt(stats.total_paiements_consultation) + parseInt(stats.total_paiements_examens),
        tauxRecouvrement: stats.total_encaisse_consultation > 0 
          ? Math.round((parseInt(stats.total_encaisse_consultation) / (parseInt(stats.total_encaisse_consultation) + parseInt(stats.total_attente_consultation))) * 100)
          : 0,
        recetteJour,
        recetteMois,
        recetteTotal
      },
      activite
    })
  } catch (err) {
    console.error("getStatistiques:", err)
    return res.status(500).json({ success: false, message: "Erreur serveur." })
  }
}

// ═══════════════════════════════════════════════════════════════
//  GET /api/paiements/historique — Historique des paiements
// ═══════════════════════════════════════════════════════════════
const getHistorique = async (req, res) => {
  try {
    const { debut, fin, type = 'tous' } = req.query

    let query = `
      SELECT 
        f.id as file_id,
        f.date_entree,
        f.type_visite,
        p.nom as patient_nom,
        p.pid,
        u.nom as medecin_nom,
        f.service,
        pc.statut as statut_consultation,
        pc.montant as montant_consultation,
        pc.methode as methode_consultation,
        pc.note as note_consultation,
        pc.date_paiement as date_paiement_consultation,
        pe.statut as statut_examens,
        pe.montant_total,
        pe.montant_paye,
        pe.methode as methode_examens,
        pe.note as note_examens,
        pe.date_paiement as date_paiement_examens
      FROM file_attente f
      LEFT JOIN patients p ON f.patient_id = p.id
      LEFT JOIN utilisateurs u ON f.medecin_id = u.id
      LEFT JOIN paiements_consultation pc ON f.id = pc.file_id
      LEFT JOIN paiements_examens pe ON f.id = pe.file_id
      WHERE ($1::date IS NULL OR f.date_entree >= $1::date)
        AND ($2::date IS NULL OR f.date_entree <= $2::date)
        AND (pc.statut = 'paye' OR pe.statut = 'paye')
      ORDER BY f.date_entree DESC, f.arrivee DESC
    `

    if (type === 'consultation') {
      query += " AND pc.statut = 'paye'"
    } else if (type === 'examens') {
      query += " AND pe.statut = 'paye'"
    }

    const { rows } = await pool.query(query, [debut || null, fin || null])

    const historique = rows.map(r => ({
      fileId: r.file_id,
      dateEntree: r.date_entree,
      typeVisite: r.type_visite,
      patient: {
        nom: r.patient_nom,
        pid: r.pid
      },
      medecin: {
        nom: r.medecin_nom
      },
      service: r.service,
      paiementConsultation: r.statut_consultation === 'paye' ? {
        montant: r.montant_consultation,
        methode: r.methode_consultation,
        note: r.note_consultation,
        date: r.date_paiement_consultation
      } : null,
      paiementExamens: r.statut_examens === 'paye' ? {
        montantTotal: r.montant_total,
        montantPaye: r.montant_paye,
        methode: r.methode_examens,
        note: r.note_examens,
        date: r.date_paiement_examens
      } : null
    }))

    return res.json({ success: true, historique })
  } catch (err) {
    console.error("getHistorique:", err)
    return res.status(500).json({ success: false, message: "Erreur serveur." })
  }
}

// ═══════════════════════════════════════════════════════════════
//  POST /api/paiements/consultation — Enregistrer paiement consultation
// ═══════════════════════════════════════════════════════════════
const enregistrerPaiementConsultation = async (req, res) => {
  const { file_id, patient_id, montant, methode, note, date_paiement } = req.body

  if (!file_id || !patient_id || !montant) {
    return res.status(400).json({ 
      success: false, 
      message: "file_id, patient_id et montant sont requis." 
    })
  }

  try {
    const { rows } = await pool.query(
      `INSERT INTO paiements_consultation 
       (file_id, patient_id, statut, montant, methode, note, date_paiement)
       VALUES ($1, $2, 'paye', $3, $4, $5, $6)
       ON CONFLICT (file_id) 
       DO UPDATE SET 
         statut = 'paye',
         montant = EXCLUDED.montant,
         methode = EXCLUDED.methode,
         note = EXCLUDED.note,
         date_paiement = EXCLUDED.date_paiement
       RETURNING *`,
      [file_id, patient_id, montant, methode || 'cash', note || '', date_paiement || new Date().toISOString().slice(0, 10)]
    )

    // Garder le patient en file (triage / consultation) — le statut « termine » vient de la signature médicale
    await pool.query(
      `UPDATE file_attente SET statut = 'en_attente', updated_at = NOW() WHERE id = $1`,
      [file_id]
    )

    return res.json({ 
      success: true, 
      message: "Paiement consultation enregistré avec succès.",
      paiement: rows[0]
    })
  } catch (err) {
    console.error("enregistrerPaiementConsultation:", err)
    return res.status(500).json({ success: false, message: "Erreur serveur." })
  }
}

// ═══════════════════════════════════════════════════════════════
//  POST /api/paiements/examens — Enregistrer paiement examens
// ═══════════════════════════════════════════════════════════════
const enregistrerPaiementExamens = async (req, res) => {
  const { file_id, patient_id, montant_paye, methode, note, date_paiement } = req.body

  if (!file_id || !patient_id || !montant_paye) {
    return res.status(400).json({ 
      success: false, 
      message: "file_id, patient_id et montant_paye sont requis." 
    })
  }

  try {
    // Récupérer le montant total des examens pour cette file
    const { rows: examensRows } = await pool.query(
      `SELECT COALESCE(SUM(prix), 0) as total 
       FROM examens_commandes 
       WHERE file_id = $1`,
      [file_id]
    )

    const montant_total = examensRows[0]?.total || 0
    const statut = montant_paye >= montant_total ? 'paye' : 'partiel'

    const { rows } = await pool.query(
      `INSERT INTO paiements_examens 
       (file_id, patient_id, montant_total, montant_paye, statut, methode, note, date_paiement)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       ON CONFLICT (file_id) 
       DO UPDATE SET 
         montant_total = EXCLUDED.montant_total,
         montant_paye = paiements_examens.montant_paye + EXCLUDED.montant_paye,
         statut = CASE 
           WHEN (paiements_examens.montant_paye + EXCLUDED.montant_paye) >= EXCLUDED.montant_total 
           THEN 'paye' 
           ELSE 'partiel' 
         END,
         methode = EXCLUDED.methode,
         note = EXCLUDED.note,
         date_paiement = EXCLUDED.date_paiement,
         updated_at = NOW()
       RETURNING *`,
      [file_id, patient_id, montant_total, montant_paye, statut, methode || 'cash', note || '', date_paiement || new Date().toISOString().slice(0, 10)]
    )

    return res.json({ 
      success: true, 
      message: "Paiement examens enregistré avec succès.",
      paiement: rows[0]
    })
  } catch (err) {
    console.error("enregistrerPaiementExamens:", err)
    return res.status(500).json({ success: false, message: "Erreur serveur." })
  }
}

module.exports = {
  listerPaiements,
  getStatistiques,
  getHistorique,
  enregistrerPaiementConsultation,
  enregistrerPaiementExamens
}