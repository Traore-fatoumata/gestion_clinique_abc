const express = require("express")
const router  = express.Router()
const {
  listerDemandes,
  creerDemande,
  demarrerPrelevement,
  sauvegarderResultats,
  validerDemande,
  supprimerDemande,
  getDemandeById,
  fixerTarifs,
} = require("../controllers/laboController")
const { authMiddleware, requireRole } = require("../middleware/auth")

router.use(authMiddleware)

// ── Routes ──────────────────────────────────────────────
router.get("/",              listerDemandes)
router.get("/:id",           getDemandeById)
router.post("/",             requireRole("medecin", "medecin_chef", "labo"), creerDemande)
router.patch("/:id/tarifs",  requireRole("labo", "medecin_chef"), fixerTarifs)
router.patch("/:id/prelever",requireRole("labo"), demarrerPrelevement)
router.patch("/:id/resultats", requireRole("labo"), sauvegarderResultats)
router.patch("/:id/valider",   requireRole("medecin_chef", "labo"), validerDemande)
router.delete("/:id",        requireRole("medecin_chef", "labo"), supprimerDemande)

module.exports = router