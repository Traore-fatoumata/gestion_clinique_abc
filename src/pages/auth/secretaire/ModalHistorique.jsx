import { useState } from "react"
import { C, fmt } from "./shared.jsx"

// ══════════════════════════════════════════════════════
//  MODAL — HISTORIQUE DE PRÉSENCE
// ══════════════════════════════════════════════════════
export default function ModalHistorique({ medecins, historique, onClose }) {
  const [filtreMedecin, setFiltreMedecin] = useState("tous")
  const [filtreDate, setFiltreDate] = useState("")
  const [filtreType, setFiltreType] = useState("tous")

  const iSt = { width:"100%",padding:"11px 14px",fontSize:14,border:"1.5px solid "+C.border,borderRadius:10,background:C.white,color:C.textPri,outline:"none",fontFamily:"inherit" }

  const filtreHistorique = historique.filter(h => {
    const medOk = filtreMedecin === "tous" || h.medecinId === parseInt(filtreMedecin)
    const dateOk = !filtreDate || h.date === filtreDate
    const typeOk = filtreType === "tous" || h.type === filtreType
    return medOk && dateOk && typeOk
  }).sort((a,b) => new Date(b.date + " " + b.heure) - new Date(a.date + " " + a.heure))

  const getMedecinNom = (id) => {
    const med = medecins.find(m => m.id === id)
    return med ? med.nom : "Inconnu"
  }

  return (
    <div style={{ position:"fixed",inset:0,background:"rgba(15,23,42,0.5)",zIndex:200,display:"flex",alignItems:"center",justifyContent:"center",padding:20 }}
      onClick={e=>{ if(e.target===e.currentTarget) onClose() }}>
      <div style={{ background:C.white,borderRadius:20,width:"100%",maxWidth:800,maxHeight:"90vh",overflow:"auto",boxShadow:"0 25px 60px rgba(0,0,0,0.2)" }}>
        <div style={{ padding:"22px 28px 18px",borderBottom:"1px solid "+C.border,display:"flex",justifyContent:"space-between",alignItems:"center" }}>
          <div>
            <p style={{ fontSize:18,fontWeight:800,color:C.textPri }}>Historique de présence</p>
            <p style={{ fontSize:13,color:C.textSec,marginTop:3 }}>Consultation des pointages et absences</p>
          </div>
          <button onClick={onClose} style={{ background:C.slateSoft,border:"none",borderRadius:8,color:C.textSec,cursor:"pointer",width:32,height:32,display:"flex",alignItems:"center",justifyContent:"center",fontSize:18 }}>×</button>
        </div>

        {/* Filtres */}
        <div style={{ padding:"18px 28px",borderBottom:"1px solid "+C.border,display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:12 }}>
          <div>
            <label style={{ display:"block",fontSize:12,fontWeight:600,color:C.textPri,marginBottom:6 }}>Médecin</label>
            <select value={filtreMedecin} onChange={e=>setFiltreMedecin(e.target.value)} style={{ ...iSt,cursor:"pointer" }}>
              <option value="tous">Tous les médecins</option>
              {medecins.map(m => <option key={m.id} value={m.id}>{m.nom}</option>)}
            </select>
          </div>
          <div>
            <label style={{ display:"block",fontSize:12,fontWeight:600,color:C.textPri,marginBottom:6 }}>Date</label>
            <input type="date" value={filtreDate} onChange={e=>setFiltreDate(e.target.value)} style={iSt}/>
          </div>
          <div>
            <label style={{ display:"block",fontSize:12,fontWeight:600,color:C.textPri,marginBottom:6 }}>Type</label>
            <select value={filtreType} onChange={e=>setFiltreType(e.target.value)} style={{ ...iSt,cursor:"pointer" }}>
              <option value="tous">Tous les types</option>
              <option value="arrivée">Arrivées</option>
              <option value="départ">Départs</option>
              <option value="maladie">Absences maladie</option>
              <option value="urgence">Absences urgence</option>
            </select>
          </div>
        </div>

        {/* Liste */}
        <div style={{ padding:"20px 28px" }}>
          {filtreHistorique.length === 0 ? (
            <p style={{ padding:24,textAlign:"center",color:C.textMuted }}>Aucun événement trouvé pour ces critères</p>
          ) : (
            <div style={{ display:"flex",flexDirection:"column",gap:12 }}>
              {filtreHistorique.map((h, i) => (
                <div key={i} style={{ padding:"14px 16px",borderRadius:12,border:"1px solid "+C.border,background:h.type==="maladie"?C.slateSoft+"33":h.type==="urgence"?C.redSoft+"33":"transparent" }}>
                  <div style={{ display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:8 }}>
                    <div style={{ display:"flex",alignItems:"center",gap:10 }}>
                      <div style={{ width:36,height:36,borderRadius:"50%",background:h.type==="maladie"?C.slateSoft:h.type==="urgence"?C.redSoft:C.blueSoft,display:"flex",alignItems:"center",justifyContent:"center" }}>
                        <span style={{ fontSize:18 }}>
                          {h.type==="arrivée"
                            ? <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="18 15 12 9 6 15"/></svg>
                            : h.type==="départ"
                            ? <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9"/></svg>
                            : h.type==="maladie" ? "M" : h.type==="urgence" ? "U" : "—"}
                        </span>
                      </div>
                      <div>
                        <p style={{ fontSize:14,fontWeight:700,color:C.textPri }}>{getMedecinNom(h.medecinId)}</p>
                        <p style={{ fontSize:12,color:C.textSec }}>{h.type} · {fmt(h.date)}</p>
                      </div>
                    </div>
                    <div style={{ textAlign:"right" }}>
                      <p style={{ fontSize:14,fontWeight:700,color:C.textPri,fontVariantNumeric:"tabular-nums" }}>{h.heure}</p>
                      {h.description && <p style={{ fontSize:11,color:C.textMuted,marginTop:2 }}>{h.description}</p>}
                    </div>
                  </div>
                  {h.justificatif && (
                    <div style={{ fontSize:11,color:C.textMuted,marginTop:6 }}>
                      Justificatif : {h.justificatif}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
