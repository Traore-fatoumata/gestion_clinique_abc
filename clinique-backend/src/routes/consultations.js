const express = require("express")
const router  = express.Router()
const { listerConsultations, sauvegarderConsultation, signerConsultation, supprimerConsultation } = require("../controllers/consultationsController")
const { authMiddleware, requireRole } = require("../middleware/auth")

router.use(authMiddleware)

router.get("/",              listerConsultations)
router.post("/",             requireRole("medecin", "medecin_chef"), sauvegarderConsultation)
router.patch("/:id/signer",  requireRole("medecin", "medecin_chef"), signerConsultation)
router.delete("/:id",        requireRole("medecin_chef"), supprimerConsultation)

module.exports = router