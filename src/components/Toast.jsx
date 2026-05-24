import { useState, useEffect, createContext, useContext, useCallback } from "react"

// ─── Toast Context ──────────────────────────────────────────
const ToastContext = createContext(null)

export const useToast = () => {
  const context = useContext(ToastContext)
  if (!context) throw new Error("useToast must be used within ToastProvider")
  return context
}

// ─── Toast Provider ─────────────────────────────────────────
export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([])

  const addToast = useCallback((message, type = "info", duration = 4000) => {
    const id = Date.now() + Math.random()
    setToasts(prev => [...prev, { id, message, type, duration }])
    return id
  }, [])

  const removeToast = useCallback((id) => {
    setToasts(prev => prev.filter(t => t.id !== id))
  }, [])

  const success = useCallback((message, duration) => addToast(message, "success", duration), [addToast])
  const error = useCallback((message, duration) => addToast(message, "error", duration), [addToast])
  const warning = useCallback((message, duration) => addToast(message, "warning", duration), [addToast])
  const info = useCallback((message, duration) => addToast(message, "info", duration), [addToast])

  // Auto-remove toasts after duration
  useEffect(() => {
    if (toasts.length === 0) return
    const timers = toasts
      .filter(t => t.duration > 0)
      .map(toast => setTimeout(() => removeToast(toast.id), toast.duration))
    return () => timers.forEach(clearTimeout)
  }, [toasts, removeToast])

  return (
    <ToastContext.Provider value={{ addToast, removeToast, success, error, warning, info }}>
      {children}
      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </ToastContext.Provider>
  )
}

// ─── Toast Container ────────────────────────────────────────
function ToastContainer({ toasts, onRemove }) {
  if (toasts.length === 0) return null

  return (
    <div
      style={{
        position: "fixed",
        top: 20,
        right: 20,
        zIndex: 9999,
        display: "flex",
        flexDirection: "column",
        gap: 10,
        maxWidth: 400,
        pointerEvents: "none",
      }}
    >
      {toasts.map((toast, index) => (
        <ToastItem
          key={toast.id}
          toast={toast}
          onRemove={() => onRemove(toast.id)}
          style={{ animationDelay: `${index * 50}ms` }}
        />
      ))}
    </div>
  )
}

// ─── Individual Toast Item ──────────────────────────────────
function ToastItem({ toast, onRemove, style }) {
  const [isExiting, setIsExiting] = useState(false)

  useEffect(() => {
    if (toast.duration > 0) {
      const timer = setTimeout(() => {
        setIsExiting(true)
        setTimeout(onRemove, 300)
      }, toast.duration - 300)
      return () => clearTimeout(timer)
    }
  }, [toast.duration, onRemove])

  const config = TOAST_CONFIG[toast.type] || TOAST_CONFIG.info

  return (
    <div
      role="alert"
      aria-live="assertive"
      style={{
        display: "flex",
        alignItems: "center",
        gap: 12,
        padding: "14px 16px",
        background: "#ffffff",
        borderRadius: 12,
        boxShadow: "0 10px 40px -10px rgba(0,0,0,0.15), 0 0 0 1px rgba(0,0,0,0.05)",
        borderLeft: `4px solid ${config.color}`,
        pointerEvents: "auto",
        transform: isExiting ? "translateX(120%)" : "translateX(0)",
        opacity: isExiting ? 0 : 1,
        transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
        animation: "slideIn 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
        ...style,
      }}
    >
      <div style={{ flexShrink: 0, color: config.color }}>
        {config.icon}
      </div>
      <p style={{ flex: 1, fontSize: 14, fontWeight: 500, color: "#1f2937", lineHeight: 1.4 }}>
        {toast.message}
      </p>
      <button
        onClick={() => { setIsExiting(true); setTimeout(onRemove, 300) }}
        style={{
          flexShrink: 0,
          width: 24,
          height: 24,
          border: "none",
          background: "transparent",
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          borderRadius: 6,
          color: "#9ca3af",
          transition: "all 0.15s ease",
        }}
        onMouseEnter={e => { e.currentTarget.style.background = "#f3f4f6"; e.currentTarget.style.color = "#374151" }}
        onMouseLeave={e => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "#9ca3af" }}
        aria-label="Fermer"
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
          <line x1="18" y1="6" x2="6" y2="18" />
          <line x1="6" y1="6" x2="18" y2="18" />
        </svg>
      </button>

      <style>{`
        @keyframes slideIn {
          from { transform: translateX(120%); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }
      `}</style>
    </div>
  )
}

// ─── Toast Configuration ────────────────────────────────────
const TOAST_CONFIG = {
  success: {
    color: "#059669",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
        <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
        <polyline points="22 4 12 14.01 9 11.01" />
      </svg>
    ),
  },
  error: {
    color: "#ef4444",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
        <circle cx="12" cy="12" r="10" />
        <line x1="15" y1="9" x2="9" y2="15" />
        <line x1="9" y1="9" x2="15" y2="15" />
      </svg>
    ),
  },
  warning: {
    color: "#f59e0b",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
        <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
        <line x1="12" y1="9" x2="12" y2="13" />
        <line x1="12" y1="17" x2="12.01" y2="17" />
      </svg>
    ),
  },
  info: {
    color: "#3b82f6",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
        <circle cx="12" cy="12" r="10" />
        <line x1="12" y1="16" x2="12" y2="12" />
        <line x1="12" y1="8" x2="12.01" y2="8" />
      </svg>
    ),
  },
}

export default ToastProvider