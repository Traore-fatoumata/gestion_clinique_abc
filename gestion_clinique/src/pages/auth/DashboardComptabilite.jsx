import { useState } from "react"
import logo from "../../assets/images/logo.jpeg"
import { useAuth } from "../../hooks/useAuth.jsx"
import { useNavigate } from "react-router-dom"
import { useSharedData } from "../../hooks/useSharedData.jsx"
import { useClinicSettings } from "../../hooks/useClinicSettings.jsx"

const calcAge = d => { if(!d) return 0; return Math.floor((Date.now()-new Date(d))/(365.25*864e5)) }

function tarifParAge(dateNaissance, s={}) {
  const age = calcAge(dateNaissance)
  if (age < 5)  return { montant: s.tarifNourrisson||30000, label:"Nourrisson (< 5 ans)" }
  if (age < 15) return { montant: s.tarifEnfant||35000,     label:"Enfant (5–14 ans)" }
  if (age < 61) return { montant: s.tarifAdulte||50000,     label:"Adulte (15–60 ans)" }
  return { montant: s.tarifSenior||40000, label:"Senior (> 60 ans)" }
}

const C = {
  bg:"#f7f9f8", white:"#ffffff",
  textPri:"#111827", textSec:"#374151", textMuted:"#6b7280",
  border:"#e2ebe4",
  green:"#16a34a", greenSoft:"#dcfce7", greenDark:"#15803d",
  blue:"#1d6fa4",  blueSoft:"#e8f4fb",
  amber:"#b45309", amberSoft:"#fef3c7",
  red:"#dc2626",   redSoft:"#fef2f2",
  slate:"#475569", slateSoft:"#f1f5f9",
  purple:"#6d28d9",purpleSoft:"#ede9fe",
  teal:"#0f766e",  tealSoft:"#f0fdfa",
}

function fmtMoney(n) { return (n||0).toLocaleString("fr-FR")+" GNF" }

function Avatar({ name, size=36, bg="#1d6fa4" }) {
  const initials = (name||"?").split(" ").map(w=>w[0]).join("").slice(0,2).toUpperCase()
  return (
    <div style={{ width:size, height:size, borderRadius:"50%", background:bg, display:"flex", alignItems:"center",
      justifyContent:"center", color:"#fff", fontSize:size*0.36, fontWeight:800, flexShrink:0 }}>
      {initials}
    </div>
  )
}

function Badge({ statut }) {
  const cfg = {
    paye:      { label:"Payé",         bg:C.greenSoft,  color:C.green  },
    partiel:   { label:"Partiel",      bg:C.amberSoft,  color:C.amber  },
    en_attente:{ label:"Non payé",     bg:C.redSoft,    color:C.red    },
  }
  const s = cfg[statut] || cfg.en_attente
  return (
    <span style={{ padding:"3px 10px", borderRadius:20, fontSize:11, fontWeight:700,
      background:s.bg, color:s.color, border:"1px solid "+s.color+"33", whiteSpace:"nowrap" }}>
      {s.label}
    </span>
  )
}

// ── Modal paiement consultation ─────────────────────────
function ModalPaiementConsultation({ entree, patient, onClose, onSave }) {
  const { settings } = useClinicSettings()
  const tarif = tarifParAge(patient?.dateNaissance, settings)
  const montantDu = entree.montantConsultation || tarif.montant
  const [methode, setMethode] = useState("cash")
  const [note,    setNote]    = useState("")
  return (
    <div style={{ position:"fixed",inset:0,background:"rgba(15,23,42,0.5)",zIndex:300,display:"flex",alignItems:"center",justifyContent:"center",padding:20 }}
      onClick={e=>{ if(e.target===e.currentTarget) onClose() }}>
      <div style={{ background:C.white,borderRadius:20,width:"100%",maxWidth:480,boxShadow:"0 25px 60px rgba(0,0,0,0.2)",overflow:"hidden" }}>
        <div style={{ padding:"20px 24px",background:"linear-gradient(135deg,#0f4c2a,#16a34a)",display:"flex",justifyContent:"space-between",alignItems:"center" }}>
          <div>
            <p style={{ fontSize:16,fontWeight:800,color:"#fff" }}>Frais de consultation — {entree.nom}</p>
            <p style={{ fontSize:12,color:"rgba(255,255,255,0.7)",marginTop:2 }}>{tarif.label} · Paiement intégral obligatoire</p>
          </div>
          <button onClick={onClose} style={{ background:"rgba(255,255,255,0.2)",border:"none",borderRadius:8,width:32,height:32,cursor:"pointer",color:"#fff",fontSize:18,display:"flex",alignItems:"center",justifyContent:"center" }}>×</button>
        </div>
        <div style={{ padding:"20px 24px",display:"flex",flexDirection:"column",gap:16 }}>
          <div style={{ background:C.greenSoft,borderRadius:14,padding:"16px 20px",border:"1px solid "+C.green+"33",textAlign:"center" }}>
            <p style={{ fontSize:12,color:C.textMuted,marginBottom:4 }}>Montant à encaisser</p>
            <p style={{ fontSize:32,fontWeight:800,color:C.green }}>{fmtMoney(montantDu)}</p>
            <p style={{ fontSize:11,color:C.textMuted,marginTop:4 }}>Paiement intégral obligatoire avant consultation</p>
          </div>
          <div>
            <label style={{ fontSize:12,fontWeight:700,color:C.textSec,display:"block",marginBottom:8 }}>Mode de paiement</label>
            <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr",gap:10 }}>
              {[{val:"cash",label:"Espèces"},{val:"orange_money",label:"Orange Money"},{val:"wave",label:"Wave"},{val:"virement",label:"Virement"}].map(opt=>(
                <button key={opt.val} type="button" onClick={()=>setMethode(opt.val)}
                  style={{ padding:"10px",borderRadius:10,border:"2px solid "+(methode===opt.val?C.green:C.border),
                    background:methode===opt.val?C.greenSoft:C.white,color:methode===opt.val?C.green:C.textSec,
                    fontSize:13,fontWeight:700,cursor:"pointer",fontFamily:"inherit" }}>
                  {opt.label}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label style={{ fontSize:12,fontWeight:700,color:C.textSec,display:"block",marginBottom:4 }}>Note (facultatif)</label>
            <input value={note} onChange={e=>setNote(e.target.value)} placeholder="Reçu espèces, numéro transaction…"
              style={{ width:"100%",padding:"10px 12px",border:"1.5px solid "+C.border,borderRadius:10,fontSize:14,fontFamily:"inherit",boxSizing:"border-box" }} />
          </div>
          <div style={{ display:"flex",gap:10,paddingTop:4 }}>
            <button onClick={onClose}
              style={{ flex:1,padding:"11px",border:"1.5px solid "+C.border,borderRadius:10,background:C.white,color:C.textSec,fontSize:14,fontWeight:600,cursor:"pointer",fontFamily:"inherit" }}>
              Annuler
            </button>
            <button onClick={()=>onSave({ statut:"paye", montant:montantDu, methode, note, date:new Date().toLocaleDateString("fr-FR") })}
              style={{ flex:2,padding:"11px",border:"none",borderRadius:10,background:C.green,color:"#fff",fontSize:14,fontWeight:700,cursor:"pointer",fontFamily:"inherit" }}>
              Confirmer ({fmtMoney(montantDu)})
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

// ── Modal paiement examens (partiel / total) ────────────
function ModalPaiementExamens({ entree, onClose, onSave }) {
  const total      = entree.fraisExamens || 0
  const dejaPayé   = entree.paiementExamens?.montantPaye || 0
  const restant    = Math.max(0, total - dejaPayé)
  const [methode, setMethode] = useState("cash")
  const [note,    setNote]    = useState("")
  const [montant, setMontant] = useState(String(restant))
  const montantNum = Math.min(parseInt(montant)||0, restant)
  const apresVers  = dejaPayé + montantNum
  const statutFinal = apresVers >= total ? "paye" : apresVers > 0 ? "partiel" : "non_paye"
  const ok = montantNum > 0

  return (
    <div style={{ position:"fixed",inset:0,background:"rgba(15,23,42,0.5)",zIndex:300,display:"flex",alignItems:"center",justifyContent:"center",padding:20 }}
      onClick={e=>{ if(e.target===e.currentTarget) onClose() }}>
      <div style={{ background:C.white,borderRadius:20,width:"100%",maxWidth:520,boxShadow:"0 25px 60px rgba(0,0,0,0.2)",overflow:"hidden" }}>
        <div style={{ padding:"20px 24px",background:"linear-gradient(135deg,#1e3a5f,#1d6fa4)",display:"flex",justifyContent:"space-between",alignItems:"center" }}>
          <div>
            <p style={{ fontSize:16,fontWeight:800,color:"#fff" }}>Frais d'examens — {entree.nom}</p>
            <p style={{ fontSize:12,color:"rgba(255,255,255,0.7)",marginTop:2 }}>
              {(entree.examensCommandes||[]).length} examen{(entree.examensCommandes||[]).length>1?"s":""} · Total : {fmtMoney(total)}
            </p>
          </div>
          <button onClick={onClose} style={{ background:"rgba(255,255,255,0.2)",border:"none",borderRadius:8,width:32,height:32,cursor:"pointer",color:"#fff",fontSize:18,display:"flex",alignItems:"center",justifyContent:"center" }}>×</button>
        </div>
        <div style={{ padding:"20px 24px",display:"flex",flexDirection:"column",gap:14 }}>

          {/* Liste examens */}
          {(entree.examensCommandes||[]).length > 0 && (
            <div style={{ background:C.blueSoft,borderRadius:12,padding:"10px 14px",border:"1px solid "+C.blue+"33" }}>
              <p style={{ fontSize:11,fontWeight:700,color:C.blue,marginBottom:6,textTransform:"uppercase",letterSpacing:"0.05em" }}>Détail des examens</p>
              {(entree.examensCommandes||[]).map((ex,i)=>(
                <div key={i} style={{ display:"flex",justifyContent:"space-between",padding:"4px 0",borderBottom:i<entree.examensCommandes.length-1?"1px solid "+C.blue+"22":"none",fontSize:12 }}>
                  <span style={{ color:C.textPri }}>{ex.nom}</span>
                  <span style={{ fontWeight:700,color:C.blue }}>{(ex.prix||0).toLocaleString("fr-FR")} GNF</span>
                </div>
              ))}
            </div>
          )}

          {/* Récapitulatif montants */}
          <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:10 }}>
            <div style={{ background:C.slateSoft,borderRadius:10,padding:"10px 12px",textAlign:"center" }}>
              <p style={{ fontSize:10,color:C.textMuted,marginBottom:3,fontWeight:700,textTransform:"uppercase" }}>Total</p>
              <p style={{ fontSize:15,fontWeight:800,color:C.textPri }}>{fmtMoney(total)}</p>
            </div>
            <div style={{ background:dejaPayé>0?C.greenSoft:C.slateSoft,borderRadius:10,padding:"10px 12px",textAlign:"center" }}>
              <p style={{ fontSize:10,color:C.textMuted,marginBottom:3,fontWeight:700,textTransform:"uppercase" }}>Déjà payé</p>
              <p style={{ fontSize:15,fontWeight:800,color:dejaPayé>0?C.green:C.textMuted }}>{fmtMoney(dejaPayé)}</p>
            </div>
            <div style={{ background:C.amberSoft,borderRadius:10,padding:"10px 12px",textAlign:"center" }}>
              <p style={{ fontSize:10,color:C.textMuted,marginBottom:3,fontWeight:700,textTransform:"uppercase" }}>Restant</p>
              <p style={{ fontSize:15,fontWeight:800,color:C.amber }}>{fmtMoney(restant)}</p>
            </div>
          </div>

          {/* Montant à encaisser maintenant */}
          <div>
            <label style={{ fontSize:12,fontWeight:700,color:C.textSec,display:"block",marginBottom:6 }}>
              Montant encaissé maintenant <span style={{ color:C.red }}>*</span>
            </label>
            <div style={{ display:"flex",gap:8,marginBottom:8 }}>
              <input value={montant} onChange={e=>setMontant(e.target.value)} type="number" min="0" max={restant}
                style={{ flex:1,padding:"10px 12px",border:"1.5px solid "+C.blue,borderRadius:10,fontSize:16,fontWeight:700,fontFamily:"inherit",color:C.blue,outline:"none",textAlign:"right" }} />
              <button type="button" onClick={()=>setMontant(String(restant))}
                style={{ padding:"10px 14px",border:"1px solid "+C.border,borderRadius:10,background:C.slateSoft,fontSize:12,fontWeight:700,cursor:"pointer",fontFamily:"inherit",color:C.textSec,whiteSpace:"nowrap" }}>
                Tout payer
              </button>
            </div>
            {montantNum > 0 && (
              <div style={{ display:"flex",alignItems:"center",gap:6,padding:"7px 12px",borderRadius:8,background:statutFinal==="paye"?C.greenSoft:C.amberSoft,border:"1px solid "+(statutFinal==="paye"?C.green:C.amber)+"33" }}>
                <span style={{ fontSize:12,fontWeight:700,color:statutFinal==="paye"?C.green:C.amber }}>
                  {statutFinal==="paye"
                    ? <span style={{ display:"inline-flex",alignItems:"center",gap:5 }}><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>Solde intégralement réglé</span>
                    : `Reste à payer après : ${fmtMoney(restant - montantNum)}`}
                </span>
              </div>
            )}
          </div>

          {/* Mode de paiement */}
          <div>
            <label style={{ fontSize:12,fontWeight:700,color:C.textSec,display:"block",marginBottom:8 }}>Mode de paiement</label>
            <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr",gap:8 }}>
              {[{val:"cash",label:"Espèces"},{val:"orange_money",label:"Orange Money"},{val:"wave",label:"Wave"},{val:"virement",label:"Virement"}].map(opt=>(
                <button key={opt.val} type="button" onClick={()=>setMethode(opt.val)}
                  style={{ padding:"9px",borderRadius:10,border:"2px solid "+(methode===opt.val?C.blue:C.border),
                    background:methode===opt.val?C.blueSoft:C.white,color:methode===opt.val?C.blue:C.textSec,
                    fontSize:13,fontWeight:700,cursor:"pointer",fontFamily:"inherit" }}>
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label style={{ fontSize:12,fontWeight:700,color:C.textSec,display:"block",marginBottom:4 }}>Note (facultatif)</label>
            <input value={note} onChange={e=>setNote(e.target.value)} placeholder="Numéro transaction, remarque…"
              style={{ width:"100%",padding:"10px 12px",border:"1.5px solid "+C.border,borderRadius:10,fontSize:13,fontFamily:"inherit",boxSizing:"border-box" }} />
          </div>

          <div style={{ display:"flex",gap:10,paddingTop:4 }}>
            <button onClick={onClose}
              style={{ flex:1,padding:"11px",border:"1.5px solid "+C.border,borderRadius:10,background:C.white,color:C.textSec,fontSize:14,fontWeight:600,cursor:"pointer",fontFamily:"inherit" }}>
              Annuler
            </button>
            <button onClick={()=>{ if(ok) onSave({ montantPaye: dejaPayé+montantNum, statut:statutFinal, methode, note, date:new Date().toLocaleDateString("fr-FR") }) }}
              disabled={!ok}
              style={{ flex:2,padding:"11px",border:"none",borderRadius:10,background:ok?C.blue:"#9ca3af",color:"#fff",fontSize:14,fontWeight:700,cursor:ok?"pointer":"not-allowed",fontFamily:"inherit" }}>
              Encaisser {fmtMoney(montantNum)}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

// ── Impression reçu ─────────────────────────────────────
function imprimerRecu(l) {
  const date = new Date().toLocaleDateString("fr-FR")
  const isExamen = l.typeFacture === "examens"
  const titre = isExamen ? "FRAIS D'EXAMENS PAYÉS" : "FRAIS DE CONSULTATION PAYÉS"
  const w = window.open("","_blank","width=600,height=800")
  w.document.write(`<!DOCTYPE html><html><head><meta charset="utf-8"><title>Reçu</title><style>
    body{font-family:'Segoe UI',sans-serif;margin:0;padding:32px;color:#000}
    .header{text-align:center;border-bottom:2px solid #16a34a;padding-bottom:16px;margin-bottom:20px}
    .title{font-size:20px;font-weight:800;color:#16a34a;margin:0}
    .sub{font-size:12px;color:#555;margin:3px 0}
    .badge{display:inline-block;padding:4px 16px;border-radius:20px;font-weight:700;font-size:14px;margin:8px 0;color:#16a34a;border:2px solid #16a34a22;background:#16a34a11}
    .row{display:flex;justify-content:space-between;padding:8px 0;border-bottom:1px solid #eee;font-size:13px}
    .row:last-child{border:none}
    .footer{margin-top:30px;text-align:center;font-size:11px;color:#999}
    @media print{body{padding:16px}}
  </style></head><body>
  <div class="header">
    <div class="title">Clinique Médicale ABC Marouane</div>
    <div class="sub">Tannerie, Kaloum · Conakry · +224 624 00 00 00</div>
    <div class="sub" style="font-size:15px;font-weight:700;margin-top:6px">REÇU DE PAIEMENT</div>
    <div class="badge">${titre}</div>
  </div>
  <div class="row"><span>Date</span><span>${date}</span></div>
  <div class="row"><span>Patient</span><span>${l.nom}</span></div>
  <div class="row"><span>Service</span><span>${l.service||"—"}</span></div>
  <div class="row"><span>Poste</span><span>${isExamen?"Examens / Traitements":"Consultation"}</span></div>
  ${isExamen && (l.examensCommandes||[]).length>0 ? (l.examensCommandes||[]).map(e=>`<div class="row"><span style="padding-left:12px">· ${e.nom}</span><span>${(e.prix||0).toLocaleString("fr-FR")} GNF</span></div>`).join("") : ""}
  <div class="row" style="font-weight:800"><span>Montant payé</span><span style="color:#16a34a">${(isExamen ? (l.montantPayeEx||l.montantFacture) : l.montantFacture).toLocaleString("fr-FR")} GNF</span></div>
  ${isExamen && (l.restantEx||0) > 0 ? `<div class="row" style="color:#b45309;font-weight:700"><span>Reste à payer</span><span>${(l.restantEx||0).toLocaleString("fr-FR")} GNF</span></div>` : ""}
  ${l.paiementInfo?.note?`<div class="row"><span>Note</span><span>${l.paiementInfo.note}</span></div>`:""}
  <div class="footer">
    <p>Clinique Médicale ABC Marouane · Document officiel</p>
    <p style="margin-top:30px;border-top:1px solid #000;padding-top:6px;width:180px;margin-left:auto;text-align:center">Signature Comptable</p>
  </div></body></html>`)
  w.document.close(); setTimeout(()=>w.print(),400)
}

// ══════════════════════════════════════════════════════
//  COMPOSANT PRINCIPAL
// ══════════════════════════════════════════════════════
export default function DashboardComptabilite() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const handleLogout = () => { logout(); navigate("/login") }

  const { patients: sharedPatients, file, updateFileEntry } = useSharedData()
  const { settings } = useClinicSettings()
  const [onglet, setOnglet] = useState("caisse")
  const [recherche, setRecherche] = useState("")
  const [mPmt,   setMPmt]   = useState(null)
  const [mPmtEx, setMPmtEx] = useState(null)
  const [filterStatut, setFilterStatut] = useState("tous")

  // Enrichir les entrées avec infos patient
  const fileEnrichie = file.map(f => {
    const p = sharedPatients.find(sp => sp.id === f.patientId) || {}
    return { ...p, ...f, id: f.id, patientId: f.patientId }
  })

  // Une ligne de facturation par poste (consultation ou examens)
  const toutesLignes = []
  fileEnrichie.forEach(f => {
    const rdv = f.typeVisite === "rendez_vous"
    if (!rdv) {
      toutesLignes.push({
        key: f.id + "_c",
        ...f,
        typeFacture: "consultation",
        montantFacture: f.montantConsultation || tarifParAge(f.dateNaissance, settings).montant,
        paye: f.paiementConsultation?.statut === "paye",
        statutLigne: f.paiementConsultation?.statut === "paye" ? "paye" : "en_attente",
        paiementInfo: f.paiementConsultation,
      })
    }
    if ((f.fraisExamens || 0) > 0) {
      const montantPayeEx = f.paiementExamens?.montantPaye || 0
      const statutEx = f.paiementExamens?.statut || "en_attente"
      toutesLignes.push({
        key: f.id + "_e",
        ...f,
        typeFacture: "examens",
        montantFacture: f.fraisExamens,
        montantPayeEx,
        restantEx: Math.max(0, (f.fraisExamens||0) - montantPayeEx),
        paye: statutEx === "paye",
        statutLigne: statutEx === "paye" ? "paye" : statutEx === "partiel" ? "partiel" : "en_attente",
        paiementInfo: f.paiementExamens,
      })
    }
  })

  const totalAEncaisser = toutesLignes.filter(l => !l.paye).reduce((s,l) => {
    if (l.typeFacture === "examens") return s + (l.restantEx || l.montantFacture)
    return s + l.montantFacture
  }, 0)
  const totalEncaisse   = toutesLignes.reduce((s,l) => {
    if (l.typeFacture === "examens") return s + (l.montantPayeEx || 0)
    return s + (l.paye ? l.montantFacture : 0)
  }, 0)
  const nbAttente = toutesLignes.filter(l => !l.paye).length

  const matchLine = (l) => {
    const q = recherche.toLowerCase()
    const matchRecherche = !q || l.nom?.toLowerCase().includes(q) || (l.pid||"").toLowerCase().includes(q) || (l.service||"").toLowerCase().includes(q)
    const matchStatut = filterStatut === "tous"
      || (filterStatut === "impaye" && !l.paye)
      || (filterStatut === "paye"   &&  l.paye)
    return matchRecherche && matchStatut
  }
  const lignesConsult  = toutesLignes.filter(l => l.typeFacture === "consultation" && matchLine(l))
  const lignesExamens  = toutesLignes.filter(l => l.typeFacture === "examens"      && matchLine(l))

  const handleSavePmt = (data) => {
    updateFileEntry(mPmt.id, { paiementConsultation: data })
    setMPmt(null)
  }

  const handleSaveExamen = (data) => {
    updateFileEntry(mPmtEx.id, { paiementExamens: { ...data, methode: data.methode, note: data.note, date: data.date } })
    setMPmtEx(null)
  }

  const NAV_ICONS = {
    caisse:     <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="6" width="20" height="13" rx="2"/><circle cx="12" cy="12.5" r="3"/><path d="M2 10h3M19 10h3M2 15h3M19 15h3"/></svg>,
    historique: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="8" y1="13" x2="16" y2="13"/><line x1="8" y1="17" x2="13" y2="17"/></svg>,
    stats:      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><line x1="3" y1="20" x2="21" y2="20"/><rect x="4" y="10" width="4" height="10" rx="1"/><rect x="10" y="6" width="4" height="14" rx="1"/><rect x="16" y="3" width="4" height="17" rx="1"/></svg>,
  }
  const NAV = [
    { id:"caisse",    label:"Caisse du jour", icon:"caisse",     badge: nbAttente > 0 ? nbAttente : 0 },
    { id:"historique",label:"Historique",     icon:"historique", badge: 0 },
    { id:"stats",     label:"Statistiques",   icon:"stats",      badge: 0 },
  ]

  return (
    <div style={{ display:"flex", flexDirection:"column", minHeight:"100vh", fontFamily:"'Segoe UI',system-ui,sans-serif", background:C.bg, color:C.textPri }}>

      {/* HEADER */}
      <header style={{ background:C.white, borderBottom:"1px solid "+C.border, padding:"0 28px", height:64, display:"flex", alignItems:"center", justifyContent:"space-between", position:"sticky", top:0, zIndex:50, boxShadow:"0 1px 3px rgba(0,0,0,0.05)" }}>
        <div style={{ display:"flex", alignItems:"center", gap:16 }}>
          <div style={{ width:44, height:44, borderRadius:10, background:"#fff", padding:4, boxShadow:"0 2px 8px rgba(0,0,0,0.12)", display:"flex", alignItems:"center", justifyContent:"center" }}>
            <img src={logo} alt="Logo" style={{ width:"100%", height:"100%", borderRadius:6, objectFit:"contain" }} />
          </div>
          <div>
            <p style={{ fontSize:13, fontWeight:800, color:C.textPri, lineHeight:1.2 }}>Clinique Marouane</p>
            <p style={{ fontSize:11, color:C.textMuted }}>Comptabilité</p>
          </div>
        </div>
        <div style={{ display:"flex", alignItems:"center", gap:12 }}>
          <Avatar name={user?.nom} size={36} bg={C.teal} />
          <div>
            <p style={{ fontSize:13, fontWeight:700, color:C.textPri }}>{user?.nom}</p>
            <p style={{ fontSize:11, color:C.textMuted }}>Comptable</p>
          </div>
          <button onClick={handleLogout}
            style={{ marginLeft:8, width:36, height:36, borderRadius:8, border:"1px solid #fca5a5", background:"#fff5f5", cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center" }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#cc2222" strokeWidth="2" strokeLinecap="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
          </button>
        </div>
      </header>

      <div style={{ display:"flex", flex:1 }}>
        {/* SIDEBAR */}
        <aside style={{ width:220, background:C.white, borderRight:"1px solid "+C.border, padding:"20px 12px", display:"flex", flexDirection:"column", gap:4 }}>
          {NAV.map(n => (
            <button key={n.id} onClick={()=>setOnglet(n.id)}
              style={{ width:"100%", display:"flex", alignItems:"center", gap:10, padding:"11px 14px", borderRadius:12, border:"none",
                background:onglet===n.id?C.tealSoft:"transparent", color:onglet===n.id?C.teal:C.textSec,
                fontSize:13, fontWeight:onglet===n.id?700:500, cursor:"pointer", fontFamily:"inherit",
                boxShadow:onglet===n.id?"inset 3px 0 0 "+C.teal:"none", position:"relative" }}>
              <span style={{ display:"flex", alignItems:"center" }}>{NAV_ICONS[n.icon]}</span>
              <span style={{ flex:1, textAlign:"left" }}>{n.label}</span>
              {n.badge > 0 && <span style={{ background:C.red, color:"#fff", fontSize:10, fontWeight:700, borderRadius:10, padding:"1px 6px" }}>{n.badge}</span>}
            </button>
          ))}
        </aside>

        {/* CONTENU */}
        <main style={{ flex:1, padding:"28px 28px", overflowY:"auto" }}>

          {/* ── CAISSE DU JOUR ── */}
          {onglet === "caisse" && (
            <div style={{ display:"flex", flexDirection:"column", gap:20 }}>

              {/* KPIs */}
              <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:14 }}>
                {[
                  { label:"Reste à encaisser",  val:fmtMoney(totalAEncaisser),              fg:C.blue  },
                  { label:"Encaissé",            val:fmtMoney(totalEncaisse),                fg:C.green },
                  { label:"Total du jour",       val:fmtMoney(totalAEncaisser+totalEncaisse),fg:C.teal  },
                  { label:"Lignes en attente",   val:nbAttente,                              fg:C.amber },
                ].map(({ label, val, fg }) => (
                  <div key={label} style={{ background:C.white, borderRadius:16, padding:"18px 20px", border:"1px solid "+C.border, boxShadow:"0 1px 4px rgba(0,0,0,0.04)" }}>
                    <p style={{ fontSize:28, fontWeight:800, color:fg, letterSpacing:"-0.5px" }}>{val}</p>
                    <p style={{ fontSize:12, color:C.textMuted, marginTop:4 }}>{label}</p>
                  </div>
                ))}
              </div>

              {/* Filtres + recherche */}
              <div style={{ display:"flex", gap:10, alignItems:"center", flexWrap:"wrap" }}>
                <div style={{ position:"relative", flex:1, minWidth:220 }}>
                  <svg style={{ position:"absolute", left:12, top:"50%", transform:"translateY(-50%)", pointerEvents:"none" }} width="15" height="15" viewBox="0 0 24 24" fill="none" stroke={C.textMuted} strokeWidth="2" strokeLinecap="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
                  <input value={recherche} onChange={e=>setRecherche(e.target.value)} placeholder="Rechercher un patient…"
                    style={{ width:"100%", padding:"10px 12px 10px 38px", border:"1.5px solid "+C.border, borderRadius:12, fontSize:13, background:C.white, color:C.textPri, outline:"none", fontFamily:"inherit", boxSizing:"border-box" }} />
                </div>
                {["tous","impaye","paye"].map(s=>(
                  <button key={s} onClick={()=>setFilterStatut(s)}
                    style={{ padding:"8px 16px", borderRadius:10, border:"1.5px solid "+(filterStatut===s?C.teal:C.border),
                      background:filterStatut===s?C.tealSoft:C.white, color:filterStatut===s?C.teal:C.textSec,
                      fontSize:12, fontWeight:filterStatut===s?700:500, cursor:"pointer", fontFamily:"inherit" }}>
                    {s==="tous"?"Tous":s==="impaye"?"En attente":"Payé"}
                    {s==="impaye"&&nbAttente>0&&<span style={{ marginLeft:6,background:C.red,color:"#fff",borderRadius:10,padding:"1px 5px",fontSize:10,fontWeight:700 }}>{nbAttente}</span>}
                  </button>
                ))}
              </div>

              {/* ── SECTION CONSULTATIONS ── */}
              <div style={{ background:C.white, borderRadius:16, border:"1px solid "+C.border, overflow:"hidden", boxShadow:"0 1px 4px rgba(0,0,0,0.04)" }}>
                <div style={{ padding:"14px 20px", borderBottom:"1px solid "+C.border, display:"flex", alignItems:"center", gap:12 }}>
                  <div style={{ width:8, height:8, borderRadius:"50%", background:C.teal, flexShrink:0 }} />
                  <div>
                    <p style={{ fontSize:15, fontWeight:700 }}>Consultations — {lignesConsult.length} patient{lignesConsult.length>1?"s":""}</p>
                    <p style={{ fontSize:12, color:C.textMuted, marginTop:1 }}>Patients en visite directe (hors rendez-vous) · Paiement intégral obligatoire</p>
                  </div>
                  <div style={{ marginLeft:"auto", display:"flex", gap:8 }}>
                    <span style={{ fontSize:12, fontWeight:700, color:C.teal, background:C.tealSoft, padding:"4px 12px", borderRadius:20, border:"1px solid "+C.teal+"33" }}>
                      {fmtMoney(lignesConsult.reduce((s,l)=>s+l.montantFacture,0))} total
                    </span>
                  </div>
                </div>
                <table style={{ width:"100%", borderCollapse:"collapse" }}>
                  <thead><tr style={{ background:C.slateSoft }}>
                    {["Patient","Service","Tarif","Montant","Statut","Actions"].map(h=>(
                      <th key={h} style={{ padding:"9px 16px", textAlign:"left", fontSize:11, fontWeight:700, color:C.textSec, textTransform:"uppercase", letterSpacing:"0.05em" }}>{h}</th>
                    ))}
                  </tr></thead>
                  <tbody>
                    {lignesConsult.length === 0 ? (
                      <tr><td colSpan={6} style={{ padding:32, textAlign:"center", color:C.textMuted, fontSize:13 }}>
                        {filterStatut==="impaye" ? "Aucune consultation impayée — tout est réglé" : "Aucune consultation trouvée"}
                      </td></tr>
                    ) : lignesConsult.map((l, i) => (
                      <tr key={l.key} style={{ borderBottom:i<lignesConsult.length-1?"1px solid "+C.border:"none" }}
                        onMouseEnter={e=>e.currentTarget.style.background=C.slateSoft}
                        onMouseLeave={e=>e.currentTarget.style.background="transparent"}>
                        <td style={{ padding:"12px 16px" }}>
                          <div style={{ display:"flex", alignItems:"center", gap:10 }}>
                            <Avatar name={l.nom} size={32} bg={C.teal} />
                            <div>
                              <p style={{ fontSize:13, fontWeight:600, color:C.textPri }}>{l.nom}</p>
                              <p style={{ fontSize:11, color:C.textMuted }}>{l.pid||"—"} · {l.arrivee||"—"}</p>
                            </div>
                          </div>
                        </td>
                        <td style={{ padding:"12px 16px", fontSize:12, color:C.textSec }}>{l.service||"—"}</td>
                        <td style={{ padding:"12px 16px", fontSize:11, color:C.textMuted }}>{tarifParAge(l.dateNaissance, settings).label}</td>
                        <td style={{ padding:"12px 16px" }}>
                          <p style={{ fontSize:14, fontWeight:800, color:C.textPri }}>{fmtMoney(l.montantFacture)}</p>
                        </td>
                        <td style={{ padding:"12px 16px" }}><Badge statut={l.statutLigne} /></td>
                        <td style={{ padding:"12px 16px" }}>
                          {!l.paye
                            ? <button onClick={()=>setMPmt(l)}
                                style={{ padding:"6px 14px", border:"none", borderRadius:8, background:C.green, color:"#fff", fontSize:12, fontWeight:700, cursor:"pointer", fontFamily:"inherit" }}>
                                Encaisser
                              </button>
                            : <button onClick={()=>imprimerRecu(l)}
                                style={{ padding:"6px 12px", border:"1px solid "+C.border, borderRadius:8, background:C.white, fontSize:12, cursor:"pointer", fontFamily:"inherit", color:C.textSec }}>
                                Reçu
                              </button>
                          }
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* ── SECTION EXAMENS ── */}
              <div style={{ background:C.white, borderRadius:16, border:"1px solid "+C.border, overflow:"hidden", boxShadow:"0 1px 4px rgba(0,0,0,0.04)" }}>
                <div style={{ padding:"14px 20px", borderBottom:"1px solid "+C.border, display:"flex", alignItems:"center", gap:12 }}>
                  <div style={{ width:8, height:8, borderRadius:"50%", background:C.blue, flexShrink:0 }} />
                  <div>
                    <p style={{ fontSize:15, fontWeight:700 }}>Examens prescrits — {lignesExamens.length} patient{lignesExamens.length>1?"s":""}</p>
                    <p style={{ fontSize:12, color:C.textMuted, marginTop:1 }}>Inclus patients RDV · Paiement partiel ou total accepté</p>
                  </div>
                  <div style={{ marginLeft:"auto", display:"flex", gap:8 }}>
                    <span style={{ fontSize:12, fontWeight:700, color:C.blue, background:C.blueSoft, padding:"4px 12px", borderRadius:20, border:"1px solid "+C.blue+"33" }}>
                      {fmtMoney(lignesExamens.reduce((s,l)=>s+l.montantFacture,0))} total
                    </span>
                  </div>
                </div>
                <table style={{ width:"100%", borderCollapse:"collapse" }}>
                  <thead><tr style={{ background:C.slateSoft }}>
                    {["Patient","Service","Examens","Montant","Statut","Actions"].map(h=>(
                      <th key={h} style={{ padding:"9px 16px", textAlign:"left", fontSize:11, fontWeight:700, color:C.textSec, textTransform:"uppercase", letterSpacing:"0.05em" }}>{h}</th>
                    ))}
                  </tr></thead>
                  <tbody>
                    {lignesExamens.length === 0 ? (
                      <tr><td colSpan={6} style={{ padding:32, textAlign:"center", color:C.textMuted, fontSize:13 }}>
                        {filterStatut==="impaye" ? "Aucun examen impayé — tout est réglé" : "Aucun examen prescrit"}
                      </td></tr>
                    ) : lignesExamens.map((l, i) => (
                      <tr key={l.key} style={{ borderBottom:i<lignesExamens.length-1?"1px solid "+C.border:"none" }}
                        onMouseEnter={e=>e.currentTarget.style.background=C.slateSoft}
                        onMouseLeave={e=>e.currentTarget.style.background="transparent"}>
                        <td style={{ padding:"12px 16px" }}>
                          <div style={{ display:"flex", alignItems:"center", gap:10 }}>
                            <Avatar name={l.nom} size={32} bg={C.blue} />
                            <div>
                              <p style={{ fontSize:13, fontWeight:600, color:C.textPri }}>{l.nom}</p>
                              <p style={{ fontSize:11, color:C.textMuted }}>
                                {l.pid||"—"} · {l.arrivee||"—"}
                                {l.typeVisite==="rendez_vous" && <span style={{ marginLeft:5, color:C.blue, fontWeight:700 }}>RDV</span>}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td style={{ padding:"12px 16px", fontSize:12, color:C.textSec }}>{l.service||"—"}</td>
                        <td style={{ padding:"12px 16px" }}>
                          <p style={{ fontSize:11, fontWeight:700, color:C.blue }}>{(l.examensCommandes||[]).length} examen{(l.examensCommandes||[]).length>1?"s":""}</p>
                          {(l.examensCommandes||[]).length > 0 && (
                            <p style={{ fontSize:10, color:C.textMuted, maxWidth:180, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>
                              {(l.examensCommandes||[]).map(e=>e.nom).join(", ")}
                            </p>
                          )}
                        </td>
                        <td style={{ padding:"12px 16px" }}>
                          <p style={{ fontSize:14, fontWeight:800, color:C.textPri }}>{fmtMoney(l.montantFacture)}</p>
                          {l.statutLigne === "partiel" && (
                            <p style={{ fontSize:10, color:C.amber, fontWeight:700 }}>
                              Payé : {fmtMoney(l.montantPayeEx)} · Reste : {fmtMoney(l.restantEx)}
                            </p>
                          )}
                        </td>
                        <td style={{ padding:"12px 16px" }}><Badge statut={l.statutLigne} /></td>
                        <td style={{ padding:"12px 16px" }}>
                          <div style={{ display:"flex", gap:6, flexWrap:"wrap" }}>
                            {!l.paye && (
                              <button onClick={()=>setMPmtEx(l)}
                                style={{ padding:"6px 14px", border:"none", borderRadius:8, background:l.statutLigne==="partiel"?C.amber:C.blue, color:"#fff", fontSize:12, fontWeight:700, cursor:"pointer", fontFamily:"inherit" }}>
                                {l.statutLigne === "partiel" ? "Compléter" : "Encaisser"}
                              </button>
                            )}
                            {(l.paye || l.statutLigne === "partiel") && (
                              <button onClick={()=>imprimerRecu(l)}
                                style={{ padding:"6px 12px", border:"1px solid "+C.border, borderRadius:8, background:C.white, fontSize:12, cursor:"pointer", fontFamily:"inherit", color:C.textSec }}>
                                Reçu
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ── HISTORIQUE ── */}
          {onglet === "historique" && (
            <div style={{ background:C.white, borderRadius:16, border:"1px solid "+C.border, overflow:"hidden" }}>
              <div style={{ padding:"18px 24px", borderBottom:"1px solid "+C.border }}>
                <p style={{ fontSize:16, fontWeight:700 }}>Historique des paiements</p>
                <p style={{ fontSize:12, color:C.textMuted, marginTop:2 }}>Consultation et examens encaissés</p>
              </div>
              <table style={{ width:"100%", borderCollapse:"collapse" }}>
                <thead><tr style={{ background:C.slateSoft }}>
                  {["Patient","Service","Poste","Montant","Mode","Date"].map(h=>(
                    <th key={h} style={{ padding:"10px 16px", textAlign:"left", fontSize:11, fontWeight:700, color:C.textSec, textTransform:"uppercase", letterSpacing:"0.05em" }}>{h}</th>
                  ))}
                </tr></thead>
                <tbody>
                  {(() => {
                    const payees = toutesLignes.filter(l => l.paye)
                    if (payees.length === 0) return (
                      <tr><td colSpan={6} style={{ padding:40, textAlign:"center", color:C.textMuted }}>Aucun paiement enregistré</td></tr>
                    )
                    return payees.map((l,i,arr) => {
                      const m = l.paiementInfo?.methode
                      const mLabel = m==="orange_money"?"Orange Money":m==="wave"?"Wave":m==="virement"?"Virement":"Espèces"
                      return (
                        <tr key={l.key} style={{ borderBottom:i<arr.length-1?"1px solid "+C.border:"none" }}>
                          <td style={{ padding:"11px 16px", fontSize:13, fontWeight:600 }}>{l.nom}</td>
                          <td style={{ padding:"11px 16px", fontSize:12, color:C.textSec }}>{l.service||"—"}</td>
                          <td style={{ padding:"11px 16px" }}>
                            {l.typeFacture==="consultation"
                              ? <span style={{ fontSize:11,fontWeight:700,background:C.tealSoft,color:C.teal,padding:"2px 8px",borderRadius:10 }}>Consultation</span>
                              : <span style={{ fontSize:11,fontWeight:700,background:C.blueSoft,color:C.blue,padding:"2px 8px",borderRadius:10 }}>Examens</span>
                            }
                          </td>
                          <td style={{ padding:"11px 16px", fontSize:13, fontWeight:700, color:C.green }}>{fmtMoney(l.montantFacture)}</td>
                          <td style={{ padding:"11px 16px", fontSize:12, color:C.textSec }}>{mLabel}</td>
                          <td style={{ padding:"11px 16px", fontSize:12, color:C.textMuted }}>{l.paiementInfo?.date||"—"}</td>
                        </tr>
                      )
                    })
                  })()}
                </tbody>
              </table>
            </div>
          )}

          {/* ── STATISTIQUES ── */}
          {onglet === "stats" && (
            <div style={{ display:"flex", flexDirection:"column", gap:20 }}>
              <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:16 }}>
                <div style={{ background:C.white, borderRadius:16, border:"1px solid "+C.border, padding:"20px 24px" }}>
                  <p style={{ fontSize:15, fontWeight:700, marginBottom:16 }}>Répartition des lignes</p>
                  {[
                    { label:"Lignes payées",     nb:toutesLignes.filter(l=>l.paye).length,  color:C.green },
                    { label:"Lignes en attente", nb:nbAttente,                               color:C.red   },
                  ].map(({ label, nb, color }) => {
                    const total = toutesLignes.length || 1
                    return (
                      <div key={label} style={{ marginBottom:12 }}>
                        <div style={{ display:"flex", justifyContent:"space-between", marginBottom:4 }}>
                          <span style={{ fontSize:13, color:C.textSec }}>{label}</span>
                          <span style={{ fontSize:13, fontWeight:700, color }}>{nb}</span>
                        </div>
                        <div style={{ height:8, borderRadius:4, background:"#e5e7eb", overflow:"hidden" }}>
                          <div style={{ height:"100%", width:`${(nb/total)*100}%`, background:color, borderRadius:4, transition:"width .5s" }} />
                        </div>
                      </div>
                    )
                  })}
                </div>
                <div style={{ background:C.white, borderRadius:16, border:"1px solid "+C.border, padding:"20px 24px", display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center" }}>
                  <p style={{ fontSize:15, fontWeight:700, marginBottom:16 }}>Taux de recouvrement</p>
                  <p style={{ fontSize:52, fontWeight:800, color:C.teal, letterSpacing:"-2px", lineHeight:1 }}>
                    {(totalAEncaisser+totalEncaisse) > 0 ? Math.round((totalEncaisse/(totalAEncaisser+totalEncaisse))*100) : 0}%
                  </p>
                  <p style={{ fontSize:13, color:C.textMuted, marginTop:8 }}>{fmtMoney(totalEncaisse)} / {fmtMoney(totalAEncaisser+totalEncaisse)}</p>
                </div>
              </div>
              <div style={{ background:C.white, borderRadius:16, border:"1px solid "+C.border, padding:"20px 24px" }}>
                <p style={{ fontSize:15, fontWeight:700, marginBottom:14 }}>Grille tarifaire — Consultation</p>
                <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:12 }}>
                  {[
                    { label:"Nourrisson", tranche:"< 5 ans",    tarif:30000, color:C.purple },
                    { label:"Enfant",     tranche:"5 – 14 ans", tarif:35000, color:C.blue   },
                    { label:"Adulte",     tranche:"15 – 60 ans",tarif:50000, color:C.green  },
                    { label:"Senior",     tranche:"> 60 ans",   tarif:40000, color:C.teal   },
                  ].map(({ label, tranche, tarif, color }) => (
                    <div key={label} style={{ background:color+"11", borderRadius:12, padding:"16px", border:"1px solid "+color+"33", textAlign:"center" }}>
                      <p style={{ fontSize:13, fontWeight:700, color, marginBottom:4 }}>{label}</p>
                      <p style={{ fontSize:11, color:C.textMuted, marginBottom:8 }}>{tranche}</p>
                      <p style={{ fontSize:22, fontWeight:800, color }}>{(tarif/1000).toFixed(0)}k GNF</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

        </main>
      </div>

      {mPmt && (
        <ModalPaiementConsultation
          entree={mPmt}
          patient={sharedPatients.find(p=>p.id===mPmt.patientId)}
          onClose={()=>setMPmt(null)}
          onSave={handleSavePmt}
        />
      )}
      {mPmtEx && (
        <ModalPaiementExamens
          entree={mPmtEx}
          onClose={()=>setMPmtEx(null)}
          onSave={handleSaveExamen}
        />
      )}
    </div>
  )
}