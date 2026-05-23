import { useState } from "react"
import { C, Card, Avatar, StatutBadge } from "./shared.jsx"

export default function PageHistorique({ consultations, patients, resultatsLabo, soins, rdv }) {
  const [search,     setSearch]     = useState("")
  const [selPatient, setSelPatient] = useState(null)
  const [activeTab,  setActiveTab]  = useState("consultations")

  const calcAge = dn => {
    if (!dn) return null
    const d = new Date(dn), now = new Date()
    let age = now.getFullYear() - d.getFullYear()
    if (now.getMonth() < d.getMonth() || (now.getMonth()===d.getMonth() && now.getDate()<d.getDate())) age--
    return age
  }

  const getConsults = id => consultations.filter(c=>c.patientId===id).sort((a,b)=>new Date(b.date)-new Date(a.date))
  const getLabo     = id => (resultatsLabo||[]).filter(r=>r.patientId===id).sort((a,b)=>new Date(b.date)-new Date(a.date))
  const getSoins    = id => (soins||[]).filter(s=>s.patientId===id).sort((a,b)=>new Date(b.date)-new Date(a.date))
  const getRdv      = id => (rdv||[]).filter(r=>r.patientId===id).sort((a,b)=>new Date(b.date)-new Date(a.date))

  const filtered = patients.filter(p =>
    (p.nom+" "+(p.prenom||"")+" "+(p.telephone||"")+" "+(p.pid||""))
      .toLowerCase().includes(search.toLowerCase())
  )

  const printIcon = <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><polyline points="6 9 6 2 18 2 18 9"/><path d="M6 18H4a2 2 0 01-2-2v-5a2 2 0 012-2h16a2 2 0 012 2v5a2 2 0 01-2 2h-2"/><rect x="6" y="14" width="12" height="8"/></svg>

  const handlePrint = (p) => {
    const age = calcAge(p.dateNaissance)
    const hist = getConsults(p.id)
    const labo = getLabo(p.id)
    const soinsList = getSoins(p.id)
    const rdvList = getRdv(p.id)
    const payTotal = hist.filter(c=>c.statut==="paye").reduce((s,c)=>s+(c.montant||0),0)

    const arr2str = v => Array.isArray(v)&&v.length ? v.join(", ") : (v||"—")
    const val     = v => v || "—"

    const css = `
      @page { size:A4; margin:12mm 14mm }
      * { box-sizing:border-box; margin:0; padding:0 }
      body { font-family:'Segoe UI',Arial,sans-serif; font-size:9.5pt; color:#111; background:#fff }
      .hdr { text-align:center; border-bottom:2.5px solid #16a34a; padding-bottom:8px; margin-bottom:12px }
      .hdr h1 { font-size:14pt; color:#16a34a; font-weight:800 }
      .hdr p  { font-size:8pt; color:#555; margin-top:2px }
      .pat-box { display:grid; grid-template-columns:1fr 1fr 1fr; gap:4px 18px; border:1px solid #b6d9c2; border-radius:7px; padding:10px 14px; margin-bottom:12px; background:#f0fdf4 }
      .pat-box .row { font-size:9pt; color:#374151; padding:2px 0; border-bottom:1px solid #e2ebe4 }
      .pat-box .row b { color:#111; font-weight:700 }
      .section-title { font-size:10.5pt; font-weight:800; color:#16a34a; border-left:3px solid #16a34a; padding-left:8px; margin:14px 0 8px; page-break-after:avoid }
      .consult-card { border:1px solid #e2ebe4; border-radius:7px; padding:10px 13px; margin-bottom:10px; page-break-inside:avoid; background:#fff }
      .consult-header { display:flex; justify-content:space-between; align-items:center; margin-bottom:8px; padding-bottom:6px; border-bottom:1px solid #e2ebe4 }
      .consult-num { font-size:8pt; font-weight:700; color:#fff; background:#16a34a; padding:2px 8px; border-radius:20px }
      .consult-date { font-size:10pt; font-weight:800; color:#111 }
      .consult-service { font-size:8.5pt; color:#1d6fa4; font-weight:600 }
      .consult-medecin { font-size:8.5pt; color:#6b7280 }
      .consult-body { display:grid; grid-template-columns:1fr 1fr; gap:6px 18px }
      .field { padding:4px 0; border-bottom:1px solid #f3f4f6 }
      .field-lbl { font-size:7.5pt; font-weight:700; color:#9ca3af; text-transform:uppercase; letter-spacing:0.4px; margin-bottom:1px }
      .field-val { font-size:9pt; color:#111 }
      .field.full { grid-column:1/-1 }
      .badge { display:inline-block; font-size:7.5pt; font-weight:700; padding:2px 8px; border-radius:20px; margin-right:3px }
      .badge-green { background:#dcfce7; color:#15803d }
      .badge-slate { background:#f1f5f9; color:#475569 }
      .badge-blue  { background:#dbeafe; color:#1d4ed8 }
      .badge-amber { background:#fef3c7; color:#b45309 }
      table { width:100%; border-collapse:collapse; font-size:8.5pt; margin-bottom:10px }
      th { background:#16a34a; color:#fff; padding:5px 8px; text-align:left; font-weight:600 }
      td { padding:5px 8px; border-bottom:1px solid #f0f0f0 }
      tr:nth-child(even) td { background:#f9fafb }
      .summary-row { display:flex; gap:10px; margin-bottom:12px; flex-wrap:wrap }
      .summary-kpi { border:1px solid #e2ebe4; border-radius:7px; padding:7px 12px; background:#f7fdf9; text-align:center; flex:1; min-width:80px }
      .summary-kpi .sv { font-size:14pt; font-weight:800; color:#16a34a }
      .summary-kpi .sl { font-size:7.5pt; color:#6b7280 }
      .footer { text-align:center; font-size:8pt; color:#888; margin-top:18px; border-top:1px solid #e2ebe4; padding-top:7px }
      @media print { body { -webkit-print-color-adjust:exact; print-color-adjust:exact } }
    `

    const hdr = `<div class="hdr">
      <h1>CABINET MÉDICAL MAROUANE</h1>
      <p>Dr DOUMBOUYA Amadou · Médecin Généraliste &amp; Urgentiste · Tél : +224 628 72 72 72</p>
      <p>cabinetmarouane@gmail.com &nbsp;·&nbsp; Dossier patient imprimé le ${new Date().toLocaleDateString("fr-FR",{weekday:"long",day:"numeric",month:"long",year:"numeric"})}</p>
    </div>`

    const info = `<div class="pat-box">
      <div class="row"><b>Nom complet :</b> ${p.nom}${p.prenom?" "+p.prenom:""}</div>
      <div class="row"><b>N° Dossier :</b> ${p.pid||p.id}</div>
      <div class="row"><b>Sexe :</b> ${p.sexe||"N/A"}</div>
      <div class="row"><b>Date de naissance :</b> ${p.dateNaissance||"N/A"}${age!==null?" · "+age+" ans":""}</div>
      <div class="row"><b>Téléphone :</b> ${p.telephone||"N/A"}</div>
      <div class="row"><b>Profession :</b> ${p.profession||"N/A"}</div>
      <div class="row"><b>Quartier / Secteur :</b> ${p.quartier||"N/A"}${p.secteur?" · "+p.secteur:""}</div>
      <div class="row"><b>Responsable :</b> ${p.responsable||"N/A"}</div>
      <div class="row"><b>Ville :</b> ${p.ville||"Conakry"}</div>
    </div>
    <div class="summary-row">
      <div class="summary-kpi"><div class="sv">${hist.length}</div><div class="sl">Consultations</div></div>
      <div class="summary-kpi"><div class="sv">${hist.filter(c=>c.statut==="paye").length}</div><div class="sl">Payées</div></div>
      <div class="summary-kpi"><div class="sv">${payTotal.toLocaleString("fr-FR")} GNF</div><div class="sl">Total encaissé</div></div>
      <div class="summary-kpi"><div class="sv">${labo.length}</div><div class="sl">Analyses Labo</div></div>
      <div class="summary-kpi"><div class="sv">${soinsList.length}</div><div class="sl">Soins infirmiers</div></div>
      <div class="summary-kpi"><div class="sv">${rdvList.length}</div><div class="sl">Rendez-vous</div></div>
    </div>`

    // ── Fiches consultations détaillées ──
    const ficheC = hist.length===0
      ? `<p style="color:#9ca3af;text-align:center;padding:12px 0">Aucune consultation enregistrée</p>`
      : hist.map((c,i)=>{
          const typeBadge = c.typeVisite==="rendez_vous"||c.typeConsultation==="rendez_vous"
            ? `<span class="badge badge-blue">Rendez-vous</span>`
            : c.typeVisite==="urgence"||c.typeConsultation==="urgence"
              ? `<span class="badge badge-amber">Urgence</span>`
              : `<span class="badge badge-slate">Consultation</span>`
          const statutBadge = c.statut==="paye"
            ? `<span class="badge badge-green">✓ Payé</span>`
            : `<span class="badge badge-slate">En attente</span>`
          return `<div class="consult-card">
            <div class="consult-header">
              <div>
                <span class="consult-num">Consultation #${i+1}</span>
                <span class="consult-date" style="margin-left:10px">${c.date||"—"}</span>
              </div>
              <div style="text-align:right">
                ${typeBadge} ${statutBadge}
              </div>
            </div>
            <div style="display:flex;gap:16px;margin-bottom:8px;font-size:8.5pt">
              <span><b style="color:#9ca3af">Service :</b> <span class="consult-service">${val(c.service)}</span></span>
              <span><b style="color:#9ca3af">Médecin :</b> <span class="consult-medecin">${val(c.signePar||c.medecin)}</span></span>
              ${c.signeLe?`<span><b style="color:#9ca3af">Signé le :</b> <span style="color:#6b7280">${c.signeLe}</span></span>`:""}
            </div>
            <div class="consult-body">
              <div class="field">
                <div class="field-lbl">Motif de consultation</div>
                <div class="field-val">${val(c.motif)}</div>
              </div>
              <div class="field">
                <div class="field-lbl">Symptômes</div>
                <div class="field-val">${arr2str(c.symptomes)}</div>
              </div>
              <div class="field">
                <div class="field-lbl">Observations cliniques</div>
                <div class="field-val">${val(c.observations)}</div>
              </div>
              <div class="field">
                <div class="field-lbl">Type de visite</div>
                <div class="field-val">${val(c.typeVisite||c.typeConsultation)}</div>
              </div>
              <div class="field full">
                <div class="field-lbl">Diagnostics</div>
                <div class="field-val">${arr2str(c.diagnostics)}</div>
              </div>
              <div class="field full">
                <div class="field-lbl">Pathologies identifiées</div>
                <div class="field-val">${arr2str(c.pathologies)}</div>
              </div>
              <div class="field full">
                <div class="field-lbl">Examens demandés</div>
                <div class="field-val">${arr2str(c.examens)}</div>
              </div>
              <div class="field full">
                <div class="field-lbl">Traitements prescrits</div>
                <div class="field-val">${arr2str(c.traitements)}</div>
              </div>
              <div class="field full">
                <div class="field-lbl">Commentaires / Recommandations</div>
                <div class="field-val">${val(c.commentaires||c.notes)}</div>
              </div>
              <div class="field">
                <div class="field-lbl">Montant</div>
                <div class="field-val">${c.montant?c.montant.toLocaleString("fr-FR")+" GNF":"—"}</div>
              </div>
              <div class="field">
                <div class="field-lbl">Mode de paiement</div>
                <div class="field-val">${c.paiement==="cash"?"Espèces":c.paiement==="carte"?"Carte bancaire":c.paiement||"—"}</div>
              </div>
            </div>
          </div>`
        }).join("")

    // ── Analyses Labo ──
    const ficheL = labo.length===0
      ? `<p style="color:#9ca3af;text-align:center;padding:8px 0">Aucune analyse enregistrée</p>`
      : `<table><thead><tr><th>Date</th><th>Examen</th><th>Type d'analyse</th><th>Prescripteur</th><th style="text-align:center">Statut</th></tr></thead><tbody>
          ${labo.map(r=>`<tr><td>${r.date||"—"}</td><td><b>${r.nomExamen||"—"}</b></td><td>${r.typeAnalyse||"—"}</td><td>${r.prescripteur||"—"}</td><td style="text-align:center">${r.valide?"✓ Validé":"En attente"}</td></tr>`).join("")}
        </tbody></table>`

    // ── Soins infirmiers ──
    const ficheS = soinsList.length===0
      ? `<p style="color:#9ca3af;text-align:center;padding:8px 0">Aucun soin enregistré</p>`
      : `<table><thead><tr><th>Date</th><th>Heure</th><th>Type de soin</th><th>Description</th><th>Infirmier</th><th style="text-align:center">Statut</th></tr></thead><tbody>
          ${soinsList.map(s=>`<tr><td>${s.date||"—"}</td><td>${s.heure||"—"}</td><td>${s.type||"—"}</td><td>${s.description||"—"}</td><td>${s.infirmier||"—"}</td><td style="text-align:center">${s.statut||"—"}</td></tr>`).join("")}
        </tbody></table>`

    // ── Rendez-vous ──
    const ficheR = rdvList.length===0
      ? `<p style="color:#9ca3af;text-align:center;padding:8px 0">Aucun rendez-vous enregistré</p>`
      : `<table><thead><tr><th>Date</th><th>Heure</th><th>Service</th><th>Médecin</th><th>Motif</th></tr></thead><tbody>
          ${rdvList.map(r=>`<tr><td>${r.date||"—"}</td><td>${r.heure||"—"}</td><td>${r.service||"—"}</td><td>${r.docteur||"—"}</td><td>${r.motif||"—"}</td></tr>`).join("")}
        </tbody></table>`

    const w = window.open("","_blank")
    w.document.write(`<!DOCTYPE html><html><head><meta charset="utf-8">
      <title>Dossier Patient · ${p.nom}</title>
      <style>${css}</style></head><body>
      ${hdr}${info}
      <div class="section-title">Consultations Médicales Détaillées (${hist.length})</div>
      ${ficheC}
      <div class="section-title">Analyses de Laboratoire (${labo.length})</div>
      ${ficheL}
      <div class="section-title">Soins Infirmiers (${soinsList.length})</div>
      ${ficheS}
      <div class="section-title">Rendez-vous (${rdvList.length})</div>
      ${ficheR}
      <div class="footer">Document médical confidentiel · Cabinet Médical Marouane · ${new Date().toLocaleDateString("fr-FR")}</div>
    </body></html>`)
    w.document.close(); w.focus(); setTimeout(()=>{ w.print(); w.close() },600)
  }

  const TABS = [
    { id:"consultations", label:"Consultations" },
    { id:"labo",          label:"Analyses Labo" },
    { id:"soins",         label:"Soins Infirmiers" },
    { id:"rdv",           label:"Rendez-vous" },
  ]

  return (
    <div style={{ maxWidth:980,margin:"0 auto" }}>

      <div style={{ marginBottom:24 }}>
        <p style={{ fontSize:26,fontWeight:800,color:C.textPri,letterSpacing:"-0.5px",marginBottom:4 }}>Historique des Patients</p>
        <p style={{ fontSize:13,color:C.textSec }}>{patients.length} patient{patients.length>1?"s":""} enregistré{patients.length>1?"s":""}</p>
      </div>

      <div style={{ position:"relative",marginBottom:20,maxWidth:440 }}>
        <svg style={{ position:"absolute",left:12,top:"50%",transform:"translateY(-50%)",pointerEvents:"none" }}
          width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={C.textMuted} strokeWidth="2" strokeLinecap="round">
          <circle cx="11" cy="11" r="7"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
        </svg>
        <input value={search} onChange={e=>setSearch(e.target.value)}
          placeholder="Rechercher par nom, téléphone, N° dossier…"
          style={{ width:"100%",padding:"10px 12px 10px 38px",border:"1px solid "+C.border,borderRadius:10,fontSize:13,fontFamily:"inherit",outline:"none",background:C.white }}/>
      </div>

      <div style={{ display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(290px,1fr))",gap:12 }}>
        {filtered.map(p => {
          const age = calcAge(p.dateNaissance)
          const hist = getConsults(p.id)
          const nLabo = getLabo(p.id).length
          const nSoins = getSoins(p.id).length
          const derniere = hist[0]
          return (
            <Card key={p.id} style={{ padding:"16px 18px",cursor:"pointer",transition:"box-shadow .2s" }}
              onMouseEnter={e=>e.currentTarget.style.boxShadow="0 4px 16px rgba(0,0,0,0.10)"}
              onMouseLeave={e=>e.currentTarget.style.boxShadow=""}>
              <div style={{ display:"flex",alignItems:"flex-start",gap:12,marginBottom:10 }}>
                <Avatar name={p.nom} size={42}/>
                <div style={{ flex:1,minWidth:0 }}>
                  <p style={{ fontSize:14,fontWeight:700,color:C.textPri,marginBottom:1 }}>{p.nom}{p.prenom?" "+p.prenom:""}</p>
                  <p style={{ fontSize:11,color:C.textMuted,marginBottom:1 }}>
                    {p.sexe||"N/A"} · {age!==null?age+" ans":"—"} · {p.telephone||"—"}
                  </p>
                  <p style={{ fontSize:11,color:C.textMuted }}>{p.profession||"—"} · {p.quartier||"—"}</p>
                </div>
              </div>
              <div style={{ display:"flex",flexWrap:"wrap",gap:6,marginBottom:12 }}>
                <span style={{ background:C.blueSoft,color:C.blue,fontSize:11,fontWeight:600,padding:"3px 8px",borderRadius:20 }}>{hist.length} consult.</span>
                {nLabo>0&&<span style={{ background:C.purpleSoft,color:C.purple,fontSize:11,fontWeight:600,padding:"3px 8px",borderRadius:20 }}>{nLabo} labo</span>}
                {nSoins>0&&<span style={{ background:C.tealSoft,color:C.teal,fontSize:11,fontWeight:600,padding:"3px 8px",borderRadius:20 }}>{nSoins} soins</span>}
                {derniere&&<span style={{ background:C.slateSoft,color:C.slate,fontSize:11,padding:"3px 8px",borderRadius:20 }}>Dernier: {derniere.date}</span>}
              </div>
              <div style={{ display:"flex",gap:8 }}>
                <button onClick={()=>{ setSelPatient(p); setActiveTab("consultations") }}
                  style={{ flex:1,padding:"8px",background:C.green,color:"#fff",border:"none",borderRadius:8,fontSize:12,fontWeight:600,cursor:"pointer",fontFamily:"inherit" }}>
                  Voir historique
                </button>
                <button onClick={()=>handlePrint(p)} title="Imprimer"
                  style={{ padding:"8px 12px",background:C.white,color:C.textSec,border:"1px solid "+C.border,borderRadius:8,cursor:"pointer",fontFamily:"inherit",display:"flex",alignItems:"center",gap:5 }}>
                  {printIcon}
                </button>
              </div>
            </Card>
          )
        })}
        {filtered.length===0&&(
          <p style={{ gridColumn:"1/-1",textAlign:"center",padding:"48px 0",color:C.textMuted,fontSize:14 }}>Aucun patient trouvé</p>
        )}
      </div>

      {/* ── Modal ── */}
      {selPatient&&(()=>{
        const age = calcAge(selPatient.dateNaissance)
        const hist = getConsults(selPatient.id)
        const labo = getLabo(selPatient.id)
        const soinsList = getSoins(selPatient.id)
        const rdvList = getRdv(selPatient.id)
        const payees = hist.filter(c=>c.statut==="paye")
        const totalPaye = payees.reduce((s,c)=>s+(c.montant||0),0)
        return (
          <div style={{ position:"fixed",inset:0,background:"rgba(0,0,0,0.5)",zIndex:300,display:"flex",alignItems:"center",justifyContent:"center",padding:16 }}
            onClick={()=>setSelPatient(null)}>
            <div style={{ background:C.white,borderRadius:16,width:"100%",maxWidth:860,maxHeight:"92vh",display:"flex",flexDirection:"column",boxShadow:"0 28px 70px rgba(0,0,0,0.25)" }}
              onClick={e=>e.stopPropagation()}>

              {/* Header */}
              <div style={{ padding:"18px 22px",borderBottom:"1px solid "+C.border,display:"flex",alignItems:"center",justifyContent:"space-between",flexShrink:0 }}>
                <div style={{ display:"flex",alignItems:"center",gap:12 }}>
                  <Avatar name={selPatient.nom} size={46}/>
                  <div>
                    <p style={{ fontSize:17,fontWeight:800,color:C.textPri,marginBottom:2 }}>{selPatient.nom}{selPatient.prenom?" "+selPatient.prenom:""}</p>
                    <p style={{ fontSize:12,color:C.textMuted }}>{selPatient.pid||"—"} · {selPatient.sexe||"N/A"} · {age!==null?age+" ans":"—"} · {selPatient.telephone||"—"}</p>
                  </div>
                </div>
                <div style={{ display:"flex",gap:8 }}>
                  <button onClick={()=>handlePrint(selPatient)}
                    style={{ display:"flex",alignItems:"center",gap:6,padding:"9px 16px",background:C.green,color:"#fff",border:"none",borderRadius:9,fontSize:13,fontWeight:600,cursor:"pointer",fontFamily:"inherit" }}>
                    {printIcon} Imprimer
                  </button>
                  <button onClick={()=>setSelPatient(null)}
                    style={{ width:36,height:36,borderRadius:8,border:"1px solid "+C.border,background:C.white,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",color:C.textMuted }}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                  </button>
                </div>
              </div>

              {/* Infos complètes patient */}
              <div style={{ padding:"12px 22px",borderBottom:"1px solid "+C.border,background:"#f9fafb",flexShrink:0 }}>
                <div style={{ display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:"4px 16px" }}>
                  {[
                    ["Date naiss.", selPatient.dateNaissance||(age!==null?age+" ans":"—")],
                    ["Profession", selPatient.profession||"—"],
                    ["Quartier",   (selPatient.quartier||"—")+(selPatient.secteur?" · "+selPatient.secteur:"")],
                    ["Responsable",selPatient.responsable||"—"],
                  ].map(([lbl,val])=>(
                    <div key={lbl}>
                      <span style={{ fontSize:10,color:C.textMuted,fontWeight:600,textTransform:"uppercase",letterSpacing:"0.4px" }}>{lbl}</span>
                      <p style={{ fontSize:12,color:C.textPri,fontWeight:500,marginTop:1 }}>{val}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* KPI 4 colonnes */}
              <div style={{ display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:10,padding:"12px 22px",borderBottom:"1px solid "+C.border,flexShrink:0 }}>
                {[
                  { label:"Consultations", val:hist.length,      color:C.blue,   bg:C.blueSoft   },
                  { label:"Total encaissé",val:totalPaye.toLocaleString("fr-FR")+" GNF", color:C.green,  bg:C.greenSoft  },
                  { label:"Analyses Labo", val:labo.length,      color:C.purple, bg:C.purpleSoft },
                  { label:"Soins / RDV",   val:soinsList.length+" / "+rdvList.length, color:C.teal,   bg:C.tealSoft   },
                ].map(({label,val,color,bg})=>(
                  <div key={label} style={{ textAlign:"center",padding:"8px 6px",background:bg,borderRadius:10 }}>
                    <p style={{ fontSize:18,fontWeight:800,color,lineHeight:1,marginBottom:3 }}>{val}</p>
                    <p style={{ fontSize:10,color:C.textMuted }}>{label}</p>
                  </div>
                ))}
              </div>

              {/* Onglets */}
              <div style={{ display:"flex",borderBottom:"1px solid "+C.border,flexShrink:0,paddingLeft:22 }}>
                {TABS.map(t=>(
                  <button key={t.id} onClick={()=>setActiveTab(t.id)}
                    style={{ padding:"11px 18px",border:"none",background:"none",cursor:"pointer",fontSize:13,fontWeight:activeTab===t.id?700:500,
                      color:activeTab===t.id?C.green:C.textSec,
                      borderBottom:activeTab===t.id?"2px solid "+C.green:"2px solid transparent",
                      fontFamily:"inherit",transition:"color .15s" }}>
                    {t.label}
                    <span style={{ marginLeft:6,background:activeTab===t.id?C.greenSoft:"#f1f5f1",color:activeTab===t.id?C.green:C.textMuted,fontSize:10,fontWeight:700,padding:"1px 7px",borderRadius:20 }}>
                      {t.id==="consultations"?hist.length:t.id==="labo"?labo.length:t.id==="soins"?soinsList.length:rdvList.length}
                    </span>
                  </button>
                ))}
              </div>

              {/* Contenu onglets */}
              <div style={{ overflowY:"auto",flex:1,padding:"16px 22px 20px" }}>

                {/* ── Consultations ── */}
                {activeTab==="consultations"&&(
                  hist.length===0
                    ? <p style={{ textAlign:"center",padding:"36px 0",color:C.textMuted,fontSize:14 }}>Aucune consultation enregistrée</p>
                    : <table style={{ width:"100%",borderCollapse:"collapse" }}>
                        <thead><tr>
                          {["Date","Service","Médecin","Motif","Diagnostics","Traitements","Montant","Statut"].map(h=>(
                            <th key={h} style={{ padding:"9px 10px",textAlign:"left",fontSize:10,fontWeight:700,color:C.textMuted,textTransform:"uppercase",letterSpacing:"0.4px",borderBottom:"2px solid "+C.border }}>{h}</th>
                          ))}
                        </tr></thead>
                        <tbody>
                          {hist.map((c,i,arr)=>(
                            <tr key={c.id} style={{ borderBottom:i<arr.length-1?"1px solid #f0f0f0":"none" }}
                              onMouseEnter={e=>e.currentTarget.style.background="#f9fafb"}
                              onMouseLeave={e=>e.currentTarget.style.background="transparent"}>
                              <td style={{ padding:"10px",fontSize:12,fontWeight:600,color:C.textPri,whiteSpace:"nowrap" }}>{c.date}</td>
                              <td style={{ padding:"10px",fontSize:11,color:C.textSec,maxWidth:120 }}>{c.service||"—"}</td>
                              <td style={{ padding:"10px",fontSize:11,color:C.textSec,whiteSpace:"nowrap" }}>{c.signePar||"—"}</td>
                              <td style={{ padding:"10px",fontSize:11,color:C.textSec,maxWidth:140 }}>{c.motif||"—"}</td>
                              <td style={{ padding:"10px",fontSize:11,color:C.textSec,maxWidth:150 }}>{Array.isArray(c.diagnostics)&&c.diagnostics.length?c.diagnostics.join(", "):"—"}</td>
                              <td style={{ padding:"10px",fontSize:11,color:C.textSec,maxWidth:150 }}>{Array.isArray(c.traitements)&&c.traitements.length?c.traitements.join(", "):"—"}</td>
                              <td style={{ padding:"10px",fontSize:12,fontWeight:600,color:C.textPri,whiteSpace:"nowrap" }}>{c.montant?c.montant.toLocaleString("fr-FR")+" GNF":"—"}</td>
                              <td style={{ padding:"10px" }}><StatutBadge statut={c.statut||"en_attente"}/></td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                )}

                {/* ── Analyses Labo ── */}
                {activeTab==="labo"&&(
                  labo.length===0
                    ? <p style={{ textAlign:"center",padding:"36px 0",color:C.textMuted,fontSize:14 }}>Aucune analyse de laboratoire enregistrée</p>
                    : <table style={{ width:"100%",borderCollapse:"collapse" }}>
                        <thead><tr>
                          {["Date","Examen","Type d'analyse","Prescripteur","Statut"].map(h=>(
                            <th key={h} style={{ padding:"9px 10px",textAlign:"left",fontSize:10,fontWeight:700,color:C.textMuted,textTransform:"uppercase",letterSpacing:"0.4px",borderBottom:"2px solid "+C.border }}>{h}</th>
                          ))}
                        </tr></thead>
                        <tbody>
                          {labo.map((r,i,arr)=>(
                            <tr key={r.id} style={{ borderBottom:i<arr.length-1?"1px solid #f0f0f0":"none" }}
                              onMouseEnter={e=>e.currentTarget.style.background="#f9fafb"}
                              onMouseLeave={e=>e.currentTarget.style.background="transparent"}>
                              <td style={{ padding:"10px",fontSize:12,fontWeight:600,color:C.textPri,whiteSpace:"nowrap" }}>{r.date||"—"}</td>
                              <td style={{ padding:"10px",fontSize:12,color:C.textSec }}>{r.nomExamen||"—"}</td>
                              <td style={{ padding:"10px",fontSize:12,color:C.textSec }}>{r.typeAnalyse||"—"}</td>
                              <td style={{ padding:"10px",fontSize:12,color:C.textSec }}>{r.prescripteur||"—"}</td>
                              <td style={{ padding:"10px" }}>
                                <span style={{ background:r.valide?C.greenSoft:C.slateSoft,color:r.valide?C.green:C.slate,fontSize:11,fontWeight:600,padding:"3px 9px",borderRadius:20 }}>
                                  {r.valide?"Validé":"En attente"}
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                )}

                {/* ── Soins Infirmiers ── */}
                {activeTab==="soins"&&(
                  soinsList.length===0
                    ? <p style={{ textAlign:"center",padding:"36px 0",color:C.textMuted,fontSize:14 }}>Aucun soin infirmier enregistré</p>
                    : <table style={{ width:"100%",borderCollapse:"collapse" }}>
                        <thead><tr>
                          {["Date","Heure","Type","Description","Infirmier","Statut"].map(h=>(
                            <th key={h} style={{ padding:"9px 10px",textAlign:"left",fontSize:10,fontWeight:700,color:C.textMuted,textTransform:"uppercase",letterSpacing:"0.4px",borderBottom:"2px solid "+C.border }}>{h}</th>
                          ))}
                        </tr></thead>
                        <tbody>
                          {soinsList.map((s,i,arr)=>(
                            <tr key={s.id} style={{ borderBottom:i<arr.length-1?"1px solid #f0f0f0":"none" }}
                              onMouseEnter={e=>e.currentTarget.style.background="#f9fafb"}
                              onMouseLeave={e=>e.currentTarget.style.background="transparent"}>
                              <td style={{ padding:"10px",fontSize:12,fontWeight:600,color:C.textPri }}>{s.date||"—"}</td>
                              <td style={{ padding:"10px",fontSize:12,color:C.textSec }}>{s.heure||"—"}</td>
                              <td style={{ padding:"10px",fontSize:12,color:C.textSec }}>{s.type||"—"}</td>
                              <td style={{ padding:"10px",fontSize:12,color:C.textSec,maxWidth:200 }}>{s.description||"—"}</td>
                              <td style={{ padding:"10px",fontSize:12,color:C.textSec }}>{s.infirmier||"—"}</td>
                              <td style={{ padding:"10px",fontSize:12,color:C.textSec }}>{s.statut||"—"}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                )}

                {/* ── Rendez-vous ── */}
                {activeTab==="rdv"&&(
                  rdvList.length===0
                    ? <p style={{ textAlign:"center",padding:"36px 0",color:C.textMuted,fontSize:14 }}>Aucun rendez-vous enregistré</p>
                    : <table style={{ width:"100%",borderCollapse:"collapse" }}>
                        <thead><tr>
                          {["Date","Heure","Service","Médecin","Motif"].map(h=>(
                            <th key={h} style={{ padding:"9px 10px",textAlign:"left",fontSize:10,fontWeight:700,color:C.textMuted,textTransform:"uppercase",letterSpacing:"0.4px",borderBottom:"2px solid "+C.border }}>{h}</th>
                          ))}
                        </tr></thead>
                        <tbody>
                          {rdvList.map((r,i,arr)=>(
                            <tr key={r.id} style={{ borderBottom:i<arr.length-1?"1px solid #f0f0f0":"none" }}
                              onMouseEnter={e=>e.currentTarget.style.background="#f9fafb"}
                              onMouseLeave={e=>e.currentTarget.style.background="transparent"}>
                              <td style={{ padding:"10px",fontSize:12,fontWeight:600,color:C.textPri,whiteSpace:"nowrap" }}>{r.date}</td>
                              <td style={{ padding:"10px",fontSize:12,color:C.textSec }}>{r.heure||"—"}</td>
                              <td style={{ padding:"10px",fontSize:12,color:C.textSec }}>{r.service||"—"}</td>
                              <td style={{ padding:"10px",fontSize:12,color:C.textSec }}>{r.docteur||"—"}</td>
                              <td style={{ padding:"10px",fontSize:12,color:C.textSec }}>{r.motif||"—"}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                )}
              </div>
            </div>
          </div>
        )
      })()}
    </div>
  )
}
