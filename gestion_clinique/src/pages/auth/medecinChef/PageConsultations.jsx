import { useState } from "react"
import { useAuth } from "../../../hooks/useAuth.jsx"
import { C, Card, Avatar, StatutBadge, Overlay, Btn, FInput, Inp, Sel, SERVICES, INIT_MEDECINS, fmt } from "./shared.jsx"

function ModalConsultationChef({ patient, consultation, medecins, onClose, onValider }) {
  const { user } = useAuth()
  const [plaintes,     setPlaintes]     = useState(consultation?.plaintes||"")
  const [symptomes,    setSymptomes]    = useState(consultation?.symptomes||"")
  const [observations, setObservations] = useState(consultation?.observations||"")
  const [diagnostic,   setDiagnostic]   = useState(consultation?.diagnostic||"")
  const [traitement,   setTraitement]   = useState(consultation?.traitement||"")
  const [docteurId,    setDocteurId]    = useState(consultation?.docteurId||"")

  if (!patient) return null
  const medecinChoisi = medecins.find(d=>d.id===parseInt(docteurId))
  const ok = !!plaintes

  const iSt = { width:"100%", padding:"11px 14px", fontSize:14, border:"1.5px solid "+C.border, borderRadius:10, background:C.white, color:C.textPri, outline:"none", fontFamily:"inherit" }
  const foc  = e => { e.target.style.borderColor=C.blue; e.target.style.boxShadow="0 0 0 3px "+C.blueSoft }
  const blr  = e => { e.target.style.borderColor=C.border; e.target.style.boxShadow="none" }

  return (
    <Overlay onClose={onClose}>
      <div style={{ background:C.white, borderRadius:20, width:"100%", maxWidth:680, maxHeight:"92vh", overflow:"auto", boxShadow:"0 25px 60px rgba(0,0,0,0.2)" }}>

        {/* Header */}
        <div style={{ padding:"20px 28px 18px", background:"linear-gradient(135deg,#14532d,#16a34a)", borderRadius:"20px 20px 0 0", display:"flex", justifyContent:"space-between", alignItems:"center" }}>
          <div>
            <p style={{ fontSize:17, fontWeight:800, color:"#fff", marginBottom:3 }}>{patient.nom}</p>
            <p style={{ fontSize:12, color:"rgba(255,255,255,0.75)" }}>
              {patient.pid} · {patient.age||"—"}
              {consultation?.typeVisite==="rendez_vous" ? " · Rendez-vous" : " · Consultation"}
              {consultation?.arrivee ? " · Arrivée "+consultation.arrivee : ""}
            </p>
          </div>
          <button onClick={onClose} style={{ background:"rgba(255,255,255,0.2)", border:"none", borderRadius:8, color:"#fff", cursor:"pointer", width:32, height:32, display:"flex", alignItems:"center", justifyContent:"center", fontSize:18 }}>×</button>
        </div>

        <div style={{ padding:"24px 28px", display:"flex", flexDirection:"column", gap:18 }}>

          {/* ── ÉTAPE 1 : Plaintes & Symptômes ── */}
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
                  placeholder="Ex : Douleur à la poitrine depuis 2 jours, toux sèche, maux de tête..."
                  style={{ ...iSt, resize:"none" }} onFocus={foc} onBlur={blr}/>
              </div>
              <div>
                <label style={{ display:"block", fontSize:13, fontWeight:600, color:C.textPri, marginBottom:6 }}>
                  Symptômes observés
                </label>
                <textarea value={symptomes} onChange={e=>setSymptomes(e.target.value)} rows={2}
                  placeholder="Ex : TA 14/9, Température 38.5°C, fréquence cardiaque élevée..."
                  style={{ ...iSt, resize:"none" }} onFocus={foc} onBlur={blr}/>
              </div>
              <div>
                <label style={{ display:"block", fontSize:13, fontWeight:600, color:C.textPri, marginBottom:6 }}>
                  Observations / Antécédents
                </label>
                <input value={observations} onChange={e=>setObservations(e.target.value)}
                  placeholder="Ex : Patient hypertendu connu, diabétique, allergie au pénicilline..."
                  style={iSt} onFocus={foc} onBlur={blr}/>
              </div>
            </div>
          </div>

          {/* ── ÉTAPE 2 : Diagnostic de présomption ── */}
          <div style={{ background:C.bg, borderRadius:14, padding:"16px 18px", border:"1px solid "+C.border }}>
            <p style={{ fontSize:11, fontWeight:700, color:C.textPri, textTransform:"uppercase", letterSpacing:"0.1em", marginBottom:14 }}>
              Étape 2 — Diagnostic de présomption
            </p>
            <input value={diagnostic} onChange={e=>setDiagnostic(e.target.value)}
              placeholder="Ex : Suspicion HTA, Paludisme, Infection respiratoire aiguë..."
              style={iSt} onFocus={foc} onBlur={blr}/>
            <p style={{ fontSize:11, color:C.textMuted, marginTop:6 }}>
              Le diagnostic final sera posé par le médecin de service lors de la consultation approfondie.
            </p>
          </div>

          {/* ── ÉTAPE 3 : Assignation ── */}
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
              ? <div style={{ marginTop:10, padding:"10px 14px", background:C.greenSoft, borderRadius:10, border:"1px solid "+C.green+"33", display:"flex", alignItems:"center", gap:8 }}>

                  <p style={{ fontSize:13, color:C.green, fontWeight:600 }}>Patient orienté vers {medecinChoisi.nom} — {medecinChoisi.specialite}</p>
                </div>
              : <p style={{ fontSize:11, color:C.textMuted, marginTop:6 }}>Laisser vide si {user?.nom || "Dr. Doumbouya"} assure lui-même la consultation.</p>
            }
          </div>

          {/* ── ÉTAPE 3b : Traitement (si chef garde le patient) ── */}
          {!medecinChoisi && (
            <div style={{ background:C.bg, borderRadius:14, padding:"16px 18px", border:"1.5px solid "+C.green+"44" }}>
              <p style={{ fontSize:11, fontWeight:700, color:C.green, textTransform:"uppercase", letterSpacing:"0.1em", marginBottom:14 }}>
                Traitement &amp; Ordonnance — Consultation complète
              </p>
              <div>
                <label style={{ display:"block", fontSize:13, fontWeight:600, color:C.textPri, marginBottom:6 }}>
                  Traitement prescrit / Ordonnance
                </label>
                <textarea value={traitement} onChange={e=>setTraitement(e.target.value)} rows={3}
                  placeholder="Ex : Amoxicilline 500mg 3×/j pendant 7j, Paracétamol 1g si fièvre, Repos 48h…"
                  style={{ ...iSt, resize:"none" }} onFocus={foc} onBlur={blr}/>
                <p style={{ fontSize:11, color:C.textMuted, marginTop:5 }}>
                  Le tarif sera calculé automatiquement selon l'âge du patient (nourrisson / enfant / adulte / senior).
                </p>
              </div>
            </div>
          )}

          {/* Info orientation */}
          <div style={{ background:C.slateSoft, border:"1px solid "+C.slate+"33", borderRadius:10, padding:"12px 16px", display:"flex", gap:8 }}>
            <span style={{ fontSize:16, flexShrink:0 }}>ℹ️</span>
            <p style={{ fontSize:13, color:C.slate, lineHeight:1.5 }}>
              {medecinChoisi
                ? <>Après validation, le patient sera dirigé vers <strong>{medecinChoisi.nom} ({medecinChoisi.specialite})</strong>. Le tarif est calculé automatiquement selon l'âge du patient.</>
                : <>Le médecin chef assure lui-même la consultation. Le tarif sera calculé automatiquement selon l'âge du patient et communiqué à la comptabilité.</>
              }
            </p>
          </div>

          {/* Boutons */}
          <div style={{ display:"flex", justifyContent:"flex-end", gap:10, paddingTop:8, borderTop:"1px solid "+C.border }}>
            <button onClick={onClose}
              style={{ padding:"10px 20px", border:"1px solid "+C.border, borderRadius:10, background:"transparent", color:C.textSec, fontSize:13, fontWeight:600, cursor:"pointer", fontFamily:"inherit" }}>
              Annuler
            </button>
            <button onClick={()=>{
                if(!ok){ alert("Les plaintes sont obligatoires."); return }
                onValider({ plaintes, symptomes, observations, diagnostic, traitement, docteurId:docteurId?parseInt(docteurId):null })
              }}
              disabled={!ok}
              style={{ padding:"10px 24px", border:"none", borderRadius:10, background:ok?C.green:"#94a3b8", color:"#fff", fontSize:13, fontWeight:700, cursor:ok?"pointer":"not-allowed", fontFamily:"inherit", display:"flex", alignItems:"center", gap:8 }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><polyline points="20 6 9 17 4 12"/></svg>
              Valider &amp; {medecinChoisi ? "Assigner" : "Consulter"}
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

export default function PageConsultations({ consultations, patients, file, medecins, onValider, onModifier }) {
  const [mConsult, setMConsult] = useState(null)
  const [mModif,   setMModif]   = useState(null)
  const [filtreService, setFiltreService] = useState("tous")
  const [recherche,     setRecherche]     = useState("")

  // File d'attente = patients ajoutés par la secrétaire, pas encore consultés
  // Exclure les rendez-vous spécialistes : ils doivent aller directement au médecin de service.
  const fileAccueil = (file || []).filter(f => f.statut !== "termine" && f.typeVisite !== "rendez_vous")
  const servicesDispo = [...new Set(consultations.map(c=>c.service))].filter(Boolean)

  const toutesFiltrees = [...consultations]
    .sort((a,b)=>b.date.localeCompare(a.date))
    .filter(c=>{
      const p=patients.find(pt=>pt.id===c.patientId)
      const q=recherche.toLowerCase()
      const okR=!q||(p&&p.nom.toLowerCase().includes(q))||c.service.toLowerCase().includes(q)||(c.plaintes||c.motif||"").toLowerCase().includes(q)
      const okS=filtreService==="tous"||c.service===filtreService
      return okR&&okS
    })

  return (
    <div style={{ maxWidth:960, margin:"0 auto" }}>
      <p style={{ fontSize:28, fontWeight:800, color:C.textPri, letterSpacing:"-0.5px", marginBottom:4 }}>Consultations</p>
      <p style={{ fontSize:14, color:C.textSec, marginBottom:24 }}>
        Vue complète de toutes les consultations · Modification possible en cas d'erreur médicale
      </p>

      {mConsult&&<ModalConsultationChef
        patient={patients.find(p=>p.id===mConsult.patientId)}
        consultation={mConsult}
        medecins={medecins}
        onClose={()=>setMConsult(null)}
        onValider={data=>{ onValider(mConsult.id, { ...data, patientId: mConsult.patientId }); setMConsult(null) }}
      />}
      {mModif&&<ModalModifier
        consultation={mModif}
        patient={patients.find(p=>p.id===mModif.patientId)}
        onClose={()=>setMModif(null)}
        onModifier={onModifier}
      />}

      {/* ── File d'accueil ── */}
      {fileAccueil.length>0&&(
        <Card style={{ marginBottom:20, border:"1.5px solid "+C.green+"55" }}>
          <div style={{ padding:"16px 20px", borderBottom:"1px solid "+C.border, background:C.greenSoft, borderRadius:"16px 16px 0 0", display:"flex", alignItems:"center", gap:10 }}>
            <div style={{ width:8,height:8,borderRadius:"50%",background:C.green,animation:"blink 2s ease-in-out infinite" }}/>
            <div>
              <p style={{ fontSize:15, fontWeight:700, color:C.textPri }}>Patients en attente — Consultation d'accueil</p>
              <p style={{ fontSize:13, color:C.textSec }}>
                {fileAccueil.length} patient{fileAccueil.length>1?"s":""} · Consultation d'accueil uniquement (les RDV spécialistes sont envoyés directement au service)
              </p>
            </div>
          </div>
          {fileAccueil.map((c,i)=>{
            const p=patients.find(pt=>pt.id===c.patientId)
            if(!p) return null
            return (
              <div key={c.id} style={{ padding:"16px 20px", display:"flex", alignItems:"center", gap:14, borderBottom:i<fileAccueil.length-1?"1px solid "+C.border:"none" }}>
                <Avatar name={p.nom} size={44}/>
                <div style={{ flex:1 }}>
                  <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:4 }}>
                    <p style={{ fontSize:14, fontWeight:700, color:C.textPri }}>{p.nom}</p>
                    {c.typeVisite==="rendez_vous"
                      ? <span style={{ fontSize:11,fontWeight:700,background:C.purpleSoft,color:C.purple,padding:"2px 9px",borderRadius:10 }}>RDV</span>
                      : <span style={{ fontSize:11,fontWeight:700,background:C.greenSoft,color:C.green,padding:"2px 9px",borderRadius:10 }}>Consultation</span>
                    }
                  </div>
                  <p style={{ fontSize:13, color:C.textSec }}>
                    {c.plaintes||c.motif||"Pas encore de plaintes enregistrées"} · <span style={{ color:C.blue, fontWeight:600 }}>{c.service}</span>
                  </p>
                </div>
                {c.arrivee&&(
                  <div style={{ textAlign:"center", padding:"8px 16px", background:C.greenSoft, border:"1px solid "+C.green+"33", borderRadius:10 }}>
                    <p style={{ fontSize:10,color:C.textMuted,textTransform:"uppercase",letterSpacing:"0.06em",marginBottom:2 }}>Arrivée</p>
                    <p style={{ fontSize:16,fontWeight:800,color:C.green,fontVariantNumeric:"tabular-nums" }}>{c.arrivee}</p>
                  </div>
                )}
                {c.typeVisite === "rendez_vous"
                  ? <span style={{ fontSize:11,fontWeight:700,background:"#e0f2fe",color:"#0369a1",padding:"4px 10px",borderRadius:20,flexShrink:0 }}>Rendez-vous (gratuit)</span>
                  : c.paiementConsultation?.statut === "paye"
                    ? <span style={{ fontSize:11,fontWeight:700,background:"#dcfce7",color:"#15803d",padding:"4px 10px",borderRadius:20,flexShrink:0 }}>Consultation payée</span>
                    : <span style={{ fontSize:11,fontWeight:700,background:"#fee2e2",color:"#dc2626",padding:"4px 10px",borderRadius:20,flexShrink:0 }}>Paiement en attente</span>
                }
                <button
                  onClick={()=>{ const ok=c.typeVisite==="rendez_vous"||c.paiementConsultation?.statut==="paye"; if(!ok){ alert("Ce patient n'a pas encore payé les frais de consultation. Veuillez l'orienter vers la comptabilité."); return } setMConsult(c) }}
                  style={{ display:"flex",alignItems:"center",gap:8,padding:"10px 20px",background:(c.typeVisite==="rendez_vous"||c.paiementConsultation?.statut==="paye")?C.green:"#9ca3af",color:"#fff",border:"none",borderRadius:10,fontSize:13,fontWeight:700,cursor:(c.typeVisite==="rendez_vous"||c.paiementConsultation?.statut==="paye")?"pointer":"not-allowed",fontFamily:"inherit",flexShrink:0 }}
                  onMouseEnter={e=>{ if(c.typeVisite==="rendez_vous"||c.paiementConsultation?.statut==="paye") e.currentTarget.style.background="#15803d" }}
                  onMouseLeave={e=>{ if(c.typeVisite==="rendez_vous"||c.paiementConsultation?.statut==="paye") e.currentTarget.style.background=C.green }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 13.4 19.79 19.79 0 0 1 1.61 4.84 2 2 0 0 1 3.59 2.66h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 9.91a16 16 0 0 0 6 6l.92-.92a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 21.43 17"/></svg>
                  Consulter
                </button>
              </div>
            )
          })}
        </Card>
      )}

      {/* ── Toutes les consultations ── */}
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
              {["Date","Patient","Service","Type","Plaintes / Motif","Médecin","Prix (GNF)","Statut","Action"].map(h=>(
                <th key={h} style={{ padding:"11px 12px", textAlign:"left", fontSize:11, fontWeight:700, color:C.textSec, letterSpacing:"0.05em", textTransform:"uppercase", whiteSpace:"nowrap" }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {toutesFiltrees.length===0
              ? <tr><td colSpan={9} style={{ padding:40, textAlign:"center", color:C.textMuted }}>Aucune consultation trouvée</td></tr>
              : toutesFiltrees.map((c,i,arr)=>{
                  const p  = patients.find(pt=>pt.id===c.patientId)
                  const dr = INIT_MEDECINS.find(d=>d.id===c.docteurId)
                  if(!p) return null
                  return (
                    <tr key={c.id} style={{ borderBottom:i<arr.length-1?"1px solid "+C.border:"none", transition:"background .15s" }}
                      onMouseEnter={e=>e.currentTarget.style.background=C.slateSoft}
                      onMouseLeave={e=>e.currentTarget.style.background="transparent"}>
                      <td style={{ padding:"12px 12px", fontSize:12, color:C.textMuted, whiteSpace:"nowrap" }}>{c.date}</td>
                      <td style={{ padding:"12px 12px" }}>
                        <div style={{ display:"flex", alignItems:"center", gap:8 }}>
                          <Avatar name={p.nom} size={28}/>
                          <p style={{ fontSize:13, fontWeight:600, color:C.textPri }}>{p.nom}</p>
                        </div>
                      </td>
                      <td style={{ padding:"12px 12px" }}>
                        <span style={{ fontSize:11, fontWeight:600, background:C.blueSoft, color:C.textPri, padding:"3px 9px", borderRadius:10, whiteSpace:"nowrap" }}>{c.service}</span>
                      </td>
                      <td style={{ padding:"12px 12px" }}>
                        {c.typeVisite==="rendez_vous"
                          ? <span style={{ fontSize:11, fontWeight:700, background:C.purpleSoft, color:C.purple, padding:"2px 8px", borderRadius:10 }}>RDV</span>
                          : <span style={{ fontSize:11, fontWeight:700, background:C.greenSoft,  color:C.green,  padding:"2px 8px", borderRadius:10 }}>Consult.</span>
                        }
                      </td>
                      <td style={{ padding:"12px 12px", fontSize:12, color:C.textSec, maxWidth:160 }}>
                        {(c.plaintes||c.motif||"—").split(",").slice(0,2).join(",")}
                      </td>
                      <td style={{ padding:"12px 12px", fontSize:12, color:dr?C.textPri:C.textMuted }}>
                        {dr?dr.nom:(c.signePar||"—")}
                      </td>
                      <td style={{ padding:"12px 12px", fontSize:13, fontWeight:700, color:c.montant?C.green:C.textMuted }}>
                        {c.montant?c.montant.toLocaleString("fr-FR"):"—"}
                      </td>
                      <td style={{ padding:"12px 12px" }}><StatutBadge statut={c.statut}/></td>
                      <td style={{ padding:"12px 12px" }}>
                        <button onClick={()=>setMModif(c)}
                          style={{ display:"flex",alignItems:"center",gap:5,padding:"6px 12px",background:C.slateSoft,border:"1px solid "+C.slate+"44",borderRadius:8,color:C.slate,fontSize:12,fontWeight:600,cursor:"pointer",fontFamily:"inherit",whiteSpace:"nowrap" }}
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
    </div>
  )
}
