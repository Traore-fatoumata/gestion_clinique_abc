import { useState } from "react"
import { C, Card, CardHeader, Avatar } from "./shared.jsx"

export default function PagePresence({ medecins }) {
  const [presences] = useState([
    { id:1,  docteurId:1,  arrivee:"07:30", depart:null,    statut:"present",   patientsVus:4 },
    { id:2,  docteurId:2,  arrivee:"08:00", depart:null,    statut:"present",   patientsVus:3 },
    { id:3,  docteurId:3,  arrivee:"08:15", depart:null,    statut:"present",   patientsVus:2 },
    { id:4,  docteurId:4,  arrivee:null,    depart:null,    statut:"absent",    patientsVus:0 },
    { id:5,  docteurId:5,  arrivee:null,    depart:null,    statut:"en_retard", patientsVus:0 },
    { id:6,  docteurId:6,  arrivee:"07:55", depart:null,    statut:"present",   patientsVus:5 },
    { id:7,  docteurId:7,  arrivee:"08:30", depart:null,    statut:"present",   patientsVus:1 },
    { id:8,  docteurId:8,  arrivee:null,    depart:null,    statut:"absent",    patientsVus:0 },
    { id:9,  docteurId:9,  arrivee:"08:05", depart:null,    statut:"present",   patientsVus:2 },
    { id:10, docteurId:10, arrivee:"08:45", depart:null,    statut:"present",   patientsVus:1 },
    { id:11, docteurId:11, arrivee:null,    depart:null,    statut:"en_retard", patientsVus:0 },
    { id:12, docteurId:12, arrivee:"07:45", depart:null,    statut:"present",   patientsVus:0 },
    { id:13, docteurId:13, arrivee:"08:10", depart:null,    statut:"present",   patientsVus:0 },
  ])
  const cfgS = { present:{label:"Présent",color:C.green,bg:C.greenSoft}, absent:{label:"Absent",color:C.red,bg:C.redSoft}, en_retard:{label:"En retard",color:C.slate,bg:C.slateSoft}, parti:{label:"Parti",color:C.slate,bg:C.slateSoft} }
  return (
    <div style={{ maxWidth:960, margin:"0 auto" }}>
      <p style={{ fontSize:22,fontWeight:800,color:C.textPri,marginBottom:6 }}>Suivi Présence</p>
      <p style={{ fontSize:14,color:C.textSec,marginBottom:24 }}>Personnel médical — {new Date().toLocaleDateString("fr-FR",{weekday:"long",day:"numeric",month:"long"})}</p>
      <div style={{ display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:14,marginBottom:24 }}>
        {[
          {label:"Présents",   val:presences.filter(p=>p.statut==="present").length,   bg:C.greenSoft, fg:C.green, svg:<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><polyline points="20 6 9 17 4 12"/></svg>},
          {label:"Absents",    val:presences.filter(p=>p.statut==="absent").length,    bg:C.redSoft,   fg:C.red,   svg:<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>},
          {label:"En retard",  val:presences.filter(p=>p.statut==="en_retard").length, bg:C.slateSoft, fg:C.slate, svg:<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>},
          {label:"Partis",     val:presences.filter(p=>p.statut==="parti").length,     bg:C.slateSoft, fg:C.slate, svg:<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>},
        ].map(({label,val,bg,svg})=>(
          <Card key={label} style={{ padding:"18px 20px",display:"flex",alignItems:"center",gap:14 }}>
            <div style={{ width:40,height:40,borderRadius:10,background:bg,display:"flex",alignItems:"center",justifyContent:"center",color:C.textPri }}>{svg}</div>
            <div><p style={{ fontSize:24,fontWeight:800,color:C.textPri,letterSpacing:"-1px" }}>{val}</p><p style={{ fontSize:12,color:C.textMuted }}>{label}</p></div>
          </Card>
        ))}
      </div>
      <Card>
        <CardHeader title={"Présences du jour — "+new Date().toLocaleDateString("fr-FR")}/>
        <table style={{ width:"100%",borderCollapse:"collapse" }}>
          <thead><tr style={{ background:C.slateSoft }}>{["Médecin","Spécialité","Arrivée","Départ","Patients vus","Statut"].map(h=>(<th key={h} style={{ padding:"11px 14px",textAlign:"left",fontSize:11,fontWeight:700,color:C.textSec,letterSpacing:"0.05em",textTransform:"uppercase" }}>{h}</th>))}</tr></thead>
          <tbody>
            {presences.map((p,i,arr)=>{
              const d=medecins.find(m=>m.id===p.docteurId); if(!d) return null
              const s=cfgS[p.statut]||cfgS.absent
              return (
                <tr key={p.id} style={{ borderBottom:i<arr.length-1?"1px solid "+C.border:"none" }}
                  onMouseEnter={e=>e.currentTarget.style.background=C.slateSoft}
                  onMouseLeave={e=>e.currentTarget.style.background="transparent"}>
                  <td style={{ padding:"13px 14px" }}><div style={{ display:"flex",alignItems:"center",gap:10 }}><Avatar name={d.nom} size={32}/><div><p style={{ fontSize:13,fontWeight:600,color:C.textPri }}>{d.nom}</p>{d.estChef&&<span style={{ fontSize:10,color:C.slate,fontWeight:700 }}>Chef</span>}</div></div></td>
                  <td style={{ padding:"13px 14px",fontSize:12,color:C.textPri,fontWeight:500 }}>{d.specialite}</td>
                  <td style={{ padding:"13px 14px",fontSize:13,fontWeight:700,color:p.arrivee?C.green:C.textMuted,fontVariantNumeric:"tabular-nums" }}>{p.arrivee||"—"}</td>
                  <td style={{ padding:"13px 14px",fontSize:13,fontWeight:700,color:p.depart?C.red:C.textMuted,fontVariantNumeric:"tabular-nums" }}>{p.depart||"En service"}</td>
                  <td style={{ padding:"13px 14px",textAlign:"center" }}><span style={{ background:C.blueSoft,color:C.blue,fontWeight:700,fontSize:13,borderRadius:20,padding:"4px 12px" }}>{p.patientsVus}</span></td>
                  <td style={{ padding:"13px 14px" }}><span style={{ display:"inline-flex",alignItems:"center",gap:5,background:s.bg,color:s.color,fontSize:12,fontWeight:600,padding:"4px 12px",borderRadius:20,border:"1px solid "+s.color+"33" }}>{s.label}</span></td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </Card>
    </div>
  )
}
