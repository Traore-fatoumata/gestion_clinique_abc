import { useState } from "react"
import { useClinicSettings } from "../../../hooks/useClinicSettings.jsx"
import { today, C, Avatar, Btn, tarifParAge } from "./shared.jsx"

// ══════════════════════════════════════════════════════
//  MODAL — RECHERCHER DOSSIER EXISTANT
// ══════════════════════════════════════════════════════
export default function ModalRechercheDossier({ patients, rdvs, onClose, onSignaler }) {
  const { settings } = useClinicSettings()
  const [q,           setQ]           = useState("")
  const [selPatient,  setSelPatient]  = useState(null)   // patient sélectionné pour confirmer
  const [montant,     setMontant]     = useState("0")

  const resultats = q.length>=2 ? patients.filter(p=>
    p.pid.toLowerCase().includes(q.toLowerCase())||
    p.nom.toLowerCase().includes(q.toLowerCase())||
    (p.telephone||"").includes(q)
  ) : []

  const iSt={ width:"100%",padding:"12px 14px",fontSize:14,border:"1.5px solid "+C.border,borderRadius:12,background:C.white,color:C.textPri,outline:"none",fontFamily:"inherit" }

  const handleSelectionner = (p) => {
    setSelPatient(p)
    setMontant("0")
  }

  const rdvDuJour = selPatient ? rdvs.find(r => r.patientId === selPatient.id && r.date === today()) : null

  const handleConfirmer = () => {
    onSignaler(selPatient, 0, rdvDuJour)
    onClose()
  }

  return (
    <div style={{ position:"fixed",inset:0,background:"rgba(15,23,42,0.5)",zIndex:200,display:"flex",alignItems:"center",justifyContent:"center",padding:20 }}
      onClick={e=>{ if(e.target===e.currentTarget) onClose() }}>
      <div style={{ background:C.white,borderRadius:20,width:"100%",maxWidth:580,boxShadow:"0 25px 60px rgba(0,0,0,0.2)" }}>
        <div style={{ padding:"22px 28px 18px",borderBottom:"1px solid "+C.border,display:"flex",justifyContent:"space-between",alignItems:"center" }}>
          <div>
            <p style={{ fontSize:18,fontWeight:800,color:C.textPri }}>
              {selPatient ? "Confirmer le signalement" : "Rechercher un dossier patient"}
            </p>
            <p style={{ fontSize:13,color:C.textSec,marginTop:3 }}>
              {selPatient ? selPatient.nom+" · "+selPatient.pid : "Par N° dossier, nom ou téléphone"}
            </p>
          </div>
          <button onClick={onClose} style={{ background:C.slateSoft,border:"none",borderRadius:8,color:C.textSec,cursor:"pointer",width:32,height:32,display:"flex",alignItems:"center",justifyContent:"center",fontSize:18 }}>×</button>
        </div>

        <div style={{ padding:"20px 28px 24px" }}>

          {/* ── Étape 1 : recherche ── */}
          {!selPatient && (<>
            <div style={{ position:"relative",marginBottom:16 }}>
              <svg style={{ position:"absolute",left:14,top:"50%",transform:"translateY(-50%)",pointerEvents:"none" }} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={C.textMuted} strokeWidth="2" strokeLinecap="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
              <input autoFocus value={q} onChange={e=>setQ(e.target.value)} placeholder="Ex : abc-mar-123456 ou Bah Mariama (RDV spécialiste)"
                style={{ ...iSt,paddingLeft:40,background:C.bg }}
                onFocus={e=>{ e.target.style.borderColor=C.blue; e.target.style.background=C.white }}
                onBlur={e=>{ e.target.style.borderColor=C.border; e.target.style.background=C.bg }}/>
            </div>
            {q.length<2 && <p style={{ fontSize:13,color:C.textMuted,textAlign:"center",padding:"20px 0" }}>Tapez au moins 2 caractères pour rechercher</p>}
            {q.length>=2 && resultats.length===0 && (
              <div style={{ padding:"24px",textAlign:"center",background:C.bg,borderRadius:12,border:"1px solid "+C.border }}>
                <p style={{ fontSize:14,color:C.textMuted,marginBottom:8 }}>Aucun dossier trouvé pour « {q} »</p>
                <p style={{ fontSize:13,color:C.textSec }}>Ce patient n'est pas encore enregistré.</p>
              </div>
            )}
            {resultats.map(p=>(
              <div key={p.id} style={{ padding:"14px 16px",borderRadius:12,border:"1px solid "+C.border,marginBottom:10,display:"flex",alignItems:"center",gap:12,background:C.bg }}>
                <Avatar name={p.nom} size={40}/>
                <div style={{ flex:1 }}>
                  <p style={{ fontSize:14,fontWeight:700,color:C.textPri,marginBottom:2 }}>{p.nom}</p>
                  <p style={{ fontSize:12,color:C.textSec }}>{p.pid} · {p.age} · {p.telephone}</p>
                  <p style={{ fontSize:12,color:C.textMuted }}>{p.quartier}{p.secteur?", "+p.secteur:""}</p>
                </div>
                <Btn onClick={()=>handleSelectionner(p)} small variant="success">
                  <span style={{ display:"inline-flex",alignItems:"center",gap:5 }}>Sélectionner<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"/></svg></span>
                </Btn>
              </div>
            ))}
          </>)}

          {/* ── Étape 2 : saisie du montant ── */}
          {selPatient && (<>
            {/* Récapitulatif patient */}
            <div style={{ display:"flex",alignItems:"center",gap:12,padding:"14px 16px",background:C.greenSoft,borderRadius:14,border:"1px solid "+C.green+"44",marginBottom:20 }}>
              <Avatar name={selPatient.nom} size={42} bg={C.green}/>
              <div style={{ flex:1 }}>
                <p style={{ fontSize:14,fontWeight:700,color:C.textPri }}>{selPatient.nom}</p>
                <p style={{ fontSize:12,color:C.textSec }}>{selPatient.pid} · {selPatient.age} · {selPatient.telephone}</p>
              </div>
            </div>

             {rdvDuJour && (
              <div style={{ padding:"14px 16px",background:C.purpleSoft,borderRadius:12,border:"1px solid "+C.purple+"22",marginBottom:16 }}>
                <p style={{ fontSize:13,fontWeight:700,color:C.purple }}>Rendez-vous du jour détecté</p>
                <p style={{ fontSize:13,color:C.textPri,margin:0 }}>Patient attendu chez {rdvDuJour.docteur} ({rdvDuJour.service}) à {rdvDuJour.heure}.</p>
              </div>
            )}

            <div style={{ display:"flex",gap:10,marginTop:16 }}>
              <Btn onClick={()=>setSelPatient(null)} variant="secondary"><span style={{ display:"inline-flex",alignItems:"center",gap:5 }}><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"/></svg>Retour</span></Btn>
              <Btn onClick={handleConfirmer} style={{ flex:1 }}>
                {rdvDuJour ? `Envoyer au spécialiste ${rdvDuJour.docteur}` : `Signaler au médecin chef`}
              </Btn>
            </div>
          </>)}

        </div>
      </div>
    </div>
  )
}
