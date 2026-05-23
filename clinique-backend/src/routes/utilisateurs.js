const express = require("express")
const router  = express.Router()
const pool    = require("../config/db")
const { authMiddleware } = require("../middleware/auth")

router.use(authMiddleware)

// GET /api/utilisateurs/medecins
router.get("/medecins", async (req, res) => {
  try {
    const { rows } = await pool.query(
      `SELECT id, nom, specialite, titre, email, role
       FROM utilisateurs
       WHERE role IN ('medecin', 'medecin_chef') AND actif = TRUE
       ORDER BY nom ASC`
    )
    return res.json({
      success: true,
      medecins: rows.map(r => ({
        id:         r.id,
        nom:        r.nom,
        specialite: r.specialite,
        titre:      r.titre,
        email:      r.email,
        estChef:    r.role === "medecin_chef",
        statut:     "actif",
      }))
    })
  } catch (err) {
    console.error("getUtilisateursMedecins:", err)
    return res.status(500).json({ success: false, message: "Erreur serveur." })
  }
})

module.exports = router