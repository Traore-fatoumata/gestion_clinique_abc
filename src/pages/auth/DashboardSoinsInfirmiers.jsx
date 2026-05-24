import { useState, useEffect } from "react"
import logo from "../../assets/images/logo.jpeg"
import { useAuth } from "../../hooks/useAuth.jsx"
import { useNavigate } from "react-router-dom"
import {
  C, Avatar, Badge, Btn,
  today, getNowTime,
  PATIENTS_DB, SOINS_INIT,
} from "./soins/shared.jsx"
import ModalDetailSoin    from "./soins/ModalDetailSoin.jsx"
import ModalNouveauSoin   from "./soins/ModalNouveauSoin.jsx"
import ModalExecutionSoin from "./soins/ModalExecutionSoin.jsx"
import soinsService from "../../services/soinsService"

// ══════════════════════════════════════════════════════
//  COMPOSANT PRINCIPAL
// ══════════════════════════════════════════════════════
export default function DashboardSoinsInfirmiers() {
  const { user, logout } = useAuth()
  const navigate   = useNavigate()
  const handleLogout = () => { logout(); navigate("/login") }

  const [onglet,       setOnglet]       = useState("today")
  const [sidebarOpen,  setSidebarOpen]  = useState(false)
  const [soins,        setSoins]        = useState(SOINS_INIT)
  const [patients]                      = useState(PATIENTS_DB)
  const [showNouveau,  setShowNouveau]  = useState(false)
  const [showExecution,setShowExecution]= useState(null)
  const [showDetail,   setShowDetail]   = useState(null)
  const [recherche,    setRecherche]    = useState("")
  const [heure,        setHeure]        = useState(getNowTime())
  const [dateStr,      setDateStr]      = useState("")
  const [loading,      setLoading]      = useState(false)

  // Charger les soins depuis l'API
  useEffect(() => {
    const chargerSoins = async () => {
      try {
        setLoading(true)
        const response = await soinsService.listerSoins()
        if (response.success && response.soins) {
          const soinsFormattes = response.soins.map(s => ({
            id: s.id,
            patientId: s.patientId,
            patient: s.patient,
            dateProgrammee: s.dateProgrammee,
            heureProgrammee: s.heureProgrammee,
            typeSoin: s.typeSoin,
            zone: s.zone,
            medicament: s.medicament,
            dose: s.dose,
            voie: s.voie,
            infirmier: s.infirmier || "—",
            observations: s.observations || "",
            tolerance: s.tolerance || null,
            statut: s.statut,
            urgent: s.urgent,
            heure: s.heure
          }))
          setSoins(soinsFormattes)
        }
      } catch (err) {
        console.error("Erreur chargement soins:", err)
      } finally {
        setLoading(false)
      }
    }
    chargerSoins()
  }, [])

  useEffect(() => {
    const tick = () => {
      const n = new Date()
      setHeure(n.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit", second: "2-digit" }))
      setDateStr(n.toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long", year: "numeric" }))
    }
    tick()
    const t = setInterval(tick, 1000)
    return () => clearInterval(t)
  }, [])

  // ── Filtrage ──────────────────────────────────────
  const getSoinsFiltres = () => {
    let liste = soins
    if (onglet === "today")      liste = soins.filter(s => s.dateProgrammee === today())
    else if (onglet === "programmes") liste = soins.filter(s => s.statut === "programme")
    else if (onglet === "en_cours")   liste = soins.filter(s => s.statut === "en_cours")
    else if (onglet === "faits")      liste = soins.filter(s => s.statut === "fait")
    else if (onglet === "retardes")   liste = soins.filter(s => s.statut === "retarde")

    if (recherche.trim()) {
      const q = recherche.toLowerCase()
      liste = liste.filter(s =>
        s.patient.nom.toLowerCase().includes(q) ||
        s.patient.pid.toLowerCase().includes(q) ||
        s.typeSoin.toLowerCase().includes(q)
      )
    }
    return [...liste].sort((a, b) => {
      if (a.urgent && !b.urgent) return -1
      if (!a.urgent && b.urgent) return 1
      return (a.heureProgrammee || a.heure).localeCompare(b.heureProgrammee || b.heure)
    })
  }

  const soinsFiltres = getSoinsFiltres()

  const stats = {
    programmes: soins.filter(s => s.statut === "programme").length,
    en_cours:   soins.filter(s => s.statut === "en_cours").length,
    faits:      soins.filter(s => s.statut === "fait").length,
    retardes:   soins.filter(s => s.statut === "retarde").length,
    total:      soins.filter(s => s.dateProgrammee === today()).length,
  }

  // ── Handlers ─────────────────────────────────────
  const handleCreerSoin = (form) => {
    const patient = patients.find(p => p.id === parseInt(form.patientId))
    setSoins(prev => [{
      id: Date.now(), patientId: patient.id, patient,
      date: form.dateProgrammee, heure: form.heureProgrammee,
      typeSoin: form.typeSoin, zone: form.zone,
      medicament: form.medicament, dose: form.dose,
      voie: form.voie, infirmier: "—",
      observations: form.observations, tolerance: null,
      statut: "programme",
      dateProgrammee: form.dateProgrammee,
      heureProgrammee: form.heureProgrammee,
      urgent: form.urgent
    }, ...prev])
  }
  const handleDemarrer = (soinId) => setSoins(prev => prev.map(s => s.id === soinId ? { ...s, statut: "en_cours" } : s))
  const handleRetarder = (soinId) => setSoins(prev => prev.map(s => s.id === soinId ? { ...s, statut: "retarde" } : s))
  const handleAnnuler  = (soinId) => {
    if (window.confirm("Annuler ce soin ?"))
      setSoins(prev => prev.map(s => s.id === soinId ? { ...s, statut: "annule" } : s))
  }
  const handleValiderExecution = (soinId, observations, tolerance, infirmier) => {
    setSoins(prev => prev.map(s => s.id === soinId
      ? { ...s, statut: "fait", observations, tolerance, infirmier, heure: getNowTime() }
      : s
    ))
    setShowExecution(null)
  }

  // ── Navigation ────────────────────────────────────
  const NAV_ICONS = {
    today:   <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/><rect x="9" y="14" width="6" height="4" rx="1" fill="currentColor" stroke="none"/></svg>,
    clock:   <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="9"/><polyline points="12 7 12 12 15.5 14"/></svg>,
    inject:  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><polyline points="2 12 6 12 8 5 11 19 13 9 15 15 18 12 22 12"/></svg>,
    check:   <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="9"/><polyline points="9 12 11 14 15 10"/></svg>,
    warn:    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M10.3 3.3L2 20h20L13.7 3.3a2 2 0 00-3.4 0z"/><line x1="12" y1="10" x2="12" y2="14"/><circle cx="12" cy="17.5" r="0.5" fill="currentColor" stroke="none"/></svg>,
    history: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><polyline points="1 4 1 10 7 10"/><path d="M3.5 15a9 9 0 1 0 .5-5.3L1 10"/></svg>,
  }
  const NAV = [
    { id: "today",      label: "Aujourd'hui", icon: "today",   count: stats.total    },
    { id: "programmes", label: "À faire",     icon: "clock",   count: stats.programmes, color: C.blue  },
    { id: "en_cours",   label: "En cours",    icon: "inject",  count: stats.en_cours,   color: C.slate },
    { id: "faits",      label: "Réalisés",    icon: "check",   count: stats.faits,      color: C.green },
    { id: "retardes",   label: "Retardés",    icon: "warn",    count: stats.retardes,   color: C.red   },
    { id: "historique", label: "Historique",  icon: "history", count: soins.length     },
  ]

  const titres = {
    today: "Soins du jour", programmes: "Soins à faire",
    en_cours: "Soins en cours", faits: "Soins réalisés",
    retardes: "Soins retardés", historique: "Historique complet"
  }

  return (
    <div style={{ minHeight: "100vh", background: "#ffffff", fontFamily: "'Segoe UI', system-ui, sans-serif", color: C.textPri }}>

      {/* MODALS */}
      {showNouveau   && <ModalNouveauSoin patients={patients} onClose={() => setShowNouveau(false)} onCreate={handleCreerSoin} />}
      {showExecution && <ModalExecutionSoin soin={showExecution} onClose={() => setShowExecution(null)} onValider={(obs, tol, inf) => handleValiderExecution(showExecution.id, obs, tol, inf)} />}
      {showDetail    && <ModalDetailSoin soin={showDetail} onClose={() => setShowDetail(null)} />}

      {/* SIDEBAR OVERLAY */}
      {sidebarOpen && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.3)", zIndex: 100 }} onClick={() => setSidebarOpen(false)}>
          <div style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: 265, background: C.white, boxShadow: "4px 0 24px rgba(0,0,0,0.12)", display: "flex", flexDirection: "column", overflow: "auto" }}
            onClick={e => e.stopPropagation()}>

            {/* Logo */}
            <div style={{ padding: "22px 20px 18px", borderBottom: "1px solid " + C.border, display: "flex", alignItems: "center", gap: 12 }}>
              <div style={{ width:44,height:44,borderRadius:10,background:"#fff",border:"1px solid "+C.border,padding:3,flexShrink:0,display:"flex",alignItems:"center",justifyContent:"center" }}>
                <img src={logo} alt="" style={{ width:"100%",height:"100%",borderRadius:7,objectFit:"contain",display:"block" }}/>
              </div>
              <div>
                <p style={{ fontSize: 14, fontWeight: 800, color: C.textPri }}>Clinique ABC Marouane</p>
                <p style={{ fontSize: 12, color: C.textSec }}>Soins infirmiers</p>
              </div>
            </div>

            {/* Nav */}
            <nav style={{ padding: "14px 12px", flex: 1 }}>
              <p style={{ fontSize: 10, color: C.textMuted, letterSpacing: "0.12em", textTransform: "uppercase", padding: "0 8px", marginBottom: 8 }}>Menu</p>
              {NAV.map(n => (
                <button key={n.id} onClick={() => { setOnglet(n.id); setSidebarOpen(false) }}
                  style={{
                    width: "100%", display: "flex", alignItems: "center", gap: 12,
                    padding: "11px 12px", borderRadius: 12, border: "none",
                    background: onglet === n.id ? C.blueSoft : "transparent",
                    color: onglet === n.id ? C.blue : C.textSec,
                    fontSize: 14, fontWeight: onglet === n.id ? 700 : 500,
                    cursor: "pointer", textAlign: "left", marginBottom: 2, fontFamily: "inherit"
                  }}
                  onMouseEnter={e => { if (onglet !== n.id) e.currentTarget.style.background = C.slateSoft }}
                  onMouseLeave={e => { if (onglet !== n.id) e.currentTarget.style.background = "transparent" }}>
                  <span style={{ display:"flex", alignItems:"center" }}>{NAV_ICONS[n.icon]}</span>
                  <span style={{ flex: 1 }}>{n.label}</span>
                  <span style={{
                    background: onglet === n.id ? C.blue : C.slateSoft,
                    color: onglet === n.id ? "#fff" : C.textMuted,
                    fontSize: 11, fontWeight: 700, borderRadius: 10,
                    padding: "2px 7px", minWidth: 22, textAlign: "center"
                  }}>{n.count}</span>
                </button>
              ))}
            </nav>

            {/* Profil */}
            <div style={{ padding: "14px 16px 20px", borderTop: "1px solid " + C.border }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 12px", background: C.greenSoft, borderRadius: 12, border: "1px solid " + C.green + "33" }}>
                <Avatar name={user?.nom||"Infirmière"} size={36} />
                <div>
                  <p style={{ fontSize: 13, fontWeight: 700, color: C.textPri }}>{user?.nom||"Infirmière"}</p>
                  <p style={{ fontSize: 11, color: C.green, fontWeight: 600 }}>{user?.titre||"Infirmière Principale"}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* HEADER */}
      <header style={{
        background: C.white, borderBottom: "1px solid " + C.border,
        padding: "0 24px", height: 64,
        display: "flex", alignItems: "center", justifyContent: "space-between",
        position: "sticky", top: 0, zIndex: 50,
        boxShadow: "0 1px 3px rgba(0,0,0,0.05)"
      }}>
        {/* Hamburger */}
        <button onClick={() => setSidebarOpen(true)}
          style={{ width: 40, height: 40, borderRadius: 8, border: "1px solid " + C.border, background: C.white, cursor: "pointer", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 5 }}>
          <div style={{ width: 20, height: 2, background: C.textPri, borderRadius: 2 }} />
          <div style={{ width: 20, height: 2, background: C.textPri, borderRadius: 2 }} />
          <div style={{ width: 20, height: 2, background: C.textPri, borderRadius: 2 }} />
        </button>

        {/* Logo clinique */}
        <div style={{ display:"flex", alignItems:"center", gap:10, marginLeft:12, paddingRight:20, borderRight:"1px solid "+C.border, flexShrink:0 }}>
          <div style={{ width:38,height:38,borderRadius:9,background:"#fff",border:"1px solid "+C.border,padding:3,display:"flex",alignItems:"center",justifyContent:"center" }}>
            <img src={logo} alt="" style={{ width:"100%",height:"100%",borderRadius:6,objectFit:"contain",display:"block" }}/>
          </div>
          <div>
            <p style={{ fontSize:13,fontWeight:800,color:C.textPri,lineHeight:1.2 }}>Clinique Marouane</p>
            <p style={{ fontSize:11,color:C.textMuted }}>Soins infirmiers</p>
          </div>
        </div>

        {/* Titre */}
        <div style={{ flex: 1, marginLeft: 16 }}>
          <p style={{ fontSize: 15, fontWeight: 700, color: C.textPri, lineHeight: 1.2 }}>
            Module Soins Infirmiers
          </p>
          <p style={{ fontSize: 12, color: C.textMuted, textTransform: "capitalize" }}>{dateStr}</p>
        </div>

        {/* Droite */}
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          {stats.programmes > 0 && (
            <div style={{ display: "flex", alignItems: "center", gap: 6, background: C.slateSoft, border: "1px solid " + C.slate + "40", borderRadius: 10, padding: "6px 12px" }}>
              <span style={{ fontSize: 14 }}>⏰</span>
              <span style={{ fontSize: 12, fontWeight: 700, color: C.slate }}>{stats.programmes} soin{stats.programmes > 1 ? "s" : ""} en attente</span>
            </div>
          )}
          <div style={{ background: C.greenSoft, border: "1px solid " + C.green + "33", borderRadius: 10, padding: "6px 14px", fontSize: 14, fontWeight: 700, color: C.green, fontVariantNumeric: "tabular-nums" }}>
            {heure}
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <div style={{ textAlign: "right" }}>
              <p style={{ fontSize: 13, fontWeight: 700, color: C.textPri }}>{user?.nom||"Infirmière"}</p>
              <p style={{ fontSize: 11, color: C.textSec }}>{user?.titre||"Infirmière Principale"}</p>
            </div>
            <Avatar name="Mme. Diallo" size={36} />
          </div>
          <button onClick={handleLogout} title="Se déconnecter"
            style={{ width:36,height:36,borderRadius:8,border:"1px solid #fca5a5",background:"#fff5f5",cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0 }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#cc2222" strokeWidth="2" strokeLinecap="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
          </button>
        </div>
      </header>

      {/* CONTENU PRINCIPAL */}
      <main style={{ padding: "28px 28px", maxWidth: 1400, margin: "0 auto" }}>

        {/* KPIs */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 14, marginBottom: 24 }}>
          {[
            { label: "Soins à faire",     val: stats.programmes, color: C.blue,   bg: C.blueSoft,   icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="12" y1="18" x2="12" y2="12"/><line x1="9" y1="15" x2="15" y2="15"/></svg> },
            { label: "En cours",          val: stats.en_cours,   color: C.slate,  bg: C.slateSoft,  icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg> },
            { label: "Soins réalisés",    val: stats.faits,      color: C.green,  bg: C.greenSoft,  icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><polyline points="9 11 12 14 22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/></svg> },
            { label: "Total aujourd'hui", val: stats.total,      color: C.purple, bg: C.purpleSoft, icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg> },
          ].map(k => (
            <div key={k.label} style={{ background: C.white, borderRadius: 16, border: "1px solid " + C.border, padding: "18px 20px", boxShadow: "0 1px 3px rgba(0,0,0,0.04)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div>
                <p style={{ fontSize: 28, fontWeight: 900, color: k.color, lineHeight: 1, marginBottom: 6 }}>{k.val}</p>
                <p style={{ fontSize: 12, color: C.textMuted, fontWeight: 500 }}>{k.label}</p>
              </div>
              <div style={{ width: 48, height: 48, borderRadius: 14, background: k.bg, display: "flex", alignItems: "center", justifyContent: "center", color: k.color }}>{k.icon}</div>
            </div>
          ))}
        </div>

        {/* Onglets */}
        <div style={{ display: "flex", gap: 4, marginBottom: 20, background: C.white, padding: 5, borderRadius: 14, border: "1px solid " + C.border, width: "fit-content", flexWrap: "wrap" }}>
          {NAV.map(n => {
            const active = onglet === n.id
            return (
              <button key={n.id} onClick={() => setOnglet(n.id)} style={{
                padding: "8px 14px", borderRadius: 10, border: "none",
                background: active ? (n.color || C.blue) : "transparent",
                color: active ? "#fff" : C.textSec,
                fontSize: 13, fontWeight: active ? 700 : 500,
                cursor: "pointer", display: "flex", alignItems: "center", gap: 6,
                fontFamily: "inherit", transition: "all .15s", whiteSpace: "nowrap"
              }}>
                {NAV_ICONS[n.icon]} {n.label}
                <span style={{
                  background: active ? "rgba(255,255,255,0.25)" : C.slateSoft,
                  color: active ? "#fff" : C.textMuted,
                  fontSize: 11, fontWeight: 700, padding: "1px 7px", borderRadius: 20, minWidth: 22, textAlign: "center"
                }}>{n.count}</span>
              </button>
            )
          })}
        </div>

        {/* Barre actions */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16, flexWrap: "wrap", gap: 10 }}>
          <div>
            <p style={{ fontSize: 20, fontWeight: 800, color: C.textPri, letterSpacing: "-0.02em" }}>{titres[onglet]}</p>
            <p style={{ fontSize: 13, color: C.textMuted, marginTop: 2 }}>
              {soinsFiltres.length} résultat{soinsFiltres.length > 1 ? "s" : ""}{recherche && ` pour "${recherche}"`}
            </p>
          </div>
          <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
            <div style={{ position: "relative" }}>
              <svg style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)", pointerEvents: "none" }}
                width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={C.textMuted} strokeWidth="2" strokeLinecap="round">
                <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
              </svg>
              <input placeholder="Rechercher patient, soin..." value={recherche} onChange={e => setRecherche(e.target.value)}
                style={{ padding: "9px 12px 9px 34px", fontSize: 13, border: "1.5px solid " + C.border, borderRadius: 10, background: C.white, color: C.textPri, outline: "none", fontFamily: "inherit", width: 240 }} />
            </div>
            <Btn onClick={() => setShowNouveau(true)} variant="success">+ Nouveau soin</Btn>
          </div>
        </div>

        {/* TABLEAU */}
        <div style={{ background: C.white, borderRadius: 16, border: "1px solid " + C.border, boxShadow: "0 1px 3px rgba(0,0,0,0.05)", overflow: "hidden" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ background: C.slateSoft }}>
                {["Patient", "Heure", "Type de soin", "Médicament / Dose", "Zone", "Infirmier(ère)", "Statut", "Actions"].map(h => (
                  <th key={h} style={{ padding: "12px 14px", textAlign: "left", fontSize: 11, fontWeight: 700, color: C.textMuted, letterSpacing: "0.07em", textTransform: "uppercase" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {soinsFiltres.length === 0 ? (
                <tr>
                  <td colSpan={8} style={{ padding: "60px 40px", textAlign: "center" }}>
                    <div style={{ fontSize: 40, marginBottom: 12 }}>
                      {"—"}
                    </div>
                    <p style={{ fontSize: 15, fontWeight: 600, color: C.textSec, marginBottom: 4 }}>Aucun soin dans cette catégorie</p>
                    <p style={{ fontSize: 13, color: C.textMuted }}>
                      {recherche ? `Aucun résultat pour "${recherche}"` : "Les soins apparaîtront ici au fur et à mesure"}
                    </p>
                  </td>
                </tr>
              ) : soinsFiltres.map((s, i, arr) => (
                <tr key={s.id}
                  style={{ borderBottom: i < arr.length - 1 ? "1px solid " + C.border : "none", background: s.urgent ? "#fff8f8" : "transparent", transition: "background .1s" }}
                  onMouseEnter={e => e.currentTarget.style.background = s.urgent ? C.redSoft : C.slateSoft}
                  onMouseLeave={e => e.currentTarget.style.background = s.urgent ? "#fff8f8" : "transparent"}>

                  {/* Patient */}
                  <td style={{ padding: "14px 14px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <Avatar name={s.patient.nom} size={36} />
                      <div>
                        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                          <p style={{ fontSize: 13, fontWeight: 700, color: C.textPri }}>{s.patient.nom}</p>
                          {s.urgent && <span style={{ fontSize: 10, fontWeight: 800, color: C.red, background: C.redSoft, padding: "1px 6px", borderRadius: 6 }}>URGENT</span>}
                        </div>
                        <p style={{ fontSize: 11, color: C.textMuted }}>{s.patient.pid}</p>
                      </div>
                    </div>
                  </td>

                  {/* Heure */}
                  <td style={{ padding: "14px 14px" }}>
                    <p style={{ fontSize: 14, fontWeight: 800, color: C.green, fontVariantNumeric: "tabular-nums" }}>{s.heureProgrammee || s.heure}</p>
                    {s.statut === "fait" && s.heure !== s.heureProgrammee && (
                      <p style={{ fontSize: 10, color: C.textMuted }}>Exécuté : {s.heure}</p>
                    )}
                  </td>

                  {/* Type */}
                  <td style={{ padding: "14px 14px" }}>
                    <span style={{ fontSize: 12, fontWeight: 600, background: C.blueSoft, color: C.textPri, padding: "5px 10px", borderRadius: 8, display: "inline-block" }}>{s.typeSoin}</span>
                  </td>

                  {/* Médicament */}
                  <td style={{ padding: "14px 14px" }}>
                    <p style={{ fontSize: 13, color: C.textPri, fontWeight: 500 }}>{s.medicament || "—"}</p>
                    {s.dose && s.dose !== "—" && <p style={{ fontSize: 11, color: C.textMuted }}>{s.dose}</p>}
                  </td>

                  {/* Zone */}
                  <td style={{ padding: "14px 14px", fontSize: 13, color: C.textSec }}>{s.zone || "—"}</td>

                  {/* Infirmier */}
                  <td style={{ padding: "14px 14px", fontSize: 13, color: s.infirmier === "—" ? C.textMuted : C.textSec, fontWeight: s.infirmier !== "—" ? 600 : 400 }}>{s.infirmier}</td>

                  {/* Statut */}
                  <td style={{ padding: "14px 14px" }}>
                    <Badge statut={s.statut} />
                    {s.tolerance && (
                      <p style={{ fontSize: 10, color: C.textMuted, marginTop: 4 }}>
                        {s.tolerance === "bonne" ? "Bon" : s.tolerance === "moyenne" ? "Moyen" : "Douleur"} Tolérance {s.tolerance}
                      </p>
                    )}
                  </td>

                  {/* Actions */}
                  <td style={{ padding: "14px 14px" }}>
                    <div style={{ display: "flex", gap: 5, flexWrap: "wrap" }}>
                      {s.statut === "programme" && (
                        <>
                          <Btn onClick={() => { handleDemarrer(s.id); setShowExecution({ ...s, statut: "en_cours" }) }} small variant="success">Exécuter</Btn>
                          <Btn onClick={() => handleRetarder(s.id)} small variant="warning">⏸ Retarder</Btn>
                        </>
                      )}
                      {s.statut === "en_cours" && (
                        <>
                          <Btn onClick={() => setShowExecution(s)} small variant="success">Terminer</Btn>
                          <Btn onClick={() => handleAnnuler(s.id)} small variant="danger">
                            <span style={{ display:"inline-flex",alignItems:"center",gap:5 }}>
                              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                              Annuler
                            </span>
                          </Btn>
                        </>
                      )}
                      {s.statut === "retarde" && (
                        <>
                          <Btn onClick={() => handleDemarrer(s.id)} small variant="success">
                            <span style={{ display:"inline-flex",alignItems:"center",gap:5 }}>
                              <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><polygon points="5 3 19 12 5 21 5 3"/></svg>
                              Reprendre
                            </span>
                          </Btn>
                          <Btn onClick={() => handleAnnuler(s.id)} small variant="danger">
                            <span style={{ display:"inline-flex",alignItems:"center",gap:5 }}>
                              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                              Annuler
                            </span>
                          </Btn>
                        </>
                      )}
                      {s.statut === "fait" && (
                        <Btn onClick={() => setShowDetail(s)} small variant="secondary">Rapport</Btn>
                      )}
                      {s.statut === "annule" && (
                        <span style={{ fontSize: 12, color: C.textMuted, fontStyle: "italic" }}>Annulé</span>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <p style={{ textAlign: "center", fontSize: 12, color: C.textMuted, padding: "14px 0", borderTop: "1px solid " + C.border }}>
            © 2026 Clinique ABC Marouane. Tous droits réservés.
          </p>
        </div>
      </main>

      <style>{`
        * { box-sizing: border-box; margin: 0; padding: 0 }
        input::placeholder, textarea::placeholder { color: #94a3b8 }
        select option { font-family: 'Segoe UI', system-ui, sans-serif; background: #fff; color: #0f172a }
        ::-webkit-scrollbar { width: 5px; height: 5px }
        ::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 4px }
        ::-webkit-scrollbar-track { background: transparent }
        input:focus, select:focus, textarea:focus {
          border-color: #2563eb !important;
          box-shadow: 0 0 0 3px rgba(37,99,235,0.1) !important;
        }
        button:focus { outline: none }
        @keyframes blink { 0%,100%{opacity:1} 50%{opacity:.35} }
      `}</style>
    </div>
  )
}
