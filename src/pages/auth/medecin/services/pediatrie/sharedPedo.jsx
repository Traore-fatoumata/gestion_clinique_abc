/**
 * ═══════════════════════════════════════════════════════════
 *  PÉDIATRIE — Constantes & Examens spécifiques
 *  ═══════════════════════════════════════════════════════════
 */

// Examens spécifiques à la pédiatrie
export const EXAMENS_PEDO = {
  "Bilan biologique pédiatrique": [
    "NFS (Numération Formule Sanguine)",
    "Glycémie",
    "Calcium",
    "Phosphore",
    "Vitamine D",
    "Ferritine",
    "Bilan martial complet",
    "Protéine C-réactive (CRP)",
  ],
  "Bilan infectieux": [
    "Sérologie EBV (mononucléose)",
    "Sérologie CMV",
    "Sérologie rougeole",
    "Sérologie rubéole",
    "Sérologie oreillons",
    "Sérologie coqueluche",
    "Prélèvement de gorge",
    "ECBU",
  ],
  "Bilan allergologique": [
    "IgE totales",
    "IgE spécifiques (allergènes)",
    "Tests cutanés (prick tests)",
    "Tryptase",
  ],
  "Bilan métabolique": [
    "Bilan néonatal (Guthrie)",
    "Phénylcétonurie",
    "Hypothyroïdie congénitale",
    "Hyperplasie des surrénales",
    "Dépistage mucoviscidose",
  ],
  "Imagerie pédiatrique": [
    "Échographie cérébrale (fontanelle)",
    "Échographie abdominale",
    "Échographie de hanche",
    "Radiographie thoracique",
    "Radiographie osseuse (âge osseux)",
  ],
  "Explorations fonctionnelles": [
    "EFR (Explorations Fonctionnelles Respiratoires)",
    "Test de la sueur (mucoviscidose)",
    "Bilan orthophonique",
    "Bilan psychomoteur",
    "Test de développement (Denver)",
  ],
  "Suivi de croissance": [
    "Courbe de poids/taille/PC",
    "Bilan de croissance",
    "Bilan pubertaire",
    "Âge osseux",
  ],
}

// Symptômes spécifiques pédiatrie
export const SYMPTOMES_PEDO = [
  "Fièvre",
  "Toux",
  "Rhinite",
  "Diarrhée",
  "Vomissements",
  "Éruptions cutanées",
  "Pleurs inhabituels",
  "Refus alimentaire",
  "Agitation",
  "Somnolence excessive",
  "Ralentissement des selles",
  "Douleur abdominale",
  "Difficultés respiratoires",
  "Cyanose",
  "Convulsions",
  "Retard de développement",
  "Perte de poids",
  "Cassure de la courbe de poids",
]

// Pathologies courantes en pédiatrie
export const PATHOLOGIES_PEDO = [
  "Bronchiolite",
  "Bronchite aiguë",
  "Pneumonie",
  "Gastro-entérite aiguë",
  "Otite moyenne aiguë",
  "Rhino-pharyngite",
  "Angine",
  "Laryngite",
  "Bronchiolite",
  "Asthme",
  "Varicelle",
  "Rougeole",
  "Rubéole",
  "Oreillons",
  "Roséole",
  "Maladie main-pied-bouche",
  "Impétigo",
  "Gale",
  "Myose",
  "Conjonctivite",
  "Déshydratation",
  "Anémie",
  "Allergie alimentaire",
  "Intolérance au lactose",
  "Reflux gastro-œsophagien",
  "Invagination intestinale",
  "Sténose du pylore",
  "Maladies congénitales",
]

// Traitements courants en pédiatrie
export const TRAITEMENTS_PEDO = [
  "Paracétamol",
  "Ibuprofène",
  "Amoxicilline",
  "Amoxicilline-acide clavulanique",
  "Céphalosporines",
  "Macrolides",
  "Antihistaminiques",
  "Corticoïdes",
  "Bronchodilatateurs",
  "Soluté de réhydratation orale (SRO)",
  "Probiotiques",
  "Fer",
  "Vitamine D",
  "Vitamine K",
  "Antipyrétiques",
]

// Couleurs spécifiques
export const C_PEDO = {
  primary: "#f59e0b",     // Orange pédiatrie
  primarySoft: "#fffbeb",
  secondary: "#d97706",
  border: "#fde68a",
}

export default {
  EXAMENS_PEDO,
  SYMPTOMES_PEDO,
  PATHOLOGIES_PEDO,
  TRAITEMENTS_PEDO,
  C_PEDO,
}