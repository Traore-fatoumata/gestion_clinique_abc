import { useState, useEffect } from "react"
import logo from "../../assets/images/logo.jpeg"
import { useClinicSettings } from "../../hooks/useClinicSettings.jsx"
import { useAuth } from "../../hooks/useAuth.jsx"
import { useNavigate } from "react-router-dom"
import { useSharedData } from "../../hooks/useSharedData.jsx"
import { C, Card, CardHeader, Btn, Avatar, DOCTEURS, today, nowTime, fmt, tarifParAge } from "./secretaire/shared.jsx"
import ModalNouveauPatient from "./secretaire/ModalNouveauPatient.jsx"
import ModalRechercheDossier from "./secretaire/ModalRechercheDossier.jsx"
import ModalPermission from "./secretaire/ModalPermission.jsx"
import ModalHistorique from "./secretaire/ModalHistorique.jsx"
import { estEnAttenteAccueil } from "../../utils/clinicFlow.js"

// ══════════════════════════════════════════════════════
//  COMPOSANT PRINCIPAL
// ══════════════════════════════════════════════════════
export default function DashboardSecretaire() {
  const { user, logout } = useAuth()
  const navigate   = useNavigate()
  const handleLogout = () => { logout(); navigate("/login") }

  const { patients, addPatient, file, addToFile, rdv: rdvs, updateRdv, addNotif, consultations } = useSharedData()

  // File accueil : pas assigné à un médecin et pas encore trié aujourd'hui
  const fileActif = file.filter(f => estEnAttenteAccueil(f, consultations))

  const [onglet,       setOnglet]       = useState("accueil")
  const [sidebarOpen,  setSidebarOpen]  = useState(false)
  const [heure,        setHeure]        = useState("")
  const [dateStr,      setDateStr]      = useState("")
  const [showNouveau,  setShowNouveau]  = useState(false)
  const [showRecherche,setShowRecherche]= useState(false)
  const [notifications,setNotifications]= useState([
    { id:1, type:"rdv",  message:"RDV de Sow Fatoumata demain à 09h00 — Gynécologie (envoyée direct au spécialiste)", lu:false, date:today() },
    { id:2, type:"rdv",  message:"Rappel : Baldé Aissatou a un RDV le 07/04 à 08h30", lu:false, date:today() }
  ])
  const [showNotifs, setShowNotifs]=useState(false)
  const [recherchePatients, setRecherchePatients]=useState("")
  const [permissionModal, setPermissionModal] = useState(null) // { medecin, type: null }
  const { settings } = useClinicSettings()

  const patientsFiltres = patients.filter(p=>{
    const q=recherchePatients.toLowerCase().trim()
    if(!q) return true
    return p.nom.toLowerCase().includes(q)||
           p.pid.toLowerCase().includes(q)||
           (p.telephone||"").includes(q)||
           (p.quartier||"").toLowerCase().includes(q)||
           (p.secteur||"").toLowerCase().includes(q)||
           (p.profession||"").toLowerCase().includes(q)
  })

  useEffect(()=>{
    const tick=()=>{
      const n=new Date()
      setHeure(n.toLocaleTimeString("fr-FR",{hour:"2-digit",minute:"2-digit",second:"2-digit"}))
      setDateStr(n.toLocaleDateString("fr-FR",{weekday:"long",day:"numeric",month:"long",year:"numeric"}))
    }
    tick(); const t=setInterval(tick,1000); return()=>clearInterval(t)
  },[])

  const nonLues = notifications.filter(n=>!n.lu).length

  const handleEnregistrer = async (form) => {
    const fullNom = form.nom.trim()+" "+form.prenom.trim()

    let age=form.age||""
    if (!age&&form.dateNaissance) { const a=Math.floor((Date.now()-new Date(form.dateNaissance))/(365.25*24*3600*1000)); age=a+" ans" }

    const nouveau={
      nom:fullNom,
      dateNaissance:form.dateNaissance,
      sexe:form.sexe,
      telephone:form.telephone,
      quartier:form.quartier,
      secteur:form.secteur,
      profession:form.profession,
      responsable:form.responsable,
    }

    try {
      const createdPatient = await addPatient(nouveau)
      const parsedMont = parseInt(form.montantConsultation, 10)
      const montantForFile = Number.isFinite(parsedMont) ? parsedMont : tarifParAge(form.dateNaissance, settings)
      await addToFile({
        patientId: createdPatient.id,
        pid: createdPatient.pid,
        nom: createdPatient.nom,
        arrivee: nowTime(),
        typeVisite: "consultation",
        statut: "en_attente",
        montantConsultation: montantForFile,
        paiementConsultation: null,
        motif: "Consultation — accueil",
        service: "Accueil",
      })
      setShowNouveau(false)
      alert(""+fullNom+" enregistré et ajouté à la file du médecin chef.")
    } catch (err) {
      console.error("Erreur enregistrement patient:", err)
      alert("Impossible d'enregistrer le patient. Réessayez.")
    }
  }

  const handleSignaler = (patient, montant, rdv) => {
    const deja = file.find(f=>f.patientId===patient.id && f.statut !== "termine")
    if (deja) { alert(patient.nom+" est déjà dans la file d'attente."); return }
    const parsed = typeof montant === "string" ? parseInt(montant, 10) : Number(montant)
    const montantConsult = Number.isFinite(parsed) ? parsed : tarifParAge(patient.dateNaissance, settings)
    addToFile({
      patientId: patient.id,
      pid: patient.pid,
      nom: patient.nom,
      arrivee: nowTime(),
      typeVisite: rdv ? "rendez_vous" : "consultation",
      statut: "en_attente",
      montantConsultation: montantConsult,
      paiementConsultation: null,
      service: rdv?.service || "Médecine générale",
      docteurId: rdv?.docteurId || 1,
      motif: rdv?.motif || "Consultation",
      docteur: rdv?.docteur,
      rdvId: rdv?.id,
    })
    if (rdv) {
      alert(`${patient.nom} signalé directement au médecin spécialiste ${rdv.docteur} (${rdv.service}). Montant : ${montantConsult.toLocaleString("fr-FR")} GNF à payer à la comptabilité.`)
    } else {
      alert(`${patient.nom} signalé au médecin chef. Montant : ${montantConsult.toLocaleString("fr-FR")} GNF à payer à la comptabilité.`)
    }
  }

  const envoyerRappel = (rdvId) => {
    const r = rdvs.find(x => x.id === rdvId)
    updateRdv(rdvId, { rappelEnvoye: true })
    if (r?.docteurId) {
      addNotif({ docteurId: r.docteurId, titre: "Rappel de rendez-vous", patientNom: r.patient, motif: "RDV le "+fmt(r.date)+" à "+r.heure+(r.motif?" — "+r.motif:"") })
    }
    setNotifications(prev=>[{ id:Date.now(), type:"rdv", message:"Rappel signalé à "+r?.docteur+" pour "+r?.patient, lu:false, date:today() },...prev])
  }

  // ══════════════════════════════════════════════════════
  //  GESTION PRÉSENCE MÉDECINS
  // ══════════════════════════════════════════════════════
  const [medecins, setMedecins] = useState(() => {
    const saved = localStorage.getItem('clinique_medecins_presence')
    if (saved) {
      try {
        const parsed = JSON.parse(saved)
        // Vérifier si c'est un nouveau jour
        if (parsed.date === today()) {
          return DOCTEURS.map(d => {
            const savedMed = parsed.medecins.find(m => m.id === d.id)
            return savedMed ? { ...d, ...savedMed, historique: [] } : { ...d, arrivee: null, depart: null, present: false, historique: [] }
          })
        }
      } catch {
        // Erreur de parsing, on initialise à vide
      }
    }
    return DOCTEURS.map(d => ({ ...d, arrivee: null, depart: null, present: false, historique: [] }))
  })

  // Sauvegarder dans localStorage à chaque modification
  useEffect(() => {
    const medecinsToSave = medecins.map(m => {
      const { historique: _historique, ...rest } = m
      return rest
    })
    localStorage.setItem('clinique_medecins_presence', JSON.stringify({
      date: today(),
      medecins: medecinsToSave
    }))
  }, [medecins])

  // Historique de présence
  const [historique, setHistorique] = useState(() => {
    const saved = localStorage.getItem('clinique_historique_presence')
    if (saved) {
      try {
        return JSON.parse(saved)
      } catch {
        return []
      }
    }
    return []
  })

  // Sauvegarder l'historique
  useEffect(() => {
    localStorage.setItem('clinique_historique_presence', JSON.stringify(historique))
  }, [historique])

  const pointerArrivee = (id) => {
    const heure = nowTime()
    setMedecins(prev => prev.map(m =>
      m.id === id ? {
        ...m,
        arrivee: heure,
        depart: null,
        present: true,
        historique: [...(m.historique || []), { type: 'arrivée', heure, date: today() }]
      } : m
    ))
    // Ajouter à l'historique global
    setHistorique(prev => [...prev, { medecinId: id, type: 'arrivée', heure, date: today() }])
    const med = medecins.find(m => m.id === id)
    alert(`${med.nom} est arrivé(e) à ${heure}`)
  }

  const pointerDepart = (id) => {
    const heure = nowTime()
    setMedecins(prev => prev.map(m =>
      m.id === id ? {
        ...m,
        depart: heure,
        present: false,
        historique: [...(m.historique || []), { type: 'départ', heure, date: today() }]
      } : m
    ))
    // Ajouter à l'historique global
    setHistorique(prev => [...prev, { medecinId: id, type: 'départ', heure, date: today() }])
    const med = medecins.find(m => m.id === id)
    alert(`${med.nom} est parti(e) à ${heure}`)
  }

  // Gestion des permissions
  const demanderPermission = (medecin) => {
    setPermissionModal({ medecin, type: null })
  }

  const validerPermission = ({ type, description, dateDebut, dateFin, justificatif }) => {
    const medecin = permissionModal.medecin
    const nouvelHistorique = [
      ...historique,
      {
        medecinId: medecin.id,
        type,
        heure: nowTime(),
        date: today(),
        description,
        dateDebut,
        dateFin,
        justificatif: justificatif ? justificatif.name : null
      }
    ]
    setHistorique(nouvelHistorique)

    // Mettre à jour le statut du médecin si c'est aujourd'hui
    if (dateDebut <= today() && dateFin >= today()) {
      setMedecins(prev => prev.map(m =>
        m.id === medecin.id ? {
          ...m,
          present: false,
          arrivee: null,
          depart: null,
          historique: [...(m.historique || []), { type, heure: nowTime(), date: today(), description }]
        } : m
      ))
    }

    alert(`Permission enregistrée pour ${medecin.nom} (${type})`)
  }

  // Statistiques du jour
  const presenceStats = {
    presents: medecins.filter(m => m.present).length,
    absents: medecins.filter(m => !m.present).length,
    total: medecins.length,
    pourcentage: Math.round((medecins.filter(m => m.present).length / medecins.length) * 100)
  }

  const NAV_ICONS = {
    accueil:  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9.5L12 3l9 6.5V20a1 1 0 01-1 1H4a1 1 0 01-1-1V9.5z"/><path d="M9 21V12h6v9"/></svg>,
    file:     <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="9" cy="7" r="3.5"/><path d="M2.5 20c0-3.6 2.9-6.5 6.5-6.5s6.5 2.9 6.5 6.5"/><line x1="17" y1="9" x2="22" y2="9"/><line x1="17" y1="13" x2="22" y2="13"/><line x1="17" y1="17" x2="20" y2="17"/></svg>,
    liste:    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16v16H4z" rx="2"/><line x1="4" y1="9" x2="20" y2="9"/><line x1="4" y1="14" x2="20" y2="14"/><line x1="9" y1="4" x2="9" y2="20"/></svg>,
    rdv:      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/><circle cx="12" cy="16" r="1.5" fill="currentColor" stroke="none"/></svg>,
    presence: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="9"/><polyline points="12 7 12 12 15.5 14"/><polyline points="10 15 12 17 16 13"/></svg>,
  }
  const NAV=[
    { id:"accueil",  label:"Accueil",           icon:"accueil",  desc:"Vue d'ensemble"         },
    { id:"file",     label:"File d'attente",    icon:"file",     desc:"Patients du jour"       },
    { id:"patients", label:"Tous les patients", icon:"liste",    desc:"Registre complet"       },
    { id:"rdv",      label:"Rendez-vous",       icon:"rdv",      desc:"Planning"               },
    { id:"presence", label:"Présence Médecins", icon:"presence", desc:"Pointage Arrivée/Départ"},
  ]

  return (
    <div style={{ minHeight:"100vh",background:"#ffffff",fontFamily:"'Segoe UI',system-ui,sans-serif",color:C.textPri }}>

      {/* MODALS */}
      {showNouveau   && <ModalNouveauPatient patients={patients} onClose={()=>setShowNouveau(false)} onEnregistrer={handleEnregistrer}/>}
      {showRecherche && <ModalRechercheDossier patients={patients} rdvs={rdvs} onClose={()=>setShowRecherche(false)} onSignaler={handleSignaler}/>}
      {permissionModal && <ModalPermission medecin={permissionModal.medecin} onClose={()=>setPermissionModal(null)} onValider={validerPermission}/>}
      {onglet === "historique" && <ModalHistorique medecins={medecins} historique={historique} onClose={()=>setOnglet("presence")}/>}

      {/* SIDEBAR */}
      {sidebarOpen&&(
        <div style={{ position:"fixed",inset:0,background:"rgba(0,0,0,0.3)",zIndex:100 }} onClick={()=>setSidebarOpen(false)}>
          <div style={{ position:"absolute",left:0,top:0,bottom:0,width:265,background:C.white,boxShadow:"4px 0 24px rgba(0,0,0,0.12)",display:"flex",flexDirection:"column" }} onClick={e=>e.stopPropagation()}>
            <div style={{ padding:"22px 20px 18px",borderBottom:"1px solid "+C.border,display:"flex",alignItems:"center",gap:12 }}>
              <div style={{ width:44,height:44,borderRadius:10,background:"#fff",border:"1px solid "+C.border,padding:3,flexShrink:0,display:"flex",alignItems:"center",justifyContent:"center" }}>
                <img src={logo} alt="" style={{ width:"100%",height:"100%",borderRadius:7,objectFit:"contain",display:"block" }}/>
              </div>
              <div>
                <p style={{ fontSize:14,fontWeight:800,color:C.textPri }}>Clinique ABC Marouane</p>
                <p style={{ fontSize:12,color:C.textSec }}>Espace secrétaire</p>
              </div>
            </div>
            <nav style={{ padding:"14px 12px",flex:1 }}>
              {NAV.map(n=>(
                <button key={n.id} onClick={()=>{ setOnglet(n.id); setSidebarOpen(false) }}
                  style={{ width:"100%",display:"flex",alignItems:"center",gap:12,padding:"11px 12px",borderRadius:12,border:"none",background:onglet===n.id?C.blueSoft:"transparent",color:onglet===n.id?C.blue:C.textSec,fontSize:14,fontWeight:onglet===n.id?700:500,cursor:"pointer",textAlign:"left",marginBottom:3,transition:"all .15s" }}
                  onMouseEnter={e=>{ if(onglet!==n.id) e.currentTarget.style.background=C.slateSoft }}
                  onMouseLeave={e=>{ if(onglet!==n.id) e.currentTarget.style.background="transparent" }}>
                  <span style={{ display:"flex",alignItems:"center",justifyContent:"center",width:28,height:28,borderRadius:7,background:onglet===n.id?"rgba(37,99,235,0.12)":"transparent",flexShrink:0 }}>{NAV_ICONS[n.icon]}</span>
                  <div>
                    <p style={{ fontSize:13 }}>{n.label}</p>
                    <p style={{ fontSize:10,color:C.textMuted,marginTop:1 }}>{n.desc}</p>
                  </div>
                </button>
              ))}
            </nav>
            <div style={{ padding:"14px 16px 20px",borderTop:"1px solid "+C.border }}>
              <div style={{ display:"flex",alignItems:"center",gap:10,padding:"10px 12px",background:C.greenSoft,borderRadius:12,border:"1px solid "+C.green+"33" }}>
                <div style={{ width:36,height:36,borderRadius:"50%",background:C.green,display:"flex",alignItems:"center",justifyContent:"center" }}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                </div>
                <div>
                  <p style={{ fontSize:13,fontWeight:700,color:C.textPri }}>{user?.nom||"Secrétaire"}</p>
                  <p style={{ fontSize:11,color:C.green,fontWeight:600 }}>{user?.titre||"Secrétaire"} · Accueil</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* HEADER */}
      <header style={{ background:C.white,borderBottom:"1px solid "+C.border,padding:"0 24px",height:64,display:"flex",alignItems:"center",justifyContent:"space-between",position:"sticky",top:0,zIndex:50,boxShadow:"0 1px 3px rgba(0,0,0,0.05)" }}>
        <button onClick={()=>setSidebarOpen(true)} style={{ width:40,height:40,borderRadius:8,border:"1px solid "+C.border,background:C.white,cursor:"pointer",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",gap:5 }}>
          <div style={{ width:20,height:2,background:C.textPri,borderRadius:2 }}/><div style={{ width:20,height:2,background:C.textPri,borderRadius:2 }}/><div style={{ width:20,height:2,background:C.textPri,borderRadius:2 }}/>
        </button>

        {/* Logo clinique */}
        <div style={{ display:"flex",alignItems:"center",gap:10,marginLeft:12,paddingRight:20,borderRight:"1px solid "+C.border,flexShrink:0 }}>
          <div style={{ width:38,height:38,borderRadius:9,background:"#fff",border:"1px solid "+C.border,padding:3,display:"flex",alignItems:"center",justifyContent:"center" }}>
            <img src={logo} alt="" style={{ width:"100%",height:"100%",borderRadius:6,objectFit:"contain",display:"block" }}/>
          </div>
          <div>
            <p style={{ fontSize:13,fontWeight:800,color:C.textPri,lineHeight:1.2 }}>Clinique Marouane</p>
            <p style={{ fontSize:11,color:C.textMuted }}>Secrétariat</p>
          </div>
        </div>

        <div style={{ flex:1,marginLeft:16 }}>
          <p style={{ fontSize:15,fontWeight:700,color:C.textPri,lineHeight:1.2 }}>Clinique ABC Marouane — Accueil</p>
          <p style={{ fontSize:12,color:C.textMuted,textTransform:"capitalize" }}>{dateStr}</p>
        </div>
        <div style={{ display:"flex",alignItems:"center",gap:12 }}>
          {/* Notifications */}
          <div style={{ position:"relative" }}>
            <button onClick={()=>setShowNotifs(v=>!v)}
              style={{ width:40,height:40,borderRadius:10,border:"1px solid "+C.border,background:C.white,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",position:"relative" }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={C.textSec} strokeWidth="2" strokeLinecap="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>
              {nonLues>0&&<span style={{ position:"absolute",top:-4,right:-4,width:18,height:18,borderRadius:"50%",background:C.red,color:"#fff",fontSize:10,fontWeight:700,display:"flex",alignItems:"center",justifyContent:"center" }}>{nonLues}</span>}
            </button>
            {showNotifs&&(
              <div style={{ position:"absolute",top:48,right:0,width:320,background:C.white,borderRadius:14,border:"1px solid "+C.border,boxShadow:"0 8px 30px rgba(0,0,0,0.15)",zIndex:200 }}>
                <div style={{ padding:"14px 16px",borderBottom:"1px solid "+C.border,display:"flex",justifyContent:"space-between",alignItems:"center" }}>
                  <p style={{ fontSize:14,fontWeight:700,color:C.textPri }}>Notifications</p>
                  <button onClick={()=>setNotifications(prev=>prev.map(n=>({...n,lu:true})))} style={{ fontSize:11,color:C.textPri,background:"none",border:"none",cursor:"pointer",fontFamily:"inherit" }}>Tout lire</button>
                </div>
                {notifications.length===0&&<p style={{ padding:20,textAlign:"center",color:C.textMuted,fontSize:13 }}>Aucune notification</p>}
                {notifications.map(n=>(
                  <div key={n.id} onClick={()=>setNotifications(prev=>prev.map(x=>x.id===n.id?{...x,lu:true}:x))}
                    style={{ padding:"12px 16px",borderBottom:"1px solid "+C.border,cursor:"pointer",background:n.lu?"transparent":C.blueSoft+"66",display:"flex",gap:10,alignItems:"flex-start" }}>
                    <span style={{ fontSize:16,marginTop:1 }}>{n.type==="rdv"?"RDV":""}</span>
                    <div style={{ flex:1 }}>
                      <p style={{ fontSize:13,color:C.textPri,lineHeight:1.4 }}>{n.message}</p>
                      <p style={{ fontSize:11,color:C.textMuted,marginTop:2 }}>{n.date}</p>
                    </div>
                    {!n.lu&&<div style={{ width:8,height:8,borderRadius:"50%",background:C.blue,flexShrink:0,marginTop:4 }}/>}
                  </div>
                ))}
              </div>
            )}
          </div>
          <div style={{ background:C.greenSoft,border:"1px solid "+C.green+"33",borderRadius:10,padding:"6px 14px",fontSize:14,fontWeight:700,color:C.textPri,fontVariantNumeric:"tabular-nums" }}>{heure}</div>
          <div style={{ display:"flex",alignItems:"center",gap:8 }}>
            <div style={{ textAlign:"right" }}>
              <p style={{ fontSize:13,fontWeight:700,color:C.textPri }}>{user?.nom||"Secrétaire"}</p>
              <p style={{ fontSize:11,color:C.textSec }}>{user?.titre||"Secrétaire Médicale"}</p>
            </div>
            <div style={{ width:36,height:36,borderRadius:"50%",background:C.greenSoft,border:"2px solid "+C.green+"33",display:"flex",alignItems:"center",justifyContent:"center" }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={C.green} strokeWidth="2" strokeLinecap="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
            </div>
          </div>
          <button onClick={handleLogout} title="Se déconnecter"
            style={{ width:36,height:36,borderRadius:8,border:"1px solid #fca5a5",background:"#fff5f5",cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0 }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#cc2222" strokeWidth="2" strokeLinecap="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
          </button>
        </div>
      </header>

      <main style={{ padding:"24px 28px" }}>

        {/* ══ ACCUEIL ══ */}
        {onglet==="accueil"&&(
          <div style={{ display:"flex",flexDirection:"column",gap:20 }}>
            {/* KPIs */}
            <div style={{ display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:16 }}>
              {[
                { val:fileActif.length, label:"En attente", svg:<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>, bg:C.blueSoft, fg:C.blue },
                { val:fileActif.filter(f=>f.typeVisite==="rendez_vous").length, label:"Rendez-vous du jour", svg:<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>, bg:C.purpleSoft, fg:C.purple },
                { val:rdvs.filter(r=>r.date===today()).length, label:"RDV aujourd'hui", svg:<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>, bg:C.slateSoft, fg:C.slate },
              ].map(({val,label,svg,bg,fg})=>(
                <Card key={label} style={{ padding:"20px" }}>
                  <div style={{ width:42,height:42,borderRadius:10,background:bg,display:"flex",alignItems:"center",justifyContent:"center",marginBottom:12,color:fg }}>{svg}</div>
                  <p style={{ fontSize:28,fontWeight:800,color:C.textPri,lineHeight:1,marginBottom:4 }}>{val}</p>
                  <p style={{ fontSize:12,color:C.textMuted }}>{label}</p>
                </Card>
              ))}
            </div>

            {/* Actions rapides */}
            <div style={{ display:"grid",gridTemplateColumns:"repeat(2,1fr)",gap:14 }}>
              {[
                { label:"Nouveau patient",    desc:"Enregistrer un nouveau patient", svg:<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/><line x1="12" y1="12" x2="12" y2="18"/><line x1="9" y1="15" x2="15" y2="15"/></svg>, action:()=>setShowNouveau(true), color:C.blue },
                { label:"Rechercher dossier", desc:"Patient déjà enregistré",        svg:<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>, action:()=>setShowRecherche(true), color:C.green },
              ].map(({label,desc,svg,action,color})=>(
                <Card key={label} style={{ padding:"20px",cursor:"pointer",transition:"all .15s",border:"1.5px solid "+C.border }}
                  onClick={action}
                  onMouseEnter={e=>{ e.currentTarget.style.border="1.5px solid "+color; e.currentTarget.style.background=color+"11" }}
                  onMouseLeave={e=>{ e.currentTarget.style.border="1.5px solid "+C.border; e.currentTarget.style.background=C.white }}>
                  <div style={{ width:46,height:46,borderRadius:12,background:color+"22",display:"flex",alignItems:"center",justifyContent:"center",marginBottom:12,color }}>{svg}</div>
                  <p style={{ fontSize:14,fontWeight:700,color:C.textPri,marginBottom:4 }}>{label}</p>
                  <p style={{ fontSize:12,color:C.textMuted }}>{desc}</p>
                </Card>
              ))}
            </div>

            {/* File du jour */}
            <Card>
              <CardHeader title={"File d'attente — "+fileActif.length+" patient"+(fileActif.length>1?"s":"")} action={<button onClick={()=>setOnglet("file")} style={{ background:"none",border:"none",color:C.blue,fontSize:13,cursor:"pointer",fontWeight:600 }}>Tout voir</button>}/>
              {fileActif.length===0
                ? <p style={{ padding:32,textAlign:"center",color:C.textMuted }}>Aucun patient en attente</p>
                : fileActif.slice(0,4).map((f,i)=>(
                  <div key={f.id} style={{ padding:"13px 20px",display:"flex",alignItems:"center",gap:12,borderBottom:i<Math.min(fileActif.length,4)-1?"1px solid "+C.border:"none" }}>
                    <Avatar name={f.nom} size={36}/>
                    <div style={{ flex:1 }}>
                      <p style={{ fontSize:13,fontWeight:600,color:C.textPri }}>{f.nom}</p>
                      <p style={{ fontSize:11,color:C.textSec }}>{f.pid}</p>
                    </div>
                    {f.typeVisite==="rendez_vous"
                      ? <span style={{ fontSize:11,fontWeight:700,background:C.purpleSoft,color:C.purple,padding:"3px 10px",borderRadius:10 }}>RDV</span>
                      : <span style={{ fontSize:11,fontWeight:700,background:C.greenSoft,color:C.green,padding:"3px 10px",borderRadius:10 }}>Consultation</span>
                    }
                    <span style={{ fontSize:13,fontWeight:700,color:C.textPri,fontVariantNumeric:"tabular-nums" }}>{f.arrivee}</span>
                  </div>
                ))
              }
            </Card>

            {/* RDV du jour */}
            <Card>
              <CardHeader title={"Rendez-vous d'aujourd'hui — "+rdvs.filter(r=>r.date===today()).length} action={<button onClick={()=>setOnglet("rdv")} style={{ background:"none",border:"none",color:C.blue,fontSize:13,cursor:"pointer",fontWeight:600 }}>Tout voir</button>}/>
              {rdvs.filter(r=>r.date===today()).length===0
                ? <p style={{ padding:32,textAlign:"center",color:C.textMuted }}>Aucun RDV aujourd'hui</p>
                : rdvs.filter(r=>r.date===today()).map((r,i,arr)=>(
                  <div key={r.id} style={{ padding:"13px 20px",display:"flex",alignItems:"center",gap:12,borderBottom:i<arr.length-1?"1px solid "+C.border:"none" }}>
                    <div style={{ width:44,height:44,borderRadius:10,background:C.purpleSoft,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",flexShrink:0 }}>
                      <p style={{ fontSize:12,fontWeight:800,color:C.textPri }}>{r.heure}</p>
                    </div>
                    <div style={{ flex:1 }}>
                      <p style={{ fontSize:13,fontWeight:600,color:C.textPri }}>{r.patient}</p>
                      <p style={{ fontSize:11,color:C.textSec }}>{r.motif} · {r.docteur}</p>
                    </div>
                    {!r.rappelEnvoye
                      ? <button onClick={()=>envoyerRappel(r.id)} style={{ padding:"5px 12px",background:C.slate,color:"#fff",border:"none",borderRadius:8,fontSize:11,fontWeight:600,cursor:"pointer",fontFamily:"inherit" }}>Rappeler</button>
                      : <span style={{ fontSize:11,fontWeight:600,color:C.green }}>Rappelé</span>
                    }
                  </div>
                ))
              }
            </Card>
          </div>
        )}

        {/* ══ FILE D'ATTENTE ══ */}
        {onglet==="file"&&(
          <div style={{ display:"flex",flexDirection:"column",gap:16 }}>
            <div style={{ display:"flex",justifyContent:"space-between",alignItems:"center" }}>
              <div>
                <p style={{ fontSize:22,fontWeight:800,color:C.textPri,marginBottom:4 }}>File d'attente</p>
                <p style={{ fontSize:14,color:C.textSec }}>{fileActif.length} patient{fileActif.length>1?"s":""} en attente · {file.filter(f=>f.statut==="termine").length} consulté{file.filter(f=>f.statut==="termine").length>1?"s":""} aujourd'hui</p>
              </div>
              <div style={{ display:"flex",gap:10 }}>
                <Btn onClick={()=>setShowNouveau(true)} small>Nouveau patient</Btn>
                <Btn onClick={()=>setShowRecherche(true)} small variant="secondary">Dossier existant</Btn>
              </div>
            </div>
            {fileActif.length===0
              ? <Card style={{ padding:40,textAlign:"center" }}><p style={{ color:C.textMuted }}>Aucun patient en attente</p></Card>
              : fileActif.map((f,)=>(
                <Card key={f.id} style={{ padding:"18px 20px" }}>
                  <div style={{ display:"flex",alignItems:"center",gap:14 }}>
                    <Avatar name={f.nom} size={46}/>
                    <div style={{ flex:1 }}>
                      <div style={{ display:"flex",alignItems:"center",gap:8,marginBottom:4 }}>
                        <p style={{ fontSize:15,fontWeight:700,color:C.textPri }}>{f.nom}</p>
                        {f.typeVisite==="rendez_vous"
                          ? <span style={{ fontSize:11,fontWeight:700,background:C.purpleSoft,color:C.purple,padding:"2px 9px",borderRadius:10 }}>RDV</span>
                          : <span style={{ fontSize:11,fontWeight:700,background:C.greenSoft,color:C.green,padding:"2px 9px",borderRadius:10 }}>Consultation</span>
                        }
                      </div>
                      <p style={{ fontSize:12,color:C.textSec }}>{f.pid}</p>
                    </div>
                    {/* Heure d'arrivée */}
                    <div style={{ textAlign:"center",padding:"8px 16px",background:C.greenSoft,border:"1px solid "+C.green+"33",borderRadius:10 }}>
                      <p style={{ fontSize:10,color:C.textMuted,textTransform:"uppercase",letterSpacing:"0.06em",marginBottom:2 }}>Arrivée</p>
                      <p style={{ fontSize:16,fontWeight:800,color:C.textPri,fontVariantNumeric:"tabular-nums" }}>{f.arrivee}</p>
                    </div>
                    {/* Statut paiement consultation */}
                    {f.paiementConsultation?.statut === "paye"
                      ? <span style={{ fontSize:12,fontWeight:700,background:"#dcfce7",color:"#15803d",padding:"4px 10px",borderRadius:20 }}>Consultation payée</span>
                      : <span style={{ fontSize:12,fontWeight:600,background:"#fee2e2",color:"#dc2626",padding:"4px 10px",borderRadius:20 }}>En attente paiement</span>
                    }
                  </div>
                </Card>
              ))
            }
          </div>
        )}

        {/* ══ TOUS LES PATIENTS ══ */}
        {onglet==="patients"&&(
          <div>
            <div style={{ display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:20 }}>
              <div>
                <p style={{ fontSize:22,fontWeight:800,color:C.textPri,marginBottom:4 }}>Registre des patients</p>
                <p style={{ fontSize:14,color:C.textSec }}>{patients.length} patient{patients.length>1?"s":""} enregistrés</p>
              </div>
              <Btn onClick={()=>setShowNouveau(true)} small>Nouveau patient</Btn>
            </div>

            {/* Barre de recherche */}
            <div style={{ position:"relative",marginBottom:16 }}>
              <svg style={{ position:"absolute",left:14,top:"50%",transform:"translateY(-50%)",pointerEvents:"none" }} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={C.textMuted} strokeWidth="2" strokeLinecap="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
              <input
                placeholder="Rechercher par nom, N° dossier, téléphone, quartier..."
                value={recherchePatients}
                onChange={e=>setRecherchePatients(e.target.value)}
                style={{ width:"100%",padding:"12px 14px 12px 42px",fontSize:14,border:"1.5px solid "+C.border,borderRadius:12,background:C.white,color:C.textPri,outline:"none",fontFamily:"inherit" }}
                onFocus={e=>{ e.target.style.borderColor=C.blue; e.target.style.boxShadow="0 0 0 3px "+C.blueSoft }}
                onBlur={e=>{ e.target.style.borderColor=C.border; e.target.style.boxShadow="none" }}
              />
              {recherchePatients&&<button onClick={()=>setRecherchePatients("")} style={{ position:"absolute",right:12,top:"50%",transform:"translateY(-50%)",background:"none",border:"none",cursor:"pointer",color:C.textMuted,fontSize:16 }}>×</button>}
            </div>

            <Card>
              <div style={{ padding:"14px 20px",borderBottom:"1px solid "+C.border }}>
                <p style={{ fontSize:14,fontWeight:700,color:C.textPri }}>
                  {recherchePatients
                    ? patientsFiltres.length+" résultat"+(patientsFiltres.length>1?"s":"")+" pour « "+recherchePatients+" »"
                    : patients.length+" patients enregistrés"
                  }
                </p>
              </div>
              {patientsFiltres.length===0
                ? <p style={{ padding:40,textAlign:"center",color:C.textMuted }}>Aucun patient trouvé pour « {recherchePatients} »</p>
                : (
                <table style={{ width:"100%",borderCollapse:"collapse" }}>
                  <thead>
                    <tr style={{ background:C.slateSoft }}>
                      {["N° Dossier","Nom complet","Âge","Sexe","Téléphone","Quartier / Secteur","Responsable","Action"].map(h=>(
                        <th key={h} style={{ padding:"11px 14px",textAlign:"left",fontSize:11,fontWeight:700,color:C.textSec,letterSpacing:"0.06em",textTransform:"uppercase",whiteSpace:"nowrap" }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {patientsFiltres.map((p,i,arr)=>(
                      <tr key={p.id} style={{ borderBottom:i<arr.length-1?"1px solid "+C.border:"none",transition:"background .15s" }}
                        onMouseEnter={e=>e.currentTarget.style.background=C.slateSoft}
                        onMouseLeave={e=>e.currentTarget.style.background="transparent"}>
                        <td style={{ padding:"12px 14px" }}>
                          <span style={{ fontFamily:"monospace",fontSize:11,fontWeight:700,color:C.textPri,background:C.blueSoft,padding:"3px 9px",borderRadius:8 }}>{p.pid}</span>
                        </td>
                        <td style={{ padding:"12px 14px" }}>
                          <div style={{ display:"flex",alignItems:"center",gap:10 }}>
                            <Avatar name={p.nom} size={32}/>
                            <p style={{ fontSize:13,fontWeight:600,color:C.textPri }}>{p.nom}</p>
                          </div>
                        </td>
                        <td style={{ padding:"12px 14px",fontSize:13,color:C.textSec }}>{p.age||"—"}</td>
                        <td style={{ padding:"12px 14px" }}>
                          <span style={{ fontSize:12,fontWeight:600,background:p.sexe==="F"?C.purpleSoft:C.blueSoft,color:p.sexe==="F"?"#1a4a25":C.blue,padding:"3px 10px",borderRadius:12 }}>
                            {p.sexe==="F"?"Féminin":"Masculin"}
                          </span>
                        </td>
                        <td style={{ padding:"12px 14px",fontSize:13,color:C.textSec }}>{p.telephone||"—"}</td>
                        <td style={{ padding:"12px 14px",fontSize:13,color:C.textSec }}>
                          {p.quartier||"—"}{p.secteur?", "+p.secteur:""}
                        </td>
                        <td style={{ padding:"12px 14px",fontSize:13,color:C.textSec }}>{p.responsable||"—"}</td>
                        <td style={{ padding:"12px 14px" }}>
                          <button onClick={()=>handleSignaler(p)}
                            style={{ display:"flex",alignItems:"center",gap:5,padding:"6px 12px",background:C.greenSoft,border:"1px solid "+C.green+"33",borderRadius:8,color:C.green,fontSize:12,fontWeight:600,cursor:"pointer",fontFamily:"inherit",whiteSpace:"nowrap" }}
                            onMouseEnter={e=>{ e.currentTarget.style.background=C.green; e.currentTarget.style.color="#fff" }}
                            onMouseLeave={e=>{ e.currentTarget.style.background=C.greenSoft; e.currentTarget.style.color=C.green }}>
                            Envoyer au médecin
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                )
              }
              <p style={{ textAlign:"center",fontSize:12,color:C.textMuted,padding:"14px 0",borderTop:"1px solid "+C.border }}>© 2026 Clinique ABC Marouane. Tous droits réservés.</p>
            </Card>
          </div>
        )}

        {/* ══ RENDEZ-VOUS ══ */}
        {onglet==="rdv"&&(
          <div>
            <div style={{ marginBottom:20 }}>
              <p style={{ fontSize:22,fontWeight:800,color:C.textPri,marginBottom:4 }}>Rendez-vous</p>
              <p style={{ fontSize:14,color:C.textSec }}>{rdvs.length} rendez-vous — créés par les médecins · Gérez les rappels ci-dessous</p>
            </div>
            <Card>
              <CardHeader title="Tous les rendez-vous" action={
                <span style={{ fontSize:12,color:C.textMuted,background:C.slateSoft,padding:"4px 12px",borderRadius:20 }}>
                  Lecture seule — les médecins créent leurs RDV
                </span>
              }/>
              <table style={{ width:"100%",borderCollapse:"collapse" }}>
                <thead>
                  <tr style={{ background:C.slateSoft }}>
                    {["Patient","Date","Heure","Médecin / Service","Motif","Action"].map(h=>(
                      <th key={h} style={{ padding:"11px 16px",textAlign:"left",fontSize:11,fontWeight:700,color:C.textSec,letterSpacing:"0.06em",textTransform:"uppercase" }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {rdvs.length===0
                    ? <tr><td colSpan={6} style={{ padding:32,textAlign:"center",color:C.textMuted }}>Aucun rendez-vous — les médecins n'en ont pas encore créé</td></tr>
                    : rdvs.sort((a,b)=>a.date.localeCompare(b.date)).map((r,i,arr)=>(
                    <tr key={r.id} style={{ borderBottom:i<arr.length-1?"1px solid "+C.border:"none",transition:"background .15s" }}
                      onMouseEnter={e=>e.currentTarget.style.background=C.slateSoft}
                      onMouseLeave={e=>e.currentTarget.style.background="transparent"}>
                      <td style={{ padding:"13px 16px" }}>
                        <div style={{ display:"flex",alignItems:"center",gap:8 }}>
                          <Avatar name={r.patient} size={30}/>
                          <p style={{ fontSize:13,fontWeight:600,color:C.textPri }}>{r.patient}</p>
                        </div>
                      </td>
                      <td style={{ padding:"13px 16px",fontSize:13,color:r.date===today()?C.green:C.textSec,fontWeight:r.date===today()?700:400 }}>
                        {fmt(r.date)}
                        {r.date===today()&&<span style={{ marginLeft:5,fontSize:10,fontWeight:700,background:C.greenSoft,color:C.green,padding:"2px 7px",borderRadius:10 }}>Auj.</span>}
                      </td>
                      <td style={{ padding:"13px 16px",fontSize:13,fontWeight:700,color:C.textPri,fontVariantNumeric:"tabular-nums" }}>{r.heure}</td>
                      <td style={{ padding:"13px 16px" }}>
                        <p style={{ fontSize:13,fontWeight:600,color:C.textPri }}>{r.docteur}</p>
                        <p style={{ fontSize:11,color:C.textSec }}>{r.service}</p>
                      </td>
                      <td style={{ padding:"13px 16px",fontSize:12,color:C.textSec }}>{r.motif||"—"}</td>
                      <td style={{ padding:"13px 16px" }}>
                        {r.rappelEnvoye
                          ? <span style={{ display:"inline-flex",alignItems:"center",gap:5,fontSize:12,fontWeight:600,color:C.green }}>
                              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                              Rappel envoyé au médecin
                            </span>
                          : <button onClick={()=>envoyerRappel(r.id)}
                              style={{ display:"inline-flex",alignItems:"center",gap:6,padding:"6px 14px",background:C.amberSoft,color:C.amber,border:"1px solid "+C.amber+"33",borderRadius:8,fontSize:12,fontWeight:600,cursor:"pointer",fontFamily:"inherit" }}>
                              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>
                              Rappeler le médecin
                            </button>
                        }
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </Card>
          </div>
        )}


        {/* ══ PRÉSENCE MÉDECINS ══ */}
        {onglet==="presence"&&(
          <div>
            <div style={{ marginBottom:24 }}>
              <p style={{ fontSize:24, fontWeight:800, color:C.textPri }}>Présence des Médecins</p>
              <p style={{ color:C.textMuted }}>Pointage d'arrivée et de départ en temps réel </p>
            </div>

            {/* Statistiques du jour */}
            <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:16, marginBottom:24 }}>
              <Card style={{ padding:"20px" }}>
                <div style={{ width:42, height:42, borderRadius:10, background:C.blueSoft, display:"flex", alignItems:"center", justifyContent:"center", marginBottom:12, color:C.blue }}><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg></div>
                <p style={{ fontSize:28, fontWeight:800, color:C.blue, lineHeight:1, marginBottom:4 }}>{presenceStats.total}</p>
                <p style={{ fontSize:12, color:C.textMuted }}>Médecins total</p>
              </Card>
              <Card style={{ padding:"20px" }}>
                <div style={{ width:42, height:42, borderRadius:10, background:C.greenSoft, display:"flex", alignItems:"center", justifyContent:"center", marginBottom:12, color:C.green }}><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><polyline points="20 6 9 17 4 12"/></svg></div>
                <p style={{ fontSize:28, fontWeight:800, color:C.green, lineHeight:1, marginBottom:4 }}>{presenceStats.presents}</p>
                <p style={{ fontSize:12, color:C.textMuted }}>Présents</p>
              </Card>
              <Card style={{ padding:"20px" }}>
                <div style={{ width:42, height:42, borderRadius:10, background:C.redSoft, display:"flex", alignItems:"center", justifyContent:"center", marginBottom:12, color:C.red }}><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg></div>
                <p style={{ fontSize:28, fontWeight:800, color:C.red, lineHeight:1, marginBottom:4 }}>{presenceStats.absents}</p>
                <p style={{ fontSize:12, color:C.textMuted }}>Absents</p>
              </Card>
              <Card style={{ padding:"20px" }}>
                <div style={{ width:42, height:42, borderRadius:10, background:C.purpleSoft, display:"flex", alignItems:"center", justifyContent:"center", marginBottom:12, color:C.purple }}><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg></div>
                <p style={{ fontSize:28, fontWeight:800, color:C.purple, lineHeight:1, marginBottom:4 }}>{presenceStats.pourcentage}%</p>
                <p style={{ fontSize:12, color:C.textMuted }}>Taux de présence</p>
              </Card>
            </div>

            {/* Actions globales */}
            <div style={{ marginBottom:16, display:"flex", gap:12 }}>
              <Btn onClick={()=>setOnglet("historique")} variant="secondary">
                Voir l'historique
              </Btn>
            </div>

            {/* Liste des médecins */}
            <Card>
              <CardHeader
                title="Liste des médecins"
                action={
                  <div style={{ display:"flex", gap:8, alignItems:"center" }}>
                    <span style={{ fontSize:12, color:C.textMuted }}>{medecins.filter(m=>m.present).length}/{medecins.length} présents</span>
                    <div style={{ width:8, height:8, borderRadius:"50%", background:presenceStats.pourcentage>=80?C.green:presenceStats.pourcentage>=50?C.slate:C.red }}/>
                  </div>
                }
              />
              <div style={{ padding:"8px" }}>
                {medecins.map((med, i) => (
                  <div key={med.id} style={{
                    display:"flex", alignItems:"center", gap:16, padding:"14px 16px",
                    borderBottom: i < medecins.length-1 ? "1px solid "+C.border : "none",
                    background: med.present ? "transparent" : C.slateSoft+"33",
                    borderRadius: med.present ? 0 : 8,
                    transition:"background .15s"
                  }}>
                    <Avatar name={med.nom} size={44} />

                    <div style={{ flex:1 }}>
                      <p style={{ fontSize:15, fontWeight:700, color:C.textPri }}>{med.nom}</p>
                      <p style={{ fontSize:12, color:C.textSec }}>{med.specialite}</p>
                    </div>

                    {/* Statut */}
                    <div style={{ minWidth:110, textAlign:"center" }}>
                      {med.present ?
                        <span style={{
                          display:"inline-flex", alignItems:"center", gap:6,
                          background:C.greenSoft, color:C.green,
                          padding:"4px 14px", borderRadius:20,
                          fontSize:12, fontWeight:700
                        }}>
                          <span style={{ width:6, height:6, borderRadius:"50%", background:C.green, animation:"blink 2s ease-in-out infinite" }}/>
                          Présent
                        </span>
                      :
                        <span style={{
                          display:"inline-flex", alignItems:"center", gap:6,
                          background:C.redSoft, color:C.red,
                          padding:"4px 14px", borderRadius:20,
                          fontSize:12, fontWeight:700
                        }}>
                          Absent
                        </span>
                      }
                    </div>

                    {/* Horaires */}
                    <div style={{ minWidth:160, fontSize:12 }}>
                      {med.arrivee ? (
                        <div style={{ display:"flex", alignItems:"center", gap:6, color:C.green, fontWeight:600 }}>
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><polyline points="20 6 9 17 4 12"/></svg>
                          Arrivée : {med.arrivee}
                        </div>
                      ) : (
                        <div style={{ color:C.textMuted }}>—</div>
                      )}
                      {med.depart && (
                        <div style={{ display:"flex", alignItems:"center", gap:6, color:C.slate, fontWeight:600, marginTop:2 }}>
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
                          Départ : {med.depart}
                        </div>
                      )}
                    </div>

                    {/* Actions */}
                    <div style={{ minWidth:200, display:"flex", gap:8 }}>
                      {!med.present ? (
                        <>
                          <Btn onClick={() => pointerArrivee(med.id)} variant="success" small>
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><polyline points="20 6 9 17 4 12"/></svg>
                            Pointer arrivée
                          </Btn>
                          <Btn onClick={() => demanderPermission(med)} variant="secondary" small>
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
                            Permission
                          </Btn>
                        </>
                      ) : (
                        <Btn onClick={() => pointerDepart(med.id)} variant="secondary" small>
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
                          Pointer départ
                        </Btn>
                      )}
                    </div>
                  </div>
                ))}
              </div>
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
