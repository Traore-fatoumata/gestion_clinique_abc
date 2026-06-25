/**
 * ═══════════════════════════════════════════════════════════
 *  CARDIOLOGIE — Constantes pour le formulaire de consultation
 *  ═══════════════════════════════════════════════════════════
 */

/**
 * Valeurs par défaut pour une consultation de cardiologie
 */
export const CONSULTATION_CARDIO_DEFAULT = {
  // Signes vitaux spécifiques
  taSystolique: "",
  taDiastolique: "",
  frequenceCardiaque: "",
  frequenceRespiratoire: "",
  saturationO2: "",
  poids: "",
  taille: "",
  imc: "",

  // Antécédents cardiovasculaires
  antecédentsCardiaques: "",
  antecédentsFamiliaux: "",
  facteursRisque: [],
  
  // Symptômes cardiaques spécifiques
  douleurThoracique: "",
  dyspnee: "",
  palpitations: "",
  syncopes: "",
  oedemes: "",
  orthopnee: "",
  
  // Examen clinique cardiovasculaire
  auscultationCardiaque: "",
  souffle: "",
  bruitsSurajoutes: "",
  pouls: "",
  turgescenceJugulaire: "",
  hepatomegalie: "",
  
  // Examens complémentaires
  ecgFait: false,
  ecgResultat: "",
  echoCardioFait: false,
  echoCardioResultat: "",
  holterFait: false,
  holterResultat: "",
  testEffortFait: false,
  testEffortResultat: "",
  
  // Traitements cardiologiques
  traitementEnCours: "",
  observanceTraitement: "",
  
  // Évaluation fonctionnelle
  classeNYHA: "",
  scoreRisque: "",
  
  // Conclusion
  diagnosticPrincipal: "",
  diagnosticsSecondaires: "",
  planTraitement: "",
  recommandations: "",
  prochainRDV: "",
}

/**
 * Classes NYHA (New York Heart Association) pour l'insuffisance cardiaque
 */
export const CLASSES_NYHA = [
  { valeur: "I", label: "Classe I - Aucune limitation", desc: "Activité physique ordinaire ne provoque pas de symptômes" },
  { valeur: "II", label: "Classe II - Légère limitation", desc: "Confortable au repos, activité ordinaire provoque symptômes" },
  { valeur: "III", label: "Classe III - Limitation marquée", desc: "Confortable au repos, activité inférieure à l'ordinaire provoque symptômes" },
  { valeur: "IV", label: "Classe IV - Incapacité totale", desc: "Symptômes au repos, toute activité augmente l'inconfort" },
]

/**
 * Facteurs de risque cardiovasculaire
 */
export const FACTEURS_RISQUE_CARDIO = [
  "Hypertension artérielle",
  "Diabète",
  "Dyslipidémie",
  "Tabagisme",
  "Obésité",
  "Sédentarité",
  "Antécédents familiaux",
  "Âge (>55 ans homme, >65 ans femme)",
  "Stress",
  "Consommation d'alcool",
]