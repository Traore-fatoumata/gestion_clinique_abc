const jwt = require("jsonwebtoken")

// ── Vérifie le token JWT dans l'en-tête Authorization ──
const authMiddleware = (req, res, next) => {
  const authHeader = req.headers.authorization

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({
      success: false,
      message: "Token manquant. Veuillez vous connecter.",
    })
  }

  const token = authHeader.split(" ")[1]

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET)
    req.user = decoded   // { id, email, nom, role, specialite }
    next()
  } catch (err) {
    if (err.name === "TokenExpiredError") {
      return res.status(401).json({
        success: false,
        message: "Session expirée. Veuillez vous reconnecter.",
      })
    }
    return res.status(401).json({
      success: false,
      message: "Token invalide.",
    })
  }
}

// ── Vérifie que l'utilisateur a le bon rôle ────────────
const requireRole = (...roles) => (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ success: false, message: "Non authentifié." })
  }
  if (!roles.includes(req.user.role)) {
    return res.status(403).json({
      success: false,
      message: `Accès refusé. Rôle requis : ${roles.join(" ou ")}.`,
    })
  }
  next()
}

module.exports = { authMiddleware, requireRole }
