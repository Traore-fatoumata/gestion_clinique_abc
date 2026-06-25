/**
 * ═══════════════════════════════════════════════════════════
 *  DIABÉTOLOGIE — Constantes & Examens spécifiques
 *  ═══════════════════════════════════════════════════════════
 */

// Examens spécifiques à la diabétologie
export const EXAMENS_DIABETO = {
  "Bilan glycémique": [
    "Glycémie à jeun",
    "Glycémie postprandiale",
    "HbA1c (Hémoglobine glyquée)",
    "Hyperglycémie provoquée par voie orale (HGPO)",
    "Glycémie capillaire (dextro)",
    "Fructosamine",
  ],
  "Bilan du diabète": [
    "Microalbuminurie",
    "Créatininémie",
    "Clairance de la créatinine",
    "Bilan lipidique complet",
    "Fond d'œil",
    "Échodoppler des artères des membres inférieurs",
    "Mesure de la pression systolique à la cheville",
    "Monofilament de Semmes-Weinstein",
    "Diapason (vibration)",
  ],
  "Bilan auto-immun": [
    "Anticorps anti-GAD",
    "Anticorps anti-IA2",
    "Anticorps anti-insuline",
    "Anticorps anti-îlots (ICA)",
    "Anticorps anti-ZnT8",
  ],
  "Bilan des complications": [
    "Échographie rénale",
    "Échographie hépatique (stéatose)",
    "Électromyogramme (neuropathie)",
    "Bilan urodynamique",
    "Échocardiographie",
    "Coronarographie",
  ],
}

// Symptômes spécifiques diabétologie
export const SYMPTOMES_DIABETO = [
  "Soif intense (polydipsie)",
  "Faim excessive (polyphagie)",
  "Urines abondantes (polyurie)",
  "Perte de poids inexpliquée",
  "Fatigue anormale",
  "Vision trouble",
  "Cicatrisation lente",
  "Infections répétées",
  "Engourdissements des extrémités",
  "Brûlures des pieds",
  "Hypoglycémie",
  "Hyperglycémie",
  "Acétonémie",
  "Haleine fruitée",
  "Nausées",
  "Vomissements",
  "Douleurs abdominales",
  "Confusion",
]

// Pathologies courantes en diabétologie
export const PATHOLOGIES_DIABETO = [
  "Diabète de type 1",
  "Diabète de type 2",
  "Diabète gestationnel",
  "Pré-diabète",
  "Intolérance au glucose",
  "Hyperglycémie",
  "Hypoglycémie",
  "Acido-cétose diabétique",
  "Coma hyperosmolaire",
  "Rétinopathie diabétique",
  "Néphropathie diabétique",
  "Neuropathie diabétique",
  "Pied diabétique",
  "Artériopathie des membres inférieurs",
  "Syndrome métabolique",
  "Obésité",
  "Dyslipidémie",
  "Hypertension artérielle",
  "Stéatose hépatique non alcoolique",
]

// Traitements courants en diabétologie
export const TRAITEMENTS_DIABETO = [
  "Insuline rapide",
  "Insuline lente",
  "Insuline mixte",
  "Metformine",
  "Sulfamides hypoglycémiants",
  "Glinides",
  "Inhibiteurs des alpha-glucosidases",
  "Gliptines (inhibiteurs de la DPP-4)",
  "Analogues du GLP-1",
  "Inhibiteurs des SGLT2",
  "Glucagon",
  "Vitamine B (neuropathie)",
]

// Couleurs spécifiques
export const C_DIABETO = {
  primary: "#2563eb",     // Bleu diabétologie
  primarySoft: "#eff6ff",
  secondary: "#1d4ed8",
  border: "#bfdbfe",
}

export default {
  EXAMENS_DIABETO,
  SYMPTOMES_DIABETO,
  PATHOLOGIES_DIABETO,
  TRAITEMENTS_DIABETO,
  C_DIABETO,
}