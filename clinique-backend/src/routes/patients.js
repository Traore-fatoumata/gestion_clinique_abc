const express = require("express")
const router  = express.Router()
const { listerPatients, getPatient, creerPatient, modifierPatient, supprimerPatient } = require("../controllers/patientsController")
const { authMiddleware, requireRole } = require("../middleware/auth")

// Toutes les routes nécessitent un token valide
router.use(authMiddleware)

router.get("/",    listerPatients)
router.get("/:id", getPatient)
router.post("/",   requireRole("secretaire", "medecin_chef"), creerPatient)
router.put("/:id", requireRole("secretaire", "medecin_chef"), modifierPatient)
router.delete("/:id", requireRole("medecin_chef"), supprimerPatient)

module.exports = router
