const express = require("express")
const router  = express.Router()
const {
  listerSoins,
  getSoinById,
  creerSoin,
  demarrerSoin,
  validerExecution,
  retarderSoin,
  annulerSoin,
  supprimerSoin
} = require("../controllers/soinsController")
const { authMiddleware, requireRole } = require("../middleware/auth")

router.use(authMiddleware)

// ── Routes ──────────────────────────────────────────────
router.get("/",              listerSoins)
router.get("/:id",           getSoinById)
router.post("/",             requireRole("infirmier", "medecin", "medecin_chef"), creerSoin)
router.patch("/:id/demarrer",  requireRole("infirmier"), demarrerSoin)
router.patch("/:id/executer",  requireRole("infirmier"), validerExecution)
router.patch("/:id/retarder",  requireRole("infirmier"), retarderSoin)
router.patch("/:id/annuler",   requireRole("infirmier", "medecin_chef"), annulerSoin)
router.delete("/:id",        requireRole("infirmier", "medecin_chef"), supprimerSoin)

module.exports = router