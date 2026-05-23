import { useState } from "react"
import { C, Overlay, CloseBtn, PatientBanner, InfoGrid, Field, Select, inputStyle, INFIRMIERS, Btn } from "./shared.jsx"

// ══════════════════════════════════════════════════════
//  MODAL — EXÉCUTION DU SOIN
// ══════════════════════════════════════════════════════
export default function ModalExecutionSoin({ soin, onClose, onValider }) {
  const [observations, setObservations] = useState(soin.observations || "")
  const [tolerance, setTolerance]       = useState("bonne")
  const [infirmier, setInfirmier]       = useState(INFIRMIERS[0])

  return (
    <Overlay onClose={onClose}>
      <div style={{ background: C.white, borderRadius: 20, width: "100%", maxWidth: 580, maxHeight: "90vh", overflow: "auto", boxShadow: "0 25px 60px rgba(0,0,0,0.25)" }}>
        <div style={{ padding: "20px 24px 16px", borderBottom: "1px solid " + C.border, display: "flex", justifyContent: "space-between", alignItems: "center", background: C.blueSoft, borderRadius: "20px 20px 0 0" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div style={{ width: 44, height: 44, borderRadius: 12, background: C.blue, display: "flex", alignItems: "center", justifyContent: "center", color:"#fff" }}><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="m18 2 4 4-14 14H4v-4L18 2z"/><path d="m14.5 5.5 4 4"/></svg></div>
            <div>
              <p style={{ fontSize: 16, fontWeight: 800, color: C.blueDark }}>Exécuter le soin</p>
              <p style={{ fontSize: 12, color: C.textPri }}>{soin.patient.nom} — {soin.typeSoin}</p>
            </div>
          </div>
          <CloseBtn onClose={onClose} />
        </div>
        <div style={{ padding: "24px", display: "flex", flexDirection: "column", gap: 16 }}>
          <PatientBanner patient={soin.patient} />
          <InfoGrid soin={soin} />
          <Field label="Infirmier(ère) exécutant">
            <Select value={infirmier} onChange={v => setInfirmier(v)} placeholder="">
              {INFIRMIERS.map(i => <option key={i} value={i}>{i}</option>)}
            </Select>
          </Field>
          <div>
            <p style={{ fontSize: 13, fontWeight: 600, color: C.textPri, marginBottom: 10 }}>Tolérance du patient</p>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10 }}>
              {[
                { val: "bonne",    label: "Bonne",    icon: "Bon", color: C.green, bg: C.greenSoft },
                { val: "moyenne",  label: "Moyenne",  icon: "Moyen", color: C.slate, bg: C.slateSoft },
                { val: "mauvaise", label: "Mauvaise", icon: "Douleur", color: C.red,   bg: C.redSoft   },
              ].map(opt => (
                <div key={opt.val} onClick={() => setTolerance(opt.val)} style={{
                  padding: "14px 10px", borderRadius: 12, cursor: "pointer",
                  border: "2px solid " + (tolerance === opt.val ? opt.color : C.border),
                  background: tolerance === opt.val ? opt.bg : C.white,
                  textAlign: "center", transition: "all .15s"
                }}>
                  <p style={{ fontSize: 24, marginBottom: 6 }}>{opt.icon}</p>
                  <p style={{ fontSize: 12, fontWeight: 700, color: tolerance === opt.val ? opt.color : C.textSec }}>{opt.label}</p>
                </div>
              ))}
            </div>
          </div>
          <Field label="Observations post-soin">
            <textarea value={observations} onChange={e => setObservations(e.target.value)} rows={3}
              placeholder="Ex : Patient tolère bien, pas de réaction adverse..."
              style={{ ...inputStyle(), resize: "vertical" }} />
          </Field>
          <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, paddingTop: 8, borderTop: "1px solid " + C.border }}>
            <Btn onClick={onClose} variant="secondary">Annuler</Btn>
            <Btn onClick={() => onValider(observations, tolerance, infirmier)} variant="success">
              Valider l'exécution
            </Btn>
          </div>
        </div>
      </div>
    </Overlay>
  )
}
