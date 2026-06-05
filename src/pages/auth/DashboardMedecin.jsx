import { useState, useEffect } from "react"
import logo from "../../assets/images/logo.jpeg"
import { useAuth } from "../../hooks/useAuth.jsx"
import { useNavigate } from "react-router-dom"
import { useSharedData } from "../../hooks/useSharedData.jsx"
import { C, today, fmt, calcAge, Avatar, Badge, Btn, Card, CardHeader, RdvBadge, TypeConsultBadge, TYPE_CONSULT_LABEL } from "./medecin/shared.jsx"
import ModalFichePatient from "./medecin/ModalFichePatient.jsx"
import ModalConsultation from "./medecin/ModalConsultation.jsx"
import ModalCreerRdvMedecin from "./medecin/ModalCreerRdvMedecin.jsx"

// ══════════════════════════════════════════════════════
//  COMPOSANT PRINCIPAL — DASHBOARD MÉDECIN
// ══════════════════════════════════════════════════════
export default function DashboardMedecin() {
  const { user, logout } = useAuth()
  const navigate   = useNavigate()
  const handleLogout = () => { logout(); navigate("/login") }

  const { patients: sharedPatients, consultations: sharedConsultations, addConsultation, file, updateFileEntry, rdv, addRdv, removeRdv, notifs, marquerNotifLue, marquerToutesLues, rafraichir } = useSharedData()

  const medecin = { id: user?.id || 2, nom: user?.nom || "Dr. Keïta", specialite: user?.specialite || "Médecine générale" }

  const mesNotifs     = notifs.filter(n => n.docteurId === medecin.id).sort((a,b) => b.id - a.id)
  const notifsNonLues = mesNotifs.filter(n => !n.lu).length
  const [showNotifs, setShowNotifs] = useState(false)

  const [onglet, setOnglet]               = useState("accueil")
  const [sidebarOpen, setSidebarOpen]     = useState(false)
  const [showCreerRdv, setShowCreerRdv]   = useState(false)
  const consultations = sharedConsultations
  const [heure, setHeure]                 = useState("")
  const [dateStr, setDateStr]             = useState("")
  const [recherche, setRecherche]         = useState("")
  const [mFiche,   setMFiche]             = useState(null)
  const [mConsult, setMConsult]           = useState(null)

  useEffect(() => {
    if (!mConsult?.patient?.id) return
    const todayStr = today()
    const fresh = sharedConsultations.find(c =>
      Number(c.patientId) === Number(mConsult.patient.id)
      && (c.date?.slice(0, 10) || c.date) === todayStr
      && Number(c.docteurId) === Number(medecin.id)
    )
    if (fresh) setMConsult(prev => prev ? { ...prev, consultation: fresh } : prev)
  }, [sharedConsultations, mConsult?.patient?.id, medecin.id])

  useEffect(()=>{
    const tick=()=>{
      const n=new Date()
      setHeure(n.toLocaleTimeString("fr-FR",{hour:"2-digit",minute:"2-digit",second:"2-digit"}))
      setDateStr(n.toLocaleDateString("fr-FR",{weekday:"long",day:"numeric",month:"long",year:"numeric"}))
    }
    tick(); const t=setInterval(tick,1000); return()=>clearInterval(t)
  },[])

  // Patients du jour : viennent de la file d'attente partagée (assignés par la secrétaire/chef)
  // mesRdv inclut AUSSI les patients avec rendez-vous qui arrivent à la secrétaire
  const mesRdv = [
    ...rdv.filter(r => r.docteurId === Number(medecin.id)),
    ...file
      .filter(f => f.docteurId === Number(medecin.id) && f.typeVisite === "rendez_vous" && f.statut !== "termine")
      .map(f => ({
        id: f.rdvId || f.id,
        patientId: f.patientId,
        patient: f.nom,
        docteurId: medecin.id,
        date: today(),
        heure: f.arrivee || "—",
        service: f.service,
        docteur: medecin.nom,
        motif: f.motif || "Consultation",
        rappelEnvoye: true,
        fileId: f.id // garder la référence au file pour mise à jour
      }))
  ].sort((a,b) => (a.heure || "").localeCompare(b.heure || ""))

  const mesPatients = (() => {
    const byPatient = new Map()
    const todayStr = today()
    consultations.forEach(c => {
      if (Number(c.docteurId) !== Number(medecin.id)) return
      if ((c.date?.slice(0, 10) || c.date) !== todayStr) return
      if (c.signe) return
      const pat = sharedPatients.find(p => p.id === c.patientId) || {}
      const f = file.find(x => x.patientId === c.patientId && x.statut !== "termine") || {}
      byPatient.set(c.patientId, { ...pat, ...f, id: c.patientId, fileId: f.id, consultation: c })
    })
    file.forEach(f => {
      if (Number(f.docteurId) !== Number(medecin.id) || f.statut === "termine") return
      if (byPatient.has(f.patientId)) return
      const pat = sharedPatients.find(p => p.id === f.patientId) || {}
      const c = consultations.find(x =>
        x.patientId === f.patientId && (x.date?.slice(0, 10) || x.date) === todayStr && Number(x.docteurId) === Number(medecin.id)
      )
      byPatient.set(f.patientId, { ...pat, ...f, id: f.patientId, fileId: f.id, consultation: c || null })
    })
    return [...byPatient.values()]
  })()

  const mesConsultations= consultations.filter(c=>Number(c.docteurId)===Number(medecin.id))
  const enAttente       = mesPatients.filter(p=>p.statut==="en_attente").length
  const nonSignees      = mesConsultations.filter(c=>!c.signe).length

  const patientsFiltres = mesPatients.filter(p=>{
    const q=recherche.toLowerCase()
    return !q||p.nom.toLowerCase().includes(q)||(p.pid||"").toLowerCase().includes(q)||p.motif.toLowerCase().includes(q)
      ||(p.motifRdv||"").toLowerCase().includes(q)||(TYPE_CONSULT_LABEL[p.typeConsultation]?.label||"").toLowerCase().includes(q)
  })

  const ouvrirConsultation = (patient) => {
    const todayStr = today()
    const existing = patient.consultation || consultations.find(c =>
      Number(c.patientId) === Number(patient.id) &&
      (c.date?.slice(0, 10) || c.date) === todayStr &&
      Number(c.docteurId) === Number(medecin.id)
    )
    setMConsult({ patient, consultation: existing || null })
  }

  const handleSauvegarder = async (data) => {
    const patientId = mConsult.patient.id
    try {
      await addConsultation({
        patientId,
        date: today(),
        service: medecin.specialite,
        docteurId: medecin.id,
        signe: false,
        envoyerLabo: data.envoyerLabo === true,
        ...data,
      })
      if (rafraichir) await rafraichir()
      alert(data.envoyerLabo
        ? "Examens envoyés au laboratoire. Vous pourrez signer après les résultats."
        : "Consultation sauvegardée — vos données sont conservées.")
    } catch (e) {
      alert(e.message || "Erreur de sauvegarde.")
    }
  }

  const handleSigner = async (data) => {
    const patientId = mConsult.patient.id
    const c = mConsult.consultation
    if ((data.examensCommandes?.length > 0) && !c?.laboValide) {
      alert("Signature impossible : résultats du laboratoire non validés.")
      return
    }
    const ts = new Date().toLocaleString("fr-FR")
    try {
      await addConsultation({
        patientId,
        date: today(),
        service: medecin.specialite,
        docteurId: medecin.id,
        signe: true,
        signeLe: ts,
        signePar: medecin.nom,
        ...data,
      })
      const fileEntry = file.find(f => f.patientId === patientId && f.statut !== "termine")
      if (fileEntry) {
        await updateFileEntry(fileEntry.id, { statut: "termine" })
      }
      setMConsult(null)
      alert("Consultation signée et validée.")
    } catch (e) {
      alert(e.message || "Erreur lors de la signature.")
    }
  }

  const handleCreerRdv = (form) => {
    const p = sharedPatients.find(pt => pt.id === parseInt(form.patientId))
    addRdv({ ...form, patientId: parseInt(form.patientId), patient: p?.nom || "—", docteurId: medecin.id, docteur: medecin.nom, service: medecin.specialite, rappelEnvoye: false })
    setShowCreerRdv(false)
  }

  const NAV_ICONS = {
    home:  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9.5L12 3l9 6.5V20a1 1 0 01-1 1H4a1 1 0 01-1-1V9.5z"/><path d="M9 21V12h6v9"/></svg>,
    users: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="9" cy="7" r="3.5"/><path d="M2.5 20c0-3.6 2.9-6.5 6.5-6.5s6.5 2.9 6.5 6.5"/><circle cx="17.5" cy="7" r="2.5"/><path d="M21.5 20c0-2.8-2-5-4.5-5.5"/></svg>,
    doc:   <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M9 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V4a2 2 0 00-2-2h-3"/><rect x="9" y="1" width="6" height="3" rx="1"/><line x1="12" y1="9" x2="12" y2="15"/><line x1="9" y1="12" x2="15" y2="12"/></svg>,
    cal:   <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/><circle cx="12" cy="16" r="1.5" fill="currentColor" stroke="none"/></svg>,
  }
  const NAV = [
    { id:"accueil",       label:"Accueil",         icon:"home", desc:"Vue d'ensemble",         badge:0            },
    { id:"patients",      label:"Mes patients",     icon:"users", desc:"Liste du jour",          badge:enAttente    },
    { id:"consultations", label:"Mes consultations",icon:"doc", desc:"Historique & signature",   badge:nonSignees   },
    { id:"rdv",           label:"Mes rendez-vous",  icon:"cal",  desc:"Agenda & planification",  badge:mesRdv.filter(r=>r.date===today()).length },
  ]

  return (
    <div style={{ minHeight:"100vh", background:C.bg, fontFamily:"'Segoe UI',system-ui,sans-serif", color:C.textPri }}>

      {/* MODALS */}
      {mFiche && (
        <ModalFichePatient
          patient={mFiche}
          consultations={consultations}
          medecin={medecin}
          onClose={()=>setMFiche(null)}
          onConsulter={p=>{ ouvrirConsultation(p) }}
        />
      )}
      {showCreerRdv && (
        <ModalCreerRdvMedecin
          patients={sharedPatients}
          medecin={medecin}
          onClose={()=>setShowCreerRdv(false)}
          onCreate={handleCreerRdv}
        />
      )}
      {mConsult && (
        <ModalConsultation
          key={mConsult.patient.id + "-" + (mConsult.consultation?.id || "nouveau")}
          patient={mConsult.patient}
          medecin={medecin}
          consultation={mConsult.consultation}
          onClose={()=>setMConsult(null)}
          onSauvegarder={handleSauvegarder}
          onSigner={handleSigner}
          prixExamensParLabo
          attenteResultatsLabo={mConsult.consultation?.attenteResultatsLabo}
          laboValide={mConsult.consultation?.laboValide}
        />
      )}

      {/* SIDEBAR OVERLAY */}
      {sidebarOpen && (
        <div style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.3)", zIndex:100 }} onClick={()=>setSidebarOpen(false)}>
          <div style={{ position:"absolute", left:0, top:0, bottom:0, width:270, background:C.white, boxShadow:"4px 0 24px rgba(0,0,0,0.12)", display:"flex", flexDirection:"column" }} onClick={e=>e.stopPropagation()}>

            {/* Logo */}
            <div style={{ padding:"22px 20px 18px", borderBottom:"1px solid "+C.border, display:"flex", alignItems:"center", gap:12 }}>
              <div style={{ width:44,height:44,borderRadius:10,background:"#fff",border:"1px solid "+C.border,padding:3,flexShrink:0,display:"flex",alignItems:"center",justifyContent:"center" }}>
                <img src={logo} alt="" style={{ width:"100%",height:"100%",borderRadius:7,objectFit:"contain",display:"block" }}/>
              </div>
              <div>
                <p style={{ fontSize:14, fontWeight:800, color:C.textPri, lineHeight:1.2 }}>Clinique Marouane</p>
                <p style={{ fontSize:12, color:C.textSec }}>Espace médecin</p>
              </div>
            </div>

            {/* Nav */}
            <nav style={{ padding:"14px 12px", flex:1 }}>
              <p style={{ fontSize:10, color:C.textMuted, letterSpacing:"0.12em", textTransform:"uppercase", padding:"0 8px", marginBottom:8 }}>Menu principal</p>
              {NAV.map(n=>(
                <button key={n.id} onClick={()=>{ setOnglet(n.id); setSidebarOpen(false) }}
                  style={{ width:"100%", display:"flex", alignItems:"center", gap:12, padding:"11px 12px", borderRadius:12, border:"none", background:onglet===n.id?C.blueSoft:"transparent", color:onglet===n.id?C.blue:C.textSec, fontSize:14, fontWeight:onglet===n.id?700:500, cursor:"pointer", textAlign:"left", marginBottom:3, transition:"all .15s", boxShadow:onglet===n.id?"inset 3px 0 0 "+C.blue:"none", position:"relative" }}
                  onMouseEnter={e=>{ if(onglet!==n.id) e.currentTarget.style.background=C.slateSoft }}
                  onMouseLeave={e=>{ if(onglet!==n.id) e.currentTarget.style.background="transparent" }}>
                  <span style={{ display:"flex", alignItems:"center" }}>{NAV_ICONS[n.icon]}</span>
                  <div style={{ flex:1 }}>
                    <p style={{ fontSize:13, lineHeight:1.2 }}>{n.label}</p>
                    <p style={{ fontSize:10, color:C.textMuted, lineHeight:1.2, marginTop:1 }}>{n.desc}</p>
                  </div>
                  {n.badge>0 && <span style={{ background:C.red, color:"#fff", fontSize:11, fontWeight:700, borderRadius:10, padding:"2px 7px" }}>{n.badge}</span>}
                </button>
              ))}
            </nav>

            {/* Profil */}
            <div style={{ padding:"14px 16px 20px", borderTop:"1px solid "+C.border }}>
              <div style={{ display:"flex", alignItems:"center", gap:10, padding:"10px 12px", background:C.blueSoft, borderRadius:12, border:"1px solid "+C.blue+"33" }}>
                <Avatar name={medecin.nom} size={36} bg={C.blue} />
                <div>
                  <p style={{ fontSize:13, fontWeight:700, color:C.textPri, lineHeight:1.2 }}>{medecin.nom}</p>
                  <p style={{ fontSize:11, color:C.textPri, fontWeight:600, marginTop:1 }}>{medecin.specialite}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* HEADER */}
      <header style={{ background:C.white, borderBottom:"1px solid "+C.border, padding:"0 24px", height:64, display:"flex", alignItems:"center", justifyContent:"space-between", position:"sticky", top:0, zIndex:50, boxShadow:"0 1px 3px rgba(0,0,0,0.05)" }}>
        {/* Hamburger */}
        <button onClick={()=>setSidebarOpen(true)} style={{ width:40, height:40, borderRadius:8, border:"1px solid "+C.border, background:C.white, cursor:"pointer", display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", gap:5 }}>
          <div style={{ width:20, height:2, background:C.textPri, borderRadius:2 }} />
          <div style={{ width:20, height:2, background:C.textPri, borderRadius:2 }} />
          <div style={{ width:20, height:2, background:C.textPri, borderRadius:2 }} />
        </button>

        {/* Logo clinique */}
        <div style={{ display:"flex", alignItems:"center", gap:10, marginLeft:12, paddingRight:20, borderRight:"1px solid "+C.border, flexShrink:0 }}>
          <div style={{ width:38,height:38,borderRadius:9,background:"#fff",border:"1px solid "+C.border,padding:3,display:"flex",alignItems:"center",justifyContent:"center" }}>
            <img src={logo} alt="" style={{ width:"100%",height:"100%",borderRadius:6,objectFit:"contain",display:"block" }}/>
          </div>
          <div>
            <p style={{ fontSize:13,fontWeight:800,color:C.textPri,lineHeight:1.2 }}>Clinique Marouane</p>
            <p style={{ fontSize:11,color:C.textMuted }}>Espace médecin</p>
          </div>
        </div>

        {/* Titre */}
        <div style={{ flex:1, marginLeft:16 }}>
          <p style={{ fontSize:15, fontWeight:700, color:C.textPri, lineHeight:1.2 }}>
            {onglet==="accueil"       && "Accueil"}
            {onglet==="patients"      && "Mes patients du jour"}
            {onglet==="consultations" && "Mes consultations"}
            {onglet==="rdv"           && "Mes rendez-vous"}
          </p>
          <p style={{ fontSize:12, color:C.textMuted, textTransform:"capitalize" }}>{dateStr}</p>
        </div>

        <div style={{ display:"flex", alignItems:"center", gap:12 }}>
          {/* Alerte non signées */}
          {nonSignees>0 && (
            <button onClick={()=>setOnglet("consultations")} style={{ background:C.redSoft, border:"1px solid "+C.red+"44", borderRadius:10, padding:"7px 14px", fontSize:12, fontWeight:700, color:C.red, cursor:"pointer", fontFamily:"inherit" }}>
              {nonSignees} à signer
            </button>
          )}

          {/* 🔔 Notifications */}
          <div style={{ position:"relative" }}>
            <button onClick={()=>{ setShowNotifs(v=>!v); if(!showNotifs) marquerToutesLues(medecin.id) }}
              style={{ width:40,height:40,borderRadius:10,border:"1px solid "+C.border,background:notifsNonLues>0?C.amberSoft:C.white,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",position:"relative" }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={notifsNonLues>0?C.amber:C.textSec} strokeWidth="2" strokeLinecap="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>
              {notifsNonLues>0 && <span style={{ position:"absolute",top:-4,right:-4,width:18,height:18,borderRadius:"50%",background:C.red,color:"#fff",fontSize:10,fontWeight:700,display:"flex",alignItems:"center",justifyContent:"center" }}>{notifsNonLues}</span>}
            </button>
            {showNotifs && (
              <div style={{ position:"absolute",right:0,top:48,width:320,background:C.white,borderRadius:14,boxShadow:"0 8px 32px rgba(0,0,0,0.15)",border:"1px solid "+C.border,zIndex:200,overflow:"hidden" }}
                onClick={e=>e.stopPropagation()}>
                <div style={{ padding:"14px 16px",borderBottom:"1px solid "+C.border,display:"flex",justifyContent:"space-between",alignItems:"center" }}>
                  <p style={{ fontSize:14,fontWeight:700,color:C.textPri }}>Notifications</p>
                  <button onClick={()=>setShowNotifs(false)} style={{ background:"none",border:"none",cursor:"pointer",color:C.textMuted,fontSize:18,lineHeight:1 }}>×</button>
                </div>
                <div style={{ maxHeight:340,overflowY:"auto" }}>
                  {mesNotifs.length===0
                    ? <p style={{ padding:"28px 16px",textAlign:"center",color:C.textMuted,fontSize:13 }}>Aucune notification</p>
                    : mesNotifs.map(n=>(
                      <div key={n.id} onClick={()=>marquerNotifLue(n.id)}
                        style={{ padding:"12px 16px",borderBottom:"1px solid "+C.border,background:n.lu?"transparent":C.greenSoft,cursor:"pointer",display:"flex",gap:12,alignItems:"flex-start" }}>
                        <div style={{ width:36,height:36,borderRadius:"50%",background:n.lu?C.slateSoft:C.green,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0 }}>
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={n.lu?"#6b7280":"#fff"} strokeWidth="2" strokeLinecap="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/></svg>
                        </div>
                        <div style={{ flex:1 }}>
                          <p style={{ fontSize:13,fontWeight:n.lu?500:700,color:C.textPri,marginBottom:2 }}>
                            {n.titre || "Nouveau patient assigné"}
                          </p>
                          <p style={{ fontSize:12,color:C.textSec,marginBottom:2 }}>{n.patientNom}</p>
                          <p style={{ fontSize:11,color:C.textMuted }}>{n.motif}</p>
                          <p style={{ fontSize:10,color:C.textMuted,marginTop:4 }}>{n.date} à {n.heure}</p>
                        </div>
                        {!n.lu && <div style={{ width:8,height:8,borderRadius:"50%",background:C.green,flexShrink:0,marginTop:4 }}/>}
                      </div>
                    ))
                  }
                </div>
              </div>
            )}
          </div>

          {/* Horloge */}
          <div style={{ background:C.blueSoft, border:"1px solid "+C.blue+"33", borderRadius:10, padding:"8px 16px", fontSize:14, fontWeight:700, color:C.blue, fontVariantNumeric:"tabular-nums", minWidth:112, textAlign:"center" }}>{heure}</div>
          {/* Profil */}
          <div style={{ display:"flex", alignItems:"center", gap:8 }}>
            <div style={{ textAlign:"right" }}>
              <p style={{ fontSize:13, fontWeight:700, color:C.textPri, lineHeight:1.2 }}>{medecin.nom}</p>
              <p style={{ fontSize:11, color:C.textSec }}>{medecin.specialite}</p>
            </div>
            <Avatar name={medecin.nom} size={36} bg={C.blue} />
          </div>
          <button onClick={handleLogout} title="Se déconnecter"
            style={{ width:36,height:36,borderRadius:8,border:"1px solid #fca5a5",background:"#fff5f5",cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0 }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#cc2222" strokeWidth="2" strokeLinecap="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
          </button>
        </div>
      </header>

      {/* CONTENU */}
      <main style={{ padding:"28px 28px" }}>

        {/* ══ ACCUEIL ══ */}
        {onglet==="accueil" && (
          <div style={{ display:"flex", flexDirection:"column", gap:20 }}>

            {/* KPIs */}
            <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:16 }}>
              {[
                { val:mesPatients.length,                         label:"Patients assignés",    bg:C.blueSoft,  fg:C.blue,  icon:<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg> },
                { val:enAttente,                                  label:"En attente",           bg:C.slateSoft, fg:C.slate, icon:<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg> },
                { val:mesConsultations.filter(c=>c.signe).length, label:"Consultations signées", bg:C.greenSoft, fg:C.green, icon:<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><polyline points="9 15 11 17 15 13"/></svg> },
              ].map(({val,label,bg,fg,icon})=>(
                <Card key={label} style={{ padding:"22px 20px" }}>
                  <div style={{ width:46, height:46, borderRadius:12, background:bg, display:"flex", alignItems:"center", justifyContent:"center", marginBottom:14, color:fg }}>{icon}</div>
                  <p style={{ fontSize:32, fontWeight:800, color:C.textPri, letterSpacing:"-1px", lineHeight:1 }}>{val}</p>
                  <p style={{ fontSize:12, color:C.textMuted, marginTop:6 }}>{label}</p>
                </Card>
              ))}
            </div>

            {/* Alerte consultations non signées */}
            {nonSignees>0 && (
              <div style={{ background:C.redSoft, border:"1px solid "+C.red+"33", borderRadius:14, padding:"14px 20px", display:"flex", alignItems:"center", gap:12, cursor:"pointer" }} onClick={()=>setOnglet("consultations")}>
                <div style={{ width:40,height:40,borderRadius:10,background:C.red+"22",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0 }}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={C.red} strokeWidth="2" strokeLinecap="round"><path d="M12 9v4"/><path d="M12 17h.01"/><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/></svg>
                </div>
                <div style={{ flex:1 }}>
                  <p style={{ fontSize:14, fontWeight:700, color:C.red }}>
                    {nonSignees} consultation{nonSignees>1?"s":""} non signée{nonSignees>1?"s":""} — signature requise
                  </p>
                  <p style={{ fontSize:12, color:"#991b1b" }}>Cliquez pour accéder et signer</p>
                </div>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={C.red} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"/></svg>
              </div>
            )}

            {/* Liste patients du jour */}
            <Card>
              <CardHeader
                title="Mes patients du jour"
                sub={medecin.specialite+" · "+mesPatients.length+" patient"+(mesPatients.length>1?"s":"")}
                action={<button onClick={()=>setOnglet("patients")} style={{ background:"none", border:"none", color:C.blue, fontSize:13, cursor:"pointer", fontWeight:600 }}>Tout voir</button>}
              />
              {mesPatients.length===0
                ? <p style={{ padding:40, textAlign:"center", color:C.textMuted }}>Aucun patient assigné aujourd'hui</p>
                : mesPatients.slice(0,5).map((p,i)=>(
                  <div key={p.id} style={{ padding:"13px 20px", display:"flex", alignItems:"center", justifyContent:"space-between", borderBottom:i<Math.min(mesPatients.length,5)-1?"1px solid "+C.border:"none", cursor:"pointer", transition:"background .15s" }}
                    onClick={()=>setMFiche(p)}
                    onMouseEnter={e=>e.currentTarget.style.background=C.slateSoft}
                    onMouseLeave={e=>e.currentTarget.style.background="transparent"}>
                    <div style={{ display:"flex", alignItems:"center", gap:12 }}>
                      <Avatar name={p.nom} size={36} />
                      <div>
                        <p style={{ fontSize:13, fontWeight:600, color:C.textPri }}>{p.nom}</p>
                        <p style={{ fontSize:11, color:C.textSec, display:"flex", alignItems:"center", gap:6, flexWrap:"wrap" }}>
                          <RdvBadge patient={p} />
                          {(p.typeConsultation && p.typeConsultation !== "standard") && <TypeConsultBadge type={p.typeConsultation} />}
                          <span>{p.motif} · Arrivé à {p.arrivee}</span>
                        </p>
                      </div>
                    </div>
                    <div style={{ display:"flex", alignItems:"center", gap:10 }}>
                      <Badge statut={p.statut} />
                      <Btn onClick={e=>{ e.stopPropagation(); ouvrirConsultation(p) }} small variant="success">
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M12 5v14M5 12h14"/></svg>
                        Consulter
                      </Btn>
                    </div>
                  </div>
                ))
              }
            </Card>
          </div>
        )}

        {/* ══ MES PATIENTS ══ */}
        {onglet==="patients" && (
          <Card>
            <CardHeader
              title={"Mes patients — "+mesPatients.length+" assigné"+(mesPatients.length>1?"s":"")}
              sub={medecin.specialite}
              action={
                <div style={{ position:"relative" }}>
                  <svg style={{ position:"absolute", left:10, top:"50%", transform:"translateY(-50%)", pointerEvents:"none" }} width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={C.textMuted} strokeWidth="2" strokeLinecap="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
                  <input placeholder="Nom, ID, motif…" value={recherche} onChange={e=>setRecherche(e.target.value)}
                    style={{ padding:"8px 12px 8px 32px", fontSize:13, border:"1.5px solid "+C.border, borderRadius:10, background:C.bg, color:C.textPri, outline:"none", fontFamily:"inherit", width:200 }}
                    onFocus={e=>e.target.style.borderColor=C.blue} onBlur={e=>e.target.style.borderColor=C.border} />
                </div>
              }
            />
            <table style={{ width:"100%", borderCollapse:"collapse" }}>
              <thead>
                <tr style={{ background:C.slateSoft }}>
                  {["Patient","Motif / file","Arrivée","Statut","Actions"].map(h=>(
                    <th key={h} style={{ padding:"11px 16px", textAlign:"left", fontSize:11, fontWeight:700, color:C.textSec, letterSpacing:"0.06em", textTransform:"uppercase" }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {patientsFiltres.length===0
                  ? <tr><td colSpan={5} style={{ padding:40, textAlign:"center", color:C.textMuted }}>Aucun patient trouvé</td></tr>
                  : patientsFiltres.sort((a)=>a.statut==="en_attente"?-1:1).map((p,i,arr)=>(
                    <tr key={p.id} style={{ borderBottom:i<arr.length-1?"1px solid "+C.border:"none", transition:"background .15s" }}
                      onMouseEnter={e=>e.currentTarget.style.background=C.slateSoft}
                      onMouseLeave={e=>e.currentTarget.style.background="transparent"}>
                      <td style={{ padding:"13px 16px" }}>
                        <div style={{ display:"flex", alignItems:"center", gap:10 }}>
                          <Avatar name={p.nom} size={32} />
                          <div>
                            <p style={{ fontSize:13, fontWeight:600, color:C.textPri }}>{p.nom}</p>
                            <p style={{ fontSize:11, color:C.textMuted }}>{p.pid} · {calcAge(p.dateNaissance)} ans</p>
                          </div>
                        </div>
                      </td>
                      <td style={{ padding:"13px 16px", fontSize:13, color:C.textSec }}>
                        <div style={{ display:"flex", flexDirection:"column", gap:6 }}>
                          <span>{p.motif}</span>
                          <span style={{ display:"flex", alignItems:"center", gap:6, flexWrap:"wrap" }}>
                            <RdvBadge patient={p} />
                            {(p.typeConsultation && p.typeConsultation !== "standard") && <TypeConsultBadge type={p.typeConsultation} />}
                          </span>
                        </div>
                      </td>
                      <td style={{ padding:"13px 16px", fontSize:13, fontWeight:700, color:C.textPri, fontVariantNumeric:"tabular-nums" }}>{p.arrivee}</td>
                      <td style={{ padding:"13px 16px" }}><Badge statut={p.statut} /></td>
                      <td style={{ padding:"13px 16px" }}>
                        <div style={{ display:"flex", gap:6 }}>
                          <button onClick={()=>setMFiche(p)} style={{ background:C.blueSoft, border:"1px solid "+C.blue+"33", borderRadius:8, color:C.blue, fontSize:12, fontWeight:600, cursor:"pointer", padding:"6px 12px", fontFamily:"inherit" }}
                            onMouseEnter={e=>{ e.currentTarget.style.background=C.blue; e.currentTarget.style.color="#fff" }}
                            onMouseLeave={e=>{ e.currentTarget.style.background=C.blueSoft; e.currentTarget.style.color=C.blue }}>
                            Voir fiche
                          </button>
                          {p.statut!=="termine" && (
                            <Btn onClick={()=>ouvrirConsultation(p)} small variant="success">Consulter</Btn>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                }
              </tbody>
            </table>
          </Card>
        )}

        {/* ══ MES RENDEZ-VOUS ══ */}
        {onglet==="rdv" && (
          <div style={{ display:"flex", flexDirection:"column", gap:20 }}>
            {/* KPIs */}
            <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:16 }}>
              {[
                { val:mesRdv.length,                            label:"Total RDV",         bg:C.purpleSoft, fg:C.purple },
                { val:mesRdv.filter(r=>r.date===today()).length, label:"Aujourd'hui",       bg:C.blueSoft,   fg:C.blue   },
                { val:mesRdv.filter(r=>r.date>today()).length,   label:"À venir",           bg:C.greenSoft,  fg:C.green  },
              ].map(({val,label,fg})=>(
                <Card key={label} style={{ padding:"20px" }}>
                  <p style={{ fontSize:30, fontWeight:800, color:fg, lineHeight:1 }}>{val}</p>
                  <p style={{ fontSize:12, color:C.textMuted, marginTop:6 }}>{label}</p>
                </Card>
              ))}
            </div>

            {/* Table */}
            <Card>
              <CardHeader
                title={"Mes rendez-vous — "+mesRdv.length}
                sub={medecin.specialite+" · Créez et gérez vos propres RDV"}
                action={
                  <Btn onClick={()=>setShowCreerRdv(true)} small>
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M12 5v14M5 12h14"/></svg>
                    Nouveau RDV
                  </Btn>
                }
              />
              <table style={{ width:"100%", borderCollapse:"collapse" }}>
                <thead>
                  <tr style={{ background:C.slateSoft }}>
                    {["Patient","Date","Heure","Motif","Statut","Action"].map(h=>(
                      <th key={h} style={{ padding:"10px 16px", textAlign:"left", fontSize:11, fontWeight:700, color:C.textSec, textTransform:"uppercase", letterSpacing:"0.05em" }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {mesRdv.length===0 ? (
                    <tr><td colSpan={6} style={{ padding:40, textAlign:"center", color:C.textMuted }}>
                      Aucun rendez-vous planifié — créez votre premier RDV
                    </td></tr>
                  ) : mesRdv.map((r,i,arr)=>{
                    const isPast = r.date < today()
                    const isToday = r.date === today()
                    return (
                      <tr key={r.id} style={{ borderBottom:i<arr.length-1?"1px solid "+C.border:"none" }}
                        onMouseEnter={e=>e.currentTarget.style.background=C.slateSoft}
                        onMouseLeave={e=>e.currentTarget.style.background="transparent"}>
                        <td style={{ padding:"12px 16px" }}>
                          <div style={{ display:"flex", alignItems:"center", gap:8 }}>
                            <Avatar name={r.patient} size={30} bg={C.purple} />
                            <p style={{ fontSize:13, fontWeight:600, color:C.textPri }}>{r.patient}</p>
                          </div>
                        </td>
                        <td style={{ padding:"12px 16px", fontSize:13, fontWeight:isToday?700:400, color:isToday?C.green:isPast?C.textMuted:C.textSec }}>
                          {new Date(r.date).toLocaleDateString("fr-FR")}
                          {isToday && <span style={{ marginLeft:6, fontSize:10, fontWeight:700, background:C.greenSoft, color:C.green, padding:"2px 7px", borderRadius:10 }}>Aujourd'hui</span>}
                        </td>
                        <td style={{ padding:"12px 16px", fontSize:13, fontWeight:700, color:C.textPri, fontVariantNumeric:"tabular-nums" }}>{r.heure}</td>
                        <td style={{ padding:"12px 16px", fontSize:12, color:C.textSec }}>{r.motif||"—"}</td>
                        <td style={{ padding:"12px 16px" }}>
                          {isPast
                            ? <span style={{ fontSize:11, fontWeight:700, background:C.slateSoft, color:C.textMuted, padding:"3px 10px", borderRadius:20 }}>Passé</span>
                            : isToday
                              ? <span style={{ fontSize:11, fontWeight:700, background:C.greenSoft, color:C.green, padding:"3px 10px", borderRadius:20, display:"inline-flex", alignItems:"center", gap:4 }}>
                                  <span style={{ width:5, height:5, borderRadius:"50%", background:C.green, animation:"blink 2s ease-in-out infinite" }}/>
                                  Aujourd'hui
                                </span>
                              : <span style={{ fontSize:11, fontWeight:700, background:C.purpleSoft, color:C.purple, padding:"3px 10px", borderRadius:20 }}>Planifié</span>
                          }
                        </td>
                        <td style={{ padding:"12px 16px" }}>
                          <button onClick={()=>removeRdv(r.id)}
                            style={{ padding:"5px 10px", border:"1px solid #fca5a5", borderRadius:8, background:"#fff5f5", color:"#cc2222", fontSize:11, fontWeight:600, cursor:"pointer", fontFamily:"inherit" }}>
                            Annuler
                          </button>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </Card>
          </div>
        )}

        {/* ══ MES CONSULTATIONS ══ */}
        {onglet==="consultations" && (
          <div style={{ display:"flex", flexDirection:"column", gap:16 }}>
            {nonSignees>0 && (
              <div style={{ background:C.redSoft, border:"1px solid "+C.red+"33", borderRadius:12, padding:"14px 20px" }}>
                <p style={{ fontSize:14, fontWeight:700, color:C.red, marginBottom:2 }}>
                  {nonSignees} consultation{nonSignees>1?"s":""} non signée{nonSignees>1?"s":""} — action requise
                </p>
                <p style={{ fontSize:13, color:"#991b1b" }}>Signez chaque consultation pour valider votre travail.</p>
              </div>
            )}
            <Card>
              <CardHeader title={"Mes consultations — "+mesConsultations.length+" au total"} />
              <table style={{ width:"100%", borderCollapse:"collapse" }}>
                <thead>
                  <tr style={{ background:C.slateSoft }}>
                    {["Patient","Date","Type","Motif","Diagnostic","Traitement","Signature","Action"].map(h=>(
                      <th key={h} style={{ padding:"11px 16px", textAlign:"left", fontSize:11, fontWeight:700, color:C.textSec, letterSpacing:"0.06em", textTransform:"uppercase" }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {mesConsultations.length===0
                    ? <tr><td colSpan={8} style={{ padding:40, textAlign:"center", color:C.textMuted }}>Aucune consultation enregistrée</td></tr>
                    : [...mesConsultations].sort((a,b)=>b.date.localeCompare(a.date)).map((c,i,arr)=>{
                        const p = sharedPatients.find(pt=>pt.id===c.patientId)
                        if (!p) return null
                        return (
                          <tr key={c.id} style={{ borderBottom:i<arr.length-1?"1px solid "+C.border:"none", background:!c.signe?"#fff8f8":"transparent", transition:"background .15s" }}
                            onMouseEnter={e=>e.currentTarget.style.background=C.slateSoft}
                            onMouseLeave={e=>e.currentTarget.style.background=!c.signe?"#fff8f8":"transparent"}>
                            <td style={{ padding:"13px 16px" }}>
                              <div style={{ display:"flex", alignItems:"center", gap:8 }}>
                                <Avatar name={p.nom} size={28} />
                                <p style={{ fontSize:13, fontWeight:600, color:C.textPri }}>{p.nom}</p>
                              </div>
                            </td>
                            <td style={{ padding:"13px 16px", fontSize:12, color:C.textMuted }}>{fmt(c.date)}</td>
                            <td style={{ padding:"13px 16px" }}>{c.typeConsultation && c.typeConsultation !== "standard"
                              ? <TypeConsultBadge type={c.typeConsultation} />
                              : <span style={{ fontSize:12, color:C.textMuted }}>Standard</span>}
                            </td>
                            <td style={{ padding:"13px 16px", fontSize:12, color:C.textSec }}>{c.motif||"—"}</td>
                            <td style={{ padding:"13px 16px", fontSize:12, color:C.textPri }}>{c.diagnostics?.join(", ")||"—"}</td>
                            <td style={{ padding:"13px 16px", fontSize:12, color:C.textSec }}>{c.traitements?.join(", ")||"—"}</td>
                            <td style={{ padding:"13px 16px" }}>
                              {c.signe
                                ? <div>
                                    <Badge statut="signe" />
                                    <p style={{ fontSize:10, color:C.textMuted, marginTop:3 }}>{c.signeLe}</p>
                                  </div>
                                : <Badge statut="non_signe" />
                              }
                            </td>
                            <td style={{ padding:"13px 16px" }}>
                              {!c.signe && (
                                <Btn onClick={()=>setMConsult({patient:p,consultation:c})} small variant="success">
                                  Signer
                                </Btn>
                              )}
                            </td>
                          </tr>
                        )
                      })
                  }
                </tbody>
              </table>
            </Card>
          </div>
        )}

      </main>

      <style>{`
        @keyframes blink{0%,100%{opacity:1}50%{opacity:.35}}
        *{box-sizing:border-box;margin:0;padding:0}
        input::placeholder,textarea::placeholder{color:#94a3b8}
        select option{background:#fff;color:#0f172a}
        ::-webkit-scrollbar{width:5px}
        ::-webkit-scrollbar-thumb{background:#cbd5e1;border-radius:3px}
        button:focus{outline:none}
      `}</style>
    </div>
  )
}
