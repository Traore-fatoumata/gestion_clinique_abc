/**
 * ═══════════════════════════════════════════════════════════
 *  OPHTALMOLOGIE — Constantes & Examens spécifiques
 *  ═══════════════════════════════════════════════════════════
 */

// Examens spécifiques à l'ophtalmologie
export const EXAMENS_OPHTALMO = {
  "Examens de la vision": [
    "Acuité visuelle de loin",
    "Acuité visuelle de près",
    "Réfraction (verre)",
    "Rétinoscopie",
    "Autoréfractométrie",
    "Kératométrie",
    "Topographie cornéenne",
    "Aberrométrie",
    "Vision des couleurs (test d'Ishihara)",
    "Vision binoculaire",
    "Test de Worth",
    "Stereo-test",
  ],
  "Examens du segment antérieur": [
    "Biomicroscopie (lampe à fente)",
    "Gonioscopie",
    "Pachymétrie cornéenne",
    "Microscopie spéculaire",
    "Tonometrie (pression intraoculaire)",
    "Kératotopographie",
    "OCT segment antérieur",
  ],
  "Examens du segment postérieur": [
    "Fond d'œil",
    "OCT maculaire",
    "OCT nerf optique",
    "Rétinographie",
    "Angiographie à la fluorescéine",
    "Angiographie au vert d'indocyanine",
    "Échographie oculaire",
    "Champ visuel (périmétrie)",
    "Rétinographie automatique",
  ],
  "Examens fonctionnels": [
    "Électrorétinogramme (ERG)",
    "Électro-oculogramme (EOG)",
    "Potentiels évoqués visuels (PEV)",
    "Test de vision des contrastes",
    "Test d'éblouissement",
    "Mesure de la sensibilité rétinienne",
  ],
  "Examens de la sécheresse oculaire": [
    "Test de Schirmer",
    "Test au bleu de lissamine",
    "Test à la fluorescéine",
    "Temps de rupture du film lacrymal",
    "Os molarité des larmes",
  ],
}

// Symptômes spécifiques ophtalmologie
export const SYMPTOMES_OPHTALMO = [
  "Baisse de l'acuité visuelle",
  "Vision floue",
  "Vision double (diplopie)",
  "Douleurs oculaires",
  "Yeux rouges",
  "Démangeaisons oculaires",
  "Sensation de sable dans les yeux",
  "Larmoiements",
  "Photophobie",
  "Mouches volantes (corps flottants)",
  "Éclairs lumineux (photopsies)",
  "Voile devant l'œil",
  "Perte du champ visuel",
  "Vision déformée (métamorphopsies)",
  "Cercles colorés autour des lumières",
  "Difficulté à lire",
  "Fatigue visuelle",
  "Maux de tête",
  "Strabisme",
  "Ptosis (paupière tombante)",
]

// Pathologies courantes en ophtalmologie
export const PATHOLOGIES_OPHTALMO = [
  "Cataracte",
  "Glaucome",
  "DMLA (Dégénérescence Maculaire Liée à l'Âge)",
  "Rétinopathie diabétique",
  "Décollement de rétine",
  "Occlusion veineuse rétinienne",
  "Occlusion artérielle rétinienne",
  "Kératocône",
  "Conjonctivite",
  "Kératite",
  "Uvéite",
  "Blépharite",
  "Orgelet",
  "Chalazion",
  "Sécheresse oculaire",
  "Presbytie",
  "Myopie",
  "Hypermétropie",
  "Astigmatisme",
  "Amblyopie",
  "Strabisme",
  "Névrite optique",
  "Mélanome de l'uvée",
  "Rétinoblastome",
  "Ptosis",
  "Exophtalmie",
  "Endophtalmie",
  "Traumatisme oculaire",
  "Corps étranger intraoculaire",
]

// Traitements courants en ophtalmologie
export const TRAITEMENTS_OPHTALMO = [
  "Collyres antibiotiques",
  "Collyres anti-inflammatoires",
  "Collyres corticoïdes",
  "Collyres antihistaminiques",
  "Collyres hypotonisants (glaucome)",
  "Collyres mydriatiques",
  "Collyres cycloplégiques",
  "Larmes artificielles",
  "Pommades ophtalmiques",
  "Injections intravitréennes",
  "Implants intravitréens",
  "Laser YAG",
  "Laser argon",
  "Photocoagulation",
  "Chirurgie de la cataracte",
  "Chirurgie réfractive (LASIK, PKR)",
  "Vitrectomie",
  "Sclérotomie",
  "Trabéculectomie",
  "Kératoplastie",
]

// Couleurs spécifiques
export const C_OPHTALMO = {
  primary: "#059669",     // Vert ophtalmologie
  primarySoft: "#ecfdf5",
  secondary: "#047857",
  border: "#a7f3d0",
}

export default {
  EXAMENS_OPHTALMO,
  SYMPTOMES_OPHTALMO,
  PATHOLOGIES_OPHTALMO,
  TRAITEMENTS_OPHTALMO,
  C_OPHTALMO,
}