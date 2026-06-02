import { useState } from "react"
import { useClinicSettings } from "../../../hooks/useClinicSettings.jsx"
import { C, Btn, tarifParAge } from "./shared.jsx"

// ══════════════════════════════════════════════════════
//  MODAL — ENREGISTRER NOUVEAU PATIENT (formulaire image)
// ══════════════════════════════════════════════════════
export default function ModalNouveauPatient({ onClose, onEnregistrer }) {
  const { settings } = useClinicSettings()
  const INIT={ nom:"",prenom:"",age:"",dateNaissance:"",sexe:"F",telephone:"",profession:"",quartier:"",secteur:"",responsable:"",telResponsable:"",montantConsultation:"" }
  const [form, setForm]=useState(INIT)
  const setF=(k,v)=>setForm(p=>({...p,[k]:v}))
  const ok=form.nom&&form.prenom&&form.montantConsultation

  // Calcul tarif automatique selon date de naissance
  const tarifAuto = tarifParAge(form.dateNaissance, settings)
  // Mise à jour auto du montant quand la date change
  const handleDateNaissance = (val) => {
    setForm(p=>({ ...p, dateNaissance:val, montantConsultation:tarifParAge(val, settings).toString() }))
  }

  const iSt={ width:"100%",padding:"13px 16px",fontSize:14,border:"1.5px solid "+C.border,borderRadius:12,background:C.white,color:C.textPri,outline:"none",fontFamily:"inherit" }
  const foc=e=>{e.target.style.borderColor=C.blue;e.target.style.boxShadow="0 0 0 3px "+C.blueSoft}
  const blr=e=>{e.target.style.borderColor=C.border;e.target.style.boxShadow="none"}

  return (
    <div style={{ position:"fixed",inset:0,background:"rgba(15,23,42,0.5)",zIndex:200,display:"flex",alignItems:"flex-start",justifyContent:"center",padding:"20px",overflowY:"auto" }}
      onClick={e=>{ if(e.target===e.currentTarget) onClose() }}>
      <div style={{ background:C.white,borderRadius:20,width:"100%",maxWidth:860,marginTop:20,boxShadow:"0 25px 60px rgba(0,0,0,0.2)" }}>

        {/* En-tête */}
        <div style={{ padding:"24px 32px 20px",display:"flex",justifyContent:"space-between",alignItems:"flex-start" }}>
          <div>
            <p style={{ fontSize:20,fontWeight:800,color:C.textPri,marginBottom:4 }}>Registre d'Accueil — Enregistrer un patient</p>
            <p style={{ fontSize:13,color:C.textMuted }}>Remplir la fiche et indiquer le montant de consultation. Le patient ira ensuite à la comptabilité pour payer.</p>
          </div>
          <button onClick={onClose}
            style={{ display:"flex",alignItems:"center",gap:6,padding:"8px 16px",border:"1px solid "+C.border,borderRadius:10,background:C.white,color:C.textSec,fontSize:13,fontWeight:600,cursor:"pointer",fontFamily:"inherit" }}
            onMouseEnter={e=>e.currentTarget.style.background=C.slateSoft}
            onMouseLeave={e=>e.currentTarget.style.background=C.white}>
            Fermer
          </button>
        </div>

        <div style={{ padding:"0 32px 28px",display:"flex",flexDirection:"column",gap:24 }}>

          {/* IDENTITÉ DU PATIENT */}
          <div>
            <p style={{ fontSize:11,fontWeight:700,color:C.textMuted,textTransform:"uppercase",letterSpacing:"0.1em",marginBottom:16 }}>Identité du patient</p>
            <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:16,marginBottom:16 }}>
              <div>
                <label style={{ display:"block",fontSize:13,fontWeight:500,color:C.textPri,marginBottom:8 }}>Nom de famille <span style={{ color:C.red }}>*</span></label>
                <input value={form.nom} onChange={e=>setF("nom",e.target.value)} placeholder="Ex : DIALLO" style={iSt} onFocus={foc} onBlur={blr}/>
              </div>
              <div>
                <label style={{ display:"block",fontSize:13,fontWeight:500,color:C.textPri,marginBottom:8 }}>Prénom(s) <span style={{ color:C.red }}>*</span></label>
                <input value={form.prenom} onChange={e=>setF("prenom",e.target.value)} placeholder="Ex : Aminata" style={iSt} onFocus={foc} onBlur={blr}/>
              </div>
              <div>
                <label style={{ display:"block",fontSize:13,fontWeight:500,color:C.textPri,marginBottom:8 }}>Téléphone</label>
                <input value={form.telephone} onChange={e=>setF("telephone",e.target.value)} placeholder="+224 6XX XX XX XX" style={iSt} onFocus={foc} onBlur={blr}/>
              </div>
              <div>
                <label style={{ display:"block",fontSize:13,fontWeight:500,color:C.textPri,marginBottom:8 }}>Âge</label>
                <input value={form.age} onChange={e=>setF("age",e.target.value)} placeholder="Ex : 35 ans" style={iSt} onFocus={foc} onBlur={blr}/>
              </div>
              <div>
                <label style={{ display:"block",fontSize:13,fontWeight:500,color:C.textPri,marginBottom:8 }}>Date de naissance</label>
                <input type="date" value={form.dateNaissance} onChange={e=>handleDateNaissance(e.target.value)} style={iSt} onFocus={foc} onBlur={blr}/>
              </div>
              <div>
                <label style={{ display:"block",fontSize:13,fontWeight:500,color:C.textPri,marginBottom:8 }}>Sexe</label>
                <select value={form.sexe} onChange={e=>setF("sexe",e.target.value)} style={{ ...iSt,cursor:"pointer" }}>
                  <option value="F">Féminin</option>
                  <option value="M">Masculin</option>
                </select>
              </div>
              <div>
                <label style={{ display:"block",fontSize:13,fontWeight:500,color:C.textPri,marginBottom:8 }}>Profession</label>
                <input value={form.profession} onChange={e=>setF("profession",e.target.value)} placeholder="Ex : Commerçant, Élève, S/C..." style={iSt} onFocus={foc} onBlur={blr}/>
              </div>
              <div>
                <label style={{ display:"block",fontSize:13,fontWeight:500,color:C.textPri,marginBottom:8 }}>Quartier</label>
                <input value={form.quartier} onChange={e=>setF("quartier",e.target.value)} placeholder="Ex : Ratoma" style={iSt} onFocus={foc} onBlur={blr}/>
              </div>
              <div>
                <label style={{ display:"block",fontSize:13,fontWeight:500,color:C.textPri,marginBottom:8 }}>Secteur / District</label>
                <input value={form.secteur} onChange={e=>setF("secteur",e.target.value)} placeholder="Ex : Yimbayah, Lansanayah..." style={iSt} onFocus={foc} onBlur={blr}/>
              </div>
            </div>
          </div>

          {/* PERSONNE RESPONSABLE */}
          <div>
            <p style={{ fontSize:11,fontWeight:700,color:C.textMuted,textTransform:"uppercase",letterSpacing:"0.1em",marginBottom:16 }}>Personne responsable</p>
            <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr",gap:16 }}>
              <div>
                <label style={{ display:"block",fontSize:13,fontWeight:500,color:C.textPri,marginBottom:8 }}>Nom du responsable</label>
                <input value={form.responsable} onChange={e=>setF("responsable",e.target.value)} placeholder="Ex : Mamadou Diallo ou Lui-même" style={iSt} onFocus={foc} onBlur={blr}/>
              </div>
              <div>
                <label style={{ display:"block",fontSize:13,fontWeight:500,color:C.textPri,marginBottom:8 }}>Téléphone responsable</label>
                <input value={form.telResponsable} onChange={e=>setF("telResponsable",e.target.value)} placeholder="+224 6XX XX XX XX" style={iSt} onFocus={foc} onBlur={blr}/>
              </div>
            </div>
          </div>

          {/* FRAIS DE CONSULTATION */}
          <div>
            <p style={{ fontSize:11,fontWeight:700,color:C.textMuted,textTransform:"uppercase",letterSpacing:"0.1em",marginBottom:16 }}>Frais de consultation <span style={{ color:C.red }}>*</span></p>
            <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr",gap:16,alignItems:"start" }}>
              <div>
                <label style={{ display:"block",fontSize:13,fontWeight:500,color:C.textPri,marginBottom:8 }}>
                  Montant à payer (GNF) <span style={{ color:C.red }}>*</span>
                </label>
                <input type="number" value={form.montantConsultation}
                  onChange={e=>setF("montantConsultation",e.target.value)}
                  placeholder="Ex : 50000"
                  style={iSt} onFocus={foc} onBlur={blr}/>
                <p style={{ fontSize:12,color:C.textMuted,marginTop:6 }}>
                  Saisir le montant annoncé au patient
                </p>
              </div>
              <div style={{ background:C.greenSoft,borderRadius:14,padding:"16px 18px",border:"1px solid "+C.green+"44" }}>
                <p style={{ fontSize:11,fontWeight:700,color:C.green,textTransform:"uppercase",letterSpacing:"0.08em",marginBottom:10 }}>Tarif selon l'âge</p>
                {[
                  { label:"0 – 15 ans", sub:"0 à 15 ans", montant:15000 },
                  { label:"> 15 ans",    sub:"Plus de 15 ans", montant:20000 },
                ].map(t=>(
                  <div key={t.label} onClick={()=>setF("montantConsultation",t.montant.toString())}
                    style={{ display:"flex",justifyContent:"space-between",alignItems:"center",padding:"6px 8px",borderRadius:8,cursor:"pointer",
                      background:form.montantConsultation===t.montant.toString()?"#bbf7d0":"transparent",
                      border:form.montantConsultation===t.montant.toString()?"1px solid "+C.green:"1px solid transparent" }}>
                    <span style={{ fontSize:12,color:C.textSec }}>{t.label}</span>
                    <span style={{ fontSize:13,fontWeight:700,color:C.green }}>{t.montant.toLocaleString("fr-FR")} GNF</span>
                  </div>
                ))}
                {form.dateNaissance&&(
                  <div style={{ marginTop:10,padding:"8px 10px",background:"#fff",borderRadius:10,border:"1px solid "+C.green+"44" }}>
                    <p style={{ fontSize:12,color:C.textSec }}>Tarif calculé auto :</p>
                    <p style={{ fontSize:15,fontWeight:800,color:C.green }}>{tarifAuto.toLocaleString("fr-FR")} GNF</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Boutons */}
          <div style={{ display:"flex",justifyContent:"flex-end",gap:12,paddingTop:16,borderTop:"1px solid "+C.border }}>
            <Btn onClick={onClose} variant="secondary">Annuler</Btn>
            <Btn onClick={()=>{ if(ok) onEnregistrer(form) }} disabled={!ok}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M12 5v14M5 12h14"/></svg>
              Enregistrer — {form.montantConsultation ? parseInt(form.montantConsultation).toLocaleString("fr-FR")+" GNF à payer" : "Saisir le montant"}
            </Btn>
          </div>
        </div>
      </div>
    </div>
  )
}
