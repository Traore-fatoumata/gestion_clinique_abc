import { useState } from "react"
import { C, Overlay, CloseBtn, SectionCard, Field, iSt, Btn, TYPES_EXAMENS, EXAMENS_PAR_TYPE } from "./shared.jsx"

export default function ModalNouvelleDemande({ patients, onClose, onCreate }) {
  const [form, setForm] = useState({ patientId:"", medecinPrescripteur:"", service:"", urgent:false, examens:[{ type:"Hématologie", nom:"", prix:"" }] })
  const setF = (k, v) => setForm(p => ({ ...p, [k]: v }))

  const updateExamen = (index, field, value) => {
    setForm(p => {
      const examens = p.examens.map((e, i) => {
        if (i !== index) return e
        const updated = { ...e, [field]: value }
        if (field === "type") updated.nom = ""
        return updated
      })
      return { ...p, examens }
    })
  }
  const ajouterExamen  = () => setForm(p => ({ ...p, examens: [...p.examens, { type:"Hématologie", nom:"", prix:"" }] }))
  const supprimerExamen = idx => setForm(p => ({ ...p, examens: p.examens.filter((_, i) => i !== idx) }))

  const total = form.examens.reduce((s, e) => s + (parseInt(e.prix) || 0), 0)
  const ok = form.patientId && form.medecinPrescripteur && form.examens.length > 0 && form.examens.every(e => e.nom && e.prix)

  return (
    <Overlay onClose={onClose}>
      <div style={{ background:C.white, borderRadius:20, width:"100%", maxWidth:700, maxHeight:"90vh", overflow:"auto", boxShadow:"0 25px 60px rgba(0,0,0,0.25)" }}>
        <div style={{ padding:"20px 24px 16px", borderBottom:"1px solid "+C.border, display:"flex", justifyContent:"space-between", alignItems:"center" }}>
          <div>
            <p style={{ fontSize:17, fontWeight:800, color:C.textPri }}>Nouvelle demande d'examen</p>
            <p style={{ fontSize:13, color:C.textSec, marginTop:2 }}>Créer une demande d'analyse de laboratoire</p>
          </div>
          <CloseBtn onClose={onClose} />
        </div>
        <div style={{ padding:"22px 24px", display:"flex", flexDirection:"column", gap:18 }}>
          <SectionCard label="Informations du patient" icon="user" color={C.blue}>
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:14 }}>
              <Field label="Patient" required>
                <select value={form.patientId} onChange={e => setF("patientId", e.target.value)} style={iSt()}>
                  <option value="">— Choisir un patient —</option>
                  {patients.map(p => <option key={p.id} value={p.id}>{p.nom} — {p.pid}</option>)}
                </select>
              </Field>
              <Field label="Médecin prescripteur" required>
                <input value={form.medecinPrescripteur} onChange={e => setF("medecinPrescripteur", e.target.value)} placeholder="Ex : Dr. Doumbouya" style={iSt()} />
              </Field>
              <Field label="Service">
                <input value={form.service} onChange={e => setF("service", e.target.value)} placeholder="Ex : Médecine générale" style={iSt()} />
              </Field>
              <div style={{ display:"flex", alignItems:"center", paddingTop:26 }}>
                <div onClick={() => setF("urgent", !form.urgent)} style={{ display:"flex", alignItems:"center", gap:10, padding:"10px 14px", borderRadius:10, cursor:"pointer", background:form.urgent?C.redSoft:C.slateSoft, border:"1.5px solid "+(form.urgent?C.red+"50":C.border), transition:"all .15s", width:"100%" }}>
                  <input type="checkbox" checked={form.urgent} onChange={() => {}} style={{ width:17, height:17, accentColor:C.red, cursor:"pointer" }} />
                  <div>
                    <p style={{ fontSize:13, fontWeight:700, color:form.urgent?C.red:C.textSec }}>Demande urgente</p>
                    <p style={{ fontSize:11, color:C.textMuted }}>Priorité élevée</p>
                  </div>
                </div>
              </div>
            </div>
          </SectionCard>

          <SectionCard label="Examens à réaliser" icon="micro" color={C.purple}>
            {form.examens.map((examen, idx) => (
              <div key={idx} style={{ display:"grid", gridTemplateColumns:"1fr 1.4fr 110px 36px", gap:10, alignItems:"flex-end", paddingBottom:idx<form.examens.length-1?12:0, marginBottom:idx<form.examens.length-1?12:0, borderBottom:idx<form.examens.length-1?"1px dashed "+C.border:"none" }}>
                <Field label="Type">
                  <select value={examen.type} onChange={e => updateExamen(idx,"type",e.target.value)} style={iSt({ padding:"9px 12px" })}>
                    {TYPES_EXAMENS.map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                </Field>
                <Field label="Examen" required>
                  <select value={examen.nom} onChange={e => updateExamen(idx,"nom",e.target.value)} style={iSt({ padding:"9px 12px" })}>
                    <option value="">— Choisir —</option>
                    {(EXAMENS_PAR_TYPE[examen.type]||[]).map(n => <option key={n} value={n}>{n}</option>)}
                  </select>
                </Field>
                <Field label="Prix (GNF)" required>
                  <input type="number" value={examen.prix} onChange={e => updateExamen(idx,"prix",e.target.value)} placeholder="0" style={iSt({ padding:"9px 12px" })} />
                </Field>
                {form.examens.length > 1 && (
                  <button onClick={() => supprimerExamen(idx)} style={{ width:36, height:36, borderRadius:8, background:C.redSoft, border:"1px solid "+C.red+"30", color:C.red, cursor:"pointer", fontSize:16, display:"flex", alignItems:"center", justifyContent:"center" }}>×</button>
                )}
              </div>
            ))}
            <button onClick={ajouterExamen} style={{ marginTop:12, padding:"8px 16px", border:"2px dashed "+C.border, borderRadius:10, background:"transparent", color:C.blue, fontSize:13, fontWeight:600, cursor:"pointer", fontFamily:"inherit", display:"flex", alignItems:"center", gap:6 }}>
              + Ajouter un examen
            </button>
          </SectionCard>

          <div style={{ background:C.greenSoft, borderRadius:12, padding:"14px 18px", border:"1px solid "+C.green+"40", display:"flex", justifyContent:"space-between", alignItems:"center" }}>
            <div>
              <p style={{ fontSize:13, fontWeight:600, color:C.textSec }}>Montant total à payer</p>
              <p style={{ fontSize:11, color:C.textMuted }}>{form.examens.length} examen{form.examens.length>1?"s":""}</p>
            </div>
            <p style={{ fontSize:24, fontWeight:900, color:C.green }}>{total.toLocaleString("fr-FR")} GNF</p>
          </div>

          <div style={{ display:"flex", justifyContent:"flex-end", gap:10, paddingTop:8, borderTop:"1px solid "+C.border }}>
            <Btn onClick={onClose} variant="secondary">Annuler</Btn>
            <Btn onClick={() => { if (ok) { onCreate(form); onClose() } }} disabled={!ok} variant="success">Créer la demande</Btn>
          </div>
        </div>
      </div>
    </Overlay>
  )
}
