import { useState } from "react"
import { today, C, Card, SERVICES, COULEURS } from "./shared.jsx"

export default function PageStats({ consultations, patients }) {
  const [periode, setPeriode] = useState("mois")
  const now = new Date()

  const filtreDate = d => {
    const dp=new Date(d)
    if(periode==="jour")    return d===today()
    if(periode==="semaine") { const s=new Date(now); s.setDate(s.getDate()-7); return dp>=s }
    if(periode==="mois")    { const s=new Date(now); s.setMonth(s.getMonth()-1); return dp>=s }
    if(periode==="annee")   { const s=new Date(now); s.setFullYear(s.getFullYear()-1); return dp>=s }
    return true
  }
  
  // ── Filtrage par date ──
  const cF            = consultations.filter(c=>filtreDate(c.date))
  
  // ── STATISTIQUES CONSULTATIONS ──
  const consultationsPayees = cF.filter(c=>c.statut==="paye")
  const consultationsEnAttente = cF.filter(c=>c.statut==="en_attente")
  const totalRecettesConsult = consultationsPayees.reduce((s,c)=>s+(c.montant||0),0)
  const prixMoyenConsult = consultationsPayees.length>0?Math.round(totalRecettesConsult/consultationsPayees.length):0
  const tauxPaiementConsult = cF.length>0?Math.round((consultationsPayees.length/cF.length)*100):0
  
  // ── STATISTIQUES EXAMENS (séparé) ──
  // Les examens sont identifiés par la présence de fraisExamens > 0
  const avecExamens = cF.filter(c=>c.fraisExamens && c.fraisExamens > 0)
  const examensPayes = avecExamens.filter(c=>c.statutExamens==="paye")
  const examensEnAttente = avecExamens.filter(c=>c.statutExamens==="en_attente" || c.statutExamens==="partiel")
  const totalRecettesExamens = examensPayes.reduce((s,c)=>s+(c.montantExamens||0),0)
  const totalRecettesExamensPartiel = examensEnAttente.reduce((s,c)=>s+(c.montantExamensPaye||0),0)
  const totalGeneralExamens = avecExamens.reduce((s,c)=>s+(c.fraisExamens||0),0)
  
  // ── TOTAL GENERAL ──
  const totalGeneral = totalRecettesConsult + totalRecettesExamens + totalRecettesExamensPartiel
  const patientsF     = patients.filter(p=>p.sexe==="F").length
  const patientsM     = patients.filter(p=>p.sexe==="M").length

  const JOURS=["Lun","Mar","Mer","Jeu","Ven","Sam","Dim"]
  const activiteHebo=JOURS.map((_,i)=>{ const d=new Date(now); d.setDate(d.getDate()-((d.getDay()||7)-1)+i); return consultations.filter(c=>c.date===d.toISOString().slice(0,10)).length })
  const maxHebo=Math.max(...activiteHebo,1)

  const servicesStats=SERVICES.map(s=>({ service:s, nb:cF.filter(c=>c.service===s).length, recettes:consultationsPayees.filter(c=>c.service===s).reduce((sum,c)=>sum+(c.montant||0),0) })).filter(s=>s.nb>0).sort((a,b)=>b.nb-a.nb)

  // Graphique courbe recettes (consultations uniquement)
  const ptsCourbe=(periode==="semaine"||periode==="jour")
    ? JOURS.map((_,i)=>{ const d=new Date(now); d.setDate(d.getDate()-((d.getDay()||7)-1)+i); return { label:JOURS[i], val:consultationsPayees.filter(c=>c.date===d.toISOString().slice(0,10)).reduce((s,c)=>s+(c.montant||0),0) } })
    : [0,1,2,3,4,5].map(m=>{ const d=new Date(now); d.setMonth(d.getMonth()-5+m); const mo=d.getMonth(),yr=d.getFullYear(); return { label:d.toLocaleDateString("fr-FR",{month:"short"}), val:consultationsPayees.filter(c=>{ const dp=new Date(c.date); return dp.getMonth()===mo&&dp.getFullYear()===yr }).reduce((s,c)=>s+(c.montant||0),0) } })
  const maxRecette=Math.max(...ptsCourbe.map(p=>p.val),1)
  const W=460,H=160,PL=52,PR=12,PT=12,PB=32,iW=W-PL-PR,iH=H-PT-PB
  const pp=ptsCourbe.map((p,idx)=>({ x:PL+(idx/(ptsCourbe.length-1||1))*iW, y:PT+iH-(p.val/maxRecette)*iH, ...p }))
  const areaPath=pp.length>1?`M${pp[0].x},${PT+iH} `+pp.map(p=>`L${p.x},${p.y}`).join(" ")+` L${pp[pp.length-1].x},${PT+iH} Z`:""

  // Statistiques par pathologie
  const pathoCounts = {}
  cF.forEach(c => {
    if (!c.motif) return
    c.motif.split(/[,;/\n]+/).forEach(p => {
      const k = p.trim()
      if (k.length > 2) pathoCounts[k] = (pathoCounts[k] || 0) + 1
    })
  })
  const pathoStats = Object.entries(pathoCounts)
    .map(([nom, nb]) => ({ nom, nb }))
    .sort((a, b) => b.nb - a.nb)
    .slice(0, 12)

  // ── Alias pour compatibilité avec le reste du code ──
  const payees = consultationsPayees
  const enAttente = consultationsEnAttente
  const totalRecettes = totalRecettesConsult
  const tauxPaiement = tauxPaiementConsult
  const prixMoyen = prixMoyenConsult

  const FILTRES=[{id:"jour",l:"Auj."},{id:"semaine",l:"Semaine"},{id:"mois",l:"Mois"},{id:"annee",l:"Année"}]
  const periodeLabel = FILTRES.find(f=>f.id===periode)?.l || periode

  const handlePrintStats = () => {
    const pNA = patients.length - patientsF - patientsM
    const maxHebo2 = Math.max(...activiteHebo, 1)
    const maxPath  = Math.max(...pathoStats.map(p=>p.nb), 1)

    const barH = (v, max, maxPx=90) => Math.max(Math.round((v/max)*maxPx), v>0?6:2)

    const css = `
      @page { size:A4; margin:12mm 14mm }
      * { box-sizing:border-box; margin:0; padding:0 }
      body { font-family:'Segoe UI',Arial,sans-serif; font-size:9.5pt; color:#111; background:#fff }
      .hdr { text-align:center; border-bottom:2.5px solid #16a34a; padding-bottom:8px; margin-bottom:14px }
      .hdr h1 { font-size:15pt; color:#16a34a; font-weight:800; letter-spacing:-0.5px }
      .hdr p  { font-size:8.5pt; color:#555; margin-top:2px }
      .period-badge { display:inline-block; background:#dcfce7; color:#16a34a; font-size:8.5pt; font-weight:700; padding:3px 10px; border-radius:20px; margin-top:6px }
      h2 { font-size:10.5pt; font-weight:700; color:#16a34a; border-left:3px solid #16a34a; padding-left:8px; margin:14px 0 8px }
      .kpi-grid { display:grid; grid-template-columns:repeat(4,1fr); gap:8px; margin-bottom:14px }
      .kpi { border:1px solid #e2ebe4; border-radius:8px; padding:10px 12px; background:#f7fdf9 }
      .kpi .val { font-size:18pt; font-weight:800; color:#111; line-height:1; margin-bottom:3px }
      .kpi .lbl { font-size:8pt; color:#6b7280; font-weight:500 }
      .kpi .sub { font-size:7.5pt; color:#9ca3af; margin-top:2px }
      .two-col { display:grid; grid-template-columns:1fr 1fr; gap:10px; margin-bottom:14px }
      .three-col { display:grid; grid-template-columns:1fr 1fr 1fr; gap:10px; margin-bottom:14px }
      .card { border:1px solid #e2ebe4; border-radius:8px; padding:12px 14px; background:#fff }
      .card-title { font-size:9pt; font-weight:700; color:#374151; margin-bottom:8px }
      table { width:100%; border-collapse:collapse; font-size:8.5pt }
      th { background:#16a34a; color:#fff; padding:5px 7px; text-align:left; font-weight:600 }
      td { padding:5px 7px; border-bottom:1px solid #f0f0f0 }
      tr:nth-child(even) td { background:#f9fafb }
      .bar-wrap { display:flex; align-items:flex-end; gap:4px; height:96px; margin-top:4px }
      .bar-col { display:flex; flex-direction:column; align-items:center; gap:3px; flex:1 }
      .bar-val { font-size:7pt; font-weight:700; color:#16a34a }
      .bar-box { width:100%; border-radius:3px 3px 0 0 }
      .bar-lbl { font-size:6.5pt; color:#9ca3af; text-align:center }
      .hbar-row { display:flex; align-items:center; gap:6px; margin-bottom:5px }
      .hbar-lbl { font-size:8pt; color:#374151; width:130px; flex-shrink:0; overflow:hidden; white-space:nowrap; text-overflow:ellipsis }
      .hbar-track { flex:1; height:10px; background:#f1f5f1; border-radius:5px; overflow:hidden }
      .hbar-fill { height:100%; border-radius:5px }
      .hbar-nb { font-size:8pt; font-weight:700; color:#111; width:18px; text-align:right; flex-shrink:0 }
      .donut-legend { display:flex; flex-direction:column; gap:5px; margin-top:8px }
      .donut-row { display:flex; align-items:center; gap:6px; font-size:8.5pt; color:#374151 }
      .dot { width:9px; height:9px; border-radius:2px; flex-shrink:0 }
      .footer { text-align:center; font-size:8pt; color:#888; margin-top:16px; border-top:1px solid #e2ebe4; padding-top:8px }
      @media print { body { -webkit-print-color-adjust:exact; print-color-adjust:exact } }
    `

    // ── Barres hebdo ──
    const barHebo = activiteHebo.map((v,i)=>{
      const h = barH(v, maxHebo2)
      const isT = i===(new Date().getDay()||7)-1
      const bg = isT?'#16a34a':v>0?'#86efac':'#e5e7eb'
      return `<div class="bar-col">
        <span class="bar-val">${v>0?v:''}</span>
        <div class="bar-box" style="height:${h}px;background:${bg}"></div>
        <span class="bar-lbl" style="color:${isT?'#16a34a':'#9ca3af'};font-weight:${isT?700:400}">${JOURS[i]}</span>
      </div>`
    }).join("")

    // ── Courbe recettes → tableau ──
    const rowsRec = ptsCourbe.map(p=>`<tr><td>${p.label}</td><td style="text-align:right;font-weight:600">${p.val.toLocaleString("fr-FR")} GNF</td></tr>`).join("")

    // ── Services ──
    const rowsServ = servicesStats.map((s,i)=>`<tr>
      <td><span style="display:inline-block;width:8px;height:8px;border-radius:2px;background:${COULEURS[i%COULEURS.length]};margin-right:6px"></span>${s.service}</td>
      <td style="text-align:center">${s.nb}</td>
      <td style="text-align:right;font-weight:600">${s.recettes.toLocaleString("fr-FR")} GNF</td>
    </tr>`).join("")
    const totalNb  = servicesStats.reduce((s,r)=>s+r.nb, 0)
    const totalRec = servicesStats.reduce((s,r)=>s+r.recettes, 0)

    // ── Pathologies barres horizontales ──
    const hbars = pathoStats.slice(0,10).map((p,i)=>`
      <div class="hbar-row">
        <span class="hbar-lbl" title="${p.nom}">${i+1}. ${p.nom}</span>
        <div class="hbar-track"><div class="hbar-fill" style="width:${Math.round(p.nb/maxPath*100)}%;background:${COULEURS[i%COULEURS.length]}"></div></div>
        <span class="hbar-nb">${p.nb}</span>
      </div>`).join("")

    // ── Répartition patients ──
    const distRows = [
      {l:"Femmes", v:patientsF, c:"#16a34a"},
      {l:"Hommes", v:patientsM, c:"#1d4ed8"},
      {l:"N/A",    v:pNA,       c:"#9ca3af"},
    ].filter(d=>d.v>0).map(d=>`
      <div class="donut-row">
        <div class="dot" style="background:${d.c}"></div>
        <span style="flex:1">${d.l}</span>
        <b>${d.v}</b>
        <span style="color:#9ca3af;width:32px;text-align:right">${Math.round(d.v/patients.length*100)}%</span>
      </div>`).join("")

    const w = window.open("","_blank")
    w.document.write(`<!DOCTYPE html><html><head><meta charset="utf-8"><title>Statistiques · Cabinet Médical Marouane</title><style>${css}</style></head><body>
    <div class="hdr">
      <h1>CABINET MÉDICAL MAROUANE</h1>
      <p>Dr DOUMBOUYA Amadou · Médecin Généraliste &amp; Urgentiste · Tél : +224 628 72 72 72 · cabinetmarouane@gmail.com</p>
      <p>Rapport Statistiques &amp; Rapports &nbsp;·&nbsp; Imprimé le ${new Date().toLocaleDateString("fr-FR",{weekday:"long",day:"numeric",month:"long",year:"numeric"})}</p>
      <span class="period-badge">Période : ${periodeLabel}</span>
    </div>

    <h2>Indicateurs Clés</h2>
    <div class="kpi-grid">
      <div class="kpi"><div class="val">${patients.length}</div><div class="lbl">Total Patients</div><div class="sub">${patientsF} Femmes · ${patientsM} Hommes</div></div>
      <div class="kpi"><div class="val">${cF.length}</div><div class="lbl">Consultations</div><div class="sub">${payees.length} payées · ${enAttente.length} en attente</div></div>
      <div class="kpi"><div class="val">${totalRecettes.toLocaleString("fr-FR")}</div><div class="lbl">Recettes (GNF)</div><div class="sub">Paiements encaissés</div></div>
      <div class="kpi"><div class="val">${tauxPaiement}%</div><div class="lbl">Taux de paiement</div><div class="sub">Moy. ${prixMoyen.toLocaleString("fr-FR")} GNF/consult.</div></div>
    </div>

    <div class="two-col">
      <div class="card">
        <div class="card-title">Activité Hebdomadaire</div>
        <div class="bar-wrap">${barHebo}</div>
      </div>
      <div class="card">
        <div class="card-title">Évolution des Recettes (GNF)</div>
        <table><thead><tr><th>Période</th><th style="text-align:right">Recettes</th></tr></thead><tbody>${rowsRec}</tbody></table>
      </div>
    </div>

    <h2>Consultations par Service</h2>
    <table>
      <thead><tr><th>Service</th><th style="text-align:center">Consultations</th><th style="text-align:right">Recettes (GNF)</th></tr></thead>
      <tbody>
        ${rowsServ}
        <tr style="background:#f0fdf4;font-weight:800"><td>TOTAL</td><td style="text-align:center">${totalNb}</td><td style="text-align:right">${totalRec.toLocaleString("fr-FR")} GNF</td></tr>
      </tbody>
    </table>

    <div class="two-col" style="margin-top:14px">
      <div class="card">
        <div class="card-title">Répartition des Patients par Sexe</div>
        <div class="donut-legend" style="margin-top:4px">${distRows}</div>
        <div style="margin-top:10px;font-size:8pt;color:#6b7280">Total enregistrés : <b>${patients.length}</b></div>
      </div>
      <div class="card">
        <div class="card-title">Statistiques par Pathologie (Top 10)</div>
        ${pathoStats.length===0
          ? `<p style="color:#9ca3af;font-size:8.5pt;padding:12px 0;text-align:center">Aucune donnée sur cette période</p>`
          : hbars}
      </div>
    </div>

    <div class="footer">Document confidentiel · Cabinet Médical Marouane · Généré automatiquement</div>
    </body></html>`)
    w.document.close()
    w.focus()
    setTimeout(()=>{ w.print(); w.close() }, 600)
  }

  const KPI_COLORS=[
    { bg:"#e8f5ec", fg:C.green,   icon:<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg> },
    { bg:"#dbeafe", fg:"#1d4ed8",  icon:<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><rect x="8" y="2" width="8" height="4" rx="1"/><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/><line x1="12" y1="11" x2="12" y2="17"/><line x1="9" y1="14" x2="15" y2="14"/></svg> },
    { bg:"#fef3c7", fg:"#b45309",  icon:<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg> },
    { bg:"#ede9fe", fg:"#6d28d9",  icon:<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg> },
  ]

  return (
    <div style={{ maxWidth:980, margin:"0 auto" }}>

      {/* En-tête */}
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:28, flexWrap:"wrap", gap:12 }}>
        <div>
          <p style={{ fontSize:26, fontWeight:800, color:C.textPri, letterSpacing:"-0.5px", marginBottom:4 }}>Statistiques &amp; Rapports</p>
          <p style={{ fontSize:13, color:C.textSec }}>{cF.length} consultation{cF.length>1?"s":""} · {payees.length} payée{payees.length>1?"s":""} · {enAttente.length} en attente</p>
        </div>
        <div style={{ display:"flex", alignItems:"center", gap:8 }}>
          <div style={{ display:"flex", background:"#f1f5f1", borderRadius:10, padding:3, gap:2 }}>
            {FILTRES.map(f=>(
              <button key={f.id} onClick={()=>setPeriode(f.id)}
                style={{ padding:"7px 14px", borderRadius:8, border:"none", fontSize:12, fontWeight:600, cursor:"pointer", fontFamily:"inherit",
                  background:periode===f.id?C.white:"transparent",
                  color:periode===f.id?C.green:C.textSec,
                  boxShadow:periode===f.id?"0 1px 3px rgba(0,0,0,0.12)":"none" }}>
                {f.l}
              </button>
            ))}
          </div>
          <button onClick={handlePrintStats}
            style={{ display:"flex",alignItems:"center",gap:6,padding:"8px 16px",background:C.green,color:"#fff",border:"none",borderRadius:9,fontSize:12,fontWeight:600,cursor:"pointer",fontFamily:"inherit" }}
            onMouseEnter={e=>e.currentTarget.style.background=C.greenDark}
            onMouseLeave={e=>e.currentTarget.style.background=C.green}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><polyline points="6 9 6 2 18 2 18 9"/><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/><rect x="6" y="14" width="12" height="8"/></svg>
            Imprimer PDF
          </button>
        </div>
      </div>

      {/* KPI — 4 cartes en ligne */}
      <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:14, marginBottom:20 }}>
        {[
          { label:"Total Patients", val:patients.length, sub:`${patientsF} F · ${patientsM} H`, kpi:0 },
          { label:"Consultations",  val:cF.length,       sub:`Période sélectionnée`, kpi:1 },
          { label:"Recettes (GNF)", val:totalRecettes.toLocaleString("fr-FR"), sub:`Paiements encaissés`, kpi:2 },
          { label:"Taux de paiement", val:tauxPaiement+"%", sub:`Moy. ${prixMoyen.toLocaleString("fr-FR")} GNF/consult.`, kpi:3 },
        ].map(({label,val,sub,kpi})=>{
          const k=KPI_COLORS[kpi]
          return (
            <Card key={label} style={{ padding:"20px 22px" }}>
              <div style={{ display:"flex",justifyContent:"space-between",alignItems:"flex-start" }}>
                <div style={{ flex:1,minWidth:0 }}>
                  <p style={{ fontSize:12,color:C.textSec,marginBottom:8,fontWeight:500 }}>{label}</p>
                  <p style={{ fontSize:28,fontWeight:800,color:C.textPri,lineHeight:1,marginBottom:6 }}>{val}</p>
                  <p style={{ fontSize:11,color:C.textMuted }}>{sub}</p>
                </div>
                <div style={{ width:44,height:44,borderRadius:12,background:k.bg,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,color:k.fg,marginLeft:10 }}>
                  {k.icon}
                </div>
              </div>
            </Card>
          )
        })}
      </div>

      {/* Barres hebdo + Courbe recettes */}
      <div style={{ display:"grid", gridTemplateColumns:"1fr 1.6fr", gap:16, marginBottom:16 }}>

        {/* Activité hebdomadaire */}
        <Card>
          <div style={{ padding:"18px 20px" }}>
            <p style={{ fontSize:14,fontWeight:700,color:C.textPri,marginBottom:2 }}>Activité Hebdomadaire</p>
            <p style={{ fontSize:12,color:C.textMuted,marginBottom:18 }}>Consultations · semaine en cours</p>
            <div style={{ position:"relative", height:180 }}>
              <div style={{ position:"absolute",left:34,right:8,bottom:26,top:0,display:"flex",alignItems:"flex-end",gap:6 }}>
                {JOURS.map((j,i)=>{
                  const v=activiteHebo[i]
                  const h=v>0?Math.max((v/maxHebo)*145,10):4
                  const isToday=i===(new Date().getDay()||7)-1
                  return (
                    <div key={j} style={{ display:"flex",flexDirection:"column",alignItems:"center",gap:4,flex:1 }}>
                      {v>0&&<span style={{ fontSize:11,fontWeight:700,color:C.green }}>{v}</span>}
                      <div style={{ width:"100%",maxWidth:42,height:h,
                        background:isToday?C.green:v>0?"#86efac":"#e5e7eb",
                        borderRadius:"5px 5px 0 0",transition:"height .35s ease" }}/>
                      <span style={{ fontSize:10,color:isToday?C.green:C.textMuted,fontWeight:isToday?700:400 }}>{j}</span>
                    </div>
                  )
                })}
              </div>
              <div style={{ position:"absolute",left:34,right:8,bottom:24,height:1,background:C.border }}/>
              {/* Labels axe Y */}
              {[0,Math.ceil(maxHebo/2),maxHebo].map(v=>{
                const y=(1-v/maxHebo)*145
                return <span key={v} style={{ position:"absolute",left:0,top:y,fontSize:9,color:C.textMuted,lineHeight:1 }}>{v}</span>
              })}
            </div>
          </div>
        </Card>

        {/* Courbe recettes */}
        <Card>
          <div style={{ padding:"18px 20px" }}>
            <div style={{ display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:18 }}>
              <div>
                <p style={{ fontSize:14,fontWeight:700,color:C.textPri,marginBottom:2 }}>Évolution des Recettes</p>
                <p style={{ fontSize:12,color:C.textMuted }}>En GNF · {periode==="jour"||periode==="semaine"?"par jour":"par mois"}</p>
              </div>
              <div style={{ textAlign:"right" }}>
                <p style={{ fontSize:18,fontWeight:800,color:C.green }}>{totalRecettes.toLocaleString("fr-FR")}</p>
                <p style={{ fontSize:11,color:C.textMuted }}>GNF encaissés</p>
              </div>
            </div>
            <svg width="100%" viewBox={`0 0 ${W} ${H}`} style={{ overflow:"visible" }}>
              {/* Grille */}
              {[0,0.5,1].map(t=>{
                const y=PT+iH-(t*iH)
                return <g key={t}>
                  <line x1={PL} y1={y} x2={W-PR} y2={y} stroke="#e5e7eb" strokeDasharray="4,4"/>
                  <text x={PL-6} y={y+4} textAnchor="end" fontSize="9" fill="#9ca3af">{((t*maxRecette)/1000).toFixed(0)}K</text>
                </g>
              })}
              {/* Labels X */}
              {pp.map((p,i)=><text key={i} x={p.x} y={H-PB+16} textAnchor="middle" fontSize="9" fill="#9ca3af">{p.label}</text>)}
              {/* Aire dégradée */}
              {areaPath&&<defs><linearGradient id="recGrad" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor={C.green} stopOpacity="0.18"/><stop offset="100%" stopColor={C.green} stopOpacity="0"/></linearGradient></defs>}
              {areaPath&&<path d={areaPath} fill="url(#recGrad)"/>}
              {/* Courbe */}
              {pp.length>1&&<path d={pp.map((p,i)=>i===0?`M${p.x},${p.y}`:`L${p.x},${p.y}`).join(" ")} fill="none" stroke={C.green} strokeWidth="2.5" strokeLinejoin="round" strokeLinecap="round"/>}
              {/* Points */}
              {pp.map((p,i)=><circle key={i} cx={p.x} cy={p.y} r="4.5" fill={C.white} stroke={C.green} strokeWidth="2.5"/>)}
            </svg>
          </div>
        </Card>
      </div>

      {/* Services — camembert + tableau */}
      <div style={{ display:"grid", gridTemplateColumns:"1fr 1.4fr", gap:16, marginBottom:16 }}>

        {/* Camembert donut */}
        <Card>
          <div style={{ padding:"18px 20px" }}>
            <p style={{ fontSize:14,fontWeight:700,color:C.textPri,marginBottom:2 }}>Consultations par Service</p>
            <p style={{ fontSize:12,color:C.textMuted,marginBottom:16 }}>Distribution · période sélectionnée</p>
            {servicesStats.length===0
              ? <p style={{ color:C.textMuted,textAlign:"center",padding:"32px 0",fontSize:13 }}>Aucune donnée sur cette période</p>
              : (() => {
                  const total=servicesStats.reduce((s,x)=>s+x.nb,0)||1
                  const cx=90,cy=90,R=72,r=42
                  let cumul=0
                  const slices=servicesStats.slice(0,6).map((s,i)=>{
                    const pct=s.nb/total,start=cumul; cumul+=pct
                    const a1=(start*2*Math.PI)-Math.PI/2
                    const a2=((start+pct)*2*Math.PI)-Math.PI/2
                    const x1=cx+R*Math.cos(a1),y1=cy+R*Math.sin(a1)
                    const x2=cx+R*Math.cos(a2),y2=cy+R*Math.sin(a2)
                    const xi1=cx+r*Math.cos(a1),yi1=cy+r*Math.sin(a1)
                    const xi2=cx+r*Math.cos(a2),yi2=cy+r*Math.sin(a2)
                    const large=pct>0.5?1:0
                    const d=`M${xi1},${yi1} L${x1},${y1} A${R},${R} 0 ${large} 1 ${x2},${y2} L${xi2},${yi2} A${r},${r} 0 ${large} 0 ${xi1},${yi1} Z`
                    return { ...s, pct, d, color:COULEURS[i%COULEURS.length] }
                  })
                  return (
                    <div>
                      <div style={{ display:"flex",justifyContent:"center" }}>
                        <svg width="180" height="180" viewBox="0 0 180 180">
                          {slices.map((s,i)=>(
                            <path key={i} d={s.d} fill={s.color} stroke="#fff" strokeWidth="2"/>
                          ))}
                          <text x={cx} y={cy-8} textAnchor="middle" fontSize="22" fontWeight="800" fill={C.textPri}>{total}</text>
                          <text x={cx} y={cy+12} textAnchor="middle" fontSize="10" fill={C.textMuted}>consultations</text>
                        </svg>
                      </div>
                      <div style={{ display:"flex",flexDirection:"column",gap:6,marginTop:8 }}>
                        {slices.map((s)=>(
                          <div key={s.service} style={{ display:"flex",alignItems:"center",gap:8 }}>
                            <div style={{ width:10,height:10,borderRadius:3,background:s.color,flexShrink:0 }}/>
                            <span style={{ fontSize:12,color:C.textSec,flex:1 }}>{s.service}</span>
                            <span style={{ fontSize:12,fontWeight:700,color:C.textPri }}>{s.nb}</span>
                            <span style={{ fontSize:11,color:C.textMuted,width:32,textAlign:"right" }}>{Math.round(s.pct*100)}%</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )
                })()
            }
          </div>
        </Card>

        {/* Tableau récapitulatif */}
        <Card>
          <div style={{ padding:"14px 18px",borderBottom:"1px solid "+C.border,display:"flex",justifyContent:"space-between",alignItems:"center" }}>
            <div>
              <p style={{ fontSize:14,fontWeight:700,color:C.textPri }}>Récapitulatif par Service</p>
              <p style={{ fontSize:12,color:C.textMuted }}>Performance · période sélectionnée</p>
            </div>
          </div>
          {servicesStats.length===0
            ? <p style={{ padding:"32px 0",textAlign:"center",color:C.textMuted,fontSize:13 }}>Aucune consultation sur cette période</p>
            : <div style={{ overflowY:"auto",maxHeight:260 }}>
                <table style={{ width:"100%",borderCollapse:"collapse" }}>
                  <thead>
                    <tr style={{ position:"sticky",top:0,background:C.white,zIndex:1 }}>
                      {["Service","Consult.","Recettes (GNF)"].map(h=>(
                        <th key={h} style={{ padding:"10px 14px",textAlign:"left",fontSize:11,fontWeight:700,color:C.textMuted,textTransform:"uppercase",letterSpacing:"0.5px",borderBottom:"1px solid "+C.border }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {servicesStats.map((s,i,arr)=>(
                      <tr key={s.service} style={{ borderBottom:i<arr.length-1?"1px solid #f0f0f0":"none" }}
                        onMouseEnter={e=>e.currentTarget.style.background="#f9fafb"}
                        onMouseLeave={e=>e.currentTarget.style.background="transparent"}>
                        <td style={{ padding:"10px 14px" }}>
                          <div style={{ display:"flex",alignItems:"center",gap:8 }}>
                            <div style={{ width:8,height:8,borderRadius:"50%",background:COULEURS[i%COULEURS.length],flexShrink:0 }}/>
                            <span style={{ fontSize:13,color:C.textPri }}>{s.service}</span>
                          </div>
                        </td>
                        <td style={{ padding:"10px 14px",fontSize:13,color:C.textSec }}>{s.nb}</td>
                        <td style={{ padding:"10px 14px",fontSize:13,fontWeight:600,color:C.textPri }}>{s.recettes.toLocaleString("fr-FR")}</td>
                      </tr>
                    ))}
                    <tr style={{ background:"#f9fafb",borderTop:"2px solid "+C.border }}>
                      <td style={{ padding:"10px 14px" }}><span style={{ fontSize:13,fontWeight:800,color:C.textPri }}>TOTAL</span></td>
                      <td style={{ padding:"10px 14px",fontSize:13,fontWeight:800,color:C.textPri }}>{servicesStats.reduce((s,r)=>s+r.nb,0)}</td>
                      <td style={{ padding:"10px 14px",fontSize:13,fontWeight:800,color:C.green }}>{servicesStats.reduce((s,r)=>s+r.recettes,0).toLocaleString("fr-FR")}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
          }
        </Card>
      </div>

      {/* Répartition patients (donut) + Pathologies (barres SVG) */}
      <div style={{ display:"grid", gridTemplateColumns:"1fr 2fr", gap:16, marginBottom:4 }}>

        {/* Donut sexe */}
        <Card>
          <div style={{ padding:"18px 20px" }}>
            <p style={{ fontSize:14,fontWeight:700,color:C.textPri,marginBottom:2 }}>Répartition des Patients</p>
            <p style={{ fontSize:12,color:C.textMuted,marginBottom:14 }}>Par sexe · total enregistrés</p>
            {(()=>{
              const total=patients.length||1
              const pNA=total-patientsF-patientsM
              const data=[{label:"Femmes",val:patientsF,color:C.green},{label:"Hommes",val:patientsM,color:"#1d4ed8"},{label:"N/A",val:pNA,color:"#9ca3af"}].filter(d=>d.val>0)
              const cx=90,cy=90,R=72,r=48
              let cum=0
              const slices=data.map(d=>{
                const pct=d.val/total,start=cum; cum+=pct
                const a1=(start*2*Math.PI)-Math.PI/2, a2=((start+pct)*2*Math.PI)-Math.PI/2
                const x1=cx+R*Math.cos(a1),y1=cy+R*Math.sin(a1),x2=cx+R*Math.cos(a2),y2=cy+R*Math.sin(a2)
                const xi1=cx+r*Math.cos(a1),yi1=cy+r*Math.sin(a1),xi2=cx+r*Math.cos(a2),yi2=cy+r*Math.sin(a2)
                const large=pct>0.5?1:0
                return {...d,pct,path:`M${xi1},${yi1} L${x1},${y1} A${R},${R} 0 ${large} 1 ${x2},${y2} L${xi2},${yi2} A${r},${r} 0 ${large} 0 ${xi1},${yi1} Z`}
              })
              return (
                <div>
                  <div style={{ display:"flex",justifyContent:"center" }}>
                    <svg width="180" height="180" viewBox="0 0 180 180">
                      {slices.map((s,i)=><path key={i} d={s.path} fill={s.color} stroke="#fff" strokeWidth="2.5"/>)}
                      <text x={cx} y={cy-8}  textAnchor="middle" fontSize="24" fontWeight="800" fill={C.textPri}>{patients.length}</text>
                      <text x={cx} y={cy+12} textAnchor="middle" fontSize="10"  fill={C.textMuted}>patients</text>
                    </svg>
                  </div>
                  <div style={{ display:"flex",flexDirection:"column",gap:7,marginTop:6 }}>
                    {slices.map(s=>(
                      <div key={s.label} style={{ display:"flex",alignItems:"center",gap:8 }}>
                        <div style={{ width:10,height:10,borderRadius:3,background:s.color,flexShrink:0 }}/>
                        <span style={{ fontSize:12,color:C.textSec,flex:1 }}>{s.label}</span>
                        <span style={{ fontSize:13,fontWeight:700,color:C.textPri }}>{s.val}</span>
                        <span style={{ fontSize:11,color:C.textMuted,width:34,textAlign:"right" }}>{Math.round(s.pct*100)}%</span>
                      </div>
                    ))}
                  </div>
                </div>
              )
            })()}
          </div>
        </Card>

        {/* Barres verticales — Pathologies */}
        <Card>
          <div style={{ padding:"18px 20px" }}>
            <div style={{ display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:14 }}>
              <div>
                <p style={{ fontSize:14,fontWeight:700,color:C.textPri,marginBottom:2 }}>Statistiques par Pathologie</p>
                <p style={{ fontSize:12,color:C.textMuted }}>Motifs les plus fréquents · période sélectionnée</p>
              </div>
              <span style={{ background:C.greenSoft,color:C.green,fontSize:11,fontWeight:700,padding:"4px 10px",borderRadius:20 }}>
                Top {Math.min(pathoStats.length,8)}
              </span>
            </div>
            {pathoStats.length===0
              ? <p style={{ color:C.textMuted,textAlign:"center",padding:"48px 0",fontSize:13 }}>Aucune donnée sur cette période</p>
              : (()=>{
                  const top=pathoStats.slice(0,8)
                  const maxV=Math.max(...top.map(p=>p.nb),1)
                  const VW=520,VH=210,PT2=22,PB2=56,PL2=20,PR2=8
                  const iW2=VW-PL2-PR2, iH2=VH-PT2-PB2
                  const n=top.length
                  const barW=Math.min(54,Math.floor((iW2-(n-1)*10)/n))
                  const totalSp=n*barW+(n-1)*10
                  const startX=PL2+(iW2-totalSp)/2
                  return (
                    <svg width="100%" viewBox={`0 0 ${VW} ${VH}`} style={{ overflow:"visible" }}>
                      <defs>
                        {top.map((_,i)=>(
                          <linearGradient key={i} id={`bg${i}`} x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%"   stopColor={COULEURS[i%COULEURS.length]} stopOpacity="1"/>
                            <stop offset="100%" stopColor={COULEURS[i%COULEURS.length]} stopOpacity="0.65"/>
                          </linearGradient>
                        ))}
                      </defs>
                      {/* Grille */}
                      {[0,0.25,0.5,0.75,1].map(t=>{
                        const y=PT2+iH2-(t*iH2)
                        return <g key={t}>
                          <line x1={PL2} y1={y} x2={VW-PR2} y2={y} stroke={t===0?"#d1d5db":"#f0f0f0"} strokeWidth={t===0?1.5:1}/>
                          {t>0&&<text x={PL2-4} y={y+4} textAnchor="end" fontSize="8.5" fill="#9ca3af">{Math.round(t*maxV)}</text>}
                        </g>
                      })}
                      {/* Barres */}
                      {top.map((p,i)=>{
                        const h=Math.max((p.nb/maxV)*iH2,6)
                        const x=startX+i*(barW+10)
                        const y=PT2+iH2-h
                        const lbl=p.nom.length>9?p.nom.slice(0,8)+"…":p.nom
                        return (
                          <g key={p.nom}>
                            <rect x={x} y={y} width={barW} height={h} fill={`url(#bg${i})`} rx="5" ry="5"/>
                            <text x={x+barW/2} y={y-6} textAnchor="middle" fontSize="11" fontWeight="800" fill={COULEURS[i%COULEURS.length]}>{p.nb}</text>
                            <text x={x+barW/2} y={PT2+iH2+16} textAnchor="middle" fontSize="8.5" fill="#6b7280">{lbl}</text>
                            <text x={x+barW/2} y={PT2+iH2+28} textAnchor="middle" fontSize="8" fill="#9ca3af">{Math.round(p.nb/Math.max(...top.map(x=>x.nb),1)*100)}%</text>
                          </g>
                        )
                      })}
                    </svg>
                  )
                })()
            }
          </div>
        </Card>
      </div>
    </div>
  )
}
