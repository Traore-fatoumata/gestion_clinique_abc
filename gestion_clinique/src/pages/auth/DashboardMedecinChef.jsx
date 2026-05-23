import { useState, useEffect } from "react"
import logo from "../../assets/images/logo.jpeg"
import SettingsModal from "../../components/SettingsModal"
import { useClinicSettings } from "../../hooks/useClinicSettings.jsx"
import { useAuth } from "../../hooks/useAuth.jsx"
import { useNavigate } from "react-router-dom"
import { useSharedData } from "../../hooks/useSharedData.jsx"
import { today, C, INIT_PATIENTS, INIT_COMPTES, INIT_MEDECINS } from "./medecinChef/shared.jsx"
import PageAccueil       from "./medecinChef/PageAccueil.jsx"
import PageConsultations from "./medecinChef/PageConsultations.jsx"
import PageStats         from "./medecinChef/PageStats.jsx"
import PageComptes       from "./medecinChef/PageComptes.jsx"
import PagePresence      from "./medecinChef/PagePresence.jsx"
import PageHistorique    from "./medecinChef/PageHistorique.jsx"

// ══════════════════════════════════════════════════════
//  COMPOSANT PRINCIPAL
// ══════════════════════════════════════════════════════
export default function DashboardMedecinChef() {
  const { user, logout } = useAuth()
  const navigate   = useNavigate()
  const handleLogout = () => { logout(); navigate("/login") }

  const { patients: sharedPatients, consultations: sharedConsultations, addConsultation, updateConsultation, file, updateFileEntry, addNotif, resultatsLabo, soins, rdv } = useSharedData()

  const [page,         setPage]         = useState("accueil")
  const [sidebarOpen,  setSidebarOpen]  = useState(false)
  const consultations = sharedConsultations
  const patients      = sharedPatients.length > 0 ? sharedPatients : INIT_PATIENTS
  const [comptes,      setComptes]      = useState(INIT_COMPTES)
  const [medecins,     setMedecins]     = useState(INIT_MEDECINS)
  const [heure,        setHeure]        = useState("")
  const [showPointer,  setShowPointer]  = useState(false)
  const [pointerHeure, setPointerHeure] = useState(null)
  const [showSettings, setShowSettings] = useState(false)
  useClinicSettings()

  useEffect(()=>{
    const tick=()=>setHeure(new Date().toLocaleTimeString("fr-FR",{hour:"2-digit",minute:"2-digit",second:"2-digit"}))
    tick(); const t=setInterval(tick,1000); return()=>clearInterval(t)
  },[])

  const handleValider = (consultId, data) => {
    const ts=new Date().toLocaleString("fr-FR")
    const existing = consultations.find(c=>c.id===consultId)
    if (existing) {
      updateConsultation(consultId, { ...data, signePar:user?.nom||"Dr. Doumbouya", signeLe:ts })
    } else {
      addConsultation({ id:consultId, ...data, signePar:user?.nom||"Dr. Doumbouya", signeLe:ts })
    }
    // Marquer le patient comme terminé dans la file d'attente
    const entree = file.find(f => f.patientId === data.patientId)
    if (entree) updateFileEntry(entree.id, { statut: "termine" })
    // Notifier le médecin assigné
    if (data.docteurId) {
      const patient = sharedPatients.find(p => p.id === data.patientId)
      addNotif({
        docteurId: data.docteurId,
        patientNom: patient?.nom || entree?.nom || "Patient",
        motif: data.plaintes || entree?.motif || "Consultation",
        service: data.service || "",
      })
    }
  }

  const handleModifier = (consultId, data) => {
    updateConsultation(consultId, data)
  }

  const enAttente = consultations.filter(c=>c.date===today()&&!c.signePar).length

  const NAV_ICONS = {
    accueil: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9.5L12 3l9 6.5V20a1 1 0 01-1 1H4a1 1 0 01-1-1V9.5z"/><path d="M9 21V12h6v9"/></svg>,
    liste:   <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M9 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V4a2 2 0 00-2-2h-3"/><rect x="9" y="1" width="6" height="3" rx="1"/><line x1="12" y1="9" x2="12" y2="15"/><line x1="9" y1="12" x2="15" y2="12"/></svg>,
    patient: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="9" cy="7" r="3.5"/><path d="M2.5 20c0-3.6 2.9-6.5 6.5-6.5s6.5 2.9 6.5 6.5"/><circle cx="17.5" cy="7" r="2.5"/><path d="M21.5 20c0-2.8-2-5-4.5-5.5"/></svg>,
    clock:   <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="9"/><polyline points="12 7 12 12 15.5 14"/><polyline points="10 15 12 17 16 13"/></svg>,
    stats:   <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><line x1="3" y1="20" x2="21" y2="20"/><rect x="4" y="10" width="4" height="10" rx="1"/><rect x="10" y="6" width="4" height="14" rx="1"/><rect x="16" y="3" width="4" height="17" rx="1"/></svg>,
    history: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><polyline points="1 4 1 10 7 10"/><path d="M3.51 15a9 9 0 1 0 .49-4.51"/><line x1="12" y1="7" x2="12" y2="12"/><polyline points="10 14 12 12 14 14"/></svg>,
  }
  const NAV = [
    { id:"accueil",       label:"Tableau de bord",   icon:"accueil" },
    { id:"consultations", label:"Consultations",      icon:"liste",   badge:enAttente },
    { id:"comptes",       label:"Gestion Personnel",  icon:"patient" },
    { id:"presence",      label:"Suivi Présence",     icon:"clock" },
    { id:"stats",         label:"Statistiques",       icon:"stats" },
    { id:"historique",    label:"Historique Patients",icon:"history" },
  ]

  return (
    <div style={{ minHeight:"100vh", background:"#ffffff", fontFamily:"'Segoe UI',system-ui,sans-serif", color:C.textPri }}>

      {/* SIDEBAR */}
      {sidebarOpen&&(
        <div style={{ position:"fixed",inset:0,background:"rgba(0,0,0,0.3)",zIndex:100 }} onClick={()=>setSidebarOpen(false)}>
          <div style={{ position:"absolute",left:0,top:0,bottom:0,width:260,background:C.white,boxShadow:"4px 0 20px rgba(0,0,0,0.1)",display:"flex",flexDirection:"column",overflow:"auto" }} onClick={e=>e.stopPropagation()}>
            <div style={{ padding:"22px 20px 18px",borderBottom:"1px solid "+C.border,display:"flex",alignItems:"center",gap:12,flexShrink:0 }}>
              <div style={{ width:44,height:44,borderRadius:10,background:"#fff",border:"1px solid "+C.border,padding:3,flexShrink:0,display:"flex",alignItems:"center",justifyContent:"center" }}>
                <img src={logo} alt="" style={{ width:"100%",height:"100%",borderRadius:7,objectFit:"contain",display:"block" }}/>
              </div>
              <div>
                <p style={{ fontSize:14,fontWeight:800,color:C.textPri }}>Clinique ABC Marouane</p>
                <p style={{ fontSize:12,color:C.textSec }}>Espace médecin chef</p>
              </div>
            </div>
            <nav style={{ padding:"14px 12px",flex:1 }}>
              {NAV.map(n=>(
                <button key={n.id} onClick={()=>{ setPage(n.id); setSidebarOpen(false) }}
                  style={{ width:"100%",display:"flex",alignItems:"center",gap:12,padding:"11px 12px",borderRadius:12,border:"none",background:page===n.id?C.blueSoft:"transparent",color:page===n.id?C.blue:C.textSec,fontSize:14,fontWeight:page===n.id?700:500,cursor:"pointer",marginBottom:2,fontFamily:"inherit",textAlign:"left" }}
                  onMouseEnter={e=>{ if(page!==n.id) e.currentTarget.style.background=C.slateSoft }}
                  onMouseLeave={e=>{ if(page!==n.id) e.currentTarget.style.background="transparent" }}>
                  <span style={{ display:"flex",alignItems:"center",justifyContent:"center",width:26,height:26,borderRadius:6,background:page===n.id?"rgba(37,99,235,0.12)":"transparent",flexShrink:0 }}>{NAV_ICONS[n.icon]}</span>
                  <span style={{ flex:1 }}>{n.label}</span>
                  {n.badge>0&&<span style={{ background:C.red,color:"#fff",fontSize:11,fontWeight:700,borderRadius:10,padding:"2px 7px" }}>{n.badge}</span>}
                </button>
              ))}
            </nav>
            <div style={{ padding:"12px 16px 18px",borderTop:"1px solid "+C.border,flexShrink:0 }}>
              <div style={{ display:"flex",alignItems:"center",gap:10,padding:"10px 12px",background:C.slateSoft,borderRadius:12,border:"1px solid "+C.slate+"33" }}>
                <div style={{ width:36,height:36,borderRadius:"50%",background:C.slate,display:"flex",alignItems:"center",justifyContent:"center" }}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                </div>
                <div>
                  <p style={{ fontSize:13,fontWeight:700,color:C.textPri }}>{user?.nom || "Dr. Doumbouya"}</p>
                  <p style={{ fontSize:11,color:C.slate,fontWeight:600 }}>Médecin chef · Médecine générale</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* HEADER */}
      <header style={{ background:C.white,borderBottom:"1px solid "+C.border,padding:"0 24px",height:64,display:"flex",alignItems:"center",justifyContent:"space-between",position:"sticky",top:0,zIndex:50,boxShadow:"0 1px 3px rgba(0,0,0,0.05)" }}>
        <button onClick={()=>setSidebarOpen(true)} style={{ width:40,height:40,borderRadius:8,border:"1px solid "+C.border,background:C.white,cursor:"pointer",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",gap:5 }}>
          <div style={{ width:20,height:2,background:C.textPri,borderRadius:2 }}/>
          <div style={{ width:20,height:2,background:C.textPri,borderRadius:2 }}/>
          <div style={{ width:20,height:2,background:C.textPri,borderRadius:2 }}/>
        </button>

        {/* Logo clinique */}
        <div style={{ display:"flex",alignItems:"center",gap:10,marginLeft:12,paddingRight:20,borderRight:"1px solid "+C.border,flexShrink:0 }}>
          <div style={{ width:38,height:38,borderRadius:9,background:"#fff",border:"1px solid "+C.border,padding:3,display:"flex",alignItems:"center",justifyContent:"center" }}>
            <img src={logo} alt="" style={{ width:"100%",height:"100%",borderRadius:6,objectFit:"contain",display:"block" }}/>
          </div>
          <div>
            <p style={{ fontSize:13,fontWeight:800,color:C.textPri,lineHeight:1.2 }}>Clinique Marouane</p>
            <p style={{ fontSize:11,color:C.textMuted }}>Médecin chef</p>
          </div>
        </div>
        <div style={{ flex:1 }}/>

        <div style={{ display:"flex",alignItems:"center",gap:14 }}>
          {enAttente>0&&(
            <button onClick={()=>setPage("consultations")}
              style={{ background:C.slateSoft,border:"1px solid "+C.slate+"44",borderRadius:10,padding:"7px 14px",fontSize:12,fontWeight:700,color:C.slate,cursor:"pointer",fontFamily:"inherit" }}>
              {enAttente} patient{enAttente>1?"s":""} en attente
            </button>
          )}
          <span style={{ fontSize:13,color:C.textSec,fontVariantNumeric:"tabular-nums" }}>{heure}</span>
          <button onClick={()=>setShowSettings(true)}
            style={{ width:40,height:40,borderRadius:10,border:"1px solid "+C.border,background:C.white,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center" }}
            title="Paramètres clinique">
            <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke={C.green} strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>
          </button>
          <button onClick={()=>{ setPointerHeure(new Date().toLocaleTimeString("fr-FR",{hour:"2-digit",minute:"2-digit"})); setShowPointer(true) }}
            style={{ display:"flex",alignItems:"center",gap:8,padding:"9px 16px",borderRadius:10,border:"1.5px solid "+C.green,background:C.white,color:C.green,fontSize:13,fontWeight:600,cursor:"pointer",fontFamily:"inherit" }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={C.green} strokeWidth="2.2" strokeLinecap="round"><path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"/><polyline points="10 17 15 12 10 7"/><line x1="15" y1="12" x2="3" y2="12"/></svg>
            Pointer Arrivée
          </button>
          <div style={{ display:"flex",alignItems:"center",gap:8 }}>
            <div style={{ textAlign:"right" }}>
              <p style={{ fontSize:14,fontWeight:700,color:C.textPri }}>{user?.nom || "Dr. Doumbouya"}</p>
              <p style={{ fontSize:12,color:C.textSec }}>Médecin chef</p>
            </div>
            <div style={{ width:38,height:38,borderRadius:"50%",background:C.slateSoft,border:"2px solid "+C.slate+"33",display:"flex",alignItems:"center",justifyContent:"center" }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={C.slate} strokeWidth="2" strokeLinecap="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
            </div>
          </div>
          <button onClick={handleLogout} title="Se déconnecter"
            style={{ width:36,height:36,borderRadius:8,border:"1px solid #fca5a5",background:"#fff5f5",cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0 }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#cc2222" strokeWidth="2" strokeLinecap="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
          </button>
        </div>
      </header>

      {showSettings && <SettingsModal onClose={()=>setShowSettings(false)} />}

      {/* Confirmation pointer */}
      {showPointer&&(
        <div style={{ position:"fixed",inset:0,background:"rgba(0,0,0,0.4)",zIndex:200,display:"flex",alignItems:"center",justifyContent:"center" }}>
          <div style={{ background:C.white,borderRadius:16,padding:32,maxWidth:380,width:"100%",textAlign:"center",boxShadow:"0 20px 60px rgba(0,0,0,0.2)" }}>
            <div style={{ width:60,height:60,borderRadius:"50%",background:C.greenSoft,margin:"0 auto 16px",display:"flex",alignItems:"center",justifyContent:"center" }}>
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke={C.green} strokeWidth="2" strokeLinecap="round"><polyline points="20 6 9 17 4 12"/></svg>
            </div>
            <p style={{ fontSize:18,fontWeight:800,color:C.textPri,marginBottom:8 }}>Arrivée enregistrée</p>
            <p style={{ fontSize:14,color:C.textSec,marginBottom:8 }}>{user?.nom || "Dr. Doumbouya"} · Médecin chef</p>
            <p style={{ fontSize:28,fontWeight:800,color:C.textPri,marginBottom:20 }}>{pointerHeure}</p>
            <p style={{ fontSize:13,color:C.textMuted,marginBottom:24 }}>Votre heure d'arrivée est enregistrée et ne peut pas être modifiée.</p>
            <button onClick={()=>setShowPointer(false)} style={{ width:"100%",padding:"12px",background:C.blue,color:"#fff",border:"none",borderRadius:10,fontSize:14,fontWeight:600,cursor:"pointer",fontFamily:"inherit" }}>Fermer</button>
          </div>
        </div>
      )}

      {/* CONTENU */}
      <main style={{ padding:"32px 24px" }}>
        {page==="accueil"       && <PageAccueil       consultations={consultations} patients={patients} file={file} setPage={setPage} />}
        {page==="consultations" && <PageConsultations consultations={consultations} patients={patients} file={file} medecins={medecins} onValider={handleValider} onModifier={handleModifier} />}
        {page==="comptes"       && <PageComptes       comptes={comptes} setComptes={setComptes} medecins={medecins} setMedecins={setMedecins} />}
        {page==="presence"      && <PagePresence      medecins={medecins} />}
        {page==="stats"         && <PageStats         consultations={consultations} patients={patients} />}
        {page==="historique"    && <PageHistorique    consultations={consultations} patients={patients} resultatsLabo={resultatsLabo} soins={soins} rdv={rdv} />}
      </main>

      <style>{`
        *{box-sizing:border-box;margin:0;padding:0}
        input::placeholder,textarea::placeholder{color:#94a3b8}
        select option{background:#fff;color:#0f172a}
        ::-webkit-scrollbar{width:5px}
        ::-webkit-scrollbar-thumb{background:#cbd5e1;border-radius:3px}
        button:focus{outline:none}
        @keyframes blink{0%,100%{opacity:1}50%{opacity:.35}}
      `}</style>
    </div>
  )
}
