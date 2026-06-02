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

// ── Routes ──────────────────────────────────────────────
router.get("/",              listerParametres)
router.get("/:cle",          getParametre)
router.post("/",             authMiddleware, requireRole("medecin_chef", "secretaire"), creerParametre)
router.patch("/:cle",        authMiddleware, requireRole("medecin_chef", "secretaire"), updateParametre)
router.patch("/batch",       authMiddleware, requireRole("medecin_chef", "secretaire"), updateParametres)

module.exports = router