/* eslint-disable react-refresh/only-export-components */
import { useState, useEffect, createContext, useContext, useRef } from 'react'
import parametresService from '../services/parametresService'

const ClinicSettingsContext = createContext()

// ══════════════════════════════════════════════════════════════════
//  PARAMÈTRES PAR DÉFAUT — orientés gestion clinique réelle
// ══════════════════════════════════════════════════════════════════
export const DEFAULT_SETTINGS = {

  // ── 1. IDENTITÉ ──────────────────────────────────────────────
  nomClinique:       'Clinique Médicale ABC Marouane',
  nomCourt:          'Marouane',
  slogan:            'Des soins de qualité, une gestion simplifiée.',
  adresse:           'Quartier Almamya, Commune de Kaloum, Conakry',
  telephone:         '+224 624 00 00 00',
  telephone2:        '',
  email:             'clinique.abc.marouane@gmail.com',
  siteWeb:           '',
  pays:              'République de Guinée',
  ville:             'Conakry',
  numeroAgrément:    '',
  numeroCNSS:        '',
  devise:            'GNF',
  langue:            'fr',

  // ── 2. HORAIRES ───────────────────────────────────────────────
  urgences24h: true,
  horaires: {
    lundi:    { ouvert: true,  debut: '08:00', fin: '18:00' },
    mardi:    { ouvert: true,  debut: '08:00', fin: '18:00' },
    mercredi: { ouvert: true,  debut: '08:00', fin: '18:00' },
    jeudi:    { ouvert: true,  debut: '08:00', fin: '18:00' },
    vendredi: { ouvert: true,  debut: '08:00', fin: '17:00' },
    samedi:   { ouvert: true,  debut: '09:00', fin: '13:00' },
    dimanche: { ouvert: false, debut: '00:00', fin: '00:00' },
  },

  // ── 3. TARIFS ─────────────────────────────────────────────────
  tarifConsultation:     50000,
  tarifRendezVous:       75000,
  tarifLaboratoire:      30000,
  tarifUrgence:          100000,
  tarifHospitalisation:  200000,
  // Tarifs consultation par tranche d'âge
  tarifNourrisson:       30000,   // < 5 ans
  tarifEnfant:           35000,   // 5–14 ans
  tarifAdulte:           50000,   // 15–60 ans
  tarifSenior:           40000,   // > 60 ans
  tvaActif:              false,
  tvaTaux:               18,
  remiseMaxPct:          20,   // remise max autorisée sans validation chef

  // ── 4. DOSSIER PATIENT ────────────────────────────────────────
  ageMajoriteAns:        18,
  prefixeDossier:        'ABC',
  conservationDossierAns: 10,
  alerteDoublonActif:    true,
  champsObligatoires:    ['nom', 'prenom', 'sexe', 'telephone'],

  // ── 5. RENDEZ-VOUS ────────────────────────────────────────────
  dureeRdvDefautMin:     30,
  rappelRdvActif:        true,
  rappelRdvDelaiH:       24,
  capaciteJournaliere:   50,

  // ── 6. NOTIFICATIONS ──────────────────────────────────────────
  notifNouveauPatient:   true,
  notifPaiementImpaye:   true,
  notifAbsenceMedecin:   true,
  notifRdvJour:          true,
  soundActif:            true,

  // ── 7. APPARENCE ─────────────────────────────────────────────
  couleurPrimaire:    '#2d7a3f',
  couleurSecondaire:  '#1a3a22',
  couleurAccent:      '#4aaa5e',
  backgroundColor:    '#f2faf5',
  backgroundType:     'color',   // 'color' | 'gradient'
  gradientDebut:      '#e8f5ec',
  gradientFin:        '#f0fdf4',
  theme:              'light',
  fontSize:           14,
  compactMode:        false,
  showAnimations:     true,
}

export const JOURS = {
  lundi: 'Lundi', mardi: 'Mardi', mercredi: 'Mercredi',
  jeudi: 'Jeudi', vendredi: 'Vendredi', samedi: 'Samedi', dimanche: 'Dimanche',
}

export const DEVISES = [
  { code: 'GNF', label: 'GNF — Franc Guinéen' },
  { code: 'USD', label: 'USD — Dollar américain' },
  { code: 'EUR', label: 'EUR — Euro' },
  { code: 'XOF', label: 'XOF — Franc CFA UEMOA' },
  { code: 'XAF', label: 'XAF — Franc CFA CEMAC' },
]

export const THEMES_PRESET = {
  'Clinique verte':    { couleurPrimaire:'#2d7a3f', couleurSecondaire:'#1a3a22', couleurAccent:'#4aaa5e', backgroundColor:'#f2faf5', theme:'light' },
  'Médical bleu':      { couleurPrimaire:'#1d4ed8', couleurSecondaire:'#1e3a8a', couleurAccent:'#3b82f6', backgroundColor:'#f0f7ff', theme:'light' },
  'Hôpital neutre':    { couleurPrimaire:'#475569', couleurSecondaire:'#1e293b', couleurAccent:'#64748b', backgroundColor:'#f8fafc', theme:'light' },
  'Urgences rouge':    { couleurPrimaire:'#dc2626', couleurSecondaire:'#7f1d1d', couleurAccent:'#f87171', backgroundColor:'#fff5f5', theme:'light' },
  'Nuit (sombre)':     { couleurPrimaire:'#60a5fa', couleurSecondaire:'#93c5fd', couleurAccent:'#34d399', backgroundColor:'#0f172a', theme:'dark'  },
}

export const FONT_SIZES = [
  { value: 12, label: 'Très petit' },
  { value: 13, label: 'Petit'      },
  { value: 14, label: 'Normal'     },
  { value: 15, label: 'Grand'      },
  { value: 16, label: 'Très grand' },
]

// ══════════════════════════════════════════════════════════════════
//  HOOK
// ══════════════════════════════════════════════════════════════════
export function useClinicSettings() {
  const ctx = useContext(ClinicSettingsContext)
  if (!ctx) throw new Error('useClinicSettings must be used within ClinicSettingsProvider')
  return ctx
}

// ══════════════════════════════════════════════════════════════════
//  PROVIDER
// ══════════════════════════════════════════════════════════════════
export function ClinicSettingsProvider({ children }) {
  const [settings, setSettings] = useState(() => {
    try {
      const saved = localStorage.getItem('clinique_settings_v3')
      if (saved) return { ...DEFAULT_SETTINGS, ...JSON.parse(saved) }
    } catch { /* ignore */ }
    return DEFAULT_SETTINGS
  })

  const [apiLoaded, setApiLoaded] = useState(false)
  const initialized = useRef(false)

  // Charger les paramètres depuis l'API au démarrage
  useEffect(() => {
    if (apiLoaded) return
    const chargerParametres = async () => {
      try {
        const response = await parametresService.recupererTous()
        if (response.success && response.parametres) {
          const params = response.parametres
          // Mapper les paramètres API vers les settings locaux
          const mappedSettings = { ...settings }
          // Identité
          if (params.nomClinique) mappedSettings.nomClinique = params.nomClinique.valeur
          if (params.telephone) mappedSettings.telephone = params.telephone.valeur
          if (params.email) mappedSettings.email = params.email.valeur
          if (params.adresse) mappedSettings.adresse = params.adresse.valeur
          // Tarifs
          if (params.tarifConsultation) mappedSettings.tarifConsultation = parseInt(params.tarifConsultation.valeur) || 50000
          if (params.tarifUrgence) mappedSettings.tarifUrgence = parseInt(params.tarifUrgence.valeur) || 100000
          if (params.devise) mappedSettings.devise = params.devise.valeur
          // Apparence
          if (params.couleurPrimaire) mappedSettings.couleurPrimaire = params.couleurPrimaire.valeur
          if (params.theme) mappedSettings.theme = params.theme.valeur
          setSettings(mappedSettings)
        }
      } catch (err) {
        console.error("Erreur chargement paramètres API:", err)
      } finally {
        setApiLoaded(true)
      }
    }
    chargerParametres()
  }, [])

  const applyToDOM = (s) => {
    const r = document.documentElement
    r.style.setProperty('--color-primary',   s.couleurPrimaire)
    r.style.setProperty('--color-secondary', s.couleurSecondaire)
    r.style.setProperty('--color-accent',    s.couleurAccent)
    r.style.setProperty('--bg-app',          s.backgroundColor)
    r.style.setProperty('--font-size-base', `${s.fontSize}px`)
    s.theme === 'dark' ? r.setAttribute('data-theme','dark') : r.removeAttribute('data-theme')
    s.compactMode      ? r.setAttribute('data-compact','true') : r.removeAttribute('data-compact')
  }

  useEffect(() => {
    if (!initialized.current) { initialized.current = true; applyToDOM(settings); return }
    localStorage.setItem('clinique_settings_v3', JSON.stringify(settings))
    applyToDOM(settings)
  }, [settings])

  const updateSetting  = (key, val) => setSettings(p => ({ ...p, [key]: val }))

  const updateHoraire  = (jour, field, val) =>
    setSettings(p => ({
      ...p,
      horaires: { ...p.horaires, [jour]: { ...p.horaires[jour], [field]: val } }
    }))

  const applyTheme = (name) => {
    const t = THEMES_PRESET[name]
    if (t) setSettings(p => ({ ...p, ...t }))
  }

  const resetSettings = () => {
    setSettings(DEFAULT_SETTINGS)
    localStorage.removeItem('clinique_settings_v3')
  }

  const exportSettings = () => {
    const blob = new Blob([JSON.stringify(settings, null, 2)], { type: 'application/json' })
    const url  = URL.createObjectURL(blob)
    const a    = Object.assign(document.createElement('a'), { href: url, download: 'parametres-clinique-marouane.json' })
    a.click(); URL.revokeObjectURL(url)
  }

  const importSettings = (jsonStr) => {
    try { setSettings(p => ({ ...p, ...JSON.parse(jsonStr) })); return { success: true } }
    catch (e) { return { success: false, error: e.message } }
  }

  return (
    <ClinicSettingsContext.Provider value={{
      settings, updateSetting, updateHoraire,
      applyTheme, resetSettings, exportSettings, importSettings,
      JOURS, DEVISES, THEMES_PRESET, FONT_SIZES, DEFAULT_SETTINGS,
    }}>
      {children}
    </ClinicSettingsContext.Provider>
  )
}

// ── PAS de export default intentionnel ──