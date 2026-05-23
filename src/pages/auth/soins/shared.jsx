/* eslint-disable react-refresh/only-export-components */
import { useState, useEffect } from "react"

// ══════════════════════════════════════════════════════
//  UTILITAIRES
// ══════════════════════════════════════════════════════
export const today = () => new Date().toISOString().slice(0, 10)
export const getNowTime = () => new Date().toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })
export const getAge = (dateNaissance) => {
  const diff = Date.now() - new Date(dateNaissance).getTime()
  return Math.floor(diff / (1000 * 60 * 60 * 24 * 365.25))
}

// ══════════════════════════════════════════════════════
//  DONNÉES DE DÉMONSTRATION
// ══════════════════════════════════════════════════════
export const PATIENTS_DB = [
  { id: 1, pid: "ABC-A1B2C3", nom: "Bah Mariama",     dateNaissance: "1990-03-12", sexe: "F", telephone: "+224 622 11 22 33" },
  { id: 2, pid: "ABC-D4E5F6", nom: "Diallo Ibrahima", dateNaissance: "1972-07-04", sexe: "M", telephone: "+224 628 44 55 66" },
  { id: 3, pid: "ABC-G7H8I9", nom: "Sow Fatoumata",   dateNaissance: "1996-11-20", sexe: "F", telephone: "+224 621 77 88 99" },
  { id: 4, pid: "ABC-J1K2L3", nom: "Kouyaté Mamadou", dateNaissance: "1963-01-15", sexe: "M", telephone: "+224 624 33 44 55" },
  { id: 5, pid: "ABC-M4N5O6", nom: "Baldé Aissatou",  dateNaissance: "2018-06-08", sexe: "F", telephone: "+224 625 66 77 88" },
]

export const TYPES_SOINS = [
  "Injection IM", "Injection IV", "Injection SC", "Perfusion",
  "Pansement", "Suture", "Retrait de points", "Prise de sang",
  "Sondage", "Oxygénothérapie", "Aspiration", "Nébulisation",
  "Électrocardiogramme", "Surveillance tension", "Autre"
]

export const ZONES_ADMIN = [
  "Bras droit", "Bras gauche", "Main droite", "Main gauche",
  "Avant-bras droit", "Avant-bras gauche", "Cuisse droite", "Cuisse gauche",
  "Fesse droite", "Fesse gauche", "Abdomen", "Dos", "Autre"
]

export const INFIRMIERS = ["Mme. Diallo", "M. Camara", "Mme. Bah", "M. Kouyaté"]

export const SOINS_INIT = [
  {
    id: 1, patientId: 1, patient: PATIENTS_DB[0], date: today(), heure: "08:30",
    typeSoin: "Injection IM", zone: "Fesse droite", medicament: "Paracétamol 1g",
    dose: "1 ampoule", voie: "Intramusculaire",
    infirmier: "Mme. Diallo", observations: "Bien toléré", tolerance: "bonne",
    statut: "fait", dateProgrammee: today(), heureProgrammee: "08:30", urgent: false
  },
  {
    id: 2, patientId: 2, patient: PATIENTS_DB[1], date: today(), heure: "09:15",
    typeSoin: "Perfusion", zone: "Avant-bras gauche", medicament: "Sérum physiologique 500ml",
    dose: "500 ml", voie: "Intraveineuse",
    infirmier: "M. Camara", observations: "Débit 20 gouttes/min", tolerance: "bonne",
    statut: "en_cours", dateProgrammee: today(), heureProgrammee: "09:00", urgent: false
  },
  {
    id: 3, patientId: 3, patient: PATIENTS_DB[2], date: today(), heure: "10:00",
    typeSoin: "Pansement", zone: "Abdomen", medicament: "Bétadine, compresses",
    dose: "1 pansement", voie: "Local",
    infirmier: "—", observations: "Plaie propre, pas de signes d'infection", tolerance: null,
    statut: "programme", dateProgrammee: today(), heureProgrammee: "10:00", urgent: false
  },
  {
    id: 4, patientId: 4, patient: PATIENTS_DB[3], date: today(), heure: "10:30",
    typeSoin: "Prise de sang", zone: "Pli du coude gauche", medicament: "—",
    dose: "3 tubes", voie: "Veineuse",
    infirmier: "—", observations: "Bilan glycémique + NFS", tolerance: null,
    statut: "programme", dateProgrammee: today(), heureProgrammee: "10:30", urgent: true
  },
  {
    id: 5, patientId: 5, patient: PATIENTS_DB[4], date: today(), heure: "11:00",
    typeSoin: "Électrocardiogramme", zone: "Thorax", medicament: "—",
    dose: "—", voie: "—",
    infirmier: "—", observations: "Contrôle routine", tolerance: null,
    statut: "retarde", dateProgrammee: today(), heureProgrammee: "10:00", urgent: false
  },
]

// ══════════════════════════════════════════════════════
//  COULEURS (unifié avec les autres dashboards)
// ══════════════════════════════════════════════════════
export const C = {
  bg:"#f7f9f8",      white:"#ffffff",
  textPri:"#111827", textSec:"#374151", textMuted:"#6b7280",
  border:"#e2ebe4",
  green:"#16a34a",   greenSoft:"#dcfce7",  greenDark:"#15803d", greenLight:"#bbf7d0",
  blue:"#1d6fa4",    blueSoft:"#e8f4fb",   blueDark:"#155e8b",
  amber:"#b45309",   amberSoft:"#fef3c7",
  red:"#dc2626",     redSoft:"#fef2f2",
  slate:"#475569",   slateSoft:"#f1f5f9",
  purple:"#6d28d9",  purpleSoft:"#ede9fe",
  orange:"#c2410c",  orangeSoft:"#fff7ed",
  teal:"#0f766e",    tealSoft:"#f0fdfa",
}

// ══════════════════════════════════════════════════════
//  BADGE STATUT
// ══════════════════════════════════════════════════════
export function Badge({ statut }) {
  const cfg = {
    programme: { label: "Programmé",  color: C.blue,   bg: C.blueSoft   },
    en_cours:  { label: "En cours",   color: C.slate,  bg: C.slateSoft  },
    fait:      { label: "Réalisé",    color: C.green,  bg: C.greenSoft  },
    retarde:   { label: "Retardé",    color: C.red,    bg: C.redSoft    },
    annule:    { label: "Annulé",     color: C.slate,  bg: C.slateSoft  },
  }
  const s = cfg[statut] || { label: statut, color: C.slate, bg: C.slateSoft }
  return (
    <span style={{
      display: "inline-flex", alignItems: "center", gap: 6,
      background: s.bg, color: s.color, fontSize: 11, fontWeight: 700,
      padding: "4px 10px", borderRadius: 20, border: "1px solid " + s.color + "33"
    }}>
      <span style={{ width: 6, height: 6, borderRadius: "50%", background: s.color, flexShrink: 0 }} />
      {s.label}
    </span>
  )
}

// ══════════════════════════════════════════════════════
//  AVATAR
// ══════════════════════════════════════════════════════
export function Avatar({ name, size = 36 }) {
  const palettes = [
    { bg: "#e8f5ec", fg: "#2d7a3f" }, { bg: "#dcfce7", fg: "#16a34a" },
    { bg: "#d8eed8", fg: "#1a4a25" }, { bg: "#eeeeee", fg: "#444444" },
    { bg: "#ccfbf1", fg: "#0d9488" },
  ]
  const p = palettes[(name?.charCodeAt(0) || 0) % palettes.length]
  const initials = name?.split(" ").map(w => w[0]).slice(0, 2).join("").toUpperCase() || "?"
  return (
    <div style={{
      width: size, height: size, borderRadius: "50%",
      background: p.bg, color: p.fg,
      display: "flex", alignItems: "center", justifyContent: "center",
      fontSize: size * 0.35, fontWeight: 800, flexShrink: 0,
      border: "2px solid " + p.fg + "30"
    }}>
      {initials}
    </div>
  )
}

// ══════════════════════════════════════════════════════
//  BOUTON
// ══════════════════════════════════════════════════════
export function Btn({ children, onClick, variant = "primary", small = false, disabled = false, style: customStyle = {} }) {
  const [hov, setHov] = useState(false)
  const cfg = {
    primary:   { bg: C.blue,  hov: C.blueDark,  color: "#fff" },
    success:   { bg: C.green, hov: C.greenDark,  color: "#fff" },
    secondary: { bg: C.white, hov: C.slateSoft,  color: C.textSec, border: "1.5px solid " + C.border },
    danger:    { bg: C.red,   hov: "#b91c1c",    color: "#fff" },
    warning:   { bg: C.slate, hov: "#b45309",    color: "#fff" },
    ghost:     { bg: "transparent", hov: C.slateSoft, color: C.textSec },
  }
  const s = cfg[variant] || cfg.primary
  return (
    <button onClick={onClick} disabled={disabled}
      onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}
      style={{
        background: hov && !disabled ? s.hov : s.bg,
        color: s.color, border: s.border || "none", borderRadius: 10,
        padding: small ? "6px 14px" : "9px 18px",
        fontSize: small ? 12 : 13, fontWeight: 600,
        cursor: disabled ? "not-allowed" : "pointer",
        display: "inline-flex", alignItems: "center", gap: 6,
        fontFamily: "inherit", transition: "all .15s",
        opacity: disabled ? 0.5 : 1, whiteSpace: "nowrap", ...customStyle
      }}>
      {children}
    </button>
  )
}

// ══════════════════════════════════════════════════════
//  OVERLAY / MODAL WRAPPER
// ══════════════════════════════════════════════════════
export function Overlay({ children, onClose }) {
  useEffect(() => {
    const handler = (e) => { if (e.key === "Escape") onClose() }
    window.addEventListener("keydown", handler)
    return () => window.removeEventListener("keydown", handler)
  }, [onClose])
  return (
    <div style={{
      position: "fixed", inset: 0, background: "rgba(15,23,42,0.55)",
      zIndex: 300, display: "flex", alignItems: "center",
      justifyContent: "center", padding: 20, backdropFilter: "blur(4px)"
    }} onClick={e => { if (e.target === e.currentTarget) onClose() }}>
      {children}
    </div>
  )
}

// ══════════════════════════════════════════════════════
//  HELPERS UI
// ══════════════════════════════════════════════════════
export function CloseBtn({ onClose }) {
  return (
    <button onClick={onClose} style={{
      background: C.slateSoft, border: "none", borderRadius: 8,
      color: C.textSec, cursor: "pointer", width: 32, height: 32,
      display: "flex", alignItems: "center", justifyContent: "center",
      fontSize: 18, fontFamily: "inherit", flexShrink: 0
    }}><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg></button>
  )
}
export function Field({ label, children, required }) {
  return (
    <div>
      <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: C.textPri, marginBottom: 6 }}>
        {label} {required && <span style={{ color: C.red }}>*</span>}
      </label>
      {children}
    </div>
  )
}
export function Input({ value, onChange, placeholder, type = "text" }) {
  return <input type={type} value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} style={inputStyle()} />
}
export function Select({ value, onChange, children, placeholder }) {
  return (
    <select value={value} onChange={e => onChange(e.target.value)} style={inputStyle()}>
      {placeholder && <option value="">{placeholder}</option>}
      {children}
    </select>
  )
}
export function inputStyle() {
  return {
    width: "100%", padding: "10px 14px", fontSize: 14,
    border: "1.5px solid " + C.border, borderRadius: 10,
    background: C.white, color: C.textPri,
    outline: "none", fontFamily: "inherit", transition: "border-color .15s"
  }
}
export function PatientBanner({ patient }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "14px 16px", borderRadius: 12, background: C.slateSoft, border: "1px solid " + C.border }}>
      <Avatar name={patient.nom} size={44} />
      <div>
        <p style={{ fontSize: 15, fontWeight: 700, color: C.textPri }}>{patient.nom}</p>
        <p style={{ fontSize: 12, color: C.textMuted }}>{patient.pid} · {getAge(patient.dateNaissance)} ans · {patient.sexe === "F" ? "Femme" : "Homme"}</p>
        <p style={{ fontSize: 12, color: C.textMuted }}>{patient.telephone}</p>
      </div>
    </div>
  )
}
export function InfoGrid({ soin }) {
  const items = [
    { label: "Type de soin", val: soin.typeSoin },
    { label: "Zone", val: soin.zone || "—" },
    { label: "Médicament", val: soin.medicament || "—" },
    { label: "Dose", val: soin.dose || "—" },
    { label: "Voie", val: soin.voie || "—" },
    { label: "Heure prévue", val: soin.heureProgrammee || soin.heure },
  ]
  return (
    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginTop: 4 }}>
      {items.map(it => (
        <div key={it.label} style={{ padding: "10px 14px", background: C.slateSoft, borderRadius: 10 }}>
          <p style={{ fontSize: 11, color: C.textMuted, marginBottom: 3, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.06em" }}>{it.label}</p>
          <p style={{ fontSize: 13, fontWeight: 600, color: C.textPri }}>{it.val}</p>
        </div>
      ))}
    </div>
  )
}
