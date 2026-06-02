const { Pool } = require("pg")
const path = require("path")
const dotenv = require("dotenv")
// Charger explicitement le .env du backend puis fallback
dotenv.config({ path: path.resolve(__dirname, "..", ".env") })
dotenv.config()

// Normaliser et inspecter DB_PASSWORD pour éviter les erreurs pg (client password must be a string)
let _rawDbPassword = process.env.DB_PASSWORD
if (_rawDbPassword === undefined) _rawDbPassword = undefined
else if (typeof _rawDbPassword !== "string") _rawDbPassword = String(_rawDbPassword)
if (typeof _rawDbPassword === "string") {
  _rawDbPassword = _rawDbPassword.trim()
  if (( _rawDbPassword.startsWith('"') && _rawDbPassword.endsWith('"') ) || ( _rawDbPassword.startsWith("'") && _rawDbPassword.endsWith("'") )) {
    _rawDbPassword = _rawDbPassword.slice(1,-1)
  }
}
try {
  console.log(`DB_PASSWORD type: ${typeof _rawDbPassword}, length: ${_rawDbPassword ? _rawDbPassword.length : 'undefined'}`)
} catch (e) {
  console.log("DB_PASSWORD inspect error", e && e.message)
}

const pool = new Pool({
  host:     process.env.DB_HOST     || "localhost",
  port:     parseInt(process.env.DB_PORT) || 5432,
  database: process.env.DB_NAME     || "clinique_santepro",
  user:     process.env.DB_USER     || "postgres",
  password: _rawDbPassword || "",
  max: 10,                   // max connexions simultanées dans le pool
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
})

pool.on("error", (err) => {
  console.error("❌ Erreur pool PostgreSQL:", err.message)
})

pool.on("connect", () => {
  console.log("ℹ️ Pool PostgreSQL: nouvelle connexion établie")
})

// Test de connexion au démarrage
pool.connect()
  .then(client => {
    console.log("✅ PostgreSQL connecté — base:", process.env.DB_NAME)
    client.release()
  })
  .catch(err => {
    // Diagnostic: afficher type/longueur de la variable d'environnement sans révéler le mot de passe
    const rawPwd = process.env.DB_PASSWORD
    console.error("❌ Impossible de se connecter à PostgreSQL:", err.message)
    console.error(`   DB_HOST=${process.env.DB_HOST} DB_PORT=${process.env.DB_PORT} DB_NAME=${process.env.DB_NAME} DB_USER=${process.env.DB_USER}`)
    console.error(`   DB_PASSWORD type=${typeof rawPwd} length=${rawPwd ? rawPwd.length : 'undefined'}`)
    console.error("   Vérifiez vos variables d'environnement dans .env")
  })

module.exports = pool
