import { useState } from "react"
import { C, Btn, today } from "./shared.jsx"

// ══════════════════════════════════════════════════════
//  MODAL — PERMISSION / ABSENCE
// ══════════════════════════════════════════════════════
export default function ModalPermission({ medecin, onClose, onValider }) {
  const [type, setType] = useState(null) // 'maladie' | 'urgence'
  const [description, setDescription] = useState("")
  const [dateDebut, setDateDebut] = useState(today())
  const [dateFin, setDateFin] = useState(today())
  const [justificatif, setJustificatif] = useState(null)

  if (!medecin) return null

  const iSt = { width:"100%",padding:"11px 14px",fontSize:14,border:"1.5px solid "+C.border,borderRadius:10,background:C.white,color:C.textPri,outline:"none",fontFamily:"inherit" }

  return (
    <div style={{ position:"fixed",inset:0,background:"rgba(15,23,42,0.5)",zIndex:200,display:"flex",alignItems:"center",justifyContent:"center",padding:20 }}
      onClick={e=>{ if(e.target===e.currentTarget) onClose() }}>
      <div style={{ background:C.white,borderRadius:20,width:"100%",maxWidth:520,boxShadow:"0 25px 60px rgba(0,0,0,0.2)" }}>
        <div style={{ padding:"22px 28px 18px",borderBottom:"1px solid "+C.border,display:"flex",justifyContent:"space-between",alignItems:"center" }}>
          <div>
            <p style={{ fontSize:18,fontWeight:800,color:C.textPri }}>Enregistrer une absence</p>
            <p style={{ fontSize:13,color:C.textSec,marginTop:3 }}>{medecin.nom} — {medecin.specialite}</p>
          </div>
          <button onClick={onClose} style={{ background:C.slateSoft,border:"none",borderRadius:8,color:C.textSec,cursor:"pointer",width:32,height:32,display:"flex",alignItems:"center",justifyContent:"center",fontSize:18 }}>×</button>
        </div>

        <div style={{ padding:"24px 28px",display:"flex",flexDirection:"column",gap:16 }}>
          {/* Type d'absence */}
          <div>
            <label style={{ display:"block",fontSize:13,fontWeight:600,color:C.textPri,marginBottom:8 }}>Type d'absence <span style={{ color:C.red }}>*</span></label>
            <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr",gap:10 }}>
              {[
                { val:"maladie", label:"Maladie", icon:"", color:C.slate },
                { val:"urgence", label:"Urgence", icon:"", color:C.red },
              ].map(opt => (
                <div key={opt.val} onClick={()=>setType(opt.val)}
                  style={{ padding:"12px 14px",borderRadius:12,border:"2px solid "+(type===opt.val?opt.color:C.border),background:type===opt.val?opt.color+"11":C.white,cursor:"pointer",textAlign:"center",transition:"all .15s" }}>
                  <p style={{ fontSize:20,marginBottom:4 }}>{opt.icon}</p>
                  <p style={{ fontSize:13,fontWeight:700,color:type===opt.val?opt.color:C.textSec }}>{opt.label}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Description */}
          <div>
            <label style={{ display:"block",fontSize:13,fontWeight:600,color:C.textPri,marginBottom:6 }}>Description</label>
            <textarea value={description} onChange={e=>setDescription(e.target.value)} placeholder="Précisez le motif de l'absence..." style={{...iSt,minHeight:80,resize:"vertical"}} />
          </div>

          {/* Dates */}
          <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr",gap:12 }}>
            <div>
              <label style={{ display:"block",fontSize:13,fontWeight:600,color:C.textPri,marginBottom:6 }}>Date de début <span style={{ color:C.red }}>*</span></label>
              <input type="date" value={dateDebut} onChange={e=>setDateDebut(e.target.value)} style={iSt} />
            </div>
            <div>
              <label style={{ display:"block",fontSize:13,fontWeight:600,color:C.textPri,marginBottom:6 }}>Date de fin <span style={{ color:C.red }}>*</span></label>
              <input type="date" value={dateFin} onChange={e=>setDateFin(e.target.value)} style={iSt} min={dateDebut} />
            </div>
          </div>

          {/* Justificatif */}
          <div>
            <label style={{ display:"block",fontSize:13,fontWeight:600,color:C.textPri,marginBottom:6 }}>Justificatif (optionnel)</label>
            <input type="file" onChange={e=>setJustificatif(e.target.files?.[0]||null)} style={iSt} accept=".pdf,.jpg,.jpeg,.png" />
            <p style={{ fontSize:11,color:C.textMuted,marginTop:4 }}>Formats acceptés : PDF, JPG, PNG</p>
          </div>

          {/* Avertissement */}
          {type && (
            <div style={{ background:type==="maladie"?C.slateSoft:C.redSoft,border:"1px solid "+(type==="maladie"?C.slate:C.red)+"33",borderRadius:10,padding:"12px 16px" }}>
              <p style={{ fontSize:13,color:type==="maladie"?C.slate:C.red,fontWeight:600 }}>
                Cette absence sera enregistrée dans l'historique de présence
              </p>
            </div>
          )}

          {/* Boutons */}
          <div style={{ display:"flex",justifyContent:"flex-end",gap:10,paddingTop:8,borderTop:"1px solid "+C.border }}>
            <Btn onClick={onClose} variant="secondary">Annuler</Btn>
            <Btn onClick={()=>{ if(type&&dateDebut&&dateFin) { onValider({ type, description, dateDebut, dateFin, justificatif }); onClose(); } }} variant="success" disabled={!type||!dateDebut||!dateFin}>
              Enregistrer l'absence
            </Btn>
          </div>
        </div>
      </div>
    </div>
  )
}
