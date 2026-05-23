const express = require("express")
const router  = express.Router()

const { login, me, logout, changerMotDePasse } = require("../controllers/authController")
const { authMiddleware } = require("../middleware/auth")

// Public
router.post("/login",  login)
router.post("/logout", logout)

// Protégées (token requis)
router.get ("/me",                   authMiddleware, me)
router.post("/changer-mot-de-passe", authMiddleware, changerMotDePasse)

module.exports = router
