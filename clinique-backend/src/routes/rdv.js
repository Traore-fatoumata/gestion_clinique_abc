const express = require("express")
const router  = express.Router()
const { listerRdv, creerRdv, updateRdv, supprimerRdv } = require("../controllers/rdvController")
const { authMiddleware, requireRole } = require("../middleware/auth")

router.use(authMiddleware)

router.get("/",          listerRdv)
router.post("/",         requireRole("medecin", "medecin_chef"), creerRdv)
router.patch("/:id",     updateRdv)
router.delete("/:id",    requireRole("medecin", "medecin_chef", "secretaire"), supprimerRdv)

module.exports = router