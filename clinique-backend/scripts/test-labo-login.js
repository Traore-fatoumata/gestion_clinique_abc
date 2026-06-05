require("dotenv").config()

const API = process.env.API_URL || "http://localhost:5000"

async function main() {
  const res = await fetch(`${API}/api/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email: "labo@clinique.com", mot_de_passe: "1234" }),
  })
  const data = await res.json()
  console.log(res.status, data)
  process.exit(data.success ? 0 : 1)
}

main().catch((e) => {
  console.error(e.message)
  process.exit(1)
})
