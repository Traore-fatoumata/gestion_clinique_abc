const express = require("express")
const router  = express.Router()
const { getFile, ajouterFile, updateFile } = require("../controllers/fileController")
const { authMiddleware, requireRole } = require("../middleware/auth")

router.use(authMiddleware)

router.get("/",       getFile)
router.post("/",      requireRole("secretaire", "medecin_chef"), ajouterFile)
router.patch("/:id",  updateFile)

module.exports = router