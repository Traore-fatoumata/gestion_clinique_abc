import { useAuth } from "../../../hooks/useAuth.jsx"
import { today, C, Card, CardHeader, Avatar, StatutBadge } from "./shared.jsx"

export default function PageAccueil({ consultations, patients, file, setPage }) {
  const { user } = useAuth()
  const todayStr     = today()
  const normalizedFile = Array.isArray(file) ? file : []
  const consultAuj   = consultations.filter(c=>c.date===todayStr)
  const enAttente    = normalizedFile.filter(f => f.statut !== "termine")

  const payeesConsultAuj = new Set(consultAuj.map(c => `${Number(c.patientId)}|${c.date}`))
  const recettesAujConsult = consultAuj.reduce((s,c)=>{
    const matchingFile = normalizedFile.find(f => Number(f.patientId) === Number(c.patientId) && f.dateEntree === c.date)
    const montantFile = Number(matchingFile?.paiementConsultation?.montant ?? matchingFile?.montantConsultation ?? 0)
    const montantConsultation = Number(c.montant || 0)
    return s + (montantConsultation || montantFile)
  }, 0)
  const recettesAujFile = normalizedFile.reduce((s,f)=>{
    if (f.dateEntree !== todayStr) return s
    const key = `${Number(f.patientId)}|${f.dateEntree}`
    const paiementConsult = Number(f.paiementConsultation?.montant ?? 0)
    const paiementExamens = Number(f.paiementExamens?.montantPaye ?? 0)
    return s + (payeesConsultAuj.has(key) ? 0 : paiementConsult) + paiementExamens
  }, 0)
  const recettesAuj  = recettesAujConsult + recettesAujFile
  const recettesTot  = consultations.filter(c=>c.statut==="paye").reduce((s,c)=>s + Number(c.montant || 0), 0)
  const recettesMois = consultations.filter(c=>{ const d=new Date(c.date),n=new Date(); return d.getMonth()===n.getMonth()&&d.getFullYear()===n.getFullYear()&&c.statut==="paye" }).reduce((s,c)=>s + Number(c.montant || 0), 0)
  const recentes     = [...consultations].sort((a,b)=>b.date.localeCompare(a.date)).slice(0,5)

  return (
    <div style={{ maxWidth:960, margin:"0 auto" }}>
      <div style={{ marginBottom:28 }}>
        <p style={{ fontSize:28, fontWeight:800, color:C.textPri, letterSpacing:"-0.5px", marginBottom:4 }}>Tableau de Bord</p>
        <p style={{ fontSize:14, color:C.textSec }}>Bienvenue {user?.nom || "Dr. Doumbouya"} · Médecin chef · Médecine générale</p>
      </div>

      {/* Alerte patients en attente */}
      {enAttente.length>0&&(
        <div style={{ background:C.slateSoft, border:"1.5px solid "+C.slate+"55", borderRadius:14, padding:"16px 20px", marginBottom:24, display:"flex", alignItems:"center", gap:12, cursor:"pointer" }}
          onClick={()=>setPage("consultations")}>
          <div style={{ width:44,height:44,borderRadius:12,background:C.slate,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0 }}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.2" strokeLinecap="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
          </div>
          <div style={{ flex:1 }}>
            <p style={{ fontSize:15, fontWeight:700, color:C.slate, marginBottom:2 }}>
              {enAttente.length} patient{enAttente.length>1?"s":""} en attente — consultation d'accueil requise
            </p>
            <p style={{ fontSize:13, color:"#92400e" }}>Cliquez pour voir les patients — seuls ceux ayant payé à la comptabilité peuvent être reçus</p>
          </div>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={C.slate} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"/></svg>
        </div>
      )}

      {/* KPIs */}
      <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:16, marginBottom:24 }}>
        {[
          { label:"Patients total",        val:patients.length,                              fg:C.blue,   bg:C.blueSoft,   svg:<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg> },
          { label:"Consultations du jour", val:consultAuj.length,                            fg:C.green,  bg:C.greenSoft,  svg:<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg> },
          { label:"En attente",            val:enAttente.length,                             fg:C.slate,  bg:C.slateSoft,  svg:<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg> },
          { label:"Recettes du mois (GNF)",val:(recettesMois/1000).toFixed(0)+"K",          fg:C.purple, bg:C.purpleSoft, svg:<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg> },
        ].map(({label,val,bg,svg})=>(
          <Card key={label} style={{ padding:"20px" }}>
            <div style={{ width:42,height:42,borderRadius:10,background:bg,display:"flex",alignItems:"center",justifyContent:"center",marginBottom:12,color:C.textPri }}>{svg}</div>
            <p style={{ fontSize:28,fontWeight:800,color:C.textPri,lineHeight:1,marginBottom:4 }}>{val}</p>
            <p style={{ fontSize:12,color:C.textMuted }}>{label}</p>
          </Card>
        ))}
      </div>

      <div style={{ display:"grid", gridTemplateColumns:"1.2fr 1fr", gap:20, marginBottom:20 }}>
        {/* Consultations récentes */}
        <Card>
          <CardHeader title="Consultations récentes" action={<button onClick={()=>setPage("consultations")} style={{ background:"none",border:"none",color:C.blue,fontSize:13,cursor:"pointer",fontWeight:600 }}>Tout voir</button>}/>
          <div style={{ padding:"0 20px" }}>
            {recentes.map((c,i)=>{
              const p=patients.find(pt=>pt.id===c.patientId)
              if(!p) return null
              return (
                <div key={`${c.id || c.patientId}-${i}`} style={{ display:"flex",alignItems:"center",gap:12,padding:"13px 0",borderBottom:i<recentes.length-1?"1px solid "+C.border:"none" }}>
                  <Avatar name={p.nom} size={36}/>
                  <div style={{ flex:1 }}>
                    <p style={{ fontSize:13,fontWeight:600,color:C.textPri,marginBottom:2 }}>{p.nom}</p>
                    <p style={{ fontSize:11,color:C.textSec }}>{c.plaintes||c.motif||"—"}</p>
                    <p style={{ fontSize:11,color:C.textMuted }}>{c.date} · <span style={{ color:C.textPri,fontWeight:600 }}>{c.service}</span></p>
                  </div>
                  <StatutBadge statut={c.statut}/>
                </div>
              )
            })}
          </div>
        </Card>

        {/* Statistiques financières */}
        <Card>
          <CardHeader title="Statistiques financières"/>
          <div style={{ padding:"16px 20px", display:"flex", flexDirection:"column", gap:12 }}>
            <div style={{ background:C.greenSoft,borderRadius:12,padding:"16px 18px",display:"flex",justifyContent:"space-between",alignItems:"center" }}>
              <div>
                <p style={{ fontSize:12,color:C.textSec,marginBottom:4 }}>Recettes aujourd'hui</p>
                <p style={{ fontSize:20,fontWeight:800,color:C.textPri }}>{recettesAuj.toLocaleString("fr-FR")} GNF</p>
              </div>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={C.green} strokeWidth="2" strokeLinecap="round"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/></svg>
            </div>
            <div style={{ background:C.blueSoft,borderRadius:12,padding:"16px 18px",display:"flex",justifyContent:"space-between",alignItems:"center" }}>
              <div>
                <p style={{ fontSize:12,color:C.textSec,marginBottom:4 }}>Recettes totales</p>
                <p style={{ fontSize:20,fontWeight:800,color:C.textPri }}>{recettesTot.toLocaleString("fr-FR")} GNF</p>
              </div>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={C.blue} strokeWidth="2" strokeLinecap="round"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
            </div>
            <div style={{ background:C.purpleSoft,borderRadius:12,padding:"16px 18px",display:"flex",justifyContent:"space-between",alignItems:"center" }}>
              <div>
                <p style={{ fontSize:12,color:C.textSec,marginBottom:4 }}>Ce mois</p>
                <p style={{ fontSize:20,fontWeight:800,color:C.textPri }}>{recettesMois.toLocaleString("fr-FR")} GNF</p>
              </div>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={C.purple} strokeWidth="2" strokeLinecap="round"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>
            </div>
          </div>
        </Card>
      </div>

      <p style={{ textAlign:"center", fontSize:12, color:C.textMuted }}>© 2026 Clinique ABC Marouane. Tous droits réservés.</p>
    </div>
  )
}
