/**
 * ═══════════════════════════════════════════════════════════
 *  DIABÉTOLOGIE — Constantes pour le formulaire de consultation
 *  ═══════════════════════════════════════════════════════════
 */

/**
 * Valeurs par défaut pour une consultation de diabétologie
 */
export const CONSULTATION_DIABETO_DEFAULT = {
  // Signes vitaux
  poids: "",
  taille: "",
  imc: "",
  taSystolique: "",
  taDiastolique: "",
  tourDeTaille: "",
  
  // Type de diabète
  typeDiabete: "",
  dateDiagnostic: "",
  ancienneteDiabete: "",
  
  // Surveillance glycémique
  hba1c: "",
  dateHba1c: "",
  glycemieMatinale: "",
  glycemiePostPrandiale: "",
  frequenceSurveillance: "",
  
  // Symptômes
  soif: "",
  polyurie: "",
  fatigue: "",
  troublesVision: "",
  engourdissements: "",
  plaiesPieds: "",
  
  // Traitement
  traitementActuel: "",
  insuline: false,
  typeInsuline: "",
  dosesInsuline: "",
  antidiabetiquesOraux: "",
  observanceTraitement: "",
  effetsSecondaires: "",
  
  // Complications
  retinopathie: "",
  nephropathie: "",
  neuropathie: "",
  piedDiabetique: "",
  maladieCardiovasculaire: "",
  
  // Examens de suivi
  microalbuminurie: "",
  creatinine: "",
  dfg: "",
  bilanLipidique: "",
  fondOeil: "",
  dateDernierFondOeil: "",
  
  // Mode de vie
  alimentation: "",
  activitePhysique: "",
  tabac: "",
  alcool: "",
  
  // Éducation thérapeutique
  connaissanceMaladie: "",
  techniqueInjection: "",
  surveillancePieds: "",
  gestionHypoglycemie: "",
  
  // Conclusion
  diagnosticPrincipal: "",
  objectifsGlycemiques: "",
  planTraitement: "",
  recommandations: "",
  prochainRDV: "",
}

/**
 * Types de diabète
 */
export const TYPES_DIABETE = [
  { valeur: "type1", label: "Diabète de type 1" },
  { valeur: "type2", label: "Diabète de type 2" },
  { valeur: "gestationnel", label: "Diabète gestationnel" },
  { valeur: "autre", label: "Autre type" },
]

/**
 * Niveaux d'HbA1c cibles
 */
export const OBJECTIFS_HBA1C = {
  "adulte_type2": { min: 6.5, max: 7.0, label: "Adulte DT2 : 6.5-7.0%" },
  "adulte_type1": { min: 7.0, max: 7.5, label: "Adulte DT1 : 7.0-7.5%" },
  "personne_agee": { min: 7.5, max: 8.5, label: "Personne âgée : 7.5-8.5%" },
  "femme_enceinte": { min: 6.0, max: 6.5, label: "Femme enceinte : 6.0-6.5%" },
}

/**
 * Types d'insuline
 */
export const TYPES_INSULINE = [
  "Insuline rapide (Actrapid, Humuline R)",
  "Insuline ultrarapide (Lispro, Aspart, Glulisine)",
  "Insuline intermédiaire (NPH)",
  "Insuline lente (Glargine, Detemir)",
  "Insuline ultralente (Degludec)",
  "Mélanges fixes (30/70, 25/75, 50/50)",
]

/**
 * Antidiabétiques oraux
 */
export const ANTIDIABETIQUES_ORAUX = [
  "Metformine",
  "Sulfamides hypoglycémiants (Glibenclamide, Gliclazide)",
  "Glinides (Repaglinide)",
  "Inhibiteurs des alpha-glucosidases (Acarbose)",
  "Thiazolidinediones (Pioglitazone)",
  "Inhibiteurs de la DPP-4 (Sitagliptine, Vildagliptine)",
  "Agonistes des récepteurs du GLP-1 (exénatide, liraglutide)",
  "Inhibiteurs des SGLT2 (Dapagliflozine, Empagliflozine)",
]

/**
 * Stades de la neuropathie diabétique
 */
export const STADES_NEUROPATHIE = [
  { stade: "0", description: "Aucun symptôme" },
  { stade: "1", description: "Symptômes légers, réflexes présents" },
  { stade: "2", description: "Symptômes modérés, réflexes diminués" },
  { stade: "3", description: "Symptômes sévères, réflexes abolis" },
]

/**
 * Classification du pied diabétique (University of Texas)
 */
export const CLASSIFICATION_PIED_DIABETIQUE = [
  { grade: "0", description: "Pas de plaie" },
  { grade: "I", description: "Plaie superficielle" },
  { grade: "II", description: "Atteinte tendon/capsule" },
  { grade: "III", description: "Atteinte osseuse/abcès" },
]