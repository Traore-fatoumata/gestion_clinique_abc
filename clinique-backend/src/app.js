require("dotenv").config()
const express = require("express")
const cors    = require("cors")
const helmet  = require("helmet")
const morgan  = require("morgan")
const rateLimit = require("express-rate-limit")

const app = express()

// ── Sécurité & middleware globaux ───────────────────────
app.use(helmet())

// Rate limiting global
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limite chaque IP à 100 requêtes/15min
  message: { success: false, message: "Trop de requêtes, veuillez réessayer plus tard." },
  standardHeaders: true,
  legacyHeaders: false,
})
app.use("/api/", limiter)

// Rate limiting plus strict pour auth
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5, // limite à 5 tentatives de connexion/15min
  message: { success: false, message: "Trop de tentatives de connexion." },
})
app.use("/api/auth/login", authLimiter)

app.use(cors({
  origin:      process.env.FRONTEND_URL || "http://localhost:5173",
  credentials: true,
  methods:     ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization", "X-Request-ID", "X-User-Email"],
  exposedHeaders: ["X-Request-ID"],
}))
app.use(express.json({ limit: "5mb" }))
app.use(express.urlencoded({ extended: true }))

// Middleware pour définir le contexte utilisateur (pour audit)
app.use((req, res, next) => {
  const userEmail = req.headers['x-user-email'] || req.user?.email || 'anonymous'
  const userIp = req.ip || req.connection.remoteAddress
  process.env.APP_CURRENT_USER_EMAIL = userEmail
  process.env.APP_CURRENT_IP = userIp
  next()
})

app.use(morgan(process.env.NODE_ENV === "production" ? "combined" : "dev"))

// ── Routes ──────────────────────────────────────────────
app.use("/api/auth",      require("./routes/auth"))

app.use("/api/patients",      require("./routes/patients"))
app.use("/api/file",          require("./routes/file"))
app.use("/api/consultations", require("./routes/consultations"))
app.use("/api/notifications", require("./routes/notifications"))
app.use("/api/rdv",          require("./routes/rdv"))
app.use("/api/labo",         require("./routes/labo"))
app.use("/api/soins",        require("./routes/soins"))
app.use("/api/parametres",   require("./routes/parametres"))
app.use("/api/paiements",    require("./routes/paiements"))

// ── Route de santé ──────────────────────────────────────
app.get("/api/health", (_req, res) => {
  res.json({
    status:    "ok",
    service:   "Clinique ABC Marouane API",
    version:   "1.0.0",
    timestamp: new Date().toISOString(),
  })
})

// ── 404 ─────────────────────────────────────────────────
app.use((_req, res) => {
  res.status(404).json({ success: false, message: "Route introuvable." })
})

// ── Erreur globale ──────────────────────────────────────
app.use((err, _req, res, _next) => {
  console.error("Erreur non gérée:", err)
  res.status(500).json({ success: false, message: "Erreur interne du serveur." })
})

// ── Démarrage ───────────────────────────────────────────
const PORT = process.env.PORT || 5000
app.listen(PORT, () => {
  console.log(`\n🏥 Clinique ABC Marouane — API démarrée`)
  console.log(`   → http://localhost:${PORT}/api/health\n`)
})

module.exports = app