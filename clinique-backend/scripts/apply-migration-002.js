/**
 * Applique sql/migrations/002_migration_anciennes_donnees.sql
 * Usage: node scripts/apply-migration-002.js
 */
require("dotenv").config({ path: require("path").join(__dirname, "..", ".env") })
const fs = require("fs")
const path = require("path")
const pool = require("../src/config/db")

async function main() {
  const migrationPath = path.join(__dirname, "..", "sql", "migrations", "002_migration_anciennes_donnees.sql")
  const sql = fs.readFileSync(migrationPath, "utf8")
  console.log("Exécution de la migration dans la base de données...")
  await pool.query(sql)
  console.log("✅ Migration 002_migration_anciennes_donnees appliquée avec succès.")
  process.exit(0)
}

main().catch(err => {
  console.error("❌ Erreur lors de l'application de la migration:", err)
  process.exit(1)
})
