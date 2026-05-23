const bcrypt   = require("bcryptjs")
const jwt      = require("jsonwebtoken")
const pool     = require("../config/db")

// ── Correspondance rôle → route frontend ───────────────
const ROUTES = {
  secretaire:   "/secretaire",
  medecin_chef: "/medecin-chef",
  medecin:      "/medecin",
  comptable:    "/comptabilite",
  labo:         "/laboratoire",
  infirmier:    "/soins-infirmiers",
}

// ────────────────────────────────────────────────────────
//  POST /api/auth/login
// ────────────────────────────────────────────────────────
const login = async (req, res) => {
  const { email, mot_de_passe } = req.body

  // Validation basique
  if (!email || !mot_de_passe) {
    return res.status(400).json({
      success: false,
      message: "Email et mot de passe requis.",
    })
  }

  try {
    // Chercher l'utilisateur en base
    const { rows } = await pool.query(
      "SELECT * FROM utilisateurs WHERE email = $1 AND actif = TRUE",
      [email.toLowerCase().trim()]
    )

    if (rows.length === 0) {
      return res.status(401).json({
        success: false,
        message: "Email ou mot de passe incorrect.",
      })
    }

    const utilisateur = rows[0]

    // Vérifier le mot de passe
    const motDePasseValide = await bcrypt.compare(mot_de_passe, utilisateur.mot_de_passe)
    if (!motDePasseValide) {
      return res.status(401).json({
        success: false,
        message: "Email ou mot de passe incorrect.",
      })
    }

    // Générer le JWT
    const payload = {
      id:         utilisateur.id,
      email:      utilisateur.email,
      nom:        utilisateur.nom,
      role:       utilisateur.role,
      specialite: utilisateur.specialite,
      titre:      utilisateur.titre,
    }

    const token = jwt.sign(payload, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRES_IN || "8h",
    })

    // Ne jamais renvoyer le hash du mot de passe
    const { mot_de_passe: _, ...userSafe } = utilisateur

    return res.status(200).json({
      success: true,
      token,
      user: {
        ...userSafe,
        route: ROUTES[utilisateur.role] || "/",
      },
    })
  } catch (err) {
    console.error("Erreur login:", err)
    return res.status(500).json({
      success: false,
      message: "Erreur serveur. Réessayez.",
    })
  }
}

// ────────────────────────────────────────────────────────
//  GET /api/auth/me  (token requis)
// ────────────────────────────────────────────────────────
const me = async (req, res) => {
  try {
    const { rows } = await pool.query(
      "SELECT id, email, nom, role, specialite, titre, actif, created_at FROM utilisateurs WHERE id = $1",
      [req.user.id]
    )

    if (rows.length === 0) {
      return res.status(404).json({ success: false, message: "Utilisateur introuvable." })
    }

    return res.json({
      success: true,
      user: { ...rows[0], route: ROUTES[rows[0].role] || "/" },
    })
  } catch (err) {
    console.error("Erreur /me:", err)
    return res.status(500).json({ success: false, message: "Erreur serveur." })
  }
}

// ────────────────────────────────────────────────────────
//  POST /api/auth/logout  (côté client on efface juste le token)
// ────────────────────────────────────────────────────────
const logout = (_req, res) => {
  return res.json({ success: true, message: "Déconnexion réussie." })
}

// ────────────────────────────────────────────────────────
//  POST /api/auth/changer-mot-de-passe  (token requis)
// ────────────────────────────────────────────────────────
const changerMotDePasse = async (req, res) => {
  const { ancien_mot_de_passe, nouveau_mot_de_passe } = req.body

  if (!ancien_mot_de_passe || !nouveau_mot_de_passe) {
    return res.status(400).json({
      success: false,
      message: "Les deux mots de passe sont requis.",
    })
  }

  if (nouveau_mot_de_passe.length < 4) {
    return res.status(400).json({
      success: false,
      message: "Le nouveau mot de passe doit faire au moins 4 caractères.",
    })
  }

  try {
    const { rows } = await pool.query(
      "SELECT mot_de_passe FROM utilisateurs WHERE id = $1",
      [req.user.id]
    )

    if (rows.length === 0) {
      return res.status(404).json({ success: false, message: "Utilisateur introuvable." })
    }

    const valide = await bcrypt.compare(ancien_mot_de_passe, rows[0].mot_de_passe)
    if (!valide) {
      return res.status(401).json({
        success: false,
        message: "Ancien mot de passe incorrect.",
      })
    }

    const hash = await bcrypt.hash(nouveau_mot_de_passe, 10)
    await pool.query(
      "UPDATE utilisateurs SET mot_de_passe = $1, updated_at = NOW() WHERE id = $2",
      [hash, req.user.id]
    )

    return res.json({ success: true, message: "Mot de passe modifié avec succès." })
  } catch (err) {
    console.error("Erreur changement MDP:", err)
    return res.status(500).json({ success: false, message: "Erreur serveur." })
  }
}

module.exports = { login, me, logout, changerMotDePasse }
