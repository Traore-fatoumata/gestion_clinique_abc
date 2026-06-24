/* eslint-disable react-refresh/only-export-components */
// ── Utilitaires ──────────────────────────────────────
// Dans shared.jsx — remplacer today() par :
export const today = () => {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`
  // ✅ Date locale, pas UTC
}
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
/* eslint-disable react-refresh/only-export-components */

// ══════════════════════════════════════════════════════
//  UTILITAIRES
// ══════════════════════════════════════════════════════
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
  "1. HÉMATOLOGIE": {
    "Numération et formule sanguine": [
      { nom: "NFS (Numération Formule Sanguine)", prix: 25000 },
      { nom: "Hémogramme complet", prix: 25000 },
      { nom: "Taux d'hémoglobine", prix: 10000 },
      { nom: "Hématocrite", prix: 8000 },
      { nom: "Numération leucocytaire", prix: 12000 },
      { nom: "Numération plaquettaire", prix: 12000 },
      { nom: "Réticulocytes", prix: 15000 },
    ],
    "Études des cellules sanguines": [
      { nom: "Frottis sanguin", prix: 15000 },
      { nom: "Électrophorèse de l'hémoglobine", prix: 40000 },
      { nom: "Test d'Emmel", prix: 20000 },
      { nom: "Recherche de drépanocytose", prix: 25000 },
    ],
    "Groupage sanguin": [
      { nom: "Groupe sanguin ABO", prix: 8000 },
      { nom: "Rhésus", prix: 8000 },
      { nom: "Coombs direct", prix: 20000 },
      { nom: "Coombs indirect", prix: 25000 },
    ],
    "Hémostase": [
      { nom: "TP (Taux de Prothrombine)", prix: 15000 },
      { nom: "INR", prix: 15000 },
      { nom: "TCA/TCK", prix: 15000 },
      { nom: "Fibrinogène", prix: 18000 },
      { nom: "Temps de saignement", prix: 10000 },
      { nom: "Temps de coagulation", prix: 10000 },
      { nom: "D-Dimères", prix: 30000 },
    ],
  },
  "2. BIOCHIMIE": {
    "Diabète": [
      { nom: "Glycémie à jeun", prix: 15000 },
      { nom: "Glycémie postprandiale", prix: 15000 },
      { nom: "HbA1c", prix: 25000 },
      { nom: "Hyperglycémie provoquée", prix: 30000 },
    ],
    "Fonction rénale": [
      { nom: "Urée", prix: 12000 },
      { nom: "Créatinine", prix: 12000 },
      { nom: "Acide urique", prix: 15000 },
      { nom: "Clairance de la créatinine", prix: 20000 },
    ],
    "Bilan hépatique": [
      { nom: "ALAT", prix: 12000 },
      { nom: "ASAT", prix: 12000 },
      { nom: "Gamma GT", prix: 12000 },
      { nom: "Phosphatases alcalines", prix: 12000 },
      { nom: "Bilirubine totale", prix: 15000 },
      { nom: "Bilirubine directe", prix: 15000 },
    ],
    "Bilan lipidique": [
      { nom: "Cholestérol total", prix: 12000 },
      { nom: "HDL", prix: 12000 },
      { nom: "LDL", prix: 12000 },
      { nom: "Triglycérides", prix: 12000 },
    ],
    "Bilan ionique": [
      { nom: "Sodium", prix: 10000 },
      { nom: "Potassium", prix: 10000 },
      { nom: "Chlore", prix: 10000 },
      { nom: "Calcium", prix: 10000 },
      { nom: "Magnésium", prix: 12000 },
      { nom: "Phosphore", prix: 10000 },
    ],
    "Bilan pancréatique": [
      { nom: "Lipase", prix: 20000 },
      { nom: "Amylase", prix: 18000 },
    ],
    "Bilan protéique": [
      { nom: "Albumine", prix: 15000 },
      { nom: "Protéines totales", prix: 15000 },
      { nom: "Ferritine", prix: 25000 },
      { nom: "CRP", prix: 20000 },
    ],
  },
  "3. IMMUNOLOGIE / SÉROLOGIE": {
    "Maladies infectieuses": [
      { nom: "VIH", prix: 20000 },
      { nom: "Hépatite B", prix: 25000 },
      { nom: "Hépatite C", prix: 25000 },
      { nom: "TPHA", prix: 15000 },
      { nom: "VDRL", price: 15000 },
      { nom: "Rubéole", prix: 20000 },
      { nom: "Toxoplasmose", prix: 20000 },
      { nom: "CMV", prix: 20000 },
      { nom: "Herpès", prix: 20000 },
    ],
    "Auto-immunité": [
      { nom: "Facteur rhumatoïde", prix: 20000 },
      { nom: "ASLO", prix: 18000 },
      { nom: "ANA", prix: 25000 },
      { nom: "Anti-DNA", prix: 30000 },
      { nom: "Anti-CCP", prix: 30000 },
    ],
    "Allergologie": [
      { nom: "IgE totales", prix: 25000 },
      { nom: "IgE spécifiques", prix: 30000 },
    ],
  },
  "4. HORMONOLOGIE": {
    "Thyroïde": [
      { nom: "TSH", prix: 20000 },
      { nom: "T3", prix: 20000 },
      { nom: "T4", prix: 20000 },
    ],
    "Fertilité féminine": [
      { nom: "FSH", prix: 20000 },
      { nom: "LH", prix: 20000 },
      { nom: "Prolactine", prix: 25000 },
      { nom: "Œstradiol", prix: 25000 },
      { nom: "Progestérone", prix: 25000 },
    ],
    "Fertilité masculine": [
      { nom: "Testostérone", prix: 25000 },
      { nom: "FSH", prix: 20000 },
      { nom: "LH", prix: 20000 },
    ],
    "Grossesse": [
      { nom: "β-HCG", prix: 15000 },
    ],
    "Glandes surrénales": [
      { nom: "Cortisol", prix: 25000 },
    ],
  },
  "5. BACTÉRIOLOGIE": {
    "Urines": [
      { nom: "ECBU", prix: 25000 },
      { nom: "Culture urinaire", prix: 30000 },
      { nom: "Antibiogramme", prix: 30000 },
    ],
    "Selles": [
      { nom: "Coproculture", prix: 20000 },
    ],
    "Sang": [
      { nom: "Hémoculture", prix: 30000 },
    ],
    "Appareil génital": [
      { nom: "Prélèvement vaginal", prix: 20000 },
      { nom: "Prélèvement urétral", prix: 20000 },
      { nom: "Spermoculture", prix: 30000 },
    ],
    "Plaies et infections": [
      { nom: "Culture de pus", prix: 25000 },
      { nom: "Prélèvement de plaie", prix: 20000 },
      { nom: "Prélèvement ORL", prix: 20000 },
    ],
    "Tuberculose": [
      { nom: "Recherche de BK", prix: 20000 },
      { nom: "Culture BK", prix: 35000 },
    ],
  },
  "6. PARASITOLOGIE": {
    "Paludisme": [
      { nom: "Goutte épaisse", prix: 15000 },
      { nom: "Frottis sanguin", prix: 15000 },
    ],
    "Parasites intestinaux": [
      { nom: "KOP", prix: 15000 },
      { nom: "Examen parasitologique des selles", prix: 20000 },
      { nom: "Recherche d'amibes", prix: 18000 },
      { nom: "Recherche de Giardia", prix: 18000 },
    ],
    "Parasites urinaires": [
      { nom: "Bilharziose urinaire", prix: 20000 },
    ],
    "Parasites sanguins": [
      { nom: "Filariose", prix: 20000 },
      { nom: "Trypanosomiase", prix: 25000 },
      { nom: "Hémoparasites", prix: 20000 },
    ],
    "Autres": [
      { nom: "Scotch test", prix: 10000 },
    ],
  },
  "7. MYCOLOGIE": {
    "Champignons cutanés": [
      { nom: "Examen mycologique peau", prix: 25000 },
      { nom: "Examen mycologique ongles", prix: 25000 },
      { nom: "Examen mycologique cheveux", prix: 25000 },
    ],
    "Champignons profonds": [
      { nom: "Recherche Candida", prix: 25000 },
      { nom: "Recherche Cryptococcus", prix: 30000 },
    ],
    "Cultures": [
      { nom: "Culture fongique", prix: 35000 },
      { nom: "Antifongigramme", prix: 40000 },
    ],
  },
  "8. MARQUEURS TUMORAUX": {
    "Cancer de la prostate": [
      { nom: "PSA total", prix: 30000 },
      { nom: "PSA libre", prix: 30000 },
    ],
    "Cancer du foie": [
      { nom: "AFP", prix: 35000 },
    ],
    "Cancer digestif": [
      { nom: "CEA", prix: 35000 },
      { nom: "CA 19-9", prix: 35000 },
    ],
    "Cancer du sein": [
      { nom: "CA 15-3", prix: 40000 },
    ],
    "Cancer de l'ovaire": [
      { nom: "CA 125", prix: 40000 },
    ],
    "Autres": [
      { nom: "NSE", prix: 35000 },
      { nom: "Calcitonine", prix: 35000 },
      { nom: "CYFRA 21-1", prix: 35000 },
      { nom: "Thyroglobuline", prix: 35000 },
    ],
  },
  "9. BIOLOGIE MOLÉCULAIRE": {
    "PCR infectieuses": [
      { nom: "PCR VIH", prix: 80000 },
      { nom: "PCR Hépatite B", prix: 80000 },
      { nom: "PCR Hépatite C", prix: 80000 },
      { nom: "PCR COVID-19", prix: 80000 },
      { nom: "PCR Tuberculose", prix: 80000 },
      { nom: "PCR HPV", prix: 80000 },
    ],
    "Charges virales": [
      { nom: "Charge virale VIH", prix: 100000 },
      { nom: "Charge virale Hépatite B", prix: 100000 },
      { nom: "Charge virale Hépatite C", prix: 100000 },
    ],
  },
  "10. CYTOLOGIE / ANATOMOPATHOLOGIE": {
    "Cytologie": [
      { nom: "Frottis cervico-vaginal", prix: 30000 },
      { nom: "Cytologie urinaire", prix: 25000 },
      { nom: "Cytologie des liquides biologiques", prix: 30000 },
    ],
    "Histologie": [
      { nom: "Biopsie mammaire", prix: 80000 },
      { nom: "Biopsie prostatique", prix: 80000 },
      { nom: "Biopsie gastrique", prix: 80000 },
      { nom: "Biopsie hépatique", prix: 80000 },
      { nom: "Biopsie cutanée", prix: 50000 },
    ],
  },
  "11. BANQUE DE SANG": [
    { nom: "Groupe ABO", prix: 8000 },
    { nom: "Rhésus", prix: 8000 },
    { nom: "Phénotypage", prix: 15000 },
    { nom: "RAI", prix: 20000 },
    { nom: "Compatibilité transfusionnelle", prix: 25000 },
    { nom: "Cross Match", prix: 30000 },
  ],
  "IMAGERIE": {
    "Radiologie": [
      { nom: "Radiographie pulmonaire", prix: 40000 },
      { nom: "Radiographie abdominale (ASP)", prix: 35000 },
      { nom: "Panoramique dentaire", prix: 50000 },
      { nom: "Radiographie dentaire rétro-alvéolaire", prix: 20000 },
    ],
    "Échographie": [
      { nom: "Échographie abdominale", prix: 60000 },
      { nom: "Échographie pelvienne", prix: 60000 },
      { nom: "Échographie obstétricale", prix: 70000 },
      { nom: "Échographie cardiaque (écho cœur)", prix: 80000 },
    ],
    "Scanner (TDM)": [
      { nom: "Scanner (TDM) cérébral", prix: 150000 },
      { nom: "Scanner thoracique", prix: 150000 },
      { nom: "Scanner abdominal", prix: 150000 },
    ],
    "IRM": [
      { nom: "IRM cérébrale", prix: 250000 },
      { nom: "IRM lombaire / colonne", prix: 250000 },
    ],
  },
  "CARDIOLOGIE": [
    { nom: "ECG (électrocardiogramme)", prix: 20000 },
    { nom: "Holter ECG 24h", prix: 80000 },
    { nom: "Échocardiographie doppler", prix: 100000 },
    { nom: "Épreuve d'effort", prix: 70000 },
  ],
  "NEUROLOGIE": [
    { nom: "EEG (électroencéphalogramme)", prix: 60000 },
    { nom: "Ponction lombaire", prix: 50000 },
    { nom: "EMG (électromyogramme)", prix: 80000 },
  ],
  "GYNECOLOGIE / OBSTÉTRIQUE": [
    { nom: "Frottis cervico-vaginal (FCV)", prix: 30000 },
    { nom: "Colposcopie", prix: 60000 },
    { nom: "HSG (hystérosalpingographie)", prix: 80000 },
    { nom: "Biopsie endomètre", prix: 50000 },
  ],
  "ORL": [
    { nom: "Audiogramme", prix: 40000 },
    { nom: "Tympanogramme", prix: 25000 },
    { nom: "Nasofibroscopie", prix: 50000 },
  ],
  "OPHTALMOLOGIE": [
    { nom: "Fond d'œil", prix: 30000 },
    { nom: "Champ visuel", prix: 40000 },
    { nom: "Mesure pression oculaire (tonomètrie)", prix: 20000 },
    { nom: "OCT rétine", prix: 80000 },
  ],
  "DERMATOLOGIE": [
    { nom: "Biopsie cutanée", prix: 50000 },
    { nom: "Examen mycologique (champignons)", prix: 25000 },
    { nom: "Dermoscopie", prix: 30000 },
  ],
  "STOMATOLOGIE / DENTAIRE": [
    { nom: "Panoramique dentaire", prix: 50000 },
    { nom: "Radiographie dentaire rétro-alvéolaire", prix: 20000 },
  ],
}

export const TYPE_CONSULT_LABEL = {
  standard:     { label:"Consultation standard",        short:"Standard" },
  prenatal:     { label:"Consultation prénatale (CPN)", short:"CPN"      },
  accouchement: { label:"Registre d'accouchement",      short:"Accouch." },
}

export const isGynecoObst = (sp) => /gynécologie|obstétrique/i.test(sp || "")



// ══════════════════════════════════════════════════════
//  COULEURS - Professional Theme
// ══════════════════════════════════════════════════════
export const C = {
  // Backgrounds
  bg: "#f8fafc",       // Lighter, more modern background
  white: "#ffffff",
  
  // Text
  textPri: "#0f172a",  // Darker, more contrast
  textSec: "#475569",  // Softer secondary
  textMuted: "#94a3b8", // More subtle muted
  
  // Borders
  border: "#e2e8f0",   // Cleaner border
  
  // Primary - Medical Green
  green: "#059669",    // More vibrant emerald
  greenSoft: "#d1fae5",
  greenDark: "#047857",
  greenLight: "#6ee7b7",
  green50: "#f0fdf4",
  
  // Secondary - Professional Blue
  blue: "#2563eb",     // More professional blue
  blueSoft: "#dbeafe",
  blueDark: "#1d4ed8",
  blueLight: "#93c5fd",
  
  // Accent colors
  amber: "#d97706",    // More vibrant amber
  amberSoft: "#fef3c7",
  amberDark: "#b45309",
  
  // Status colors
  red: "#dc2626",      // Clear error red
  redSoft: "#fee2e2",
  redDark: "#b91c1c",
  
  // Neutral
  slate: "#64748b",    // Modern slate
  slateSoft: "#f1f5f9",
  slateDark: "#475569",
  
  // Purple
  purple: "#7c3aed",   // Vibrant purple
  purpleSoft: "#ede9fe",
  purpleDark: "#6d28d9",
  
  // Orange
  orange: "#ea580c",   // Vibrant orange
  orangeSoft: "#fff7ed",
  orangeDark: "#c2410c",
  
  // Teal
  teal: "#0d9488",     // Modern teal
  tealSoft: "#ccfbf1",
  tealDark: "#0f766e",
  
  // Shadows
  shadowSm: "0 1px 2px 0 rgba(0, 0, 0, 0.05)",
  shadow: "0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)",
  shadowMd: "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
  shadowLg: "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)",
  shadowXl: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
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
