const { Pool } = require("pg")
require("dotenv").config()

const pool = new Pool({
  host:     process.env.DB_HOST     || "localhost",
  port:     parseInt(process.env.DB_PORT) || 5432,
  database: process.env.DB_NAME     || "clinique_marouane",
  user:     process.env.DB_USER     || "postgres",
  password: process.env.DB_PASSWORD || "",
  max: 10,                   // max connexions simultanées dans le pool
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
})

pool.on("error", (err) => {
  console.error("❌ Erreur pool PostgreSQL:", err.message)
})

// Test de connexion au démarrage
pool.connect()
  .then(client => {
    console.log("✅ PostgreSQL connecté — base:", process.env.DB_NAME)
    client.release()
  })
  .catch(err => {
    console.error("❌ Impossible de se connecter à PostgreSQL:", err.message)
    console.error("   Vérifiez vos variables d'environnement dans .env")
  })

module.exports = pool
