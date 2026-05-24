import api from "../api"

const paiementsService = {
  // ═══════════════════════════════════════════════════════════
  //  GET /api/paiements — Liste les paiements du jour
  // ═══════════════════════════════════════════════════════════
  async listerPaiements(date) {
    try {
      const response = await api.get("/paiements", { params: { date } })
      return response.data
    } catch (err) {
      console.error("Erreur listerPaiements:", err)
      return { success: false, error: err.message }
    }
  },

  // ═══════════════════════════════════════════════════════════
  //  GET /api/paiements/stats — Statistiques financières
  // ═══════════════════════════════════════════════════════════
  async getStatistiques(debut, fin) {
    try {
      const response = await api.get("/paiements/stats", { params: { debut, fin } })
      return response.data
    } catch (err) {
      console.error("Erreur getStatistiques:", err)
      return { success: false, error: err.message }
    }
  },

  // ═══════════════════════════════════════════════════════════
  //  GET /api/paiements/historique — Historique des paiements
  // ═══════════════════════════════════════════════════════════
  async getHistorique(debut, fin, type) {
    try {
      const response = await api.get("/paiements/historique", { params: { debut, fin, type } })
      return response.data
    } catch (err) {
      console.error("Erreur getHistorique:", err)
      return { success: false, error: err.message }
    }
  },

  // ═══════════════════════════════════════════════════════════
  //  POST /api/paiements/consultation — Enregistrer paiement consultation
  // ═══════════════════════════════════════════════════════════
  async enregistrerPaiementConsultation(data) {
    try {
      const response = await api.post("/paiements/consultation", data)
      return response.data
    } catch (err) {
      console.error("Erreur enregistrerPaiementConsultation:", err)
      return { 
        success: false, 
        error: err.response?.data?.message || err.message 
      }
    }
  },

  // ═══════════════════════════════════════════════════════════
  //  POST /api/paiements/examens — Enregistrer paiement examens
  // ═══════════════════════════════════════════════════════════
  async enregistrerPaiementExamens(data) {
    try {
      const response = await api.post("/paiements/examens", data)
      return response.data
    } catch (err) {
      console.error("Erreur enregistrerPaiementExamens:", err)
      return { 
        success: false, 
        error: err.response?.data?.message || err.message 
      }
    }
  }
}

export default paiementsService