import api from '../api'

const BASE_URL = '/api/parametres'

export const parametresService = {
  // ── Liste tous les paramètres ───────────────────────────
  listerParametres: async () => {
    const { data } = await api.get(BASE_URL)
    return data
  },

  // Alias compatible avec les anciens appels
  recupererTous: async () => {
    const { data } = await api.get(BASE_URL)
    return data
  },

  // ── Récupérer un paramètre par clé ──────────────────────
  getParametre: async (cle) => {
    const { data } = await api.get(`${BASE_URL}/${cle}`)
    return data
  },

  // ── Mettre à jour un paramètre ──────────────────────────
  updateParametre: async (cle, valeur) => {
    const { data } = await api.patch(`${BASE_URL}/${cle}`, { valeur })
    return data
  },

  // ── Mettre à jour plusieurs paramètres ──────────────────
  updateParametres: async (parametres) => {
    const { data } = await api.patch(`${BASE_URL}/batch`, parametres)
    return data
  },

  // ── Créer un paramètre ──────────────────────────────────
  creerParametre: async (cle, valeur) => {
    const { data } = await api.post(BASE_URL, { cle, valeur })
    return data
  }
}

export default parametresService