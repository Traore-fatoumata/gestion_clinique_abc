const express = require("express")
const router  = express.Router()
const { getNotifications, creerNotification, marquerLue, marquerToutesLues } = require("../controllers/notificationsController")
const { authMiddleware } = require("../middleware/auth")

router.use(authMiddleware)

router.get("/",                   getNotifications)
router.post("/",                  creerNotification)
router.patch("/:id/lue",          marquerLue)
router.patch("/toutes-lues",      marquerToutesLues)

module.exports = router