const express = require("express")
const router  = express.Router()
const {
  listerDemandes,
  creerDemande,
  demarrerPrelevement,
  sauvegarderResultats,
  validerDemande,
  supprimerDemande,
  getDemandeById
} = require("../controllers/laboController")
const { authMiddleware, requireRole } = require("../middleware/auth")

router.use(authMiddleware)

// ── Routes ──────────────────────────────────────────────
router.get("/",              listerDemandes)
router.get("/:id",           getDemandeById)
router.post("/",             requireRole("medecin", "medecin_chef", "laborantin"), creerDemande)
router.patch("/:id/prelever",requireRole("laborantin"), demarrerPrelevement)
router.patch("/:id/resultats", requireRole("laborantin"), sauvegarderResultats)
router.patch("/:id/valider",   requireRole("medecin_chef", "laborantin"), validerDemande)
router.delete("/:id",        requireRole("medecin_chef", "laborantin"), supprimerDemande)

module.exports = router