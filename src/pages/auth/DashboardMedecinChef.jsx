import { useState, useEffect } from "react"
import logo from "../../assets/images/logo.jpeg"
import SettingsModal from "../../components/SettingsModal"
import { useClinicSettings } from "../../hooks/useClinicSettings.jsx"
import { useAuth } from "../../hooks/useAuth.jsx"
import { useNavigate } from "react-router-dom"
import { useSharedData } from "../../hooks/useSharedData.jsx"
import { today, C, INIT_PATIENTS, INIT_COMPTES, INIT_MEDECINS, FInput, Inp, Btn, Overlay } from "./medecinChef/shared.jsx"
import PageAccueil       from "./medecinChef/PageAccueil.jsx"
import PageConsultations from "./medecinChef/PageConsultations.jsx"
import PageStats         from "./medecinChef/PageStats.jsx"
import PageComptes       from "./medecinChef/PageComptes.jsx"
import PagePresence      from "./medecinChef/PagePresence.jsx"
import PageHistorique    from "./medecinChef/PageHistorique.jsx"
import ModalConsultation from "./medecinChef/ModalConsultation.jsx"
import { buildDonneesBrouillon, consultationPourMedecin } from "../../utils/clinicFlow.js"

export default function DashboardMedecinChef() {
  const { user, logout } = useAuth()
  const navigate   = useNavigate()
  const handleLogout = () => { logout(); navigate("/login") }

  const {
    patients: sharedPatients, consultations: sharedConsultations,
    addConsultation, updateConsultation, deleteConsultation, signerConsultation, file, updateFileEntry,
    addNotif, resultatsLabo, soins, rdv, rafraichir
  } = useSharedData()

  const [page,         setPage]         = useState("accueil")
  const [sidebarOpen,  setSidebarOpen]  = useState(false)
  const consultations = sharedConsultations
  const patients      = sharedPatients
  const [comptes,      setComptes]      = useState(INIT_COMPTES)
  const [medecins,     setMedecins]     = useState(INIT_MEDECINS)

  const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000"
  useEffect(() => {
    const token = localStorage.getItem("clinique_token")
    if (!token) return
    fetch(`${API_URL}/api/utilisateurs/medecins`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(r => r.json())
      .then(res => { if (res.success && res.medecins?.length) setMedecins(res.medecins) })
      .catch(() => {})
  }, [API_URL])
  const [heure,        setHeure]        = useState("")
  const [showPointer,  setShowPointer]  = useState(false)
  const [pointerHeure, setPointerHeure] = useState(null)
  const [showSettings, setShowSettings] = useState(false)
  const [showMonProfil, setShowMonProfil] = useState(false)

  // ── État pour le modal Mon Profil ──
  const [profilForm, setProfilForm] = useState({
    nom: user?.nom || "",
    email: user?.email || "",
    telephone: user?.telephone || "",
    ancienMotDePasse: "",
    nouveauMotDePasse: "",
    confirmerMotDePasse: "",
  })

  const pf = (k, v) => setProfilForm(p => ({ ...p, [k]: v }))
  const profilOk = profilForm.nom && profilForm.email
  const motDePasseOk = !profilForm.nouveauMotDePasse || (profilForm.ancienMotDePasse && profilForm.nouveauMotDePasse.length >= 6 && profilForm.nouveauMotDePasse === profilForm.confirmerMotDePasse)

  const handleSaveProfil = () => {
    if (!profilOk || !motDePasseOk) return
    alert(profilForm.nouveauMotDePasse ? "Profil et mot de passe mis à jour !" : "Profil mis à jour !")
    setShowMonProfil(false)
  }

  // ── Modal consultation complète (2ème étape quand chef garde le patient) ──
  const [mConsultComplete, setMConsultComplete] = useState(null)
  const [activeConsultation, setActiveConsultation] = useState(null)

  useClinicSettings()

  useEffect(() => {
    const tick = () => setHeure(new Date().toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit", second: "2-digit" }))
    tick(); const t = setInterval(tick, 1000); return () => clearInterval(t)
  }, [])

  const medecinChef = {
    id:         user?.id || 1,
    nom:        user?.nom || "Dr. Doumbouya",
    specialite: user?.specialite || "Médecine générale",
  }

  const handleValider = async (consultId, data) => {
    const assignedDoctorId = data.docteurId ? Number(data.docteurId) : Number(medecinChef.id)
    const isAssignedToOtherDoctor = data.docteurId && Number(data.docteurId) !== Number(medecinChef.id)
    const medecinAssigne = medecins.find(m => Number(m.id) === assignedDoctorId)
    const todayStr = today()
    const motifFile = data.plaintes?.trim() || data.diagnostic?.trim() || "Consultation d'accueil"
    const existing = consultations.find(
      c => c.patientId === data.patientId && c.date?.slice(0, 10) === today() && Number(c.docteurId) === assignedDoctorId
    )

    const consultationPayload = {
      patientId:  data.patientId,
      date:       today(),
      service:    medecinAssigne?.specialite || medecinChef.specialite,
      motif:      data.plaintes,
      plaintes:   data.plaintes,
      symptomes:  data.symptomes,
      observations: data.observations,
      diagnostic: data.diagnostic,
      docteurId:  assignedDoctorId,
      signe:      false,
      etape:      "triage",
    }

    try {
      if (isAssignedToOtherDoctor) {
        const anciennesChef = consultations.filter(c =>
          Number(c.patientId) === Number(data.patientId)
          && (c.date?.slice(0, 10) || c.date) === todayStr
          && Number(c.docteurId) === Number(medecinChef.id)
        )
        for (const ac of anciennesChef) {
          if (ac.id) await deleteConsultation(ac.id)
        }
      }
      if (existing) {
        await updateConsultation(existing.id, consultationPayload)
      } else {
        await addConsultation(consultationPayload)
      }
    } catch (e) {
      alert(e.message || "Erreur lors de l'enregistrement du triage.")
      return
    }

    const entree =
      (data.fileId && file.find(f => f.id === data.fileId))
      || file.find(f =>
        Number(f.patientId) === Number(data.patientId)
        && f.statut !== "termine"
        && (f.dateEntree === today() || f.dateEntree == null)
      )

    if (isAssignedToOtherDoctor && entree) {
      await updateFileEntry(entree.id, {
        statut: "en_cours",
        medecin_id: assignedDoctorId,
        docteurId: assignedDoctorId,
        service: medecinAssigne?.specialite || entree.service,
        motif: motifFile,
      })
      const patient = sharedPatients.find(p => p.id === data.patientId)
      await addNotif({
        docteurId:  assignedDoctorId,
        patientNom: patient?.nom || entree?.nom || "Patient",
        motif:      data.plaintes || entree?.motif || "Consultation",
        service:    medecinAssigne?.specialite || "",
      })
      alert(`Patient orienté vers ${medecinAssigne?.nom || "le médecin"} — visible dans sa file de patients.`)
    } else if (!isAssignedToOtherDoctor) {
      if (entree) {
        await updateFileEntry(entree.id, {
          statut: "en_cours",
          medecin_id: Number(medecinChef.id),
          docteurId: Number(medecinChef.id),
          motif: motifFile,
        })
      }
      alert("Patient ajouté à « Mes consultations ». Ouvrez-le depuis cet onglet pour continuer.")
    } else {
      alert("Erreur : impossible de trouver l'entrée dans la file d'attente.")
    }
    rafraichir?.()
  }

  const handleSauvegarderComplete = async (data) => {
    if (!mConsultComplete) return
    const { patient, fileId } = mConsultComplete
    try {
    await addConsultation({
      patientId:        patient.id,
      docteurId:        medecinChef.id,
      date:             today(),
      service:          medecinChef.specialite,
      motif:            data.motif,
      plaintes:         data.plaintes,
      diagnostics:      data.diagnostics || [],
      traitements:      data.traitements || [],
      fraisExamens:     data.fraisExamens || 0,
      examensCommandes: data.examensCommandes || [],
      typeConsultation: data.typeConsultation || "standard",
      donneesBrouillon: buildDonneesBrouillon(data),
      envoyerLabo:      data.envoyerLabo === true,
    })
    if (fileId && (data.examensCommandes?.length > 0)) {
      updateFileEntry(fileId, {
        fraisExamens:    data.fraisExamens || 0,
        examensCommandes: data.examensCommandes,
        ...(data.montantConsultation !== undefined && { montantConsultation: Number(data.montantConsultation || 0) }),
      })
    }
    await rafraichir?.()
    setMConsultComplete(null)
    alert("Consultation sauvegardée — vos données sont conservées.")
    } catch (e) {
      alert(e.message || "Erreur de sauvegarde.")
    }
  }

  const handleSignerComplete = async (data) => {
    if (!mConsultComplete) return
    const { patient, fileId, consultationExistante } = mConsultComplete
    if ((data.examensCommandes?.length > 0) && !consultationExistante?.laboValide) {
      alert("Signature impossible : résultats du laboratoire non validés.")
      return
    }
    const ts = new Date().toLocaleString("fr-FR")

    try {
      const consultId = await addConsultation({
        patientId:        patient.id,
        docteurId:        medecinChef.id,
        date:             today(),
        service:          medecinChef.specialite,
        motif:            data.motif,
        plaintes:         data.plaintes,
        diagnostics:      data.diagnostics || [],
        traitements:      data.traitements || [],
        fraisExamens:     data.fraisExamens || 0,
        examensCommandes: data.examensCommandes || [],
        typeConsultation: data.typeConsultation || "standard",
        signe:            true,
        signeLe:          ts,
        signePar:         medecinChef.nom,
      })
      if (consultId) await signerConsultation(consultId, medecinChef.nom)
    } catch (e) {
      alert(e.message || "Erreur lors de la signature.")
      return
    }

    if (fileId) {
      await updateFileEntry(fileId, {
        statut: "termine",
        ...(data.examensCommandes?.length > 0 && {
          fraisExamens:    data.fraisExamens || 0,
          examensCommandes: data.examensCommandes,
        }),
        ...(data.montantConsultation !== undefined && { montantConsultation: Number(data.montantConsultation || 0) }),
      })
    }

    setMConsultComplete(null)
    const nbEx = (data.examensCommandes || []).length
    const msg = nbEx > 0
      ? `Consultation signée. ${nbEx} examen(s) prescrit(s) — le laboratoire fixera les tarifs, puis orienter le patient vers la comptabilité.`
      : "Consultation signée et validée."
    alert(msg)
  }

  const handleReprendreConsultation = (consultation) => {
    const patient = sharedPatients.find(p => p.id === consultation.patientId) || patients.find(p => p.id === consultation.patientId)
    if (!patient) return
    setActiveConsultation({ patient, consultation })
  }

  const handleSauvegarderActiveConsultation = (data) => {
    if (!activeConsultation) return
    const { patient, consultation } = activeConsultation
    addConsultation({
      patientId:        patient.id,
      docteurId:        medecinChef.id,
      date:             consultation.date || today(),
      service:          medecinChef.specialite,
      motif:            data.motif,
      plaintes:         data.plaintes,
      diagnostics:      data.diagnostics || [],
      traitements:      data.traitements || [],
      fraisExamens:     data.fraisExamens || 0,
      examensCommandes: data.examensCommandes || [],
      typeConsultation: data.typeConsultation || consultation.typeConsultation || "standard",
    })
    const fileEntry = file.find(f => f.patientId === patient.id && f.statut !== "termine")
    if (fileEntry && (data.fraisExamens || 0) > 0) {
      updateFileEntry(fileEntry.id, {
        fraisExamens:    data.fraisExamens,
        examensCommandes: data.examensCommandes,
        ...(data.montantConsultation !== undefined && { montantConsultation: Number(data.montantConsultation || 0) }),
      })
    }
    setActiveConsultation(null)
    alert("Consultation sauvegardée.")
  }

  const handleSignerActiveConsultation = async (data) => {
    if (!activeConsultation) return
    const { patient, consultation } = activeConsultation
    if ((data.examensCommandes?.length > 0) && !consultation?.laboValide) {
      alert("Signature impossible : résultats du laboratoire non validés.")
      return
    }
    const ts = new Date().toLocaleString("fr-FR")
    try {
      const consultId = await addConsultation({
        patientId:        patient.id,
        docteurId:        medecinChef.id,
        date:             consultation.date || today(),
        service:          medecinChef.specialite,
        motif:            data.motif,
        plaintes:         data.plaintes,
        diagnostics:      data.diagnostics || [],
        traitements:      data.traitements || [],
        fraisExamens:     data.fraisExamens || 0,
        examensCommandes: data.examensCommandes || [],
        typeConsultation: data.typeConsultation || consultation.typeConsultation || "standard",
        signe:            true,
        signeLe:          ts,
        signePar:         medecinChef.nom,
      })
      const idSign = consultId || consultation.id
      if (idSign) await signerConsultation(idSign, medecinChef.nom)
    } catch (e) {
      alert(e.message || "Erreur lors de la signature.")
      return
    }
    const fileEntry = file.find(f => f.patientId === patient.id && f.statut !== "termine")
    if (fileEntry) {
      await updateFileEntry(fileEntry.id, {
        statut: "termine",
        ...(data.examensCommandes?.length > 0 && {
          fraisExamens:    data.fraisExamens || 0,
          examensCommandes: data.examensCommandes,
        }),
        ...(data.montantConsultation !== undefined && { montantConsultation: Number(data.montantConsultation || 0) }),
      })
    }
    setActiveConsultation(null)
    const nbEx = (data.examensCommandes || []).length
    const msg = nbEx > 0
      ? `Consultation signée. ${nbEx} examen(s) prescrit(s) — le laboratoire fixera les tarifs, puis orienter le patient vers la comptabilité.`
      : "Consultation signée et validée."
    alert(msg)
  }

  const handleModifier = (consultId, data) => {
    updateConsultation(consultId, data)
  }

  const imprimerOrdonnance = (consultation) => {
    const patient = patients.find(p => p.id === consultation.patientId)
    if (!patient) return
    const date = new Date(consultation.date).toLocaleDateString("fr-FR")
    const traitement = (consultation.traitements || []).join(", ") || "—"
    const diagnostic = (consultation.diagnostics || []).join(", ") || "—"
    const age = patient.date_naissance ? new Date().getFullYear() - new Date(patient.date_naissance).getFullYear() : "?"

    const w = window.open("", "_blank", "width=700,height=900")
    w.document.write(`<!DOCTYPE html><html><head><meta charset="utf-8"><title>Ordonnance</title><style>
      *{box-sizing:border-box}
      body{font-family:'Segoe UI',sans-serif;margin:0;padding:36px 40px;color:#000;font-size:13px}
      .header{display:flex;justify-content:space-between;align-items:flex-start;border-bottom:3px solid #16a34a;padding-bottom:14px;margin-bottom:20px}
      .hclinic{flex:1}
      .title{font-size:20px;font-weight:800;color:#16a34a;margin:0 0 3px}
      .sub{font-size:11px;color:#555;margin:2px 0}
      .hdate{text-align:right;font-size:12px;color:#333}
      .hdate strong{font-size:14px;display:block;margin-bottom:2px}
      .ord-title{font-size:17px;font-weight:800;text-align:center;letter-spacing:.04em;margin:0 0 18px;text-transform:uppercase;color:#111}
      .patient-box{border:1.5px solid #16a34a33;border-radius:8px;overflow:hidden;margin-bottom:20px}
      .patient-box-header{background:#f0faf4;padding:6px 14px;font-size:10px;font-weight:800;text-transform:uppercase;letter-spacing:.06em;color:#16a34a;border-bottom:1px solid #16a34a22}
      .patient-grid{display:grid;grid-template-columns:1fr 1fr 1fr;gap:0}
      .pi-item{padding:10px 14px;border-right:1px solid #e5e7eb}
      .pi-item:last-child{border-right:none}
      .pi-label{font-size:9px;font-weight:700;text-transform:uppercase;letter-spacing:.06em;color:#888;margin-bottom:3px}
      .pi-value{font-size:14px;font-weight:700;color:#111}
      .section{margin-bottom:16px}
      .sec-label{font-size:10px;font-weight:800;text-transform:uppercase;letter-spacing:.06em;color:#555;margin-bottom:5px;padding-bottom:3px;border-bottom:1px solid #e5e7eb}
      .sec-value{font-size:13px;padding:9px 12px;background:#fafafa;border-radius:6px;border:1px solid #e5e7eb;line-height:1.6}
      .rx{font-size:28px;font-weight:900;color:#16a34a;margin:0 0 6px;line-height:1}
      .footer{margin-top:40px;display:flex;justify-content:space-between;align-items:flex-end;font-size:11px;color:#888;border-top:1px solid #e5e7eb;padding-top:14px}
      .sign-box{text-align:center;border-top:1.5px solid #111;padding-top:6px;width:200px;font-size:11px;color:#333}
      @media print{body{padding:20px 24px}}
    </style></head><body>
    <div class="header">
      <div class="hclinic">
        <div class="title">Clinique Médicale ABC Marouane</div>
        <div class="sub">Tannerie, Kaloum · Conakry, République de Guinée</div>
        <div class="sub">Tél : +224 624 00 00 00</div>
        <div class="sub">Service : ${medecinChef.specialite}</div>
      </div>
      <div class="hdate">
        <strong>Date</strong>
        ${date}
      </div>
    </div>
    <div class="ord-title">Ordonnance Médicale</div>
    <div class="patient-box">
      <div class="patient-box-header">Informations du patient</div>
      <div class="patient-grid">
        <div class="pi-item"><div class="pi-label">Nom & Prénom</div><div class="pi-value">${patient.sexe==="F"?"Mme":"M."} ${patient.nom}</div></div>
        <div class="pi-item"><div class="pi-label">Âge</div><div class="pi-value">${age} ans</div></div>
        <div class="pi-item"><div class="pi-label">ID Patient</div><div class="pi-value">${patient.pid}</div></div>
      </div>
    </div>
    <div class="rx">℞</div>
    <div class="section"><div class="sec-label">Diagnostic</div><div class="sec-value">${diagnostic}</div></div>
    <div class="section"><div class="sec-label">Prescriptions</div><div class="sec-value">${traitement.split(",").map((t,i)=>`<div style="margin-bottom:6px"><strong>${i+1}.</strong> ${t.trim()}</div>`).join("")}</div></div>
    <div class="footer">
      <div>Valable 3 mois à compter du ${date}</div>
      <div class="sign-box">Signature & Cachet du médecin<br/>${medecinChef.nom}</div>
    </div></body></html>`)
    w.document.close()
    setTimeout(() => w.print(), 400)
  }

  const enAttente = consultations.filter(c =>
    consultationPourMedecin(c, file, medecinChef.id, today()) && !c.signe
  ).length

  const NAV_ICONS = {
    accueil: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9.5L12 3l9 6.5V20a1 1 0 01-1 1H4a1 1 0 01-1-1V9.5z"/><path d="M9 21V12h6v9"/></svg>,
    liste:   <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M9 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V4a2 2 0 00-2-2h-3"/><rect x="9" y="1" width="6" height="3" rx="1"/><line x1="12" y1="9" x2="12" y2="15"/><line x1="9" y1="12" x2="15" y2="12"/></svg>,
    patient: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="9" cy="7" r="3.5"/><path d="M2.5 20c0-3.6 2.9-6.5 6.5-6.5s6.5 2.9 6.5 6.5"/><circle cx="17.5" cy="7" r="2.5"/><path d="M21.5 20c0-2.8-2-5-4.5-5.5"/></svg>,
    clock:   <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="9"/><polyline points="12 7 12 12 15.5 14"/><polyline points="10 15 12 17 16 13"/></svg>,
    stats:   <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><line x1="3" y1="20" x2="21" y2="20"/><rect x="4" y="10" width="4" height="10" rx="1"/><rect x="10" y="6" width="4" height="14" rx="1"/><rect x="16" y="3" width="4" height="17" rx="1"/></svg>,
    history: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><polyline points="1 4 1 10 7 10"/><path d="M3.51 15a9 9 0 1 0 .49-4.51"/><line x1="12" y1="7" x2="12" y2="12"/><polyline points="10 14 12 12 14 14"/></svg>,
  }

  const NAV = [
    { id: "accueil",       label: "Tableau de bord",   icon: "accueil" },
    { id: "consultations", label: "Consultations",      icon: "liste",   badge: enAttente },
    { id: "comptes",       label: "Gestion Personnel",  icon: "patient" },
    { id: "presence",      label: "Suivi Présence",     icon: "clock" },
    { id: "stats",         label: "Statistiques",       icon: "stats" },
    { id: "historique",    label: "Historique Patients", icon: "history" },
  ]

  return (
    <div style={{ minHeight: "100vh", background: "#ffffff", fontFamily: "'Segoe UI',system-ui,sans-serif", color: C.textPri }}>

      {mConsultComplete && (
        <ModalConsultation
          key={mConsultComplete.patient?.id + "-chef-complet"}
          patient={mConsultComplete.patient}
          medecin={medecinChef}
          consultation={mConsultComplete.consultationExistante || null}
          onClose={() => setMConsultComplete(null)}
          onSauvegarder={handleSauvegarderComplete}
          onSigner={handleSignerComplete}
          prixExamensParLabo
          attenteResultatsLabo={mConsultComplete.consultationExistante?.attenteResultatsLabo}
          laboValide={mConsultComplete.consultationExistante?.laboValide}
        />
      )}
      {activeConsultation && (
        <ModalConsultation
          key={`chef-direct-${activeConsultation.consultation.id}-${activeConsultation.patient.id}`}
          patient={activeConsultation.patient}
          medecin={medecinChef}
          consultation={activeConsultation.consultation}
          onClose={() => setActiveConsultation(null)}
          onSauvegarder={handleSauvegarderActiveConsultation}
          onSigner={handleSignerActiveConsultation}
          prixExamensParLabo
          attenteResultatsLabo={activeConsultation.consultation?.attenteResultatsLabo}
          laboValide={activeConsultation.consultation?.laboValide}
        />
      )}

      {/* Modal Mon Profil */}
      {showMonProfil && (
        <Overlay onClose={() => setShowMonProfil(false)}>
          <div style={{ background: C.white, borderRadius: 20, width: "100%", maxWidth: 560, maxHeight: "90vh", overflow: "auto", boxShadow: "0 25px 60px rgba(0,0,0,0.2)" }}>
            <div style={{ padding: "22px 28px 18px", borderBottom: "1px solid " + C.border, display: "flex", justifyContent: "space-between" }}>
              <div><p style={{ fontSize: 18, fontWeight: 800, color: C.textPri }}>Mon Profil</p><p style={{ fontSize: 13, color: C.textSec, marginTop: 3 }}>Médecin chef — Modifier vos informations</p></div>
              <button onClick={() => setShowMonProfil(false)} style={{ background: C.slateSoft, border: "none", borderRadius: 8, color: C.textSec, cursor: "pointer", width: 32, height: 32, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18 }}>×</button>
            </div>
            <div style={{ padding: "24px 28px", display: "flex", flexDirection: "column", gap: 14 }}>
              <FInput label="Nom complet" req><Inp value={profilForm.nom} onChange={e => pf("nom", e.target.value)} placeholder="Ex : Dr. Doumbouya" /></FInput>
              <FInput label="Email" req><Inp type="email" value={profilForm.email} onChange={e => pf("email", e.target.value)} placeholder="email@cab.gn" /></FInput>
              <FInput label="Téléphone"><Inp value={profilForm.telephone} onChange={e => pf("telephone", e.target.value)} placeholder="+224 6XX XX XX XX" /></FInput>
              
              <div style={{ marginTop: 8 }}>
                <p style={{ fontSize: 14, fontWeight: 700, color: C.textPri, marginBottom: 12 }}>Changer le mot de passe</p>
                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  <FInput label="Ancien mot de passe"><Inp type="password" value={profilForm.ancienMotDePasse} onChange={e => pf("ancienMotDePasse", e.target.value)} placeholder="••••••••" /></FInput>
                  <FInput label="Nouveau mot de passe"><Inp type="password" value={profilForm.nouveauMotDePasse} onChange={e => pf("nouveauMotDePasse", e.target.value)} placeholder="Min. 6 caractères" /></FInput>
                  <FInput label="Confirmer le mot de passe"><Inp type="password" value={profilForm.confirmerMotDePasse} onChange={e => pf("confirmerMotDePasse", e.target.value)} placeholder="••••••••" /></FInput>
                  {profilForm.nouveauMotDePasse && profilForm.nouveauMotDePasse !== profilForm.confirmerMotDePasse && (
                    <p style={{ fontSize: 11, color: C.red }}>Les mots de passe ne correspondent pas</p>
                  )}
                </div>
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, paddingTop: 8, borderTop: "1px solid " + C.border }}>
                <Btn onClick={() => setShowMonProfil(false)} variant="secondary">Annuler</Btn>
                <Btn onClick={handleSaveProfil} disabled={!profilOk || !motDePasseOk}>Enregistrer</Btn>
              </div>
            </div>
          </div>
        </Overlay>
      )}

      {sidebarOpen && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.3)", zIndex: 100 }} onClick={() => setSidebarOpen(false)}>
          <div style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: 260, background: C.white, boxShadow: "4px 0 20px rgba(0,0,0,0.1)", display: "flex", flexDirection: "column", overflow: "auto" }} onClick={e => e.stopPropagation()}>
            <div style={{ padding: "22px 20px 18px", borderBottom: "1px solid " + C.border, display: "flex", alignItems: "center", gap: 12, flexShrink: 0 }}>
              <div style={{ width: 44, height: 44, borderRadius: 10, background: "#fff", border: "1px solid " + C.border, padding: 3, flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
                <img src={logo} alt="" style={{ width: "100%", height: "100%", borderRadius: 7, objectFit: "contain", display: "block" }} />
              </div>
              <div>
                <p style={{ fontSize: 14, fontWeight: 800, color: C.textPri }}>Clinique ABC Marouane</p>
                <p style={{ fontSize: 12, color: C.textSec }}>Espace médecin chef</p>
              </div>
            </div>
            <nav style={{ padding: "14px 12px", flex: 1 }}>
              {NAV.map(n => (
                <button key={n.id} onClick={() => { setPage(n.id); setSidebarOpen(false) }}
                  style={{ width: "100%", display: "flex", alignItems: "center", gap: 12, padding: "11px 12px", borderRadius: 12, border: "none", background: page === n.id ? C.blueSoft : "transparent", color: page === n.id ? C.blue : C.textSec, fontSize: 14, fontWeight: page === n.id ? 700 : 500, cursor: "pointer", marginBottom: 2, fontFamily: "inherit", textAlign: "left" }}
                  onMouseEnter={e => { if (page !== n.id) e.currentTarget.style.background = C.slateSoft }}
                  onMouseLeave={e => { if (page !== n.id) e.currentTarget.style.background = "transparent" }}>
                  <span style={{ display: "flex", alignItems: "center", justifyContent: "center", width: 26, height: 26, borderRadius: 6, background: page === n.id ? "rgba(37,99,235,0.12)" : "transparent", flexShrink: 0 }}>{NAV_ICONS[n.icon]}</span>
                  <span style={{ flex: 1 }}>{n.label}</span>
                  {n.badge > 0 && <span style={{ background: C.red, color: "#fff", fontSize: 11, fontWeight: 700, borderRadius: 10, padding: "2px 7px" }}>{n.badge}</span>}
                </button>
              ))}
            </nav>
            <div style={{ padding: "12px 16px 18px", borderTop: "1px solid " + C.border, flexShrink: 0 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 12px", background: C.slateSoft, borderRadius: 12, border: "1px solid " + C.slate + "33" }}>
                <div style={{ width: 36, height: 36, borderRadius: "50%", background: C.slate, display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                </div>
                <div>
                  <p style={{ fontSize: 13, fontWeight: 700, color: C.textPri }}>{user?.nom || "Dr. Doumbouya"}</p>
                  <p style={{ fontSize: 11, color: C.slate, fontWeight: 600 }}>Médecin chef · Médecine générale</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      <header style={{ background: C.white, borderBottom: "1px solid " + C.border, padding: "0 24px", height: 64, display: "flex", alignItems: "center", justifyContent: "space-between", position: "sticky", top: 0, zIndex: 50, boxShadow: "0 1px 3px rgba(0,0,0,0.05)" }}>
        <button onClick={() => setSidebarOpen(true)} style={{ width: 40, height: 40, borderRadius: 8, border: "1px solid " + C.border, background: C.white, cursor: "pointer", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 5 }}>
          <div style={{ width: 20, height: 2, background: C.textPri, borderRadius: 2 }} />
          <div style={{ width: 20, height: 2, background: C.textPri, borderRadius: 2 }} />
          <div style={{ width: 20, height: 2, background: C.textPri, borderRadius: 2 }} />
        </button>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginLeft: 12, paddingRight: 20, borderRight: "1px solid " + C.border, flexShrink: 0 }}>
          <div style={{ width: 38, height: 38, borderRadius: 9, background: "#fff", border: "1px solid " + C.border, padding: 3, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <img src={logo} alt="" style={{ width: "100%", height: "100%", borderRadius: 6, objectFit: "contain", display: "block" }} />
          </div>
          <div>
            <p style={{ fontSize: 13, fontWeight: 800, color: C.textPri, lineHeight: 1.2 }}>Clinique Marouane</p>
            <p style={{ fontSize: 11, color: C.textMuted }}>Médecin chef</p>
          </div>
        </div>
        <div style={{ flex: 1 }} />
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          {enAttente > 0 && (
            <button onClick={() => setPage("consultations")}
              style={{ background: C.slateSoft, border: "1px solid " + C.slate + "44", borderRadius: 10, padding: "7px 14px", fontSize: 12, fontWeight: 700, color: C.slate, cursor: "pointer", fontFamily: "inherit" }}>
              {enAttente} patient{enAttente > 1 ? "s" : ""} en attente
            </button>
          )}
          <span style={{ fontSize: 13, color: C.textSec, fontVariantNumeric: "tabular-nums" }}>{heure}</span>
          <button onClick={() => setShowSettings(true)}
            style={{ width: 40, height: 40, borderRadius: 10, border: "1px solid " + C.border, background: C.white, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke={C.green} strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>
          </button>
          <button onClick={() => { setPointerHeure(new Date().toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })); setShowPointer(true) }}
            style={{ display: "flex", alignItems: "center", gap: 8, padding: "9px 16px", borderRadius: 10, border: "1.5px solid " + C.green, background: C.white, color: C.green, fontSize: 13, fontWeight: 600, cursor: "pointer", fontFamily: "inherit" }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={C.green} strokeWidth="2.2" strokeLinecap="round"><path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"/><polyline points="10 17 15 12 10 7"/><line x1="15" y1="12" x2="3" y2="12"/></svg>
            Pointer Arrivée
          </button>
          <div onClick={() => setShowMonProfil(true)} style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer", padding: "4px 8px", borderRadius: 8 }}
            onMouseEnter={e => e.currentTarget.style.background = C.slateSoft}
            onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
            <div style={{ textAlign: "right" }}>
              <p style={{ fontSize: 14, fontWeight: 700, color: C.textPri }}>{user?.nom || "Dr. Doumbouya"}</p>
              <p style={{ fontSize: 12, color: C.textSec }}>Médecin chef</p>
            </div>
            <div style={{ width: 38, height: 38, borderRadius: "50%", background: C.slateSoft, border: "2px solid " + C.slate + "33", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={C.slate} strokeWidth="2" strokeLinecap="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
            </div>
          </div>
          <button onClick={handleLogout}
            style={{ width: 36, height: 36, borderRadius: 8, border: "1px solid #fca5a5", background: "#fff5f5", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#cc2222" strokeWidth="2" strokeLinecap="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
          </button>
        </div>
      </header>

      {showSettings && <SettingsModal onClose={() => setShowSettings(false)} />}

      {showPointer && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.4)", zIndex: 200, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <div style={{ background: C.white, borderRadius: 16, padding: 32, maxWidth: 380, width: "100%", textAlign: "center", boxShadow: "0 20px 60px rgba(0,0,0,0.2)" }}>
            <div style={{ width: 60, height: 60, borderRadius: "50%", background: C.greenSoft, margin: "0 auto 16px", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke={C.green} strokeWidth="2" strokeLinecap="round"><polyline points="20 6 9 17 4 12"/></svg>
            </div>
            <p style={{ fontSize: 18, fontWeight: 800, color: C.textPri, marginBottom: 8 }}>Arrivée enregistrée</p>
            <p style={{ fontSize: 14, color: C.textSec, marginBottom: 8 }}>{user?.nom || "Dr. Doumbouya"} · Médecin chef</p>
            <p style={{ fontSize: 28, fontWeight: 800, color: C.textPri, marginBottom: 20 }}>{pointerHeure}</p>
            <p style={{ fontSize: 13, color: C.textMuted, marginBottom: 24 }}>Votre heure d'arrivée est enregistrée et ne peut pas être modifiée.</p>
            <button onClick={() => setShowPointer(false)} style={{ width: "100%", padding: "12px", background: C.blue, color: "#fff", border: "none", borderRadius: 10, fontSize: 14, fontWeight: 600, cursor: "pointer", fontFamily: "inherit" }}>Fermer</button>
          </div>
        </div>
      )}

      <main style={{ padding: "32px 24px" }}>
        {page === "accueil"       && <PageAccueil       consultations={consultations} patients={patients} file={file} setPage={setPage} />}
        {page === "consultations" && <PageConsultations consultations={consultations} patients={patients} file={file} medecins={medecins} onValider={handleValider} onModifier={handleModifier} onContinuerConsultation={imprimerOrdonnance} onReprendreConsultation={handleReprendreConsultation} />}
        {page === "comptes"       && <PageComptes       comptes={comptes} setComptes={setComptes} medecins={medecins} setMedecins={setMedecins} user={user} />}
        {page === "presence"      && <PagePresence      medecins={medecins} />}
        {page === "stats"         && <PageStats         consultations={consultations} patients={patients} file={file} />}
        {page === "historique"    && <PageHistorique    consultations={consultations} patients={patients} resultatsLabo={resultatsLabo} soins={soins} rdv={rdv} />}
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