import { useState, useEffect } from "react"
import logo from "../../assets/images/logo.jpeg"
import { useAuth } from "../../hooks/useAuth.jsx"
import { useNavigate } from "react-router-dom"
import { useSharedData } from "../../hooks/useSharedData.jsx"
import { C, today, fmt, calcAge, Avatar, Badge, Btn, Card, CardHeader, RdvBadge, TypeConsultBadge, TYPE_CONSULT_LABEL, isGynecoObst } from "./medecin/shared.jsx"
import ModalFichePatient from "./medecin/ModalFichePatient.jsx"
import ModalConsultation from "./medecin/ModalConsultation.jsx"
import ModalCreerRdvMedecin from "./medecin/ModalCreerRdvMedecin.jsx"

// ══════════════════════════════════════════════════════
//  MODAL ORDONNANCE
// ══════════════════════════════════════════════════════
function ModalOrdonnance({ patient, consultation, medecin, onClose }) {
  const age          = calcAge(patient?.dateNaissance)
  const dateNaissStr = patient?.dateNaissance
    ? new Date(patient.dateNaissance).toLocaleDateString("fr-FR") : "—"
  const sexeStr      = patient?.sexe === "F" ? "Féminin" : patient?.sexe === "M" ? "Masculin" : "—"
  const poidsStr     = consultation?.poids ? `${consultation.poids} kg` : "—"
  const tailleStr    = consultation?.donneesPrenatal?.tailleCm
    ? `${consultation.donneesPrenatal.tailleCm} cm`
    : consultation?.taille ? `${consultation.taille} cm` : "—"
  const taStr        = consultation?.donneesPrenatal?.ta || consultation?.ta || "—"
  const antecedentsStr = consultation?.antecedents || "—"
  const diagnostic   = (() => {
    const raw = consultation?.diagDefinitif || consultation?.diagnostics
    if (Array.isArray(raw)) return raw.join(", ") || consultation?.diagPresomption || "—"
    if (typeof raw === "string" && raw.trim()) return raw
    return consultation?.diagPresomption || "—"
  })()
  const traitements  = Array.isArray(consultation?.traitements)
    ? consultation.traitements
    : (consultation?.traitements
        ? consultation.traitements.split(",").map(t => t.trim()).filter(Boolean)
        : [])
  const commentaires = consultation?.commentaires || ""
  const date         = new Date().toLocaleDateString("fr-FR")

  const imprimer = () => {
    const w = window.open("", "_blank", "width=720,height=960")
    w.document.write(`<!DOCTYPE html><html><head><meta charset="utf-8">
<title>Ordonnance — ${patient?.nom || ""}</title><style>
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
.patient-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:0}
.patient-grid-2{display:grid;grid-template-columns:repeat(3,1fr);gap:0}
.pi-item{padding:10px 14px;border-right:1px solid #e5e7eb}
.pi-item:last-child{border-right:none}
.pi-label{font-size:9px;font-weight:700;text-transform:uppercase;letter-spacing:.06em;color:#888;margin-bottom:3px}
.pi-value{font-size:13px;font-weight:700;color:#111}
.section{margin-bottom:16px}
.sec-label{font-size:10px;font-weight:800;text-transform:uppercase;letter-spacing:.06em;color:#555;margin-bottom:5px;padding-bottom:3px;border-bottom:1px solid #e5e7eb}
.sec-value{font-size:13px;padding:9px 12px;background:#fafafa;border-radius:6px;border:1px solid #e5e7eb;line-height:1.6}
.rx{font-size:32px;font-weight:900;color:#16a34a;margin:0 0 8px;line-height:1;font-style:italic}
.footer{margin-top:40px;display:flex;justify-content:space-between;align-items:flex-end;font-size:11px;color:#888;border-top:1px solid #e5e7eb;padding-top:14px}
.sign-box{text-align:center;width:220px}
.sign-line{border-top:1.5px solid #111;padding-top:6px;font-size:11px;color:#333;margin-top:36px}
.medecin-info{font-size:12px;color:#333;font-weight:700;margin-bottom:1px}
.medecin-spec{font-size:11px;color:#555;font-weight:400}
@media print{body{padding:20px 24px}}
</style></head><body>
<div class="header">
  <div class="hclinic">
    <div class="title">Clinique Médicale ABC Marouane</div>
    <div class="sub">Tannerie, Kaloum · Conakry, République de Guinée</div>
    <div class="sub">Tél : +224 624 00 00 00</div>
    <div class="sub">Service : ${medecin?.specialite || "—"}</div>
  </div>
  <div class="hdate"><strong>Date</strong>${date}</div>
</div>
<div class="ord-title">Ordonnance Médicale</div>
<div class="patient-box">
  <div class="patient-box-header">Informations du patient</div>
  <div class="patient-grid">
    <div class="pi-item">
      <div class="pi-label">Nom &amp; Prénom</div>
      <div class="pi-value">${patient?.sexe === "F" ? "Mme" : "M."} ${patient?.nom || "—"}</div>
    </div>
    <div class="pi-item">
      <div class="pi-label">Date de naissance</div>
      <div class="pi-value">${dateNaissStr}</div>
    </div>
    <div class="pi-item">
      <div class="pi-label">Âge</div>
      <div class="pi-value">${age} ans</div>
    </div>
    <div class="pi-item">
      <div class="pi-label">Sexe</div>
      <div class="pi-value">${sexeStr}</div>
    </div>
  </div>
  <div class="patient-grid-2" style="border-top:1px solid #e5e7eb">
    <div class="pi-item">
      <div class="pi-label">Poids</div>
      <div class="pi-value">${poidsStr}</div>
    </div>
    <div class="pi-item">
      <div class="pi-label">Taille</div>
      <div class="pi-value">${tailleStr}</div>
    </div>
    <div class="pi-item">
      <div class="pi-label">Tension artérielle</div>
      <div class="pi-value">${taStr}</div>
    </div>
  </div>
  ${antecedentsStr !== "—" ? `
  <div style="padding:8px 14px;border-top:1px solid #e5e7eb;background:#fffbf0">
    <div class="pi-label" style="margin-bottom:3px">Antécédents médicaux</div>
    <div style="font-size:12px;color:#444;line-height:1.5">${antecedentsStr}</div>
  </div>` : ""}
</div>
<div class="rx">℞</div>
<div class="section">
  <div class="sec-label">Diagnostic</div>
  <div class="sec-value">${diagnostic}</div>
</div>
<div class="section">
  <div class="sec-label">Prescriptions</div>
  <div class="sec-value">
    ${traitements.length > 0
      ? traitements.map((t, i) =>
          `<div style="margin-bottom:6px;padding-bottom:6px;border-bottom:${i < traitements.length - 1 ? "1px dashed #e5e7eb" : "none"}">
            <strong>${i + 1}.</strong> ${t.trim()}
          </div>`
        ).join("")
      : "<em style='color:#888'>Aucun traitement prescrit</em>"
    }
  </div>
</div>
${commentaires ? `
<div class="section">
  <div class="sec-label">Commentaires / Suivi</div>
  <div class="sec-value">${commentaires}</div>
</div>` : ""}
<div class="footer">
  <div>
    <div>Ordonnance établie le ${date}</div>
    <div style="margin-top:3px;color:#aaa">Valable 3 mois</div>
  </div>
  <div class="sign-box">
    <div class="medecin-info">Dr. ${medecin?.nom || "—"}</div>
    <div class="medecin-spec">${medecin?.specialite || ""}</div>
    <div class="sign-line">Signature &amp; Cachet du médecin</div>
  </div>
</div>
</body></html>`)
    w.document.close()
    setTimeout(() => w.print(), 400)
  }

  return (
    <div
      style={{
        position: "fixed", inset: 0,
        background: "rgba(15,23,42,0.55)",
        zIndex: 300,
        display: "flex", alignItems: "center", justifyContent: "center",
        padding: 20,
        /* ── le scroll se gère ici si l'écran est trop petit ── */
        overflowY: "auto",
      }}
      onClick={e => { if (e.target === e.currentTarget) onClose() }}
    >
      <div
        style={{
          background: C.white,
          borderRadius: 20,
          width: "100%",
          maxWidth: 600,
          /* ── PAS de maxHeight ni overflow:hidden ici ──
             Le modal grandit naturellement ; c'est l'overlay qui scrolle */
          boxShadow: "0 25px 60px rgba(0,0,0,0.22)",
          /* margin auto pour rester centré même quand l'overlay scrolle */
          margin: "auto",
          display: "flex",
          flexDirection: "column",
        }}
      >
        {/* ── Header vert (fixe en haut du modal) ── */}
        <div
          style={{
            padding: "22px 28px 18px",
            background: "linear-gradient(135deg,#166534,#16a34a)",
            borderRadius: "20px 20px 0 0",
            display: "flex", justifyContent: "space-between", alignItems: "center",
            flexShrink: 0,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
            <div style={{
              width: 44, height: 44, borderRadius: 12,
              background: "rgba(255,255,255,0.2)",
              display: "flex", alignItems: "center", justifyContent: "center",
            }}>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none"
                stroke="#fff" strokeWidth="2.2" strokeLinecap="round">
                <polyline points="6 9 6 2 18 2 18 9"/>
                <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/>
                <rect x="6" y="14" width="12" height="8"/>
              </svg>
            </div>
            <div>
              <p style={{ fontSize: 16, fontWeight: 800, color: "#fff", marginBottom: 3 }}>
                Ordonnance médicale
              </p>
              <p style={{ fontSize: 12, color: "rgba(255,255,255,0.8)" }}>
                {patient?.nom} · {age} ans · Dr. {medecin?.nom}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            style={{
              background: "rgba(255,255,255,0.18)", border: "none",
              borderRadius: 8, color: "#fff", cursor: "pointer",
              width: 32, height: 32,
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 20, lineHeight: 1, flexShrink: 0,
            }}
          >×</button>
        </div>

        {/* ── Corps scrollable ── */}
        <div style={{ padding: "24px 28px", display: "flex", flexDirection: "column", gap: 14 }}>

          {/* Infos patient */}
          <div style={{
            background: C.slateSoft, borderRadius: 12,
            padding: "14px 16px", border: "1px solid " + C.border,
          }}>
            <p style={{
              fontSize: 11, fontWeight: 700, color: C.textSec,
              textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: 10,
            }}>Patient</p>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10 }}>
              {[
                { label: "Nom",            val: `${patient?.sexe === "F" ? "Mme" : "M."} ${patient?.nom}` },
                { label: "Âge",            val: `${age} ans`   },
                { label: "Poids",          val: poidsStr       },
                { label: "Date naissance", val: dateNaissStr   },
                { label: "Sexe",           val: sexeStr        },
                { label: "Tension (TA)",   val: taStr          },
              ].map(({ label, val }) => (
                <div key={label}>
                  <p style={{
                    fontSize: 10, color: C.textMuted, marginBottom: 2,
                    fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em",
                  }}>{label}</p>
                  <p style={{ fontSize: 13, fontWeight: 600, color: C.textPri }}>{val}</p>
                </div>
              ))}
            </div>
            {antecedentsStr !== "—" && (
              <div style={{ marginTop: 10, paddingTop: 10, borderTop: "1px solid " + C.border }}>
                <p style={{
                  fontSize: 10, color: C.textMuted, marginBottom: 3,
                  fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em",
                }}>Antécédents</p>
                <p style={{ fontSize: 12, color: C.textSec, lineHeight: 1.5 }}>{antecedentsStr}</p>
              </div>
            )}
          </div>

          {/* Diagnostic */}
          <div style={{
            background: "#f0fdf4", borderRadius: 12,
            padding: "14px 16px", border: "1px solid #bbf7d0",
          }}>
            <p style={{
              fontSize: 11, fontWeight: 700, color: "#166534",
              textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: 6,
            }}>Diagnostic</p>
            <p style={{ fontSize: 13, color: "#14532d", fontWeight: 600 }}>{diagnostic}</p>
          </div>

          {/* Prescriptions */}
          <div style={{ borderRadius: 12, overflow: "hidden", border: "1px solid " + C.border }}>
            <div style={{
              padding: "10px 16px", background: C.slateSoft,
              borderBottom: "1px solid " + C.border,
            }}>
              <p style={{
                fontSize: 11, fontWeight: 700, color: C.textSec,
                textTransform: "uppercase", letterSpacing: "0.07em",
              }}>
                <span style={{
                  fontSize: 18, fontWeight: 900, color: C.green,
                  marginRight: 8, fontStyle: "italic",
                }}>℞</span>
                Prescriptions
              </p>
            </div>
            <div style={{ padding: "12px 16px", display: "flex", flexDirection: "column", gap: 8 }}>
              {traitements.length > 0 ? traitements.map((t, i) => (
                <div key={i} style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
                  <span style={{
                    minWidth: 22, height: 22, borderRadius: "50%",
                    background: C.greenSoft, color: C.green,
                    fontSize: 11, fontWeight: 800,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    flexShrink: 0, marginTop: 1,
                  }}>{i + 1}</span>
                  <p style={{ fontSize: 13, color: C.textPri, lineHeight: 1.5 }}>{t.trim()}</p>
                </div>
              )) : (
                <p style={{ fontSize: 13, color: C.textMuted, fontStyle: "italic" }}>
                  Aucun traitement prescrit
                </p>
              )}
            </div>
          </div>

          {/* Commentaires */}
          {commentaires && (
            <div style={{
              background: C.blueSoft, borderRadius: 12,
              padding: "12px 16px", border: "1px solid " + C.blue + "33",
            }}>
              <p style={{
                fontSize: 11, fontWeight: 700, color: C.blue,
                textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: 6,
              }}>Commentaires / Suivi</p>
              <p style={{ fontSize: 13, color: C.textPri, lineHeight: 1.5 }}>{commentaires}</p>
            </div>
          )}

          {/* Médecin */}
          <div style={{ display: "flex", justifyContent: "flex-end" }}>
            <div style={{
              textAlign: "right", padding: "10px 16px",
              background: C.slateSoft, borderRadius: 12, border: "1px solid " + C.border,
            }}>
              <p style={{ fontSize: 13, fontWeight: 700, color: C.textPri }}>Dr. {medecin?.nom}</p>
              <p style={{ fontSize: 11, color: C.textSec }}>{medecin?.specialite}</p>
              <p style={{ fontSize: 10, color: C.textMuted, marginTop: 4 }}>Clinique ABC Marouane</p>
            </div>
          </div>

          {/* ── Boutons — toujours visibles car dans le flux normal ── */}
          <div style={{
            display: "flex", gap: 10, justifyContent: "flex-end",
            paddingTop: 12, paddingBottom: 4,
            borderTop: "1px solid " + C.border,
          }}>
            <button
              onClick={onClose}
              style={{
                padding: "10px 22px", border: "1px solid " + C.border,
                borderRadius: 10, background: C.white, color: C.textSec,
                fontSize: 13, fontWeight: 600, cursor: "pointer", fontFamily: "inherit",
              }}
            >
              Fermer
            </button>
            <button
              onClick={imprimer}
              style={{
                padding: "10px 22px", border: "none", borderRadius: 10,
                background: "#16a34a", color: "#fff",
                fontSize: 13, fontWeight: 700, cursor: "pointer", fontFamily: "inherit",
                display: "flex", alignItems: "center", gap: 8,
              }}
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none"
                stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                <polyline points="6 9 6 2 18 2 18 9"/>
                <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/>
                <rect x="6" y="14" width="12" height="8"/>
              </svg>
              Imprimer l'ordonnance
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

// ══════════════════════════════════════════════════════
//  COMPOSANT PRINCIPAL — DASHBOARD MÉDECIN
// ══════════════════════════════════════════════════════
export default function DashboardMedecin() {
  const { user, logout } = useAuth()
  const navigate         = useNavigate()
  const handleLogout     = () => { logout(); navigate("/login") }

  const {
    patients: sharedPatients,
    consultations: sharedConsultations,
    addConsultation, deleteConsultation,
    file, updateFileEntry,
    rdv, addRdv, removeRdv,
    notifs, marquerNotifLue, marquerToutesLues,
    rafraichir,
  } = useSharedData()

  const medecin = {
    id:         user?.id || 2,
    nom:        user?.nom || "Dr. Keïta",
    specialite: user?.specialite || "Médecine générale",
  }

  const mesNotifs     = notifs.filter(n => n.docteurId === medecin.id).sort((a, b) => b.id - a.id)
  const notifsNonLues = mesNotifs.filter(n => !n.lu).length
  const [showNotifs,  setShowNotifs]  = useState(false)

  const [onglet,       setOnglet]       = useState("accueil")
  const [sidebarOpen,  setSidebarOpen]  = useState(false)
  const [showCreerRdv, setShowCreerRdv] = useState(false)
  const consultations                   = sharedConsultations
  const [heure,        setHeure]        = useState("")
  const [dateStr,      setDateStr]      = useState("")
  const [recherche,    setRecherche]    = useState("")
  const [mFiche,       setMFiche]       = useState(null)
  const [mConsult,     setMConsult]     = useState(null)
  const [mOrdonnance,  setMOrdonnance]  = useState(null)
  const [showTypeConsult, setShowTypeConsult] = useState(null) // patient pour afficher le sélecteur

  /* Sync consultation ouverte quand les données changent */
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

  /* Horloge */
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

  /* ── Mes RDV ── */
  const mesRdv = [
    ...rdv.filter(r => r.docteurId === Number(medecin.id)),
    ...file
      .filter(f =>
        f.docteurId === Number(medecin.id) &&
        f.typeVisite === "rendez_vous" &&
        f.statut !== "termine"
      )
      .map(f => ({
        id:           f.rdvId || f.id,
        patientId:    f.patientId,
        patient:      f.nom,
        docteurId:    medecin.id,
        date:         today(),
        heure:        f.arrivee || "—",
        service:      f.service,
        docteur:      medecin.nom,
        motif:        f.motif || "Consultation",
        rappelEnvoye: true,
        fileId:       f.id,
      })),
  ].sort((a, b) => (a.heure || "").localeCompare(b.heure || ""))

  /* ── Mes patients du jour ── */
  const mesPatients = (() => {
    const byPatient = new Map()
    const todayStr  = today()
    file.forEach(f => {
      if (Number(f.docteurId) !== Number(medecin.id) || f.statut === "termine") return
      const pat = sharedPatients.find(p => p.id === f.patientId) || {}
      const c   = consultations.find(x =>
        x.patientId === f.patientId &&
        (x.date?.slice(0, 10) || x.date) === todayStr &&
        Number(x.docteurId) === Number(medecin.id) &&
        !x.signe
      )
      byPatient.set(f.patientId, { ...pat, ...f, id: f.patientId, fileId: f.id, consultation: c || null })
    })
    return [...byPatient.values()]
  })()

  const mesConsultations = consultations.filter(c => Number(c.docteurId) === Number(medecin.id))
  const enAttente        = mesPatients.filter(p => p.statut === "en_attente").length
  const nonSignees       = mesConsultations.filter(c => !c.signe).length

  const patientsFiltres = mesPatients.filter(p => {
    const q = recherche.toLowerCase()
    return !q ||
      p.nom.toLowerCase().includes(q) ||
      (p.pid || "").toLowerCase().includes(q) ||
      (p.motif || "").toLowerCase().includes(q) ||
      (p.motifRdv || "").toLowerCase().includes(q) ||
      (TYPE_CONSULT_LABEL[p.typeConsultation]?.label || "").toLowerCase().includes(q)
  })

  const isGyn = isGynecoObst(medecin.specialite)

  const ouvrirConsultation = (patient) => {
    const todayStr = today()
    const existing = patient.consultation || consultations.find(c =>
      Number(c.patientId) === Number(patient.id) &&
      (c.date?.slice(0, 10) || c.date) === todayStr &&
      Number(c.docteurId) === Number(medecin.id) &&
      !c.signe
    )

    // Si gynécologue et pas de consultation existante, afficher le sélecteur
    if (isGyn && !existing && !patient.typeConsultation) {
      setShowTypeConsult(patient)
      return
    }

    setMConsult({ patient, consultation: existing || null })
  }

  const choisirTypeConsult = (type) => {
    const patient = showTypeConsult
    setShowTypeConsult(null)
    // Mettre à jour le patient avec le typeConsultation
    const patientAvecType = { ...patient, typeConsultation: type }
    setMConsult({ patient: patientAvecType, consultation: null })
  }

  const handleSauvegarder = async (data) => {
    const patientId = mConsult.patient.id
    const todayStr  = today()
    try {
      const old = consultations.filter(c =>
        Number(c.patientId) === Number(patientId) &&
        (c.date?.slice(0, 10) || c.date) === todayStr &&
        Number(c.docteurId) === Number(medecin.id) &&
        !c.signe
      )
      for (const ac of old) { if (ac.id) await deleteConsultation(ac.id) }
      await addConsultation({
        patientId, date: todayStr,
        service:   medecin.specialite,
        docteurId: medecin.id,
        signe:     false,
        envoyerLabo: data.envoyerLabo === true,
        ...data,
      })
      if (rafraichir) await rafraichir()
      alert(data.envoyerLabo
        ? "Examens envoyés au laboratoire. Vous pourrez signer après les résultats."
        : "Consultation sauvegardée — vos données sont conservées.")
    } catch (e) { alert(e.message || "Erreur de sauvegarde.") }
  }

  const handleSigner = async (data) => {
    const patientId = mConsult.patient.id
    const c         = mConsult.consultation
    const todayStr  = today()
    if ((data.examensCommandes?.length > 0) && !c?.laboValide) {
      alert("Signature impossible : résultats du laboratoire non validés.")
      return
    }
    const ts = new Date().toLocaleString("fr-FR")
    try {
      const old = consultations.filter(c =>
        Number(c.patientId) === Number(patientId) &&
        (c.date?.slice(0, 10) || c.date) === todayStr &&
        Number(c.docteurId) === Number(medecin.id) &&
        !c.signe
      )
      for (const ac of old) { if (ac.id) await deleteConsultation(ac.id) }
      await addConsultation({
        patientId, date: todayStr,
        service:   medecin.specialite,
        docteurId: medecin.id,
        signe:     true, signeLe: ts, signePar: medecin.nom,
        ...data,
      })
      const fileEntry = file.find(f => f.patientId === patientId && f.statut !== "termine")
      if (fileEntry) await updateFileEntry(fileEntry.id, { statut: "termine" })
      setMConsult(null)
      alert("Consultation signée et validée.")
    } catch (e) { alert(e.message || "Erreur lors de la signature.") }
  }

  const handleCreerRdv = (form) => {
    const p = sharedPatients.find(pt => pt.id === parseInt(form.patientId))
    addRdv({
      ...form,
      patientId:    parseInt(form.patientId),
      patient:      p?.nom || "—",
      docteurId:    medecin.id,
      docteur:      medecin.nom,
      service:      medecin.specialite,
      rappelEnvoye: false,
    })
    setShowCreerRdv(false)
  }

  /* ── Navigation ── */
  const NAV_ICONS = {
    home:  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9.5L12 3l9 6.5V20a1 1 0 01-1 1H4a1 1 0 01-1-1V9.5z"/><path d="M9 21V12h6v9"/></svg>,
    users: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="9" cy="7" r="3.5"/><path d="M2.5 20c0-3.6 2.9-6.5 6.5-6.5s6.5 2.9 6.5 6.5"/><circle cx="17.5" cy="7" r="2.5"/><path d="M21.5 20c0-2.8-2-5-4.5-5.5"/></svg>,
    doc:   <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M9 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V4a2 2 0 00-2-2h-3"/><rect x="9" y="1" width="6" height="3" rx="1"/><line x1="12" y1="9" x2="12" y2="15"/><line x1="9" y1="12" x2="15" y2="12"/></svg>,
    cal:   <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/><circle cx="12" cy="16" r="1.5" fill="currentColor" stroke="none"/></svg>,
  }
  const NAV = [
    { id: "accueil",       label: "Accueil",          icon: "home",  desc: "Vue d'ensemble",        badge: 0                                         },
    { id: "patients",      label: "Mes patients",      icon: "users", desc: "Liste du jour",          badge: enAttente                                 },
    { id: "consultations", label: "Mes consultations", icon: "doc",   desc: "Historique & signature", badge: nonSignees                                },
    { id: "rdv",           label: "Mes rendez-vous",   icon: "cal",   desc: "Agenda & planification", badge: mesRdv.filter(r => r.date === today()).length },
  ]

  return (
    <div style={{ minHeight: "100vh", background: C.bg, fontFamily: "'Segoe UI',system-ui,sans-serif", color: C.textPri }}>

      {/* ── MODALS ── */}
      {mFiche && (
        <ModalFichePatient
          patient={mFiche}
          consultations={consultations}
          medecin={medecin}
          onClose={() => setMFiche(null)}
          onConsulter={p => ouvrirConsultation(p)}
        />
      )}
      {mOrdonnance && (
        <ModalOrdonnance
          patient={mOrdonnance.patient}
          consultation={mOrdonnance.consultation}
          medecin={medecin}
          onClose={() => setMOrdonnance(null)}
        />
      )}
      {showCreerRdv && (
        <ModalCreerRdvMedecin
          patients={sharedPatients}
          medecin={medecin}
          onClose={() => setShowCreerRdv(false)}
          onCreate={handleCreerRdv}
        />
      )}
      {/* ── MODAL SELECTEUR TYPE CONSULTATION (Gynécologie) ── */}
      {showTypeConsult && (
        <div
          style={{
            position: "fixed", inset: 0,
            background: "rgba(15,23,42,0.55)",
            zIndex: 300,
            display: "flex", alignItems: "center", justifyContent: "center",
            padding: 20,
          }}
          onClick={e => { if (e.target === e.currentTarget) setShowTypeConsult(null) }}
        >
          <div
            style={{
              background: C.white,
              borderRadius: 20,
              width: "100%",
              maxWidth: 480,
              boxShadow: "0 25px 60px rgba(0,0,0,0.22)",
              margin: "auto",
            }}
          >
            <div
              style={{
                padding: "24px 28px 18px",
                background: "linear-gradient(135deg,#d946ef,#c026d3)",
                borderRadius: "20px 20px 0 0",
                display: "flex", justifyContent: "space-between", alignItems: "center",
              }}
            >
              <div>
                <p style={{ fontSize: 16, fontWeight: 800, color: "#fff", marginBottom: 3 }}>
                  Type de consultation
                </p>
                <p style={{ fontSize: 13, color: "rgba(255,255,255,0.85)" }}>
                  {showTypeConsult.nom} · {calcAge(showTypeConsult.dateNaissance)} ans
                </p>
              </div>
              <button
                onClick={() => setShowTypeConsult(null)}
                style={{
                  background: "rgba(255,255,255,0.18)", border: "none",
                  borderRadius: 8, color: "#fff", cursor: "pointer",
                  width: 32, height: 32,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: 20, lineHeight: 1,
                }}
              >×</button>
            </div>

            <div style={{ padding: "24px 28px" }}>
              <p style={{ fontSize: 13, color: C.textSec, marginBottom: 16, lineHeight: 1.5 }}>
                En tant que gynécologue, veuillez sélectionner le type de consultation pour cette patiente :
              </p>

              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                <button
                  onClick={() => choisirTypeConsult("standard")}
                  style={{
                    display: "flex", alignItems: "flex-start", gap: 14,
                    padding: "16px 18px", border: "2px solid " + C.border,
                    borderRadius: 14, background: C.white, cursor: "pointer",
                    textAlign: "left", transition: "all .2s",
                  }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = C.slate; e.currentTarget.style.background = C.slateSoft }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = C.border; e.currentTarget.style.background = C.white }}
                >
                  <div style={{
                    width: 44, height: 44, borderRadius: 12,
                    background: C.blueSoft, color: C.blue,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    flexShrink: 0,
                  }}>
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M4.8 2.3A.3.3 0 0 0 5 2h14a.3.3 0 0 1 .3.3v19.4a.3.3 0 0 1-.3.3H5a.3.3 0 0 1-.3-.3V2.3z"/><path d="M8 7h8"/><path d="M8 11h6"/><path d="M8 15h8"/><path d="M8 19h4"/></svg>
                  </div>
                  <div>
                    <p style={{ fontSize: 14, fontWeight: 700, color: C.textPri, marginBottom: 3 }}>Consultation standard</p>
                    <p style={{ fontSize: 12, color: C.textMuted, lineHeight: 1.4 }}>Consultation gynécologique classique (frottis, contraception, troubles menstruels, etc.)</p>
                  </div>
                </button>

                <button
                  onClick={() => choisirTypeConsult("prenatal")}
                  style={{
                    display: "flex", alignItems: "flex-start", gap: 14,
                    padding: "16px 18px", border: "2px solid " + C.border,
                    borderRadius: 14, background: C.white, cursor: "pointer",
                    textAlign: "left", transition: "all .2s",
                  }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = C.green; e.currentTarget.style.background = C.greenSoft }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = C.border; e.currentTarget.style.background = C.white }}
                >
                  <div style={{
                    width: 44, height: 44, borderRadius: 12,
                    background: C.greenSoft, color: C.green,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    flexShrink: 0,
                  }}>
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M9 12h.01"/><path d="M15 12h.01"/><path d="M10 16c.5.3 1.2.5 2 .5s1.5-.2 2-.5"/><path d="M19 6.3a9 9 0 0 1 1.8 3.9 2 2 0 0 1 0 3.6 9 9 0 0 1-17.6 0 2 2 0 0 1 0-3.6A9 9 0 0 1 12 3c2 0 3.5 1.1 3.5 2.5s-.9 2.5-2 2.5c-.8 0-1.5-.4-1.5-1"/></svg>
                  </div>
                  <div>
                    <p style={{ fontSize: 14, fontWeight: 700, color: C.textPri, marginBottom: 3 }}>Consultation Prénatale (CPN)</p>
                    <p style={{ fontSize: 12, color: C.textMuted, lineHeight: 1.4 }}>Suivi de grossesse — DDR, terme, HU, BCF, VAT, PTME, etc.</p>
                  </div>
                </button>

                <button
                  onClick={() => choisirTypeConsult("accouchement")}
                  style={{
                    display: "flex", alignItems: "flex-start", gap: 14,
                    padding: "16px 18px", border: "2px solid " + C.border,
                    borderRadius: 14, background: C.white, cursor: "pointer",
                    textAlign: "left", transition: "all .2s",
                  }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = C.amber; e.currentTarget.style.background = C.amberSoft }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = C.border; e.currentTarget.style.background = C.white }}
                >
                  <div style={{
                    width: 44, height: 44, borderRadius: 12,
                    background: C.amberSoft, color: C.amber,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    flexShrink: 0,
                  }}>
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M9 12h.01"/><path d="M15 12h.01"/><path d="M10 16c.5.3 1.2.5 2 .5s1.5-.2 2-.5"/><path d="M19 6.3a9 9 0 0 1 1.8 3.9 2 2 0 0 1 0 3.6 9 9 0 0 1-17.6 0 2 2 0 0 1 0-3.6A9 9 0 0 1 12 3c2 0 3.5 1.1 3.5 2.5s-.9 2.5-2 2.5c-.8 0-1.5-.4-1.5-1"/></svg>
                  </div>
                  <div>
                    <p style={{ fontSize: 14, fontWeight: 700, color: C.textPri, marginBottom: 3 }}>Accouchement</p>
                    <p style={{ fontSize: 12, color: C.textMuted, lineHeight: 1.4 }}>Enregistrement de l'accouchement — voie, APGAR, poids nouveau-né, etc.</p>
                  </div>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {mConsult && (
        <ModalConsultation
          key={mConsult.patient.id + "-" + (mConsult.consultation?.id || "nouveau")}
          patient={mConsult.patient}
          medecin={medecin}
          consultation={mConsult.consultation}
          onClose={() => setMConsult(null)}
          onSauvegarder={handleSauvegarder}
          onSigner={handleSigner}
          prixExamensParLabo={false}
          attenteResultatsLabo={mConsult.consultation?.attenteResultatsLabo}
          laboValide={mConsult.consultation?.laboValide}
        />
      )}

      {/* ── SIDEBAR ── */}
      {sidebarOpen && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.3)", zIndex: 100 }}
          onClick={() => setSidebarOpen(false)}>
          <div style={{
            position: "absolute", left: 0, top: 0, bottom: 0, width: 270,
            background: C.white, boxShadow: "4px 0 24px rgba(0,0,0,0.12)",
            display: "flex", flexDirection: "column",
          }} onClick={e => e.stopPropagation()}>
            <div style={{
              padding: "22px 20px 18px", borderBottom: "1px solid " + C.border,
              display: "flex", alignItems: "center", gap: 12,
            }}>
              <div style={{
                width: 44, height: 44, borderRadius: 10, background: "#fff",
                border: "1px solid " + C.border, padding: 3, flexShrink: 0,
                display: "flex", alignItems: "center", justifyContent: "center",
              }}>
                <img src={logo} alt="" style={{ width: "100%", height: "100%", borderRadius: 7, objectFit: "contain", display: "block" }}/>
              </div>
              <div>
                <p style={{ fontSize: 14, fontWeight: 800, color: C.textPri, lineHeight: 1.2 }}>Clinique Marouane</p>
                <p style={{ fontSize: 12, color: C.textSec }}>Espace médecin</p>
              </div>
            </div>
            <nav style={{ padding: "14px 12px", flex: 1 }}>
              <p style={{ fontSize: 10, color: C.textMuted, letterSpacing: "0.12em", textTransform: "uppercase", padding: "0 8px", marginBottom: 8 }}>Menu principal</p>
              {NAV.map(n => (
                <button key={n.id} onClick={() => { setOnglet(n.id); setSidebarOpen(false) }}
                  style={{
                    width: "100%", display: "flex", alignItems: "center", gap: 12,
                    padding: "11px 12px", borderRadius: 12, border: "none",
                    background: onglet === n.id ? C.blueSoft : "transparent",
                    color: onglet === n.id ? C.blue : C.textSec,
                    fontSize: 14, fontWeight: onglet === n.id ? 700 : 500,
                    cursor: "pointer", textAlign: "left", marginBottom: 3,
                    transition: "all .15s",
                    boxShadow: onglet === n.id ? "inset 3px 0 0 " + C.blue : "none",
                    position: "relative",
                  }}
                  onMouseEnter={e => { if (onglet !== n.id) e.currentTarget.style.background = C.slateSoft }}
                  onMouseLeave={e => { if (onglet !== n.id) e.currentTarget.style.background = "transparent" }}>
                  <span style={{ display: "flex", alignItems: "center" }}>{NAV_ICONS[n.icon]}</span>
                  <div style={{ flex: 1 }}>
                    <p style={{ fontSize: 13, lineHeight: 1.2 }}>{n.label}</p>
                    <p style={{ fontSize: 10, color: C.textMuted, lineHeight: 1.2, marginTop: 1 }}>{n.desc}</p>
                  </div>
                  {n.badge > 0 && (
                    <span style={{ background: C.red, color: "#fff", fontSize: 11, fontWeight: 700, borderRadius: 10, padding: "2px 7px" }}>{n.badge}</span>
                  )}
                </button>
              ))}
            </nav>
            <div style={{ padding: "14px 16px 20px", borderTop: "1px solid " + C.border }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 12px", background: C.blueSoft, borderRadius: 12, border: "1px solid " + C.blue + "33" }}>
                <Avatar name={medecin.nom} size={36} bg={C.blue} />
                <div>
                  <p style={{ fontSize: 13, fontWeight: 700, color: C.textPri, lineHeight: 1.2 }}>{medecin.nom}</p>
                  <p style={{ fontSize: 11, color: C.textPri, fontWeight: 600, marginTop: 1 }}>{medecin.specialite}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── HEADER ── */}
      <header style={{
        background: C.white, borderBottom: "1px solid " + C.border,
        padding: "0 24px", height: 64,
        display: "flex", alignItems: "center", justifyContent: "space-between",
        position: "sticky", top: 0, zIndex: 50,
        boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
      }}>
        <button onClick={() => setSidebarOpen(true)}
          style={{ width: 40, height: 40, borderRadius: 8, border: "1px solid " + C.border, background: C.white, cursor: "pointer", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 5 }}>
          <div style={{ width: 20, height: 2, background: C.textPri, borderRadius: 2 }}/>
          <div style={{ width: 20, height: 2, background: C.textPri, borderRadius: 2 }}/>
          <div style={{ width: 20, height: 2, background: C.textPri, borderRadius: 2 }}/>
        </button>

        <div style={{ display: "flex", alignItems: "center", gap: 10, marginLeft: 12, paddingRight: 20, borderRight: "1px solid " + C.border, flexShrink: 0 }}>
          <div style={{ width: 38, height: 38, borderRadius: 9, background: "#fff", border: "1px solid " + C.border, padding: 3, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <img src={logo} alt="" style={{ width: "100%", height: "100%", borderRadius: 6, objectFit: "contain", display: "block" }}/>
          </div>
          <div>
            <p style={{ fontSize: 13, fontWeight: 800, color: C.textPri, lineHeight: 1.2 }}>Clinique Marouane</p>
            <p style={{ fontSize: 11, color: C.textMuted }}>Espace médecin</p>
          </div>
        </div>

        <div style={{ flex: 1, marginLeft: 16 }}>
          <p style={{ fontSize: 15, fontWeight: 700, color: C.textPri, lineHeight: 1.2 }}>
            {onglet === "accueil"       && "Accueil"}
            {onglet === "patients"      && "Mes patients du jour"}
            {onglet === "consultations" && "Mes consultations"}
            {onglet === "rdv"           && "Mes rendez-vous"}
          </p>
          <p style={{ fontSize: 12, color: C.textMuted, textTransform: "capitalize" }}>{dateStr}</p>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          {nonSignees > 0 && (
            <button onClick={() => setOnglet("consultations")}
              style={{ background: C.redSoft, border: "1px solid " + C.red + "44", borderRadius: 10, padding: "7px 14px", fontSize: 12, fontWeight: 700, color: C.red, cursor: "pointer", fontFamily: "inherit" }}>
              {nonSignees} à signer
            </button>
          )}

          {/* Notifications */}
          <div style={{ position: "relative" }}>
            <button onClick={() => { setShowNotifs(v => !v); if (!showNotifs) marquerToutesLues(medecin.id) }}
              style={{ width: 40, height: 40, borderRadius: 10, border: "1px solid " + C.border, background: notifsNonLues > 0 ? C.amberSoft : C.white, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", position: "relative" }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={notifsNonLues > 0 ? C.amber : C.textSec} strokeWidth="2" strokeLinecap="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>
              {notifsNonLues > 0 && (
                <span style={{ position: "absolute", top: -4, right: -4, width: 18, height: 18, borderRadius: "50%", background: C.red, color: "#fff", fontSize: 10, fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center" }}>{notifsNonLues}</span>
              )}
            </button>
            {showNotifs && (
              <div style={{ position: "absolute", right: 0, top: 48, width: 320, background: C.white, borderRadius: 14, boxShadow: "0 8px 32px rgba(0,0,0,0.15)", border: "1px solid " + C.border, zIndex: 200, overflow: "hidden" }}
                onClick={e => e.stopPropagation()}>
                <div style={{ padding: "14px 16px", borderBottom: "1px solid " + C.border, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <p style={{ fontSize: 14, fontWeight: 700, color: C.textPri }}>Notifications</p>
                  <button onClick={() => setShowNotifs(false)} style={{ background: "none", border: "none", cursor: "pointer", color: C.textMuted, fontSize: 18, lineHeight: 1 }}>×</button>
                </div>
                <div style={{ maxHeight: 340, overflowY: "auto" }}>
                  {mesNotifs.length === 0
                    ? <p style={{ padding: "28px 16px", textAlign: "center", color: C.textMuted, fontSize: 13 }}>Aucune notification</p>
                    : mesNotifs.map(n => (
                      <div key={n.id} onClick={() => marquerNotifLue(n.id)}
                        style={{ padding: "12px 16px", borderBottom: "1px solid " + C.border, background: n.lu ? "transparent" : C.greenSoft, cursor: "pointer", display: "flex", gap: 12, alignItems: "flex-start" }}>
                        <div style={{ width: 36, height: 36, borderRadius: "50%", background: n.lu ? C.slateSoft : C.green, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={n.lu ? "#6b7280" : "#fff"} strokeWidth="2" strokeLinecap="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/></svg>
                        </div>
                        <div style={{ flex: 1 }}>
                          <p style={{ fontSize: 13, fontWeight: n.lu ? 500 : 700, color: C.textPri, marginBottom: 2 }}>{n.titre || "Nouveau patient assigné"}</p>
                          <p style={{ fontSize: 12, color: C.textSec, marginBottom: 2 }}>{n.patientNom}</p>
                          <p style={{ fontSize: 11, color: C.textMuted }}>{n.motif}</p>
                          <p style={{ fontSize: 10, color: C.textMuted, marginTop: 4 }}>{n.date} à {n.heure}</p>
                        </div>
                        {!n.lu && <div style={{ width: 8, height: 8, borderRadius: "50%", background: C.green, flexShrink: 0, marginTop: 4 }}/>}
                      </div>
                    ))
                  }
                </div>
              </div>
            )}
          </div>

          <div style={{ background: C.blueSoft, border: "1px solid " + C.blue + "33", borderRadius: 10, padding: "8px 16px", fontSize: 14, fontWeight: 700, color: C.blue, fontVariantNumeric: "tabular-nums", minWidth: 112, textAlign: "center" }}>{heure}</div>

          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <div style={{ textAlign: "right" }}>
              <p style={{ fontSize: 13, fontWeight: 700, color: C.textPri, lineHeight: 1.2 }}>{medecin.nom}</p>
              <p style={{ fontSize: 11, color: C.textSec }}>{medecin.specialite}</p>
            </div>
            <Avatar name={medecin.nom} size={36} bg={C.blue} />
          </div>

          <button onClick={handleLogout} title="Se déconnecter"
            style={{ width: 36, height: 36, borderRadius: 8, border: "1px solid #fca5a5", background: "#fff5f5", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#cc2222" strokeWidth="2" strokeLinecap="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
          </button>
        </div>
      </header>

      {/* ── CONTENU ── */}
      <main style={{ padding: "28px 28px" }}>

        {/* ACCUEIL */}
        {onglet === "accueil" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 16 }}>
              {[
                { val: mesPatients.length, label: "Patients assignés", bg: C.blueSoft, fg: C.blue, icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg> },
                { val: enAttente, label: "En attente", bg: C.slateSoft, fg: C.slate, icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg> },
                { val: sharedConsultations.filter(c => Number(c.docteurId) === Number(medecin.id) && c.signe).length, label: "Consultations signées", bg: C.greenSoft, fg: C.green, icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><polyline points="9 15 11 17 15 13"/></svg> },
              ].map(({ val, label, bg, fg, icon }) => (
                <Card key={label} style={{ padding: "22px 20px" }}>
                  <div style={{ width: 46, height: 46, borderRadius: 12, background: bg, display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 14, color: fg }}>{icon}</div>
                  <p style={{ fontSize: 32, fontWeight: 800, color: C.textPri, letterSpacing: "-1px", lineHeight: 1 }}>{val}</p>
                  <p style={{ fontSize: 12, color: C.textMuted, marginTop: 6 }}>{label}</p>
                </Card>
              ))}
            </div>

            {nonSignees > 0 && (
              <div style={{ background: C.redSoft, border: "1px solid " + C.red + "33", borderRadius: 14, padding: "14px 20px", display: "flex", alignItems: "center", gap: 12, cursor: "pointer" }}
                onClick={() => setOnglet("consultations")}>
                <div style={{ width: 40, height: 40, borderRadius: 10, background: C.red + "22", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={C.red} strokeWidth="2" strokeLinecap="round"><path d="M12 9v4"/><path d="M12 17h.01"/><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/></svg>
                </div>
                <div style={{ flex: 1 }}>
                  <p style={{ fontSize: 14, fontWeight: 700, color: C.red }}>{nonSignees} consultation{nonSignees > 1 ? "s" : ""} non signée{nonSignees > 1 ? "s" : ""} — signature requise</p>
                  <p style={{ fontSize: 12, color: "#991b1b" }}>Cliquez pour accéder et signer</p>
                </div>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={C.red} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"/></svg>
              </div>
            )}

            <Card>
              <CardHeader
                title="Mes patients du jour"
                sub={medecin.specialite + " · " + mesPatients.length + " patient" + (mesPatients.length > 1 ? "s" : "")}
                action={<button onClick={() => setOnglet("patients")} style={{ background: "none", border: "none", color: C.blue, fontSize: 13, cursor: "pointer", fontWeight: 600 }}>Tout voir</button>}
              />
              {mesPatients.length === 0
                ? <p style={{ padding: 40, textAlign: "center", color: C.textMuted }}>Aucun patient assigné aujourd'hui</p>
                : mesPatients.slice(0, 5).map((p, i) => (
                  <div key={p.id}
                    style={{ padding: "13px 20px", display: "flex", alignItems: "center", justifyContent: "space-between", borderBottom: i < Math.min(mesPatients.length, 5) - 1 ? "1px solid " + C.border : "none", cursor: "pointer", transition: "background .15s" }}
                    onClick={() => setMFiche(p)}
                    onMouseEnter={e => e.currentTarget.style.background = C.slateSoft}
                    onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
                    <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                      <Avatar name={p.nom} size={36} />
                      <div>
                        <p style={{ fontSize: 13, fontWeight: 600, color: C.textPri }}>{p.nom}</p>
                        <p style={{ fontSize: 11, color: C.textSec, display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap" }}>
                          <RdvBadge patient={p} />
                          {(p.typeConsultation && p.typeConsultation !== "standard") && <TypeConsultBadge type={p.typeConsultation} />}
                          <span>{p.motif} · Arrivé à {p.arrivee}</span>
                        </p>
                      </div>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <Badge statut={p.statut} />
                      <Btn onClick={e => { e.stopPropagation(); ouvrirConsultation(p) }} small variant="success">
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

        {/* MES PATIENTS */}
        {onglet === "patients" && (
          <Card>
            <CardHeader
              title={"Mes patients — " + mesPatients.length + " assigné" + (mesPatients.length > 1 ? "s" : "")}
              sub={medecin.specialite}
              action={
                <div style={{ position: "relative" }}>
                  <svg style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)", pointerEvents: "none" }} width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={C.textMuted} strokeWidth="2" strokeLinecap="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
                  <input placeholder="Nom, ID, motif…" value={recherche} onChange={e => setRecherche(e.target.value)}
                    style={{ padding: "8px 12px 8px 32px", fontSize: 13, border: "1.5px solid " + C.border, borderRadius: 10, background: C.bg, color: C.textPri, outline: "none", fontFamily: "inherit", width: 200 }}
                    onFocus={e => e.target.style.borderColor = C.blue}
                    onBlur={e => e.target.style.borderColor = C.border} />
                </div>
              }
            />
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ background: C.slateSoft }}>
                  {["Patient", "Motif / file", "Arrivée", "Statut", "Actions"].map(h => (
                    <th key={h} style={{ padding: "11px 16px", textAlign: "left", fontSize: 11, fontWeight: 700, color: C.textSec, letterSpacing: "0.06em", textTransform: "uppercase" }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {patientsFiltres.length === 0
                  ? <tr><td colSpan={5} style={{ padding: 40, textAlign: "center", color: C.textMuted }}>Aucun patient trouvé</td></tr>
                  : patientsFiltres.sort(a => a.statut === "en_attente" ? -1 : 1).map((p, i, arr) => (
                    <tr key={p.id}
                      style={{ borderBottom: i < arr.length - 1 ? "1px solid " + C.border : "none", transition: "background .15s" }}
                      onMouseEnter={e => e.currentTarget.style.background = C.slateSoft}
                      onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
                      <td style={{ padding: "13px 16px" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                          <Avatar name={p.nom} size={32} />
                          <div>
                            <p style={{ fontSize: 13, fontWeight: 600, color: C.textPri }}>{p.nom}</p>
                            <p style={{ fontSize: 11, color: C.textMuted }}>{p.pid} · {calcAge(p.dateNaissance)} ans</p>
                          </div>
                        </div>
                      </td>
                      <td style={{ padding: "13px 16px", fontSize: 13, color: C.textSec }}>
                        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                          <span>{p.motif}</span>
                          <span style={{ display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap" }}>
                            <RdvBadge patient={p} />
                            {(p.typeConsultation && p.typeConsultation !== "standard") && <TypeConsultBadge type={p.typeConsultation} />}
                          </span>
                        </div>
                      </td>
                      <td style={{ padding: "13px 16px", fontSize: 13, fontWeight: 700, color: C.textPri, fontVariantNumeric: "tabular-nums" }}>{p.arrivee}</td>
                      <td style={{ padding: "13px 16px" }}><Badge statut={p.statut} /></td>
                      <td style={{ padding: "13px 16px" }}>
                        <div style={{ display: "flex", gap: 6 }}>
                          <button onClick={() => setMFiche(p)}
                            style={{ background: C.blueSoft, border: "1px solid " + C.blue + "33", borderRadius: 8, color: C.blue, fontSize: 12, fontWeight: 600, cursor: "pointer", padding: "6px 12px", fontFamily: "inherit" }}
                            onMouseEnter={e => { e.currentTarget.style.background = C.blue; e.currentTarget.style.color = "#fff" }}
                            onMouseLeave={e => { e.currentTarget.style.background = C.blueSoft; e.currentTarget.style.color = C.blue }}>
                            Voir fiche
                          </button>
                          {p.statut !== "termine" && (
                            <Btn onClick={() => ouvrirConsultation(p)} small variant="success">Consulter</Btn>
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

        {/* MES RENDEZ-VOUS */}
        {onglet === "rdv" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 16 }}>
              {[
                { val: mesRdv.length,                              label: "Total RDV",   bg: C.purpleSoft, fg: C.purple },
                { val: mesRdv.filter(r => r.date === today()).length, label: "Aujourd'hui", bg: C.blueSoft,   fg: C.blue   },
                { val: mesRdv.filter(r => r.date > today()).length,   label: "À venir",     bg: C.greenSoft,  fg: C.green  },
              ].map(({ val, label, fg }) => (
                <Card key={label} style={{ padding: "20px" }}>
                  <p style={{ fontSize: 30, fontWeight: 800, color: fg, lineHeight: 1 }}>{val}</p>
                  <p style={{ fontSize: 12, color: C.textMuted, marginTop: 6 }}>{label}</p>
                </Card>
              ))}
            </div>
            <Card>
              <CardHeader
                title={"Mes rendez-vous — " + mesRdv.length}
                sub={medecin.specialite + " · Créez et gérez vos propres RDV"}
                action={
                  <Btn onClick={() => setShowCreerRdv(true)} small>
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M12 5v14M5 12h14"/></svg>
                    Nouveau RDV
                  </Btn>
                }
              />
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead>
                  <tr style={{ background: C.slateSoft }}>
                    {["Patient", "Date", "Heure", "Motif", "Statut", "Action"].map(h => (
                      <th key={h} style={{ padding: "10px 16px", textAlign: "left", fontSize: 11, fontWeight: 700, color: C.textSec, textTransform: "uppercase", letterSpacing: "0.05em" }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {mesRdv.length === 0 ? (
                    <tr><td colSpan={6} style={{ padding: 40, textAlign: "center", color: C.textMuted }}>Aucun rendez-vous planifié — créez votre premier RDV</td></tr>
                  ) : mesRdv.map((r, i, arr) => {
                    const isPast  = r.date < today()
                    const isToday = r.date === today()
                    return (
                      <tr key={r.id}
                        style={{ borderBottom: i < arr.length - 1 ? "1px solid " + C.border : "none" }}
                        onMouseEnter={e => e.currentTarget.style.background = C.slateSoft}
                        onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
                        <td style={{ padding: "12px 16px" }}>
                          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                            <Avatar name={r.patient} size={30} bg={C.purple} />
                            <p style={{ fontSize: 13, fontWeight: 600, color: C.textPri }}>{r.patient}</p>
                          </div>
                        </td>
                        <td style={{ padding: "12px 16px", fontSize: 13, fontWeight: isToday ? 700 : 400, color: isToday ? C.green : isPast ? C.textMuted : C.textSec }}>
                          {new Date(r.date).toLocaleDateString("fr-FR")}
                          {isToday && <span style={{ marginLeft: 6, fontSize: 10, fontWeight: 700, background: C.greenSoft, color: C.green, padding: "2px 7px", borderRadius: 10 }}>Aujourd'hui</span>}
                        </td>
                        <td style={{ padding: "12px 16px", fontSize: 13, fontWeight: 700, color: C.textPri, fontVariantNumeric: "tabular-nums" }}>{r.heure}</td>
                        <td style={{ padding: "12px 16px", fontSize: 12, color: C.textSec }}>{r.motif || "—"}</td>
                        <td style={{ padding: "12px 16px" }}>
                          {isPast
                            ? <span style={{ fontSize: 11, fontWeight: 700, background: C.slateSoft, color: C.textMuted, padding: "3px 10px", borderRadius: 20 }}>Passé</span>
                            : isToday
                              ? <span style={{ fontSize: 11, fontWeight: 700, background: C.greenSoft, color: C.green, padding: "3px 10px", borderRadius: 20, display: "inline-flex", alignItems: "center", gap: 4 }}>
                                  <span style={{ width: 5, height: 5, borderRadius: "50%", background: C.green, animation: "blink 2s ease-in-out infinite" }}/>
                                  Aujourd'hui
                                </span>
                              : <span style={{ fontSize: 11, fontWeight: 700, background: C.purpleSoft, color: C.purple, padding: "3px 10px", borderRadius: 20 }}>Planifié</span>
                          }
                        </td>
                        <td style={{ padding: "12px 16px" }}>
                          <button onClick={() => removeRdv(r.id)}
                            style={{ padding: "5px 10px", border: "1px solid #fca5a5", borderRadius: 8, background: "#fff5f5", color: "#cc2222", fontSize: 11, fontWeight: 600, cursor: "pointer", fontFamily: "inherit" }}>
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

        {/* MES CONSULTATIONS */}
        {onglet === "consultations" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            {nonSignees > 0 && (
              <div style={{ background: C.redSoft, border: "1px solid " + C.red + "33", borderRadius: 12, padding: "14px 20px" }}>
                <p style={{ fontSize: 14, fontWeight: 700, color: C.red, marginBottom: 2 }}>
                  {nonSignees} consultation{nonSignees > 1 ? "s" : ""} non signée{nonSignees > 1 ? "s" : ""} — action requise
                </p>
                <p style={{ fontSize: 13, color: "#991b1b" }}>Signez chaque consultation pour valider votre travail.</p>
              </div>
            )}
            <Card>
              <div style={{ padding: "16px 20px", borderBottom: "1px solid " + C.border }}>
                <p style={{ fontSize: 15, fontWeight: 700, color: C.textPri }}>Mes consultations — {mesConsultations.length} au total</p>
                <p style={{ fontSize: 13, color: C.textMuted }}>{nonSignees} non signée{nonSignees > 1 ? "s" : ""}</p>
              </div>
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead>
                  <tr style={{ background: C.slateSoft }}>
                    {["Patient", "Date", "Motif / Plaintes", "Diagnostic", "Statut", "Action"].map(h => (
                      <th key={h} style={{ padding: "11px 12px", textAlign: "left", fontSize: 11, fontWeight: 700, color: C.textSec, textTransform: "uppercase", letterSpacing: "0.05em" }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {mesConsultations.length === 0
                    ? <tr><td colSpan={6} style={{ padding: 40, textAlign: "center", color: C.textMuted }}>Aucune consultation enregistrée</td></tr>
                    : [...mesConsultations].sort((a, b) => b.date.localeCompare(a.date)).map((c, i, arr) => {
                        const p = sharedPatients.find(pt => pt.id === c.patientId)
                        if (!p) return null
                        return (
                          <tr key={c.id}
                            style={{ borderBottom: i < arr.length - 1 ? "1px solid " + C.border : "none", background: !c.signe ? "#fff8f8" : "transparent", transition: "background .15s" }}
                            onMouseEnter={e => e.currentTarget.style.background = C.slateSoft}
                            onMouseLeave={e => e.currentTarget.style.background = !c.signe ? "#fff8f8" : "transparent"}>
                            <td style={{ padding: "12px 12px" }}>
                              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                                <Avatar name={p.nom} size={30}/>
                                <p style={{ fontSize: 13, fontWeight: 600, color: C.textPri }}>{p.nom}</p>
                              </div>
                            </td>
                            <td style={{ padding: "12px 12px", fontSize: 12, color: C.textMuted }}>{fmt(c.date)}</td>
                            <td style={{ padding: "12px 12px", fontSize: 12, color: C.textSec, maxWidth: 160 }}>{c.plaintes || c.motif || "—"}</td>
                            <td style={{ padding: "12px 12px", fontSize: 12, color: C.textSec }}>{(c.diagnostics || []).join(", ") || "—"}</td>
                            <td style={{ padding: "12px 12px" }}>
                              {c.signe
                                ? <span style={{ fontSize: 11, fontWeight: 700, background: C.greenSoft, color: C.green, padding: "3px 10px", borderRadius: 20 }}>Signé</span>
                                : <span style={{ fontSize: 11, fontWeight: 700, background: "#fee2e2", color: C.red, padding: "3px 10px", borderRadius: 20 }}>Non signé</span>
                              }
                            </td>
                            <td style={{ padding: "12px 12px" }}>
                              <div style={{ display: "flex", gap: 6 }}>
                                {c.signe ? (
                                  <>
                                    <button onClick={() => setMConsult({ patient: p, consultation: c })}
                                      style={{ padding: "6px 12px", border: "1px solid " + C.slate + "44", borderRadius: 8, background: C.slateSoft, color: C.slate, fontSize: 12, fontWeight: 600, cursor: "pointer", fontFamily: "inherit" }}>
                                      Modifier
                                    </button>
                                    <button onClick={() => setMOrdonnance({ patient: p, consultation: c })}
                                      style={{ padding: "6px 12px", border: "none", borderRadius: 8, background: C.blue, color: "#fff", fontSize: 12, fontWeight: 600, cursor: "pointer", fontFamily: "inherit", display: "flex", alignItems: "center", gap: 4 }}>
                                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><polyline points="6 9 6 2 18 2 18 9"/><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/><rect x="6" y="14" width="12" height="8"/></svg>
                                      Ordonnance
                                    </button>
                                  </>
                                ) : (
                                  <button onClick={() => setMConsult({ patient: p, consultation: c })}
                                    style={{ padding: "6px 12px", border: "none", borderRadius: 8, background: C.green, color: "#fff", fontSize: 12, fontWeight: 600, cursor: "pointer", fontFamily: "inherit", display: "flex", alignItems: "center", gap: 4 }}>
                                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                                    Continuer
                                  </button>
                                )}
                              </div>
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