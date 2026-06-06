const pool = require("./src/config/db")

async function checkPatients() {
  try {
    const res = await pool.query(`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'patients'
      ORDER BY ordinal_position
    `)
    console.log("Colonnes de la table patients :")
    res.rows.forEach(r => console.log(`  ${r.column_name} (${r.data_type})`))
    
    const count = await pool.query("SELECT COUNT(*) FROM patients")
    console.log("\nNombre de patients :", count.rows[0].count)
    
    if (parseInt(count.rows[0].count) > 0) {
      const sample = await pool.query("SELECT id, uuid, pid, nom, created_at FROM patients ORDER BY created_at DESC LIMIT 3")
      console.log("\nDerniers patients :")
      sample.rows.forEach(r => console.log(`  ${r.nom} (${r.pid}) - UUID: ${r.uuid}`))
    }
  } catch (err) {
    console.error("Erreur :", err.message)
  } finally {
    await pool.end()
  }
}

checkPatients()