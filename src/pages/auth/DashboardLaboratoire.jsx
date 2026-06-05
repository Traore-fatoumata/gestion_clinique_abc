import { useState, useEffect } from "react"
import logo from "../../assets/images/logo.jpeg"
import { useAuth } from "../../hooks/useAuth.jsx"
import { useSharedData } from "../../hooks/useSharedData.jsx"
import { useNavigate } from "react-router-dom"
import { C, Avatar, Badge, Btn, today, getNowTime } from "./laboratoire/shared.jsx"
import { mapDemandeApi } from "./laboratoire/mapDemande.js"
import ModalSaisieResultats  from "./laboratoire/ModalSaisieResultats.jsx"
import ModalFicheLaboratoire from "./laboratoire/ModalFicheLaboratoire.jsx"
import ModalTarifsLabo from "./laboratoire/ModalTarifsLabo.jsx"
import laboService from "../../services/laboService"

export default function DashboardLaboratoire() {
  const { user, logout } = useAuth()
  const navigate   = useNavigate()
  const handleLogout = () => { logout(); navigate("/login") }

  const { notifs, rafraichir } = useSharedData()

  const [sidebarOpen,         setSidebarOpen]         = useState(false)
  const [demandes,            setDemandes]            = useState([])
  const [chargement,          setChargement]          = useState(true)
  const [showSaisie,          setShowSaisie]          = useState(null)
  const [showFiche,           setShowFiche]           = useState(null)
  const [showTarifs,          setShowTarifs]          = useState(null)
  const mesNotifs = (notifs || []).filter(n => !n.lu).slice(0, 5)
  const [recherche,           setRecherche]           = useState("")
  const [heure,               setHeure]               = useState(getNowTime())
  const [dateStr,             setDateStr]             = useState("")

  const chargerDemandes = async () => {
    try {
      const response = await laboService.listerDemandes()
      if (response.success && response.demandes) {
        setDemandes(response.demandes.map(mapDemandeApi))
      }
    } catch (err) {
      console.error("Erreur chargement demandes labo:", err)
    } finally {
      setChargement(false)
    }
  }

  useEffect(() => {
    chargerDemandes()
    const t = setInterval(chargerDemandes, 30_000)
    return () => clearInterval(t)
  }, [])

  useEffect(() => {
    const tick = () => {
      const n = new Date()
      setHeure(n.toLocaleTimeString("fr-FR", { hour:"2-digit", minute:"2-digit", second:"2-digit" }))
      setDateStr(n.toLocaleDateString("fr-FR", { weekday:"long", day:"numeric", month:"long", year:"numeric" }))
    }
    tick()
    const t = setInterval(tick, 1000)
    return () => clearInterval(t)
  }, [])

  const [onglet, setOnglet] = useState("toutes")

  const NAV_ICONS = {
    doc:   <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M9 2v8l-3.5 6A2 2 0 007.2 19h9.6a2 2 0 001.7-3L15 10V2"/><line x1="9" y1="2" x2="15" y2="2"/><line x1="9.5" y1="7" x2="14.5" y2="7"/></svg>,
    wait:  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M5 3h14M5 21h14"/><path d="M7 3l5 9 5-9"/><path d="M7 21l5-9 5 9"/></svg>,
    micro: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="8" r="4"/><path d="M4 8h2M18 8h2"/><path d="M12 12v4M8 20h8"/><line x1="12" y1="16" x2="12" y2="20"/></svg>,
    check: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="9"/><polyline points="9 12 11 14 15 10"/></svg>,
  }

  const getDemandesFiltrees = () => {
    let liste = demandes
    if (onglet==="en_attente") liste = demandes.filter(d=>d.statut==="en_attente")
    else if (onglet==="en_cours") liste = demandes.filter(d=>d.statut==="en_cours")
    else if (onglet==="termines") liste = demandes.filter(d=>d.statut==="termine")
    if (recherche.trim()) {
      const q = recherche.toLowerCase()
      liste = liste.filter(d => {
        const nom = (d.patient?.nom || "").toLowerCase()
        const pid = (d.patient?.pid || "").toLowerCase()
        const med = String(d.medecinPrescripteur || "").toLowerCase()
        return nom.includes(q) || pid.includes(q) || med.includes(q)
          || d.examens.some(e => e.nom.toLowerCase().includes(q))
      })
    }
    return [...liste].sort((a,b) => {
      if (a.urgent&&!b.urgent) return -1
      if (!a.urgent&&b.urgent) return 1
      return b.id - a.id
    })
  }

  const demandesFiltrees = getDemandesFiltrees()

  const stats = {
    en_attente: demandes.filter(d=>d.statut==="en_attente").length,
    en_cours:   demandes.filter(d=>d.statut==="en_cours").length,
    termine:    demandes.filter(d=>d.statut==="termine").length,
    total:      demandes.length,
  }

  const NAV = [
    { id:"toutes",     label:"Toutes",     icon:"doc",   count:stats.total,      color:C.blue  },
    { id:"en_attente", label:"En attente", icon:"wait",  count:stats.en_attente, color:C.slate },
    { id:"en_cours",   label:"En cours",   icon:"micro", count:stats.en_cours,   color:C.blue  },
    { id:"termines",   label:"Terminés",   icon:"check", count:stats.termine,    color:C.green },
  ]

  const titres = {
    toutes:"Toutes les demandes", en_attente:"En attente de prélèvement",
    en_cours:"Analyses en cours", termines:"Résultats validés",
  }

  const handleDemarrerPrelevement = async (id) => {
    try {
      await laboService.demarrerPrelevement(id)
      await chargerDemandes()
    } catch (e) {
      alert(e.message || "Erreur lors du prélèvement.")
    }
  }

  const handleSauvegarder = async (id, resultats, commentaireGlobal) => {
    try {
      await laboService.sauvegarderResultats(id, resultats, commentaireGlobal)
      await chargerDemandes()
      setShowSaisie(null)
    } catch (e) {
      alert(e.message || "Erreur de sauvegarde.")
    }
  }

  const handleFixerTarifs = async (id, examens) => {
    try {
      await laboService.fixerTarifs(id, examens)
      await chargerDemandes()
      setShowTarifs(null)
      rafraichir?.()
      alert("Tarifs enregistrés. Le patient peut payer à la comptabilité.")
    } catch (e) {
      alert(e.message || "Erreur lors de l'enregistrement des tarifs.")
    }
  }

  const handleValider = async (id, resultats, commentaireGlobal) => {
    try {
      await laboService.validerDemande(id, user?.nom || "Biologiste", resultats, commentaireGlobal)
      await chargerDemandes()
      rafraichir?.()
      setShowSaisie(null)
      alert("Résultats validés — le médecin peut signer la consultation.")
    } catch (e) {
      alert(e.message || "Erreur de validation.")
    }
  }


  return (
    <div style={{ minHeight:"100vh", background:C.bg, fontFamily:"'Segoe UI', system-ui, sans-serif", color:C.textPri }}>

      {/* MODALS */}
      {showSaisie && <ModalSaisieResultats demande={showSaisie} onClose={()=>setShowSaisie(null)} onSave={(r,c)=>handleSauvegarder(showSaisie.id,r,c)} onValider={(r,c)=>handleValider(showSaisie.id,r,c)}/>}
      {showFiche  && <ModalFicheLaboratoire demande={showFiche} onClose={()=>setShowFiche(null)}/>}
      {showTarifs && (
        <ModalTarifsLabo
          demande={showTarifs}
          onClose={() => setShowTarifs(null)}
          onSave={examens => handleFixerTarifs(showTarifs.id, examens)}
        />
      )}

      {/* SIDEBAR OVERLAY */}
      {sidebarOpen && (
        <div style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.3)", zIndex:100 }} onClick={()=>setSidebarOpen(false)}>
          <div style={{ position:"absolute", left:0, top:0, bottom:0, width:265, background:C.white, boxShadow:"4px 0 24px rgba(0,0,0,0.12)", display:"flex", flexDirection:"column", overflow:"auto" }}
            onClick={e=>e.stopPropagation()}>
            <div style={{ padding:"22px 20px 18px", borderBottom:"1px solid "+C.border, display:"flex", alignItems:"center", gap:12 }}>
              <div style={{ width:44,height:44,borderRadius:10,background:"#fff",border:"1px solid "+C.border,padding:3,flexShrink:0,display:"flex",alignItems:"center",justifyContent:"center" }}>
                <img src={logo} alt="" style={{ width:"100%",height:"100%",borderRadius:7,objectFit:"contain",display:"block" }}/>
              </div>
              <div>
                <p style={{ fontSize:14, fontWeight:800, color:C.textPri }}>Clinique ABC Marouane</p>
                <p style={{ fontSize:12, color:C.textSec }}>Laboratoire d'Analyses</p>
              </div>
            </div>
            <nav style={{ padding:"14px 12px", flex:1 }}>
              <p style={{ fontSize:10, color:C.textMuted, letterSpacing:"0.12em", textTransform:"uppercase", padding:"0 8px", marginBottom:8 }}>Menu</p>
              {NAV.map(n=>(
                <button key={n.id} onClick={()=>{ setOnglet(n.id); setSidebarOpen(false) }}
                  style={{ width:"100%", display:"flex", alignItems:"center", gap:12, padding:"11px 12px", borderRadius:12, border:"none", background:onglet===n.id?C.blueSoft:"transparent", color:onglet===n.id?C.blue:C.textSec, fontSize:14, fontWeight:onglet===n.id?700:500, cursor:"pointer", textAlign:"left", marginBottom:2, fontFamily:"inherit" }}
                  onMouseEnter={e=>{ if(onglet!==n.id) e.currentTarget.style.background=C.slateSoft }}
                  onMouseLeave={e=>{ if(onglet!==n.id) e.currentTarget.style.background="transparent" }}>
                  <span style={{ display:"flex", alignItems:"center" }}>{NAV_ICONS[n.icon]}</span>
                  <span style={{ flex:1 }}>{n.label}</span>
                  <span style={{ background:onglet===n.id?C.blue:C.slateSoft, color:onglet===n.id?"#fff":C.textMuted, fontSize:11, fontWeight:700, borderRadius:10, padding:"2px 7px" }}>{n.count}</span>
                </button>
              ))}
            </nav>
            <div style={{ padding:"14px 16px 20px", borderTop:"1px solid "+C.border }}>
              <div style={{ display:"flex", alignItems:"center", gap:10, padding:"10px 12px", background:C.purpleSoft, borderRadius:12, border:"1px solid "+C.purple+"33" }}>
                <Avatar name={user?.nom || "Labo"} size={36}/>
                <div>
                  <p style={{ fontSize:13, fontWeight:700, color:C.textPri }}>{user?.nom || "Laboratoire"}</p>
                  <p style={{ fontSize:11, color:C.purple, fontWeight:600 }}>{user?.titre || "Technicien labo"}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* HEADER */}
      <header style={{ background:C.white, borderBottom:"1px solid "+C.border, padding:"0 24px", height:64, display:"flex", alignItems:"center", justifyContent:"space-between", position:"sticky", top:0, zIndex:50, boxShadow:"0 1px 3px rgba(0,0,0,0.05)" }}>
        <button onClick={()=>setSidebarOpen(true)} style={{ width:40, height:40, borderRadius:8, border:"1px solid "+C.border, background:C.white, cursor:"pointer", display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", gap:5 }}>
          <div style={{ width:20, height:2, background:C.textPri, borderRadius:2 }}/>
          <div style={{ width:20, height:2, background:C.textPri, borderRadius:2 }}/>
          <div style={{ width:20, height:2, background:C.textPri, borderRadius:2 }}/>
        </button>

        {/* Logo clinique */}
        <div style={{ display:"flex", alignItems:"center", gap:10, marginLeft:12, paddingRight:20, borderRight:"1px solid "+C.border, flexShrink:0 }}>
          <div style={{ width:38,height:38,borderRadius:9,background:"#fff",border:"1px solid "+C.border,padding:3,display:"flex",alignItems:"center",justifyContent:"center" }}>
            <img src={logo} alt="" style={{ width:"100%",height:"100%",borderRadius:6,objectFit:"contain",display:"block" }}/>
          </div>
          <div>
            <p style={{ fontSize:13,fontWeight:800,color:C.textPri,lineHeight:1.2 }}>Clinique Marouane</p>
            <p style={{ fontSize:11,color:C.textMuted }}>Laboratoire</p>
          </div>
        </div>

        <div style={{ flex:1, marginLeft:16 }}>
          <p style={{ fontSize:15, fontWeight:700, color:C.textPri, lineHeight:1.2 }}>Laboratoire d'Analyses Médicales</p>
          <p style={{ fontSize:12, color:C.textMuted, textTransform:"capitalize" }}>{dateStr}</p>
        </div>
        <div style={{ display:"flex", alignItems:"center", gap:12 }}>
          {mesNotifs.length > 0 && (
            <div style={{ background: C.purpleSoft, border: "1px solid " + C.purple + "33", borderRadius: 10, padding: "6px 12px", maxWidth: 280 }}>
              <p style={{ fontSize: 11, fontWeight: 700, color: C.purple }}>{mesNotifs.length} nouvelle(s) demande(s)</p>
              <p style={{ fontSize: 10, color: C.textMuted, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                {mesNotifs[0]?.patient_nom || mesNotifs[0]?.patientNom}
              </p>
            </div>
          )}
          {stats.en_attente>0&&(
            <div style={{ display:"flex", alignItems:"center", gap:6, background:C.slateSoft, border:"1px solid "+C.slate+"40", borderRadius:10, padding:"6px 12px" }}>
              <span style={{ fontSize:12, fontWeight:700, color:C.slate }}>{stats.en_attente} en attente</span>
            </div>
          )}
          <div style={{ background:C.purpleSoft, border:"1px solid "+C.purple+"33", borderRadius:10, padding:"6px 14px", fontSize:14, fontWeight:700, color:C.purple, fontVariantNumeric:"tabular-nums" }}>
            {heure}
          </div>
          <div style={{ display:"flex", alignItems:"center", gap:8 }}>
            <div style={{ textAlign:"right" }}>
              <p style={{ fontSize:13, fontWeight:700, color:C.textPri }}>{user?.nom||"Laborantin"}</p>
              <p style={{ fontSize:11, color:C.textSec }}>{user?.titre||"Biologiste · Labo"}</p>
            </div>
            <Avatar name={user?.nom||"L"} size={36}/>
          </div>
          <button onClick={handleLogout} title="Se déconnecter"
            style={{ width:36,height:36,borderRadius:8,border:"1px solid #fca5a5",background:"#fff5f5",cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0 }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#cc2222" strokeWidth="2" strokeLinecap="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
          </button>
        </div>
      </header>

      <main style={{ padding:"28px 28px", maxWidth:1400, margin:"0 auto" }}>
        {/* KPIs */}
        <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:10, marginBottom:18 }}>
          {[
            { label:"En attente",      val:stats.en_attente, color:C.slate,  bg:C.slateSoft,  icon:<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg> },
            { label:"En analyse",      val:stats.en_cours,   color:C.blue,   bg:C.blueSoft,   icon:<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M9 2v8l-3.5 6A2 2 0 007.2 19h9.6a2 2 0 001.7-3L15 10V2"/><line x1="9" y1="2" x2="15" y2="2"/></svg> },
            { label:"Résultats prêts", val:stats.termine,    color:C.green,  bg:C.greenSoft,  icon:<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><polyline points="20 6 9 17 4 12"/></svg> },
            { label:"Total demandes",  val:stats.total,      color:C.purple, bg:C.purpleSoft, icon:<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/></svg> },
          ].map(k=>(
            <div key={k.label} style={{ background:C.white, borderRadius:12, border:"1px solid "+C.border, padding:"13px 16px", display:"flex", justifyContent:"space-between", alignItems:"center" }}>
              <div>
                <p style={{ fontSize:22, fontWeight:900, color:k.color, lineHeight:1, marginBottom:4 }}>{k.val}</p>
                <p style={{ fontSize:11, color:C.textMuted }}>{k.label}</p>
              </div>
              <div style={{ width:38, height:38, borderRadius:10, background:k.bg, display:"flex", alignItems:"center", justifyContent:"center", color:k.color }}>{k.icon}</div>
            </div>
          ))}
        </div>


        {/* Barre actions */}
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:16, flexWrap:"wrap", gap:10 }}>
          <div>
            <p style={{ fontSize:20, fontWeight:800, color:C.textPri, letterSpacing:"-0.02em" }}>{titres[onglet]}</p>
            <p style={{ fontSize:13, color:C.textMuted, marginTop:2 }}>
              Demandes envoyées par les médecins · {demandesFiltrees.length} affichée{demandesFiltrees.length>1?"s":""}
              {recherche && ` pour « ${recherche} »`}
            </p>
          </div>
          <div style={{ display:"flex", gap:10, alignItems:"center" }}>
            <div style={{ position:"relative" }}>
              <svg style={{ position:"absolute", left:10, top:"50%", transform:"translateY(-50%)", pointerEvents:"none" }} width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={C.textMuted} strokeWidth="2" strokeLinecap="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
              <input placeholder="Patient, médecin, examen…" value={recherche} onChange={e=>setRecherche(e.target.value)}
                style={{ padding:"9px 12px 9px 34px", fontSize:13, border:"1.5px solid "+C.border, borderRadius:10, background:C.white, color:C.textPri, outline:"none", fontFamily:"inherit", width:260 }}/>
            </div>
            <Btn onClick={chargerDemandes} variant="secondary">Actualiser</Btn>
          </div>
        </div>

        {/* TABLEAU */}
        <div style={{ background:C.white, borderRadius:16, border:"1px solid "+C.border, boxShadow:"0 1px 3px rgba(0,0,0,0.05)", overflow:"hidden" }}>
          <table style={{ width:"100%", borderCollapse:"collapse" }}>
            <thead>
              <tr style={{ background:C.slateSoft }}>
                {["Patient","Demande","Médecin / Service","Examens","Montant","Statut","Actions"].map(h=>(
                  <th key={h} style={{ padding:"10px 12px", textAlign:"left", fontSize:10, fontWeight:700, color:C.textMuted, letterSpacing:"0.07em", textTransform:"uppercase" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {chargement ? (
                <tr>
                  <td colSpan={7} style={{ padding:"48px", textAlign:"center", color:C.textMuted }}>Chargement…</td>
                </tr>
              ) : demandesFiltrees.length===0 ? (
                <tr>
                  <td colSpan={7} style={{ padding:"60px 40px", textAlign:"center" }}>
                    <p style={{ fontSize:15, fontWeight:600, color:C.textSec, marginBottom:4 }}>Aucune demande dans cette catégorie</p>
                    <p style={{ fontSize:13, color:C.textMuted, maxWidth:420, margin:"0 auto", lineHeight:1.5 }}>
                      {recherche
                        ? `Aucun résultat pour « ${recherche} »`
                        : "Les examens prescrits par un médecin (bouton « Envoyer au laboratoire ») apparaîtront ici avec le nom du patient et la liste des analyses."}
                    </p>
                  </td>
                </tr>
              ) : demandesFiltrees.map((d,i,arr)=>(
                <tr key={d.id} style={{ borderBottom:i<arr.length-1?"1px solid "+C.border:"none", background:d.urgent?"#fff8f8":"transparent", transition:"background .1s" }}
                  onMouseEnter={e=>e.currentTarget.style.background=d.urgent?C.redSoft:C.slateSoft}
                  onMouseLeave={e=>e.currentTarget.style.background=d.urgent?"#fff8f8":"transparent"}>
                  <td style={{ padding:"11px 12px" }}>
                    <div style={{ display:"flex", alignItems:"center", gap:10 }}>
                      <Avatar name={d.patient?.nom || "?"} size={36}/>
                      <div>
                        <div style={{ display:"flex", alignItems:"center", gap:6 }}>
                          <p style={{ fontSize:13, fontWeight:700, color:C.textPri }}>{d.patient?.nom || "—"}</p>
                          {d.urgent&&<span style={{ fontSize:10, fontWeight:800, color:C.red, background:C.redSoft, padding:"1px 6px", borderRadius:6 }}>URGENT</span>}
                        </div>
                        <p style={{ fontSize:11, color:C.textMuted }}>{d.patient?.pid || "—"}</p>
                      </div>
                    </div>
                  </td>
                  <td style={{ padding:"11px 12px" }}>
                    <p style={{ fontSize:14, fontWeight:800, color:C.purple, fontVariantNumeric:"tabular-nums" }}>{d.heureDemande}</p>
                    <p style={{ fontSize:11, color:C.textMuted }}>{d.dateDemande}</p>
                  </td>
                  <td style={{ padding:"11px 12px" }}>
                    <p style={{ fontSize:13, fontWeight:600, color:C.textPri }}>{d.medecinPrescripteur}</p>
                    <p style={{ fontSize:11, color:C.textMuted }}>{d.service||"—"}</p>
                  </td>
                  <td style={{ padding:"14px 14px", maxWidth:220 }}>
                    <div style={{ display:"flex", flexWrap:"wrap", gap:4 }}>
                      {d.examens.map((e,idx)=>(
                        <span key={idx} style={{ fontSize:11, fontWeight:600, background:C.blueSoft, color:C.textPri, padding:"3px 8px", borderRadius:6 }}>{e.nom}</span>
                      ))}
                    </div>
                  </td>
                  <td style={{ padding:"11px 12px" }}>
                    {d.tarifsFixes ? (
                      <p style={{ fontSize:13, fontWeight:700, color:C.green }}>{d.examens.reduce((s,e)=>s+(e.prix||0),0).toLocaleString("fr-FR")} GNF</p>
                    ) : (
                      <p style={{ fontSize:12, fontWeight:600, color:C.amber }}>Tarifs à fixer</p>
                    )}
                  </td>
                  <td style={{ padding:"11px 12px" }}>
                    <Badge statut={d.statut}/>
                    {d.valide&&<p style={{ fontSize:10, color:C.textMuted, marginTop:4 }}>Signé par {d.validePar}</p>}
                  </td>
                  <td style={{ padding:"11px 12px" }}>
                    <div style={{ display:"flex", gap:6, flexWrap:"wrap" }}>
                      {d.statut==="en_attente"&&(
                        <>
                          <Btn onClick={()=>setShowTarifs(d)} small variant="primary">
                            {d.tarifsFixes ? "Modifier tarifs" : "Fixer tarifs"}
                          </Btn>
                          <Btn onClick={()=>handleDemarrerPrelevement(d.id)} small variant="success" disabled={!d.tarifsFixes}>
                            <span style={{ display:"inline-flex",alignItems:"center",gap:5 }}>
                              <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><polygon points="5 3 19 12 5 21 5 3"/></svg>
                              Prélever
                            </span>
                          </Btn>
                          <Btn onClick={()=>setShowSaisie(d)} small variant="primary">Résultats</Btn>
                        </>
                      )}
                      {d.statut==="en_cours"&&(
                        <Btn onClick={()=>{ const updated=demandes.find(x=>x.id===d.id); setShowSaisie(updated) }} small variant="primary">Compléter</Btn>
                      )}
                      {d.statut==="termine"&&(
                        <Btn onClick={()=>setShowFiche(d)} small variant="secondary">Voir fiche</Btn>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <p style={{ textAlign:"center", fontSize:12, color:C.textMuted, padding:"14px 0", borderTop:"1px solid "+C.border }}>
            © 2026 Clinique ABC Marouane. Tous droits réservés.
          </p>
        </div>
      </main>

      <style>{`
        *{box-sizing:border-box;margin:0;padding:0}
        input::placeholder,textarea::placeholder{color:#94a3b8}
        input:focus,select:focus,textarea:focus{border-color:#7c3aed!important;box-shadow:0 0 0 3px rgba(124,58,237,0.1)!important}
        ::-webkit-scrollbar{width:5px;height:5px}
        ::-webkit-scrollbar-thumb{background:#cbd5e1;border-radius:4px}
        button:focus{outline:none}
        @media print{.no-print{display:none!important}body{background:white}}
      `}</style>
    </div>
  )
}
