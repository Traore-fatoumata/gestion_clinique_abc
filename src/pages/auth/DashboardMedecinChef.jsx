import { useState, useEffect, useCallback } from "react"
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
import PageMigrations    from "./medecinChef/PageMigrations.jsx"
import ModalConsultation from "./medecinChef/ModalConsultation.jsx"
import ModalCreerRdvMedecin from "./medecin/ModalCreerRdvMedecin.jsx"
import PageReferencesRecues from "./medecin/PageReferencesRecues.jsx"
import PageUrgencesTriage from "./medecin/PageUrgencesTriage.jsx"
import ParametresClinique from "./medecinChef/ParametresClinique.jsx"
import { buildDonneesBrouillon, consultationPourMedecin, toutesConsultationsPourMedecin, patientsPourMedecin } from "../../utils/clinicFlow.js"
import { calcAge } from "./medecinChef/shared.jsx"

// ══════════════════════════════════════════════════════
//  MODAL ORDONNANCE — utilisée par le médecin chef
// ══════════════════════════════════════════════════════
function ModalOrdonnance({ patient, consultation, medecin, onClose }) {
  const age = calcAge(patient?.dateNaissance || patient?.date_naissance)
  const dateNaissStr = (patient?.dateNaissance || patient?.date_naissance)
    ? new Date(patient.dateNaissance || patient.date_naissance).toLocaleDateString("fr-FR")
    : "—"
  const sexeStr  = patient?.sexe === "F" ? "Féminin" : patient?.sexe === "M" ? "Masculin" : "—"
  const poidsStr = consultation?.poids ? `${consultation.poids} kg` : "—"
  const tailleStr = consultation?.donneesPrenatal?.tailleCm
    ? `${consultation.donneesPrenatal.tailleCm} cm`
    : consultation?.taille ? `${consultation.taille} cm` : "—"
  const taStr = consultation?.donneesPrenatal?.ta || consultation?.ta || "—"
  const antecedentsStr = consultation?.antecedents || "—"
  const diagnostic = (consultation?.diagDefinitif || consultation?.diagnostics || []).join?.(", ")
    || (typeof (consultation?.diagDefinitif || consultation?.diagnostics) === "string"
      ? (consultation?.diagDefinitif || consultation?.diagnostics) : "")
    || consultation?.diagPresomption || "—"
  const traitements = Array.isArray(consultation?.traitements)
    ? consultation.traitements
    : (consultation?.traitements ? consultation.traitements.split(",").map(t => t.trim()).filter(Boolean) : [])
  const commentaires = consultation?.commentaires || ""
  const date = new Date().toLocaleDateString("fr-FR")

  const imprimer = () => {
    const w = window.open("", "_blank", "width=720,height=960")
    w.document.write(`<!DOCTYPE html><html><head><meta charset="utf-8">
<title>Ordonnance — ${patient?.nom || ""}</title><style>
*{box-sizing:border-box}
body{font-family:'Segoe UI',sans-serif;margin:0;padding:36px 40px;color:#000;font-size:13px}
.header{display:flex;justify-content:space-between;align-items:flex-start;border-bottom:3px solid #16a34a;padding-bottom:14px;margin-bottom:20px}
.hclinic{flex:1}.title{font-size:20px;font-weight:800;color:#16a34a;margin:0 0 3px}
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
    <div style={{ position:"fixed", inset:0, background:"rgba(15,23,42,0.55)", zIndex:300,
      display:"flex", alignItems:"center", justifyContent:"center", padding:20 }}
      onClick={e => { if (e.target === e.currentTarget) onClose() }}>
      <div style={{ background:C.white, borderRadius:20, width:"100%", maxWidth:600,
        boxShadow:"0 25px 60px rgba(0,0,0,0.22)", overflow:"hidden" }}>

        {/* Header vert */}
        <div style={{ padding:"22px 28px 18px", background:"linear-gradient(135deg,#166534,#16a34a)",
          display:"flex", justifyContent:"space-between", alignItems:"center" }}>
          <div style={{ display:"flex", alignItems:"center", gap:14 }}>
            <div style={{ width:44, height:44, borderRadius:12, background:"rgba(255,255,255,0.2)",
              display:"flex", alignItems:"center", justifyContent:"center" }}>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.2" strokeLinecap="round">
                <polyline points="6 9 6 2 18 2 18 9"/>
                <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/>
                <rect x="6" y="14" width="12" height="8"/>
              </svg>
            </div>
            <div>
              <p style={{ fontSize:16, fontWeight:800, color:"#fff", marginBottom:3 }}>Ordonnance médicale</p>
              <p style={{ fontSize:12, color:"rgba(255,255,255,0.8)" }}>
                {patient?.nom} · {age} ans · Dr. {medecin?.nom}
              </p>
            </div>
          </div>
          <button onClick={onClose} style={{ background:"rgba(255,255,255,0.18)", border:"none",
            borderRadius:8, color:"#fff", cursor:"pointer", width:32, height:32,
            display:"flex", alignItems:"center", justifyContent:"center", fontSize:20, lineHeight:1 }}>×</button>
        </div>

        {/* Aperçu */}
        <div style={{ padding:"24px 28px", display:"flex", flexDirection:"column", gap:14 }}>

          {/* Infos patient */}
          <div style={{ background:C.slateSoft, borderRadius:12, padding:"14px 16px", border:"1px solid "+C.border }}>
            <p style={{ fontSize:11, fontWeight:700, color:C.textSec, textTransform:"uppercase",
              letterSpacing:"0.07em", marginBottom:10 }}>Patient</p>
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:10 }}>
              {[
                { label:"Nom",             val:`${patient?.sexe==="F"?"Mme":"M."} ${patient?.nom}` },
                { label:"Âge",             val:`${age} ans`    },
                { label:"Poids",           val:poidsStr        },
                { label:"Date naissance",  val:dateNaissStr    },
                { label:"Sexe",            val:sexeStr         },
                { label:"Tension (TA)",    val:taStr           },
              ].map(({label, val}) => (
                <div key={label}>
                  <p style={{ fontSize:10, color:C.textMuted, marginBottom:2, fontWeight:600,
                    textTransform:"uppercase", letterSpacing:"0.05em" }}>{label}</p>
                  <p style={{ fontSize:13, fontWeight:600, color:C.textPri }}>{val}</p>
                </div>
              ))}
            </div>
            {antecedentsStr !== "—" && (
              <div style={{ marginTop:10, paddingTop:10, borderTop:"1px solid "+C.border }}>
                <p style={{ fontSize:10, color:C.textMuted, marginBottom:3, fontWeight:600,
                  textTransform:"uppercase", letterSpacing:"0.05em" }}>Antécédents</p>
                <p style={{ fontSize:12, color:C.textSec, lineHeight:1.5 }}>{antecedentsStr}</p>
              </div>
            )}
          </div>

          {/* Diagnostic */}
          <div style={{ background:"#f0fdf4", borderRadius:12, padding:"14px 16px", border:"1px solid #bbf7d0" }}>
            <p style={{ fontSize:11, fontWeight:700, color:"#166534", textTransform:"uppercase",
              letterSpacing:"0.07em", marginBottom:6 }}>Diagnostic</p>
            <p style={{ fontSize:13, color:"#14532d", fontWeight:600 }}>{diagnostic}</p>
          </div>

          {/* Prescriptions */}
          <div style={{ borderRadius:12, overflow:"hidden", border:"1px solid "+C.border }}>
            <div style={{ padding:"10px 16px", background:C.slateSoft, borderBottom:"1px solid "+C.border }}>
              <p style={{ fontSize:11, fontWeight:700, color:C.textSec, textTransform:"uppercase", letterSpacing:"0.07em" }}>
                <span style={{ fontSize:18, fontWeight:900, color:C.green, marginRight:8, fontStyle:"italic" }}>℞</span>
                Prescriptions
              </p>
            </div>
            <div style={{ padding:"12px 16px", display:"flex", flexDirection:"column", gap:8 }}>
              {traitements.length > 0 ? traitements.map((t, i) => (
                <div key={i} style={{ display:"flex", gap:10, alignItems:"flex-start" }}>
                  <span style={{ minWidth:22, height:22, borderRadius:"50%", background:C.greenSoft,
                    color:C.green, fontSize:11, fontWeight:800, display:"flex", alignItems:"center",
                    justifyContent:"center", flexShrink:0, marginTop:1 }}>{i+1}</span>
                  <p style={{ fontSize:13, color:C.textPri, lineHeight:1.5 }}>{t.trim()}</p>
                </div>
              )) : (
                <p style={{ fontSize:13, color:C.textMuted, fontStyle:"italic" }}>Aucun traitement prescrit</p>
              )}
            </div>
          </div>

          {/* Commentaires */}
          {commentaires && (
            <div style={{ background:C.blueSoft, borderRadius:12, padding:"12px 16px", border:"1px solid "+C.blue+"33" }}>
              <p style={{ fontSize:11, fontWeight:700, color:C.blue, textTransform:"uppercase",
                letterSpacing:"0.07em", marginBottom:6 }}>Commentaires / Suivi</p>
              <p style={{ fontSize:13, color:C.textPri, lineHeight:1.5 }}>{commentaires}</p>
            </div>
          )}

          {/* Médecin */}
          <div style={{ display:"flex", justifyContent:"flex-end" }}>
            <div style={{ textAlign:"right", padding:"10px 16px", background:C.slateSoft,
              borderRadius:12, border:"1px solid "+C.border }}>
              <p style={{ fontSize:13, fontWeight:700, color:C.textPri }}>Dr. {medecin?.nom}</p>
              <p style={{ fontSize:11, color:C.textSec }}>{medecin?.specialite}</p>
              <p style={{ fontSize:10, color:C.textMuted, marginTop:4 }}>Clinique ABC Marouane</p>
            </div>
          </div>

          {/* Boutons */}
          <div style={{ display:"flex", gap:10, justifyContent:"flex-end", paddingTop:8, borderTop:"1px solid "+C.border }}>
            <button onClick={onClose}
              style={{ padding:"9px 20px", border:"1px solid "+C.border, borderRadius:10,
                background:C.white, color:C.textSec, fontSize:13, fontWeight:600,
                cursor:"pointer", fontFamily:"inherit" }}>
              Fermer
            </button>
            <button onClick={imprimer}
              style={{ padding:"9px 20px", border:"none", borderRadius:10, background:"#16a34a",
                color:"#fff", fontSize:13, fontWeight:700, cursor:"pointer", fontFamily:"inherit",
                display:"flex", alignItems:"center", gap:8 }}>
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                strokeWidth="2.5" strokeLinecap="round">
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
//  PAGE RDV — rendu dans le dashboard médecin chef
// ══════════════════════════════════════════════════════
function PageRdv({ rdv, patients, medecin, onCreerRdv, onAnnulerRdv }) {
  const mesRdv = rdv
    .filter(r => Number(r.docteurId) === Number(medecin.id))
    .sort((a, b) => {
      const dc = a.date.localeCompare(b.date)
      return dc !== 0 ? dc : (a.heure || "").localeCompare(b.heure || "")
    })

  const todayStr = today()

  const rdvAuj    = mesRdv.filter(r => r.date === todayStr)
  const rdvAVenir = mesRdv.filter(r => r.date > todayStr)
  const rdvPasses = mesRdv.filter(r => r.date < todayStr)

  const fmtDate = (d) => {
    try { return new Date(d).toLocaleDateString("fr-FR", { weekday:"short", day:"numeric", month:"short", year:"numeric" }) }
    catch { return d }
  }

  const RdvRow = ({ r, isPast, isToday }) => {
    const p = patients.find(pt => pt.id === r.patientId)
    return (
      <tr style={{ borderBottom:"1px solid "+C.border, transition:"background .15s" }}
        onMouseEnter={e => e.currentTarget.style.background = C.slateSoft}
        onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
        <td style={{ padding:"13px 16px" }}>
          <div style={{ display:"flex", alignItems:"center", gap:10 }}>
            <div style={{ width:34, height:34, borderRadius:"50%",
              background: isToday ? C.greenSoft : isPast ? C.slateSoft : C.purpleSoft,
              display:"flex", alignItems:"center", justifyContent:"center",
              fontSize:13, fontWeight:800,
              color: isToday ? C.green : isPast ? C.textMuted : C.purple }}>
              {(r.patient||"?").charAt(0).toUpperCase()}
            </div>
            <div>
              <p style={{ fontSize:13, fontWeight:700, color:C.textPri }}>{r.patient || p?.nom || "—"}</p>
              {p && <p style={{ fontSize:11, color:C.textMuted }}>{p.pid} · {calcAge(p.dateNaissance || p.date_naissance)} ans</p>}
            </div>
          </div>
        </td>
        <td style={{ padding:"13px 16px" }}>
          <p style={{ fontSize:13, fontWeight: isToday ? 700 : 400, color: isToday ? C.green : isPast ? C.textMuted : C.textSec }}>
            {fmtDate(r.date)}
          </p>
          {isToday && (
            <span style={{ fontSize:10, fontWeight:700, background:C.greenSoft, color:C.green,
              padding:"2px 8px", borderRadius:10, marginTop:3, display:"inline-block" }}>
              Aujourd'hui
            </span>
          )}
        </td>
        <td style={{ padding:"13px 16px", fontSize:14, fontWeight:700, color:C.textPri,
          fontVariantNumeric:"tabular-nums" }}>{r.heure || "—"}</td>
        <td style={{ padding:"13px 16px", fontSize:12, color:C.textSec }}>
          <p style={{ fontWeight:600, color:C.textPri, marginBottom:2 }}>{r.service || medecin.specialite}</p>
          <p>{r.motif || "—"}</p>
        </td>
        <td style={{ padding:"13px 16px" }}>
          {isPast
            ? <span style={{ fontSize:11, fontWeight:700, background:C.slateSoft,
                color:C.textMuted, padding:"3px 10px", borderRadius:20 }}>Passé</span>
            : isToday
              ? <span style={{ fontSize:11, fontWeight:700, background:C.greenSoft, color:C.green,
                  padding:"3px 10px", borderRadius:20, display:"inline-flex", alignItems:"center", gap:5 }}>
                  <span style={{ width:5, height:5, borderRadius:"50%", background:C.green, animation:"blink 2s ease-in-out infinite" }}/>
                  Aujourd'hui
                </span>
              : <span style={{ fontSize:11, fontWeight:700, background:C.purpleSoft, color:C.purple,
                  padding:"3px 10px", borderRadius:20 }}>Planifié</span>
          }
        </td>
        <td style={{ padding:"13px 16px" }}>
          {!isPast && (
            <button onClick={() => onAnnulerRdv(r.id)}
              style={{ padding:"5px 10px", border:"1px solid #fca5a5", borderRadius:8,
                background:"#fff5f5", color:"#cc2222", fontSize:11, fontWeight:600,
                cursor:"pointer", fontFamily:"inherit" }}>
              Annuler
            </button>
          )}
        </td>
      </tr>
    )
  }

  return (
    <div style={{ display:"flex", flexDirection:"column", gap:20 }}>

      {/* KPIs */}
      <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:16 }}>
        {[
          { val:mesRdv.length,    label:"Total RDV",      bg:C.purpleSoft, fg:C.purple },
          { val:rdvAuj.length,    label:"Aujourd'hui",    bg:C.greenSoft,  fg:C.green  },
          { val:rdvAVenir.length, label:"À venir",        bg:C.blueSoft,   fg:C.blue   },
          { val:rdvPasses.length, label:"Passés",         bg:C.slateSoft,  fg:C.slate  },
        ].map(({ val, label, bg, fg }) => (
          <div key={label} style={{ background:C.white, border:"1px solid "+C.border,
            borderRadius:14, padding:"20px" }}>
            <p style={{ fontSize:30, fontWeight:800, color:fg, lineHeight:1 }}>{val}</p>
            <p style={{ fontSize:12, color:C.textMuted, marginTop:6 }}>{label}</p>
          </div>
        ))}
      </div>

      {/* Alerte RDV du jour */}
      {rdvAuj.length > 0 && (
        <div style={{ background:C.greenSoft, border:"1px solid "+C.green+"33",
          borderRadius:14, padding:"14px 20px", display:"flex", alignItems:"center", gap:12 }}>
          <div style={{ width:40, height:40, borderRadius:10, background:C.green,
            display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.2" strokeLinecap="round">
              <rect x="3" y="4" width="18" height="18" rx="2"/>
              <line x1="16" y1="2" x2="16" y2="6"/>
              <line x1="8" y1="2" x2="8" y2="6"/>
              <line x1="3" y1="10" x2="21" y2="10"/>
              <circle cx="12" cy="16" r="1.5" fill="#fff" stroke="none"/>
            </svg>
          </div>
          <div>
            <p style={{ fontSize:14, fontWeight:700, color:C.green }}>
              {rdvAuj.length} rendez-vous aujourd'hui
            </p>
            <p style={{ fontSize:12, color:"#14532d" }}>
              {rdvAuj.map(r => r.patient).join(", ")}
            </p>
          </div>
        </div>
      )}

      {/* Tableau */}
      <div style={{ background:C.white, border:"1px solid "+C.border, borderRadius:14, overflow:"hidden" }}>
        {/* Header */}
        <div style={{ padding:"16px 20px", borderBottom:"1px solid "+C.border,
          display:"flex", justifyContent:"space-between", alignItems:"center" }}>
          <div>
            <p style={{ fontSize:15, fontWeight:800, color:C.textPri }}>
              Mes rendez-vous — {mesRdv.length}
            </p>
            <p style={{ fontSize:12, color:C.textMuted }}>{medecin.specialite} · Créez et gérez vos propres RDV</p>
          </div>
          <Btn onClick={onCreerRdv}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
              <path d="M12 5v14M5 12h14"/>
            </svg>
            Nouveau RDV
          </Btn>
        </div>

        <table style={{ width:"100%", borderCollapse:"collapse" }}>
          <thead>
            <tr style={{ background:C.slateSoft }}>
              {["Patient","Date","Heure","Service / Motif","Statut","Action"].map(h => (
                <th key={h} style={{ padding:"11px 16px", textAlign:"left", fontSize:11,
                  fontWeight:700, color:C.textSec, textTransform:"uppercase", letterSpacing:"0.06em" }}>
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {mesRdv.length === 0 ? (
              <tr>
                <td colSpan={6} style={{ padding:48, textAlign:"center" }}>
                  <div style={{ display:"flex", flexDirection:"column", alignItems:"center", gap:12 }}>
                    <div style={{ width:56, height:56, borderRadius:"50%", background:C.purpleSoft,
                      display:"flex", alignItems:"center", justifyContent:"center" }}>
                      <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke={C.purple} strokeWidth="2" strokeLinecap="round">
                        <rect x="3" y="4" width="18" height="18" rx="2"/>
                        <line x1="16" y1="2" x2="16" y2="6"/>
                        <line x1="8" y1="2" x2="8" y2="6"/>
                        <line x1="3" y1="10" x2="21" y2="10"/>
                      </svg>
                    </div>
                    <p style={{ fontSize:14, color:C.textMuted }}>Aucun rendez-vous planifié</p>
                    <p style={{ fontSize:12, color:C.textMuted }}>Cliquez sur « Nouveau RDV » pour planifier</p>
                  </div>
                </td>
              </tr>
            ) : (
              <>
                {/* RDV du jour en premier */}
                {rdvAuj.map(r => (
                  <RdvRow key={r.id} r={r} isPast={false} isToday={true} />
                ))}
                {/* RDV à venir */}
                {rdvAVenir.map(r => (
                  <RdvRow key={r.id} r={r} isPast={false} isToday={false} />
                ))}
                {/* RDV passés */}
                {rdvPasses.map(r => (
                  <RdvRow key={r.id} r={r} isPast={true} isToday={false} />
                ))}
              </>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}

// ══════════════════════════════════════════════════════
//  COMPOSANT PRINCIPAL — DASHBOARD MÉDECIN CHEF
// ══════════════════════════════════════════════════════
export default function DashboardMedecinChef() {
  const { user, logout } = useAuth()
  const navigate   = useNavigate()
  const handleLogout = () => { logout(); navigate("/login") }

  const {
    patients: sharedPatients, consultations: sharedConsultations,
    addConsultation, updateConsultation, deleteConsultation, signerConsultation,
    file, updateFileEntry, addNotif, resultatsLabo, soins, rdv, addRdv, removeRdv,
    rafraichir, apiFetch, creerReferences
  } = useSharedData()

  const [page,         setPage]         = useState("accueil")
  const [sidebarOpen,  setSidebarOpen]  = useState(false)
  const consultations = sharedConsultations
  const patients      = sharedPatients
  const [comptes,      setComptes]      = useState(INIT_COMPTES)
  const [medecins,     setMedecins]     = useState(INIT_MEDECINS)
  const [statsBackend, setStatsBackend] = useState(null)

  // Modal ordonnance
  const [mOrdonnance, setMOrdonnance]   = useState(null)  // { patient, consultation }

  const chargerStats = useCallback(async () => {
    try {
      const res = await apiFetch("/api/paiements/stats")
      if (res.success) setStatsBackend(res.stats)
    } catch (err) {
      console.error("Erreur chargement statistiques:", err)
    }
  }, [apiFetch])

  useEffect(() => { chargerStats() }, [chargerStats, file])

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

  const [heure,          setHeure]          = useState("")
  const [showPointer,    setShowPointer]    = useState(false)
  const [pointerHeure,   setPointerHeure]   = useState(null)
  const [showSettings,   setShowSettings]   = useState(false)
  const [showMonProfil,  setShowMonProfil]  = useState(false)
  const [showCreerRdv,   setShowCreerRdv]   = useState(false)

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
  const motDePasseOk = !profilForm.nouveauMotDePasse ||
    (profilForm.ancienMotDePasse &&
     profilForm.nouveauMotDePasse.length >= 6 &&
     profilForm.nouveauMotDePasse === profilForm.confirmerMotDePasse)

  const handleSaveProfil = () => {
    if (!profilOk || !motDePasseOk) return
    alert(profilForm.nouveauMotDePasse ? "Profil et mot de passe mis à jour !" : "Profil mis à jour !")
    setShowMonProfil(false)
  }

  const [mConsultComplete,    setMConsultComplete]    = useState(null)
  const [activeConsultation,  setActiveConsultation]  = useState(null)

  useClinicSettings()

  useEffect(() => {
    const tick = () => setHeure(new Date().toLocaleTimeString("fr-FR",
      { hour:"2-digit", minute:"2-digit", second:"2-digit" }))
    tick()
    const t = setInterval(tick, 1000)
    return () => clearInterval(t)
  }, [])

  const medecinChef = {
    id:         user?.id || 1,
    nom:        user?.nom || "Dr. Doumbouya",
    specialite: user?.specialite || "Médecine générale",
  }

  // ── handleValider ────────────────────────────────────
  const handleValider = async (consultId, data) => {
    const assignedDoctorId        = data.docteurId ? Number(data.docteurId) : Number(medecinChef.id)
    const isAssignedToOtherDoctor = data.docteurId && Number(data.docteurId) !== Number(medecinChef.id)
    const medecinAssigne          = medecins.find(m => Number(m.id) === assignedDoctorId)
    const todayStr                = today()
    const motifFile               = data.plaintes?.trim() || data.diagnostic?.trim() || "Consultation d'accueil"

    try {
      const anciennesASupprimer = consultations.filter(c =>
        Number(c.patientId) === Number(data.patientId)
        && (c.date?.slice(0, 10) || c.date) === todayStr
        && Number(c.docteurId) === Number(medecinChef.id)
        && !c.signe
      )
      for (const ac of anciennesASupprimer) {
        if (ac.id) await deleteConsultation(ac.id)
      }

      if (!isAssignedToOtherDoctor) {
        await addConsultation({
          patientId:    data.patientId,
          date:         todayStr,
          service:      medecinChef.specialite,
          motif:        data.plaintes,
          plaintes:     data.plaintes,
          symptomes:    data.symptomes,
          observations: data.observations,
          diagnostic:   data.diagnostic,
          docteurId:    assignedDoctorId,
          signe:        false,
          etape:        "triage",
        })
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
        && (f.dateEntree === todayStr || f.dateEntree == null)
      )

    if (isAssignedToOtherDoctor && entree) {
      await updateFileEntry(entree.id, {
        statut:     "en_cours",
        medecin_id: assignedDoctorId,
        docteurId:  assignedDoctorId,
        service:    medecinAssigne?.specialite || entree.service,
        motif:      motifFile,
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
          statut:     "en_cours",
          medecin_id: Number(medecinChef.id),
          docteurId:  Number(medecinChef.id),
          motif:      motifFile,
        })
      }
      alert("Patient ajouté à « Mes consultations ». Ouvrez-le depuis cet onglet pour continuer.")
    } else {
      alert("Erreur : impossible de trouver l'entrée dans la file d'attente.")
    }
    rafraichir?.()
  }

  // ── handleSauvegarderComplete ────────────────────────
  const handleSauvegarderComplete = async (data) => {
    if (!mConsultComplete) return
    const { patient, fileId } = mConsultComplete
    const todayStr = today()
    try {
      const anciennesASupprimer = consultations.filter(c =>
        Number(c.patientId) === Number(patient.id)
        && (c.date?.slice(0, 10) || c.date) === todayStr
        && Number(c.docteurId) === Number(medecinChef.id)
        && !c.signe
      )
      for (const ac of anciennesASupprimer) {
        if (ac.id) await deleteConsultation(ac.id)
      }
      await addConsultation({
        patientId:        patient.id,
        docteurId:        medecinChef.id,
        date:             todayStr,
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
      if (data.refInterServices && data.refInterServices.length > 0) {
        await creerReferences({
          patientId:        patient.id,
          servicesDestinataires: data.refInterServices,
          motifReference:   data.refMotif,
          priorite:         data.refPriorite || "Normale",
          commentaires:     data.refCommentaires || ""
        })
      }
      if (fileId && (data.examensCommandes?.length > 0)) {
        updateFileEntry(fileId, {
          fraisExamens:     data.fraisExamens || 0,
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

  // ── handleSignerComplete ─────────────────────────────
  const handleSignerComplete = async (data) => {
    if (!mConsultComplete) return
    const { patient, fileId, consultationExistante } = mConsultComplete
    const todayStr = today()
    if ((data.examensCommandes?.length > 0) && !consultationExistante?.laboValide) {
      alert("Signature impossible : résultats du laboratoire non validés.")
      return
    }
    const ts = new Date().toLocaleString("fr-FR")
    try {
      const anciennesASupprimer = consultations.filter(c =>
        Number(c.patientId) === Number(patient.id)
        && (c.date?.slice(0, 10) || c.date) === todayStr
        && Number(c.docteurId) === Number(medecinChef.id)
        && !c.signe
      )
      for (const ac of anciennesASupprimer) {
        if (ac.id) await deleteConsultation(ac.id)
      }
      const consultId = await addConsultation({
        patientId:        patient.id,
        docteurId:        medecinChef.id,
        date:             todayStr,
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
      if (data.refInterServices && data.refInterServices.length > 0) {
        await creerReferences({
          patientId:        patient.id,
          servicesDestinataires: data.refInterServices,
          motifReference:   data.refMotif,
          priorite:         data.refPriorite || "Normale",
          commentaires:     data.refCommentaires || ""
        })
      }
      if (consultId) await signerConsultation(consultId, medecinChef.nom)
    } catch (e) {
      alert(e.message || "Erreur lors de la signature.")
      return
    }
    if (fileId) {
      await updateFileEntry(fileId, {
        statut: "termine",
        ...(data.examensCommandes?.length > 0 && {
          fraisExamens:     data.fraisExamens || 0,
          examensCommandes: data.examensCommandes,
        }),
        ...(data.montantConsultation !== undefined && { montantConsultation: Number(data.montantConsultation || 0) }),
      })
    }
    setMConsultComplete(null)
    const nbEx = (data.examensCommandes || []).length
    alert(nbEx > 0
      ? `Consultation signée. ${nbEx} examen(s) prescrit(s) — le laboratoire fixera les tarifs.`
      : "Consultation signée et validée.")
  }

  // ── handleReprendreConsultation ──────────────────────
  const handleReprendreConsultation = (consultation) => {
    const patient = sharedPatients.find(p => p.id === consultation.patientId)
    if (!patient) return
    setActiveConsultation({ patient, consultation })
  }

  // ── handleSauvegarderActiveConsultation ──────────────
  const handleSauvegarderActiveConsultation = async (data) => {
    if (!activeConsultation) return
    const { patient, consultation } = activeConsultation
    const todayStr = consultation.date || today()
    try {
      const anciennesASupprimer = consultations.filter(c =>
        Number(c.patientId) === Number(patient.id)
        && (c.date?.slice(0, 10) || c.date) === (todayStr.slice?.(0, 10) || todayStr)
        && Number(c.docteurId) === Number(medecinChef.id)
        && !c.signe
        && c.id !== consultation.id
      )
      for (const ac of anciennesASupprimer) {
        if (ac.id) await deleteConsultation(ac.id)
      }
      addConsultation({
        patientId:        patient.id,
        docteurId:        medecinChef.id,
        date:             todayStr,
        service:          medecinChef.specialite,
        motif:            data.motif,
        plaintes:         data.plaintes,
        diagnostics:      data.diagnostics || [],
        traitements:      data.traitements || [],
        fraisExamens:     data.fraisExamens || 0,
        examensCommandes: data.examensCommandes || [],
        typeConsultation: data.typeConsultation || consultation.typeConsultation || "standard",
      })
      if (data.refInterServices && data.refInterServices.length > 0) {
        await creerReferences({
          patientId:        patient.id,
          servicesDestinataires: data.refInterServices,
          motifReference:   data.refMotif,
          priorite:         data.refPriorite || "Normale",
          commentaires:     data.refCommentaires || ""
        })
      }
      const fileEntry = file.find(f => f.patientId === patient.id && Number(f.docteurId) === Number(medecinChef.id) && f.statut !== "termine")
      if (fileEntry && (data.fraisExamens || 0) > 0) {
        updateFileEntry(fileEntry.id, {
          fraisExamens:     data.fraisExamens,
          examensCommandes: data.examensCommandes,
          ...(data.montantConsultation !== undefined && { montantConsultation: Number(data.montantConsultation || 0) }),
        })
      }
      setActiveConsultation(null)
      alert("Consultation sauvegardée.")
    } catch (e) {
      alert(e.message || "Erreur de sauvegarde.")
    }
  }

  // ── handleSignerActiveConsultation ───────────────────
  const handleSignerActiveConsultation = async (data) => {
    if (!activeConsultation) return
    const { patient, consultation } = activeConsultation
    const todayStr = consultation.date || today()
    if ((data.examensCommandes?.length > 0) && !consultation?.laboValide) {
      alert("Signature impossible : résultats du laboratoire non validés.")
      return
    }
    const ts = new Date().toLocaleString("fr-FR")
    try {
      const anciennesASupprimer = consultations.filter(c =>
        Number(c.patientId) === Number(patient.id)
        && (c.date?.slice(0, 10) || c.date) === (todayStr.slice?.(0, 10) || todayStr)
        && Number(c.docteurId) === Number(medecinChef.id)
        && !c.signe
        && c.id !== consultation.id
      )
      for (const ac of anciennesASupprimer) {
        if (ac.id) await deleteConsultation(ac.id)
      }
      const consultId = await addConsultation({
        patientId:        patient.id,
        docteurId:        medecinChef.id,
        date:             todayStr,
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
      if (data.refInterServices && data.refInterServices.length > 0) {
        await creerReferences({
          patientId:        patient.id,
          servicesDestinataires: data.refInterServices,
          motifReference:   data.refMotif,
          priorite:         data.refPriorite || "Normale",
          commentaires:     data.refCommentaires || ""
        })
      }
      const idSign = consultId || consultation.id
      if (idSign) await signerConsultation(idSign, medecinChef.nom)
    } catch (e) {
      alert(e.message || "Erreur lors de la signature.")
      return
    }
    const fileEntry = file.find(f => f.patientId === patient.id && Number(f.docteurId) === Number(medecinChef.id) && f.statut !== "termine")
    if (fileEntry) {
      await updateFileEntry(fileEntry.id, {
        statut: "termine",
        ...(data.examensCommandes?.length > 0 && {
          fraisExamens:     data.fraisExamens || 0,
          examensCommandes: data.examensCommandes,
        }),
        ...(data.montantConsultation !== undefined && { montantConsultation: Number(data.montantConsultation || 0) }),
      })
    }
    setActiveConsultation(null)
    const nbEx = (data.examensCommandes || []).length
    alert(nbEx > 0
      ? `Consultation signée. ${nbEx} examen(s) prescrit(s) — le laboratoire fixera les tarifs.`
      : "Consultation signée et validée.")
  }

  // ── Ouvrir ordonnance depuis historique ──────────────
  const ouvrirOrdonnance = (consultation) => {
    const patient = patients.find(p => p.id === consultation.patientId)
    if (!patient) { alert("Patient introuvable."); return }
    setMOrdonnance({ patient, consultation })
  }

  // ── Créer RDV ────────────────────────────────────────
  const handleCreerRdv = (form) => {
    const p = sharedPatients.find(pt => pt.id === parseInt(form.patientId))
    addRdv({
      ...form,
      patientId:    parseInt(form.patientId),
      patient:      p?.nom || "—",
      docteurId:    form.docteurId ? parseInt(form.docteurId) : medecinChef.id,
      docteur:      medecinChef.nom,
      service:      form.service || medecinChef.specialite,
      rappelEnvoye: false,
    })
    setShowCreerRdv(false)
  }

  const enAttente = consultations.filter(c =>
    consultationPourMedecin(c, file, medecinChef.id, today()) && !c.signe
  ).length

  // ── Navigation ───────────────────────────────────────
  const NAV_ICONS = {
    accueil: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9.5L12 3l9 6.5V20a1 1 0 01-1 1H4a1 1 0 01-1-1V9.5z"/><path d="M9 21V12h6v9"/></svg>,
    liste:   <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M9 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V4a2 2 0 00-2-2h-3"/><rect x="9" y="1" width="6" height="3" rx="1"/><line x1="12" y1="9" x2="12" y2="15"/><line x1="9" y1="12" x2="15" y2="12"/></svg>,
    patient: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="9" cy="7" r="3.5"/><path d="M2.5 20c0-3.6 2.9-6.5 6.5-6.5s6.5 2.9 6.5 6.5"/><circle cx="17.5" cy="7" r="2.5"/><path d="M21.5 20c0-2.8-2-5-4.5-5.5"/></svg>,
    clock:   <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="9"/><polyline points="12 7 12 12 15.5 14"/><polyline points="10 15 12 17 16 13"/></svg>,
    stats:   <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><line x1="3" y1="20" x2="21" y2="20"/><rect x="4" y="10" width="4" height="10" rx="1"/><rect x="10" y="6" width="4" height="14" rx="1"/><rect x="16" y="3" width="4" height="17" rx="1"/></svg>,
    history: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><polyline points="1 4 1 10 7 10"/><path d="M3.51 15a9 9 0 1 0 .49-4.51"/><line x1="12" y1="7" x2="12" y2="12"/><polyline points="10 14 12 12 14 14"/></svg>,
    cal:     <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/><circle cx="12" cy="16" r="1.5" fill="currentColor" stroke="none"/></svg>,
    migrations: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>,
    references: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><polyline points="17 1 21 5 17 9"/><path d="M3 11V9a4 4 0 0 1 4-4h14"/><polyline points="7 23 3 19 7 15"/><path d="M21 13v2a4 4 0 0 1-4 4H3"/></svg>,
    urgences: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2v20M2 12h20"/></svg>,
    parametres: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>,
  }

  // ── Mes patients & Mes consultations (toutes dates) ──
  const mesConsultations = toutesConsultationsPourMedecin(consultations, medecinChef.id)
  const mesPatientsList = patientsPourMedecin(consultations, patients, medecinChef.id)
  const mesConsultationsEnAttente = mesConsultations.filter(c => !c.signe)
  const mesConsultationsSignees = mesConsultations.filter(c => c.signe)

  const NAV = [
    { id:"accueil",       label:"Tableau de bord",    icon:"accueil"  },
    { id:"consultations", label:"File d'attente",      icon:"liste",   badge: enAttente },
    { id:"references",    label:"Orientations reçues", icon:"references" },
    { id:"urgences",      label:"Triage Urgences",     icon:"urgences" },
    { id:"mes_patients",  label:"Mes patients",        icon:"patient"  },
    { id:"mes_consults",  label:"Mes consultations",   icon:"history"  },
    { id:"rdv",           label:"Rendez-vous",         icon:"cal"      },
    { id:"comptes",       label:"Gestion Personnel",   icon:"patient"  },
    { id:"presence",      label:"Suivi Présence",      icon:"clock"    },
    { id:"stats",         label:"Statistiques",        icon:"stats"    },
    { id:"historique",    label:"Historique Patients", icon:"history"  },
    { id:"migrations",    label:"Migration Données",   icon:"migrations" },
    { id:"parametres",    label:"Paramètres Clinique", icon:"parametres" }
  ]

  return (
    <div style={{ minHeight:"100vh", background:"#ffffff",
      fontFamily:"'Segoe UI',system-ui,sans-serif", color:C.textPri }}>

      {/* ── MODALS ── */}
      {mConsultComplete && (
        <ModalConsultation
          key={mConsultComplete.patient?.id + "-chef-complet"}
          patient={mConsultComplete.patient}
          medecin={medecinChef}
          consultation={mConsultComplete.consultationExistante || null}
          onClose={() => setMConsultComplete(null)}
          onSauvegarder={handleSauvegarderComplete}
          onSigner={handleSignerComplete}
          prixExamensParLabo={false}
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
          prixExamensParLabo={false}
          attenteResultatsLabo={activeConsultation.consultation?.attenteResultatsLabo}
          laboValide={activeConsultation.consultation?.laboValide}
        />
      )}

      {/* Modal Ordonnance */}
      {mOrdonnance && (
        <ModalOrdonnance
          patient={mOrdonnance.patient}
          consultation={mOrdonnance.consultation}
          medecin={medecinChef}
          onClose={() => setMOrdonnance(null)}
        />
      )}

      {/* Modal Créer RDV */}
      {showCreerRdv && (
        <ModalCreerRdvMedecin
          patients={sharedPatients}
          medecin={medecinChef}
          onClose={() => setShowCreerRdv(false)}
          onCreate={handleCreerRdv}
        />
      )}

      {/* Modal Mon Profil */}
      {showMonProfil && (
        <Overlay onClose={() => setShowMonProfil(false)}>
          <div style={{ background:C.white, borderRadius:20, width:"100%", maxWidth:560,
            maxHeight:"90vh", overflow:"auto", boxShadow:"0 25px 60px rgba(0,0,0,0.2)" }}>
            <div style={{ padding:"22px 28px 18px", borderBottom:"1px solid "+C.border,
              display:"flex", justifyContent:"space-between" }}>
              <div>
                <p style={{ fontSize:18, fontWeight:800, color:C.textPri }}>Mon Profil</p>
                <p style={{ fontSize:13, color:C.textSec, marginTop:3 }}>Médecin chef — Modifier vos informations</p>
              </div>
              <button onClick={() => setShowMonProfil(false)}
                style={{ background:C.slateSoft, border:"none", borderRadius:8, color:C.textSec,
                  cursor:"pointer", width:32, height:32, display:"flex", alignItems:"center",
                  justifyContent:"center", fontSize:18 }}>×</button>
            </div>
            <div style={{ padding:"24px 28px", display:"flex", flexDirection:"column", gap:14 }}>
              <FInput label="Nom complet" req>
                <Inp value={profilForm.nom} onChange={e => pf("nom", e.target.value)} placeholder="Ex : Dr. Doumbouya" />
              </FInput>
              <FInput label="Email" req>
                <Inp type="email" value={profilForm.email} onChange={e => pf("email", e.target.value)} placeholder="email@cab.gn" />
              </FInput>
              <FInput label="Téléphone">
                <Inp value={profilForm.telephone} onChange={e => pf("telephone", e.target.value)} placeholder="+224 6XX XX XX XX" />
              </FInput>
              <div style={{ marginTop:8 }}>
                <p style={{ fontSize:14, fontWeight:700, color:C.textPri, marginBottom:12 }}>Changer le mot de passe</p>
                <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
                  <FInput label="Ancien mot de passe">
                    <Inp type="password" value={profilForm.ancienMotDePasse} onChange={e => pf("ancienMotDePasse", e.target.value)} placeholder="••••••••" />
                  </FInput>
                  <FInput label="Nouveau mot de passe">
                    <Inp type="password" value={profilForm.nouveauMotDePasse} onChange={e => pf("nouveauMotDePasse", e.target.value)} placeholder="Min. 6 caractères" />
                  </FInput>
                  <FInput label="Confirmer le mot de passe">
                    <Inp type="password" value={profilForm.confirmerMotDePasse} onChange={e => pf("confirmerMotDePasse", e.target.value)} placeholder="••••••••" />
                  </FInput>
                  {profilForm.nouveauMotDePasse && profilForm.nouveauMotDePasse !== profilForm.confirmerMotDePasse && (
                    <p style={{ fontSize:11, color:C.red }}>Les mots de passe ne correspondent pas</p>
                  )}
                </div>
              </div>
              <div style={{ display:"flex", justifyContent:"flex-end", gap:10, paddingTop:8,
                borderTop:"1px solid "+C.border }}>
                <Btn onClick={() => setShowMonProfil(false)} variant="secondary">Annuler</Btn>
                <Btn onClick={handleSaveProfil} disabled={!profilOk || !motDePasseOk}>Enregistrer</Btn>
              </div>
            </div>
          </div>
        </Overlay>
      )}

      {/* ── SIDEBAR ── */}
      {sidebarOpen && (
        <div style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.3)", zIndex:100 }}
          onClick={() => setSidebarOpen(false)}>
          <div style={{ position:"absolute", left:0, top:0, bottom:0, width:260, background:C.white,
            boxShadow:"4px 0 20px rgba(0,0,0,0.1)", display:"flex", flexDirection:"column", overflow:"auto" }}
            onClick={e => e.stopPropagation()}>
            {/* Logo */}
            <div style={{ padding:"22px 20px 18px", borderBottom:"1px solid "+C.border,
              display:"flex", alignItems:"center", gap:12, flexShrink:0 }}>
              <div style={{ width:44, height:44, borderRadius:10, background:"#fff",
                border:"1px solid "+C.border, padding:3, flexShrink:0, display:"flex",
                alignItems:"center", justifyContent:"center" }}>
                <img src={logo} alt="" style={{ width:"100%", height:"100%", borderRadius:7,
                  objectFit:"contain", display:"block" }}/>
              </div>
              <div>
                <p style={{ fontSize:14, fontWeight:800, color:C.textPri }}>Clinique ABC Marouane</p>
                <p style={{ fontSize:12, color:C.textSec }}>Espace médecin chef</p>
              </div>
            </div>
            {/* Nav */}
            <nav style={{ padding:"14px 12px", flex:1 }}>
              {NAV.map(n => (
                <button key={n.id} onClick={() => { setPage(n.id); setSidebarOpen(false) }}
                  style={{ width:"100%", display:"flex", alignItems:"center", gap:12, padding:"11px 12px",
                    borderRadius:12, border:"none", background:page===n.id?C.blueSoft:"transparent",
                    color:page===n.id?C.blue:C.textSec, fontSize:14, fontWeight:page===n.id?700:500,
                    cursor:"pointer", marginBottom:2, fontFamily:"inherit", textAlign:"left" }}
                  onMouseEnter={e => { if(page!==n.id) e.currentTarget.style.background=C.slateSoft }}
                  onMouseLeave={e => { if(page!==n.id) e.currentTarget.style.background="transparent" }}>
                  <span style={{ display:"flex", alignItems:"center", justifyContent:"center", width:26,
                    height:26, borderRadius:6, background:page===n.id?"rgba(37,99,235,0.12)":"transparent",
                    flexShrink:0 }}>{NAV_ICONS[n.icon]}</span>
                  <span style={{ flex:1 }}>{n.label}</span>
                  {n.badge > 0 && (
                    <span style={{ background:C.red, color:"#fff", fontSize:11, fontWeight:700,
                      borderRadius:10, padding:"2px 7px" }}>{n.badge}</span>
                  )}
                </button>
              ))}
            </nav>
            {/* Profil sidebar */}
            <div style={{ padding:"12px 16px 18px", borderTop:"1px solid "+C.border, flexShrink:0 }}>
              <div style={{ display:"flex", alignItems:"center", gap:10, padding:"10px 12px",
                background:C.slateSoft, borderRadius:12, border:"1px solid "+C.slate+"33" }}>
                <div style={{ width:36, height:36, borderRadius:"50%", background:C.slate,
                  display:"flex", alignItems:"center", justifyContent:"center" }}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round">
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
                  </svg>
                </div>
                <div>
                  <p style={{ fontSize:13, fontWeight:700, color:C.textPri }}>{user?.nom || "Dr. Doumbouya"}</p>
                  <p style={{ fontSize:11, color:C.slate, fontWeight:600 }}>Médecin chef · Médecine générale</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── HEADER ── */}
      <header style={{ background:C.white, borderBottom:"1px solid "+C.border, padding:"0 24px",
        height:64, display:"flex", alignItems:"center", justifyContent:"space-between",
        position:"sticky", top:0, zIndex:50, boxShadow:"0 1px 3px rgba(0,0,0,0.05)" }}>
        {/* Hamburger */}
        <button onClick={() => setSidebarOpen(true)}
          style={{ width:40, height:40, borderRadius:8, border:"1px solid "+C.border,
            background:C.white, cursor:"pointer", display:"flex", flexDirection:"column",
            alignItems:"center", justifyContent:"center", gap:5 }}>
          <div style={{ width:20, height:2, background:C.textPri, borderRadius:2 }}/>
          <div style={{ width:20, height:2, background:C.textPri, borderRadius:2 }}/>
          <div style={{ width:20, height:2, background:C.textPri, borderRadius:2 }}/>
        </button>

        {/* Logo */}
        <div style={{ display:"flex", alignItems:"center", gap:10, marginLeft:12,
          paddingRight:20, borderRight:"1px solid "+C.border, flexShrink:0 }}>
          <div style={{ width:38, height:38, borderRadius:9, background:"#fff",
            border:"1px solid "+C.border, padding:3, display:"flex",
            alignItems:"center", justifyContent:"center" }}>
            <img src={logo} alt="" style={{ width:"100%", height:"100%", borderRadius:6,
              objectFit:"contain", display:"block" }}/>
          </div>
          <div>
            <p style={{ fontSize:13, fontWeight:800, color:C.textPri, lineHeight:1.2 }}>Clinique Marouane</p>
            <p style={{ fontSize:11, color:C.textMuted }}>Médecin chef</p>
          </div>
        </div>

        <div style={{ flex:1 }}/>

        {/* Actions header */}
        <div style={{ display:"flex", alignItems:"center", gap:14 }}>
          {enAttente > 0 && (
            <button onClick={() => setPage("consultations")}
              style={{ background:C.slateSoft, border:"1px solid "+C.slate+"44", borderRadius:10,
                padding:"7px 14px", fontSize:12, fontWeight:700, color:C.slate,
                cursor:"pointer", fontFamily:"inherit" }}>
              {enAttente} patient{enAttente > 1 ? "s" : ""} en attente
            </button>
          )}
          <span style={{ fontSize:13, color:C.textSec, fontVariantNumeric:"tabular-nums" }}>{heure}</span>

          {/* Paramètres */}
          <button onClick={() => setShowSettings(true)}
            style={{ width:40, height:40, borderRadius:10, border:"1px solid "+C.border,
              background:C.white, cursor:"pointer", display:"flex", alignItems:"center",
              justifyContent:"center" }}>
            <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke={C.green} strokeWidth="2" strokeLinecap="round">
              <circle cx="12" cy="12" r="3"/>
              <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/>
            </svg>
          </button>

          {/* Pointer arrivée */}
          <button onClick={() => {
              setPointerHeure(new Date().toLocaleTimeString("fr-FR", { hour:"2-digit", minute:"2-digit" }))
              setShowPointer(true)
            }}
            style={{ display:"flex", alignItems:"center", gap:8, padding:"9px 16px",
              borderRadius:10, border:"1.5px solid "+C.green, background:C.white,
              color:C.green, fontSize:13, fontWeight:600, cursor:"pointer", fontFamily:"inherit" }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={C.green} strokeWidth="2.2" strokeLinecap="round">
              <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"/>
              <polyline points="10 17 15 12 10 7"/>
              <line x1="15" y1="12" x2="3" y2="12"/>
            </svg>
            Pointer Arrivée
          </button>

          {/* Profil */}
          <div onClick={() => setShowMonProfil(true)}
            style={{ display:"flex", alignItems:"center", gap:8, cursor:"pointer",
              padding:"4px 8px", borderRadius:8 }}
            onMouseEnter={e => e.currentTarget.style.background = C.slateSoft}
            onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
            <div style={{ textAlign:"right" }}>
              <p style={{ fontSize:14, fontWeight:700, color:C.textPri }}>{user?.nom || "Dr. Doumbouya"}</p>
              <p style={{ fontSize:12, color:C.textSec }}>Médecin chef</p>
            </div>
            <div style={{ width:38, height:38, borderRadius:"50%", background:C.slateSoft,
              border:"2px solid "+C.slate+"33", display:"flex", alignItems:"center",
              justifyContent:"center" }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={C.slate} strokeWidth="2" strokeLinecap="round">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
              </svg>
            </div>
          </div>

          {/* Déconnexion */}
          <button onClick={handleLogout}
            style={{ width:36, height:36, borderRadius:8, border:"1px solid #fca5a5",
              background:"#fff5f5", cursor:"pointer", display:"flex", alignItems:"center",
              justifyContent:"center", flexShrink:0 }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#cc2222" strokeWidth="2" strokeLinecap="round">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
              <polyline points="16 17 21 12 16 7"/>
              <line x1="21" y1="12" x2="9" y2="12"/>
            </svg>
          </button>
        </div>
      </header>

      {/* Paramètres */}
      {showSettings && <SettingsModal onClose={() => setShowSettings(false)} />}

      {/* Modal pointer arrivée */}
      {showPointer && (
        <div style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.4)", zIndex:200,
          display:"flex", alignItems:"center", justifyContent:"center" }}>
          <div style={{ background:C.white, borderRadius:16, padding:32, maxWidth:380, width:"100%",
            textAlign:"center", boxShadow:"0 20px 60px rgba(0,0,0,0.2)" }}>
            <div style={{ width:60, height:60, borderRadius:"50%", background:C.greenSoft,
              margin:"0 auto 16px", display:"flex", alignItems:"center", justifyContent:"center" }}>
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke={C.green} strokeWidth="2" strokeLinecap="round">
                <polyline points="20 6 9 17 4 12"/>
              </svg>
            </div>
            <p style={{ fontSize:18, fontWeight:800, color:C.textPri, marginBottom:8 }}>Arrivée enregistrée</p>
            <p style={{ fontSize:14, color:C.textSec, marginBottom:8 }}>{user?.nom || "Dr. Doumbouya"} · Médecin chef</p>
            <p style={{ fontSize:28, fontWeight:800, color:C.textPri, marginBottom:20 }}>{pointerHeure}</p>
            <p style={{ fontSize:13, color:C.textMuted, marginBottom:24 }}>
              Votre heure d'arrivée est enregistrée et ne peut pas être modifiée.
            </p>
            <button onClick={() => setShowPointer(false)}
              style={{ width:"100%", padding:"12px", background:C.blue, color:"#fff", border:"none",
                borderRadius:10, fontSize:14, fontWeight:600, cursor:"pointer", fontFamily:"inherit" }}>
              Fermer
            </button>
          </div>
        </div>
      )}

      {/* ── CONTENU PRINCIPAL ── */}
      <main style={{ padding:"32px 24px" }}>
        {page === "accueil" && (
          <PageAccueil
            consultations={consultations}
            patients={patients}
            file={file}
            setPage={setPage}
            statsBackend={statsBackend}
          />
        )}

        {page === "consultations" && (
          <PageConsultations
            consultations={consultations}
            patients={patients}
            file={file}
            medecins={medecins}
            onValider={handleValider}
            onModifier={(consultId, data) => updateConsultation(consultId, data)}
            onContinuerConsultation={ouvrirOrdonnance}
            onReprendreConsultation={handleReprendreConsultation}
          />
        )}

        {/* ── MES PATIENTS ── */}
        {page === "mes_patients" && (
          <div style={{ display:"flex", flexDirection:"column", gap:20 }}>
            <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:16 }}>
              <div style={{ background:C.white, border:"1px solid "+C.border, borderRadius:14, padding:"20px" }}>
                <p style={{ fontSize:28, fontWeight:800, color:C.blue, lineHeight:1 }}>{mesPatientsList.length}</p>
                <p style={{ fontSize:12, color:C.textMuted, marginTop:6 }}>Patients suivis (total)</p>
              </div>
              <div style={{ background:C.white, border:"1px solid "+C.border, borderRadius:14, padding:"20px" }}>
                <p style={{ fontSize:28, fontWeight:800, color:C.amber, lineHeight:1 }}>{mesConsultationsEnAttente.length}</p>
                <p style={{ fontSize:12, color:C.textMuted, marginTop:6 }}>Consultations en attente</p>
              </div>
              <div style={{ background:C.white, border:"1px solid "+C.border, borderRadius:14, padding:"20px" }}>
                <p style={{ fontSize:28, fontWeight:800, color:C.green, lineHeight:1 }}>{mesConsultationsSignees.length}</p>
                <p style={{ fontSize:12, color:C.textMuted, marginTop:6 }}>Consultations signées</p>
              </div>
            </div>

            <div style={{ background:C.white, border:"1px solid "+C.border, borderRadius:14, overflow:"hidden" }}>
              <div style={{ padding:"16px 20px", borderBottom:"1px solid "+C.border }}>
                <p style={{ fontSize:15, fontWeight:800, color:C.textPri }}>Mes patients — {mesPatientsList.length}</p>
                <p style={{ fontSize:12, color:C.textMuted }}>Patients ayant au moins une consultation avec vous</p>
              </div>
              {mesPatientsList.length === 0 ? (
                <div style={{ padding:48, textAlign:"center", color:C.textMuted }}>
                  <p>Aucun patient pour le moment</p>
                </div>
              ) : (
                <table style={{ width:"100%", borderCollapse:"collapse" }}>
                  <thead>
                    <tr style={{ background:C.slateSoft }}>
                      {["Patient","Âge","Sexe","Dernière consultation","Statut","Actions"].map(h => (
                        <th key={h} style={{ padding:"11px 16px", textAlign:"left", fontSize:11,
                          fontWeight:700, color:C.textSec, textTransform:"uppercase", letterSpacing:"0.06em" }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {mesPatientsList.map(p => {
                      const lastConsult = mesConsultations.filter(c => Number(c.patientId) === Number(p.id))
                        .sort((a,b) => (b.date||'').localeCompare(a.date||''))[0]
                      return (
                        <tr key={p.id} style={{ borderBottom:"1px solid "+C.border, transition:"background .15s" }}
                          onMouseEnter={e => e.currentTarget.style.background = C.slateSoft}
                          onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
                          <td style={{ padding:"13px 16px" }}>
                            <div style={{ display:"flex", alignItems:"center", gap:10 }}>
                              <div style={{ width:34, height:34, borderRadius:"50%", background:C.blueSoft,
                                display:"flex", alignItems:"center", justifyContent:"center",
                                fontSize:13, fontWeight:800, color:C.blue }}>
                                {p.nom.charAt(0).toUpperCase()}
                              </div>
                              <div>
                                <p style={{ fontSize:13, fontWeight:700, color:C.textPri }}>{p.nom}</p>
                                <p style={{ fontSize:11, color:C.textMuted }}>{p.pid}</p>
                              </div>
                            </div>
                          </td>
                          <td style={{ padding:"13px 16px", fontSize:13, color:C.textSec }}>{calcAge(p.dateNaissance || p.date_naissance)} ans</td>
                          <td style={{ padding:"13px 16px", fontSize:13, color:C.textSec }}>{p.sexe === "F" ? "F" : p.sexe === "M" ? "M" : "—"}</td>
                          <td style={{ padding:"13px 16px", fontSize:13, color:C.textSec }}>
                            {lastConsult ? new Date(lastConsult.date).toLocaleDateString("fr-FR") : "—"}
                          </td>
                          <td style={{ padding:"13px 16px" }}>
                            {lastConsult?.signe
                              ? <span style={{ fontSize:11, fontWeight:700, background:C.greenSoft, color:C.green, padding:"3px 10px", borderRadius:20 }}>Terminé</span>
                              : <span style={{ fontSize:11, fontWeight:700, background:C.amberSoft, color:C.amber, padding:"3px 10px", borderRadius:20 }}>En cours</span>
                            }
                          </td>
                          <td style={{ padding:"13px 16px" }}>
                            <button onClick={() => {
                              const pConsults = mesConsultations.filter(c => Number(c.patientId) === Number(p.id))
                              if (pConsults.length > 0) {
                                const last = pConsults.sort((a,b) => (b.date||'').localeCompare(a.date||''))[0]
                                handleReprendreConsultation(last)
                              }
                            }}
                              style={{ padding:"5px 10px", border:"1px solid "+C.blue+"44", borderRadius:8,
                                background:C.blueSoft, color:C.blue, fontSize:11, fontWeight:600,
                                cursor:"pointer", fontFamily:"inherit" }}>
                              Voir
                            </button>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        )}

        {/* ── MES CONSULTATIONS ── */}
        {page === "mes_consults" && (
          <div style={{ display:"flex", flexDirection:"column", gap:20 }}>
            {/* Onglets */}
            <div style={{ display:"flex", gap:6, padding:4, background:C.slateSoft, borderRadius:14 }}>
              {["Toutes", "En attente", "Signées"].map((tab, i) => {
                const counts = [mesConsultations.length, mesConsultationsEnAttente.length, mesConsultationsSignees.length]
                return (
                  <button key={tab}
                    onClick={() => setPage(i === 0 ? "mes_consults" : i === 1 ? "mes_consults_attente" : "mes_consults_signees")}
                    style={{ flex:1, padding:"10px 16px", border:"none", borderRadius:10, fontSize:13,
                      fontWeight:700, cursor:"pointer", fontFamily:"inherit", transition:"all 0.2s",
                      background: (i === 0 && page === "mes_consults") || page === `mes_consults_${["attente","signees"][i-1]}`
                        ? C.white : "transparent",
                      color: (i === 0 && page === "mes_consults") || page === `mes_consults_${["attente","signees"][i-1]}`
                        ? C.blue : C.textSec,
                      boxShadow: (i === 0 && page === "mes_consults") || page === `mes_consults_${["attente","signees"][i-1]}`
                        ? C.shadowSm : "none" }}>
                    {tab} ({counts[i]})
                  </button>
                )
              })}
            </div>

            <div style={{ background:C.white, border:"1px solid "+C.border, borderRadius:14, overflow:"hidden" }}>
              <div style={{ padding:"16px 20px", borderBottom:"1px solid "+C.border }}>
                <p style={{ fontSize:15, fontWeight:800, color:C.textPri }}>
                  {page === "mes_consults_attente" ? "Consultations en attente" :
                   page === "mes_consults_signees" ? "Consultations signées" :
                   "Toutes mes consultations"}
                </p>
              </div>
              {(() => {
                const filtered = page === "mes_consults_attente" ? mesConsultationsEnAttente :
                                 page === "mes_consults_signees" ? mesConsultationsSignees :
                                 mesConsultations
                if (filtered.length === 0) {
                  return (
                    <div style={{ padding:48, textAlign:"center", color:C.textMuted }}>
                      <p>Aucune consultation</p>
                    </div>
                  )
                }
                return (
                  <table style={{ width:"100%", borderCollapse:"collapse" }}>
                    <thead>
                      <tr style={{ background:C.slateSoft }}>
                        {["Patient","Date","Type","Diagnostic","Examens","Statut","Actions"].map(h => (
                          <th key={h} style={{ padding:"11px 16px", textAlign:"left", fontSize:11,
                            fontWeight:700, color:C.textSec, textTransform:"uppercase", letterSpacing:"0.06em" }}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {filtered.map(c => {
                        const p = patients.find(pt => pt.id === c.patientId)
                        const nbEx = (c.examensCommandes || []).length
                        return (
                          <tr key={c.id} style={{ borderBottom:"1px solid "+C.border, transition:"background .15s" }}
                            onMouseEnter={e => e.currentTarget.style.background = C.slateSoft}
                            onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
                            <td style={{ padding:"13px 16px" }}>
                              <div style={{ display:"flex", alignItems:"center", gap:10 }}>
                                <div style={{ width:34, height:34, borderRadius:"50%", background:C.blueSoft,
                                  display:"flex", alignItems:"center", justifyContent:"center",
                                  fontSize:13, fontWeight:800, color:C.blue }}>
                                  {(p?.nom || "?").charAt(0).toUpperCase()}
                                </div>
                                <div>
                                  <p style={{ fontSize:13, fontWeight:700, color:C.textPri }}>{p?.nom || "—"}</p>
                                  <p style={{ fontSize:11, color:C.textMuted }}>{p?.pid || ""}</p>
                                </div>
                              </div>
                            </td>
                            <td style={{ padding:"13px 16px", fontSize:13, color:C.textSec }}>
                              {c.date ? new Date(c.date).toLocaleDateString("fr-FR") : "—"}
                            </td>
                            <td style={{ padding:"13px 16px" }}>
                              <span style={{ fontSize:11, fontWeight:700, background:C.purpleSoft, color:C.purple,
                                padding:"3px 8px", borderRadius:10 }}>
                                {c.typeConsultation === "prenatal" ? "CPN" :
                                 c.typeConsultation === "accouchement" ? "Accouchement" : "Standard"}
                              </span>
                            </td>
                            <td style={{ padding:"13px 16px", fontSize:12, color:C.textSec, maxWidth:200,
                              overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>
                              {(c.diagnostics || c.diagDefinitif || []).join(", ") || c.diagPresomption || "—" }
                            </td>
                            <td style={{ padding:"13px 16px" }}>
                              {nbEx > 0
                                ? <span style={{ fontSize:11, fontWeight:700, background:C.amberSoft, color:C.amber,
                                  padding:"3px 8px", borderRadius:10 }}>{nbEx} examen(s)</span>
                                : <span style={{ fontSize:11, color:C.textMuted }}>Aucun</span>
                              }
                            </td>
                            <td style={{ padding:"13px 16px" }}>
                              {c.signe
                                ? <span style={{ fontSize:11, fontWeight:700, background:C.greenSoft, color:C.green,
                                  padding:"3px 10px", borderRadius:20 }}>Signée</span>
                                : <span style={{ fontSize:11, fontWeight:700, background:C.amberSoft, color:C.amber,
                                  padding:"3px 10px", borderRadius:20 }}>En attente</span>
                              }
                            </td>
                            <td style={{ padding:"13px 16px" }}>
                              <div style={{ display:"flex", gap:6 }}>
                                {!c.signe && (
                                  <button onClick={() => handleReprendreConsultation(c)}
                                    style={{ padding:"5px 10px", border:"1px solid "+C.blue+"44", borderRadius:8,
                                      background:C.blueSoft, color:C.blue, fontSize:11, fontWeight:600,
                                      cursor:"pointer", fontFamily:"inherit" }}>
                                    Continuer
                                  </button>
                                )}
                                <button onClick={() => ouvrirOrdonnance(c)}
                                  style={{ padding:"5px 10px", border:"1px solid "+C.border, borderRadius:8,
                                    background:C.white, color:C.textSec, fontSize:11, fontWeight:600,
                                    cursor:"pointer", fontFamily:"inherit" }}>
                                  Ordonnance
                                </button>
                              </div>
                            </td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                )
              })()}
            </div>
          </div>
        )}

        {page === "rdv" && (
          <PageRdv
            rdv={rdv}
            patients={patients}
            medecin={medecinChef}
            onCreerRdv={() => setShowCreerRdv(true)}
            onAnnulerRdv={removeRdv}
          />
        )}

        {page === "comptes" && (
          <PageComptes
            comptes={comptes}
            setComptes={setComptes}
            medecins={medecins}
            setMedecins={setMedecins}
            user={user}
          />
        )}

        {page === "presence" && (
          <PagePresence medecins={medecins} />
        )}

        {page === "stats" && (
          <PageStats
            consultations={consultations}
            patients={patients}
            file={file}
          />
        )}

        {page === "historique" && (
          <PageHistorique
            consultations={consultations}
            patients={patients}
            resultatsLabo={resultatsLabo}
            soins={soins}
            rdv={rdv}
          />
        )}
        
        {page === "migrations" && (
          <PageMigrations />
        )}

        {page === "references" && (
          <PageReferencesRecues medecin={medecinChef} />
        )}

        {page === "urgences" && (
          <PageUrgencesTriage />
        )}

        {page === "parametres" && (
          <ParametresClinique />
        )}
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