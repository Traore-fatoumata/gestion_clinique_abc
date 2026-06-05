/* eslint-disable react-refresh/only-export-components */
import { useState, useEffect } from "react"

// ══════════════════════════════════════════════════════
//  UTILITAIRES
// ══════════════════════════════════════════════════════
export const today = () => new Date().toISOString().slice(0, 10)
export const getNowTime = () => new Date().toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })
export const fmt = d => d ? new Date(d).toLocaleDateString("fr-FR") : "—"
export const getAge = d => d ? Math.floor((Date.now() - new Date(d)) / (365.25 * 86400000)) : "—"

// ══════════════════════════════════════════════════════
//  PARSEUR MINDRAY — import fichier USB
// ══════════════════════════════════════════════════════
// Correspondance paramètres Mindray (anglais) → noms français du système
export const MINDRAY_MAP = {
  WBC:"GB",    "LYM#":"LYM", LYM:"LYM",
  "MON#":"MON",MON:"MON",
  "GRA#":"GRA",GRA:"GRA",
  "NEU#":"GRA",NEU:"GRA",
  RBC:"GR",    HGB:"HB",
  HCT:"HCT",
  MCV:"VGM",
  MCH:"TCMH",
  MCHC:"CCMH",
  PLT:"PLT",
  "RDW-CV":"RDW-CV",
  "RDW-SD":"RDW-SD",
  MPV:"MPV",   PDW:"PDW",
  PCT:"PCT",   "P-LCR":"P-LCR",
  "PLR":"PLR",
  "LYM%":"LYM%","MON%":"MON%","GRA%":"GRA%","NEU%":"NEU%",
}

export function parseMindrayFile(text) {
  const resultats = {}
  const lines = text.split(/\r?\n/)
  for (const line of lines) {
    const trimmed = line.trim()
    if (!trimmed || trimmed.startsWith("#") || trimmed.startsWith("*")) continue
    // format: "WBC   5.30   10^9/L   [4.0~10.0]"  ou  "WBC,5.30,10^9/L,4.0-10.0"
    const parts = trimmed.split(/[\s,\t]+/).filter(Boolean)
    if (parts.length < 2) continue
    const rawParam = parts[0].replace(/:$/, "")
    const value    = parts[1]
    const unite    = parts[2] || ""
    // valeur numérique ?
    if (isNaN(parseFloat(value))) continue
    const frParam = MINDRAY_MAP[rawParam.toUpperCase()] || MINDRAY_MAP[rawParam] || rawParam
    // extraire norme entre [] ou de la forme 4.0-10.0
    let norme = ""
    const bracketMatch = trimmed.match(/\[([^\]]+)\]/)
    if (bracketMatch) norme = bracketMatch[1].replace(/~/g, "-")
    resultats[frParam] = { valeur: value, unite: unite.replace("10^9/L","Giga/l").replace("10^12/L","Téra T/l"), norme }
  }
  return resultats
}

// ══════════════════════════════════════════════════════
//  DONNÉES
// ══════════════════════════════════════════════════════
export const TYPES_EXAMENS = [
  "Hématologie","Biochimie","Sérologie","Immunologie","Hormonologie",
  "Marqueurs Tumoraux","Bactériologie","Parasitologie","Autre"
]

export const EXAMENS_PAR_TYPE = {
  "Hématologie":        ["NFS (Numération Formule Sanguine)","Hémoglobine + Goutte Épaisse","Groupage Sanguin + Rhésus","TP / TCA / Fibrinogène"],
  "Biochimie":          ["Biochimie Complète (Sang)","Bilan Hépatique (ASAT/ALAT)","Bilan Rénal (Créat/Urée)","Bilan Lipidique","Glycémie à jeun","HbA1c","Électrolytes (Na/K/Cl)"],
  "Sérologie":          ["Sérologie Complète (ASLO/CRP/Widal/BW)","Widal + GE","CRP + ASLO","RPR / TPHA (Syphilis)"],
  "Immunologie":        ["AgHBs + AgHBe + Anti-VHC (Hépatite)","Toxoplasmose IgM + IgG","Rubéole IgM + IgG","Toxoplasmose + Rubéole (TORCH)"],
  "Hormonologie":       ["Bilan Hormonal Complet (Sexuel)","Hormones Thyroïdiennes (TSH/T3/T4)","BHCG Quantitatif","Vitamine D / Parathormone / Ferritine"],
  "Marqueurs Tumoraux": ["CA-125 / CA-19.9 / ACE / CA-15-3","PSA Total (Prostate)","AFP (Alphafœtoprotéine)"],
  "Bactériologie":      ["ECBU (Urine) + ATG","Prélèvement Vaginal + ATG","Antibiogramme"],
  "Parasitologie":      ["Parasitologie des Selles","Goutte Épaisse + Frottis Sanguin"],
  "Autre":              ["Examen à définir"]
}

export const PARAMS_PAR_EXAMEN = {
  "NFS (Numération Formule Sanguine)": [
    { nom:"GB",    unite:"Giga/l",    norme:"4-12"     },
    { nom:"LYM",   unite:"Giga/l",    norme:"0.8-4.5"  },
    { nom:"MON",   unite:"Giga/l",    norme:"0.1-1.5"  },
    { nom:"GRA",   unite:"Giga/l",    norme:"2-7"      },
    { nom:"GR",    unite:"Téra T/l",  norme:"3.5-6.0"  },
    { nom:"HB",    unite:"g/dl",      norme:"11.5-17.5"},
    { nom:"HCT",   unite:"%",         norme:"36-54"    },
    { nom:"VGM",   unite:"fl",        norme:"80-100"   },
    { nom:"TCMH",  unite:"Pg/l",      norme:"27-34"    },
    { nom:"CCMH",  unite:"g/dl",      norme:"32-36"    },
    { nom:"PLT",   unite:"Giga/l",    norme:"150-450"  },
  ],
  "Hémoglobine + Goutte Épaisse": [
    { nom:"Hémoglobine",    unite:"g/100ml", norme:"12-17"   },
    { nom:"Goutte Épaisse", unite:"",        norme:"Négatif" },
  ],
  "Biochimie Complète (Sang)": [
    { nom:"Créatinine",       unite:"µmol/l",  norme:"50-120"   },
    { nom:"Urée",             unite:"mmol/l",  norme:"2.5-7.5"  },
    { nom:"Calcium",          unite:"mmol/l",  norme:"2.2-2.9"  },
    { nom:"Magnésium",        unite:"mmol/l",  norme:"0.66-1.03"},
    { nom:"Glycémie",         unite:"mmol/l",  norme:"3.3-5.5"  },
    { nom:"Cholestérol total",unite:"mmol/l",  norme:"3.8-6.5"  },
    { nom:"Cholestérol HDL",  unite:"mmol/l",  norme:"1.06-6.52"},
    { nom:"LDL",              unite:"mmol/l",  norme:"3.4-4.1"  },
    { nom:"Triglycérides",    unite:"mmol/l",  norme:"0.4-1.6"  },
    { nom:"Acide Urique",     unite:"µmol/l",  norme:"150-420"  },
    { nom:"ASAT (SGOT)",      unite:"UI/l",    norme:"< 38"     },
    { nom:"ALAT (SGPT)",      unite:"UI/l",    norme:"≤ 40"     },
    { nom:"Potassium",        unite:"mmol/l",  norme:"3.5-5.5"  },
    { nom:"Sodium",           unite:"mmol/l",  norme:"135-145"  },
    { nom:"Chlore",           unite:"mmol/l",  norme:"98-107"   },
  ],
  "Bilan Hépatique (ASAT/ALAT)": [
    { nom:"ASAT (SGOT)", unite:"UI/l", norme:"< 38" },
    { nom:"ALAT (SGPT)", unite:"UI/l", norme:"≤ 40" },
    { nom:"Bilirubine T",unite:"µmol/l",norme:"< 17" },
    { nom:"GGT",         unite:"UI/l", norme:"< 50" },
  ],
  "Bilan Rénal (Créat/Urée)": [
    { nom:"Créatinine", unite:"µmol/l", norme:"50-120"  },
    { nom:"Urée",       unite:"mmol/l", norme:"2.5-7.5" },
    { nom:"Potassium",  unite:"mmol/l", norme:"3.5-5.5" },
    { nom:"Sodium",     unite:"mmol/l", norme:"135-145" },
  ],
  "Bilan Lipidique": [
    { nom:"Cholestérol total",unite:"mmol/l",  norme:"3.8-6.5"  },
    { nom:"Cholestérol HDL",  unite:"mmol/l",  norme:"1.06-6.52"},
    { nom:"LDL",              unite:"mmol/l",  norme:"3.4-4.1"  },
    { nom:"Triglycérides",    unite:"mmol/l",  norme:"0.4-1.6"  },
  ],
  "Glycémie à jeun":       [{ nom:"Glycémie",   unite:"mmol/l", norme:"3.3-5.5"  }],
  "HbA1c":                 [{ nom:"HbA1c",      unite:"%",      norme:"< 6.5"    }],
  "Électrolytes (Na/K/Cl)":[
    { nom:"Potassium", unite:"mmol/l", norme:"3.5-5.5" },
    { nom:"Sodium",    unite:"mmol/l", norme:"135-145" },
    { nom:"Chlore",    unite:"mmol/l", norme:"98-107"  },
  ],
  "Sérologie Complète (ASLO/CRP/Widal/BW)": [
    { nom:"Aslo (titre)",        unite:"",        norme:"≤ 200"   },
    { nom:"Facteur Rhumatoïde",  unite:"",        norme:"Négatif" },
    { nom:"CRP",                 unite:"",        norme:"≤ 6"     },
    { nom:"H-Pylori",            unite:"",        norme:"Négatif" },
    { nom:"Widal TO",            unite:"",        norme:"≤ 200"   },
    { nom:"Widal TH",            unite:"",        norme:"≤ 200"   },
    { nom:"BW RPR",              unite:"",        norme:"Négatif" },
    { nom:"BW TPHA",             unite:"",        norme:"Négatif" },
    { nom:"Hémoglobine",         unite:"g/100ml", norme:"12-17"   },
    { nom:"Goutte Épaisse",      unite:"",        norme:"Négatif" },
  ],
  "Widal + GE": [
    { nom:"Widal TO", unite:"", norme:"≤ 200" },
    { nom:"Widal TH", unite:"", norme:"≤ 200" },
    { nom:"Goutte Épaisse", unite:"", norme:"Négatif" },
  ],
  "CRP + ASLO": [
    { nom:"CRP",  unite:"", norme:"≤ 6" },
    { nom:"ASLO", unite:"", norme:"≤ 200" },
  ],
  "RPR / TPHA (Syphilis)": [
    { nom:"RPR",  unite:"", norme:"Négatif" },
    { nom:"TPHA", unite:"", norme:"Négatif" },
  ],
  "AgHBs + AgHBe + Anti-VHC (Hépatite)": [
    { nom:"AgHBs",             unite:"",     norme:"Négatif < 0.13" },
    { nom:"AgHBe",             unite:"UI/ml",norme:"Négatif < 0.10" },
    { nom:"Anticorps anti-VHC",unite:"",     norme:"Négatif < 1.00" },
  ],
  "Toxoplasmose IgM + IgG": [
    { nom:"Toxoplasmose IgM", unite:"UI/ml", norme:"Négatif < 0.55" },
    { nom:"Toxoplasmose IgG", unite:"UI/ml", norme:"Négatif < 4"    },
  ],
  "Rubéole IgM + IgG": [
    { nom:"Rubéole IgM", unite:"UI/ml", norme:"Négatif < 0.80" },
    { nom:"Rubéole IgG", unite:"UI/ml", norme:"Positif ≥ 15"   },
  ],
  "Toxoplasmose + Rubéole (TORCH)": [
    { nom:"Toxoplasmose IgM", unite:"UI/ml", norme:"Négatif < 0.55" },
    { nom:"Toxoplasmose IgG", unite:"UI/ml", norme:"Négatif < 4"    },
    { nom:"Rubéole IgM",      unite:"UI/ml", norme:"Négatif < 0.80" },
    { nom:"Rubéole IgG",      unite:"UI/ml", norme:"Positif ≥ 15"   },
  ],
  "Bilan Hormonal Complet (Sexuel)": [
    { nom:"Testostérone", unite:"ng/ml",  norme:"H:2.27-10.30 / F≥19-50:0.23-0.73" },
    { nom:"Prolactine",   unite:"ng/l",   norme:"H:2.10-17.7 / F:1.80-29.20"       },
    { nom:"FSH",          unite:"mUI/ml", norme:"H:2.1-18.6 / F Foll:4.5-80"       },
    { nom:"LH",           unite:"mUI/ml", norme:"1.1-7"                             },
    { nom:"Œstradiol",    unite:"Pg/ml",  norme:"H:<62 / F:<575"                    },
    { nom:"Progestérone", unite:"ng/ml",  norme:"H:0.25-0.56 / F:<20"              },
  ],
  "Hormones Thyroïdiennes (TSH/T3/T4)": [
    { nom:"TSH", unite:"µUI/ml", norme:"Euthyroïdie:0.25-5" },
    { nom:"T3",  unite:"nmol/l", norme:"Euthyroïdie:0.9-2.5"},
    { nom:"T4",  unite:"nmol/l", norme:"Euthyroïdie:60-120" },
  ],
  "BHCG Quantitatif": [
    { nom:"βHCG Quantitatif", unite:"mUI/L", norme:"< 5 (non enceinte)" },
  ],
  "Vitamine D / Parathormone / Ferritine": [
    { nom:"Vitamine D",   unite:"ng/ml", norme:"30-45"         },
    { nom:"Parathormone", unite:"pg/µl", norme:"15-65"         },
    { nom:"Ferritine",    unite:"ng/ml", norme:"H:18-270 / F:18-160" },
  ],
  "CA-125 / CA-19.9 / ACE / CA-15-3": [
    { nom:"CA-125",  unite:"U/ml",  norme:"< 30"   },
    { nom:"CA-19.9", unite:"U/ml",  norme:"< 37"   },
    { nom:"ACE",     unite:"ng/ml", norme:"< 4.10" },
    { nom:"CA-15-3", unite:"U/mL",  norme:"< 30"   },
  ],
  "PSA Total (Prostate)": [
    { nom:"T.PSA Total", unite:"ng/ml", norme:"<40ans:0.21-1.72" },
  ],
  "AFP (Alphafœtoprotéine)": [
    { nom:"AFP", unite:"UI/ml", norme:"0 à 2" },
  ],
  "ECBU (Urine) + ATG": [
    { nom:"Leucocytes",                   unite:"/champ", norme:"< 10"    },
    { nom:"Hématies",                     unite:"/champ", norme:"< 5"     },
    { nom:"Cellules épithéliales",        unite:"/champ", norme:"—"       },
    { nom:"Cristaux",                     unite:"/champ", norme:"—"       },
    { nom:"Levures",                      unite:"/champ", norme:"Absent"  },
    { nom:"Parasites",                    unite:"/champ", norme:"Absent"  },
    { nom:"Cellules Vaginales/Urétrales", unite:"/champ", norme:"—"       },
  ],
  "Prélèvement Vaginal + ATG": [
    { nom:"Leucocytes",          unite:"/champ", norme:"—"      },
    { nom:"Hématies",            unite:"/champ", norme:"—"      },
    { nom:"Cellules épithéliales",unite:"/champ",norme:"—"      },
    { nom:"Levures",             unite:"/champ", norme:"Absent" },
    { nom:"Autres éléments",     unite:"",       norme:"—"      },
    { nom:"Résultat Gram",       unite:"",       norme:"—"      },
  ],
  "Parasitologie des Selles": [
    { nom:"Aspect des selles",            unite:"",  norme:"—"       },
    { nom:"Couleur",                      unite:"",  norme:"—"       },
    { nom:"Recherche Œufs et Parasites",  unite:"",  norme:"Négatif" },
  ],
  "Goutte Épaisse + Frottis Sanguin": [
    { nom:"Goutte Épaisse",  unite:"",  norme:"Négatif" },
    { nom:"Frottis Sanguin", unite:"",  norme:"Négatif" },
  ],
}

export const buildParamsVides = (nomExamen) => {
  const modeles = PARAMS_PAR_EXAMEN[nomExamen] || [{ nom: "Résultat", unite: "", norme: "" }]
  return Object.fromEntries(modeles.map(p => [p.nom, { valeur: "", unite: p.unite, norme: p.norme }]))
}

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
//  COMPOSANTS DE BASE
// ══════════════════════════════════════════════════════
export function Badge({ statut }) {
  const cfg = {
    en_attente:{ label:"En attente", color:C.slate, bg:C.slateSoft },
    en_cours:  { label:"En cours",   color:C.blue,  bg:C.blueSoft  },
    termine:   { label:"Terminé",    color:C.green, bg:C.greenSoft },
    annule:    { label:"Annulé",     color:C.slate, bg:C.slateSoft },
  }
  const s = cfg[statut] || { label: statut, color: C.slate, bg: C.slateSoft }
  return (
    <span style={{ display:"inline-flex", alignItems:"center", gap:6, background:s.bg, color:s.color, fontSize:11, fontWeight:700, padding:"4px 10px", borderRadius:20, border:"1px solid "+s.color+"33" }}>
      <span style={{ width:6, height:6, borderRadius:"50%", background:s.color }} />
      {s.label}
    </span>
  )
}

export function Avatar({ name, size = 36 }) {
  const palettes = [
    { bg:"#e8f5ec", fg:"#2d7a3f" }, { bg:"#dcfce7", fg:"#16a34a" },
    { bg:"#d8eed8", fg:"#1a4a25" }, { bg:"#eeeeee", fg:"#444444" },
    { bg:"#ccfbf1", fg:"#0d9488" },
  ]
  const p = palettes[(name?.charCodeAt(0) || 0) % palettes.length]
  const initials = name?.split(" ").map(w => w[0]).slice(0, 2).join("").toUpperCase() || "?"
  return (
    <div style={{ width:size, height:size, borderRadius:"50%", background:p.bg, color:p.fg, border:"2px solid "+p.fg+"30", display:"flex", alignItems:"center", justifyContent:"center", fontSize:size*0.35, fontWeight:800, flexShrink:0 }}>
      {initials}
    </div>
  )
}

export function Btn({ children, onClick, variant = "primary", small = false, disabled = false }) {
  const [hov, setHov] = useState(false)
  const cfg = {
    primary:   { bg:C.blue,  hov:C.blueDark,  color:"#fff" },
    success:   { bg:C.green, hov:C.greenDark, color:"#fff" },
    secondary: { bg:C.white, hov:C.slateSoft, color:C.textSec, border:"1.5px solid "+C.border },
    danger:    { bg:C.red,   hov:"#b91c1c",   color:"#fff" },
  }
  const s = cfg[variant] || cfg.primary
  return (
    <button onClick={onClick} disabled={disabled}
      onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}
      style={{ background:hov&&!disabled?s.hov:s.bg, color:s.color, border:s.border||"none", borderRadius:10, padding:small?"6px 14px":"9px 18px", fontSize:small?12:13, fontWeight:600, cursor:disabled?"not-allowed":"pointer", display:"inline-flex", alignItems:"center", gap:6, fontFamily:"inherit", transition:"background .15s", opacity:disabled?0.5:1, whiteSpace:"nowrap" }}>
      {children}
    </button>
  )
}

export function Overlay({ children, onClose }) {
  useEffect(() => {
    const h = e => { if (e.key === "Escape") onClose() }
    window.addEventListener("keydown", h)
    return () => window.removeEventListener("keydown", h)
  }, [onClose])
  return (
    <div style={{ position:"fixed", inset:0, background:"rgba(15,23,42,0.6)", zIndex:300, display:"flex", alignItems:"center", justifyContent:"center", padding:20, backdropFilter:"blur(4px)" }}
      onClick={e => { if (e.target === e.currentTarget) onClose() }}>
      {children}
    </div>
  )
}

export function CloseBtn({ onClose }) {
  return (
    <button onClick={onClose} style={{ background:C.slateSoft, border:"none", borderRadius:8, color:C.textSec, cursor:"pointer", width:32, height:32, display:"flex", alignItems:"center", justifyContent:"center", fontSize:18, flexShrink:0 }}>×</button>
  )
}

export function iSt(extra = {}) {
  return { width:"100%", padding:"10px 13px", fontSize:13, border:"1.5px solid "+C.border, borderRadius:10, background:C.white, color:C.textPri, outline:"none", fontFamily:"inherit", ...extra }
}

export function Field({ label, required, children }) {
  return (
    <div>
      <label style={{ display:"block", fontSize:13, fontWeight:600, color:C.textPri, marginBottom:6 }}>
        {label} {required && <span style={{ color:C.red }}>*</span>}
      </label>
      {children}
    </div>
  )
}

export function SectionCard({ label, icon, color, children }) {
  return (
    <div style={{ background:C.slateSoft, borderRadius:14, overflow:"hidden", border:"1px solid "+C.border }}>
      <div style={{ padding:"10px 16px", borderBottom:"1px solid "+C.border, background:color+"18", display:"flex", alignItems:"center", gap:8 }}>
        <span>{icon}</span>
        <p style={{ fontSize:12, fontWeight:700, color:color, textTransform:"uppercase", letterSpacing:"0.08em" }}>{label}</p>
      </div>
      <div style={{ padding:"16px" }}>{children}</div>
    </div>
  )
}
