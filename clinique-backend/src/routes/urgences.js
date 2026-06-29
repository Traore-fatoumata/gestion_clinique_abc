const express = require("express")
const router  = express.Router()
const {
  creerPriseEnChargeUrgence,
  getUrgenceConfig,
  modifierUrgenceConfig,
  listerUrgencesPatient
} = require("../controllers/urgencesController")
const { authMiddleware, requireRole } = require("../middleware/auth")

router.use(authMiddleware)

// POST /api/urgences - Enregistrer une prise en charge d'urgence / premiers soins
router.post("/", creerPriseEnChargeUrgence)

// GET /api/urgences/config - Lire la configuration de paiement des urgences
router.get("/config", getUrgenceConfig)

// PUT /api/urgences/config - Modifier la configuration de paiement (Medecin Chef / Admin uniquement)
router.put("/config", requireRole("medecin_chef"), modifierUrgenceConfig)

// GET /api/urgences/patient/:patient_id - Lister l'historique d'urgences d'un patient
router.get("/patient/:patient_id", listerUrgencesPatient)

module.exports = router
