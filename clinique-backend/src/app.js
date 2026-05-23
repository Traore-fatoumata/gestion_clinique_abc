require("dotenv").config()
const express = require("express")
const cors    = require("cors")
const helmet  = require("helmet")
const morgan  = require("morgan")

const app = express()

// ── Sécurité & middleware globaux ───────────────────────
app.use(helmet())
app.use(cors({
  origin:      process.env.FRONTEND_URL || "http://localhost:5173",
  credentials: true,
  methods:     ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
}))
app.use(express.json({ limit: "5mb" }))
app.use(express.urlencoded({ extended: true }))
app.use(morgan(process.env.NODE_ENV === "production" ? "combined" : "dev"))

// ── Routes ──────────────────────────────────────────────
app.use("/api/auth",      require("./routes/auth"))

app.use("/api/patients",      require("./routes/patients"))
app.use("/api/file",          require("./routes/file"))
app.use("/api/consultations", require("./routes/consultations"))
app.use("/api/notifications", require("./routes/notifications"))
// 🔜 Prochaines routes :
app.use("/api/rdv",          require("./routes/rdv"))
// app.use("/api/labo",       require("./routes/labo"))
// app.use("/api/soins",      require("./routes/soins"))
// app.use("/api/parametres", require("./routes/parametres"))

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