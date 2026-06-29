import { useState, useEffect, useCallback } from "react"
import { useSharedData } from "../../../hooks/useSharedData"
import { C, Btn, inputSt, labelSt } from "./shared.jsx"

const ACTES_URGENCES = [
  { nom: "Pose de voie veineuse périphérique", prix: 15000 },
  { nom: "Suture de plaie / Parage", prix: 15000 },
  { nom: "Pansement chirurgical", prix: 15000 },
  { nom: "Oxygénothérapie (par heure)", prix: 15000 },
  { nom: "Sondage urinaire", prix: 15000 },
  { nom: "Intubation endotrachéale", prix: 15000 },
  { nom: "Aérosolthérapie / Nébulisation", prix: 15000 }
]

const MEDICAMENTS_COMMUNS = [
  { nom: "Adrénaline 1mg/ml (Ampoule)", prix: 12000 },
  { nom: "Diclofénac 75mg/3ml (Injectable)", prix: 8000 },
  { nom: "Spasfon (Injectable)", prix: 10000 },
  { nom: "Sérum salé 0.9% 500ml", prix: 15000 },
  { nom: "Sérum glucosé 5% 500ml", prix: 15000 },
  { nom: "Paracétamol injectable 1g", prix: 12000 },
  { nom: "Furosémide 20mg/2ml (Ampoule)", prix: 9000 }
]

const CONSOMMABLES_COMMUNS = [
  { nom: "Cathéter intraveineux (G18/G20)", prix: 5000 },
  { nom: "Seringue stérile 5ml / 10ml", prix: 2000 },
  { nom: "Gants stériles (paire)", prix: 4000 },
  { nom: "Perfuseur avec régulateur", prix: 6000 },
  { nom: "Compresse stérile (paquet)", prix: 3000 },
  { nom: "Bande de gaze élastique", prix: 5000 }
]

const EXAMENS_URGENTS = [
  "NFS (Hémogramme)",
  "Groupage sanguin / Rhésus",
  "Glycémie capillaire (rapide)",
  "Urée / Créatinine",
  "Échographie obstétricale / abdominale d'urgence",
  "ECG (Électrocardiogramme)",
  "HCG qualitatif (Test de grossesse)"
]

export default function PageUrgencesTriage() {
  const { patients, creerPriseEnChargeUrgence, chargerConfigUrgences, rafraichir, apiFetch } = useSharedData()

  const [config, setConfig] = useState({ regle_paiement_urgences: "soigner_d_abord" })
  const [patientRecherche, setPatientRecherche] = useState("")
  const [patientSelectionne, setPatientSelectionne] = useState(null)

  // Form states
  const [constantes, setConstantes] = useState({ ta: "", fc: "", temp: "", poids: "", fr: "" })
  const [obs, setObs] = useState("")
  const [soinsSelectionnes, setSoinsSelectionnes] = useState([])
  const [meds, setMeds] = useState([]) // array of { nom, quantite, prix }
  const [consos, setConsos] = useState([]) // array of { nom, quantite, prix }
  const [examensSelectionnes, setExamensSelectionnes] = useState([])

  const [saving, setSaving] = useState(false)
  const [urgenceId, setUrgenceId] = useState(null)
  const [isSigned, setIsSigned] = useState(false)

  // Fetch config
  useEffect(() => {
    chargerConfigUrgences().then(setConfig).catch(console.error)
  }, [chargerConfigUrgences])

  // Filter patients based on query
  const patientsFiltres = patientRecherche.trim() === ""
    ? []
    : patients.filter(p => p.nom.toLowerCase().includes(patientRecherche.toLowerCase()) || (p.pid && p.pid.includes(patientRecherche)))

  // Calculate live total
  const baseFee = 10000
  const actsFee = soinsSelectionnes.length * 15000
  const medsFee = meds.reduce((sum, item) => sum + (parseInt(item.quantite || 0) * parseInt(item.prix || 0)), 0)
  const consosFee = consos.reduce((sum, item) => sum + (parseInt(item.quantite || 0) * parseInt(item.prix || 0)), 0)
  const totalFacture = baseFee + actsFee + medsFee + consosFee

  const toggleSoin = (nom) => {
    setSoinsSelectionnes(p => p.includes(nom) ? p.filter(x => x !== nom) : [...p, nom])
  }

  const toggleExamen = (nom) => {
    setExamensSelectionnes(prev => {
      const exist = prev.find(e => e.nom === nom)
      if (exist) {
        return prev.filter(e => e.nom !== nom)
      }
      return [...prev, { nom, prix: 0 }]
    })
  }

  const updateExamenPrice = (nom, price) => {
    setExamensSelectionnes(prev => prev.map(e => e.nom === nom ? { ...e, prix: Math.max(0, parseInt(price) || 0) } : e))
  }

  const updateMedPrice = (nom, price) => {
    setMeds(prev => prev.map(m => m.nom === nom ? { ...m, prix: Math.max(0, parseInt(price) || 0) } : m))
  }

  const addMed = (med) => {
    setMeds(prev => {
      const exist = prev.find(m => m.nom === med.nom)
      if (exist) {
        return prev.map(m => m.nom === med.nom ? { ...m, quantite: m.quantite + 1 } : m)
      }
      return [...prev, { nom: med.nom, quantite: 1, prix: med.prix }]
    })
  }

  const updateMedQty = (nom, qty) => {
    setMeds(prev => prev.map(m => m.nom === nom ? { ...m, quantite: Math.max(1, parseInt(qty) || 1) } : m))
  }

  const removeMed = (nom) => {
    setMeds(prev => prev.filter(m => m.nom !== nom))
  }

  const addConso = (conso) => {
    setConsos(prev => {
      const exist = prev.find(c => c.nom === conso.nom)
      if (exist) {
        return prev.map(c => c.nom === conso.nom ? { ...c, quantite: c.quantite + 1 } : c)
      }
      return [...prev, { nom: conso.nom, quantite: 1, prix: conso.prix }]
    })
  }

  const updateConsoQty = (nom, qty) => {
    setConsos(prev => prev.map(c => c.nom === nom ? { ...c, quantite: Math.max(1, parseInt(qty) || 1) } : c))
  }

  const removeConso = (nom) => {
    setConsos(prev => prev.filter(c => c.nom !== nom))
  }

  // Load draft when patient is selected
  useEffect(() => {
    if (!patientSelectionne) {
      setConstantes({ ta: "", fc: "", temp: "", poids: "", fr: "" })
      setObs("")
      setSoinsSelectionnes([])
      setMeds([])
      setConsos([])
      setExamensSelectionnes([])
      setUrgenceId(null)
      setIsSigned(false)
      return
    }

    const loadDraft = async () => {
      try {
        const res = await apiFetch(`/api/urgences/patient/${patientSelectionne.id}`)
        if (res.success && res.urgences && res.urgences.length > 0) {
          const latest = res.urgences[0]
          const isToday = new Date(latest.created_at).toDateString() === new Date().toDateString()
          if (isToday && !latest.signe) {
            setUrgenceId(latest.id)
            setIsSigned(false)
            setConstantes({
              ta: latest.constantes_vitales?.ta || "",
              fc: latest.constantes_vitales?.fc || "",
              temp: latest.constantes_vitales?.temp || "",
              poids: latest.constantes_vitales?.poids || "",
              fr: latest.constantes_vitales?.fr || ""
            })
            setObs(latest.observations_initiales || "")
            setSoinsSelectionnes(latest.soins_administres || [])
            setMeds(latest.medicaments_urgence || [])
            setConsos(latest.consommables_utilises || [])
            setExamensSelectionnes(latest.examens_avec_prix || (latest.examens_urgents_commandes || []).map(ex => ({ nom: ex, prix: 0 })))
            return
          }
        }
      } catch (err) {
        console.error("Erreur lors du chargement du brouillon urgence:", err)
      }
      setUrgenceId(null)
      setIsSigned(false)
    }

    loadDraft()
  }, [patientSelectionne, apiFetch])

  const handleSaveAction = async (signerVal) => {
    if (!patientSelectionne) {
      alert("Veuillez sélectionner un patient.")
      return
    }
    if (!obs.trim()) {
      alert("Veuillez saisir les observations initiales de l'urgence.")
      return
    }

    setSaving(true)
    try {
      const payload = {
        patient_id: patientSelectionne.id,
        constantes_vitales: constantes,
        observations_initiales: obs,
        soins_administres: soinsSelectionnes,
        medicaments_urgence: meds,
        consommables_utilises: consos,
        examens_urgents_commandes: examensSelectionnes,
        signe: signerVal
      }

      if (urgenceId) {
        payload.id = urgenceId
      }

      const res = await creerPriseEnChargeUrgence(payload)
      
      if (signerVal) {
        alert("Prise en charge d'urgence signée et validée!")
      } else {
        alert("Prise en charge d'urgence enregistrée (brouillon).")
      }

      // Reset form
      setPatientSelectionne(null)
      setPatientRecherche("")
      setConstantes({ ta: "", fc: "", temp: "", poids: "", fr: "" })
      setObs("")
      setSoinsSelectionnes([])
      setMeds([])
      setConsos([])
      setExamensSelectionnes([])
      setUrgenceId(null)
      setIsSigned(false)
      if (rafraichir) await rafraichir()
    } catch (err) {
      alert("Erreur lors de l'enregistrement: " + err.message)
    } finally {
      setSaving(false)
    }
  }

  const handlePrint = () => {
    if (!patientSelectionne) return
    const date = new Date().toLocaleDateString("fr-FR")
    const dateNaissStr = patientSelectionne.dateNaissance
      ? new Date(patientSelectionne.dateNaissance).toLocaleDateString("fr-FR")
      : "—"
    const age = patientSelectionne.dateNaissance 
      ? new Date().getFullYear() - new Date(patientSelectionne.dateNaissance).getFullYear()
      : "—"

    const w = window.open("", "_blank", "width=750,height=980")
    w.document.write(`<!DOCTYPE html><html><head><meta charset="utf-8">
<title>Fiche de Triage &amp; Soins d'Urgence — ${patientSelectionne.nom}</title>
<style>
  *{box-sizing:border-box}
  body{font-family:'Segoe UI',sans-serif;margin:0;padding:36px 40px;color:#1e293b;font-size:12px;line-height:1.5}
  .header{display:flex;justify-content:space-between;align-items:flex-start;border-bottom:3px solid #ef4444;padding-bottom:14px;margin-bottom:20px}
  .title{font-size:20px;font-weight:800;color:#ef4444;margin:0 0 3px}
  .sub{font-size:11px;color:#64748b;margin:2px 0}
  .hdate{text-align:right;font-size:12px;color:#334155}
  .hdate strong{font-size:14px;display:block;margin-bottom:2px;color:#ef4444}
  .doc-title{font-size:15px;font-weight:800;text-align:center;letter-spacing:.04em;margin:0 0 18px;text-transform:uppercase;color:#0f172a}
  
  .patient-box{border:1.5px solid #ef444433;border-radius:8px;overflow:hidden;margin-bottom:20px}
  .patient-box-header{background:#fef2f2;padding:6px 14px;font-size:10px;font-weight:800;text-transform:uppercase;letter-spacing:.06em;color:#ef4444;border-bottom:1px solid #ef444422}
  .patient-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:0}
  .pi-item{padding:8px 14px;border-right:1px solid #f1f5f9}
  .pi-item:last-child{border-right:none}
  .pi-label{font-size:9px;font-weight:700;text-transform:uppercase;letter-spacing:.06em;color:#94a3b8;margin-bottom:3px}
  .pi-value{font-size:12px;font-weight:700;color:#1e293b}
  
  .grid-2{display:grid;grid-template-columns:1fr 1fr;gap:16px;margin-bottom:16px}
  .section{margin-bottom:16px;background:#fafafa;border:1px solid #e2e8f0;border-radius:8px;padding:12px 14px}
  .sec-label{font-size:10px;font-weight:800;text-transform:uppercase;letter-spacing:.06em;color:#ef4444;margin-bottom:6px;border-bottom:1px solid #f1f5f9;padding-bottom:4px}
  .sec-value{font-size:12px;color:#334155;line-height:1.5}
  
  .param-grid{display:grid;grid-template-columns:repeat(5,1fr);gap:6px}
  .param-item{background:#fff;border:1px solid #e2e8f0;border-radius:6px;padding:6px;text-align:center}
  
  .table-box{width:100%;border-collapse:collapse;margin-top:6px;font-size:11.5px}
  .table-box th{background:#f8fafc;color:#475569;font-weight:700;text-align:left;padding:6px 8px;border-bottom:1.5px solid #e2e8f0}
  .table-box td{padding:6px 8px;border-bottom:1px solid #f1f5f9;color:#334155}
  
  .total-box{background:#f8fafc;border:1.5px dashed #e2e8f0;border-radius:8px;padding:10px 14px;margin-top:14px;display:flex;justify-content:space-between;align-items:center}
  .total-val{font-size:16px;font-weight:900;color:#ef4444}
  
  .footer{margin-top:40px;display:flex;justify-content:space-between;align-items:flex-end;font-size:11px;color:#94a3b8;border-top:1px solid #e2e8f0;padding-top:14px}
  .sign-box{text-align:center;width:220px;color:#334155}
  .sign-line{border-top:1.5px solid #334155;padding-top:6px;font-size:11px;margin-top:36px}
  
  ol, ul{margin:0;padding-left:18px}
  li{margin-bottom:4px}
  @media print{body{padding:10px}}
</style>
</head>
<body>
<div class="header">
  <div class="hclinic">
    <div class="title">Clinique Médicale ABC Marouane</div>
    <div class="sub">Tannerie, Kaloum · Conakry, République de Guinée</div>
    <div class="sub">Tél : +224 624 00 00 00</div>
    <div class="sub">Service : Soins d'Urgence &amp; Triage</div>
  </div>
  <div class="hdate"><strong>Date d'arrivée</strong>${date}</div>
</div>
<div class="doc-title">Fiche de Prise en Charge d'Urgence</div>

<div class="patient-box">
  <div class="patient-box-header">Informations Patient</div>
  <div class="patient-grid">
    <div class="pi-item"><div class="pi-label">Nom &amp; Prénom</div><div class="pi-value">${patientSelectionne.nom}</div></div>
    <div class="pi-item"><div class="pi-label">Date de naissance</div><div class="pi-value">${dateNaissStr}</div></div>
    <div class="pi-item"><div class="pi-label">Âge</div><div class="pi-value">${age} ans</div></div>
    <div class="pi-item"><div class="pi-label">Téléphone</div><div class="pi-value">${patientSelectionne.telephone || "—"}</div></div>
  </div>
</div>

<div class="section">
  <div class="sec-label">Observations Initiales &amp; Motif de Triage</div>
  <div class="sec-value">${obs}</div>
</div>

<div class="section">
  <div class="sec-label">Constantes Vitales d'Entrée</div>
  <div class="param-grid">
    <div class="param-item"><div class="pi-label">Tension Art.</div><div class="pi-value">${constantes.ta || "—"} mmHg</div></div>
    <div class="param-item"><div class="pi-label">Fréq. Cardiaque</div><div class="pi-value">${constantes.fc || "—"} bpm</div></div>
    <div class="param-item"><div class="pi-label">Température</div><div class="pi-value">${constantes.temp || "—"} °C</div></div>
    <div class="param-item"><div class="pi-label">Fréq. Resp.</div><div class="pi-value">${constantes.fr || "—"} cpm</div></div>
    <div class="param-item"><div class="pi-label">Poids</div><div class="pi-value">${constantes.poids || "—"} kg</div></div>
  </div>
</div>

<div class="grid-2">
  <div class="section">
    <div class="sec-label">Soins / Actes Administrés</div>
    <div class="sec-value">
      ${soinsSelectionnes.length > 0 ? `
        <ul>
          ${soinsSelectionnes.map(s => `<li>${s} (15 000 GNF)</li>`).join("")}
        </ul>
      ` : "Aucun acte immédiat"}
    </div>
  </div>
  
  <div class="section">
    <div class="sec-label">Examens Laboratoire Prescrits</div>
    <div class="sec-value">
      ${examensSelectionnes.length > 0 ? `
        <ul>
          ${examensSelectionnes.map(ex => `<li>${ex.nom} ${ex.prix > 0 ? `(${ex.prix.toLocaleString()} GNF)` : "(En attente caisse)"}</li>`).join("")}
        </ul>
      ` : "Aucun examen prescrit"}
    </div>
  </div>
</div>

<div class="section">
  <div class="sec-label">Médicaments &amp; Consommables d'Urgence</div>
  <table class="table-box">
    <thead>
      <tr>
        <th>Type</th>
        <th>Désignation</th>
        <th>Quantité</th>
        <th>Prix Unitaire</th>
        <th>Total</th>
      </tr>
    </thead>
    <tbody>
      ${meds.map(m => `
        <tr>
          <td>Médicament</td>
          <td>${m.nom}</td>
          <td>${m.quantite}</td>
          <td>${m.prix.toLocaleString()} GNF</td>
          <td><strong>${(m.quantite * m.prix).toLocaleString()} GNF</strong></td>
        </tr>
      `).join("")}
      ${consos.map(c => `
        <tr>
          <td>Consommable</td>
          <td>${c.nom}</td>
          <td>${c.quantite}</td>
          <td>${c.prix.toLocaleString()} GNF</td>
          <td><strong>${(c.quantite * c.prix).toLocaleString()} GNF</strong></td>
        </tr>
      `).join("")}
      ${(meds.length === 0 && consos.length === 0) ? `<tr><td colspan="5" style="text-align:center;color:#64748b">Aucun produit prescrit ou utilisé</td></tr>` : ""}
    </tbody>
  </table>
</div>

<div class="total-box">
  <div>
    <strong>Total Prise en Charge d'Urgence :</strong> (Base 10 000 + Actes ${actsFee.toLocaleString()} + Produits ${(medsFee + consosFee).toLocaleString()})
  </div>
  <div class="total-val">${totalFacture.toLocaleString()} GNF</div>
</div>

<div class="footer">
  <div>Fiche confidentielle générée le ${date}</div>
  <div class="sign-box">
    <div class="sign-line">Signature du médecin / Major de Garde</div>
  </div>
</div>
</body></html>`)
    w.document.close()
    setTimeout(() => w.print(), 450)
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    handleSaveAction(true)
  }

  return (
    <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: 20 }}>
      {/* Formulaire principal */}
      <form onSubmit={handleSubmit} style={{ background: C.white, border: "1px solid " + C.border, borderRadius: 16, padding: 24, display: "flex", flexDirection: "column", gap: 20 }}>
        
        {/* En-tête avec configuration administrative */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid " + C.border, paddingBottom: 14 }}>
          <div>
            <h3 style={{ fontSize: 16, fontWeight: 800, color: C.textPri, margin: 0 }}>Fiche d'Urgence &amp; Triage Rapide</h3>
            <p style={{ fontSize: 11, color: C.textSec, margin: "2px 0 0" }}>Enregistrer les premiers soins et constantes vitales</p>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 6, background: config.regle_paiement_urgences === "soigner_d_abord" ? "#ecfdf5" : "#fffbeb", border: "1px solid " + (config.regle_paiement_urgences === "soigner_d_abord" ? "#10b981" : "#f59e0b"), padding: "6px 12px", borderRadius: 20 }}>
            <span style={{ width: 6, height: 6, borderRadius: "50%", background: config.regle_paiement_urgences === "soigner_d_bold" ? "#10b981" : "#f59e0b" }}></span>
            <span style={{ fontSize: 11, fontWeight: 700, color: config.regle_paiement_urgences === "soigner_d_abord" ? "#065f46" : "#92400e" }}>
              Règle : {config.regle_paiement_urgences === "soigner_d_abord" ? "Soigner d'abord" : "Payer d'abord"}
            </span>
          </div>
        </div>

        {/* Sélection du patient */}
        <div>
          <label style={labelSt}>Sélectionner la patiente <span style={{ color: C.red }}>*</span></label>
          {patientSelectionne ? (
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 14px", background: "#f8fafc", border: "1px solid " + C.border, borderRadius: 8 }}>
              <div>
                <span style={{ fontSize: 13, fontWeight: 700, color: C.textPri }}>{patientSelectionne.nom}</span>
                <span style={{ fontSize: 11, color: C.textSec, marginLeft: 8 }}>({patientSelectionne.pid || "Pas d'ID"})</span>
              </div>
              <button type="button" onClick={() => setPatientSelectionne(null)} style={{ background: "none", border: "none", color: C.red, fontWeight: 700, cursor: "pointer" }}>Changer</button>
            </div>
          ) : (
            <div style={{ position: "relative" }}>
              <input
                type="text"
                placeholder="Rechercher par nom ou PID..."
                value={patientRecherche}
                onChange={e => setPatientRecherche(e.target.value)}
                style={inputSt}
              />
              {patientsFiltres.length > 0 && (
                <div style={{ position: "absolute", top: "100%", left: 0, right: 0, background: C.white, border: "1px solid " + C.border, borderRadius: 8, zIndex: 10, maxHeight: 180, overflowY: "auto", boxShadow: "0 10px 25px rgba(0,0,0,0.1)" }}>
                  {patientsFiltres.map(p => (
                    <div
                      key={p.id}
                      onClick={() => { setPatientSelectionne(p); setPatientRecherche("") }}
                      style={{ padding: "8px 12px", borderBottom: "1px solid " + C.border, cursor: "pointer", fontSize: 12.5 }}
                      onMouseEnter={e => e.currentTarget.style.background = "#f1f5f9"}
                      onMouseLeave={e => e.currentTarget.style.background = "none"}
                    >
                      <strong>{p.nom}</strong> {p.pid && `(${p.pid})`}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Constantes vitales */}
        <div>
          <label style={labelSt}>Constantes vitales</label>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 10 }}>
            <div>
              <span style={{ fontSize: 10, color: C.textSec, display: "block", marginBottom: 3 }}>Température (°C)</span>
              <input type="text" placeholder="37" value={constantes.temp} onChange={e => setConstantes({ ...constantes, temp: e.target.value })} style={inputSt} />
            </div>
            <div>
              <span style={{ fontSize: 10, color: C.textSec, display: "block", marginBottom: 3 }}>Tension Art. (mmHg)</span>
              <input type="text" placeholder="12/8" value={constantes.ta} onChange={e => setConstantes({ ...constantes, ta: e.target.value })} style={inputSt} />
            </div>
            <div>
              <span style={{ fontSize: 10, color: C.textSec, display: "block", marginBottom: 3 }}>Fréq. Cardiaque (bpm)</span>
              <input type="text" placeholder="75" value={constantes.fc} onChange={e => setConstantes({ ...constantes, fc: e.target.value })} style={inputSt} />
            </div>
            <div>
              <span style={{ fontSize: 10, color: C.textSec, display: "block", marginBottom: 3 }}>Fréq. Resp. (cpm)</span>
              <input type="text" placeholder="16" value={constantes.fr} onChange={e => setConstantes({ ...constantes, fr: e.target.value })} style={inputSt} />
            </div>
            <div>
              <span style={{ fontSize: 10, color: C.textSec, display: "block", marginBottom: 3 }}>Poids (kg)</span>
              <input type="text" placeholder="70" value={constantes.poids} onChange={e => setConstantes({ ...constantes, poids: e.target.value })} style={inputSt} />
            </div>
          </div>
        </div>

        {/* Observations initiales */}
        <div>
          <label style={labelSt}>Observations initiales &amp; Motif d'urgence <span style={{ color: C.red }}>*</span></label>
          <textarea
            placeholder="Décrire brièvement l'état clinique d'arrivée, plaintes majeures..."
            value={obs}
            onChange={e => setObs(e.target.value)}
            rows={2}
            style={inputSt}
          />
        </div>

        {/* Premiers Soins / Actes */}
        <div>
          <label style={labelSt}>Premiers soins dispensés (15 000 GNF par acte)</label>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
            {ACTES_URGENCES.map(a => {
              const selected = soinsSelectionnes.includes(a.nom)
              return (
                <button
                  key={a.nom}
                  type="button"
                  onClick={() => toggleSoin(a.nom)}
                  style={{
                    padding: "6px 12px",
                    background: selected ? C.green : C.white,
                    color: selected ? "#fff" : C.textPri,
                    border: "1px solid " + (selected ? C.green : C.border),
                    borderRadius: 20,
                    fontSize: 11.5,
                    fontWeight: 600,
                    cursor: "pointer",
                    transition: "all 0.15s"
                  }}
                >
                  {selected && "✓ "}
                  {a.nom}
                </button>
              )
            })}
          </div>
        </div>

        {/* Médicaments & Consommables */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
          <div>
            <label style={labelSt}>Médicaments administrés</label>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 4, marginBottom: 8 }}>
              {MEDICAMENTS_COMMUNS.map(m => (
                <button key={m.nom} type="button" onClick={() => addMed(m)}
                  style={{ padding: "4px 8px", background: "#f1f5f9", color: "#334155", border: "1px solid " + C.border, borderRadius: 6, fontSize: 10.5, cursor: "pointer" }}>
                  + {m.nom.split(" ")[0]}
                </button>
              ))}
            </div>
            {meds.length > 0 && (
              <div style={{ display: "flex", flexDirection: "column", gap: 6, background: "#f8fafc", padding: 8, borderRadius: 8, border: "1px solid " + C.border }}>
                {meds.map(m => (
                  <div key={m.nom} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8, fontSize: 11.5 }}>
                    <span style={{ flex: 1, fontWeight: 600 }}>{m.nom}</span>
                    <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                      <span style={{ fontSize: 10, color: C.textSec }}>Qté:</span>
                      <input type="number" min="1" value={m.quantite} onChange={e => updateMedQty(m.nom, e.target.value)} style={{ width: 45, padding: "2px 4px", fontSize: 11, border: "1px solid " + C.border, borderRadius: 4 }} />
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                      <input type="number" min="0" value={m.prix} onChange={e => updateMedPrice(m.nom, e.target.value)} style={{ width: 75, padding: "2px 4px", fontSize: 11, border: "1px solid " + C.border, borderRadius: 4, textAlign: "right" }} />
                      <span style={{ fontSize: 10, color: C.textSec }}>GNF</span>
                    </div>
                    <button type="button" onClick={() => removeMed(m.nom)} style={{ border: "none", background: "none", color: C.red, cursor: "pointer", fontWeight: "bold" }}>×</button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div>
            <label style={labelSt}>Consommables utilisés</label>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 4, marginBottom: 8 }}>
              {CONSOMMABLES_COMMUNS.map(c => (
                <button key={c.nom} type="button" onClick={() => addConso(c)}
                  style={{ padding: "4px 8px", background: "#f1f5f9", color: "#334155", border: "1px solid " + C.border, borderRadius: 6, fontSize: 10.5, cursor: "pointer" }}>
                  + {c.nom.split(" ")[0]}
                </button>
              ))}
            </div>
            {consos.length > 0 && (
              <div style={{ display: "flex", flexDirection: "column", gap: 6, background: "#f8fafc", padding: 8, borderRadius: 8, border: "1px solid " + C.border }}>
                {consos.map(c => (
                  <div key={c.nom} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8, fontSize: 11.5 }}>
                    <span style={{ flex: 1, fontWeight: 600 }}>{c.nom}</span>
                    <input type="number" min="1" value={c.quantite} onChange={e => updateConsoQty(c.nom, e.target.value)} style={{ width: 50, padding: "2px 4px", fontSize: 11, border: "1px solid " + C.border, borderRadius: 4 }} />
                    <button type="button" onClick={() => removeConso(c.nom)} style={{ border: "none", background: "none", color: C.red, cursor: "pointer", fontWeight: "bold" }}>×</button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Examens Urgents commandés */}
        <div>
          <label style={labelSt}>Prescrire des examens urgents au laboratoire</label>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 8 }}>
            {EXAMENS_URGENTS.map(ex => {
              const selected = examensSelectionnes.some(e => e.nom === ex)
              return (
                <button
                  key={ex}
                  type="button"
                  onClick={() => toggleExamen(ex)}
                  style={{
                    padding: "6px 12px",
                    background: selected ? C.blue : C.white,
                    color: selected ? "#fff" : C.textPri,
                    border: "1px solid " + (selected ? C.blue : C.border),
                    borderRadius: 20,
                    fontSize: 11,
                    fontWeight: 650,
                    cursor: "pointer",
                    transition: "all 0.15s"
                  }}
                >
                  {selected && "✓ "}
                  {ex}
                </button>
              )
            })}
          </div>
          {examensSelectionnes.length > 0 && (
            <div style={{ display: "flex", flexDirection: "column", gap: 6, background: "#f8fafc", padding: 10, borderRadius: 8, border: "1px solid " + C.border }}>
              <span style={{ fontSize: 10, fontWeight: 700, color: C.textSec, textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 2 }}>Tarifs des examens prescrits</span>
              {examensSelectionnes.map(ex => (
                <div key={ex.nom} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8, fontSize: 11.5 }}>
                  <span style={{ flex: 1, fontWeight: 600 }}>{ex.nom}</span>
                  <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                    <input
                      type="number"
                      min="0"
                      placeholder="Prix GNF"
                      value={ex.prix}
                      onChange={e => updateExamenPrice(ex.nom, e.target.value)}
                      style={{ width: 85, padding: "2px 4px", fontSize: 11, border: "1px solid " + C.border, borderRadius: 4, textAlign: "right" }}
                    />
                    <span style={{ fontSize: 10, color: C.textSec }}>GNF</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div style={{ display: "flex", gap: "10px", justifyContent: "flex-end", borderTop: `1px solid ${C.border}`, paddingTop: "16px", marginTop: "10px", flexWrap: "wrap" }}>
          <Btn type="button" onClick={handlePrint} variant="secondary" disabled={!patientSelectionne}>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" style={{ marginRight: 6 }}><polyline points="6 9 6 2 18 2 18 9"/><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/><rect x="6" y="14" width="12" height="8"/></svg>
            Imprimer
          </Btn>
          <Btn type="button" onClick={() => handleSaveAction(false)} variant="secondary" disabled={saving || !patientSelectionne || isSigned}>
            Sauvegarder
          </Btn>
          <Btn type="button" onClick={() => handleSaveAction(true)} variant="success" disabled={saving || !patientSelectionne || isSigned}>
            Signer
          </Btn>
          <Btn type="button" onClick={() => handleSaveAction(true)} variant="primary" disabled={saving || !patientSelectionne || isSigned}>
            Valider
          </Btn>
        </div>
      </form>

      {/* Résumé de Facturation Estimé en Direct */}
      <div style={{ background: "#f8fafc", border: "1px solid " + C.border, borderRadius: 16, padding: 20, display: "flex", flexDirection: "column", gap: 14 }}>
        <h4 style={{ fontSize: 14, fontWeight: 700, color: C.textPri, margin: 0, borderBottom: "1px solid " + C.border, paddingBottom: 8 }}>
          Estimation Facture Urgence
        </h4>
        <div style={{ display: "flex", flexDirection: "column", gap: 10, fontSize: 12.5 }}>
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <span style={{ color: C.textSec }}>Frais d'ouverture urgence :</span>
            <span style={{ fontWeight: 600 }}>{baseFee.toLocaleString()} GNF</span>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <span style={{ color: C.textSec }}>Premiers soins dispensés ({soinsSelectionnes.length}) :</span>
            <span style={{ fontWeight: 600 }}>{actsFee.toLocaleString()} GNF</span>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <span style={{ color: C.textSec }}>Médicaments injectés/fournis :</span>
            <span style={{ fontWeight: 600 }}>{medsFee.toLocaleString()} GNF</span>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <span style={{ color: C.textSec }}>Consommables utilisés :</span>
            <span style={{ fontWeight: 600 }}>{consosFee.toLocaleString()} GNF</span>
          </div>
        </div>

        <div style={{ borderTop: "2px dashed " + C.border, paddingTop: 12, marginTop: 8, display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
          <span style={{ fontSize: 14, fontWeight: 800, color: C.textPri }}>Total GNF :</span>
          <span style={{ fontSize: 20, fontWeight: 900, color: C.blue }}>
            {totalFacture.toLocaleString()} GNF
          </span>
        </div>

        <div style={{ background: "#eff6ff", border: "1px solid #bfdbfe", padding: 12, borderRadius: 10, fontSize: 11, color: C.blue, lineHeight: 1.5, marginTop: 10 }}>
          <strong>Remarque :</strong> Les examens commandés ci-dessus seront ajoutés au compte du patient au laboratoire sans tarification d'urgence préalable. La facture finale d'urgence sera réglée selon la politique de la clinique.
        </div>
      </div>
    </div>
  )
}
