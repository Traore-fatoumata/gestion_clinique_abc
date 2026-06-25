/**
 * ═══════════════════════════════════════════════════════════
 *  GYNÉCOLOGIE — Constantes pour le formulaire de consultation
 *  ═══════════════════════════════════════════════════════════
 * 
 *  Basé sur le registre papier de la clinique pour le suivi
 *  complet des consultations gynécologiques et prénatales (CPN).
 */

/**
 * Valeurs par défaut pour une consultation de gynécologie
 */
export const CONSULTATION_GYNECO_DEFAULT = {
  // 1. Informations administratives
  date_consultation: "",
  nom: "",
  prenom: "",
  age: "",
  adresse: "",
  telephone: "",
  profession: "",
  personne_contact: "",

  // 2. Antécédents
  antecedents_medicaux: "",
  antecedents_chirurgicaux: "",
  antecedents_gyneco: "",
  antecedents_obstetricaux: "",
  allergies: "",
  traitements_cours: "",

  // 3. Historique obstétrical
  gestite: "",
  parite: "",
  avortements: "",
  enfants_vivants: "",
  cesariennes_anterieures: "",
  morts_nés: "",
  grossesses_multiples: "",

  // 4. Données de grossesse actuelle
  ddr: "",
  dpa: "",
  age_gestationnel: "",
  nb_consultations_prenatales: "",
  grossesse_risque: false,
  description_risque: "",

  // 5. Examen clinique
  poids: "",
  taille: "",
  imc: "",
  temperature: "",
  tension: "",
  frequence_cardiaque: "",
  œdèmes: false,
  conjonctives: "",
  etat_general: "",

  // 6. Examen obstétrical
  hauteur_uterine: "",
  presentation_fœtale: "",
  maf: "",
  bcf: "",
  nombre_fœtus: "",
  position_fœtus: "",
  col_uterin: "",
  pertes_vaginales: "",
  liquide_amniotique: "",

  // 7. Suivi CPN
  cpn1: false,
  date_cpn1: "",
  cpn2: false,
  date_cpn2: "",
  cpn3: false,
  date_cpn3: "",
  cpn4: false,
  date_cpn4: "",
  referée: false,
  risque_identifie: false,

  // 8. Prévention paludisme
  sp1: false,
  sp2: false,
  sp3: false,
  sp4: false,
  mild_distribuee: false,

  // 9. Vaccination
  vat1: false,
  vat2: false,
  vat3: false,
  vat4: false,
  vat5: false,
  completement_vaccinee: false,

  // 10. Dépistages biologiques
  vih: "",
  syphilis: "",
  hepatite_b: "",
  glycemie: "",
  groupe_sanguin: "",
  rhesus: "",
  nfs: "",
  ecbu: "",
  autres_examens: "",

  // 11. PTME
  statut_vih_connu: false,
  conseillee_vih: false,
  testee_vih: false,
  resultat_vih: "",
  post_test: false,
  azt: false,
  ctx: false,
  cd4: "",
  tarv: false,
  partenaire_teste_vih: false,
  resultat_vih_partenaire: "",

  // 12. Diagnostic
  diagnostic_principal: "",
  diagnostics_associes: "",
  niveau_gravite: "",

  // 13. Traitement
  medicaments_prescrits: "",
  posologie: "",
  duree: "",
  conseils: "",

  // 14. Référence
  referée_autre_service: false,
  motif_reference: "",
  structure_reference: "",

  // 15. Conclusion
  anemie: false,
  constats_problemes: "",
  observations: "",
  prochain_rdv: "",
}

/**
 * Groupes sanguins
 */
export const GROUPES_SANGUINS = ["A", "B", "AB", "O"]

/**
 * Rhésus
 */
export const RHESUS = ["Positif (+)", "Négatif (-)"]

/**
 * Résultats de dépistage
 */
export const RESULTATS_DEPISTAGE = ["Négatif", "Positif", "Indéterminé", "Non fait"]

/**
 * Présentations fœtales
 */
export const PRESENTATIONS_FŒTALES = [
  "Céphalique",
  "Siège",
  "Transversale",
  "Non déterminée",
]

/**
 * Niveaux de gravité
 */
export const NIVEAUX_GRAVITE = [
  "Faible",
  "Modéré",
  "Élevé",
  "Urgence",
]

/**
 * États des conjonctives
 */
