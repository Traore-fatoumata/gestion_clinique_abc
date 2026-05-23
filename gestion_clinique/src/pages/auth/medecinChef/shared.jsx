/* eslint-disable react-refresh/only-export-components */
// ── Utilitaires ──────────────────────────────────────
export const today = () => new Date().toISOString().slice(0, 10)
export const fmt   = d => d ? new Date(d).toLocaleDateString("fr-FR") : "—"

export const SERVICES = [
  "Accueil","Ophtalmologie","ORL","Laboratoire","Pharmacie","Pédiatrie",
  "Médecine générale","Traumatologie","Gynécologie","Cardiologie",
  "Neurologie","Urologie","Chirurgie","Diabétologie / Endocrinologie",
  "Dermatologie","Oncologie","Maladies infectieuses","Stomatologie",
]

export const ROLES_LABEL = { secretaire:"Secrétaire", medecin:"Médecin", infirmier:"Infirmier", pharmacien:"Pharmacien", laborantin:"Laborantin" }

// ── Données initiales ────────────────────────────────
export const INIT_MEDECINS = [
  { id:1,  nom:"Dr. Amadou Doumbouya", prenom:"Amadou",   specialite:"Médecine générale",             email:"doumbouya@cab.gn", telephone:"+224 622 00 01 01", estChef:true,  statut:"actif", creeLe:"2024-01-05" },
  { id:2,  nom:"Dr. Camara",    prenom:"Ibrahima",  specialite:"Cardiologie",                   email:"camara@cab.gn",    telephone:"+224 622 00 02 02", estChef:false, statut:"actif", creeLe:"2024-01-05" },
  { id:3,  nom:"Dr. Barry",     prenom:"Mamadou",   specialite:"Diabétologie / Endocrinologie", email:"barry@cab.gn",     telephone:"+224 622 00 03 03", estChef:false, statut:"actif", creeLe:"2024-02-10" },
  { id:4,  nom:"Dr. Souaré",    prenom:"Fatoumata", specialite:"Pédiatrie",                     email:"souare@cab.gn",    telephone:"+224 622 00 04 04", estChef:false, statut:"actif", creeLe:"2024-03-01" },
  { id:5,  nom:"Dr. Keïta",     prenom:"Sekou",     specialite:"Gynécologie",                   email:"keita@cab.gn",     telephone:"+224 622 00 05 05", estChef:false, statut:"actif", creeLe:"2024-03-15" },
  { id:6,  nom:"Dr. Bah",       prenom:"Fatoumata", specialite:"Ophtalmologie",                 email:"bah@cab.gn",       telephone:"+224 622 00 06 06", estChef:false, statut:"actif", creeLe:"2024-04-01" },
  { id:7,  nom:"Dr. Diallo",    prenom:"Ousmane",   specialite:"Traumatologie",                 email:"diallo@cab.gn",    telephone:"+224 622 00 07 07", estChef:false, statut:"actif", creeLe:"2024-04-15" },
  { id:8,  nom:"Dr. Konaté",    prenom:"Ibrahima",  specialite:"Neurologie",                    email:"konate@cab.gn",    telephone:"+224 622 00 08 08", estChef:false, statut:"actif", creeLe:"2024-05-01" },
  { id:9,  nom:"Dr. Traoré",    prenom:"Aminata",   specialite:"ORL",                           email:"traore@cab.gn",    telephone:"+224 622 00 09 09", estChef:false, statut:"actif", creeLe:"2024-05-15" },
  { id:10, nom:"Dr. Baldé",     prenom:"Mamadou",   specialite:"Urologie",                      email:"balde@cab.gn",     telephone:"+224 622 00 10 10", estChef:false, statut:"actif", creeLe:"2024-06-01" },
  { id:11, nom:"Dr. Condé",     prenom:"Mariama",   specialite:"Chirurgie",             email:"conde@cab.gn",     telephone:"+224 622 00 11 11", estChef:false, statut:"actif", creeLe:"2024-06-15" },
  { id:12, nom:"Dr. Sylla",     prenom:"Aboubacar", specialite:"Laboratoire",           email:"sylla@cab.gn",     telephone:"+224 622 00 12 12", estChef:false, statut:"actif", creeLe:"2024-07-01" },
  { id:13, nom:"Dr. Kourouma",  prenom:"Fanta",     specialite:"Pharmacie",             email:"kourouma@cab.gn",  telephone:"+224 622 00 13 13", estChef:false, statut:"actif", creeLe:"2024-07-15" },
  { id:14, nom:"Dr. Soumah",    prenom:"Ibrahima",  specialite:"Dermatologie",          email:"soumah@cab.gn",    telephone:"+224 622 00 14 14", estChef:false, statut:"actif", creeLe:"2025-01-10" },
  { id:15, nom:"Dr. Cissé",     prenom:"Mariama",   specialite:"Oncologie",             email:"cisse@cab.gn",     telephone:"+224 622 00 15 15", estChef:false, statut:"actif", creeLe:"2025-02-01" },
  { id:16, nom:"Dr. Bangoura",  prenom:"Sékou",     specialite:"Maladies infectieuses", email:"bangoura@cab.gn",  telephone:"+224 622 00 16 16", estChef:false, statut:"actif", creeLe:"2025-03-01" },
  { id:17, nom:"Dr. Fofana",    prenom:"Aminata",   specialite:"Stomatologie",          email:"fofana@cab.gn",    telephone:"+224 622 00 17 17", estChef:false, statut:"actif", creeLe:"2025-04-01" },
]

export const INIT_COMPTES = [
  { id:1, nom:"Mariama Diallo",   role:"secretaire", email:"sec1@cab.gn",   statut:"actif", creeLe:"2025-01-10", dernConn:"2026-03-31 08:00" },
  { id:2, nom:"Fatoumata Bah",    role:"secretaire", email:"sec2@cab.gn",   statut:"actif", creeLe:"2025-02-15", dernConn:"2026-03-30 17:30" },
  { id:3, nom:"Ibrahima Sow",     role:"infirmier",  email:"infirm@cab.gn", statut:"actif", creeLe:"2025-03-01", dernConn:"2026-03-31 07:45" },
  { id:4, nom:"Aissatou Kouyaté", role:"caissier",   email:"caisse@cab.gn", statut:"actif", creeLe:"2025-03-10", dernConn:"2026-03-31 08:30" },
]

export const INIT_PATIENTS = [
  { id:1, pid:"ABC-A1B2C3", nom:"Bah Mariama",     age:"34 ans",    dateNaissance:"1990-03-12", sexe:"F", telephone:"+224 622 11 22 33", quartier:"Ratoma",   secteur:"Lansanayah" },
  { id:2, pid:"ABC-D4E5F6", nom:"Diallo Ibrahima", age:"52 ans",    dateNaissance:"1972-07-04", sexe:"M", telephone:"+224 628 44 55 66", quartier:"Kaloum",   secteur:"Boulbinet"  },
  { id:3, pid:"ABC-G7H8I9", nom:"Sow Fatoumata",   age:"1an 3mois", dateNaissance:"2022-11-20", sexe:"F", telephone:"+224 621 77 88 99", quartier:"Dixinn",   secteur:"Yimbayah"   },
  { id:4, pid:"ABC-J1K2L3", nom:"Kouyaté Mamadou", age:"61 ans",    dateNaissance:"1963-01-15", sexe:"M", telephone:"+224 624 33 44 55", quartier:"Matam",    secteur:"Tannerie"   },
  { id:5, pid:"ABC-M4N5O6", nom:"Baldé Aissatou",  age:"19 ans",    dateNaissance:"2005-06-08", sexe:"F", telephone:"+224 625 66 77 88", quartier:"Matoto",   secteur:"Gbessia"    },
]

export const INIT_CONSULTATIONS = [
  { id:1,  patientId:1, date:"2025-01-15", motif:"Fièvre, Toux, Rhume",              service:"Médecine générale",             docteurId:1,   statut:"paye",       paiement:"cash",  montant:50000, signePar:"Dr. Amadou Doumbouya", typeVisite:"consultation" },
  { id:2,  patientId:2, date:"2025-03-02", motif:"Douleur thoracique, Palpitations", service:"Cardiologie",                   docteurId:2,   statut:"paye",       paiement:"carte", montant:80000, signePar:"Dr. Camara",    typeVisite:"consultation" },
  { id:3,  patientId:3, date:"2025-06-15", motif:"CPN Suivi, Leucorrhée",             service:"Gynécologie",                   docteurId:5,   statut:"paye",       paiement:"cash",  montant:60000, signePar:"Dr. Keïta",     typeVisite:"rendez_vous"  },
  { id:4,  patientId:4, date:"2025-09-20", motif:"Glycémie élevée, Fatigue",          service:"Diabétologie / Endocrinologie", docteurId:3,   statut:"paye",       paiement:"cash",  montant:45000, signePar:"Dr. Barry",     typeVisite:"consultation" },
  { id:5,  patientId:5, date:"2026-01-20", motif:"Fièvre, Eruption cutanée",          service:"Pédiatrie",                     docteurId:4,   statut:"paye",       paiement:"carte", montant:55000, signePar:"Dr. Souaré",    typeVisite:"consultation" },
  { id:6,  patientId:1, date:"2026-02-14", motif:"Douleur abdominale, Constipation",  service:"Médecine générale",             docteurId:1,   statut:"paye",       paiement:"cash",  montant:40000, signePar:"Dr. Amadou Doumbouya", typeVisite:"consultation" },
  { id:7,  patientId:2, date:"2026-03-01", motif:"Suivi cardio, Essoufflement",       service:"Cardiologie",                   docteurId:2,   statut:"en_attente", paiement:null,    montant:80000, signePar:null,            typeVisite:"rendez_vous"  },
  { id:8,  patientId:3, date:"2026-03-10", motif:"Douleur oculaire, Vision floue",    service:"Ophtalmologie",                 docteurId:6,   statut:"en_attente", paiement:null,    montant:35000, signePar:null,            typeVisite:"consultation" },
  { id:9,  patientId:1, date:today(),      motif:"Fièvre, Céphalée, Courbature",      service:"Médecine générale",             docteurId:null, statut:"en_attente", paiement:null,   montant:null,  signePar:null, arrivee:"08:15", typeVisite:"consultation" },
  { id:10, patientId:4, date:today(),      motif:"Glycémie, Soif excessive",          service:"Diabétologie / Endocrinologie", docteurId:null, statut:"en_attente", paiement:null,   montant:null,  signePar:null, arrivee:"09:30", typeVisite:"rendez_vous"  },
]

// ── Couleurs ─────────────────────────────────────────
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
export const COULEURS = [C.green,"#1d6fa4","#6d28d9","#b45309","#0f766e","#dc2626","#15803d","#1a4a25","#c2410c","#475569","#0369a1","#7c3aed","#16a34a"]

// ── Composants UI ────────────────────────────────────
export function StatutBadge({ statut }) {
  const cfg = {
    en_attente:{ label:"En attente", color:C.slate, bg:C.slateSoft },
    paye:      { label:"Payé",       color:C.green, bg:C.greenSoft },
    actif:     { label:"Actif",      color:C.green, bg:C.greenSoft },
    bloque:    { label:"Bloqué",     color:C.red,   bg:C.redSoft   },
  }
  const s = cfg[statut]||{ label:statut, color:C.slate, bg:C.slateSoft }
  return <span style={{ display:"inline-block", background:s.bg, color:s.color, fontSize:12, fontWeight:600, padding:"4px 12px", borderRadius:20, border:"1px solid "+s.color+"33" }}>{s.label}</span>
}
export function RoleBadge({ role }) {
  const cfg = { secretaire:{color:C.blue,bg:C.blueSoft}, medecin:{color:C.green,bg:C.greenSoft}, infirmier:{color:C.purple,bg:C.purpleSoft}, caissier:{color:C.orange,bg:C.orangeSoft} }
  const c = cfg[role]||{color:C.slate,bg:C.slateSoft}
  return <span style={{ display:"inline-block", background:c.bg, color:c.color, fontSize:12, fontWeight:600, padding:"4px 12px", borderRadius:20 }}>{ROLES_LABEL[role]||role}</span>
}
export function Card({ children, style={} }) {
  return <div style={{ background:C.white, borderRadius:16, border:"1px solid "+C.border, boxShadow:"0 1px 3px rgba(0,0,0,0.06)", ...style }}>{children}</div>
}
export function CardHeader({ title, sub, action }) {
  return (
    <div style={{ padding:"16px 20px", borderBottom:"1px solid "+C.border, display:"flex", justifyContent:"space-between", alignItems:"center" }}>
      <div>
        <p style={{ fontWeight:700, fontSize:15, color:C.textPri, marginBottom:sub?2:0 }}>{title}</p>
        {sub&&<p style={{ fontSize:13, color:C.textMuted }}>{sub}</p>}
      </div>
      {action}
    </div>
  )
}
export function Btn({ children, onClick, variant="primary", small=false, disabled=false }) {
  const cfg={primary:{bg:C.blue,hov:"#155e8b",color:"#fff"},success:{bg:C.green,hov:"#166534",color:"#fff"},outline:{bg:"transparent",hov:C.slateSoft,color:C.textSec,border:"1px solid "+C.border}}
  const s=cfg[variant]||cfg.primary
  return (
    <button onClick={onClick} disabled={disabled}
      style={{ background:s.bg, color:s.color, border:s.border||"none", borderRadius:10, padding:small?"7px 14px":"10px 20px", fontSize:small?12:13, fontWeight:600, cursor:disabled?"not-allowed":"pointer", display:"inline-flex", alignItems:"center", gap:6, fontFamily:"inherit", opacity:disabled?.55:1 }}
      onMouseEnter={e=>{ if(!disabled) e.currentTarget.style.background=s.hov }}
      onMouseLeave={e=>{ if(!disabled) e.currentTarget.style.background=s.bg }}
    >{children}</button>
  )
}
export function Avatar({ name, size=40 }) {
  const bgs=[C.blueSoft,C.greenSoft,C.purpleSoft,C.slateSoft,C.orangeSoft]
  const fgs=[C.blue,C.green,C.purple,C.slate,C.orange]
  const i=(name?.charCodeAt(0)||0)%bgs.length
  return (
    <div style={{ width:size, height:size, borderRadius:"50%", background:bgs[i], display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>
      <svg width={size*.42} height={size*.42} viewBox="0 0 24 24" fill="none" stroke={fgs[i]} strokeWidth="2" strokeLinecap="round">
        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
      </svg>
    </div>
  )
}
export function Overlay({ children, onClose }) {
  return <div style={{ position:"fixed", inset:0, background:"rgba(15,23,42,0.5)", zIndex:300, display:"flex", alignItems:"center", justifyContent:"center", padding:20 }} onClick={e=>{ if(e.target===e.currentTarget) onClose() }}>{children}</div>
}
export function FInput({ label, req, children }) {
  return <div><label style={{ display:"block", fontSize:13, fontWeight:600, color:C.textPri, marginBottom:6 }}>{label}{req&&<span style={{ color:C.red }}> *</span>}</label>{children}</div>
}
export function Inp({ value, onChange, placeholder, type="text" }) {
  return <input type={type} value={value} onChange={onChange} placeholder={placeholder}
    style={{ width:"100%", padding:"11px 14px", fontSize:14, border:"1.5px solid "+C.border, borderRadius:10, background:C.white, color:C.textPri, outline:"none", fontFamily:"inherit" }}
    onFocus={e=>{ e.target.style.borderColor=C.blue; e.target.style.boxShadow="0 0 0 3px "+C.blueSoft }}
    onBlur={e=>{ e.target.style.borderColor=C.border; e.target.style.boxShadow="none" }}/>
}
export function Sel({ value, onChange, children }) {
  return <select value={value} onChange={onChange} style={{ width:"100%", padding:"11px 14px", fontSize:14, border:"1.5px solid "+C.border, borderRadius:10, background:C.white, color:C.textPri, outline:"none", fontFamily:"inherit", cursor:"pointer" }}>{children}</select>
}
