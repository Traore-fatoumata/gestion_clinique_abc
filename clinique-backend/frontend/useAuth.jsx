/**
 * useAuth — Hook d'authentification connecté à l'API backend
 *
 * Remplace l'ancien hook qui utilisait des comptes codés en dur.
 * Le token JWT est stocké dans localStorage et joint à chaque requête.
 *
 * Usage :
 *   const { user, login, logout, loading } = useAuth()
 */
import { createContext, useContext, useState, useEffect, useCallback } from "react"

// ── URL de base de l'API (définie dans .env du frontend) ──
const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api"

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user,    setUser]    = useState(null)
  const [loading, setLoading] = useState(true)   // vrai au premier chargement

  // ── Restaurer la session depuis localStorage au démarrage ──
  useEffect(() => {
    const token = localStorage.getItem("clinique_token")
    if (!token) { setLoading(false); return }

    // Vérifier que le token est encore valide côté serveur
    fetch(`${API_URL}/auth/me`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setUser(data.user)
        } else {
          // Token expiré ou invalide → on nettoie
          localStorage.removeItem("clinique_token")
        }
      })
      .catch(() => {
        // Serveur injoignable → on garde le token, on réessaiera
        console.warn("Backend injoignable — mode hors-ligne")
      })
      .finally(() => setLoading(false))
  }, [])

  // ── Login ────────────────────────────────────────────────
  const login = useCallback(async (email, mot_de_passe) => {
    try {
      const res  = await fetch(`${API_URL}/auth/login`, {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ email, mot_de_passe }),
      })
      const data = await res.json()

      if (!data.success) {
        return { success: false, error: data.message || "Identifiants incorrects." }
      }

      // Sauvegarder le token
      localStorage.setItem("clinique_token", data.token)
      setUser(data.user)

      return { success: true, route: data.user.route }
    } catch (err) {
      console.error("Erreur login:", err)
      return { success: false, error: "Impossible de joindre le serveur. Vérifiez votre connexion." }
    }
  }, [])

  // ── Logout ───────────────────────────────────────────────
  const logout = useCallback(async () => {
    const token = localStorage.getItem("clinique_token")
    if (token) {
      // Appel optionnel (le backend répond juste 200)
      fetch(`${API_URL}/auth/logout`, {
        method:  "POST",
        headers: { Authorization: `Bearer ${token}` },
      }).catch(() => {})
    }
    localStorage.removeItem("clinique_token")
    setUser(null)
  }, [])

  // ── Helper : récupérer le token stocké ───────────────────
  const getToken = useCallback(() => {
    return localStorage.getItem("clinique_token")
  }, [])

  // ── Helper : fetch authentifié (avec token auto) ─────────
  const authFetch = useCallback(async (url, options = {}) => {
    const token = localStorage.getItem("clinique_token")
    return fetch(`${API_URL}${url}`, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        ...(options.headers || {}),
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
    })
  }, [])

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, getToken, authFetch }}>
      {children}
    </AuthContext.Provider>
  )
}

// Hook principal
export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error("useAuth doit être utilisé dans un <AuthProvider>")
  return ctx
}
