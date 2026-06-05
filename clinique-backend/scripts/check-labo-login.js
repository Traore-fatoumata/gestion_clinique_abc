require("dotenv").config()
const pool = require("../src/config/db")

async function main() {
  const { rows } = await pool.query(
    "SELECT id, email, role, actif FROM utilisateurs WHERE role = 'labo'"
  )
  console.log("Comptes labo:", rows)
  process.exit(0)
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
