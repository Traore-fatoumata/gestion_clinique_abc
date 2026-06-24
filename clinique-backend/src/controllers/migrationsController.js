const pool = require("../config/db")
const xlsx = require("xlsx")

// ── Générer un PID unique ────────────────────────────────
const genPid = async () => {
  const num = Math.floor(100000 + Math.random() * 900000)
  const pid = `abc-mar-${num}`
  const { rows } = await pool.query("SELECT id FROM patients WHERE pid = $1", [pid])
  if (rows.length > 0) return genPid() // collision rare → retry
  return pid
}

const verifierDoublonBD = async (nom, date_naissance) => {
  if (!nom || !date_naissance) return null

  const queryStr = "SELECT id, pid, nom, telephone, date_naissance FROM patients WHERE LOWER(TRIM(nom)) = LOWER($1) AND date_naissance = $2 LIMIT 1"
  const params = [nom.trim(), date_naissance]

  const { rows } = await pool.query(queryStr, params)
  return rows.length > 0 ? rows[0] : null
}

// Helper pour formater les dates lues depuis Excel
const formatterDate = (val) => {
  if (!val) return null
  
  // Si c'est déjà un format Date JS ou un timestamp numérique d'Excel
  if (val instanceof Date) {
    return val.toISOString().slice(0, 10)
  }

  // Si c'est un format chaîne
  const str = String(val).trim()
  
  // Format YYYY-MM-DD
  if (/^\d{4}-\d{2}-\d{2}$/.test(str)) {
    return str
  }

  // Format DD/MM/YYYY
  const partsDMY = str.match(/^(\d{1,2})[\/\-\.](\d{1,2})[\/\-\.](\d{4})$/)
  if (partsDMY) {
    const day = partsDMY[1].padStart(2, '0')
    const month = partsDMY[2].padStart(2, '0')
    const year = partsDMY[3]
    return `${year}-${month}-${day}`
  }

  // Format YYYY/MM/DD
  const partsYMD = str.match(/^(\d{4})[\/\-\.](\d{1,2})[\/\-\.](\d{1,2})$/)
  if (partsYMD) {
    const year = partsYMD[1]
    const month = partsYMD[2].padStart(2, '0')
    const day = partsYMD[3].padStart(2, '0')
    return `${year}-${month}-${day}`
  }

  // Si c'est un format de date Excel sérialisé (nombre de jours depuis 1900)
  if (!isNaN(str) && Number(str) > 20000 && Number(str) < 60000) {
    const dateExcel = new Date((Number(str) - 25569) * 86400 * 1000)
    return dateExcel.toISOString().slice(0, 10)
  }

  return null
}

// ────────────────────────────────────────────────────────
//  POST /api/migrations/import-excel
// ────────────────────────────────────────────────────────
const importExcel = async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ success: false, message: "Veuillez fournir un fichier Excel ou CSV." })
  }

  try {
    // Lire le fichier depuis le buffer mémoire
    const workbook = xlsx.read(req.file.buffer, { type: "buffer", cellDates: true })
    const sheetName = workbook.SheetNames[0]
    const worksheet = workbook.Sheets[sheetName]
    
    // Convertir en tableau d'objets JSON
    const rows = xlsx.utils.sheet_to_json(worksheet, { defval: "" })

    if (rows.length === 0) {
      return res.status(400).json({ success: false, message: "Le fichier Excel est vide." })
    }

    const totalRows = rows.length
    let successCount = 0
    let duplicateCount = 0
    let errorCount = 0

    const detailSucces = []
    const detailDoublons = []
    const detailErreurs = []

    // Cache local pour éviter les doublons au sein du même fichier Excel
    const localPatients = new Set()

    for (let i = 0; i < rows.length; i++) {
      const row = rows[i]
      const rowNum = i + 2 // Compter l'en-tête (ligne 1)

      // Recherche des clés par similarité de nom de colonne (casse et accents)
      let nom = ""
      let dateNaissanceRaw = ""
      let sexe = ""
      let telephone = ""
      let quartier = ""
      let secteur = ""
      let profession = ""
      let responsable = ""

      for (const key of Object.keys(row)) {
        const keyLower = key.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "")
        const val = row[key]

        if (keyLower.includes("nom complet") || keyLower === "nom") {
          nom = String(val).trim()
        } else if (keyLower.includes("naissance") || keyLower.includes("date_naissance")) {
          dateNaissanceRaw = val
        } else if (keyLower === "sexe" || keyLower === "genre") {
          sexe = String(val).trim().toUpperCase()
        } else if (keyLower.includes("telephone") || keyLower === "tel") {
          telephone = String(val).trim()
        } else if (keyLower === "quartier") {
          quartier = String(val).trim()
        } else if (keyLower === "secteur") {
          secteur = String(val).trim()
        } else if (keyLower === "profession") {
          profession = String(val).trim()
        } else if (keyLower === "responsable") {
          responsable = String(val).trim()
        }
      }

      // 1. Validation minimale : Nom requis
      if (!nom) {
        errorCount++
        detailErreurs.push(`Ligne ${rowNum} : Nom manquant`)
        continue
      }

      // Normaliser la date de naissance
      const dateNaissance = formatterDate(dateNaissanceRaw)

      // Normaliser le sexe (M ou F uniquement, sinon null)
      if (sexe !== "M" && sexe !== "F") {
        sexe = null
      }

      // Normaliser le téléphone
      if (telephone === "—" || telephone === "-") {
        telephone = ""
      }

      // 2. Détection des doublons locaux au fichier
      const keyLocalNomDate = `${nom.toLowerCase()}_${dateNaissance || ""}`
      const keyLocalTel = telephone ? `tel_${telephone}` : null

      if (localPatients.has(keyLocalNomDate) || (keyLocalTel && localPatients.has(keyLocalTel))) {
        duplicateCount++
        detailDoublons.push(`Ligne ${rowNum} : ${nom} (Doublon détecté dans le fichier Excel)`)
        continue
      }

      // 3. Détection des doublons en Base de Données
      try {
        const doublonBD = await verifierDoublonBD(nom, dateNaissance, telephone)
        if (doublonBD) {
          duplicateCount++
          detailDoublons.push(`Ligne ${rowNum} : ${nom} (Doublon trouvé en BD: PID ${doublonBD.pid})`)
          continue
        }
      } catch (err) {
        errorCount++
        detailErreurs.push(`Ligne ${rowNum} : Erreur lors de la vérification de doublons (${err.message})`)
        continue
      }

      // 4. Insertion en Base de Données
      try {
        const pid = await genPid()
        await pool.query(
          `INSERT INTO patients (pid, nom, date_naissance, sexe, telephone, quartier, secteur, profession, responsable, source_donnees, date_migration, migre_par)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, 'IMPORT_EXCEL', NOW(), $10)`,
          [pid, nom, dateNaissance, sexe, telephone || null, quartier || null, secteur || null, profession || null, responsable || null, req.user.id]
        )

        // Enregistrer dans le cache local
        localPatients.add(keyLocalNomDate)
        if (telephone) localPatients.add(keyLocalTel)

        successCount++
        detailSucces.push(`${nom} (${pid})`)
      } catch (err) {
        errorCount++
        detailErreurs.push(`Ligne ${rowNum} : Erreur d'insertion en base (${err.message})`)
      }
    }

    // 5. Enregistrer le log de migration
    const rapportDetails = JSON.stringify({
      succes: detailSucces,
      doublons: detailDoublons,
      erreurs: detailErreurs
    })

    await pool.query(
      `INSERT INTO migration_logs (type_migration, nombre_importe, nombre_erreurs, utilisateur_id, details)
       VALUES ('IMPORT_EXCEL', $1, $2, $3, $4)`,
      [successCount, duplicateCount + errorCount, req.user.id, rapportDetails]
    )

    return res.status(200).json({
      success: true,
      message: "Importation terminée avec succès.",
      summary: {
        total: totalRows,
        imported: successCount,
        duplicates: duplicateCount,
        errors: errorCount
      },
      details: {
        succes: detailSucces.slice(0, 100), // Limiter l'affichage à 100 dans la réponse directe
        doublons: detailDoublons,
        erreurs: detailErreurs
      }
    })

  } catch (err) {
    console.error("importExcel:", err)
    return res.status(500).json({ success: false, message: "Erreur lors du traitement du fichier." })
  }
}

// ────────────────────────────────────────────────────────
//  POST /api/migrations/saisie-papier
// ────────────────────────────────────────────────────────
const saisiePapier = async (req, res) => {
  const { nom, date_naissance, sexe, telephone, quartier, secteur, profession, responsable, type_dossier, donnees_dossier, force = false } = req.body

  if (!nom?.trim()) {
    return res.status(400).json({ success: false, message: "Le nom complet est obligatoire." })
  }

  const normalizedNom = nom.trim()
  const dateNaissance = date_naissance || null
  const cleanSexe = (sexe === "M" || sexe === "F") ? sexe : null
  const cleanTel = telephone?.trim() || null

  const client = await pool.connect()
  try {
    await client.query("BEGIN")

    // 1. Vérification de doublons (sauf si forcé)
    if (!force) {
      const doublon = await verifierDoublonBD(normalizedNom, dateNaissance, cleanTel)
      if (doublon) {
        await client.query("ROLLBACK")
        return res.status(200).json({
          success: false,
          duplicate: true,
          message: `Un patient ressemblant existe déjà sous le PID ${doublon.pid} (${doublon.nom}). Voulez-vous forcer l'enregistrement ?`
        })
      }
    }

    // 2. Générer le PID et insérer le patient
    const pid = await genPid()
    const { rows } = await client.query(
      `INSERT INTO patients (pid, nom, date_naissance, sexe, telephone, quartier, secteur, profession, responsable, source_donnees, date_migration, migre_par)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, 'PAPIER', NOW(), $10)
       RETURNING id, uuid, pid, nom, date_naissance, sexe, telephone, quartier, secteur, profession, responsable, source_donnees, date_migration`,
      [pid, normalizedNom, dateNaissance, cleanSexe, cleanTel, quartier || null, secteur || null, profession || null, responsable || null, req.user.id]
    )
    const patient = rows[0]

    // 3. Insérer la consultation historique si type_dossier est spécifié
    if (type_dossier) {
      let type_consultation = "standard"
      let motif = "Consultation historique"
      let plaintes = "Observation historique"
      let diagnostics = []
      let traitements = []
      let donneesBrouillon = {}
      let service = "Médecine générale"

      if (type_dossier === "consultation") {
        type_consultation = "standard"
        motif = "Consultation historique"
        plaintes = donnees_dossier?.observation || "Aucune observation"
        diagnostics = donnees_dossier?.diagnostic ? [donnees_dossier.diagnostic] : ["Consultation standard"]
        traitements = donnees_dossier?.traitements ? [donnees_dossier.traitements] : []
        donneesBrouillon = {
          poids: donnees_dossier?.poids || null,
          taille: donnees_dossier?.taille || null,
          ta: donnees_dossier?.ta || null,
          temperature: donnees_dossier?.temperature || null,
          observations: donnees_dossier?.observation || null,
        }
        service = "Médecine générale"
      } else if (type_dossier === "cpn") {
        type_consultation = "prenatal"
        motif = "CPN historique"
        plaintes = "Suivi de grossesse"
        diagnostics = ["Grossesse suivie (CPN)"]
        donneesBrouillon = {
          donneesPrenatal: {
            poids: donnees_dossier?.poids || null,
            taille: donnees_dossier?.taille || null,
            hu: donnees_dossier?.hu || null,
            vaccination: donnees_dossier?.vaccination || null,
            ta: donnees_dossier?.ta || null,
            nbCpn: donnees_dossier?.nb_cpn || null,
            pathologieGrossesse: donnees_dossier?.pathologie_grossesse || null,
            traitements: donnees_dossier?.traitements || null,
          }
        }
        service = "Gynécologie / Obstétrique"
      } else if (type_dossier === "nouveau_ne") {
        type_consultation = "accouchement"
        motif = "Naissance historique"
        plaintes = "Registre Nouveau-né"
        diagnostics = ["Nouveau-né enregistré"]
        donneesBrouillon = {
          donneesAccouchement: {
            parentsRef: donnees_dossier?.parents_ref || null,
            gesteMere: donnees_dossier?.geste_mere || null,
            poidsNN: donnees_dossier?.poids_nn || null,
            tailleNN: donnees_dossier?.taille_nn || null,
            pc: donnees_dossier?.pc || null,
            dateAcc: donnees_dossier?.date_naissance_heure || dateNaissance || null,
            sexeNN: cleanSexe,
            soin: donnees_dossier?.soin || null,
            observations: donnees_dossier?.observation || null,
          }
        }
        service = "Gynécologie / Obstétrique"
      }

      await client.query(
        `INSERT INTO consultations 
           (patient_id, medecin_id, date_consult, service, motif, plaintes, diagnostics, traitements, type_consultation, signe, signe_le, signe_par, donnees_brouillon)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, TRUE, NOW(), $10, $11)`,
        [
          patient.id,
          req.user.id,
          dateNaissance || new Date().toISOString().slice(0, 10),
          service,
          motif,
          plaintes,
          diagnostics,
          traitements,
          type_consultation,
          req.user.nom || "Dr. Doumbouya",
          JSON.stringify(donneesBrouillon),
        ]
      )
    }

    // 4. Loguer l'opération
    const detailsLog = `Création manuelle du dossier papier : ${normalizedNom} (${pid}) - Type: ${type_dossier || "Aucun"}`
    await client.query(
      `INSERT INTO migration_logs (type_migration, nombre_importe, nombre_erreurs, utilisateur_id, details)
       VALUES ('PAPIER', 1, 0, $1, $2)`,
      [req.user.id, detailsLog]
    )

    await client.query("COMMIT")

    return res.status(201).json({
      success: true,
      message: "Ancien dossier papier enregistré avec succès.",
      patient
    })

  } catch (err) {
    await client.query("ROLLBACK")
    console.error("saisiePapier:", err)
    return res.status(500).json({ success: false, message: "Erreur serveur lors de la création du patient." })
  } finally {
    client.release()
  }
}

// ────────────────────────────────────────────────────────
//  GET /api/migrations/historique
// ────────────────────────────────────────────────────────
const listerMigrations = async (req, res) => {
  try {
    const { rows } = await pool.query(
      `SELECT m.id, m.type_migration, m.nombre_importe, m.nombre_erreurs, 
              m.date_operation, m.details, u.nom as utilisateur_nom
       FROM migration_logs m
       LEFT JOIN utilisateurs u ON m.utilisateur_id = u.id
       ORDER BY m.date_operation DESC`
    )
    return res.json({ success: true, logs: rows })
  } catch (err) {
    console.error("listerMigrations:", err)
    return res.status(500).json({ success: false, message: "Erreur serveur lors de la récupération de l'historique." })
  }
}

module.exports = { importExcel, saisiePapier, listerMigrations }
