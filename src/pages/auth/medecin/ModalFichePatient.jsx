import { C, calcAge, fmt, Avatar, RdvBadge, TypeConsultBadge, Badge, Btn } from "./shared.jsx"

// ══════════════════════════════════════════════════════
//  MODAL — FICHE PATIENT
// ══════════════════════════════════════════════════════
export default function ModalFichePatient({ patient, consultations, medecin, onClose, onConsulter }) {
  if (!patient) return null
  const visites = consultations.filter(c=>c.patientId===patient.id).sort((a,b)=>b.date.localeCompare(a.date))
  const tc = patient.typeConsultation || "standard"
  const hasChef = patient.plaintesChef || patient.symptomesChef || patient.diagnosticPreliminaireChef
  return (
    <div style={{ position:"fixed", inset:0, background:"rgba(15,23,42,0.5)", zIndex:200, display:"flex", alignItems:"center", justifyContent:"center", padding:20 }}
      onClick={e=>{ if(e.target===e.currentTarget) onClose() }}>
      <div style={{ background:C.white, borderRadius:20, width:"100%", maxWidth:600, maxHeight:"90vh", overflow:"auto", boxShadow:"0 25px 60px rgba(0,0,0,0.2)" }}>

        {/* Header */}
        <div style={{ padding:"22px 28px 18px", borderBottom:"1px solid "+C.border, display:"flex", justifyContent:"space-between", alignItems:"flex-start" }}>
          <div style={{ display:"flex", alignItems:"center", gap:14 }}>
            <Avatar name={patient.nom} size={48} />
            <div>
              <div style={{ display:"flex", alignItems:"center", gap:8, flexWrap:"wrap" }}>
                <p style={{ fontSize:18, fontWeight:800, color:C.textPri, marginBottom:3 }}>{patient.nom}</p>
                <RdvBadge patient={patient} />
                {tc !== "standard" && <TypeConsultBadge type={tc} />}
              </div>
              <p style={{ fontSize:13, color:C.textSec }}>{patient.pid} · {calcAge(patient.dateNaissance)} ans · {patient.sexe==="F"?"Féminin":"Masculin"}</p>
            </div>
          </div>
          <button onClick={onClose} style={{ background:C.slateSoft, border:"none", borderRadius:8, color:C.textSec, cursor:"pointer", width:32, height:32, display:"flex", alignItems:"center", justifyContent:"center", fontSize:18 }}>×</button>
        </div>

        {/* Infos */}
        <div style={{ padding:"20px 28px" }}>
          {patient.typeVisite === "rendez_vous" && patient.motifRdv && (
            <div style={{ background:C.blueSoft, border:"1px solid "+C.blue+"33", borderRadius:12, padding:"12px 16px", marginBottom:16 }}>
              <p style={{ fontSize:11, fontWeight:700, color:C.textPri, textTransform:"uppercase", letterSpacing:"0.06em", marginBottom:6 }}>Objet du rendez-vous</p>
              <p style={{ fontSize:14, color:C.textPri, lineHeight:1.45 }}>{patient.motifRdv}</p>
            </div>
          )}

          {hasChef && (
            <div style={{ background:C.greenSoft, border:"1px solid "+C.green+"33", borderRadius:12, padding:"12px 16px", marginBottom:16 }}>
              <p style={{ fontSize:11, fontWeight:700, color:C.green, textTransform:"uppercase", letterSpacing:"0.06em", marginBottom:8 }}>File d'accueil — médecin chef</p>
              {patient.plaintesChef && <p style={{ fontSize:13, color:C.textPri, marginBottom:4 }}><strong>Plaintes :</strong> {patient.plaintesChef}</p>}
              {patient.symptomesChef && <p style={{ fontSize:13, color:C.textPri, marginBottom:4 }}><strong>Signes / symptômes :</strong> {patient.symptomesChef}</p>}
              {patient.antecedentsChef && <p style={{ fontSize:13, color:C.textPri, marginBottom:4 }}><strong>Antécédents :</strong> {patient.antecedentsChef}</p>}
              {patient.diagnosticPreliminaireChef && <p style={{ fontSize:13, color:C.textPri }}><strong>Diagnostic de présomption :</strong> {patient.diagnosticPreliminaireChef}</p>}
            </div>
          )}

          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10, marginBottom:20 }}>
            {[
              { l:"Téléphone",    v:patient.telephone },
              { l:"Adresse",      v:patient.adresse },
              { l:"Naissance",    v:fmt(patient.dateNaissance) },
              { l:"Motif actuel", v:patient.motif },
            ].map(({l,v})=>(
              <div key={l} style={{ background:C.bg, borderRadius:10, padding:"12px 14px", border:"1px solid "+C.border }}>
                <p style={{ fontSize:10, color:C.textMuted, textTransform:"uppercase", letterSpacing:"0.06em", marginBottom:4 }}>{l}</p>
                <p style={{ fontSize:13, fontWeight:600, color:C.textPri }}>{v||"—"}</p>
              </div>
            ))}
          </div>

          {/* Historique — toute la clinique */}
          {visites.length > 0 && (
            <>
              <p style={{ fontSize:11, fontWeight:700, color:C.textMuted, textTransform:"uppercase", letterSpacing:"0.08em", marginBottom:12 }}>Historique dans la clinique (tous services)</p>
              <div style={{ display:"flex", flexDirection:"column", gap:8, marginBottom:20 }}>
                {visites.map((v)=>{
                  const autreService = v.service && v.service !== medecin.specialite
                  return (
                    <div key={v.id} style={{ background:C.bg, borderRadius:10, padding:"12px 16px", border:"1px solid "+C.border, borderLeft:"4px solid "+(autreService?C.slate:C.blue) }}>
                      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", gap:8, marginBottom:6, flexWrap:"wrap" }}>
                        <div>
                          <p style={{ fontSize:13, fontWeight:700, color:C.textPri }}>{fmt(v.date)} — {v.motif}</p>
                          <p style={{ fontSize:11, color:C.textMuted }}>{v.service || "—"}{autreService && <span style={{ color:C.slate, fontWeight:700 }}> · autre service</span>}</p>
                        </div>
                        <div style={{ display:"flex", alignItems:"center", gap:6, flexShrink:0 }}>
                          {v.typeConsultation && v.typeConsultation !== "standard" && <TypeConsultBadge type={v.typeConsultation} />}
                          <Badge statut={v.signe?"signe":"non_signe"} />
                        </div>
                      </div>
                      {(v.diagnostics||[]).length>0 && <p style={{ fontSize:12, color:C.textSec, marginBottom:2 }}>Diag : {(v.diagnostics||[]).join(", ")}</p>}
                      {(v.traitements||[]).length>0 && <p style={{ fontSize:12, color:C.textSec }}>Traitement : {(v.traitements||[]).join(", ")}</p>}
                    </div>
                  )
                })}
              </div>
            </>
          )}

          <Btn onClick={()=>{ onConsulter(patient); onClose() }} variant="success" full>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M12 5v14M5 12h14"/></svg>
            Démarrer la consultation
          </Btn>
        </div>
      </div>
    </div>
  )
}
