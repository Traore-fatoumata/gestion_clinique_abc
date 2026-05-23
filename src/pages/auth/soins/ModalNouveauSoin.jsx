import { useState } from "react"
import { C, Overlay, CloseBtn, Field, Input, Select, inputStyle, today, TYPES_SOINS, ZONES_ADMIN, Btn } from "./shared.jsx"

// ══════════════════════════════════════════════════════
//  MODAL — NOUVEAU SOIN
// ══════════════════════════════════════════════════════
export default function ModalNouveauSoin({ patients, onClose, onCreate }) {
  const [form, setForm] = useState({
    patientId: "", typeSoin: "", zone: "", medicament: "",
    dose: "", voie: "", observations: "", urgent: false,
    dateProgrammee: today(), heureProgrammee: ""
  })
  const setF = (k, v) => setForm(p => ({ ...p, [k]: v }))
  const ok = form.patientId && form.typeSoin && form.dateProgrammee && form.heureProgrammee

  return (
    <Overlay onClose={onClose}>
      <div style={{ background: C.white, borderRadius: 20, width: "100%", maxWidth: 640, maxHeight: "90vh", overflow: "auto", boxShadow: "0 25px 60px rgba(0,0,0,0.25)" }}>
        <div style={{ padding: "20px 24px 16px", borderBottom: "1px solid " + C.border, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <p style={{ fontSize: 18, fontWeight: 800, color: C.textPri }}>Programmer un soin</p>
            <p style={{ fontSize: 13, color: C.textSec, marginTop: 2 }}>Nouvelle prescription infirmière</p>
          </div>
          <CloseBtn onClose={onClose} />
        </div>
        <div style={{ padding: "24px", display: "flex", flexDirection: "column", gap: 16 }}>
          <Field label="Patient" required>
            <Select value={form.patientId} onChange={v => setF("patientId", v)} placeholder="— Choisir un patient —">
              {patients.map(p => <option key={p.id} value={p.id}>{p.nom} — {p.pid}</option>)}
            </Select>
          </Field>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
            <Field label="Type de soin" required>
              <Select value={form.typeSoin} onChange={v => setF("typeSoin", v)} placeholder="— Choisir —">
                {TYPES_SOINS.map(t => <option key={t} value={t}>{t}</option>)}
              </Select>
            </Field>
            <Field label="Zone d'administration">
              <Select value={form.zone} onChange={v => setF("zone", v)} placeholder="— Choisir —">
                {ZONES_ADMIN.map(z => <option key={z} value={z}>{z}</option>)}
              </Select>
            </Field>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: 14 }}>
            <Field label="Médicament / Produit">
              <Input value={form.medicament} onChange={v => setF("medicament", v)} placeholder="Ex : Paracétamol 1g" />
            </Field>
            <Field label="Dose">
              <Input value={form.dose} onChange={v => setF("dose", v)} placeholder="Ex : 1 ampoule" />
            </Field>
          </div>
          <Field label="Voie d'administration">
            <Input value={form.voie} onChange={v => setF("voie", v)} placeholder="Ex : Intramusculaire, Intraveineuse..." />
          </Field>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
            <Field label="Date prévue" required>
              <input type="date" value={form.dateProgrammee} min={today()} onChange={e => setF("dateProgrammee", e.target.value)} style={inputStyle()} />
            </Field>
            <Field label="Heure prévue" required>
              <input type="time" value={form.heureProgrammee} onChange={e => setF("heureProgrammee", e.target.value)} style={inputStyle()} />
            </Field>
          </div>
          <div style={{
            display: "flex", alignItems: "center", gap: 10, padding: "12px 16px", borderRadius: 12,
            background: form.urgent ? C.redSoft : C.slateSoft,
            border: "1.5px solid " + (form.urgent ? C.red + "40" : C.border),
            cursor: "pointer", transition: "all .15s"
          }} onClick={() => setF("urgent", !form.urgent)}>
            <input type="checkbox" checked={form.urgent} onChange={() => {}} style={{ width: 18, height: 18, accentColor: C.red, cursor: "pointer" }} />
            <div>
              <p style={{ fontSize: 13, fontWeight: 700, color: form.urgent ? C.red : C.textSec }}>Marquer comme urgent</p>
              <p style={{ fontSize: 11, color: C.textMuted }}>Ce soin apparaîtra en priorité dans la liste</p>
            </div>
          </div>
          <Field label="Observations / Prescription médicale">
            <textarea value={form.observations} onChange={e => setF("observations", e.target.value)} rows={3}
              placeholder="Ex : À jeun, Surveillance tension avant administration..."
              style={{ ...inputStyle(), resize: "vertical" }} />
          </Field>
          <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, paddingTop: 8, borderTop: "1px solid " + C.border }}>
            <Btn onClick={onClose} variant="secondary">Annuler</Btn>
            <Btn onClick={() => { if (ok) { onCreate(form); onClose() } }} disabled={!ok} variant="success">
              Programmer le soin
            </Btn>
          </div>
        </div>
      </div>
    </Overlay>
  )
}
