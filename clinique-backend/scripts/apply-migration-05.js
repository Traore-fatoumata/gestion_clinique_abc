/**
 * Applique sql/05_workflow_labo.sql
 * Usage: node scripts/apply-migration-05.js
 */
require("dotenv").config({ path: require("path").join(__dirname, "..", ".env") })
const fs = require("fs")
const path = require("path")
const pool = require("../src/config/db")

async function main() {
  const sql = fs.readFileSync(path.join(__dirname, "..", "sql", "05_workflow_labo.sql"), "utf8")
  await pool.query(sql)
  console.log("Migration 05_workflow_labo appliquée.")
  process.exit(0)
}

main().catch(err => {
  console.error(err)
  process.exit(1)
})
