const express = require("express")
const router  = express.Router()
const {
  listerParametres,
  getParametre,
  updateParametre,
  updateParametres,
  creerParametre
} = require("../controllers/parametresController")
const { authMiddleware, requireRole } = require("../middleware/auth")

router.use(authMiddleware)

// ── Routes ──────────────────────────────────────────────
router.get("/",              listerParametres)
router.get("/:cle",          getParametre)
router.post("/",             requireRole("medecin_chef", "secretaire"), creerParametre)
router.patch("/:cle",        requireRole("medecin_chef", "secretaire"), updateParametre)
router.patch("/batch",       requireRole("medecin_chef", "secretaire"), updateParametres)

module.exports = router