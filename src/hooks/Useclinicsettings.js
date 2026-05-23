import { useState, useEffect, createContext, useContext, useRef } from 'react'

// Contexte pour les paramètres
const ClinicSettingsContext = createContext()

// Paramètres par défaut
const DEFAULT_SETTINGS = {
  // Apparence
  backgroundColor: '#f8f9fa',
  backgroundImage: '',
  backgroundType: 'color', // 'color' | 'image' | 'gradient'
  gradientStart: '#667eea',
  gradientEnd: '#764ba2',
  
  // Police
  fontSize: 14, // taille de base (12, 13, 14, 15, 16)
  fontFamily: "'Segoe UI', system-ui, sans-serif",
  
  // Thème de couleurs
  theme: 'light', // 'light' | 'dark' | 'auto'
  primaryColor: '#2563eb',
  secondaryColor: '#64748b',
  accentColor: '#16a34a',
  
  // Interface
  sidebarCollapsed: false,
  compactMode: false,
  showAnimations: true,
  borderRadius: 12,
  
  // Notifications
  soundEnabled: true,
  notificationPosition: 'top-right',
  
  // Langue
  language: 'fr',
}

// Thèmes prédéfinis
const PRESET_THEMES = {
  light: {
    backgroundColor: '#f8f9fa',
    primaryColor: '#2563eb',
    secondaryColor: '#64748b',
    accentColor: '#16a34a',
  },
  dark: {
    backgroundColor: '#1e293b',
    primaryColor: '#60a5fa',
    secondaryColor: '#94a3b8',
    accentColor: '#4ade80',
  },
  nature: {
    backgroundColor: '#f0fdf4',
    primaryColor: '#16a34a',
    secondaryColor: '#4ade80',
    accentColor: '#059669',
  },
  ocean: {
    backgroundColor: '#f0f9ff',
    primaryColor: '#0284c7',
    secondaryColor: '#7dd3fc',
    accentColor: '#0ea5e9',
  },
  sunset: {
    backgroundColor: '#fff7ed',
    primaryColor: '#ea580c',
    secondaryColor: '#fb923c',
    accentColor: '#f97316',
  },
  lavender: {
    backgroundColor: '#f5f3ff',
    primaryColor: '#7c3aed',
    secondaryColor: '#a78bfa',
    accentColor: '#8b5cf6',
  },
}

// Images de fond prédéfinies
const BACKGROUND_IMAGES = [
  { id: 'none', name: 'Aucun', url: '' },
  { id: 'gradient1', name: 'Dégradé bleu', url: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' },
  { id: 'gradient2', name: 'Dégradé chaud', url: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)' },
  { id: 'gradient3', name: 'Dégradé nature', url: 'linear-gradient(135deg, #5ee7df 0%, #b490ca 100%)' },
  { id: 'gradient4', name: 'Dégradé océan', url: 'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)' },
]

// Tailles de police disponibles
const FONT_SIZES = [
  { value: 12, label: 'Très petit' },
  { value: 13, label: 'Petit' },
  { value: 14, label: 'Normal' },
  { value: 15, label: 'Grand' },
  { value: 16, label: 'Très grand' },
]

// Hook principal pour utiliser les paramètres
export function useClinicSettings() {
  const context = useContext(ClinicSettingsContext)
  if (!context) {
    throw new Error('useClinicSettings must be used within a ClinicSettingsProvider')
  }
  return context
}

// Provider pour les paramètres
export function ClinicSettingsProvider({ children }) {
  // Initialiser avec les paramètres sauvegardés ou les défauts
  const [settings, setSettings] = useState(() => {
    try {
      const savedSettings = localStorage.getItem('clinique_settings')
      if (savedSettings) {
        const parsed = JSON.parse(savedSettings)
        return { ...DEFAULT_SETTINGS, ...parsed }
      }
    } catch (e) {
      console.error('Erreur lors du chargement des paramètres:', e)
    }
    return DEFAULT_SETTINGS
  })
  const isInitialized = useRef(false)

  // Appliquer les paramètres au DOM
  const applySettingsToDOM = (settings) => {
    const root = document.documentElement
    
    // Appliquer la taille de police
    root.style.setProperty('--base-font-size', `${settings.fontSize}px`)
    root.style.setProperty('--font-family', settings.fontFamily)
    
    // Appliquer les couleurs
    root.style.setProperty('--primary-color', settings.primaryColor)
    root.style.setProperty('--secondary-color', settings.secondaryColor)
    root.style.setProperty('--accent-color', settings.accentColor)
    
    // Appliquer le fond
    if (settings.backgroundType === 'image' && settings.backgroundImage) {
      root.style.setProperty('--background-image', `url(${settings.backgroundImage})`)
      root.style.setProperty('--background-size', 'cover')
      root.style.setProperty('--background-position', 'center')
    } else if (settings.backgroundType === 'gradient') {
      root.style.setProperty('--background-image', `linear-gradient(135deg, ${settings.gradientStart} 0%, ${settings.gradientEnd} 100%)`)
    } else {
      root.style.setProperty('--background-image', 'none')
    }
    root.style.setProperty('--background-color', settings.backgroundColor)
    
    // Appliquer le thème
    if (settings.theme === 'dark') {
      root.setAttribute('data-theme', 'dark')
    } else {
      root.removeAttribute('data-theme')
    }
    
    // Appliquer le mode compact
    if (settings.compactMode) {
      root.setAttribute('data-compact', 'true')
    } else {
      root.removeAttribute('data-compact')
    }
  }

  // Sauvegarder les paramètres dans localStorage à chaque modification
  useEffect(() => {
    if (!isInitialized.current) {
      isInitialized.current = true
      return
    }
    localStorage.setItem('clinique_settings', JSON.stringify(settings))
    applySettingsToDOM(settings)
  }, [settings])

  // Mettre à jour un paramètre
  const updateSetting = (key, value) => {
    setSettings(prev => ({ ...prev, [key]: value }))
  }

  // Appliquer un thème prédéfini
  const applyPresetTheme = (themeName) => {
    const theme = PRESET_THEMES[themeName]
    if (theme) {
      setSettings(prev => ({ 
        ...prev, 
        ...theme,
        theme: themeName === 'light' ? 'light' : themeName 
      }))
    }
  }

  // Réinitialiser les paramètres par défaut
  const resetSettings = () => {
    setSettings(DEFAULT_SETTINGS)
    localStorage.removeItem('clinique_settings')
  }

  // Exporter les paramètres
  const exportSettings = () => {
    const dataStr = JSON.stringify(settings, null, 2)
    const dataBlob = new Blob([dataStr], { type: 'application/json' })
    const url = URL.createObjectURL(dataBlob)
    const link = document.createElement('a')
    link.href = url
    link.download = 'clinique-settings.json'
    link.click()
    URL.revokeObjectURL(url)
  }

  // Importer les paramètres
  const importSettings = (jsonString) => {
    try {
      const parsed = JSON.parse(jsonString)
      setSettings(prev => ({ ...prev, ...parsed }))
      return { success: true }
    } catch (e) {
      return { success: false, error: e.message }
    }
  }

  const value = {
    settings,
    updateSetting,
    applyPresetTheme,
    resetSettings,
    exportSettings,
    importSettings,
    PRESET_THEMES,
    BACKGROUND_IMAGES,
    FONT_SIZES,
  }

  return (
    <ClinicSettingsContext.Provider value={value}>
      {children}
    </ClinicSettingsContext.Provider>
  )
}

export default useClinicSettings