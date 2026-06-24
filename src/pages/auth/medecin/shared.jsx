/* eslint-disable react-refresh/only-export-components */

// ══════════════════════════════════════════════════════
//  UTILITAIRES
// ══════════════════════════════════════════════════════
export const today   = () => new Date().toISOString().slice(0, 10)
export const fmt     = d => d ? new Date(d).toLocaleDateString("fr-FR") : "—"
export const calcAge = d => { if (!d) return 0; return Math.floor((Date.now() - new Date(d)) / (365.25 * 864e5)) }

// ══════════════════════════════════════════════════════
//  DONNÉES
// ══════════════════════════════════════════════════════
export const SYMPTOMES_DIAGNOSTICS = {
  "Douleur thoracique": ["Infarctus", "Angine de poitrine", "Péricardite", "Embolie pulmonaire"],
  "Palpitations":       ["Tachycardie", "Fibrillation auriculaire", "Anxiété", "Hyperthyroïdie"],
  "Essoufflement":      ["Insuffisance cardiaque", "Asthme", "Embolie pulmonaire", "Anémie"],
  "Fièvre":             ["Infection bactérienne", "Infection virale", "Paludisme", "COVID-19"],
  "Nausées":            ["Grossesse", "Gastro-entérite", "Migraine", "Insuffisance hépatique"],
  "Douleur abdominale": ["Appendicite", "Cholécystite", "Ulcère", "Colique néphrétique"],
  "Toux":               ["Bronchite", "Pneumonie", "Asthme", "COVID-19"],
  "Maux de tête":       ["Migraine", "Hypertension", "Méningite", "Glaucome"],
}

export const PATHOLOGIES_COMMUNES = [
  "Hypertension", "Diabète", "Asthme", "Paludisme", "Infection urinaire",
  "Grippe", "Bronchite", "Gastro-entérite", "Migraine", "Anémie",
  "Dépression", "Anxiété", "Arthrose", "Allergie", "Dermatite",
]

export const EXAMENS_PAR_CATEGORIE = {
  "Laboratoire": [
    { nom:"NFS (numération formule sanguine)", prix:25000 },
    { nom:"Glycémie à jeun", prix:15000 },
    { nom:"Bilan rénal (créatinine, urée)", prix:30000 },
    { nom:"Bilan rénal (créatinine)", prix:30000 },
    { nom:"Bilan hépatique (ASAT, ALAT, GGT)", prix:35000 },
    { nom:"Groupe sanguin / Rhésus", prix:10000 },
    { nom:"HIV (sérologie)", prix:20000 },
    { nom:"TPHA / VDRL (syphilis)", prix:20000 },
    { nom:"Goutte épaisse / TDR paludisme", prix:15000 },
    { nom:"ECBU (examen cytobactériologique)", prix:25000 },
    { nom:"Coproculture", prix:20000 },
    { nom:"CRP (protéine C-réactive)", prix:20000 },
    { nom:"VS (vitesse de sédimentation)", prix:10000 },
    { nom:"Hémoculture", prix:30000 },
    { nom:"Test de grossesse (β-hCG)", prix:15000 },
    { nom:"Uricémie (acide urique)", prix:15000 },
    { nom:"Lipidogramme (cholestérol total, HDL, LDL, TG)", prix:35000 },
    { nom:"PSA (prostate)", prix:30000 },
    { nom:"CA-125 (marqueur ovarien)", prix:40000 },
    { nom:"ACE (marqueur colorectal)", prix:35000 },
  ],
  "Imagerie": [
    { nom:"Radiographie pulmonaire", prix:40000 },
    { nom:"Radiographie abdominale (ASP)", prix:35000 },
    { nom:"Échographie abdominale", prix:60000 },
    { nom:"Échographie pelvienne", prix:60000 },
    { nom:"Échographie obstétricale", prix:70000 },
    { nom:"Échographie cardiaque (écho cœur)", prix:80000 },
    { nom:"Scanner (TDM) cérébral", prix:150000 },
    { nom:"Scanner thoracique", prix:150000 },
    { nom:"Scanner abdominal", prix:150000 },
    { nom:"IRM cérébrale", prix:250000 },
    { nom:"IRM lombaire / colonne", prix:250000 },
  ],
  "Cardiologie": [
    { nom:"ECG (électrocardiogramme)", prix:20000 },
    { nom:"Holter ECG 24h", prix:80000 },
    { nom:"Échocardiographie doppler", prix:100000 },
    { nom:"Épreuve d'effort", prix:70000 },
  ],
  "Neurologie": [
    { nom:"EEG (électroencéphalogramme)", prix:60000 },
    { nom:"Ponction lombaire", prix:50000 },
    { nom:"EMG (électromyogramme)", prix:80000 },
  ],
  "Gynécologie / Obstétrique": [
    { nom:"Frottis cervico-vaginal (FCV)", prix:30000 },
    { nom:"Colposcopie", prix:60000 },
    { nom:"HSG (hystérosalpingographie)", prix:80000 },
    { nom:"Biopsie endomètre", prix:50000 },
  ],
  "ORL": [
    { nom:"Audiogramme", prix:40000 },
    { nom:"Tympanogramme", prix:25000 },
    { nom:"Nasofibroscopie", prix:50000 },
  ],
  "Ophtalmologie": [
    { nom:"Fond d'œil", prix:30000 },
    { nom:"Champ visuel", prix:40000 },
    { nom:"Mesure pression oculaire (tonomètrie)", prix:20000 },
    { nom:"OCT rétine", prix:80000 },
  ],
  "Dermatologie": [
    { nom:"Biopsie cutanée", prix:50000 },
    { nom:"Examen mycologique (champignons)", prix:25000 },
    { nom:"Dermoscopie", prix:30000 },
  ],
  "Stomatologie / Dentaire": [
    { nom:"Panoramique dentaire", prix:50000 },
    { nom:"Radiographie dentaire rétro-alvéolaire", prix:20000 },
  ],
  "Oncologie": [
    { nom:"Biopsie tissulaire (anapath)", prix:80000 },
    { nom:"Marqueurs tumoraux panel", prix:70000 },
    { nom:"PET-scan (TEP)", prix:500000 },
  ],
  "Maladies infectieuses": [
    { nom:"Sérologie Hépatite B (AgHBs, Anti-HBs)", prix:25000 },
    { nom:"Sérologie Hépatite C", prix:25000 },
    { nom:"PCR COVID-19", prix:80000 },
    { nom:"Antibiogramme", prix:30000 },
    { nom:"Frottis sanguin (parasitologie)", prix:15000 },
  ],
}

export const TYPE_CONSULT_LABEL = {
  standard:     { label:"Consultation standard",        short:"Standard" },
  prenatal:     { label:"Consultation prénatale (CPN)", short:"CPN"      },
  accouchement: { label:"Registre d'accouchement",      short:"Accouch." },
}

export const isGynecoObst = (sp) => /gynécologie|obstétrique/i.test(sp || "")



// ══════════════════════════════════════════════════════
//  COULEURS
// ══════════════════════════════════════════════════════
export const C = {
  bg:"#f7f9f8",      white:"#ffffff",
  textPri:"#111827", textSec:"#374151", textMuted:"#6b7280",
  border:"#e2ebe4",
  green:"#16a34a",   greenSoft:"#dcfce7",  greenDark:"#15803d", greenLight:"#bbf7d0",
  blue:"#1d6fa4",    blueSoft:"#e8f4fb",
  amber:"#b45309",   amberSoft:"#fef3c7",
  red:"#dc2626",     redSoft:"#fef2f2",
  slate:"#475569",   slateSoft:"#f1f5f9",
  purple:"#6d28d9",  purpleSoft:"#ede9fe",
  orange:"#c2410c",  orangeSoft:"#fff7ed",
  teal:"#0f766e",    tealSoft:"#f0fdfa",
}

export function TypeConsultBadge({ type }) {
  const t = TYPE_CONSULT_LABEL[type] || TYPE_CONSULT_LABEL.standard
  return (
    <span style={{ display:"inline-flex", alignItems:"center", gap:4, fontSize:11, fontWeight:700, padding:"2px 8px", borderRadius:8, background:C.purpleSoft, color:C.purple, border:"1px solid "+C.purple+"33" }} title={t.label}>
      {t.short}
    </span>
  )
}

export function RdvBadge({ patient }) {
  if (patient.typeVisite !== "rendez_vous") return null
  return (
    <span style={{ fontSize:11, fontWeight:700, background:C.blueSoft, color:C.textPri, padding:"2px 8px", borderRadius:8, border:"1px solid "+C.blue+"33" }} title={patient.motifRdv || "Rendez-vous"}>
      RDV
    </span>
  )
}

// ══════════════════════════════════════════════════════
//  COMPOSANTS DE BASE
// ══════════════════════════════════════════════════════
export function Badge({ statut }) {
  const cfg = {
    en_attente: { label:"En attente",  color:C.slate, bg:C.slateSoft },
    en_salle:   { label:"En salle",    color:C.green, bg:C.greenSoft, pulse:true },
    termine:    { label:"Terminé",     color:C.slate, bg:C.slateSoft },
    signe:      { label:"Signé",     color:C.green, bg:C.greenSoft },
    non_signe:  { label:"Non signé", color:C.red,   bg:C.redSoft   },
  }
  const s = cfg[statut] || cfg.en_attente
  return (
    <span style={{ display:"inline-flex", alignItems:"center", gap:5, background:s.bg, color:s.color, fontSize:12, fontWeight:600, padding:"4px 12px", borderRadius:20, border:"1px solid "+s.color+"33", whiteSpace:"nowrap" }}>
      {s.pulse && <span style={{ width:5, height:5, borderRadius:"50%", background:s.color, animation:"blink 2s ease-in-out infinite" }} />}
      {s.label}
    </span>
  )
}

export function Avatar({ name, size=36, bg }) {
  const bgs = [C.blueSoft,C.greenSoft,C.purpleSoft,C.slateSoft,C.orangeSoft]
  const fgs = [C.blue,C.green,C.purple,C.slate,C.orange]
  const i   = (name?.charCodeAt(0)||0) % bgs.length
  return (
    <div style={{ width:size, height:size, borderRadius:"50%", background:bg||bgs[i], display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>
      <svg width={size*.42} height={size*.42} viewBox="0 0 24 24" fill="none" stroke={bg?"#fff":fgs[i]} strokeWidth="2" strokeLinecap="round">
        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
      </svg>
    </div>
  )
}

export function Card({ children, style={} }) {
  return <div style={{ background:C.white, borderRadius:16, border:"1px solid "+C.border, boxShadow:"0 1px 3px rgba(0,0,0,0.06)", ...style }}>{children}</div>
}

export function CardHeader({ title, sub, action }) {
  return (
    <div style={{ padding:"16px 20px", borderBottom:"1px solid "+C.border, display:"flex", justifyContent:"space-between", alignItems:"center" }}>
      <div>
        <p style={{ fontWeight:700, fontSize:15, color:C.textPri, marginBottom:sub?2:0 }}>{title}</p>
        {sub && <p style={{ fontSize:12, color:C.textMuted }}>{sub}</p>}
      </div>
      {action}
    </div>
  )
}

export function Btn({ children, onClick, variant="primary", small=false, disabled=false, full=false }) {
  const cfg = {
    primary:  { bg:C.blue,  hov:"#155e8b", color:"#fff", border:"none" },
    success:  { bg:C.green, hov:"#166534", color:"#fff", border:"none" },
    danger:   { bg:C.red,   hov:"#b91c1c", color:"#fff", border:"none" },
    secondary:{ bg:"transparent", hov:C.slateSoft, color:C.textSec, border:"1px solid "+C.border },
  }
  const s = cfg[variant]||cfg.primary
  return (
    <button onClick={onClick} disabled={disabled}
      style={{ background:s.bg, color:s.color, border:s.border||"none", borderRadius:10, padding:small?"7px 16px":"10px 20px", fontSize:small?12:13, fontWeight:600, cursor:disabled?"not-allowed":"pointer", display:"inline-flex", alignItems:"center", gap:6, fontFamily:"inherit", transition:"all .2s", opacity:disabled?.55:1, width:full?"100%":"auto", justifyContent:full?"center":"flex-start" }}
      onMouseEnter={e=>{ if(!disabled) e.currentTarget.style.background=s.hov }}
      onMouseLeave={e=>{ if(!disabled) e.currentTarget.style.background=s.bg }}
    >{children}</button>
  )
}

export const inputSt = { width:"100%", padding:"10px 14px", fontSize:14, border:"1.5px solid "+C.border, borderRadius:10, background:C.white, color:C.textPri, outline:"none", fontFamily:"inherit", resize:"vertical" }
export const labelSt = { display:"block", fontSize:12, fontWeight:600, color:C.textSec, marginBottom:6 }

/** Aligné sur le registre papier « Registre de consultation prénatale » */
export const PRENATAL_DEFAULT = {
  ddr: "", termeSA: "", gestiteParite: "", dateRdv: "",
  visiteCpn: "", risque: "", tailleCm: "",
  poids: "", ta: "", hu: "",
  bcf: "", maf: "",
  presentation: "",
  albumine: "", sucre: "",
  vat: "", fer: "", acideFolique: "", tpi: "", miiMild: "",
  ptmeConseil: "", ptmeTest: "", ptmeResultat: "", ptmeArv: "", ptmePartenaire: "",
  constatsProblemes: "", notesCpn: "",
}

/** Aligné sur le registre « Registre de l'accouchement dans les CS » */
export const ACCOUCH_DEFAULT = {
  dateAcc: "", heureAcc: "",
  dateSortie: "", joursHospitalisation: "", sangPerduMl: "",
  dernierNeVivant: "", avantDernierNeVivant: "", vatMere: "",
  voie: "", sexeNN: "", poidsNN: "", tailleNN: "", pc: "",
  apgar1: "", apgar5: "", apgar10: "",
  modeSortie: "", soinCordon: "", miseAuSein1h: "", soinYeux: "", vitamineK1: "",
  vpo0: "", bcg: "",
  etatSortieMere: "", etatSortieEnfant: "",
  partogramme: "", personnelQualifie: "",
  complicationsMere: "", notes: "",
}

export function mergePrenatalInit(dp) {
  return {
    ...PRENATAL_DEFAULT,
    ...dp,
    termeSA: dp.terme || dp.termeSA || PRENATAL_DEFAULT.termeSA,
    gestiteParite: dp.gestiteParite || dp.parite || PRENATAL_DEFAULT.gestiteParite,
  }
}

export function mergeAccouchInit(da) {
  const parts = da.apgar ? String(da.apgar).split(/[/\s]+/).filter(Boolean) : []
  return {
    ...ACCOUCH_DEFAULT,
    ...da,
    apgar1: da.apgar1 || parts[0] || "",
    apgar5: da.apgar5 || parts[1] || "",
    apgar10: da.apgar10 || parts[2] || "",
  }
}

export function RegSection({ title, children }) {
  return (
    <div style={{ marginBottom:16 }}>
      <p style={{ fontSize:11, fontWeight:700, color:C.textPri, textTransform:"uppercase", letterSpacing:"0.06em", marginBottom:10, borderBottom:"1px solid "+C.border, paddingBottom:6 }}>{title}</p>
      {children}
    </div>
  )
}
