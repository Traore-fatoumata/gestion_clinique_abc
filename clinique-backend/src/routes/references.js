const express = require("express")
const router  = express.Router()
const {
  creerReferences,
  listerReferencesRecues,
  listerReferencesEnvoyees,
  mettreAJourStatutReference,
  listerParcoursPatient
} = require("../controllers/referencesController")
const { authMiddleware, requireRole } = require("../middleware/auth")

router.use(authMiddleware)

// POST /api/references - Créer des références vers d'autres services
router.post("/", creerReferences)

// GET /api/references/recues/:service - Lister les références entrantes pour un service
router.get("/recues/:service", listerReferencesRecues)

// GET /api/references/envoyees - Lister les références envoyées par l'utilisateur connecté
router.get("/envoyees", listerReferencesEnvoyees)

// PATCH /api/references/:id/statut - Modifier le statut d'une référence
router.patch("/:id/statut", mettreAJourStatutReference)

// GET /api/references/parcours/:patient_id - Traçabilité parcours patient
router.get("/parcours/:patient_id", listerParcoursPatient)

module.exports = router
