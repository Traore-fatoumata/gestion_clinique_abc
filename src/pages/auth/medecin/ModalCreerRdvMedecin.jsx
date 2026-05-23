import { useState } from "react"
import { C, Btn } from "./shared.jsx"

// ══════════════════════════════════════════════════════
//  MODAL — CRÉER UN RDV (par le médecin)
// ══════════════════════════════════════════════════════
export default function ModalCreerRdvMedecin({ patients, medecin, onClose, onCreate }) {
  const [form, setForm] = useState({ patientId:"", date:"", heure:"", motif:"" })
  const setF = (k,v) => setForm(p=>({...p,[k]:v}))
  const ok = form.patientId && form.date && form.heure
  const iSt = { width:"100%", padding:"11px 14px", fontSize:14, border:"1.5px solid "+C.border, borderRadius:10, background:C.white, color:C.textPri, outline:"none", fontFamily:"inherit" }

  return (
    <div style={{ position:"fixed",inset:0,background:"rgba(15,23,42,0.5)",zIndex:300,display:"flex",alignItems:"center",justifyContent:"center",padding:20 }}
      onClick={e=>{ if(e.target===e.currentTarget) onClose() }}>
      <div style={{ background:C.white,borderRadius:20,width:"100%",maxWidth:500,boxShadow:"0 25px 60px rgba(0,0,0,0.2)",overflow:"hidden" }}>
        <div style={{ padding:"20px 24px",background:"linear-gradient(135deg,#3b1fa4,#6d28d9)",display:"flex",justifyContent:"space-between",alignItems:"center" }}>
          <div>
            <p style={{ fontSize:16,fontWeight:800,color:"#fff" }}>Nouveau rendez-vous</p>
            <p style={{ fontSize:12,color:"rgba(255,255,255,0.7)",marginTop:2 }}>{medecin.nom} · {medecin.specialite}</p>
          </div>
          <button onClick={onClose} style={{ background:"rgba(255,255,255,0.2)",border:"none",borderRadius:8,width:32,height:32,cursor:"pointer",color:"#fff",fontSize:18,display:"flex",alignItems:"center",justifyContent:"center" }}>×</button>
        </div>
        <div style={{ padding:"22px 24px",display:"flex",flexDirection:"column",gap:14 }}>
          <div>
            <label style={{ display:"block",fontSize:12,fontWeight:600,color:C.textSec,marginBottom:6 }}>Patient <span style={{ color:C.red }}>*</span></label>
            <select value={form.patientId} onChange={e=>setF("patientId",e.target.value)} style={{ ...iSt,cursor:"pointer" }}>
              <option value="">— Choisir un patient —</option>
              {patients.map(p=><option key={p.id} value={p.id}>{p.nom} · {p.pid}</option>)}
            </select>
          </div>
          <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr",gap:14 }}>
            <div>
              <label style={{ display:"block",fontSize:12,fontWeight:600,color:C.textSec,marginBottom:6 }}>Date <span style={{ color:C.red }}>*</span></label>
              <input type="date" value={form.date} onChange={e=>setF("date",e.target.value)} style={iSt}/>
            </div>
            <div>
              <label style={{ display:"block",fontSize:12,fontWeight:600,color:C.textSec,marginBottom:6 }}>Heure <span style={{ color:C.red }}>*</span></label>
              <input type="time" value={form.heure} onChange={e=>setF("heure",e.target.value)} style={iSt}/>
            </div>
          </div>
          <div>
            <label style={{ display:"block",fontSize:12,fontWeight:600,color:C.textSec,marginBottom:6 }}>Motif du rendez-vous</label>
            <input value={form.motif} onChange={e=>setF("motif",e.target.value)} placeholder="Ex : Suivi tension, CPN 3e trimestre…" style={iSt}/>
          </div>
          <div style={{ background:C.purpleSoft,border:"1px solid "+C.purple+"33",borderRadius:10,padding:"11px 14px",fontSize:12,color:C.purple,fontWeight:600 }}>
            La secrétaire verra ce rendez-vous et pourra envoyer un rappel au patient.
          </div>
          <div style={{ display:"flex",gap:10,paddingTop:4 }}>
            <Btn onClick={onClose} variant="secondary">Annuler</Btn>
            <Btn onClick={()=>{ if(ok) onCreate(form) }} disabled={!ok} full>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M12 5v14M5 12h14"/></svg>
              Créer le rendez-vous
            </Btn>
          </div>
        </div>
      </div>
    </div>
  )
}
