/* eslint-disable react-refresh/only-export-components */

// ══════════════════════════════════════════════════════
//  UTILITAIRES
// ══════════════════════════════════════════════════════
export function genId(seed) {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ0123456789"
  let result = "ABC-", n = seed * 48271 + 1000003
  for (let i = 0; i < 6; i++) { n = (n*1664525+1013904223)&0x7fffffff; result+=chars[n%chars.length] }
  return result
}
export const today   = () => new Date().toISOString().slice(0,10)
export const nowTime = () => new Date().toLocaleTimeString("fr-FR",{hour:"2-digit",minute:"2-digit"})
export const fmt     = d => d ? new Date(d).toLocaleDateString("fr-FR") : "—"

// ══════════════════════════════════════════════════════
//  DONNÉES MOCK
// ══════════════════════════════════════════════════════
export const PATIENTS_DB = [
  { id:1, pid:genId(1), nom:"Bah Mariama",     age:"34 ans",    dateNaissance:"1990-03-12", sexe:"F", telephone:"+224 622 11 22 33", quartier:"Ratoma",   secteur:"Lansanayah", profession:"Commerçante", responsable:"Mamadou Bah" },
  { id:2, pid:genId(2), nom:"Diallo Ibrahima", age:"52 ans",    dateNaissance:"1972-07-04", sexe:"M", telephone:"+224 628 44 55 66", quartier:"Kaloum",   secteur:"Boulbinet",  profession:"Enseignant",  responsable:"Lui-même"    },
  { id:3, pid:genId(3), nom:"Sow Fatoumata",   age:"1an 3mois", dateNaissance:"2022-11-20", sexe:"F", telephone:"+224 621 77 88 99", quartier:"Dixinn",   secteur:"Yimbayah",   profession:"S/C",          responsable:"Mamadou Sow" },
  { id:4, pid:genId(4), nom:"Kouyaté Mamadou", age:"61 ans",    dateNaissance:"1963-01-15", sexe:"M", telephone:"+224 624 33 44 55", quartier:"Matam",    secteur:"Tannerie",   profession:"Commerçant",  responsable:"Lui-même"    },
  { id:5, pid:genId(5), nom:"Baldé Aissatou",  age:"19 ans",    dateNaissance:"2005-06-08", sexe:"F", telephone:"+224 625 66 77 88", quartier:"Matoto",   secteur:"Gbessia",    profession:"Élève",        responsable:"Mamadou Baldé"},
]

export const DOCTEURS = [
  { id:1, nom:"Dr. Doumbouya", specialite:"Médecine générale",          statut:"present" },
  { id:2, nom:"Dr. Camara",    specialite:"Cardiologie",                 statut:"present" },
  { id:3, nom:"Dr. Barry",     specialite:"Diabétologie / Endocrinologie", statut:"present" },
  { id:4, nom:"Dr. Souaré",    specialite:"Pédiatrie",                   statut:"absent"  },
  { id:5, nom:"Dr. Keïta",     specialite:"Gynécologie",                 statut:"present" },
  { id:6, nom:"Dr. Bah",       specialite:"Ophtalmologie",               statut:"present" },
  { id:7, nom:"Dr. Diallo",    specialite:"Traumatologie",               statut:"present" },
  { id:8, nom:"Dr. Konaté",    specialite:"Neurologie",                  statut:"present" },
  { id:9, nom:"Dr. Traoré",    specialite:"ORL",                         statut:"present" },
]


export function tarifParAge(dateNaissance, s={}) {
  if (!dateNaissance) return s.tarifAdulte || 20000
  const age = Math.floor((Date.now() - new Date(dateNaissance)) / (365.25*24*3600*1000))
  if (age <= 15) return s.tarifEnfant || 15000
  return s.tarifAdulte || 20000
}

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

// ══════════════════════════════════════════════════════
//  COMPOSANTS DE BASE
// ══════════════════════════════════════════════════════
export function Badge({ statut }) {
  const cfg = {
    en_attente:{ label:"En attente",  color:C.slate,  bg:C.slateSoft },
    en_salle:  { label:"En salle",    color:C.green,  bg:C.greenSoft, pulse:true },
    consultation:{label:"Consultation",color:C.green,  bg:C.greenSoft },
    rendez_vous: {label:"Rendez-vous", color:C.purple, bg:C.purpleSoft},
    parti:     { label:"Parti",       color:C.slate,  bg:C.slateSoft },
    paye:      { label:"Payé",        color:C.green,  bg:C.greenSoft },
    partiel:   { label:"Partiel",     color:C.slate,  bg:C.slateSoft },
    impaye:    { label:"Impayé",      color:C.red,    bg:C.redSoft   },
  }
  const s = cfg[statut]||cfg.en_attente
  return (
    <span style={{ display:"inline-flex", alignItems:"center", gap:5, background:s.bg, color:s.color, fontSize:12, fontWeight:600, padding:"4px 12px", borderRadius:20, border:"1px solid "+s.color+"33", whiteSpace:"nowrap" }}>
      {s.pulse&&<span style={{ width:5,height:5,borderRadius:"50%",background:s.color,animation:"blink 2s ease-in-out infinite" }}/>}
      {s.label}
    </span>
  )
}

export function Avatar({ name, size=36 }) {
  const bgs=[C.blueSoft,C.greenSoft,C.purpleSoft,C.slateSoft,C.orangeSoft]
  const fgs=[C.blue,C.green,C.purple,C.slate,C.orange]
  const i=(name?.charCodeAt(0)||0)%bgs.length
  return (
    <div style={{ width:size,height:size,borderRadius:"50%",background:bgs[i],display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0 }}>
      <svg width={size*.42} height={size*.42} viewBox="0 0 24 24" fill="none" stroke={fgs[i]} strokeWidth="2" strokeLinecap="round">
        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
      </svg>
    </div>
  )
}
export function Card({ children, style={} }) {
  return <div style={{ background:C.white,borderRadius:16,border:"1px solid "+C.border,boxShadow:"0 1px 3px rgba(0,0,0,0.06)",...style }}>{children}</div>
}
export function CardHeader({ title, action }) {
  return (
    <div style={{ padding:"16px 20px",borderBottom:"1px solid "+C.border,display:"flex",justifyContent:"space-between",alignItems:"center" }}>
      <p style={{ fontWeight:700,fontSize:15,color:C.textPri }}>{title}</p>
      {action}
    </div>
  )
}
export function Btn({ children, onClick, variant="primary", small=false, disabled=false }) {
  const cfg={ primary:{bg:C.blue,hov:"#155e8b",color:"#fff",border:"none"}, success:{bg:C.green,hov:"#166534",color:"#fff",border:"none"}, secondary:{bg:"transparent",hov:C.slateSoft,color:C.textSec,border:"1px solid "+C.border} }
  const s=cfg[variant]||cfg.primary
  return (
    <button onClick={onClick} disabled={disabled}
      style={{ background:s.bg,color:s.color,border:s.border||"none",borderRadius:10,padding:small?"7px 14px":"10px 20px",fontSize:small?12:13,fontWeight:600,cursor:disabled?"not-allowed":"pointer",display:"inline-flex",alignItems:"center",gap:6,fontFamily:"inherit",transition:"all .2s",opacity:disabled?.55:1 }}
      onMouseEnter={e=>{ if(!disabled) e.currentTarget.style.background=s.hov }}
      onMouseLeave={e=>{ if(!disabled) e.currentTarget.style.background=s.bg }}
    >{children}</button>
  )
}
