/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useEffect, useState } from 'react'
import api from '../api.js'

const AuthContext = createContext()

const ROUTE_BY_ROLE = {
  secretaire:  '/secretaire',
  laborantin:  '/laboratoire',
  infirmier:   '/soins-infirmiers',
  medecinChef: '/dashboard-medecin-chef',
  medecin:     '/medecin',
  comptable:   '/comptabilite',
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}

export function AuthProvider({ children }) {
  const [auth, setAuth]       = useState({ user: null, token: null })
  const [loading, setLoading] = useState(true)   // ← nouveau

  // Lecture du localStorage une seule fois au montage
  useEffect(() => {
    try {
      const savedUser  = localStorage.getItem('clinique_user_v1')
      const savedToken = localStorage.getItem('clinique_token_v1')
      if (savedUser && savedToken) {
        setAuth({ user: JSON.parse(savedUser), token: savedToken })
      }
    } catch {
      localStorage.removeItem('clinique_user_v1')
      localStorage.removeItem('clinique_token_v1')
    } finally {
      setLoading(false)   // ← terminé, on peut afficher l'app
    }
  }, [])

  // Validation du token auprès du serveur (optionnelle en mode mock)
  useEffect(() => {
    if (!auth.token) return
    api.defaults.headers.common.Authorization = `Bearer ${auth.token}`

    const validateToken = async () => {
      // En mode mock le token commence par "mock-" : on ne valide pas
      if (auth.token.startsWith('mock-')) return
      try {
        await api.get('/api/auth/verify')
      } catch (error) {
        if (error.response?.status === 401 || error.response?.status === 403) {
          setAuth({ user: null, token: null })
          localStorage.removeItem('clinique_user_v1')
          localStorage.removeItem('clinique_token_v1')
          delete api.defaults.headers.common.Authorization
        }
      }
    }

    validateToken()
  }, [auth.token])

  const login = async (email, motDePasse) => {
    const mockUsers = {
      'secretaire@clinique.com':   { role: 'secretaire',  nom: 'Secrétaire', prenom: '' },
      'chef@clinique.com':         { role: 'medecinChef', nom: 'Chef',       prenom: 'Médecin' },
      'comptable@clinique.com':    { role: 'comptable',   nom: 'Comptable',  prenom: '' },
      'labo@clinique.com':         { role: 'laborantin',  nom: 'Laborantin', prenom: '' },
      'infirmier@clinique.com':    { role: 'infirmier',   nom: 'Infirmier',  prenom: '' },
      'medecin@clinique.com':      { role: 'medecin', nom: 'Camara',   prenom: 'Dr.', specialite: 'Cardiologie' },
      'generaliste@clinique.com':  { role: 'medecin', nom: 'Barry',    prenom: 'Dr.', specialite: 'Diabétologie' },
      'pediatre@clinique.com':     { role: 'medecin', nom: 'Souaré',   prenom: 'Dr.', specialite: 'Pédiatrie' },
      'gynecologue@clinique.com':  { role: 'medecin', nom: 'Keïta',    prenom: 'Dr.', specialite: 'Gynécologie' },
      'ophtalmologue@clinique.com':{ role: 'medecin', nom: 'Bah',      prenom: 'Dr.', specialite: 'Ophtalmologie' },
      'traumatologue@clinique.com':{ role: 'medecin', nom: 'Diallo',   prenom: 'Dr.', specialite: 'Traumatologie' },
      'neurologue@clinique.com':   { role: 'medecin', nom: 'Konaté',   prenom: 'Dr.', specialite: 'Neurologie' },
      'orl@clinique.com':          { role: 'medecin', nom: 'Traoré',   prenom: 'Dr.', specialite: 'ORL' },
      'urologue@clinique.com':     { role: 'medecin', nom: 'Baldé',    prenom: 'Dr.', specialite: 'Urologie' },
      'chirurgien@clinique.com':   { role: 'medecin', nom: 'Condé',    prenom: 'Dr.', specialite: 'Chirurgie' },
      'dermatologue@clinique.com': { role: 'medecin', nom: 'Soumah',   prenom: 'Dr.', specialite: 'Dermatologie' },
      'oncologue@clinique.com':    { role: 'medecin', nom: 'Cissé',    prenom: 'Dr.', specialite: 'Oncologie' },
      'infectiologue@clinique.com':{ role: 'medecin', nom: 'Bangoura', prenom: 'Dr.', specialite: 'Maladies infectieuses' },
      'stomatologue@clinique.com': { role: 'medecin', nom: 'Fofana',   prenom: 'Dr.', specialite: 'Stomatologie' },
    }

    const userFromServer = mockUsers[email]

    // ✅ Mot de passe corrigé : '1234' (correspond au bouton démo)
    if (!userFromServer || motDePasse !== '1234') {
      return { success: false, error: 'Email ou mot de passe incorrect' }
    }

    const route    = ROUTE_BY_ROLE[userFromServer.role] || '/login'
    const userData = { ...userFromServer, route, email }
    const token    = 'mock-' + Date.now()

    setAuth({ user: userData, token })
    localStorage.setItem('clinique_user_v1',  JSON.stringify(userData))
    localStorage.setItem('clinique_token_v1', token)

    return { success: true, route }
  }   // ✅ accolade fermante de login — manquait dans l'original

  const logout = () => {
    setAuth({ user: null, token: null })
    localStorage.removeItem('clinique_user_v1')
    localStorage.removeItem('clinique_token_v1')
    delete api.defaults.headers.common.Authorization
  }

  return (
    <AuthContext.Provider value={{ user: auth.user, token: auth.token, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  )
}