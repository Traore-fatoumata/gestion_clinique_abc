/**
 * ═══════════════════════════════════════════════════════════
 *  NEUROLOGIE — Constantes pour le formulaire de consultation
 *  ═══════════════════════════════════════════════════════════
 */

/**
 * Valeurs par défaut pour une consultation de neurologie
 */
export const CONSULTATION_NEURO_DEFAULT = {
  // Informations générales
  motifConsultation: "",
  modeDebut: "",
  evolution: "",
  
  // Échelles d'évaluation
  scoreGlasgow: "",
  scoreNIHSS: "",
  scoreRankin: "",
  scoreMMSE: "",
  
  // Symptômes neurologiques
  cephalées: "",
  vertiges: "",
  troublesVision: "",
  troublesParole: "",
  troublesDeglutition: "",
  faiblesseMembres: "",
  troublesSensibilite: "",
  tremblements: "",
  convulsions: "",
  troublesConscience: "",
  troublesMemoire: "",
  troublesEquilibre: "",
  
  // Examen neurologique
  etatConscience: "",
  orientation: "",
  langage: "",
  
  // Nerfs crâniens
  nerfsCraniens: "",
  
  // Motricité
  forceMembreSuperieurD: "",
  forceMembreSuperieurG: "",
  forceMembreInferieurD: "",
  forceMembreInferieurG: "",
  tonusMusculaire: "",
  mouvementsAnormaux: "",
  
  // Sensibilité
  sensibiliteTactile: "",
  sensibiliteThermoalgique: "",
  sensibiliteProfonde: "",
  
  // Réflexes
  reflexesOsteotendineux: "",
  reflexesCutanes: "",
  signeBabinski: "",
  
  // Coordination et équilibre
  epreuveDoigtNez: "",
  epreuveGenouTalon: "",
  Romberg: "",
  marche: "",
  
  // Examens complémentaires
  scannerFait: false,
  scannerResultat: "",
  IRMFait: false,
  IRMResultat: "",
  EEGFait: false,
  EEGResultat: "",
  EMGFait: false,
  EMGResultat: "",
  PLFait: false,
  PLResultat: "",
  
  // Traitements
  traitementEnCours: "",
  observanceTraitement: "",
  
  // Conclusion
  diagnosticPrincipal: "",
  diagnosticsSecondaires: "",
  planTraitement: "",
  recommandations: "",
  prochainRDV: "",
}

/**
 * Scores de Glasgow
 */
export const ECHELLE_GLASGOW = {
  ouvertureYeux: [
    { score: 4, description: "Spontanée" },
    { score: 3, description: "À la demande" },
    { score: 2, description: "À la douleur" },
    { score: 1, description: "Aucune" },
  ],
  reponseVerbale: [
    { score: 5, description: "Orientée" },
    { score: 4, description: "Confuse" },
    { score: 3, description: "Mots inappropriés" },
    { score: 2, description: "Sons inintelligibles" },
    { score: 1, description: "Aucune" },
  ],
  reponseMotrice: [
    { score: 6, description: "Obéit aux ordres" },
    { score: 5, description: "Localise la douleur" },
    { score: 4, description: "Évitement normal" },
    { score: 3, description: "Flexion anormale" },
    { score: 2, description: "Extension anormale" },
    { score: 1, description: "Aucune" },
  ],
}

/**
 * Stades de la maladie de Parkinson (Hoehn & Yahr)
 */
export const STADES_PARKINSON = [
  { stade: "1", description: "Unilatéral" },
  { stade: "1.5", description: "Unilatéral + axe" },
  { stade: "2", description: "Bilatéral sans trouble de l'équilibre" },
  { stade: "2.5", description: "Bilatéral léger avec récupération au test de pull" },
  { stade: "3", description: "Bilatéral modéré avec troubles de l'équilibre" },
  { stade: "4", description: "Sévère, marche possible avec aide" },
  { stade: "5", description: "Grabataire ou en fauteuil sans aide" },
]

/**
 * Types de crises épileptiques
 */
export const TYPES_CRISES_EPILEPTIQUES = [
  "Crise tonico-clonique généralisée",
  "Crise d'absence",
  "Crise myoclonique",
  "Crise tonique",
  "Crise atonique",
  "Crise partielle simple",
  "Crise partielle complexe",
  "Crise partielle secondarisée généralisée",
  "État de mal épileptique",
]

/**
 * Médicaments antiépileptiques courants
 */
export const ANTIEPILEPTIQUES = [
  "Acide valproïque (Dépakine)",
  "Carbamazépine (Tégrétol)",
  "Lamotrigine (Lamictal)",
  "Lévétiracétam (Keppra)",
  "Topiramate (Epitomax)",
  "Gabapentine (Neurontin)",
  "Prégabaline (Lyrica)",
  "Phénytoïne (Dihydan)",
  "Phénobarbital",
  "Oxcarbazépine (Trileptal)",
]

/**
 * Échelle de Rankin modifiée (handicap)
 */
export const ECHELLE_RANKIN = [
  { score: 0, description: "Aucun symptôme" },
  { score: 1, description: "Aucune incapacité significative" },
  { score: 2, description: "Incapacité légère" },
  { score: 3, description: "Incapacité modérée" },
  { score: 4, description: "Incapacité modérément sévère" },
  { score: 5, description: "Incapacité sévère" },
  { score: 6, description: "Décès" },
]

/**
 * Causes fréquentes de céphalées
 */
export const CAUSES_CEPHALEES = [
  "Migraine",
  "Céphalée de tension",
  "Algie vasculaire de la face",
  "Céphalée par hypertension intracrânienne",
  "Céphalée par hypotension intracrânienne",
  "Céphalée post-traumatique",
  "Névralgie du trijumeau",
  "Artérite temporale",
]