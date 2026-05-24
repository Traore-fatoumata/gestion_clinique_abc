import api from '../api'

const BASE_URL = '/api/soins'

export const soinsService = {
  // ── Liste des soins ─────────────────────────────────────
  listerSoins: async (params = {}) => {
    const { data } = await api.get(BASE_URL, { params })
    return data
  },

  // ── Détail d'un soin ────────────────────────────────────
  getSoin: async (id) => {
    const { data } = await api.get(`${BASE_URL}/${id}`)
    return data
  },

  // ── Créer un soin ───────────────────────────────────────
  creerSoin: async (soin) => {
    const { data } = await api.post(BASE_URL, soin)
    return data
  },

  // ── Démarrer un soin ────────────────────────────────────
  demarrerSoin: async (id, infirmier_id) => {
    const { data } = await api.patch(`${BASE_URL}/${id}/demarrer`, { infirmier_id })
    return data
  },

  // ── Valider l'exécution ─────────────────────────────────
  validerExecution: async (id, observations, tolerance, infirmier_id, heure_execution) => {
    const { data } = await api.patch(`${BASE_URL}/${id}/executer`, {
      observations,
      tolerance,
      infirmier_id,
      heure_execution
    })
    return data
  },

  // ── Retarder un soin ────────────────────────────────────
  retarderSoin: async (id) => {
    const { data } = await api.patch(`${BASE_URL}/${id}/retarder`)
    return data
  },

  // ── Annuler un soin ─────────────────────────────────────
  annulerSoin: async (id) => {
    const { data } = await api.patch(`${BASE_URL}/${id}/annuler`)
    return data
  },

  // ── Supprimer un soin ───────────────────────────────────
  supprimerSoin: async (id) => {
    const { data } = await api.delete(`${BASE_URL}/${id}`)
    return data
  }
}

export default soinsService