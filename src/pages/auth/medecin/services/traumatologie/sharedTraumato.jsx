/**
 * ═══════════════════════════════════════════════════════════
 *  TRAUMATOLOGIE — Constantes & Examens spécifiques
 *  ═══════════════════════════════════════════════════════════
 */

// Examens spécifiques à la traumatologie
export const EXAMENS_TRAUMATO = {
  "Imagerie osseuse": [
    "Radiographie standard",
    "Radiographie avec clichés dynamiques",
    "Scanner osseux",
    "IRM ostéo-articulaire",
    "Échographie musculo-squelettique",
    "Scintigraphie osseuse",
    "Ostéodensitométrie (DEXA)",
    "Arthroscanner",
    "Arthro-IRM",
  ],
  "Examens articulaires": [
    "Arthroscopie diagnostique",
    "Ponction articulaire",
    "Analyse du liquide synovial",
    "Biopsie synoviale",
    "Test de stabilité ligamentaire",
    "Mesure de l'amplitude articulaire",
    "Test de Lachman",
    "Test de tiroir",
    "Test de McMurray",
  ],
  "Examens neurologiques périphériques": [
    "Électromyogramme (EMG)",
    "Électroneurogramme (ENG)",
    "Potentiels évoqués somesthésiques",
    "Test de conduction nerveuse",
  ],
  "Bilan biologique": [
    "Calcium",
    "Phosphore",
    "Vitamine D",
    "Parathormone (PTH)",
    "Marqueurs du remodelage osseux",
    "Phosphatases alcalines",
    "CRP",
    "VS",
    "Facteur rhumatoïde",
    "ACPA",
  ],
  "Examens fonctionnels": [
    "Bilan de marche",
    "Analyse posturale",
    "Test de force musculaire",
    "Mesure de la longueur des membres",
    "Évaluation de la mobilité",
  ],
}

// Symptômes spécifiques traumatologie
export const SYMPTOMES_TRAUMATO = [
  "Douleur osseuse",
  "Douleur articulaire",
  "Douleur musculaire",
  "Gonflement",
  "Hématome",
  "Déformation",
  "Impotence fonctionnelle",
  "Difficulté à marcher",
  "Boiterie",
  "Enraidissement",
  "Craquements articulaires",
  "Dérobement",
  "Blocage articulaire",
  "Fourmillements",
  "Engourdissements",
  "Perte de force",
  "Atrophie musculaire",
  "Raccourcissement du membre",
  "Rotation anormale",
  "Plaie ouverte",
]

// Pathologies courantes en traumatologie
export const PATHOLOGIES_TRAUMATO = [
  "Fracture fermée",
  "Fracture ouverte",
  "Fracture déplacée",
  "Fracture comminutive",
  "Fracture de fatigue",
  "Fracture du col du fémur",
  "Fracture du radius",
  "Fracture de la clavicule",
  "Fracture vertébrale",
  "Entorse",
  "Entorse de la cheville",
  "Entorse du genou",
  "Rupture des ligaments croisés",
  "Rupture des ligaments collatéraux",
  "Luxation",
  "Luxation de l'épaule",
  "Luxation de la hanche",
  "Luxation du genou",
  "Déchirure musculaire",
  "Élongation musculaire",
  "Tendinite",
  "Tendinopathie",
  "Rupture du tendon d'Achille",
  "Rupture de la coiffe des rotateurs",
  "Épicondylite (tennis elbow)",
  "Syndrome du canal carpien",
  "Arthrose",
  "Ostéoporose",
  "Ostéoporose post-ménopausique",
  "Ostéomyélite",
  "Tumeur osseuse",
  "Métastase osseuse",
  "Nécrose avasculaire",
  "Ostéochondrite",
  "Maladie de Paget",
]

// Traitements courants en traumatologie
export const TRAITEMENTS_TRAUMATO = [
  "Plâtre",
  "Résine",
  "Attelle",
  "Orthèse",
  "Prothèse",
  "Corset",
  "Collier cervical",
  "Canne",
  "Béquilles",
  "Déchargeur",
  "Anti-inflammatoires",
  "Antalgiques",
  "Myorelaxants",
  "Infiltrations",
  "Viscosupplémentation",
  "Ostéosynthèse",
  "Enclouage",
  "Plaque et vis",
  "Fixateur externe",
  "Arthroplastie",
  "Arthrodèse",
  "Ostéotomie",
  "Greffe osseuse",
  "Rééducation fonctionnelle",
  "Kinésithérapie",
]

// Couleurs spécifiques
export const C_TRAUMATO = {
  primary: "#ea580c",     // Orange traumatologie
  primarySoft: "#fff7ed",
  secondary: "#c2410c",
  border: "#fed7aa",
}

export default {
  EXAMENS_TRAUMATO,
  SYMPTOMES_TRAUMATO,
  PATHOLOGIES_TRAUMATO,
  TRAITEMENTS_TRAUMATO,
  C_TRAUMATO,
}