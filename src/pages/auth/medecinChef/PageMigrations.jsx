import { useState, useEffect } from "react"
import { C, Card, Btn, Inp, Sel, FInput, Avatar } from "./shared.jsx"
import { useSharedData } from "../../../hooks/useSharedData.jsx"
import api from "../../../api"

export default function PageMigrations() {
  const { rafraichir } = useSharedData()
  const [activeTab, setActiveTab] = useState("excel") // 'excel' | 'papier' | 'historique'

  // États pour l'onglet Excel
  const [file, setFile] = useState(null)
  const [dragging, setDragging] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [importReport, setImportReport] = useState(null) // { summary, details }
  const [errorMessage, setErrorMessage] = useState("")

  // États pour la saisie manuelle (papier)
  const [papierForm, setPapierForm] = useState({
    nom: "",
    date_naissance: "",
    sexe: "",
    telephone: "",
    quartier: "",
    secteur: "",
    profession: "",
    responsable: "",
    type_dossier: "consultation",
    poids: "",
    taille: "",
    ta: "",
    temperature: "",
    pouls: "",
    spo2: "",
    observation: "",
    diagnostic: "",
    traitements: "",
    hu: "",
    vaccination: "",
    nb_cpn: "",
    pathologie_grossesse: "",
    parents_ref: "",
    geste_mere: "",
    poids_nn: "",
    taille_nn: "",
    pc: "",
    date_naissance_heure: "",
    sexe_nn: "",
    soin: "",
    parent_nom: "",
    parent_prenom: "",
    parent_age: "",
    parent_quartier: "",
    parent_telephone: "",
    parent_profession: ""
  })
  const [savingPapier, setSavingPapier] = useState(false)
  const [duplicateWarning, setDuplicateWarning] = useState(null) // Message si doublon
  const [successMessage, setSuccessMessage] = useState("")

  // États pour l'historique
  const [logs, setLogs] = useState([])
  const [loadingLogs, setLoadingLogs] = useState(false)
  const [selectedLog, setSelectedLog] = useState(null) // Pour le modal de détails

  // Charger l'historique des migrations
  const chargerHistorique = async () => {
    setLoadingLogs(true)
    try {
      const { data } = await api.get("/api/migrations/historique")
      if (data.success) {
        setLogs(data.logs)
      }
    } catch (err) {
      console.error("Erreur historique:", err)
    } finally {
      setLoadingLogs(false)
    }
  }

  useEffect(() => {
    if (activeTab === "historique") {
      chargerHistorique()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab])

  // --- Gestion de l'upload Excel ---
  const handleDragOver = (e) => {
    e.preventDefault()
    setDragging(true)
  }

  const handleDragLeave = () => {
    setDragging(false)
  }

  const handleDrop = (e) => {
    e.preventDefault()
    setDragging(false)
    const files = e.dataTransfer.files
    if (files.length > 0) {
      validerEtDefinirFichier(files[0])
    }
  }

  const handleFileChange = (e) => {
    const files = e.target.files
    if (files.length > 0) {
      validerEtDefinirFichier(files[0])
    }
  }

  const validerEtDefinirFichier = (selectedFile) => {
    const extension = selectedFile.name.split(".").pop().toLowerCase()
    if (extension !== "xlsx" && extension !== "xls" && extension !== "csv") {
      setErrorMessage("Format non supporté. Veuillez sélectionner un fichier Excel (.xlsx, .xls) ou CSV.")
      setFile(null)
      return
    }
    setFile(selectedFile)
    setErrorMessage("")
    setImportReport(null)
  }

  const lancerImportation = async () => {
    if (!file) return
    setUploading(true)
    setErrorMessage("")
    setImportReport(null)

    const formData = new FormData()
    formData.append("file", file)

    try {
      const { data } = await api.post("/api/migrations/import-excel", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      })

      if (data.success) {
        setImportReport({
          summary: data.summary,
          details: data.details
        })
        setFile(null)
        rafraichir?.() // Recharger la liste globale des patients
      } else {
        setErrorMessage(data.message || "Erreur lors de l'importation.")
      }
    } catch (err) {
      console.error("Erreur import:", err)
      setErrorMessage(err.response?.data?.message || "Une erreur est survenue lors de l'envoi du fichier.")
    } finally {
      setUploading(false)
    }
  }

  // --- Saisie manuelle papier ---
  const handlePapierChange = (field, val) => {
    setPapierForm(prev => ({ ...prev, [field]: val }))
    if (duplicateWarning) setDuplicateWarning(null)
    if (successMessage) setSuccessMessage("")
  }

  const soumettrePapier = async (force = false) => {
    if (!papierForm.nom.trim()) {
      setErrorMessage("Le nom complet est requis.")
      return
    }
    setSavingPapier(true)
    setErrorMessage("")
    setSuccessMessage("")

    const {
      nom, date_naissance, sexe, telephone, quartier, secteur, profession, responsable, type_dossier,
      poids, taille, ta, temperature, pouls, spo2, observation, diagnostic, traitements,
      hu, vaccination, nb_cpn, pathologie_grossesse,
      parents_ref, geste_mere, poids_nn, taille_nn, pc, date_naissance_heure, sexe_nn, soin,
      parent_nom, parent_prenom, parent_age, parent_quartier, parent_telephone, parent_profession
    } = papierForm

    let donnees_dossier = {}
    let finalSexe = sexe
    let finalDateNaissance = date_naissance
    let finalTelephone = telephone
    let finalQuartier = quartier
    let finalSecteur = secteur
    let finalProfession = profession
    let finalResponsable = responsable

    if (type_dossier === "consultation") {
      donnees_dossier = { poids, taille, ta, temperature, pouls, spo2, observation, diagnostic, traitements }
    } else if (type_dossier === "cpn") {
      donnees_dossier = { poids, taille, hu, vaccination, ta, nb_cpn, pathologie_grossesse, traitements }
    } else if (type_dossier === "nouveau_ne") {
      const concatenatedParentsRef = `Nom: ${parent_nom || ""}, Prénom: ${parent_prenom || ""}, Âge: ${parent_age || ""} ans, Quartier: ${parent_quartier || ""}, Téléphone: ${parent_telephone || ""}, Profession: ${parent_profession || ""}`
      donnees_dossier = { parents_ref: concatenatedParentsRef, geste_mere, poids_nn, taille_nn, pc, date_naissance_heure, soin, observation }
      if (sexe_nn) finalSexe = sexe_nn
      if (date_naissance_heure) finalDateNaissance = date_naissance_heure.slice(0, 10)
      finalTelephone = parent_telephone
      finalQuartier = parent_quartier
      finalSecteur = ""
      finalProfession = "Nouveau-né"
      finalResponsable = `${parent_nom || ""} ${parent_prenom || ""}`.trim()
    }

    try {
      const { data } = await api.post("/api/migrations/saisie-papier", {
        nom, date_naissance: finalDateNaissance, sexe: finalSexe, telephone: finalTelephone, quartier: finalQuartier, secteur: finalSecteur, profession: finalProfession, responsable: finalResponsable,
        type_dossier,
        donnees_dossier,
        force
      })

      if (data.success) {
        setSuccessMessage(`Dossier patient "${data.patient.nom}" créé avec succès (PID: ${data.patient.pid}).`)
        setPapierForm({
          nom: "",
          date_naissance: "",
          sexe: "",
          telephone: "",
          quartier: "",
          secteur: "",
          profession: "",
          responsable: "",
          type_dossier: type_dossier,
          poids: "",
          taille: "",
          ta: "",
          temperature: "",
          pouls: "",
          spo2: "",
          observation: "",
          diagnostic: "",
          traitements: "",
          hu: "",
          vaccination: "",
          nb_cpn: "",
          pathologie_grossesse: "",
          parents_ref: "",
          geste_mere: "",
          poids_nn: "",
          taille_nn: "",
          pc: "",
          date_naissance_heure: "",
          sexe_nn: "",
          soin: "",
          parent_nom: "",
          parent_prenom: "",
          parent_age: "",
          parent_quartier: "",
          parent_telephone: "",
          parent_profession: ""
        })
        setDuplicateWarning(null)
        rafraichir?.() // Mettre à jour la liste des patients
      } else if (data.duplicate) {
        setDuplicateWarning(data.message)
      } else {
        setErrorMessage(data.message || "Erreur lors de la création du patient.")
      }
    } catch (err) {
      console.error("Erreur papier:", err)
      setErrorMessage(err.response?.data?.message || "Une erreur est survenue lors de l'enregistrement.")
    } finally {
      setSavingPapier(false)
    }
  }

  return (
    <div style={{ maxWidth: 1000, margin: "0 auto" }}>
      {/* En-tête */}
      <div style={{ marginBottom: 24 }}>
        <p style={{ fontSize: 26, fontWeight: 800, color: C.textPri, letterSpacing: "-0.5px", marginBottom: 4 }}>
          Gestion des Anciennes Données Patients
        </p>
        <p style={{ fontSize: 13, color: C.textSec }}>
          Importez vos anciens fichiers patients ou saisissez les dossiers papiers pour centraliser l'historique clinique.
        </p>
      </div>

      {/* Barre d'onglets premium */}
      <div style={{ display: "flex", gap: 6, padding: 4, background: C.slateSoft, borderRadius: 14, marginBottom: 24, flexWrap: "wrap" }}>
        {[
          { id: "excel", label: "Import Fichier (Excel / CSV)" },
          { id: "papier_consultation", label: "Saisie Consultation" },
          { id: "papier_cpn", label: "Saisie CPN" },
          { id: "papier_nouveau_ne", label: "Saisie Nouveau-né" },
          { id: "historique", label: "Historique des Migrations" }
        ].map(t => (
          <button
            key={t.id}
            onClick={() => {
              setActiveTab(t.id)
              setErrorMessage("")
              setSuccessMessage("")
              setDuplicateWarning(null)
              if (t.id === "papier_consultation") {
                handlePapierChange("type_dossier", "consultation")
              } else if (t.id === "papier_cpn") {
                handlePapierChange("type_dossier", "cpn")
              } else if (t.id === "papier_nouveau_ne") {
                handlePapierChange("type_dossier", "nouveau_ne")
              }
            }}
            style={{
              flex: 1,
              padding: "10px 16px",
              border: "none",
              borderRadius: 10,
              fontSize: 13,
              fontWeight: 700,
              cursor: "pointer",
              fontFamily: "inherit",
              transition: "all 0.2s ease",
              background: activeTab === t.id ? C.white : "transparent",
              color: activeTab === t.id ? C.blue : C.textSec,
              boxShadow: activeTab === t.id ? C.shadowSm : "none",
              minWidth: "120px"
            }}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Notifications globales */}
      {errorMessage && (
        <div style={{ background: C.redSoft, border: "1px solid " + C.red + "33", color: C.red, padding: "12px 16px", borderRadius: 12, marginBottom: 20, fontSize: 13, fontWeight: 600 }}>
          {errorMessage}
        </div>
      )}
      {successMessage && (
        <div style={{ background: C.greenSoft, border: "1px solid " + C.green + "33", color: C.green, padding: "12px 16px", borderRadius: 12, marginBottom: 20, fontSize: 13, fontWeight: 600 }}>
          {successMessage}
        </div>
      )}

      {/* --- ONGLET EXCEL --- */}
      {activeTab === "excel" && (
        <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
          <Card style={{ padding: 28, textAlign: "center" }}>
            <div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              style={{
                border: "2px dashed " + (dragging ? C.blue : C.border),
                borderRadius: 16,
                padding: "48px 20px",
                background: dragging ? C.blueSoft + "22" : C.bg,
                cursor: "pointer",
                transition: "all 0.2s ease"
              }}
              onClick={() => document.getElementById("fileInput").click()}
            >
              <input
                id="fileInput"
                type="file"
                accept=".xlsx,.xls,.csv"
                style={{ display: "none" }}
                onChange={handleFileChange}
              />

              <div style={{ width: 64, height: 64, borderRadius: "50%", background: C.blueSoft, color: C.blue, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px" }}>
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                  <polyline points="17 8 12 3 7 8" />
                  <line x1="12" y1="3" x2="12" y2="15" />
                </svg>
              </div>

              <p style={{ fontSize: 15, fontWeight: 700, color: C.textPri, marginBottom: 6 }}>
                {file ? file.name : "Glissez-déposez votre fichier Excel ou CSV ici"}
              </p>
              <p style={{ fontSize: 12, color: C.textMuted }}>
                Formats supportés : .xlsx, .xls, .csv (taille max. 10 Mo)
              </p>

              {file && (
                <div style={{ marginTop: 14, display: "inline-block", background: C.white, padding: "4px 12px", borderRadius: 8, border: "1px solid " + C.border, fontSize: 12, fontWeight: 600, color: C.textSec }}>
                  {(file.size / 1024).toFixed(1)} KB
                </div>
              )}
            </div>

            {file && (
              <div style={{ marginTop: 24, display: "flex", justifyContent: "center", gap: 12 }}>
                <Btn variant="secondary" onClick={() => setFile(null)} disabled={uploading}>
                  Annuler
                </Btn>
                <Btn variant="success" onClick={lancerImportation} disabled={uploading}>
                  {uploading ? "Importation en cours..." : "Lancer l'importation"}
                </Btn>
              </div>
            )}
          </Card>

          {/* Rapport d'importation */}
          {importReport && (
            <Card style={{ padding: 24 }}>
              <p style={{ fontSize: 16, fontWeight: 800, color: C.textPri, marginBottom: 16 }}>
                Rapport de migration de données
              </p>

              {/* KPIs de synthèse */}
              <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12, marginBottom: 20 }}>
                {[
                  { label: "Lignes lues", val: importReport.summary.total, color: C.textPri, bg: C.slateSoft },
                  { label: "Patients importés", val: importReport.summary.imported, color: C.green, bg: C.greenSoft },
                  { label: "Doublons rejetés", val: importReport.summary.duplicates, color: C.amber, bg: C.amberSoft },
                  { label: "Erreurs", val: importReport.summary.errors, color: C.red, bg: C.redSoft }
                ].map(k => (
                  <div key={k.label} style={{ background: k.bg, padding: "14px 10px", borderRadius: 12, textAlign: "center" }}>
                    <p style={{ fontSize: 22, fontWeight: 800, color: k.color, lineHeight: 1 }}>{k.val}</p>
                    <p style={{ fontSize: 11, color: C.textMuted, marginTop: 4, fontWeight: 600 }}>{k.label}</p>
                  </div>
                ))}
              </div>

              {/* Logs détaillés */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                {/* Succès */}
                <div style={{ border: "1px solid " + C.border, borderRadius: 12, overflow: "hidden" }}>
                  <div style={{ padding: "10px 14px", background: C.greenSoft, borderBottom: "1px solid " + C.border, display: "flex", justifyContent: "space-between" }}>
                    <span style={{ fontSize: 12, fontWeight: 700, color: C.green }}>Importés avec succès</span>
                    <span style={{ fontSize: 11, fontWeight: 800, background: C.white, color: C.green, padding: "1px 6px", borderRadius: 10 }}>
                      {importReport.details.succes.length}
                    </span>
                  </div>
                  <div style={{ padding: 12, maxHeight: 200, overflowY: "auto", fontSize: 12, background: C.white, display: "flex", flexDirection: "column", gap: 4 }}>
                    {importReport.details.succes.length === 0 ? (
                      <span style={{ color: C.textMuted, fontStyle: "italic" }}>Aucun patient importé</span>
                    ) : (
                      importReport.details.succes.map((item, idx) => (
                        <div key={idx} style={{ color: C.textPri, padding: "2px 0" }}>✓ {item}</div>
                      ))
                    )}
                  </div>
                </div>

                {/* Doublons & Erreurs */}
                <div style={{ border: "1px solid " + C.border, borderRadius: 12, overflow: "hidden" }}>
                  <div style={{ padding: "10px 14px", background: C.amberSoft, borderBottom: "1px solid " + C.border, display: "flex", justifyContent: "space-between" }}>
                    <span style={{ fontSize: 12, fontWeight: 700, color: C.amber }}>Doublons & Anomalies détectées</span>
                    <span style={{ fontSize: 11, fontWeight: 800, background: C.white, color: C.amber, padding: "1px 6px", borderRadius: 10 }}>
                      {importReport.details.doublons.length + importReport.details.erreurs.length}
                    </span>
                  </div>
                  <div style={{ padding: 12, maxHeight: 200, overflowY: "auto", fontSize: 12, background: C.white, display: "flex", flexDirection: "column", gap: 4 }}>
                    {importReport.details.doublons.map((item, idx) => (
                      <div key={`d-${idx}`} style={{ color: C.amber, padding: "2px 0" }}>⚠ {item}</div>
                    ))}
                    {importReport.details.erreurs.map((item, idx) => (
                      <div key={`e-${idx}`} style={{ color: C.red, padding: "2px 0" }}>✗ {item}</div>
                    ))}
                    {importReport.details.doublons.length === 0 && importReport.details.erreurs.length === 0 && (
                      <span style={{ color: C.textMuted, fontStyle: "italic" }}>Aucune anomalie détectée</span>
                    )}
                  </div>
                </div>
              </div>
            </Card>
          )}
        </div>
      )}

      {/* --- ONGLET PAPIER --- */}
      {["papier_consultation", "papier_cpn", "papier_nouveau_ne"].includes(activeTab) && (
        <Card style={{ padding: 24 }}>
          <p style={{ fontSize: 16, fontWeight: 800, color: C.textPri, marginBottom: 18 }}>
            {activeTab === "papier_consultation" && "Saisie manuelle - Consultation standard"}
            {activeTab === "papier_cpn" && "Saisie manuelle - Consultation prénatale (CPN)"}
            {activeTab === "papier_nouveau_ne" && "Saisie manuelle - Registre Nouveau-né"}
          </p>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px 20px", marginBottom: 24 }}>
            <FInput label="Nom complet" req>
              <Inp
                value={papierForm.nom}
                onChange={e => handlePapierChange("nom", e.target.value)}
                placeholder="Ex : Diallo Ousmane"
              />
            </FInput>

            {papierForm.type_dossier !== "nouveau_ne" && (
              <>
                <FInput label="Date de naissance">
                  <input
                    type="date"
                    value={papierForm.date_naissance}
                    onChange={e => handlePapierChange("date_naissance", e.target.value)}
                    style={{
                      width: "100%",
                      padding: "11px 14px",
                      fontSize: 14,
                      border: "1.5px solid " + C.border,
                      borderRadius: 10,
                      background: C.white,
                      color: C.textPri,
                      outline: "none",
                      fontFamily: "inherit"
                    }}
                  />
                </FInput>

                <FInput label="Sexe">
                  <Sel
                    value={papierForm.sexe}
                    onChange={e => handlePapierChange("sexe", e.target.value)}
                  >
                    <option value="">Sélectionner...</option>
                    <option value="M">Masculin (M)</option>
                    <option value="F">Féminin (F)</option>
                  </Sel>
                </FInput>

                <FInput label="Numéro de téléphone">
                  <Inp
                    value={papierForm.telephone}
                    onChange={e => handlePapierChange("telephone", e.target.value)}
                    placeholder="Ex : +224 620 00 00 00"
                  />
                </FInput>

                <FInput label="Quartier">
                  <Inp
                    value={papierForm.quartier}
                    onChange={e => handlePapierChange("quartier", e.target.value)}
                    placeholder="Ex : Dixinn"
                  />
                </FInput>

                <FInput label="Secteur">
                  <Inp
                    value={papierForm.secteur}
                    onChange={e => handlePapierChange("secteur", e.target.value)}
                    placeholder="Ex : Landréah"
                  />
                </FInput>

                <FInput label="Profession">
                  <Inp
                    value={papierForm.profession}
                    onChange={e => handlePapierChange("profession", e.target.value)}
                    placeholder="Ex : Enseignant"
                  />
                </FInput>

                <FInput label="Responsable légal / Accompagnant">
                  <Inp
                    value={papierForm.responsable}
                    onChange={e => handlePapierChange("responsable", e.target.value)}
                    placeholder="Ex : Diallo Amadou (Père)"
                  />
                </FInput>
              </>
            )}
          </div>

          <div style={{ borderTop: "1.5px solid " + C.border, paddingTop: 20, marginTop: 24, marginBottom: 24 }}>
            <p style={{ fontSize: 14, fontWeight: 700, color: C.textPri, marginBottom: 16 }}>
              Informations Médicales / Cliniques Historiques
            </p>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px 20px" }}>
              {papierForm.type_dossier === "consultation" && (
                <>
                  <FInput label="Poids (kg)">
                    <Inp
                      type="number"
                      value={papierForm.poids}
                      onChange={e => handlePapierChange("poids", e.target.value)}
                      placeholder="Ex : 70"
                    />
                  </FInput>

                  <FInput label="Taille (cm)">
                    <Inp
                      type="number"
                      value={papierForm.taille}
                      onChange={e => handlePapierChange("taille", e.target.value)}
                      placeholder="Ex : 170"
                    />
                  </FInput>

                  <FInput label="Tension Artérielle (TA)">
                    <Inp
                      value={papierForm.ta}
                      onChange={e => handlePapierChange("ta", e.target.value)}
                      placeholder="Ex : 120/80"
                    />
                  </FInput>

                  <FInput label="Température (°C)">
                    <Inp
                      type="number"
                      value={papierForm.temperature}
                      onChange={e => handlePapierChange("temperature", e.target.value)}
                      placeholder="Ex : 37"
                    />
                  </FInput>

                  <FInput label="Pouls (bpm)">
                    <Inp
                      type="number"
                      value={papierForm.pouls}
                      onChange={e => handlePapierChange("pouls", e.target.value)}
                      placeholder="Ex : 72"
                    />
                  </FInput>

                  <FInput label="SpO₂ (%)">
                    <Inp
                      type="number"
                      value={papierForm.spo2}
                      onChange={e => handlePapierChange("spo2", e.target.value)}
                      placeholder="Ex : 98"
                      min="0"
                      max="100"
                    />
                  </FInput>

                  <FInput label="Observation" style={{ gridColumn: "span 2" }}>
                    <textarea
                      value={papierForm.observation}
                      onChange={e => handlePapierChange("observation", e.target.value)}
                      placeholder="Observations cliniques..."
                      style={{
                        width: "100%",
                        padding: "11px 14px",
                        fontSize: 14,
                        border: "1.5px solid " + C.border,
                        borderRadius: 10,
                        background: C.white,
                        color: C.textPri,
                        outline: "none",
                        fontFamily: "inherit",
                        minHeight: 80,
                        resize: "vertical"
                      }}
                    />
                  </FInput>

                  <FInput label="Diagnostic de presomption">
                    <Inp
                      value={papierForm.diagnostic}
                      onChange={e => handlePapierChange("diagnostic", e.target.value)}
                      placeholder="Ex : Paludisme simple"
                    />
                  </FInput>

                  <FInput label="Traitements prescrits">
                    <Inp
                      value={papierForm.traitements}
                      onChange={e => handlePapierChange("traitements", e.target.value)}
                      placeholder="Ex : Artésunate + Paracétamol"
                    />
                  </FInput>

                 
                </>
              )}

              {papierForm.type_dossier === "cpn" && (
                <>
                  <FInput label="Poids (kg)">
                    <Inp
                      type="number"
                      value={papierForm.poids}
                      onChange={e => handlePapierChange("poids", e.target.value)}
                      placeholder="Ex : 75"
                    />
                  </FInput>

                  <FInput label="Taille de la femme (cm)">
                    <Inp
                      type="number"
                      value={papierForm.taille}
                      onChange={e => handlePapierChange("taille", e.target.value)}
                      placeholder="Ex : 165"
                    />
                  </FInput>

                  <FInput label="Hauteur Utérine (HU - cm)">
                    <Inp
                      type="number"
                      value={papierForm.hu}
                      onChange={e => handlePapierChange("hu", e.target.value)}
                      placeholder="Ex : 28"
                    />
                  </FInput>

                  <FInput label="Vaccination de la femme">
                    <Inp
                      value={papierForm.vaccination}
                      onChange={e => handlePapierChange("vaccination", e.target.value)}
                      placeholder="Ex : VAT1, VAT2..."
                    />
                  </FInput>

                  <FInput label="Tension Artérielle (TA)">
                    <Inp
                      value={papierForm.ta}
                      onChange={e => handlePapierChange("ta", e.target.value)}
                      placeholder="Ex : 110/70"
                    />
                  </FInput>

                  <FInput label="Nombre de CPN">
                    <Sel
                      value={papierForm.nb_cpn}
                      onChange={e => handlePapierChange("nb_cpn", e.target.value)}
                    >
                      <option value="">Sélectionner...</option>
                      <option value="1">1</option>
                      <option value="2">2</option>
                      <option value="3">3</option>
                      <option value="4 ou plus">4 ou plus</option>
                    </Sel>
                  </FInput>

                  <FInput label="Pathologies associées à la grossesse">
                    <Inp
                      value={papierForm.pathologie_grossesse}
                      onChange={e => handlePapierChange("pathologie_grossesse", e.target.value)}
                      placeholder="Ex : Aucune, Anémie..."
                    />
                  </FInput>

                  <FInput label="Traitement">
                    <Inp
                      value={papierForm.traitements}
                      onChange={e => handlePapierChange("traitements", e.target.value)}
                      placeholder="Ex : Fer + Acide folique"
                    />
                  </FInput>
                </>
              )}

              {papierForm.type_dossier === "nouveau_ne" && (
                <>
                  <p style={{ gridColumn: "span 2", fontSize: 13, fontWeight: 700, color: C.textPri, margin: "8px 0 0" }}>Référence des parents (obligatoire pour le nouveau-né)</p>

                  <FInput label="Nom du père">
                    <Inp
                      value={papierForm.parent_nom}
                      onChange={e => handlePapierChange("parent_nom", e.target.value)}
                      placeholder="Ex : Diallo"
                    />
                  </FInput>

                  <FInput label="Prénom du père">
                    <Inp
                      value={papierForm.parent_prenom}
                      onChange={e => handlePapierChange("parent_prenom", e.target.value)}
                      placeholder="Ex : Amadou"
                    />
                  </FInput>

                  <FInput label="Âge du père">
                    <Inp
                      type="number"
                      value={papierForm.parent_age}
                      onChange={e => handlePapierChange("parent_age", e.target.value)}
                      placeholder="Ex : 35"
                    />
                  </FInput>

                  <FInput label="Téléphone du père">
                    <Inp
                      value={papierForm.parent_telephone}
                      onChange={e => handlePapierChange("parent_telephone", e.target.value)}
                      placeholder="Ex : +224 620 00 00 00"
                    />
                  </FInput>

                  <FInput label="Quartier du père">
                    <Inp
                      value={papierForm.parent_quartier}
                      onChange={e => handlePapierChange("parent_quartier", e.target.value)}
                      placeholder="Ex : Dixinn"
                    />
                  </FInput>

                  <FInput label="Profession du père">
                    <Inp
                      value={papierForm.parent_profession}
                      onChange={e => handlePapierChange("parent_profession", e.target.value)}
                      placeholder="Ex : Enseignant"
                    />
                  </FInput>
                  <FInput label="Nom de la mère">
                    <Inp
                      value={papierForm.parent_nom}
                      onChange={e => handlePapierChange("parent_nom", e.target.value)}
                      placeholder="Ex : Diallo"
                    />
                  </FInput>

                  <FInput label="Prénom de la mère">
                    <Inp
                      value={papierForm.parent_prenom}
                      onChange={e => handlePapierChange("parent_prenom", e.target.value)}
                      placeholder="Ex : fatou"
                    />
                  </FInput>

                  <FInput label="Âge de la mère">
                    <Inp
                      type="number"
                      value={papierForm.parent_age}
                      onChange={e => handlePapierChange("parent_age", e.target.value)}
                      placeholder="Ex : 35"
                    />
                  </FInput>

                  <FInput label="Téléphone de la mère">
                    <Inp
                      value={papierForm.parent_telephone}
                      onChange={e => handlePapierChange("parent_telephone", e.target.value)}
                      placeholder="Ex : +224 620 00 00 00"
                    />
                  </FInput>

                  <FInput label="Quartier de la mère">
                    <Inp
                      value={papierForm.parent_quartier}
                      onChange={e => handlePapierChange("parent_quartier", e.target.value)}
                      placeholder="Ex : Dixinn"
                    />
                  </FInput>

                  <FInput label="Profession de la mère">
                    <Inp
                      value={papierForm.parent_profession}
                      onChange={e => handlePapierChange("parent_profession", e.target.value)}
                      placeholder="Ex : Enseignant"
                    />
                  </FInput>
                   <FInput label="Nombre de gestes de la mère">
                    <Inp
                      type="number"
                      value={papierForm.geste_mere}
                      onChange={e => handlePapierChange("geste_mere", e.target.value)}
                      placeholder="Ex : 2"
                    />
                  </FInput>
                  <p style={{ gridColumn: "span 2", fontSize: 13, fontWeight: 700, color: C.textPri, margin: "16px 0 0", borderTop: "1px solid " + C.border, paddingTop: 16 }}>Détails cliniques du nouveau-né</p>

                 

                  <FInput label="Date et heure de naissance">
                    <input
                      type="datetime-local"
                      value={papierForm.date_naissance_heure}
                      onChange={e => handlePapierChange("date_naissance_heure", e.target.value)}
                      style={{
                        width: "100%",
                        padding: "11px 14px",
                        fontSize: 14,
                        border: "1.5px solid " + C.border,
                        borderRadius: 10,
                        background: C.white,
                        color: C.textPri,
                        outline: "none",
                        fontFamily: "inherit"
                      }}
                    />
                  </FInput>

                  <FInput label="Sexe du nouveau-né">
                    <Sel
                      value={papierForm.sexe_nn}
                      onChange={e => handlePapierChange("sexe_nn", e.target.value)}
                    >
                      <option value="">Sélectionner...</option>
                      <option value="M">Masculin (M)</option>
                      <option value="F">Féminin (F)</option>
                    </Sel>
                  </FInput>

                  <FInput label="Poids de naissance (grammes)">
                    <Inp
                      type="number"
                      value={papierForm.poids_nn}
                      onChange={e => handlePapierChange("poids_nn", e.target.value)}
                      placeholder="Ex : 3200"
                    />
                  </FInput>

                  <FInput label="Taille de naissance (cm)">
                    <Inp
                      type="number"
                      value={papierForm.taille_nn}
                      onChange={e => handlePapierChange("taille_nn", e.target.value)}
                      placeholder="Ex : 50"
                    />
                  </FInput>

                  <FInput label="Périmètre Crânien (PC - cm)">
                    <Inp
                      type="number"
                      value={papierForm.pc}
                      onChange={e => handlePapierChange("pc", e.target.value)}
                      placeholder="Ex : 35"
                    />
                  </FInput>

                  <FInput label="Soin donné">
                    <Inp
                      value={papierForm.soin}
                      onChange={e => handlePapierChange("soin", e.target.value)}
                      placeholder="Ex : Soin du cordon, Vitamine K1..."
                    />
                  </FInput>

                  <FInput label="Observation" style={{ gridColumn: "span 2" }}>
                    <textarea
                      value={papierForm.observation}
                      onChange={e => handlePapierChange("observation", e.target.value)}
                      placeholder="Observations cliniques..."
                      style={{
                        width: "100%",
                        padding: "11px 14px",
                        fontSize: 14,
                        border: "1.5px solid " + C.border,
                        borderRadius: 10,
                        background: C.white,
                        color: C.textPri,
                        outline: "none",
                        fontFamily: "inherit",
                        minHeight: 60,
                        resize: "vertical"
                      }}
                    />
                  </FInput>
                </>
              )}
            </div>
          </div>

          {duplicateWarning && (
            <div style={{ background: C.amberSoft, border: "1.5px solid " + C.amber, borderRadius: 12, padding: 16, marginBottom: 20 }}>
              <p style={{ fontSize: 13, color: C.amberDark, fontWeight: 700, marginBottom: 4 }}>⚠ Risque de doublon détecté</p>
              <p style={{ fontSize: 12, color: C.textPri, marginBottom: 12 }}>{duplicateWarning}</p>
              <div style={{ display: "flex", gap: 10 }}>
                <Btn variant="secondary" small onClick={() => setDuplicateWarning(null)}>
                  Modifier les informations
                </Btn>
                <Btn variant="danger" small onClick={() => soumettrePapier(true)}>
                  Forcer l'enregistrement
                </Btn>
              </div>
            </div>
          )}

          {!duplicateWarning && (
            <div style={{ display: "flex", justifyContent: "flex-end", gap: 12 }}>
              <Btn
                variant="secondary"
                onClick={() => {
                  let nextType = "consultation"
                  if (activeTab === "papier_cpn") nextType = "cpn"
                  if (activeTab === "papier_nouveau_ne") nextType = "nouveau_ne"
                  setPapierForm({
                    nom: "",
                    date_naissance: "",
                    sexe: "",
                    telephone: "",
                    quartier: "",
                    secteur: "",
                    profession: "",
                    responsable: "",
                    type_dossier: nextType,
                    poids: "",
                    ta: "",
                    observation: "",
                    diagnostic: "",
                    traitements: "",
                    ddr: "",
                    terme: "",
                    gestite_parite: "",
                    hu: "",
                    bcf: "",
                    constats_problemes: "",
                    poids_nn: "",
                    taille_nn: "",
                    pc: "",
                    apgar1: "",
                    apgar5: "",
                    apgar10: "",
                    voie_acc: "",
                    etat_sortie: ""
                  })
                }}
              >
                Vider
              </Btn>
              <Btn
                variant="primary"
                onClick={() => soumettrePapier(false)}
                disabled={savingPapier || !papierForm.nom.trim()}
              >
                {savingPapier ? "Enregistrement..." : "Enregistrer le dossier"}
              </Btn>
            </div>
          )}
        </Card>
      )}

      {/* --- ONGLET HISTORIQUE --- */}
      {activeTab === "historique" && (
        <Card style={{ overflow: "hidden" }}>
          <div style={{ padding: "16px 20px", borderBottom: "1px solid " + C.border }}>
            <p style={{ fontSize: 15, fontWeight: 800, color: C.textPri }}>
              Historique des migrations de données
            </p>
          </div>

          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ background: C.slateSoft }}>
                {["Date", "Type de Migration", "Nombre Importé", "Nombre d'erreurs", "Opérateur", "Détails"].map(h => (
                  <th key={h} style={{ padding: "11px 16px", textAlign: "left", fontSize: 11, fontWeight: 700, color: C.textSec, textTransform: "uppercase", letterSpacing: "0.06em" }}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loadingLogs ? (
                <tr>
                  <td colSpan={6} style={{ padding: 36, textAlign: "center", color: C.textMuted }}>
                    Chargement de l'historique...
                  </td>
                </tr>
              ) : logs.length === 0 ? (
                <tr>
                  <td colSpan={6} style={{ padding: 48, textAlign: "center", color: C.textMuted }}>
                    Aucune migration enregistrée pour le moment.
                  </td>
                </tr>
              ) : (
                logs.map(log => {
                  const typeLabel = log.type_migration === "IMPORT_EXCEL" ? "Import Excel" : "Saisie Papier"
                  const typeBg = log.type_migration === "IMPORT_EXCEL" ? C.blueSoft : C.purpleSoft
                  const typeColor = log.type_migration === "IMPORT_EXCEL" ? C.blue : C.purple

                  return (
                    <tr key={log.id} style={{ borderBottom: "1px solid " + C.border, transition: "background 0.15s" }}
                      onMouseEnter={e => e.currentTarget.style.background = C.slateSoft}
                      onMouseLeave={e => e.currentTarget.style.background = "transparent"}
                    >
                      <td style={{ padding: "13px 16px", fontSize: 13, color: C.textPri }}>
                        {new Date(log.date_operation).toLocaleString("fr-FR")}
                      </td>
                      <td style={{ padding: "13px 16px" }}>
                        <span style={{ fontSize: 11, fontWeight: 700, background: typeBg, color: typeColor, padding: "3px 10px", borderRadius: 20 }}>
                          {typeLabel}
                        </span>
                      </td>
                      <td style={{ padding: "13px 16px", fontSize: 13, color: C.green, fontWeight: 700 }}>
                        {log.nombre_importe} patients
                      </td>
                      <td style={{ padding: "13px 16px", fontSize: 13, color: log.nombre_erreurs > 0 ? C.red : C.textMuted }}>
                        {log.nombre_erreurs}
                      </td>
                      <td style={{ padding: "13px 16px", fontSize: 13, color: C.textSec }}>
                        {log.utilisateur_nom || "Administrateur"}
                      </td>
                      <td style={{ padding: "13px 16px" }}>
                        <button
                          onClick={() => setSelectedLog(log)}
                          style={{
                            padding: "6px 12px",
                            background: C.white,
                            border: "1px solid " + C.border,
                            borderRadius: 8,
                            fontSize: 12,
                            fontWeight: 600,
                            color: C.textSec,
                            cursor: "pointer",
                            fontFamily: "inherit"
                          }}
                        >
                          Visualiser
                        </button>
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </Card>
      )}

      {/* MODAL DE DETAILS D'UN LOG DE MIGRATION */}
      {selectedLog && (() => {
        let detailsObj = null
        try {
          detailsObj = JSON.parse(selectedLog.details)
        } catch {
          // Si c'est du texte brut (ex: Saisie papier)
          detailsObj = selectedLog.details
        }

        return (
          <div
            style={{ position: "fixed", inset: 0, background: "rgba(15,23,42,0.55)", zIndex: 300, display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}
            onClick={() => setSelectedLog(null)}
          >
            <div
              style={{ background: C.white, borderRadius: 20, width: "100%", maxWidth: 640, maxHeight: "85vh", boxShadow: "0 25px 60px rgba(0,0,0,0.22)", overflow: "hidden", display: "flex", flexDirection: "column" }}
              onClick={e => e.stopPropagation()}
            >
              {/* Header */}
              <div style={{ padding: "20px 24px", background: "linear-gradient(135deg, " + C.slateDark + ", " + C.slate + ")", color: C.white, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div>
                  <p style={{ fontSize: 16, fontWeight: 800, color: C.white, marginBottom: 4 }}>Opération de Migration #{selectedLog.id}</p>
                  <p style={{ fontSize: 12, color: "rgba(255,255,255,0.8)" }}>
                    Exécutée le {new Date(selectedLog.date_operation).toLocaleString("fr-FR")} par {selectedLog.utilisateur_nom || "Administrateur"}
                  </p>
                </div>
                <button onClick={() => setSelectedLog(null)} style={{ background: "rgba(255,255,255,0.18)", border: "none", borderRadius: 8, color: C.white, cursor: "pointer", width: 32, height: 32, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20 }}>×</button>
              </div>

              {/* Contenu */}
              <div style={{ padding: 24, overflowY: "auto", flex: 1, display: "flex", flexDirection: "column", gap: 16 }}>
                {typeof detailsObj === "string" ? (
                  // Affichage pour saisie manuelle papier
                  <div style={{ background: C.slateSoft, padding: 14, borderRadius: 10, border: "1px solid " + C.border }}>
                    <p style={{ fontSize: 13, color: C.textPri, fontWeight: 600 }}>{detailsObj}</p>
                  </div>
                ) : (
                  // Affichage détaillé de l'import Excel
                  <>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10, textAlign: "center" }}>
                      <div style={{ background: C.greenSoft, padding: 10, borderRadius: 10 }}>
                        <p style={{ fontSize: 18, fontWeight: 800, color: C.green }}>{selectedLog.nombre_importe}</p>
                        <p style={{ fontSize: 10, color: C.textMuted }}>Patients Importés</p>
                      </div>
                      <div style={{ background: C.amberSoft, padding: 10, borderRadius: 10 }}>
                        <p style={{ fontSize: 18, fontWeight: 800, color: C.amber }}>{detailsObj?.doublons?.length || 0}</p>
                        <p style={{ fontSize: 10, color: C.textMuted }}>Doublons Détectés</p>
                      </div>
                      <div style={{ background: C.redSoft, padding: 10, borderRadius: 10 }}>
                        <p style={{ fontSize: 18, fontWeight: 800, color: C.red }}>{detailsObj?.erreurs?.length || 0}</p>
                        <p style={{ fontSize: 10, color: C.textMuted }}>Erreurs de Format</p>
                      </div>
                    </div>

                    {/* Patients Importés */}
                    <div>
                      <p style={{ fontSize: 12, fontWeight: 700, color: C.green, marginBottom: 6, textTransform: "uppercase", letterSpacing: "0.05em" }}>Importés avec succès</p>
                      <div style={{ border: "1px solid " + C.border, borderRadius: 8, padding: 10, maxHeight: 120, overflowY: "auto", background: C.bg, fontSize: 12 }}>
                        {detailsObj?.succes?.length === 0 ? (
                          <span style={{ color: C.textMuted, fontStyle: "italic" }}>Aucun patient</span>
                        ) : (
                          detailsObj?.succes?.map((name, idx) => (
                            <div key={idx} style={{ padding: "2px 0" }}>✓ {name}</div>
                          ))
                        )}
                      </div>
                    </div>

                    {/* Doublons */}
                    <div>
                      <p style={{ fontSize: 12, fontWeight: 700, color: C.amber, marginBottom: 6, textTransform: "uppercase", letterSpacing: "0.05em" }}>Doublons rejetés</p>
                      <div style={{ border: "1px solid " + C.border, borderRadius: 8, padding: 10, maxHeight: 120, overflowY: "auto", background: C.bg, fontSize: 12 }}>
                        {detailsObj?.doublons?.length === 0 ? (
                          <span style={{ color: C.textMuted, fontStyle: "italic" }}>Aucun doublon</span>
                        ) : (
                          detailsObj?.doublons?.map((item, idx) => (
                            <div key={idx} style={{ padding: "2px 0", color: C.amberDark }}>⚠ {item}</div>
                          ))
                        )}
                      </div>
                    </div>

                    {/* Erreurs */}
                    <div>
                      <p style={{ fontSize: 12, fontWeight: 700, color: C.red, marginBottom: 6, textTransform: "uppercase", letterSpacing: "0.05em" }}>Erreurs détectées</p>
                      <div style={{ border: "1px solid " + C.border, borderRadius: 8, padding: 10, maxHeight: 120, overflowY: "auto", background: C.bg, fontSize: 12 }}>
                        {detailsObj?.erreurs?.length === 0 ? (
                          <span style={{ color: C.textMuted, fontStyle: "italic" }}>Aucune erreur</span>
                        ) : (
                          detailsObj?.erreurs?.map((item, idx) => (
                            <div key={idx} style={{ padding: "2px 0", color: C.red }}>✗ {item}</div>
                          ))
                        )}
                      </div>
                    </div>
                  </>
                )}
              </div>

              {/* Footer */}
              <div style={{ padding: 16, borderTop: "1px solid " + C.border, display: "flex", justifyContent: "flex-end" }}>
                <Btn variant="secondary" onClick={() => setSelectedLog(null)}>Fermer</Btn>
              </div>
            </div>
          </div>
        )
      })()}
    </div>
  )
}
