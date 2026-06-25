/**
 * ═══════════════════════════════════════════════════════════
 *  INDEX DES SERVICES MÉDICAUX — Point d'entrée unique
 *  ═══════════════════════════════════════════════════════════
 * 
 *  Ce fichier regroupe toutes les configurations des services
 *  médicaux de la clinique. Il sert de point d'entrée unique
 *  pour importer les constantes d'un service spécifique.
 */

// Import des configurations de chaque service
import cardio from './cardiologie/sharedCardio.jsx'
import diabeto from './diabetologie/sharedDiabeto.jsx'
import pedo from './pediatrie/sharedPedo.jsx'
import gyneco from './gynecologie/sharedGyneco.jsx'
import ophtalmo from './ophtalmologie/sharedOphtalmo.jsx'
import traumato from './traumatologie/sharedTraumato.jsx'
import neuro from './neurologie/sharedNeuro.jsx'
import orl from './orl/sharedORL.jsx'
import uro from './urologie/sharedUro.jsx'
import chir from './chirurgie/sharedChir.jsx'
import dermato from './dermatologie/sharedDermato.jsx'
import onco from './oncologie/sharedOnco.jsx'
import malinf from './maladies-infectieuses/sharedMalInf.jsx'
import stomato from './stomatologie/sharedStomato.jsx'

// ═══════════════════════════════════════════════════════════
//  CONFIGURATION DES SERVICES
// ═══════════════════════════════════════════════════════════

export const SERVICES_CONFIG = {
  // Service: Cardiologie
  cardiologie: {
    id: 'cardiologie',
    nom: 'Cardiologie',
    medecin: 'Dr. Camara',
    email: 'medecin@clinique.com',
    couleur: '#dc2626',
    examens: cardio.EXAMENS_CARDIO,
    symptomes: cardio.SYMPTOMES_CARDIO,
    pathologies: cardio.PATHOLOGIES_CARDIO,
    traitements: cardio.TRAITEMENTS_CARDIO,
    couleurs: cardio.C_CARDIO,
  },

  // Service: Diabétologie
  diabetologie: {
    id: 'diabetologie',
    nom: 'Diabétologie',
    medecin: 'Dr. Barry',
    email: 'generaliste@clinique.com',
    couleur: '#2563eb',
    examens: diabeto.EXAMENS_DIABETO,
    symptomes: diabeto.SYMPTOMES_DIABETO,
    pathologies: diabeto.PATHOLOGIES_DIABETO,
    traitements: diabeto.TRAITEMENTS_DIABETO,
    couleurs: diabeto.C_DIABETO,
  },

  // Service: Pédiatrie
  pediatrie: {
    id: 'pediatrie',
    nom: 'Pédiatrie',
    medecin: 'Dr. Souaré',
    email: 'pediatre@clinique.com',
    couleur: '#f59e0b',
    examens: pedo.EXAMENS_PEDO,
    symptomes: pedo.SYMPTOMES_PEDO,
    pathologies: pedo.PATHOLOGIES_PEDO,
    traitements: pedo.TRAITEMENTS_PEDO,
    couleurs: pedo.C_PEDO,
  },

  // Service: Gynécologie
  gynecologie: {
    id: 'gynecologie',
    nom: 'Gynécologie',
    medecin: 'Dr. Keïta',
    email: 'gynecologue@clinique.com',
    couleur: '#d946ef',
    examens: gyneco.EXAMENS_GYNECO,
    symptomes: gyneco.SYMPTOMES_GYNECO,
    pathologies: gyneco.PATHOLOGIES_GYNECO,
    traitements: gyneco.TRAITEMENTS_GYNECO,
    couleurs: gyneco.C_GYNECO,
  },

  // Service: Ophtalmologie
  ophtalmologie: {
    id: 'ophtalmologie',
    nom: 'Ophtalmologie',
    medecin: 'Dr. Bah',
    email: 'ophtalmologue@clinique.com',
    couleur: '#059669',
    examens: ophtalmo.EXAMENS_OPHTALMO,
    symptomes: ophtalmo.SYMPTOMES_OPHTALMO,
    pathologies: ophtalmo.PATHOLOGIES_OPHTALMO,
    traitements: ophtalmo.TRAITEMENTS_OPHTALMO,
    couleurs: ophtalmo.C_OPHTALMO,
  },

  // Service: Traumatologie
  traumatologie: {
    id: 'traumatologie',
    nom: 'Traumatologie',
    medecin: 'Dr. Diallo',
    email: 'traumatologue@clinique.com',
    couleur: '#ea580c',
    examens: traumato.EXAMENS_TRAUMATO,
    symptomes: traumato.SYMPTOMES_TRAUMATO,
    pathologies: traumato.PATHOLOGIES_TRAUMATO,
    traitements: traumato.TRAITEMENTS_TRAUMATO,
    couleurs: traumato.C_TRAUMATO,
  },

  // Service: Neurologie
  neurologie: {
    id: 'neurologie',
    nom: 'Neurologie',
    medecin: 'Dr. Konaté',
    email: 'neurologue@clinique.com',
    couleur: '#7c3aed',
    examens: neuro.EXAMENS_NEURO,
    symptomes: neuro.SYMPTOMES_NEURO,
    pathologies: neuro.PATHOLOGIES_NEURO,
    traitements: neuro.TRAITEMENTS_NEURO,
    couleurs: neuro.C_NEURO,
  },

  // Service: ORL
  orl: {
    id: 'orl',
    nom: 'ORL',
    medecin: 'Dr. Traoré',
    email: 'orl@clinique.com',
    couleur: '#0891b2',
    examens: orl.EXAMENS_ORL,
    symptomes: orl.SYMPTOMES_ORL,
    pathologies: orl.PATHOLOGIES_ORL,
    traitements: orl.TRAITEMENTS_ORL,
    couleurs: orl.C_ORL,
  },

  // Service: Urologie
  urologie: {
    id: 'urologie',
    nom: 'Urologie',
    medecin: 'Dr. Baldé',
    email: 'urologue@clinique.com',
    couleur: '#16a34a',
    examens: uro.EXAMENS_URO,
    symptomes: uro.SYMPTOMES_URO,
    pathologies: uro.PATHOLOGIES_URO,
    traitements: uro.TRAITEMENTS_URO,
    couleurs: uro.C_URO,
  },

  // Service: Chirurgie
  chirurgie: {
    id: 'chirurgie',
    nom: 'Chirurgie',
    medecin: 'Dr. Condé',
    email: 'chirurgien@clinique.com',
    couleur: '#dc2626',
    examens: chir.EXAMENS_CHIR,
    symptomes: chir.SYMPTOMES_CHIR,
    pathologies: chir.PATHOLOGIES_CHIR,
    traitements: chir.TRAITEMENTS_CHIR,
    couleurs: chir.C_CHIR,
  },

  // Service: Dermatologie
  dermatologie: {
    id: 'dermatologie',
    nom: 'Dermatologie',
    medecin: 'Dr. Soumah',
    email: 'dermatologue@clinique.com',
    couleur: '#f97316',
    examens: dermato.EXAMENS_DERMATO,
    symptomes: dermato.SYMPTOMES_DERMATO,
    pathologies: dermato.PATHOLOGIES_DERMATO,
    traitements: dermato.TRAITEMENTS_DERMATO,
    couleurs: dermato.C_DERMATO,
  },

  // Service: Oncologie
  oncologie: {
    id: 'oncologie',
    nom: 'Oncologie',
    medecin: 'Dr. Cissé',
    email: 'oncologue@clinique.com',
    couleur: '#7c3aed',
    examens: onco.EXAMENS_ONCO,
    symptomes: onco.SYMPTOMES_ONCO,
    pathologies: onco.PATHOLOGIES_ONCO,
    traitements: onco.TRAITEMENTS_ONCO,
    couleurs: onco.C_ONCO,
  },

  // Service: Maladies infectieuses
  'maladies-infectieuses': {
    id: 'maladies-infectieuses',
    nom: 'Maladies infectieuses',
    medecin: 'Dr. Bangoura',
    email: 'infectiologue@clinique.com',
    couleur: '#16a34a',
    examens: malinf.EXAMENS_MALINF,
    symptomes: malinf.SYMPTOMES_MALINF,
    pathologies: malinf.PATHOLOGIES_MALINF,
    traitements: malinf.TRAITEMENTS_MALINF,
    couleurs: malinf.C_MALINF,
  },

  // Service: Stomatologie
  stomatologie: {
    id: 'stomatologie',
    nom: 'Stomatologie',
    medecin: 'Dr. Fofana',
    email: 'stomatologue@clinique.com',
    couleur: '#0284c7',
    examens: stomato.EXAMENS_STOMATO,
    symptomes: stomato.SYMPTOMES_STOMATO,
    pathologies: stomato.PATHOLOGIES_STOMATO,
    traitements: stomato.TRAITEMENTS_STOMATO,
    couleurs: stomato.C_STOMATO,
  },
}

// ═══════════════════════════════════════════════════════════
//  FONCTIONS UTILITAIRES
// ═══════════════════════════════════════════════════════════

/**
 * Récupère la configuration d'un service par son ID
 */
export function getServiceConfig(serviceId) {
  return SERVICES_CONFIG[serviceId] || null
}

/**
 * Récupère la configuration d'un service par le nom du médecin
 */
export function getServiceByMedecin(medecinNom) {
  const nom = medecinNom.toLowerCase()
  for (const config of Object.values(SERVICES_CONFIG)) {
    if (config.medecin.toLowerCase().includes(nom) || nom.includes(config.medecin.toLowerCase())) {
      return config
    }
  }
  return null
}

/**
 * Récupère la configuration d'un service par sa spécialité
 */
export function getServiceBySpecialite(specialite) {
  const spec = specialite.toLowerCase()
  for (const config of Object.values(SERVICES_CONFIG)) {
    if (config.nom.toLowerCase() === spec || spec.includes(config.nom.toLowerCase())) {
      return config
    }
  }
  return null
}

/**
 * Liste de tous les services disponibles
 */
export function getAllServices() {
  return Object.values(SERVICES_CONFIG)
}

/**
 * Vérifie si un service existe
 */
export function serviceExists(serviceId) {
  return serviceId in SERVICES_CONFIG
}

// ═══════════════════════════════════════════════════════════
//  EXPORT PAR DÉFAUT
// ═══════════════════════════════════════════════════════════

export default {
  SERVICES_CONFIG,
  getServiceConfig,
  getServiceByMedecin,
  getServiceBySpecialite,
  getAllServices,
  serviceExists,
}