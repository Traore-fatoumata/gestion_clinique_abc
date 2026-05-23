import { C, Overlay, CloseBtn, PatientBanner, InfoGrid, Btn } from "./shared.jsx"

// ══════════════════════════════════════════════════════
//  MODAL — DÉTAIL SOIN
// ══════════════════════════════════════════════════════
export default function ModalDetailSoin({ soin, onClose }) {
  const toleranceCfg = {
    bonne:    { label: "Bonne",    icon: "Bon", color: C.green },
    moyenne:  { label: "Moyenne",  icon: "Moyen", color: C.slate },
    mauvaise: { label: "Mauvaise", icon: "Douleur", color: C.red   },
  }
  const tol = toleranceCfg[soin.tolerance]
  return (
    <Overlay onClose={onClose}>
      <div style={{ background: C.white, borderRadius: 20, width: "100%", maxWidth: 560, maxHeight: "90vh", overflow: "auto", boxShadow: "0 25px 60px rgba(0,0,0,0.25)" }}>
        <div style={{ padding: "20px 24px 16px", borderBottom: "1px solid " + C.border, display: "flex", justifyContent: "space-between", alignItems: "center", background: C.greenSoft, borderRadius: "20px 20px 0 0" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div style={{ width: 44, height: 44, borderRadius: 12, background: C.green, display: "flex", alignItems: "center", justifyContent: "center", color:"#fff" }}><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><polyline points="20 6 9 17 4 12"/></svg></div>
            <div>
              <p style={{ fontSize: 16, fontWeight: 800, color: C.greenDark }}>Soin réalisé</p>
              <p style={{ fontSize: 12, color: C.green }}>{soin.heure} — {soin.infirmier}</p>
            </div>
          </div>
          <CloseBtn onClose={onClose} />
        </div>
        <div style={{ padding: "24px" }}>
          <PatientBanner patient={soin.patient} />
          <InfoGrid soin={soin} />
          {tol && (
            <div style={{ marginTop: 16, padding: "14px 18px", borderRadius: 12, background: tol.color + "15", border: "1px solid " + tol.color + "40", display: "flex", alignItems: "center", gap: 12 }}>
              <span style={{ fontSize: 24 }}>{tol.icon}</span>
              <div>
                <p style={{ fontSize: 11, fontWeight: 700, color: C.textMuted, textTransform: "uppercase", letterSpacing: "0.08em" }}>Tolérance</p>
                <p style={{ fontSize: 14, fontWeight: 700, color: tol.color }}>{tol.label}</p>
              </div>
            </div>
          )}
          {soin.observations && (
            <div style={{ marginTop: 16, padding: "14px 18px", background: C.slateSoft, borderRadius: 12 }}>
              <p style={{ fontSize: 11, fontWeight: 700, color: C.textMuted, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 6 }}>Observations</p>
              <p style={{ fontSize: 13, color: C.textPri, lineHeight: 1.6 }}>{soin.observations}</p>
            </div>
          )}
          <div style={{ marginTop: 20, display: "flex", justifyContent: "flex-end" }}>
            <Btn onClick={onClose} variant="secondary">Fermer</Btn>
          </div>
        </div>
      </div>
    </Overlay>
  )
}
