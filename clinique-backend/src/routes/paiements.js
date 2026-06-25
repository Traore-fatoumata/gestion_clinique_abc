const express = require("express")
const router  = express.Router()
const {
  listerPaiements,
  getStatistiques,
  enregistrerPaiementConsultation,
  enregistrerPaiementExamens,
  getHistorique
} = require("../controllers/paiementsController")
const { authMiddleware, requireRole } = require("../middleware/auth")

router.use(authMiddleware)

// ── Routes ──────────────────────────────────────────────
router.get("/",              requireRole("comptable"), listerPaiements)
router.get("/stats",         requireRole("comptable", "medecin_chef"), getStatistiques)
router.get("/historique",    requireRole("comptable"), getHistorique)
router.post("/consultation", requireRole("comptable", "secretaire"), enregistrerPaiementConsultation)
router.post("/examens",      requireRole("comptable", "secretaire"), enregistrerPaiementExamens)

module.exports = router