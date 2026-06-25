/**
 * ═══════════════════════════════════════════════════════════
 *  PÉDIATRIE — Constantes pour le formulaire de consultation
 *  ═══════════════════════════════════════════════════════════
 */

/**
 * Valeurs par défaut pour une consultation de pédiatrie
 */
export const CONSULTATION_PEDO_DEFAULT = {
  // Données anthropométriques
  poids: "",
  taille: "",
  perimetreCrânien: "",
  imc: "",
  
  // Données de naissance (pour les nourrissons)
  ageGestationnel: "",
  poidsNaissance: "",
  tailleNaissance: "",
  perimetreCrânienNaissance: "",
  apgar1: "",
  apgar5: "",
  modeAlimentation: "",
  
  // Développement de l'enfant
  ageCorrectionnel: "",
  etapesDevelopment: "",
  
  // Vaccinations
  statutVaccinal: "",
  vaccinsRecus: [],
  vaccinsEnRetard: "",
  prochainVaccin: "",
  
  // Alimentation
  modeAlimentationActuel: "",
  diversificationAlimentaire: "",
  difficultesAlimentaires: "",
  
  // Sommeil
  qualiteSommeil: "",
  heuresSommeil: "",
  difficultesSommeil: "",
  
  // Croissance et développement
  courbePoids: "",
  courbeTaille: "",
  courbePC: "",
  percentilePoids: "",
  percentileTaille: "",
  percentilePC: "",
  
  // Examen clinique pédiatrique
  etatGeneral: "",
  examenPeau: "",
  examenYeux: "",
  examenOreilles: "",
  examenBouche: "",
  examenThorax: "",
  examenAbdomen: "",
  examenGenital: "",
  examenNeuro: "",
  examenMembres: "",
  
  // Symptômes spécifiques
  fievre: "",
  toux: "",
  vomissements: "",
  diarrhee: "",
  eruption: "",
  douleur: "",
  
  // Conclusion
  diagnosticPrincipal: "",
  diagnosticsSecondaires: "",
  planTraitement: "",
  recommandations: "",
  prochainRDV: "",
  orientation: "",
}

/**
 * Étapes de développement par âge
 */
export const ETAPES_DEVELOPPEMENT = {
  "2 mois": [
    "Sourire social",
    "Suit des yeux",
    "Tient sa tête",
    "Raconte (vocalises)",
  ],
  "4 mois": [
    "Attrape les objets",
    "Se retourne",
    "Rit aux éclats",
    "Tient assis avec soutien",
  ],
  "6 mois": [
    "Tient assis sans soutien",
    "Babillage",
    "Attrape au vol",
    "Reconnaît les visages",
  ],
  "9 mois": [
    "Se déplace (rampe/marche 4 pattes)",
    "Pince pouce-index",
    "Dit 'papa/maman' spécifique",
    "Comprend 'non'",
  ],
  "12 mois": [
    "Premiers pas",
    "Premiers mots",
    "Montre du doigt",
    "Imite les gestes",
  ],
  "18 mois": [
    "Marche bien",
    "Dit plusieurs mots",
    "Désigne les parties du corps",
    "Joue à faire semblant",
  ],
  "2 ans": [
    "Court",
    "Phrases de 2-3 mots",
    "Monte les escaliers",
    "Utilise la cuillère",
  ],
}

/**
 * Calendrier vaccinal (Guinée - Programme Élargi de Vaccination)
 */
export const VACCINS_PEV = [
  { nom: "BCG", age: "Naissance", voie: "ID" },
  { nom: "VPO 0", age: "Naissance", voie: "Orale" },
  { nom: "VPO 1", age: "6 semaines", voie: "Orale" },
  { nom: "Pentavalent 1", age: "6 semaines", voie: "IM" },
  { nom: "VPI", age: "6 semaines", voie: "IM" },
  { nom: "VPO 2", age: "10 semaines", voie: "Orale" },
  { nom: "Pentavalent 2", age: "10 semaines", voie: "IM" },
  { nom: "VPO 3", age: "14 semaines", voie: "Orale" },
  { nom: "Pentavalent 3", age: "14 semaines", voie: "IM" },
  { nom: "Rougeole 1", age: "9 mois", voie: "SC" },
  { nom: "VAA (Vitamine A)", age: "9 mois", voie: "Orale" },
  { nom: "Rougeole 2", age: "15 mois", voie: "SC" },
  { nom: "VAA (6-59 mois)", age: "Tous les 6 mois", voie: "Orale" },
]

/**
 * Modes d'alimentation du nourrisson
 */
export const MODES_ALIMENTATION = [
  "Allaitement maternel exclusif",
  "Allaitement maternel + compléments",
  "Lait infantile 1er âge",
  "Lait infantile 2ème âge",
  "Alimentation diversifiée",
  "Alimentation familiale",
]