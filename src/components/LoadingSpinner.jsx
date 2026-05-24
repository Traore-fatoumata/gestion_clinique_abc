// ─── Loading Spinner ────────────────────────────────────────
export function LoadingSpinner({ size = 40, color = "#059669", text = "" }) {
  return (
    <div style={{
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      padding: 48,
      gap: 16,
    }}>
      <div style={{
        width: size,
        height: size,
        border: `3px solid ${color}22`,
        borderTop: `3px solid ${color}`,
        borderRadius: "50%",
        animation: "spin 0.8s linear infinite",
      }} />
      {text && (
        <p style={{
          fontSize: 14,
          color: "#6b7280",
          fontWeight: 500,
        }}>{text}</p>
      )}
      <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
    </div>
  )
}

// ─── Skeleton Card ──────────────────────────────────────────
export function SkeletonCard({ lines = 3 }) {
  return (
    <div style={{
      background: "#ffffff",
      borderRadius: 16,
      border: "1px solid #e2ebe4",
      padding: 20,
      boxShadow: "0 1px 4px rgba(0,0,0,0.04)",
    }}>
      <div style={{
        display: "flex",
        gap: 12,
        marginBottom: 16,
      }}>
        <div style={{
          width: 44,
          height: 44,
          borderRadius: 12,
          background: "linear-gradient(90deg, #f3f4f6 25%, #e5e7eb 50%, #f3f4f6 75%)",
          backgroundSize: "200% 100%",
          animation: "shimmer 1.5s infinite",
        }} />
        <div style={{ flex: 1 }}>
          <div style={{
            height: 14,
            borderRadius: 4,
            background: "linear-gradient(90deg, #f3f4f6 25%, #e5e7eb 50%, #f3f4f6 75%)",
            backgroundSize: "200% 100%",
            animation: "shimmer 1.5s infinite",
            width: "60%",
            marginBottom: 8,
          }} />
          <div style={{
            height: 10,
            borderRadius: 4,
            background: "linear-gradient(90deg, #f3f4f6 25%, #e5e7eb 50%, #f3f4f6 75%)",
            backgroundSize: "200% 100%",
            animation: "shimmer 1.5s infinite",
            width: "40%",
          }} />
        </div>
      </div>
      {Array.from({ length: lines }).map((_, i) => (
        <div key={i} style={{
          height: 12,
          borderRadius: 4,
          background: "linear-gradient(90deg, #f3f4f6 25%, #e5e7eb 50%, #f3f4f6 75%)",
          backgroundSize: "200% 100%",
          animation: `shimmer 1.5s infinite ${i * 0.1}s`,
          width: `${100 - i * 10}%`,
          marginBottom: i < lines - 1 ? 10 : 0,
        }} />
      ))}
      <style>{`
        @keyframes shimmer {
          0% { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }
      `}</style>
    </div>
  )
}

// ─── Page Loader ────────────────────────────────────────────
export function PageLoader() {
  return (
    <div style={{
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      minHeight: "100vh",
      background: "#f7f9f8",
    }}>
      <div style={{ textAlign: "center" }}>
        <div style={{
          width: 56,
          height: 56,
          border: "4px solid #05966922",
          borderTop: "4px solid #059669",
          borderRadius: "50%",
          animation: "spin 0.8s linear infinite",
          margin: "0 auto 16px",
        }} />
        <p style={{
          fontSize: 16,
          fontWeight: 600,
          color: "#1f2937",
          marginBottom: 4,
        }}>Chargement...</p>
        <p style={{ fontSize: 13, color: "#6b7280" }}>
          Veuillez patienter
        </p>
        <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
      </div>
    </div>
  )
}

// ─── Inline Loader (small) ──────────────────────────────────
export function InlineLoader({ size = 16, color = "#059669" }) {
  return (
    <div style={{
      width: size,
      height: size,
      border: `2px solid ${color}22`,
      borderTop: `2px solid ${color}`,
      borderRadius: "50%",
      animation: "spin 0.6s linear infinite",
      display: "inline-block",
    }} />
  )
}

export default LoadingSpinner