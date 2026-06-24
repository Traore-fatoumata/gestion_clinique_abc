import { useState } from "react"
import { useSharedData } from "../../hooks/useSharedData.jsx"

// Local design tokens matching shared/theme aesthetics
const C = {
  bg: "#f7f9f8",
  white: "#ffffff",
  textPri: "#111827",
  textSec: "#374151",
  textMuted: "#6b7280",
  border: "#e2ebe4",
  green: "#16a34a",
  greenSoft: "#dcfce7",
  blue: "#1d6fa4",
  blueSoft: "#e8f4fb",
  red: "#dc2626",
  redSoft: "#fef2f2",
  slate: "#475569",
  slateSoft: "#f1f5f9",
}

export default function ModalModifierPatient({ patient, onClose }) {
  const { updatePatient } = useSharedData()
  const [form, setForm] = useState({
    nom: patient.nom || "",
    dateNaissance: patient.dateNaissance ? patient.dateNaissance.slice(0, 10) : "",
    sexe: patient.sexe || "F",
    telephone: patient.telephone || "",
    profession: patient.profession || "",
    quartier: patient.quartier || "",
    secteur: patient.secteur || "",
    responsable: patient.responsable || "",
  })
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState("")

  const setF = (k, v) => setForm(p => ({ ...p, [k]: v }))

  const handleSave = async () => {
    if (!form.nom.trim()) {
      setError("Le nom complet est obligatoire.")
      return
    }
    setSaving(true)
    setError("")
    try {
      await updatePatient(patient.id, form)
      onClose()
    } catch (err) {
      setError(err.message || "Erreur lors de la modification du patient.")
    } finally {
      setSaving(false)
    }
  }

  const iSt = {
    width: "100%",
    padding: "13px 16px",
    fontSize: 14,
    border: "1.5px solid " + C.border,
    borderRadius: 12,
    background: C.white,
    color: C.textPri,
    outline: "none",
    fontFamily: "inherit",
    transition: "border-color 0.2s"
  }
  const foc = e => { e.target.style.borderColor = C.blue; e.target.style.boxShadow = "0 0 0 3px " + C.blueSoft }
  const blr = e => { e.target.style.borderColor = C.border; e.target.style.boxShadow = "none" }

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(15,23,42,0.5)", zIndex: 310, display: "flex", alignItems: "flex-start", justifyContent: "center", padding: "20px", overflowY: "auto" }}
      onClick={e => { if (e.target === e.currentTarget) onClose() }}>
      <div style={{ background: C.white, borderRadius: 20, width: "100%", maxWidth: 800, marginTop: 20, boxShadow: "0 25px 60px rgba(0,0,0,0.2)", overflow: "hidden" }}>
        
        {/* Header */}
        <div style={{ padding: "24px 32px 20px", display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid " + C.border }}>
          <div>
            <p style={{ fontSize: 18, fontWeight: 800, color: C.textPri, marginBottom: 4 }}>Modifier la Fiche Patient ({patient.pid})</p>
            <p style={{ fontSize: 13, color: C.textMuted }}>Modifiez les informations ci-dessous et validez pour enregistrer les modifications.</p>
          </div>
          <button onClick={onClose}
            style={{ padding: "8px 16px", border: "1px solid " + C.border, borderRadius: 10, background: C.white, color: C.textSec, fontSize: 13, fontWeight: 600, cursor: "pointer", fontFamily: "inherit" }}
            onMouseEnter={e => e.currentTarget.style.background = C.slateSoft}
            onMouseLeave={e => e.currentTarget.style.background = C.white}>
            Fermer
          </button>
        </div>

        {error && (
          <div style={{ margin: "20px 32px 0", background: C.redSoft, color: C.red, padding: "12px 16px", borderRadius: 12, fontSize: 13, fontWeight: 600 }}>
            {error}
          </div>
        )}

        <div style={{ padding: "24px 32px 28px", display: "flex", flexDirection: "column", gap: 24 }}>
          {/* Identité */}
          <div>
            <p style={{ fontSize: 11, fontWeight: 700, color: C.textMuted, textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 16 }}>Identité du patient</p>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 16 }}>
              <div style={{ gridColumn: "span 2" }}>
                <label style={{ display: "block", fontSize: 13, fontWeight: 500, color: C.textPri, marginBottom: 8 }}>Nom Complet <span style={{ color: C.red }}>*</span></label>
                <input value={form.nom} onChange={e => setF("nom", e.target.value)} placeholder="Ex : DIALLO Aminata" style={iSt} onFocus={foc} onBlur={blr} />
              </div>
              <div>
                <label style={{ display: "block", fontSize: 13, fontWeight: 500, color: C.textPri, marginBottom: 8 }}>Téléphone</label>
                <input value={form.telephone} onChange={e => setF("telephone", e.target.value)} placeholder="+224 6XX XX XX XX" style={iSt} onFocus={foc} onBlur={blr} />
              </div>
              <div>
                <label style={{ display: "block", fontSize: 13, fontWeight: 500, color: C.textPri, marginBottom: 8 }}>Date de naissance</label>
                <input type="date" value={form.dateNaissance} onChange={e => setF("dateNaissance", e.target.value)} style={iSt} onFocus={foc} onBlur={blr} />
              </div>
              <div>
                <label style={{ display: "block", fontSize: 13, fontWeight: 500, color: C.textPri, marginBottom: 8 }}>Sexe</label>
                <select value={form.sexe} onChange={e => setF("sexe", e.target.value)} style={{ ...iSt, cursor: "pointer" }}>
                  <option value="F">Féminin</option>
                  <option value="M">Masculin</option>
                </select>
              </div>
              <div>
                <label style={{ display: "block", fontSize: 13, fontWeight: 500, color: C.textPri, marginBottom: 8 }}>Profession</label>
                <input value={form.profession} onChange={e => setF("profession", e.target.value)} placeholder="Ex : Enseignant" style={iSt} onFocus={foc} onBlur={blr} />
              </div>
              <div>
                <label style={{ display: "block", fontSize: 13, fontWeight: 500, color: C.textPri, marginBottom: 8 }}>Quartier</label>
                <input value={form.quartier} onChange={e => setF("quartier", e.target.value)} placeholder="Ex : Ratoma" style={iSt} onFocus={foc} onBlur={blr} />
              </div>
              <div>
                <label style={{ display: "block", fontSize: 13, fontWeight: 500, color: C.textPri, marginBottom: 8 }}>Secteur / District</label>
                <input value={form.secteur} onChange={e => setF("secteur", e.target.value)} placeholder="Ex : Yimbayah" style={iSt} onFocus={foc} onBlur={blr} />
              </div>
              <div>
                <label style={{ display: "block", fontSize: 13, fontWeight: 500, color: C.textPri, marginBottom: 8 }}>Responsable légal</label>
                <input value={form.responsable} onChange={e => setF("responsable", e.target.value)} placeholder="Ex : Diallo Amadou" style={iSt} onFocus={foc} onBlur={blr} />
              </div>
            </div>
          </div>

          {/* Actions */}
          <div style={{ display: "flex", justifyContent: "flex-end", gap: 12, paddingTop: 16, borderTop: "1px solid " + C.border }}>
            <button onClick={onClose} disabled={saving}
              style={{ padding: "10px 20px", border: "1px solid " + C.border, borderRadius: 10, background: C.white, color: C.textSec, fontSize: 13, fontWeight: 600, cursor: "pointer", fontFamily: "inherit" }}
              onMouseEnter={e => e.currentTarget.style.background = C.slateSoft}
              onMouseLeave={e => e.currentTarget.style.background = C.white}>
              Annuler
            </button>
            <button onClick={handleSave} disabled={saving || !form.nom.trim()}
              style={{ padding: "10px 24px", border: "none", borderRadius: 10, background: saving ? C.slate : C.blue, color: "#fff", fontSize: 13, fontWeight: 700, cursor: "pointer", fontFamily: "inherit", opacity: (saving || !form.nom.trim()) ? 0.6 : 1 }}>
              {saving ? "Enregistrement..." : "Enregistrer les modifications"}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
