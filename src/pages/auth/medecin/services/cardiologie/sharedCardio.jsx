/**
 * ═══════════════════════════════════════════════════════════
 *  CARDIOLOGIE — Constantes & Examens spécifiques
 *  ═══════════════════════════════════════════════════════════
 */

// Examens spécifiques à la cardiologie
export const EXAMENS_CARDIO = {
  "Électrocardiogramme": [
    "ECG de repos",
    "ECG d'effort",
    "ECG Holter 24h",
    "ECG Holter tensionnel (MAPA)",
  ],
  "Échocardiographie": [
    "Échocardiographie transthoracique",
    "Échocardiographie transœsophagienne",
    "Échocardiographie de stress",
    "Échodoppler cardiaque",
    "Échodoppler des vaisseaux du cou",
    "Échodoppler des membres inférieurs",
    "Échodoppler des membres supérieurs",
    "Échodoppler des artères rénales",
  ],
  "Explorations fonctionnelles": [
    "Épreuve d'effort",
    "Test d'effort cardiopulmonaire",
    "Holter ECG 24h",
    "Holter tensionnel 24h (MAPA)",
    "Enregistrement événementiel",
    "Tilt test",
  ],
  "Coronarographie": [
    "Coronarographie diagnostique",
    "Angioplastie coronaire",
    "Pose de stent",
    "FFR (Fractional Flow Reserve)",
    "IVUS (Intravascular Ultrasound)",
    "OCT (Optical Coherence Tomography)",
  ],
  "Stimulation cardiaque": [
    "Pose de pacemaker",
    "Pose de défibrillateur (DAI)",
    "Resynchronisation cardiaque (TRC)",
    "Changement de boîtier",
    "Contrôle de stimulateur",
  ],
  "Explorations électrophysiologiques": [
    "Exploration électrophysiologique endocavitaire",
    "Ablation par radiofréquence",
    "Ablation par cryothérapie",
  ],
  "Bilan biologique cardiologique": [
    "Troponine",
    "BNP / NT-proBNP",
    "D-Dimères",
    "Bilan lipidique complet",
    "Homocystéine",
    "CRP ultrasensible",
    "Fibrinogène",
  ],
}

// Symptômes spécifiques cardiologie
export const SYMPTOMES_CARDIO = [
  "Douleur thoracique",
  "Oppression thoracique",
  "Palpitations",
  "Essoufflement (dyspnée)",
  "Œdèmes des membres inférieurs",
  "Syncope",
  "Lipothymie",
  "Vertiges",
  "Toux sèche",
  "Fatigue anormale",
  "Cyanose",
  "Claudication intermittente",
]

// Pathologies courantes en cardiologie
export const PATHOLOGIES_CARDIO = [
  "Hypertension artérielle (HTA)",
  "Insuffisance cardiaque",
  "Cardiopathie ischémique",
  "Infarctus du myocarde",
  "Angine de poitrine",
  "Troubles du rythme cardiaque",
  "Fibrillation auriculaire",
  "Tachycardie",
  "Bradycardie",
  "Valvulopathie",
  "Rétrécissement aortique",
  "Insuffisance mitrale",
  "Cardiomyopathie",
  "Péricardite",
  "Endocardite",
  "Artériopathie des membres inférieurs",
  "Anévrisme de l'aorte",
  "Thrombose veineuse profonde",
  "Embolie pulmonaire",
]

// Traitements courants en cardiologie
export const TRAITEMENTS_CARDIO = [
  "Aspirine",
  "Clopidogrel",
  "Statines",
  "Bêta-bloquants",
  "Inhibiteurs de l'enzyme de conversion (IEC)",
  "Antagonistes des récepteurs de l'angiotensine II (ARA II)",
  "Calcium-bloquants",
  "Diurétiques",
  "Anticoagulants (AVK, AOD)",
  "Anti-arythmiques",
  "Dérivés nitrés",
  "Inhibiteurs des canaux If (Ivabradine)",
]

// Couleurs spécifiques
export const C_CARDIO = {
  primary: "#dc2626",     // Rouge cardiologie
  primarySoft: "#fef2f2",
  secondary: "#991b1b",
  border: "#fecaca",
}

export default {
  EXAMENS_CARDIO,
  SYMPTOMES_CARDIO,
  PATHOLOGIES_CARDIO,
  TRAITEMENTS_CARDIO,
  C_CARDIO,
}