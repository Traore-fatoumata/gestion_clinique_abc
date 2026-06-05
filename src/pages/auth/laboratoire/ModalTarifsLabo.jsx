import { useState } from "react"
import { C, Btn, Overlay } from "./shared.jsx"

export default function ModalTarifsLabo({ demande, onClose, onSave }) {
  const [examens, setExamens] = useState(
    (demande?.examens || []).map(e => ({ id: e.id, nom: e.nom, prix: e.prix || "" }))
  )

  const total = examens.reduce((s, e) => s + (parseInt(e.prix) || 0), 0)
  const ok = examens.every(e => parseInt(e.prix) > 0)

  return (
    <Overlay onClose={onClose}>
      <div style={{ background: C.white, borderRadius: 20, width: "100%", maxWidth: 520, padding: 0, overflow: "hidden", boxShadow: "0 25px 60px rgba(0,0,0,0.2)" }}>
        <div style={{ padding: "20px 24px", background: "linear-gradient(135deg,#5b21b6,#7c3aed)" }}>
          <p style={{ fontSize: 17, fontWeight: 800, color: "#fff" }}>Fixer les tarifs — {demande?.patient?.nom}</p>
          <p style={{ fontSize: 12, color: "rgba(255,255,255,0.75)", marginTop: 4 }}>
            Prescrit par {demande?.medecinPrescripteur || "—"} · {demande?.examens?.length} examen(s)
          </p>
        </div>
        <div style={{ padding: "20px 24px", display: "flex", flexDirection: "column", gap: 12 }}>
          {examens.map((ex, i) => (
            <div key={ex.id || i} style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <span style={{ flex: 1, fontSize: 13, fontWeight: 600 }}>{ex.nom}</span>
              <input
                type="number"
                min="0"
                value={ex.prix}
                onChange={e => setExamens(p => p.map((x, j) => j === i ? { ...x, prix: e.target.value } : x))}
                style={{ width: 120, padding: "8px 10px", border: "1.5px solid " + C.border, borderRadius: 8, textAlign: "right", fontFamily: "inherit" }}
                placeholder="GNF"
              />
            </div>
          ))}
          <p style={{ fontSize: 14, fontWeight: 800, color: C.green, textAlign: "right" }}>
            Total : {total.toLocaleString("fr-FR")} GNF
          </p>
          <p style={{ fontSize: 11, color: C.textMuted }}>
            Après validation, le patient pourra régler les frais à la comptabilité.
          </p>
          <div style={{ display: "flex", gap: 10, justifyContent: "flex-end", paddingTop: 8 }}>
            <Btn onClick={onClose} variant="secondary">Annuler</Btn>
            <Btn onClick={() => ok && onSave(examens.map(e => ({ id: e.id, nom: e.nom, prix: parseInt(e.prix) || 0 })))} disabled={!ok} variant="success">
              Enregistrer les tarifs
            </Btn>
          </div>
        </div>
      </div>
    </Overlay>
  )
}
