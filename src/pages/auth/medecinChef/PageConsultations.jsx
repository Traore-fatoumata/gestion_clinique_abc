import { useState } from "react"
import { useAuth } from "../../../hooks/useAuth.jsx"
import { C, Card, Avatar, StatutBadge, Overlay, INIT_MEDECINS, fmt, today } from "./shared.jsx"
import { estEnAttenteAccueil, consultationPourMedecin, libelleMotifFile, libelleServiceFile } from "../../../utils/clinicFlow.js"

function ModalConsultationChef({ patient, consultation, medecins, onClose, onValider }) {
  const { user } = useAuth()
  const [plaintes,     setPlaintes]     = useState(consultation?.plaintes||"")
  const [symptomes,    setSymptomes]    = useState(consultation?.symptomes||"")
  const [observations, setObservations] = useState(consultation?.observations||"")
  const [diagnostic,   setDiagnostic]   = useState(consultation?.diagnostic||"")
  const [docteurId,    setDocteurId]    = useState(consultation?.docteurId||"")

  if (!patient) return null
  const medecinChoisi = medecins.find(d => Number(d.id) === Number(docteurId))
  const ok = !!plaintes

  const iSt = { width:"100%", padding:"11px 14px", fontSize:14, border:"1.5px solid "+C.border, borderRadius:10, background:C.white, color:C.textPri, outline:"none", fontFamily:"inherit" }
  const foc  = e => { e.target.style.borderColor=C.blue; e.target.style.boxShadow="0 0 0 3px "+C.blueSoft }
  const blr  = e => { e.target.style.borderColor=C.border; e.target.style.boxShadow="none" }

  return (
    <Overlay onClose={onClose}>
      <div style={{ background:C.white, borderRadius:20, width:"100%", maxWidth:680, maxHeight:"92vh", overflow:"auto", boxShadow:"0 25px 60px rgba(0,0,0,0.2)" }}>
        <div style={{ padding:"20px 28px 18px", background:"linear-gradient(135deg,#14532d,#16a34a)", borderRadius:"20px 20px 0 0", display:"flex", justifyContent:"space-between", alignItems:"center" }}>
          <div>
            <p style={{ fontSize:17, fontWeight:800, color:"#fff", marginBottom:3 }}>{patient.nom}</p>
            <p style={{ fontSize:12, color:"rgba(255,255,255,0.75)" }}>
              {patient.pid} · Consultation d'accueil
              {consultation?.arrivee ? " · Arrivée "+consultation.arrivee : ""}
            </p>
          </div>
          <button onClick={onClose} style={{ background:"rgba(255,255,255,0.2)", border:"none", borderRadius:8, color:"#fff", cursor:"pointer", width:32, height:32, display:"flex", alignItems:"center", justifyContent:"center", fontSize:18 }}>×</button>
        </div>

        <div style={{ padding:"24px 28px", display:"flex", flexDirection:"column", gap:18 }}>
          <div style={{ background:C.bg, borderRadius:14, padding:"16px 18px", border:"1px solid "+C.border }}>
            <p style={{ fontSize:11, fontWeight:700, color:C.textPri, textTransform:"uppercase", letterSpacing:"0.1em", marginBottom:14 }}>
              Étape 1 — Plaintes &amp; Symptômes
            </p>
            <div style={{ display:"flex", flexDirection:"column", gap:12 }}>
              <div>
                <label style={{ display:"block", fontSize:13, fontWeight:600, color:C.textPri, marginBottom:6 }}>
                  Plaintes du patient <span style={{ color:C.red }}>*</span>
                </label>
                <textarea value={plaintes} onChange={e=>setPlaintes(e.target.value)} rows={2}
                  placeholder="Ex : Douleur à la poitrine depuis 2 jours, toux sèche..."
                  style={{ ...iSt, resize:"none" }} onFocus={foc} onBlur={blr}/>
              </div>
              <div>
                <label style={{ display:"block", fontSize:13, fontWeight:600, color:C.textPri, marginBottom:6 }}>Symptômes observés</label>
                <textarea value={symptomes} onChange={e=>setSymptomes(e.target.value)} rows={2}
                  placeholder="Ex : TA 14/9, Température 38.5°C..."
                  style={{ ...iSt, resize:"none" }} onFocus={foc} onBlur={blr}/>
              </div>
              <div>
                <label style={{ display:"block", fontSize:13, fontWeight:600, color:C.textPri, marginBottom:6 }}>Observations / Antécédents</label>
                <input value={observations} onChange={e=>setObservations(e.target.value)}
                  placeholder="Ex : Patient hypertendu connu, allergie au pénicilline..."
                  style={iSt} onFocus={foc} onBlur={blr}/>
              </div>
            </div>
          </div>

          <div style={{ background:C.bg, borderRadius:14, padding:"16px 18px", border:"1px solid "+C.border }}>
            <p style={{ fontSize:11, fontWeight:700, color:C.textPri, textTransform:"uppercase", letterSpacing:"0.1em", marginBottom:14 }}>
              Étape 2 — Diagnostic de présomption
            </p>
            <input value={diagnostic} onChange={e=>setDiagnostic(e.target.value)}
              placeholder="Ex : Suspicion HTA, Paludisme, Infection respiratoire aiguë..."
              style={iSt} onFocus={foc} onBlur={blr}/>
            <p style={{ fontSize:11, color:C.textMuted, marginTop:6 }}>
              Le diagnostic final sera posé lors de la consultation complète.
            </p>
          </div>

          <div style={{ background:C.bg, borderRadius:14, padding:"16px 18px", border:"1px solid "+C.border }}>
            <p style={{ fontSize:11, fontWeight:700, color:C.textPri, textTransform:"uppercase", letterSpacing:"0.1em", marginBottom:14 }}>
              Étape 3 — Assigner au médecin de service
            </p>
            <select value={docteurId} onChange={e=>setDocteurId(e.target.value)}
              style={{ ...iSt, cursor:"pointer" }}>
              <option value="">— {user?.nom || "Dr. Doumbouya"} garde le patient (Médecine générale) —</option>
              {medecins.filter(d=>!d.estChef&&d.statut==="actif").map(d=>(
                <option key={d.id} value={d.id}>{d.nom} — {d.specialite}</option>
              ))}
            </select>
            {medecinChoisi
              ? <div style={{ marginTop:10, padding:"10px 14px", background:C.greenSoft, borderRadius:10, border:"1px solid "+C.green+"33" }}>
                  <p style={{ fontSize:13, color:C.green, fontWeight:600 }}>Patient orienté vers {medecinChoisi.nom} — {medecinChoisi.specialite}</p>
                </div>
              : <p style={{ fontSize:11, color:C.textMuted, marginTop:6 }}>Laisser vide → consultation complète s'ouvrira ensuite.</p>
            }
          </div>

          <div style={{ background:C.bg, borderRadius:14, padding:"16px 18px", border:"1px solid "+C.border }}>
            <p style={{ fontSize:11, fontWeight:700, color:C.textPri, textTransform:"uppercase", letterSpacing:"0.1em", marginBottom:14 }}>
              Tarif consultation (modifiable)
            </p>
            <input value={consultation? (consultation.montantConsultation ?? "") : ""} onChange={() => { /* valeur gérée localement lors de l'ouverture modal via setMConsult */ }}
              placeholder="Montant GNF — laissé vide pour tarif par défaut"
              style={{ width:"100%", padding:"11px 14px", fontSize:14, border:"1.5px solid "+C.border, borderRadius:10, background:C.white, color:C.textPri, outline:"none", fontFamily:"inherit" }} readOnly />
            <p style={{ fontSize:11, color:C.textMuted, marginTop:8 }}>
              Le montant peut être ajusté lors de la consultation complète.
            </p>
          </div>

          <div style={{ background:C.slateSoft, border:"1px solid "+C.slate+"33", borderRadius:10, padding:"12px 16px", display:"flex", gap:8 }}>
            <span style={{ fontSize:16, flexShrink:0 }}>ℹ️</span>
            <p style={{ fontSize:13, color:C.slate, lineHeight:1.5 }}>
              {medecinChoisi
                ? <>Patient dirigé vers <strong>{medecinChoisi.nom} ({medecinChoisi.specialite})</strong> après validation.</>
                : <>Le médecin chef garde le patient — la consultation complète s'ouvrira automatiquement.</>
              }
            </p>
          </div>

          <div style={{ display:"flex", justifyContent:"flex-end", gap:10, paddingTop:8, borderTop:"1px solid "+C.border }}>
            <button onClick={onClose}
              style={{ padding:"10px 20px", border:"1px solid "+C.border, borderRadius:10, background:"transparent", color:C.textSec, fontSize:13, fontWeight:600, cursor:"pointer", fontFamily:"inherit" }}>
              Annuler
            </button>
            <button
              onClick={()=>{
                if(!ok){ alert("Les plaintes sont obligatoires."); return }
                onValider({ plaintes, symptomes, observations, diagnostic, docteurId:docteurId?parseInt(docteurId):null })
              }}
              disabled={!ok}
              style={{ padding:"10px 24px", border:"none", borderRadius:10, background:ok?C.green:"#94a3b8", color:"#fff", fontSize:13, fontWeight:700, cursor:ok?"pointer":"not-allowed", fontFamily:"inherit", display:"flex", alignItems:"center", gap:8 }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><polyline points="20 6 9 17 4 12"/></svg>
              {medecinChoisi ? "Valider & Assigner" : "Valider & Continuer"}
            </button>
          </div>
        </div>
      </div>
    </Overlay>
  )
}

function ModalModifier({ consultation, patient, onClose, onModifier }) {
  const { user } = useAuth()
  const [motif,  setMotif]  = useState(consultation?.motif||consultation?.plaintes||"")
  const [diag,   setDiag]   = useState("")
  const [trait,  setTrait]  = useState("")
  const [raison, setRaison] = useState("")
  if (!consultation||!patient) return null
  const iSt = { width:"100%", padding:"11px 14px", fontSize:14, border:"1.5px solid "+C.border, borderRadius:10, background:C.white, color:C.textPri, outline:"none", fontFamily:"inherit" }
  return (
    <Overlay onClose={onClose}>
      <div style={{ background:C.white, borderRadius:20, width:"100%", maxWidth:520, maxHeight:"90vh", overflow:"auto", boxShadow:"0 25px 60px rgba(0,0,0,0.2)" }}>
        <div style={{ padding:"22px 28px 18px", borderBottom:"1px solid "+C.border, display:"flex", justifyContent:"space-between" }}>
          <div>
            <p style={{ fontSize:18, fontWeight:800, color:C.textPri }}>Modifier la consultation</p>
            <p style={{ fontSize:13, color:C.textSec, marginTop:3 }}>{patient.nom} · {fmt(consultation.date)} · {consultation.service}</p>
          </div>
          <button onClick={onClose} style={{ background:C.slateSoft, border:"none", borderRadius:8, color:C.textSec, cursor:"pointer", width:32, height:32, display:"flex", alignItems:"center", justifyContent:"center", fontSize:18 }}>×</button>
        </div>
        <div style={{ padding:"24px 28px", display:"flex", flexDirection:"column", gap:14 }}>
          <div style={{ background:C.slateSoft, border:"1px solid "+C.slate+"33", borderRadius:10, padding:"12px 16px" }}>
            <p style={{ fontSize:13, color:C.slate, fontWeight:600 }}>Modification autorisée uniquement par le médecin chef. Action enregistrée dans l'audit.</p>
          </div>
          <div>
            <label style={{ display:"block", fontSize:13, fontWeight:600, color:C.textPri, marginBottom:6 }}>Motif / Plaintes</label>
            <input value={motif} onChange={e=>setMotif(e.target.value)} style={iSt} onFocus={e=>e.target.style.borderColor=C.blue} onBlur={e=>e.target.style.borderColor=C.border}/>
          </div>
          <div>
            <label style={{ display:"block", fontSize:13, fontWeight:600, color:C.textPri, marginBottom:6 }}>Diagnostic corrigé</label>
            <input value={diag} onChange={e=>setDiag(e.target.value)} placeholder="Nouveau diagnostic si erreur" style={iSt} onFocus={e=>e.target.style.borderColor=C.blue} onBlur={e=>e.target.style.borderColor=C.border}/>
          </div>
          <div>
            <label style={{ display:"block", fontSize:13, fontWeight:600, color:C.textPri, marginBottom:6 }}>Traitement corrigé</label>
            <input value={trait} onChange={e=>setTrait(e.target.value)} placeholder="Nouveau traitement si erreur" style={iSt} onFocus={e=>e.target.style.borderColor=C.blue} onBlur={e=>e.target.style.borderColor=C.border}/>
          </div>
          <div>
            <label style={{ display:"block", fontSize:13, fontWeight:600, color:C.textPri, marginBottom:6 }}>Raison de la modification <span style={{ color:C.red }}>*</span></label>
            <textarea value={raison} onChange={e=>setRaison(e.target.value)} rows={3}
              placeholder="Expliquez pourquoi cette consultation est modifiée…"
              style={{ ...iSt, resize:"vertical" }} onFocus={e=>e.target.style.borderColor=C.blue} onBlur={e=>e.target.style.borderColor=C.border}/>
          </div>
          <div style={{ display:"flex", justifyContent:"flex-end", gap:10, paddingTop:8, borderTop:"1px solid "+C.border }}>
            <button onClick={onClose} style={{ padding:"9px 20px", border:"1px solid "+C.border, borderRadius:10, background:"transparent", color:C.textSec, fontSize:13, fontWeight:600, cursor:"pointer", fontFamily:"inherit" }}>Annuler</button>
            <button onClick={()=>{ if(!raison){ alert("La raison est obligatoire."); return }; onModifier(consultation.id, { motif, ...(diag&&{diagnostic:diag}), ...(trait&&{traitement:trait}), modifiePar:(user?.nom||"Dr. Doumbouya")+" — "+raison }); onClose() }}
              style={{ padding:"9px 20px", border:"none", borderRadius:10, background:C.slate, color:"#fff", fontSize:13, fontWeight:600, cursor:"pointer", fontFamily:"inherit" }}>
              Confirmer
            </button>
          </div>
        </div>
      </div>
    </Overlay>
  )
}

export default function PageConsultations({ consultations, patients, file, medecins, onValider, onModifier, onContinuerConsultation, onReprendreConsultation }) {
  const { user } = useAuth()
  const [mConsult, setMConsult] = useState(null)
  const [mModif,   setMModif]   = useState(null)
  const [onglet,   setOnglet]   = useState("attente")   // "attente" | "mes_consults" | "toutes"
  const [filtreService, setFiltreService] = useState("tous")
  const [recherche,     setRecherche]     = useState("")

  // Montrer uniquement les entrées qui concernent le médecin connecté :
  // - celles explicitement assignées (`docteurId === currentDoctorId`)
  // - ou celles sans assignation (null) pour lesquelles le chef prend en charge
  const currentDoctorId = Number(user?.id)
  const fileAccueil = (file || []).filter(f => estEnAttenteAccueil(f, consultations))

  const todayStr = today()
  const mesConsultations = consultations.filter(c =>
    consultationPourMedecin(c, file, currentDoctorId, todayStr)
  )
  const nonSignees = mesConsultations.filter(c => !c.signe)

  const servicesDispo = [...new Set(consultations.map(c=>c.service))].filter(Boolean)
  const toutesFiltrees = [...consultations]
    .filter(c => c.signe === true)
    .sort((a,b)=>b.date.localeCompare(a.date))
    .filter(c=>{
      const p=patients.find(pt=>pt.id===c.patientId)
      const q=recherche.toLowerCase()
      const okR=!q||(p&&p.nom.toLowerCase().includes(q))||(c.service||"").toLowerCase().includes(q)||(c.plaintes||c.motif||"").toLowerCase().includes(q)
      const okS=filtreService==="tous"||c.service===filtreService
      return okR&&okS
    })

  const ONGLETS = [
    { id:"attente",      label:"File d'accueil",      count: fileAccueil.length },
    { id:"mes_consults", label:"Mes consultations",   count: mesConsultations.length, badge: nonSignees.length },
    { id:"toutes",       label:"Toutes les consultations", count: toutesFiltrees.length },
  ]

  return (
    <div style={{ maxWidth:960, margin:"0 auto" }}>
      <p style={{ fontSize:28, fontWeight:800, color:C.textPri, letterSpacing:"-0.5px", marginBottom:4 }}>Consultations</p>
      <p style={{ fontSize:14, color:C.textSec, marginBottom:20 }}>
        Gestion complète des consultations · Modification possible en cas d'erreur médicale
      </p>

      {/* Onglets */}
      <div style={{ display:"flex", gap:4, marginBottom:20, background:C.white, padding:5, borderRadius:14, border:"1px solid "+C.border, width:"fit-content" }}>
        {ONGLETS.map(o=>(
          <button key={o.id} onClick={()=>setOnglet(o.id)}
            style={{ padding:"8px 16px", borderRadius:10, border:"none", background:onglet===o.id?C.green:"transparent",
              color:onglet===o.id?"#fff":C.textSec, fontSize:13, fontWeight:onglet===o.id?700:500,
              cursor:"pointer", fontFamily:"inherit", display:"flex", alignItems:"center", gap:6 }}>
            {o.label}
            <span style={{ fontSize:11, fontWeight:700, background:onglet===o.id?"rgba(255,255,255,0.25)":C.slateSoft,
              color:onglet===o.id?"#fff":C.textMuted, padding:"1px 7px", borderRadius:20 }}>
              {o.count}
            </span>
            {o.badge > 0 && (
              <span style={{ fontSize:10, fontWeight:700, background:C.red, color:"#fff", padding:"1px 6px", borderRadius:20 }}>
                {o.badge} à signer
              </span>
            )}
          </button>
        ))}
      </div>

      {mConsult && (
        <ModalConsultationChef
          patient={patients.find(p=>p.id===mConsult.patientId)}
          consultation={mConsult}
          medecins={medecins}
          onClose={()=>setMConsult(null)}
          onValider={data=>{
            onValider(mConsult.id, {
              ...data,
              patientId: mConsult.patientId,
              fileId:    mConsult.id,
            })
            setMConsult(null)
          }}
        />
      )}

      {mModif && (
        <ModalModifier
          consultation={mModif}
          patient={patients.find(p=>p.id===mModif.patientId)}
          onClose={()=>setMModif(null)}
          onModifier={onModifier}
        />
      )}

      {/* ── ONGLET : File d'accueil ── */}
      {onglet === "attente" && (
        fileAccueil.length === 0
          ? <Card style={{ padding:40, textAlign:"center" }}>
              <p style={{ color:C.textMuted }}>Aucun patient en attente de consultation d'accueil</p>
            </Card>
          : <Card style={{ border:"1.5px solid "+C.green+"55" }}>
              <div style={{ padding:"16px 20px", borderBottom:"1px solid "+C.border, background:C.greenSoft, borderRadius:"16px 16px 0 0", display:"flex", alignItems:"center", gap:10 }}>
                <div style={{ width:8, height:8, borderRadius:"50%", background:C.green, animation:"blink 2s ease-in-out infinite" }}/>
                <p style={{ fontSize:15, fontWeight:700, color:C.textPri }}>
                  {fileAccueil.length} patient{fileAccueil.length>1?"s":""} en attente
                </p>
              </div>
              {fileAccueil.map((c,i)=>{
                const p = patients.find(pt=>pt.id===c.patientId)
                if (!p) return null
                const estGratuit = c.montantConsultation === 0 || c.typeVisite === "rendez_vous"
                const paye = c.typeVisite==="rendez_vous" || c.paiementConsultation?.statut==="paye" || estGratuit
                return (
                  <div key={`${c.id}-${i}`} style={{ padding:"16px 20px", display:"flex", alignItems:"center", gap:14, borderBottom:i<fileAccueil.length-1?"1px solid "+C.border:"none" }}>
                    <Avatar name={p.nom} size={44}/>
                    <div style={{ flex:1 }}>
                      <p style={{ fontSize:14, fontWeight:700, color:C.textPri, marginBottom:3 }}>{p.nom}</p>
                      <p style={{ fontSize:13, color:C.textSec }}>
                        {libelleMotifFile(c, paye)}
                        {libelleServiceFile(c) ? (
                          <> · <span style={{ color:C.blue, fontWeight:600 }}>{libelleServiceFile(c)}</span></>
                        ) : null}
                      </p>
                    </div>
                    {c.arrivee && (
                      <div style={{ textAlign:"center", padding:"8px 16px", background:C.greenSoft, border:"1px solid "+C.green+"33", borderRadius:10 }}>
                        <p style={{ fontSize:10,color:C.textMuted,textTransform:"uppercase",marginBottom:2 }}>Arrivée</p>
                        <p style={{ fontSize:16,fontWeight:800,color:C.green }}>{c.arrivee}</p>
                      </div>
                    )}
                    {paye
                      ? <span style={{ fontSize:11,fontWeight:700,background:estGratuit?"#eff6ff":"#dcfce7",color:estGratuit?"#1d4ed8":"#15803d",padding:"4px 10px",borderRadius:20,flexShrink:0 }}>{estGratuit?"Gratuit" : "Payé"}</span>
                      : <span style={{ fontSize:11,fontWeight:700,background:"#fee2e2",color:"#dc2626",padding:"4px 10px",borderRadius:20,flexShrink:0 }}>En attente paiement</span>
                    }
                    <button
                      onClick={()=>{ if(!paye){ alert("Ce patient n'a pas encore payé. Veuillez l'orienter vers la comptabilité."); return }; setMConsult(c) }}
                      style={{ display:"flex",alignItems:"center",gap:8,padding:"10px 20px",background:paye?C.green:"#9ca3af",color:"#fff",border:"none",borderRadius:10,fontSize:13,fontWeight:700,cursor:paye?"pointer":"not-allowed",fontFamily:"inherit",flexShrink:0 }}
                      onMouseEnter={e=>{ if(paye) e.currentTarget.style.background="#15803d" }}
                      onMouseLeave={e=>{ if(paye) e.currentTarget.style.background=C.green }}>
                      Consulter
                    </button>
                  </div>
                )
              })}
            </Card>
      )}

      {/* ── ONGLET : Mes consultations ── */}
      {onglet === "mes_consults" && (
        <Card>
          <div style={{ padding:"16px 20px", borderBottom:"1px solid "+C.border }}>
            <p style={{ fontSize:15, fontWeight:700, color:C.textPri }}>Mes consultations — {mesConsultations.length} au total</p>
            <p style={{ fontSize:13, color:C.textMuted }}>{nonSignees.length} non signée{nonSignees.length>1?"s":""}</p>
          </div>
          <table style={{ width:"100%", borderCollapse:"collapse" }}>
            <thead>
              <tr style={{ background:C.slateSoft }}>
                {["Patient","Date","Motif / Plaintes","Diagnostic","Statut","Action"].map(h=>(
                  <th key={h} style={{ padding:"11px 12px", textAlign:"left", fontSize:11, fontWeight:700, color:C.textSec, textTransform:"uppercase", letterSpacing:"0.05em" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {mesConsultations.length === 0
                ? <tr><td colSpan={6} style={{ padding:40, textAlign:"center", color:C.textMuted }}>Aucune consultation enregistrée</td></tr>
                : [...mesConsultations].sort((a,b)=>b.date.localeCompare(a.date)).map((c,i,arr)=>{
                    const p = patients.find(pt=>pt.id===c.patientId)
                    if (!p) return null
                    return (
                      <tr key={`${c.id}-${i}`}
                        style={{ borderBottom:i<arr.length-1?"1px solid "+C.border:"none", background:!c.signe?"#fff8f8":"transparent", transition:"background .15s" }}
                        onMouseEnter={e=>e.currentTarget.style.background=C.slateSoft}
                        onMouseLeave={e=>e.currentTarget.style.background=!c.signe?"#fff8f8":"transparent"}>
                        <td style={{ padding:"12px 12px" }}>
                          <div style={{ display:"flex", alignItems:"center", gap:8 }}>
                            <Avatar name={p.nom} size={30}/>
                            <p style={{ fontSize:13, fontWeight:600, color:C.textPri }}>{p.nom}</p>
                          </div>
                        </td>
                        <td style={{ padding:"12px 12px", fontSize:12, color:C.textMuted }}>{fmt(c.date)}</td>
                        <td style={{ padding:"12px 12px", fontSize:12, color:C.textSec, maxWidth:160 }}>{c.plaintes||c.motif||"—"}</td>
                        <td style={{ padding:"12px 12px", fontSize:12, color:C.textSec }}>{(c.diagnostics||[]).join(", ")||"—"}</td>
                        <td style={{ padding:"12px 12px" }}>
                          {c.signe
                            ? <span style={{ fontSize:11,fontWeight:700,background:C.greenSoft,color:C.green,padding:"3px 10px",borderRadius:20 }}>Signé</span>
                            : <span style={{ fontSize:11,fontWeight:700,background:"#fee2e2",color:C.red,padding:"3px 10px",borderRadius:20 }}>Non signé</span>
                          }
                        </td>
                        <td style={{ padding:"12px 12px", display:"flex", gap:6 }}>
                          {c.signe ? (
                            <>
                              <button onClick={()=>setMModif(c)}
                                style={{ padding:"6px 12px", border:"1px solid "+C.slate+"44", borderRadius:8, background:C.slateSoft, color:C.slate, fontSize:12, fontWeight:600, cursor:"pointer", fontFamily:"inherit" }}>
                                Modifier
                              </button>
                              <button onClick={()=> onContinuerConsultation && onContinuerConsultation(c)}
                                style={{ padding:"6px 12px", border:"none", borderRadius:8, background:C.blue, color:"#fff", fontSize:12, fontWeight:600, cursor:"pointer", fontFamily:"inherit" }}>
                                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" style={{ marginRight:4 }}><polyline points="6 9 6 2 18 2 18 9"/><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/><rect x="6" y="14" width="12" height="8"/></svg>
                                Ordonnance
                              </button>
                            </>
                          ) : (
                            <button onClick={()=>{
                    if (onReprendreConsultation) {
                      onReprendreConsultation(c)
                      return
                    }
                    const fileEntry = file.find(f => f.patientId === c.patientId && f.statut !== "termine")
                    setMConsult({ ...c, fileId: fileEntry?.id })
                  }}
                              style={{ padding:"6px 12px", border:"none", borderRadius:8, background:C.green, color:"#fff", fontSize:12, fontWeight:600, cursor:"pointer", fontFamily:"inherit", display:"flex", alignItems:"center", gap:4 }}>
                              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                              Continuer
                            </button>
                          )}
                        </td>
                      </tr>
                    )
                  })
              }
            </tbody>
          </table>
        </Card>
      )}

      {/* ── ONGLET : Toutes les consultations ── */}
      {onglet === "toutes" && (
        <Card>
          <div style={{ padding:"16px 20px", borderBottom:"1px solid "+C.border }}>
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", flexWrap:"wrap", gap:10 }}>
              <div>
                <p style={{ fontSize:15, fontWeight:700, color:C.textPri }}>Toutes les consultations — tous services</p>
                <p style={{ fontSize:13, color:C.textMuted }}>{toutesFiltrees.length} résultat{toutesFiltrees.length>1?"s":""}</p>
              </div>
              <div style={{ display:"flex", gap:10, flexWrap:"wrap" }}>
                <select value={filtreService} onChange={e=>setFiltreService(e.target.value)}
                  style={{ padding:"8px 14px",fontSize:13,border:"1.5px solid "+C.border,borderRadius:10,background:C.white,color:C.textPri,outline:"none",fontFamily:"inherit",cursor:"pointer" }}>
                  <option value="tous">Tous les services</option>
                  {servicesDispo.map(s=><option key={s} value={s}>{s}</option>)}
                </select>
                <div style={{ position:"relative" }}>
                  <svg style={{ position:"absolute",left:10,top:"50%",transform:"translateY(-50%)",pointerEvents:"none" }} width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={C.textMuted} strokeWidth="2" strokeLinecap="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
                  <input placeholder="Patient, plaintes, service…" value={recherche} onChange={e=>setRecherche(e.target.value)}
                    style={{ padding:"8px 12px 8px 30px",fontSize:13,border:"1.5px solid "+C.border,borderRadius:10,background:C.bg,color:C.textPri,outline:"none",fontFamily:"inherit",width:210 }}
                    onFocus={e=>{ e.target.style.borderColor=C.blue; e.target.style.background=C.white }}
                    onBlur={e=>{ e.target.style.borderColor=C.border; e.target.style.background=C.bg }}/>
                </div>
              </div>
            </div>
          </div>
          <table style={{ width:"100%", borderCollapse:"collapse" }}>
            <thead>
              <tr style={{ background:C.slateSoft }}>
                {["Date","Patient","Service","Plaintes / Motif","Médecin","Statut","Action"].map(h=>(
                  <th key={h} style={{ padding:"11px 12px", textAlign:"left", fontSize:11, fontWeight:700, color:C.textSec, letterSpacing:"0.05em", textTransform:"uppercase", whiteSpace:"nowrap" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {toutesFiltrees.length===0
                ? <tr><td colSpan={7} style={{ padding:40, textAlign:"center", color:C.textMuted }}>Aucune consultation trouvée</td></tr>
                : toutesFiltrees.map((c,i,arr)=>{
                    const p  = patients.find(pt=>pt.id===c.patientId)
                    const dr = INIT_MEDECINS.find(d=>d.id===c.docteurId)
                    if (!p) return null
                    return (
                      <tr key={`${c.id}-${i}`} style={{ borderBottom:i<arr.length-1?"1px solid "+C.border:"none", transition:"background .15s" }}
                        onMouseEnter={e=>e.currentTarget.style.background=C.slateSoft}
                        onMouseLeave={e=>e.currentTarget.style.background="transparent"}>
                        <td style={{ padding:"12px 12px", fontSize:12, color:C.textMuted, whiteSpace:"nowrap" }}>{fmt(c.date)}</td>
                        <td style={{ padding:"12px 12px" }}>
                          <div style={{ display:"flex", alignItems:"center", gap:8 }}>
                            <Avatar name={p.nom} size={28}/>
                            <p style={{ fontSize:13, fontWeight:600, color:C.textPri }}>{p.nom}</p>
                          </div>
                        </td>
                        <td style={{ padding:"12px 12px" }}>
                          <span style={{ fontSize:11, fontWeight:600, background:C.blueSoft, color:C.textPri, padding:"3px 9px", borderRadius:10 }}>{c.service}</span>
                        </td>
                        <td style={{ padding:"12px 12px", fontSize:12, color:C.textSec, maxWidth:160 }}>
                          {(c.plaintes||c.motif||"—").split(",").slice(0,2).join(",")}
                        </td>
                        <td style={{ padding:"12px 12px", fontSize:12, color:dr?C.textPri:C.textMuted }}>
                          {dr ? dr.nom : (c.signePar||c.medecinNom||"—")}
                        </td>
                        <td style={{ padding:"12px 12px" }}>
                          <span style={{ fontSize:11,fontWeight:700,background:C.greenSoft,color:C.green,padding:"3px 10px",borderRadius:20 }}>Signé & validé</span>
                        </td>
                        <td style={{ padding:"12px 12px" }}>
                          <button onClick={()=>setMModif(c)}
                            style={{ display:"flex",alignItems:"center",gap:5,padding:"6px 12px",background:C.slateSoft,border:"1px solid "+C.slate+"44",borderRadius:8,color:C.slate,fontSize:12,fontWeight:600,cursor:"pointer",fontFamily:"inherit" }}
                            onMouseEnter={e=>{ e.currentTarget.style.background=C.slate; e.currentTarget.style.color="#fff" }}
                            onMouseLeave={e=>{ e.currentTarget.style.background=C.slateSoft; e.currentTarget.style.color=C.slate }}>
                            Modifier
                          </button>
                        </td>
                      </tr>
                    )
                  })
              }
            </tbody>
          </table>
          <p style={{ textAlign:"center", fontSize:12, color:C.textMuted, padding:"14px 0", borderTop:"1px solid "+C.border }}>© 2026 Clinique ABC Marouane. Tous droits réservés.</p>
        </Card>
      )}
    </div>
  )
}