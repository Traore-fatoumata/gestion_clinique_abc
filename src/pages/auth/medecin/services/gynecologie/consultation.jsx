/**
 * ═══════════════════════════════════════════════════════════
 *  GYNÉCOLOGIE — Formulaire de consultation spécifique
 *  ═══════════════════════════════════════════════════════════
 * 
 *  Module complet de consultation gynécologique et de
 *  consultation prénatale (CPN), avec calculs automatiques,
 *  prescriptions d'examens et traitement dynamique.
 */

import { useState, useEffect } from "react"
import { C, inputSt, labelSt, RegSection, Btn, calcAge, today } from "../../shared.jsx"
import { 
  CONSULTATION_GYNECO_DEFAULT, 
  GROUPES_SANGUINS, 
  RHESUS, 
  RESULTATS_DEPISTAGE, 
  PRESENTATIONS_FŒTALES, 
  NIVEAUX_GRAVITE 
} from "./consultationConstants.js"
import { EXAMENS_GYNECO, C_GYNECO } from "./sharedGyneco.jsx"
import { EXAMENS_PAR_CATEGORIE } from "../../shared.jsx"

// Helper to look up exam price in base categories
const getExamPrice = (name) => {
  for (const cat of Object.values(EXAMENS_PAR_CATEGORIE)) {
    if (Array.isArray(cat)) {
      const found = cat.find(e => e.nom === name)
      if (found) return found.prix
    }
  }
  return 0
}

export default function ConsultationGyneco({
  patient,
  consultation,
  onSave,
  onCancel,
}) {
  // Navigation tabs state
  const [activeTab, setActiveTab] = useState(0)

  // Initializing state with administrative defaults prefilled from patient
  const [form, setForm] = useState(() => {
    const defaultData = { ...CONSULTATION_GYNECO_DEFAULT }
    
    // Fill from patient details if available
    if (patient) {
      defaultData.nom = patient.nom || ""
      defaultData.prenom = patient.prenom || ""
      defaultData.age = calcAge(patient.dateNaissance) || ""
      defaultData.adresse = patient.quartier || patient.secteur || patient.adresse || ""
      defaultData.telephone = patient.telephone || ""
      defaultData.profession = patient.profession || ""
      defaultData.personne_contact = patient.responsable || ""
    }

    return {
      ...defaultData,
      ...consultation,
    }
  })

  // Dynamic treatments state
  const [listTraitements, setListTraitements] = useState(() => {
    if (consultation?.listTraitements) return consultation.listTraitements
    // Parse from old treatments format if available
    if (Array.isArray(consultation?.traitements)) {
      return consultation.traitements.map((t, idx) => {
        const parts = t.split("—")
        const med = parts[0]?.trim() || ""
        const details = parts[1]?.trim() || ""
        const durPart = details.match(/\(Pendant\s+([^)]+)\)/i)
        const duree = durPart ? durPart[1] : ""
        const posologie = details.replace(/\(Pendant\s+[^)]+\)/i, "").trim()
        return { id: Date.now() + idx, medicament: med, posologie, duree }
      })
    }
    return [{ id: Date.now(), medicament: "", posologie: "", duree: "" }]
  })

  // Lab exams ordered state
  const [examensCommandes, setExamensCommandes] = useState(consultation?.examensCommandes || [])
  const [selectedExCategory, setSelectedExCategory] = useState(Object.keys(EXAMENS_GYNECO)[0])
  const [customExamNom, setCustomExamNom] = useState("")
  const [customExamPrix, setCustomExamPrix] = useState("")

  // Automatic calculation functions
  const calculerIMC = (poids, taille) => {
    const p = parseFloat(poids)
    const t = parseFloat(taille) / 100 // cm to meters
    if (p > 0 && t > 0) {
      return (p / (t * t)).toFixed(1)
    }
    return ""
  }

  const calculerDPA = (ddrDate) => {
    if (!ddrDate) return ""
    try {
      const d = new Date(ddrDate)
      if (isNaN(d.getTime())) return ""
      d.setDate(d.getDate() + 280) // DDR + 40 Weeks (280 days)
      return d.toISOString().slice(0, 10)
    } catch {
      return ""
    }
  }

  const calculerAgeGestationnel = (ddrDate) => {
    if (!ddrDate) return ""
    try {
      const d = new Date(ddrDate)
      if (isNaN(d.getTime())) return ""
      const todayDate = new Date()
      const diffTime = todayDate.getTime() - d.getTime()
      const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24))
      if (diffDays < 0) return "DDR future !"
      const weeks = Math.floor(diffDays / 7)
      const days = diffDays % 7
      if (days === 0) return `${weeks} SA`
      return `${weeks} SA + ${days} j`
    } catch {
      return ""
    }
  }

  // Update field and compute dependent fields
  const f = (k, v) => {
    setForm(prev => {
      const updated = { ...prev, [k]: v }

      if (k === "ddr") {
        updated.dpa = calculerDPA(v)
        updated.age_gestationnel = calculerAgeGestationnel(v)
      }

      if (k === "poids" || k === "taille") {
        updated.imc = calculerIMC(updated.poids, updated.taille)
      }

      return updated
    })
  }

  // Exam ordering handlers
  const ajouterExamen = (nom, categorie) => {
    if (examensCommandes.find(e => e.nom === nom)) return
    const prix = getExamPrice(nom) || 0
    setExamensCommandes(p => [...p, { id: Date.now(), nom, prix, categorie }])
  }

  const ajouterCustomExamen = () => {
    if (!customExamNom.trim()) return
    setExamensCommandes(p => [
      ...p, 
      { 
        id: Date.now(), 
        nom: customExamNom.trim(), 
        prix: parseInt(customExamPrix) || 0, 
        categorie: "Gynécologie personnalisée" 
      }
    ])
    setCustomExamNom("")
    setCustomExamPrix("")
  }

  const supprimerExamen = (id) => {
    setExamensCommandes(p => p.filter(e => e.id !== id))
  }

  const updateExamenPrix = (id, val) => {
    setExamensCommandes(p => p.map(e => e.id === id ? { ...e, prix: parseInt(val) || 0 } : e))
  }

  // Treatment row handlers
  const addTraitementRow = () => {
    setListTraitements(prev => [...prev, { id: Date.now(), medicament: "", posologie: "", duree: "" }])
  }

  const updateTraitementRow = (id, key, val) => {
    setListTraitements(prev => prev.map(t => t.id === id ? { ...t, [key]: val } : t))
  }

  const removeTraitementRow = (id) => {
    setListTraitements(prev => prev.filter(t => t.id !== id))
  }

  // Save/Submit consultation
  const handleSubmit = () => {
    if (!form.diagnostic_principal?.trim()) {
      alert("Le diagnostic principal est obligatoire.")
      return
    }

    // Compile dynamic treatments to standard treatments array
    const compiledTraitements = listTraitements.map(t => {
      let s = t.medicament.trim()
      if (!s) return null
      if (t.posologie.trim()) s += ` — ${t.posologie.trim()}`
      if (t.duree.trim()) s += ` (Pendant ${t.duree.trim()})`
      return s
    }).filter(Boolean)

    onSave({
      ...form,
      imc: calculerIMC(form.poids, form.taille),
      dpa: calculerDPA(form.ddr),
      age_gestationnel: calculerAgeGestationnel(form.ddr),
      examensCommandes,
      traitements: compiledTraitements,
      listTraitements, // preserve structured format for reloading
    })
  }

  const TABS = [
    { label: "Antécédents", icon: "👤" },
    { label: "Grossesse & Clinique", icon: "🤰" },
    { label: "CPN & Prévention", icon: "🛡️" },
    { label: "Examens & PTME", icon: "🔬" },
    { label: "Diagnostics & Traitements", icon: "📋" }
  ]

  const totalExFrais = examensCommandes.reduce((s, e) => s + (parseInt(e.prix) || 0), 0)

  return (
    <div style={{ maxHeight: "78vh", display: "flex", flexDirection: "column", overflow: "hidden" }}>
      {/* Title Header */}
      <div style={{ marginBottom: "16px", paddingBottom: "10px", borderBottom: `1px solid ${C_GYNECO.border}`, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <h3 style={{ fontSize: "16px", fontWeight: "700", color: C_GYNECO.secondary, marginBottom: "2px" }}>
            Consultation Gynécologique & Prénatale (CPN)
          </h3>
          <p style={{ fontSize: "12px", color: C.textMuted }}>
            Patiente : <strong>{patient?.nom || "—"}</strong> — ID: {patient?.pid || "—"} — {form.age ? `${form.age} ans` : ""}
          </p>
        </div>
      </div>

      {/* Modern Horizontal Tabs Bar */}
      <div style={{ display: "flex", borderBottom: `2px solid ${C.border}`, marginBottom: "16px", gap: "8px", overflowX: "auto", paddingBottom: "2px" }}>
        {TABS.map((tab, idx) => {
          const isActive = activeTab === idx
          return (
            <button
              key={idx}
              type="button"
              onClick={() => setActiveTab(idx)}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "6px",
                padding: "10px 16px",
                border: "none",
                background: isActive ? C_GYNECO.primarySoft : "transparent",
                color: isActive ? C_GYNECO.secondary : C.textMuted,
                borderBottom: isActive ? `3px solid ${C_GYNECO.primary}` : "3px solid transparent",
                fontWeight: isActive ? "750" : "550",
                fontSize: "12.5px",
                cursor: "pointer",
                borderRadius: "8px 8px 0 0",
                transition: "all 0.2s",
                whiteSpace: "nowrap"
              }}
            >
              <span>{tab.icon}</span>
              <span>{tab.label}</span>
            </button>
          )
        })}
      </div>

      {/* Tabs Content Container */}
      <div style={{ flex: 1, overflowY: "auto", paddingRight: "6px", paddingLeft: "2px", marginBottom: "16px" }}>

        {/* TAB 0: ADMINISTRATIVE INFO AND HISTORY */}
        {activeTab === 0 && (
          <div>
            {/* 1. Informations administratives */}
            <RegSection title="1. Informations administratives de la patiente">
              <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "12px", marginBottom: "16px" }}>
                <div>
                  <label style={labelSt}>Date consultation</label>
                  <input
                    type="date"
                    value={form.date_consultation || today()}
                    onChange={e => f("date_consultation", e.target.value)}
                    style={inputSt}
                  />
                </div>
                <div>
                  <label style={labelSt}>Nom et prénom</label>
                  <input
                    type="text"
                    value={form.nom}
                    onChange={e => f("nom", e.target.value)}
                    placeholder="Nom complet"
                    style={inputSt}
                  />
                </div>
                <div>
                  <label style={labelSt}>Âge</label>
                  <input
                    type="number"
                    value={form.age}
                    onChange={e => f("age", e.target.value)}
                    placeholder="Âge de la patiente"
                    style={inputSt}
                  />
                </div>
                <div>
                  <label style={labelSt}>Adresse</label>
                  <input
                    type="text"
                    value={form.adresse}
                    onChange={e => f("adresse", e.target.value)}
                    placeholder="Quartier, Secteur..."
                    style={inputSt}
                  />
                </div>
                <div>
                  <label style={labelSt}>Téléphone</label>
                  <input
                    type="text"
                    value={form.telephone}
                    onChange={e => f("telephone", e.target.value)}
                    placeholder="Numéro de téléphone"
                    style={inputSt}
                  />
                </div>
                <div>
                  <label style={labelSt}>Profession</label>
                  <input
                    type="text"
                    value={form.profession}
                    onChange={e => f("profession", e.target.value)}
                    placeholder="Profession"
                    style={inputSt}
                  />
                </div>
                <div style={{ gridColumn: "span 3" }}>
                  <label style={labelSt}>Personne à contacter en cas d'urgence (Nom, lien, Tél)</label>
                  <input
                    type="text"
                    value={form.personne_contact}
                    onChange={e => f("personne_contact", e.target.value)}
                    placeholder="Ex: M. Soumah (Époux) - 622 12 34 56"
                    style={inputSt}
                  />
                </div>
              </div>
            </RegSection>

            {/* 2. Antécédents */}
            <RegSection title="2. Antécédents généraux de la patiente">
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", marginBottom: "16px" }}>
                <div>
                  <label style={labelSt}>Antécédents médicaux</label>
                  <textarea
                    value={form.antecedents_medicaux}
                    onChange={e => f("antecedents_medicaux", e.target.value)}
                    placeholder="HTA, Diabète, Drépanocytose, etc."
                    rows={2}
                    style={inputSt}
                  />
                </div>
                <div>
                  <label style={labelSt}>Antécédents chirurgicaux</label>
                  <textarea
                    value={form.antecedents_chirurgicaux}
                    onChange={e => f("antecedents_chirurgicaux", e.target.value)}
                    placeholder="Chirurgies pelviennes, appendicectomie, etc."
                    rows={2}
                    style={inputSt}
                  />
                </div>
                <div>
                  <label style={labelSt}>Antécédents gynécologiques</label>
                  <textarea
                    value={form.antecedents_gyneco}
                    onChange={e => f("antecedents_gyneco", e.target.value)}
                    placeholder="Cycles menstruels, myomes, infections, etc."
                    rows={2}
                    style={inputSt}
                  />
                </div>
                <div>
                  <label style={labelSt}>Antécédents obstétricaux</label>
                  <textarea
                    value={form.antecedents_obstetricaux}
                    onChange={e => f("antecedents_obstetricaux", e.target.value)}
                    placeholder="Dystocies, fausses couches anciennes, etc."
                    rows={2}
                    style={inputSt}
                  />
                </div>
                <div>
                  <label style={labelSt}>Allergies connues</label>
                  <input
                    type="text"
                    value={form.allergies}
                    onChange={e => f("allergies", e.target.value)}
                    placeholder="Médicaments, aliments..."
                    style={inputSt}
                  />
                </div>
                <div>
                  <label style={labelSt}>Traitements en cours</label>
                  <input
                    type="text"
                    value={form.traitements_cours}
                    onChange={e => f("traitements_cours", e.target.value)}
                    placeholder="Molécules, posologie..."
                    style={inputSt}
                  />
                </div>
              </div>
            </RegSection>

            {/* 3. Historique obstétrical */}
            <RegSection title="3. Historique obstétrical (Général)">
              <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "10px" }}>
                <div>
                  <label style={labelSt}>Gestité (G)</label>
                  <input
                    type="text"
                    value={form.gestite}
                    onChange={e => f("gestite", e.target.value)}
                    placeholder="Ex: 3"
                    style={inputSt}
                  />
                </div>
                <div>
                  <label style={labelSt}>Parité (P)</label>
                  <input
                    type="text"
                    value={form.parite}
                    onChange={e => f("parite", e.target.value)}
                    placeholder="Ex: 2"
                    style={inputSt}
                  />
                </div>
                <div>
                  <label style={labelSt}>Avortements</label>
                  <input
                    type="text"
                    value={form.avortements}
                    onChange={e => f("avortements", e.target.value)}
                    placeholder="Ex: 1"
                    style={inputSt}
                  />
                </div>
                <div>
                  <label style={labelSt}>Enfants vivants</label>
                  <input
                    type="text"
                    value={form.enfants_vivants}
                    onChange={e => f("enfants_vivants", e.target.value)}
                    placeholder="Ex: 2"
                    style={inputSt}
                  />
                </div>
                <div>
                  <label style={labelSt}>Césariennes antérieures</label>
                  <input
                    type="text"
                    value={form.cesariennes_anterieures}
                    onChange={e => f("cesariennes_anterieures", e.target.value)}
                    placeholder="Ex: 1"
                    style={inputSt}
                  />
                </div>
                <div>
                  <label style={labelSt}>Mort-nés</label>
                  <input
                    type="text"
                    value={form.morts_nés}
                    onChange={e => f("morts_nés", e.target.value)}
                    placeholder="Ex: 0"
                    style={inputSt}
                  />
                </div>
                <div style={{ gridColumn: "span 2" }}>
                  <label style={labelSt}>Grossesses multiples</label>
                  <input
                    type="text"
                    value={form.grossesses_multiples}
                    onChange={e => f("grossesses_multiples", e.target.value)}
                    placeholder="Ex: Jumeaux en 2024"
                    style={inputSt}
                  />
                </div>
              </div>
            </RegSection>
          </div>
        )}

        {/* TAB 1: CURRENT PREGNANCY & CLINICAL EXAMS */}
        {activeTab === 1 && (
          <div>
            {/* 4. Données de grossesse actuelle */}
            <RegSection title="4. Données de grossesse actuelle">
              <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "12px", marginBottom: "16px" }}>
                <div>
                  <label style={labelSt}>DDR (Dernières Règles)</label>
                  <input
                    type="date"
                    value={form.ddr}
                    onChange={e => f("ddr", e.target.value)}
                    style={inputSt}
                  />
                </div>
                <div>
                  <label style={labelSt}>DPA (Accouchement Prévu)</label>
                  <input
                    type="date"
                    value={form.dpa}
                    disabled
                    style={{ ...inputSt, background: C.slateSoft, color: C.textSec, cursor: "not-allowed" }}
                  />
                  <small style={{ fontSize: "10.5px", color: C_GYNECO.secondary }}>Calculée auto (DDR + 280j)</small>
                </div>
                <div>
                  <label style={labelSt}>Âge gestationnel (SA)</label>
                  <input
                    type="text"
                    value={form.age_gestationnel}
                    disabled
                    style={{ ...inputSt, background: C.slateSoft, color: C.textSec, cursor: "not-allowed" }}
                  />
                  <small style={{ fontSize: "10.5px", color: C_GYNECO.secondary }}>Calculé auto depuis DDR</small>
                </div>
                <div>
                  <label style={labelSt}>Nombre de consultations CPN faites</label>
                  <input
                    type="number"
                    value={form.nb_consultations_prenatales}
                    onChange={e => f("nb_consultations_prenatales", e.target.value)}
                    placeholder="Ex: 2"
                    style={inputSt}
                  />
                </div>
                <div>
                  <label style={labelSt}>Grossesse à risque ?</label>
                  <select
                    value={form.grossesse_risque ? "oui" : "non"}
                    onChange={e => f("grossesse_risque", e.target.value === "oui")}
                    style={inputSt}
                  >
                    <option value="non">Non</option>
                    <option value="oui">Oui (Grossesse à Risque)</option>
                  </select>
                </div>
                <div>
                  <label style={labelSt}>Description du risque</label>
                  <input
                    type="text"
                    value={form.description_risque}
                    onChange={e => f("description_risque", e.target.value)}
                    placeholder="Ex: HTA, Placenta Praevia, etc."
                    disabled={!form.grossesse_risque}
                    style={{ ...inputSt, background: !form.grossesse_risque ? C.slateSoft : C.white }}
                  />
                </div>
              </div>
            </RegSection>

            {/* 5. Examen clinique */}
            <RegSection title="5. Examen clinique général">
              <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "12px", marginBottom: "16px" }}>
                <div>
                  <label style={labelSt}>Poids (kg)</label>
                  <input
                    type="number"
                    value={form.poids}
                    onChange={e => f("poids", e.target.value)}
                    placeholder="Ex: 65"
                    style={inputSt}
                  />
                </div>
                <div>
                  <label style={labelSt}>Taille (cm)</label>
                  <input
                    type="number"
                    value={form.taille}
                    onChange={e => f("taille", e.target.value)}
                    placeholder="Ex: 165"
                    style={inputSt}
                  />
                </div>
                <div>
                  <label style={labelSt}>IMC (Poids / Taille²)</label>
                  <input
                    type="text"
                    value={calculerIMC(form.poids, form.taille)}
                    disabled
                    style={{ ...inputSt, background: C.slateSoft, color: C.textSec, cursor: "not-allowed" }}
                  />
                </div>
                <div>
                  <label style={labelSt}>Température (°C)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={form.temperature}
                    onChange={e => f("temperature", e.target.value)}
                    placeholder="Ex: 37.2"
                    style={inputSt}
                  />
                </div>
                <div>
                  <label style={labelSt}>Tension artérielle (mmHg)</label>
                  <input
                    type="text"
                    value={form.tension}
                    onChange={e => f("tension", e.target.value)}
                    placeholder="Ex: 12/8"
                    style={inputSt}
                  />
                </div>
                <div>
                  <label style={labelSt}>Fréquence cardiaque (bpm)</label>
                  <input
                    type="number"
                    value={form.frequence_cardiaque}
                    onChange={e => f("frequence_cardiaque", e.target.value)}
                    placeholder="Ex: 80"
                    style={inputSt}
                  />
                </div>
                <div>
                  <label style={labelSt}>Œdèmes des membres inférieurs</label>
                  <select
                    value={form.œdèmes ? "oui" : "non"}
                    onChange={e => f("œdèmes", e.target.value === "oui")}
                    style={inputSt}
                  >
                    <option value="non">Absents</option>
                    <option value="oui">Présents (Signe du godet +)</option>
                  </select>
                </div>
                <div>
                  <label style={labelSt}>Conjonctives</label>
                  <select
                    value={form.conjonctives}
                    onChange={e => f("conjonctives", e.target.value)}
                    style={inputSt}
                  >
                    <option value="">— Sélectionner —</option>
                    <option value="Normales (rose)">Normales (rose)</option>
                    <option value="Pâles (anémie)">Pâles (suspecte anémie)</option>
                    <option value="Subictériques">Subictériques</option>
                    <option value="Ictériques">Ictériques</option>
                  </select>
                </div>
                <div>
                  <label style={labelSt}>État général de la patiente</label>
                  <input
                    type="text"
                    value={form.etat_general}
                    onChange={e => f("etat_general", e.target.value)}
                    placeholder="Bon, Altéré, Somnolente..."
                    style={inputSt}
                  />
                </div>
              </div>
            </RegSection>

            {/* 6. Examen obstétrical */}
            <RegSection title="6. Examen obstétrical (Grossesse)">
              <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "12px" }}>
                <div>
                  <label style={labelSt}>Hauteur utérine (cm)</label>
                  <input
                    type="number"
                    value={form.hauteur_uterine}
                    onChange={e => f("hauteur_uterine", e.target.value)}
                    placeholder="Ex: 28"
                    style={inputSt}
                  />
                </div>
                <div>
                  <label style={labelSt}>Présentation fœtale</label>
                  <select
                    value={form.presentation_fœtale}
                    onChange={e => f("presentation_fœtale", e.target.value)}
                    style={inputSt}
                  >
                    <option value="">— Sélectionner —</option>
                    {PRESENTATIONS_FŒTALES.map(p => (
                      <option key={p} value={p}>{p}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label style={labelSt}>Mouvements Actifs Fœtaux (MAF)</label>
                  <select
                    value={form.maf}
                    onChange={e => f("maf", e.target.value)}
                    style={inputSt}
                  >
                    <option value="">— Sélectionner —</option>
                    <option value="Perçus (Bonne vitalité)">Perçus (Bonne vitalité)</option>
                    <option value="Faibles / Diminués">Faibles / Diminués</option>
                    <option value="Non perçus">Non perçus (Urgence)</option>
                  </select>
                </div>
                <div>
                  <label style={labelSt}>Battements Cardiaques Fœtaux (BCF - bpm)</label>
                  <input
                    type="text"
                    value={form.bcf}
                    onChange={e => f("bcf", e.target.value)}
                    placeholder="Ex: 140 (ou inaudible)"
                    style={inputSt}
                  />
                </div>
                <div>
                  <label style={labelSt}>Nombre de fœtus</label>
                  <input
                    type="number"
                    value={form.nombre_fœtus}
                    onChange={e => f("nombre_fœtus", e.target.value)}
                    placeholder="Ex: 1"
                    style={inputSt}
                  />
                </div>
                <div>
                  <label style={labelSt}>Position du fœtus</label>
                  <input
                    type="text"
                    value={form.position_fœtus}
                    onChange={e => f("position_fœtus", e.target.value)}
                    placeholder="Dos à gauche, dos à droite..."
                    style={inputSt}
                  />
                </div>
                <div>
                  <label style={labelSt}>Col utérin (Examen au spéculum/TV)</label>
                  <input
                    type="text"
                    value={form.col_uterin}
                    onChange={e => f("col_uterin", e.target.value)}
                    placeholder="Long tonique fermé, perméable, etc."
                    style={inputSt}
                  />
                </div>
                <div>
                  <label style={labelSt}>Pertes vaginales / Leucorrhées</label>
                  <input
                    type="text"
                    value={form.pertes_vaginales}
                    onChange={e => f("pertes_vaginales", e.target.value)}
                    placeholder="Physiologiques, blanchâtres, suspectes..."
                    style={inputSt}
                  />
                </div>
                <div>
                  <label style={labelSt}>Liquide amniotique (Poche des eaux)</label>
                  <input
                    type="text"
                    value={form.liquide_amniotique}
                    onChange={e => f("liquide_amniotique", e.target.value)}
                    placeholder="Intacte, rupture franche (couleur)..."
                    style={inputSt}
                  />
                </div>
              </div>
            </RegSection>
          </div>
        )}

        {/* TAB 2: CPN FOLLOWUP & PREVENTION */}
        {activeTab === 2 && (
          <div>
            {/* 7. Suivi CPN */}
            <RegSection title="7. Calendrier de Suivi Prénatal (CPN)">
              <div style={{ background: "#fdf8ff", border: `1px solid ${C_GYNECO.border}`, borderRadius: "12px", padding: "16px", marginBottom: "16px" }}>
                <p style={{ fontSize: "12px", color: C.textSec, fontWeight: "650", marginBottom: "12px" }}>
                  Sélectionner les visites effectuées et renseigner leurs dates :
                </p>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                    <input
                      type="checkbox"
                      checked={form.cpn1}
                      onChange={e => f("cpn1", e.target.checked)}
                      id="cpn1_check"
                      style={{ transform: "scale(1.25)", accentColor: C_GYNECO.primary }}
                    />
                    <label htmlFor="cpn1_check" style={{ fontSize: "13px", fontWeight: "600", color: C.textPri, minWidth: "80px" }}>CPN 1</label>
                    <input
                      type="date"
                      value={form.date_cpn1}
                      onChange={e => f("date_cpn1", e.target.value)}
                      disabled={!form.cpn1}
                      style={{ ...inputSt, padding: "6px 10px", fontSize: "13px" }}
                    />
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                    <input
                      type="checkbox"
                      checked={form.cpn2}
                      onChange={e => f("cpn2", e.target.checked)}
                      id="cpn2_check"
                      style={{ transform: "scale(1.25)", accentColor: C_GYNECO.primary }}
                    />
                    <label htmlFor="cpn2_check" style={{ fontSize: "13px", fontWeight: "600", color: C.textPri, minWidth: "80px" }}>CPN 2</label>
                    <input
                      type="date"
                      value={form.date_cpn2}
                      onChange={e => f("date_cpn2", e.target.value)}
                      disabled={!form.cpn2}
                      style={{ ...inputSt, padding: "6px 10px", fontSize: "13px" }}
                    />
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                    <input
                      type="checkbox"
                      checked={form.cpn3}
                      onChange={e => f("cpn3", e.target.checked)}
                      id="cpn3_check"
                      style={{ transform: "scale(1.25)", accentColor: C_GYNECO.primary }}
                    />
                    <label htmlFor="cpn3_check" style={{ fontSize: "13px", fontWeight: "600", color: C.textPri, minWidth: "80px" }}>CPN 3</label>
                    <input
                      type="date"
                      value={form.date_cpn3}
                      onChange={e => f("date_cpn3", e.target.value)}
                      disabled={!form.cpn3}
                      style={{ ...inputSt, padding: "6px 10px", fontSize: "13px" }}
                    />
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                    <input
                      type="checkbox"
                      checked={form.cpn4}
                      onChange={e => f("cpn4", e.target.checked)}
                      id="cpn4_check"
                      style={{ transform: "scale(1.25)", accentColor: C_GYNECO.primary }}
                    />
                    <label htmlFor="cpn4_check" style={{ fontSize: "13px", fontWeight: "600", color: C.textPri, minWidth: "80px" }}>CPN 4</label>
                    <input
                      type="date"
                      value={form.date_cpn4}
                      onChange={e => f("date_cpn4", e.target.value)}
                      disabled={!form.cpn4}
                      style={{ ...inputSt, padding: "6px 10px", fontSize: "13px" }}
                    />
                  </div>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px", marginTop: "16px", borderTop: `1px dashed ${C_GYNECO.border}`, paddingTop: "14px" }}>
                  <label style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "12.5px", fontWeight: "600", color: C.textPri, cursor: "pointer" }}>
                    <input
                      type="checkbox"
                      checked={form.referée}
                      onChange={e => f("referée", e.target.checked)}
                      style={{ accentColor: C_GYNECO.primary, transform: "scale(1.15)" }}
                    />
                    Référée depuis un autre centre
                  </label>
                  <label style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "12.5px", fontWeight: "600", color: C.textPri, cursor: "pointer" }}>
                    <input
                      type="checkbox"
                      checked={form.risque_identifie}
                      onChange={e => f("risque_identifie", e.target.checked)}
                      style={{ accentColor: C_GYNECO.primary, transform: "scale(1.15)" }}
                    />
                    Risque identifié pendant le suivi
                  </label>
                </div>
              </div>
            </RegSection>

            {/* 8. Prévention paludisme */}
            <RegSection title="8. Prévention du paludisme (Maternité sans risque)">
              <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "12px", marginBottom: "16px" }}>
                <div style={{ border: `1.5px solid ${C.border}`, borderRadius: "10px", padding: "12px", background: C.white }}>
                  <p style={labelSt}>Sulfadoxine-Pyriméthamine (SP) - Doses TPI</p>
                  <div style={{ display: "flex", gap: "16px", marginTop: "8px" }}>
                    {["sp1", "sp2", "sp3", "sp4"].map((sp, idx) => (
                      <label key={sp} style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "12.5px", cursor: "pointer", fontWeight: "600" }}>
                        <input
                          type="checkbox"
                          checked={form[sp]}
                          onChange={e => f(sp, e.target.checked)}
                          style={{ accentColor: C_GYNECO.primary, transform: "scale(1.1)" }}
                        />
                        SP{idx + 1}
                      </label>
                    ))}
                  </div>
                </div>
                <div style={{ border: `1.5px solid ${C.border}`, borderRadius: "10px", padding: "12px", background: C.white, display: "flex", alignItems: "center" }}>
                  <label style={{ display: "flex", alignItems: "center", gap: "10px", fontSize: "13px", fontWeight: "650", color: C.textPri, cursor: "pointer" }}>
                    <input
                      type="checkbox"
                      checked={form.mild_distribuee}
                      onChange={e => f("mild_distribuee", e.target.checked)}
                      style={{ accentColor: C_GYNECO.primary, transform: "scale(1.3)" }}
                    />
                    Moustiquaire Imprégnée d'Insecticide (MILD) distribuée à la patiente
                  </label>
                </div>
              </div>
            </RegSection>

            {/* 9. Vaccination */}
            <RegSection title="9. Statut vaccinal antitétanique (VAT)">
              <div style={{ border: `1.5px solid ${C.border}`, borderRadius: "10px", padding: "12px", background: C.white }}>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px" }}>
                  <div>
                    <p style={labelSt}>Doses VAT reçues (cocher)</p>
                    <div style={{ display: "flex", gap: "14px", marginTop: "8px", flexWrap: "wrap" }}>
                      {["vat1", "vat2", "vat3", "vat4", "vat5"].map((vat, idx) => (
                        <label key={vat} style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "12.5px", cursor: "pointer", fontWeight: "600" }}>
                          <input
                            type="checkbox"
                            checked={form[vat]}
                            onChange={e => f(vat, e.target.checked)}
                            style={{ accentColor: C_GYNECO.primary, transform: "scale(1.1)" }}
                          />
                          VAT{idx + 1}
                        </label>
                      ))}
                    </div>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", borderLeft: `1px dashed ${C.border}`, paddingLeft: "20px" }}>
                    <label style={{ display: "flex", alignItems: "center", gap: "10px", fontSize: "13px", fontWeight: "650", color: C.textPri, cursor: "pointer" }}>
                      <input
                        type="checkbox"
                        checked={form.completement_vaccinee}
                        onChange={e => f("completement_vaccinee", e.target.checked)}
                        style={{ accentColor: C_GYNECO.primary, transform: "scale(1.3)" }}
                      />
                      Complètement vaccinée (Immunité antitétanique acquise)
                    </label>
                  </div>
                </div>
              </div>
            </RegSection>
          </div>
        )}

        {/* TAB 3: LAB TESTS & HIV TRANSMISSION PREVENTION (PTME) */}
        {activeTab === 3 && (
          <div>
            {/* 10. Dépistages biologiques */}
            <RegSection title="10. Dépistages biologiques & Examens complémentaires">
              <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "12px", marginBottom: "16px" }}>
                <div>
                  <label style={labelSt}>Dépistage VIH (Statut actuel)</label>
                  <select
                    value={form.vih}
                    onChange={e => f("vih", e.target.value)}
                    style={inputSt}
                  >
                    <option value="">— Choisir —</option>
                    {RESULTATS_DEPISTAGE.map(r => (
                      <option key={r} value={r}>{r}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label style={labelSt}>Dépistage Syphilis</label>
                  <select
                    value={form.syphilis}
                    onChange={e => f("syphilis", e.target.value)}
                    style={inputSt}
                  >
                    <option value="">— Choisir —</option>
                    {RESULTATS_DEPISTAGE.map(r => (
                      <option key={r} value={r}>{r}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label style={labelSt}>Dépistage Hépatite B (AgHBs)</label>
                  <select
                    value={form.hepatite_b}
                    onChange={e => f("hepatite_b", e.target.value)}
                    style={inputSt}
                  >
                    <option value="">— Choisir —</option>
                    {RESULTATS_DEPISTAGE.map(r => (
                      <option key={r} value={r}>{r}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label style={labelSt}>Groupe sanguin</label>
                  <select
                    value={form.groupe_sanguin}
                    onChange={e => f("groupe_sanguin", e.target.value)}
                    style={inputSt}
                  >
                    <option value="">— Choisir —</option>
                    {GROUPES_SANGUINS.map(g => (
                      <option key={g} value={g}>{g}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label style={labelSt}>Facteur Rhésus</label>
                  <select
                    value={form.rhesus}
                    onChange={e => f("rhesus", e.target.value)}
                    style={inputSt}
                  >
                    <option value="">— Choisir —</option>
                    {RHESUS.map(r => (
                      <option key={r} value={r}>{r}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label style={labelSt}>Glycémie à jeun (g/L)</label>
                  <input
                    type="text"
                    value={form.glycemie}
                    onChange={e => f("glycemie", e.target.value)}
                    placeholder="Ex: 0.95"
                    style={inputSt}
                  />
                </div>
                <div>
                  <label style={labelSt}>NFS (Hémoglobine g/dl)</label>
                  <input
                    type="text"
                    value={form.nfs}
                    onChange={e => f("nfs", e.target.value)}
                    placeholder="Ex: 11.5"
                    style={inputSt}
                  />
                </div>
                <div>
                  <label style={labelSt}>ECBU (Examen des urines)</label>
                  <input
                    type="text"
                    value={form.ecbu}
                    onChange={e => f("ecbu", e.target.value)}
                    placeholder="Ex: Négatif (ou leucocyturie...)"
                    style={inputSt}
                  />
                </div>
                <div>
                  <label style={labelSt}>Autres bilans biologiques</label>
                  <input
                    type="text"
                    value={form.autres_examens}
                    onChange={e => f("autres_examens", e.target.value)}
                    placeholder="Ex: Albuminurie bandelette..."
                    style={inputSt}
                  />
                </div>
              </div>

              {/* INTEGRATED GYNECOLOGICAL EXAM PRESCRIBER */}
              <div style={{ border: `1.5px solid ${C_GYNECO.border}`, borderRadius: "14px", overflow: "hidden", background: C.white, marginBottom: "16px" }}>
                <div style={{ padding: "12px 16px", background: C_GYNECO.primarySoft, borderBottom: `1.5px solid ${C_GYNECO.border}`, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div>
                    <p style={{ fontSize: "13.5px", fontWeight: "750", color: C_GYNECO.secondary }}>Prescription d'Examens Complémentaires (Labo & Échographie)</p>
                    <p style={{ fontSize: "11px", color: C.textMuted }}>
                      {examensCommandes.length === 0 ? "Aucun examen prescrit" : `${examensCommandes.length} examen(s) commandé(s) — Total : ${totalExFrais.toLocaleString("fr-FR")} GNF`}
                    </p>
                  </div>
                </div>

                <div style={{ padding: "16px" }}>
                  <div style={{ display: "flex", gap: "10px", marginBottom: "12px" }}>
                    <select
                      value={selectedExCategory}
                      onChange={e => setSelectedExCategory(e.target.value)}
                      style={{ ...inputSt, width: "220px", fontSize: "12.5px", padding: "8px 12px" }}
                    >
                      {Object.keys(EXAMENS_GYNECO).map(cat => (
                        <option key={cat} value={cat}>{cat}</option>
                      ))}
                    </select>
                  </div>

                  <div style={{ display: "flex", flexWrap: "wrap", gap: "6px", marginBottom: "14px", maxHeight: "150px", overflowY: "auto", border: `1px solid ${C.border}`, padding: "10px", borderRadius: "10px", background: C.bg }}>
                    {EXAMENS_GYNECO[selectedExCategory]?.map(exName => {
                      const alreadySelected = examensCommandes.find(e => e.nom === exName)
                      const price = getExamPrice(exName)
                      return (
                        <button
                          key={exName}
                          type="button"
                          onClick={() => ajouterExamen(exName, selectedExCategory)}
                          disabled={!!alreadySelected}
                          style={{
                            padding: "6px 12px",
                            background: alreadySelected ? C.greenSoft : C.white,
                            color: alreadySelected ? C.green : C.textPri,
                            border: `1px solid ${alreadySelected ? C.green : C.border}`,
                            borderRadius: "20px",
                            fontSize: "11.5px",
                            fontWeight: "600",
                            cursor: alreadySelected ? "default" : "pointer",
                            opacity: alreadySelected ? 0.7 : 1,
                            transition: "all 0.15s",
                            display: "flex",
                            alignItems: "center"
                          }}
                        >
                          {alreadySelected && "✓ "}
                          {exName} {price > 0 ? `(${price.toLocaleString()} GNF)` : ""}
                        </button>
                      )
                    })}
                  </div>

                  <div style={{ borderTop: `1px dashed ${C.border}`, paddingTop: "12px" }}>
                    <p style={{ fontSize: "11px", fontWeight: "700", color: C.textMuted, marginBottom: "8px", textTransform: "uppercase" }}>Examen personnalisé ou externe</p>
                    <div style={{ display: "flex", gap: "8px" }}>
                      <input
                        value={customExamNom}
                        onChange={e => setCustomExamNom(e.target.value)}
                        placeholder="Nom de l'examen"
                        style={{ ...inputSt, flex: 2, padding: "8px 12px", fontSize: "12.5px" }}
                      />
                      <input
                        value={customExamPrix}
                        onChange={e => setCustomExamPrix(e.target.value)}
                        placeholder="Prix (GNF)"
                        type="number"
                        min="0"
                        style={{ ...inputSt, flex: 1, padding: "8px 12px", fontSize: "12.5px" }}
                      />
                      <Btn onClick={ajouterCustomExamen} variant="primary" small>
                        + Prescrire
                      </Btn>
                    </div>
                  </div>

                  {/* List of ordered exams */}
                  {examensCommandes.length > 0 && (
                    <div style={{ marginTop: "16px", background: "#fcfcff", border: `1.5px solid ${C_GYNECO.border}`, borderRadius: "10px", padding: "12px" }}>
                      <p style={{ fontSize: "12px", fontWeight: "700", color: C_GYNECO.secondary, marginBottom: "10px" }}>Liste des examens demandés dans cette consultation :</p>
                      <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                        {examensCommandes.map(ex => (
                          <div key={ex.id} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", background: C.white, border: `1px solid ${C.border}`, borderRadius: "8px", padding: "6px 12px" }}>
                            <div>
                              <p style={{ fontSize: "12.5px", fontWeight: "650", color: C.textPri }}>{ex.nom}</p>
                              <span style={{ fontSize: "9.5px", color: C_GYNECO.secondary, background: C_GYNECO.primarySoft, padding: "1px 6px", borderRadius: "10px", fontWeight: "700" }}>{ex.categorie}</span>
                            </div>
                            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                              <input
                                type="number"
                                value={ex.prix}
                                onChange={e => updateExamenPrix(ex.id, e.target.value)}
                                style={{ width: "100px", padding: "4px 8px", fontSize: "12px", textAlign: "right", borderRadius: "6px", border: `1px solid ${C.border}` }}
                              />
                              <span style={{ fontSize: "11px", color: C.textMuted }}>GNF</span>
                              <button
                                type="button"
                                onClick={() => supprimerExamen(ex.id)}
                                style={{ background: C.redSoft, color: C.red, border: `1px solid ${C.red}33`, borderRadius: "6px", width: "24px", height: "24px", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}
                              >
                                ×
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </RegSection>

            {/* 11. PTME */}
            <RegSection title="11. Prévention de la Transmission Mère-Enfant (PTME)">
              <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "12px" }}>
                <div style={{ display: "flex", alignItems: "center" }}>
                  <label style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "12.5px", fontWeight: "600", color: C.textPri, cursor: "pointer" }}>
                    <input
                      type="checkbox"
                      checked={form.statut_vih_connu}
                      onChange={e => f("statut_vih_connu", e.target.checked)}
                      style={{ accentColor: C_GYNECO.primary, transform: "scale(1.1)" }}
                    />
                    Statut VIH antérieur connu ?
                  </label>
                </div>
                <div style={{ display: "flex", alignItems: "center" }}>
                  <label style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "12.5px", fontWeight: "600", color: C.textPri, cursor: "pointer" }}>
                    <input
                      type="checkbox"
                      checked={form.conseillee_vih}
                      onChange={e => f("conseillee_vih", e.target.checked)}
                      style={{ accentColor: C_GYNECO.primary, transform: "scale(1.1)" }}
                    />
                    Conseillée VIH pré-test ?
                  </label>
                </div>
                <div style={{ display: "flex", alignItems: "center" }}>
                  <label style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "12.5px", fontWeight: "600", color: C.textPri, cursor: "pointer" }}>
                    <input
                      type="checkbox"
                      checked={form.testee_vih}
                      onChange={e => f("testee_vih", e.target.checked)}
                      style={{ accentColor: C_GYNECO.primary, transform: "scale(1.1)" }}
                    />
                    Testée VIH aujourd'hui ?
                  </label>
                </div>

                <div>
                  <label style={labelSt}>Résultat test VIH patiente</label>
                  <select
                    value={form.resultat_vih}
                    onChange={e => f("resultat_vih", e.target.value)}
                    style={inputSt}
                  >
                    <option value="">— Choisir —</option>
                    <option value="Négatif">Négatif</option>
                    <option value="Positif">Positif (Déclenchement protocole)</option>
                    <option value="Non fait / En attente">Non fait / En attente</option>
                  </select>
                </div>
                <div style={{ display: "flex", alignItems: "center" }}>
                  <label style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "12.5px", fontWeight: "600", color: C.textPri, cursor: "pointer" }}>
                    <input
                      type="checkbox"
                      checked={form.post_test}
                      onChange={e => f("post_test", e.target.checked)}
                      style={{ accentColor: C_GYNECO.primary, transform: "scale(1.1)" }}
                    />
                    Conseils Post-test prodigués ?
                  </label>
                </div>
                <div>
                  <label style={labelSt}>Taux de CD4 (si séropositive)</label>
                  <input
                    type="text"
                    value={form.cd4}
                    onChange={e => f("cd4", e.target.value)}
                    placeholder="Ex: 450 cellules/µL"
                    style={inputSt}
                  />
                </div>

                <div style={{ gridColumn: "span 3", borderTop: `1px dashed ${C.border}`, paddingTop: "12px", display: "flex", gap: "24px" }}>
                  <label style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "12.5px", fontWeight: "600", color: C.textPri, cursor: "pointer" }}>
                    <input
                      type="checkbox"
                      checked={form.azt}
                      onChange={e => f("azt", e.target.checked)}
                      style={{ accentColor: C_GYNECO.primary, transform: "scale(1.1)" }}
                    />
                    Prophylaxie AZT (Mère)
                  </label>
                  <label style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "12.5px", fontWeight: "600", color: C.textPri, cursor: "pointer" }}>
                    <input
                      type="checkbox"
                      checked={form.ctx}
                      onChange={e => f("ctx", e.target.checked)}
                      style={{ accentColor: C_GYNECO.primary, transform: "scale(1.1)" }}
                    />
                    Cotrimoxazole (CTX)
                  </label>
                  <label style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "12.5px", fontWeight: "600", color: C.textPri, cursor: "pointer" }}>
                    <input
                      type="checkbox"
                      checked={form.tarv}
                      onChange={e => f("tarv", e.target.checked)}
                      style={{ accentColor: C_GYNECO.primary, transform: "scale(1.1)" }}
                    />
                    Traitement ARV (TARV initié/poursuivi)
                  </label>
                </div>

                <div style={{ gridColumn: "span 3", borderTop: `1px dashed ${C.border}`, paddingTop: "12px", display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                  <div style={{ display: "flex", alignItems: "center" }}>
                    <label style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "12.5px", fontWeight: "600", color: C.textPri, cursor: "pointer" }}>
                      <input
                        type="checkbox"
                        checked={form.partenaire_teste_vih}
                        onChange={e => f("partenaire_teste_vih", e.target.checked)}
                        style={{ accentColor: C_GYNECO.primary, transform: "scale(1.1)" }}
                      />
                      Partenaire testé pour le VIH ?
                    </label>
                  </div>
                  <div>
                    <label style={labelSt}>Résultat VIH partenaire</label>
                    <select
                      value={form.resultat_vih_partenaire}
                      onChange={e => f("resultat_vih_partenaire", e.target.value)}
                      disabled={!form.partenaire_teste_vih}
                      style={inputSt}
                    >
                      <option value="">— Choisir —</option>
                      <option value="Négatif">Négatif</option>
                      <option value="Positif">Positif</option>
                      <option value="Inconnu">Inconnu / Non fait</option>
                    </select>
                  </div>
                </div>
              </div>
            </RegSection>
          </div>
        )}

        {/* TAB 4: DIAGNOSTIC, TREATMENT, REFERRAL & CONCLUSION */}
        {activeTab === 4 && (
          <div>
            {/* 12. Diagnostic */}
            <RegSection title="12. Diagnostics cliniques">
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", marginBottom: "16px" }}>
                <div style={{ gridColumn: "span 2" }}>
                  <label style={labelSt}>Diagnostic principal <span style={{ color: C.red }}>*</span></label>
                  <input
                    type="text"
                    value={form.diagnostic_principal}
                    onChange={e => f("diagnostic_principal", e.target.value)}
                    placeholder="Ex: Grossesse normale monofoetale de 24 SA (ou Fibrome utérin...)"
                    style={inputSt}
                  />
                </div>
                <div>
                  <label style={labelSt}>Diagnostics associés / Co-morbidités</label>
                  <input
                    type="text"
                    value={form.diagnostics_associes}
                    onChange={e => f("diagnostics_associes", e.target.value)}
                    placeholder="HTA gravidique, Candidose vaginale..."
                    style={inputSt}
                  />
                </div>
                <div>
                  <label style={labelSt}>Niveau de gravité clinique</label>
                  <select
                    value={form.niveau_gravite}
                    onChange={e => f("niveau_gravite", e.target.value)}
                    style={inputSt}
                  >
                    <option value="">— Sélectionner —</option>
                    {NIVEAUX_GRAVITE.map(n => (
                      <option key={n} value={n}>{n}</option>
                    ))}
                  </select>
                </div>
              </div>
            </RegSection>

            {/* 13. Traitement (Structured & Dynamic) */}
            <RegSection title="13. Traitements prescrits (Ordonnances)">
              <div style={{ border: `1.5px solid ${C_GYNECO.border}`, borderRadius: "12px", padding: "16px", background: C.white, marginBottom: "16px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
                  <p style={{ fontSize: "12px", fontWeight: "700", color: C.textPri, margin: 0 }}>Médicaments ordonnés</p>
                  <Btn onClick={addTraitementRow} variant="secondary" small>
                    + Ajouter une ligne
                  </Btn>
                </div>

                {listTraitements.length === 0 ? (
                  <p style={{ fontSize: "12px", color: C.textMuted, fontStyle: "italic", textAlign: "center", padding: "10px" }}>Aucune ligne d'ordonnance saisie. Cliquez pour ajouter.</p>
                ) : (
                  <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                    {listTraitements.map((row, idx) => (
                      <div key={row.id} style={{ display: "flex", gap: "8px", alignItems: "center" }}>
                        <span style={{ fontSize: "11px", fontWeight: "700", color: C_GYNECO.secondary, width: "20px" }}>{idx + 1}.</span>
                        <input
                          value={row.medicament}
                          onChange={e => updateTraitementRow(row.id, "medicament", e.target.value)}
                          placeholder="Nom du médicament (ex: Spasfon 80mg)"
                          style={{ ...inputSt, flex: 2, padding: "8px 12px", fontSize: "12.5px" }}
                        />
                        <input
                          value={row.posologie}
                          onChange={e => updateTraitementRow(row.id, "posologie", e.target.value)}
                          placeholder="Posologie (ex: 1 cp 3x/jour)"
                          style={{ ...inputSt, flex: 1.5, padding: "8px 12px", fontSize: "12.5px" }}
                        />
                        <input
                          value={row.duree}
                          onChange={e => updateTraitementRow(row.id, "duree", e.target.value)}
                          placeholder="Durée (ex: 5 jours)"
                          style={{ ...inputSt, flex: 1, padding: "8px 12px", fontSize: "12.5px" }}
                        />
                        <button
                          type="button"
                          onClick={() => removeTraitementRow(row.id)}
                          style={{ background: C.redSoft, color: C.red, border: `1px solid ${C.red}33`, borderRadius: "6px", width: "28px", height: "28px", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                <div style={{ marginTop: "14px", borderTop: `1px dashed ${C_GYNECO.border}`, paddingTop: "12px" }}>
                  <label style={labelSt}>Conseils généraux d'hygiène et diététiques / Recommandations</label>
                  <textarea
                    value={form.conseils}
                    onChange={e => f("conseils", e.target.value)}
                    placeholder="Régime sans sel, repos strict, signes d'alarme motivant une consultation urgente..."
                    rows={2}
                    style={inputSt}
                  />
                </div>
              </div>
            </RegSection>

            {/* 14. Référence */}
            <RegSection title="14. Référence vers structure spécialisée">
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", marginBottom: "16px", border: `1px solid ${C.border}`, borderRadius: "10px", padding: "12px", background: "#fffdfa" }}>
                <div style={{ gridColumn: "span 2" }}>
                  <label style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "12.5px", fontWeight: "600", color: C.textPri, cursor: "pointer", marginBottom: "10px" }}>
                    <input
                      type="checkbox"
                      checked={form.referée_autre_service}
                      onChange={e => f("referée_autre_service", e.target.checked)}
                      style={{ accentColor: C_GYNECO.primary, transform: "scale(1.1)" }}
                    />
                    Référer la patiente vers un autre service ou établissement ?
                  </label>
                </div>
                <div>
                  <label style={labelSt}>Motif de la référence</label>
                  <input
                    type="text"
                    value={form.motif_reference}
                    onChange={e => f("motif_reference", e.target.value)}
                    placeholder="Ex: Menace d'accouchement prématuré sévère"
                    disabled={!form.referée_autre_service}
                    style={{ ...inputSt, background: !form.referée_autre_service ? C.slateSoft : C.white }}
                  />
                </div>
                <div>
                  <label style={labelSt}>Structure sanitaire de référence</label>
                  <input
                    type="text"
                    value={form.structure_reference}
                    onChange={e => f("structure_reference", e.target.value)}
                    placeholder="Ex: Hôpital National Ignace Deen"
                    disabled={!form.referée_autre_service}
                    style={{ ...inputSt, background: !form.referée_autre_service ? C.slateSoft : C.white }}
                  />
                </div>
              </div>
            </RegSection>

            {/* 15. Conclusion */}
            <RegSection title="15. Conclusion clinique & Suivi">
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                <div style={{ display: "flex", alignItems: "center" }}>
                  <label style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "13px", fontWeight: "650", color: C.textPri, cursor: "pointer" }}>
                    <input
                      type="checkbox"
                      checked={form.anemie}
                      onChange={e => f("anemie", e.target.checked)}
                      style={{ accentColor: C_GYNECO.primary, transform: "scale(1.2)" }}
                    />
                    Anémie clinique suspectée (Pâleur)
                  </label>
                </div>
                <div>
                  <label style={labelSt}>Date du prochain rendez-vous / CPN</label>
                  <input
                    type="date"
                    value={form.prochain_rdv}
                    onChange={e => f("prochain_rdv", e.target.value)}
                    style={inputSt}
                  />
                </div>
                <div>
                  <label style={labelSt}>Constats majeurs / Problèmes identifiés</label>
                  <textarea
                    value={form.constats_problemes}
                    onChange={e => f("constats_problemes", e.target.value)}
                    placeholder="Principales complications ou alertes..."
                    rows={2}
                    style={inputSt}
                  />
                </div>
                <div>
                  <label style={labelSt}>Observations libres / Notes cliniques</label>
                  <textarea
                    value={form.observations}
                    onChange={e => f("observations", e.target.value)}
                    placeholder="Détails additionnels du suivi..."
                    rows={2}
                    style={inputSt}
                  />
                </div>
              </div>
            </RegSection>
          </div>
        )}

      </div>

      {/* Modern Footer Actions */}
      <div style={{ display: "flex", gap: "12px", justifyContent: "flex-end", borderTop: `1px solid ${C.border}`, paddingTop: "14px", marginTop: "4px" }}>
        <Btn onClick={onCancel} variant="secondary">
          Annuler
        </Btn>
        <Btn onClick={handleSubmit} variant="success">
          Enregistrer la Consultation
        </Btn>
      </div>
    </div>
  )
}
