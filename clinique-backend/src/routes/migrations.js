const express = require("express")
const router  = express.Router()
const multer  = require("multer")

const { importExcel, saisiePapier, listerMigrations } = require("../controllers/migrationsController")
const { authMiddleware, requireRole } = require("../middleware/auth")

// Configurer Multer pour stocker le fichier dans la mémoire vive temporaire
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024, // Limite de 10 Mo par fichier Excel
  },
})

// Toutes ces routes requièrent d'être connecté en tant que Medecin Chef (ADMIN)
router.use(authMiddleware)
router.use(requireRole("medecin_chef"))

// POST /api/migrations/import-excel - Importation en masse via Excel
router.post("/import-excel", upload.single("file"), importExcel)

// POST /api/migrations/saisie-papier - Enregistrement d'un dossier papier
router.post("/saisie-papier", saisiePapier)

// GET /api/migrations/historique - Consulter l'historique
router.get("/historique", listerMigrations)

module.exports = router
