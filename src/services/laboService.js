import api from '../api'

const BASE_URL = '/api/labo'

export const laboService = {
  // ── Liste des demandes ──────────────────────────────────
  listerDemandes: async (params = {}) => {
    const { data } = await api.get(BASE_URL, { params })
    return data
  },

  // ── Détail d'une demande ────────────────────────────────
  getDemande: async (id) => {
    const { data } = await api.get(`${BASE_URL}/${id}`)
    return data
  },

  // ── Créer une demande ───────────────────────────────────
  creerDemande: async (demande) => {
    const { data } = await api.post(BASE_URL, demande)
    return data
  },

  // ── Démarrer le prélèvement ─────────────────────────────
  demarrerPrelevement: async (id) => {
    const { data } = await api.patch(`${BASE_URL}/${id}/prelever`)
    return data
  },

  // ── Sauvegarder les résultats ───────────────────────────
  sauvegarderResultats: async (id, resultats, commentaire_global) => {
    const { data } = await api.patch(`${BASE_URL}/${id}/resultats`, {
      resultats,
      commentaire_global
    })
    return data
  },

  // ── Valider une demande ─────────────────────────────────
  validerDemande: async (id, valide_par, resultats, commentaire_global) => {
    const { data } = await api.patch(`${BASE_URL}/${id}/valider`, {
      valide_par,
      resultats,
      commentaire_global
    })
    return data
  },

  // ── Supprimer une demande ───────────────────────────────
  supprimerDemande: async (id) => {
    const { data } = await api.delete(`${BASE_URL}/${id}`)
    return data
  }
}

export default laboService