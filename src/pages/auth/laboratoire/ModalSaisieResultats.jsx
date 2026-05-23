import { useState } from "react"
import { C, Overlay, CloseBtn, iSt, Btn, parseMindrayFile, buildParamsVides } from "./shared.jsx"

export default function ModalSaisieResultats({ demande, onClose, onSave, onValider }) {
  const initResultats = () => {
    const r = {}
    demande.examens.forEach(ex => {
      if (demande.resultats?.[ex.nom]) r[ex.nom] = JSON.parse(JSON.stringify(demande.resultats[ex.nom]))
    })
    return r
  }
  const [resultats,           setResultats]           = useState(initResultats)
  const [commentaireGlobal,   setCommentaireGlobal]   = useState(demande.commentaireGlobal || "")
  const [newParamNoms,        setNewParamNoms]         = useState({})
  const [importMsg,           setImportMsg]           = useState("")

  const handleImportMindray = (nomExamen, file) => {
    if (!file) return
    const reader = new FileReader()
    reader.onload = (e) => {
      const parsed = parseMindrayFile(e.target.result)
      if (Object.keys(parsed).length === 0) {
        setImportMsg("Aucune valeur reconnue dans ce fichier. Vérifiez le format.")
        return
      }
      setResultats(prev => {
        const r = JSON.parse(JSON.stringify(prev))
        if (!r[nomExamen]) r[nomExamen] = { valeurs: {}, commentaire: "" }
        Object.entries(parsed).forEach(([param, data]) => {
          r[nomExamen].valeurs[param] = data
        })
        return r
      })
      setImportMsg(`[OK] ${Object.keys(parsed).length} paramètre(s) importé(s) depuis Mindray`)
      setTimeout(() => setImportMsg(""), 4000)
    }
    reader.readAsText(file)
  }

  const initExamen = (nomExamen) => {
    setResultats(prev => {
      if (prev[nomExamen]) return prev
      return { ...prev, [nomExamen]: { valeurs: buildParamsVides(nomExamen), commentaire: "" } }
    })
  }
  const setValeur = (nomExamen, param, sousChamp, valeur) => {
    setResultats(prev => {
      const r = JSON.parse(JSON.stringify(prev))
      r[nomExamen].valeurs[param][sousChamp] = valeur
      return r
    })
  }
  const setCommentaireExamen = (nomExamen, val) => {
    setResultats(prev => {
      const r = JSON.parse(JSON.stringify(prev))
      r[nomExamen].commentaire = val
      return r
    })
  }
  const ajouterParam = (nomExamen) => {
    const nom = (newParamNoms[nomExamen] || "").trim()
    if (!nom) return
    setResultats(prev => {
      const r = JSON.parse(JSON.stringify(prev))
      r[nomExamen].valeurs[nom] = { valeur:"", unite:"", norme:"" }
      return r
    })
    setNewParamNoms(prev => ({ ...prev, [nomExamen]: "" }))
  }
  const supprimerParam = (nomExamen, param) => {
    setResultats(prev => {
      const r = JSON.parse(JSON.stringify(prev))
      delete r[nomExamen].valeurs[param]
      return r
    })
  }
  const nbExamensRemplis = demande.examens.filter(ex => resultats[ex.nom]).length
  const estAnormal = (valeur, norme) => {
    if (!valeur || !norme || !norme.includes("-")) return false
    const [min, max] = norme.split("-").map(Number)
    const v = parseFloat(valeur)
    return !isNaN(v) && !isNaN(min) && !isNaN(max) && (v < min || v > max)
  }

  return (
    <Overlay onClose={onClose}>
      <div style={{ background:C.white, borderRadius:20, width:"100%", maxWidth:760, maxHeight:"92vh", overflow:"auto", boxShadow:"0 25px 60px rgba(0,0,0,0.25)" }}>
        <div style={{ padding:"18px 24px 14px", borderBottom:"1px solid "+C.border, display:"flex", justifyContent:"space-between", alignItems:"center", background:C.blueSoft, borderRadius:"20px 20px 0 0" }}>
          <div style={{ display:"flex", alignItems:"center", gap:12 }}>
            <div style={{ width:44, height:44, borderRadius:12, background:C.blue, display:"flex", alignItems:"center", justifyContent:"center", color:"#fff" }}><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M14.5 2 20 9l-5.5 7H7l-5.5-7L7 2z"/><path d="M7 2v20M14.5 2v20"/></svg></div>
            <div>
              <p style={{ fontSize:16, fontWeight:800, color:C.blueDark }}>Saisie des résultats</p>
              <p style={{ fontSize:12, color:C.textPri }}>{demande.patient.nom} — {demande.patient.pid}</p>
            </div>
          </div>
          <div style={{ display:"flex", alignItems:"center", gap:10 }}>
            <span style={{ fontSize:12, color:C.textPri, fontWeight:600 }}>{nbExamensRemplis}/{demande.examens.length} examen{demande.examens.length>1?"s":""} saisi{nbExamensRemplis>1?"s":""}</span>
            <CloseBtn onClose={onClose} />
          </div>
        </div>

        <div style={{ padding:"22px 24px", display:"flex", flexDirection:"column", gap:16 }}>
          <div style={{ height:6, background:C.border, borderRadius:3, overflow:"hidden" }}>
            <div style={{ height:"100%", borderRadius:3, background:C.green, width:(nbExamensRemplis/demande.examens.length*100)+"%", transition:"width .3s" }} />
          </div>

          {importMsg && (
            <div style={{ padding:"10px 16px", borderRadius:10, background: importMsg.startsWith("[OK]") ? C.greenSoft : C.redSoft, border:"1.5px solid "+(importMsg.startsWith("[OK]")?C.green:C.red)+"44", color:importMsg.startsWith("[OK]")?C.green:C.red, fontSize:13, fontWeight:600, display:"flex", alignItems:"center", gap:8 }}>
              {importMsg.startsWith("[OK]")
                ? <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                : <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>}
              {importMsg.replace("[OK] ", "")}
            </div>
          )}

          {demande.examens.map((ex) => {
            const saisi = resultats[ex.nom]
            return (
              <div key={ex.nom} style={{ borderRadius:14, border:"1.5px solid "+(saisi?C.green+"50":C.border), background:saisi?C.greenSoft+"40":C.slateSoft, overflow:"hidden" }}>
                <div style={{ padding:"12px 16px", display:"flex", justifyContent:"space-between", alignItems:"center", borderBottom:saisi?"1px solid "+C.green+"30":"none" }}>
                  <div>
                    <p style={{ fontSize:14, fontWeight:700, color:C.textPri }}>{ex.nom}</p>
                    <p style={{ fontSize:11, color:C.textMuted }}>{ex.type} · {ex.prix.toLocaleString("fr-FR")} GNF</p>
                  </div>
                  <div style={{ display:"flex", gap:8, alignItems:"center" }}>
                    {(ex.type==="Hématologie" || ex.nom.toLowerCase().includes("nfs") || ex.nom.toLowerCase().includes("hémato")) && (
                      <label style={{ display:"inline-flex", alignItems:"center", gap:6, padding:"6px 12px", borderRadius:10, background:C.purpleSoft, border:"1.5px solid "+C.purple+"44", color:C.purple, fontSize:12, fontWeight:700, cursor:"pointer", whiteSpace:"nowrap" }}>
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
                        Importer Mindray
                        <input type="file" accept=".txt,.csv,.res,.dat" style={{ display:"none" }}
                          onChange={e => { initExamen(ex.nom); handleImportMindray(ex.nom, e.target.files[0]); e.target.value="" }} />
                      </label>
                    )}
                    {saisi
                      ? <span style={{ fontSize:11, fontWeight:700, color:C.green, background:C.greenSoft, padding:"4px 10px", borderRadius:8 }}>Saisi</span>
                      : <Btn onClick={() => initExamen(ex.nom)} small variant="primary">+ Saisir manuellement</Btn>
                    }
                  </div>
                </div>

                {saisi && (
                  <div style={{ padding:"14px 16px", display:"flex", flexDirection:"column", gap:10 }}>
                    <div style={{ display:"grid", gridTemplateColumns:"1.4fr 1fr 1fr 1fr 32px", gap:8 }}>
                      {["Paramètre","Valeur","Unité","Norme de référence",""].map(h => (
                        <p key={h} style={{ fontSize:10, fontWeight:700, color:C.textMuted, textTransform:"uppercase", letterSpacing:"0.06em" }}>{h}</p>
                      ))}
                    </div>
                    {Object.entries(saisi.valeurs).map(([param, data]) => {
                      const anormal = estAnormal(data.valeur, data.norme)
                      return (
                        <div key={param} style={{ display:"grid", gridTemplateColumns:"1.4fr 1fr 1fr 1fr 32px", gap:8, alignItems:"center" }}>
                          <p style={{ fontSize:13, fontWeight:600, color:anormal?C.red:C.textPri, display:"flex", alignItems:"center", gap:4 }}>
                            {anormal && <span></span>}{param}
                          </p>
                          <input value={data.valeur} onChange={e => setValeur(ex.nom,param,"valeur",e.target.value)} placeholder="—" style={iSt({ padding:"7px 10px", fontSize:13, borderColor:anormal?C.red:C.border })} />
                          <input value={data.unite} onChange={e => setValeur(ex.nom,param,"unite",e.target.value)} placeholder="g/dL…" style={iSt({ padding:"7px 10px", fontSize:13 })} />
                          <input value={data.norme} onChange={e => setValeur(ex.nom,param,"norme",e.target.value)} placeholder="Ex: 12-16" style={iSt({ padding:"7px 10px", fontSize:13 })} />
                          <button onClick={() => supprimerParam(ex.nom, param)} style={{ width:28, height:28, borderRadius:6, border:"none", background:C.redSoft, color:C.red, cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center", fontSize:14 }}>×</button>
                        </div>
                      )
                    })}
                    <div style={{ display:"flex", gap:8, marginTop:4 }}>
                      <input value={newParamNoms[ex.nom]||""} onChange={e => setNewParamNoms(prev=>({...prev,[ex.nom]:e.target.value}))} onKeyDown={e=>{ if(e.key==="Enter") ajouterParam(ex.nom) }} placeholder="Nouveau paramètre…" style={iSt({ flex:1, padding:"7px 12px", fontSize:12 })} />
                      <button onClick={() => ajouterParam(ex.nom)} style={{ padding:"7px 14px", borderRadius:10, background:C.blueSoft, color:C.blue, border:"1px solid "+C.blue+"30", fontSize:12, fontWeight:700, cursor:"pointer", fontFamily:"inherit" }}>+ Ajouter</button>
                    </div>
                    <div style={{ marginTop:4 }}>
                      <label style={{ fontSize:12, fontWeight:600, color:C.textMuted, display:"block", marginBottom:4 }}>Commentaire pour cet examen</label>
                      <textarea value={saisi.commentaire||""} onChange={e => setCommentaireExamen(ex.nom,e.target.value)} rows={2} placeholder="Interprétation, observations…" style={iSt({ resize:"none", fontSize:12 })} />
                    </div>
                  </div>
                )}
              </div>
            )
          })}

          <div>
            <label style={{ fontSize:13, fontWeight:600, color:C.textPri, display:"block", marginBottom:6 }}>Conclusion / Commentaire global</label>
            <textarea value={commentaireGlobal} onChange={e => setCommentaireGlobal(e.target.value)} rows={3} placeholder="Conclusion générale des analyses…" style={iSt({ resize:"vertical" })} />
          </div>

          <div style={{ display:"flex", justifyContent:"flex-end", gap:10, paddingTop:10, borderTop:"1px solid "+C.border }}>
            <Btn onClick={onClose} variant="secondary">Annuler</Btn>
            <Btn onClick={() => onSave(resultats, commentaireGlobal)} variant="primary" disabled={nbExamensRemplis===0}>Sauvegarder (brouillon)</Btn>
            <Btn onClick={() => onValider(resultats, commentaireGlobal)} variant="success" disabled={nbExamensRemplis===0}>Valider et signer</Btn>
          </div>
        </div>
      </div>
    </Overlay>
  )
}
