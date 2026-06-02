import { useState } from "react"
import { C, Card, Avatar, StatutBadge, RoleBadge, Overlay, Btn, FInput, Inp, Sel, SERVICES, ROLES_LABEL, today, fmt } from "./shared.jsx"

// ── Modal pour modifier un médecin ──────
function ModalModifierMedecin({ medecin, onClose, onSave }) {
  const [form, setForm] = useState({
    nom: medecin.nom.replace("Dr. ", ""),
    prenom: medecin.prenom || "",
    specialite: medecin.specialite,
    email: medecin.email,
    telephone: medecin.telephone,
  })
  const f = (k, v) => setForm(p => ({ ...p, [k]: v }))
  const ok = form.nom && form.email && form.telephone

  const handleSave = () => {
    if (!ok) return
    onSave({
      ...medecin,
      nom: form.nom.startsWith("Dr. ") ? form.nom : `Dr. ${form.nom}`,
      prenom: form.prenom,
      specialite: form.specialite,
      email: form.email,
      telephone: form.telephone,
    })
    onClose()
  }

  return (
    <Overlay onClose={onClose}>
      <div style={{ background: C.white, borderRadius: 20, width: "100%", maxWidth: 560, maxHeight: "90vh", overflow: "auto", boxShadow: "0 25px 60px rgba(0,0,0,0.2)" }}>
        <div style={{ padding: "22px 28px 18px", borderBottom: "1px solid " + C.border, display: "flex", justifyContent: "space-between" }}>
          <div><p style={{ fontSize: 18, fontWeight: 800, color: C.textPri }}>Modifier le médecin</p><p style={{ fontSize: 13, color: C.textSec, marginTop: 3 }}>Modifier les informations du médecin</p></div>
          <button onClick={onClose} style={{ background: C.slateSoft, border: "none", borderRadius: 8, color: C.textSec, cursor: "pointer", width: 32, height: 32, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18 }}>×</button>
        </div>
        <div style={{ padding: "24px 28px", display: "flex", flexDirection: "column", gap: 14 }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
            <FInput label="Nom" req><Inp value={form.nom} onChange={e => f("nom", e.target.value)} placeholder="Ex : Camara" /></FInput>
            <FInput label="Prénom"><Inp value={form.prenom} onChange={e => f("prenom", e.target.value)} placeholder="Ex : Ibrahima" /></FInput>
          </div>
          <FInput label="Spécialité" req><Sel value={form.specialite} onChange={e => f("specialite", e.target.value)}>{SERVICES.map(s => <option key={s}>{s}</option>)}</Sel></FInput>
          <FInput label="Email" req><Inp type="email" value={form.email} onChange={e => f("email", e.target.value)} placeholder="prenom.nom@cab.gn" /></FInput>
          <FInput label="Téléphone" req><Inp value={form.telephone} onChange={e => f("telephone", e.target.value)} placeholder="+224 6XX XX XX XX" /></FInput>
          <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, paddingTop: 8, borderTop: "1px solid " + C.border }}>
            <Btn onClick={onClose} variant="secondary">Annuler</Btn>
            <Btn onClick={handleSave} disabled={!ok}>Enregistrer</Btn>
          </div>
        </div>
      </div>
    </Overlay>
  )
}

// ── Modal pour modifier son propre profil (médecin chef) ──────
function ModalMonProfil({ user, onClose, onSave }) {
  const [form, setForm] = useState({
    nom: user?.nom || "",
    email: user?.email || "",
    telephone: user?.telephone || "",
    ancienMotDePasse: "",
    nouveauMotDePasse: "",
    confirmerMotDePasse: "",
  })
  const f = (k, v) => setForm(p => ({ ...p, [k]: v }))
  const ok = form.nom && form.email
  const motDePasseOk = !form.nouveauMotDePasse || (form.ancienMotDePasse && form.nouveauMotDePasse.length >= 6 && form.nouveauMotDePasse === form.confirmerMotDePasse)

  const handleSave = () => {
    if (!ok || !motDePasseOk) return
    onSave({
      ...user,
      nom: form.nom,
      email: form.email,
      telephone: form.telephone,
      // Le mot de passe sera géré séparément
      changerMotDePasse: form.nouveauMotDePasse ? {
        ancien: form.ancienMotDePasse,
        nouveau: form.nouveauMotDePasse,
      } : null,
    })
    onClose()
  }

  return (
    <Overlay onClose={onClose}>
      <div style={{ background: C.white, borderRadius: 20, width: "100%", maxWidth: 560, maxHeight: "90vh", overflow: "auto", boxShadow: "0 25px 60px rgba(0,0,0,0.2)" }}>
        <div style={{ padding: "22px 28px 18px", borderBottom: "1px solid " + C.border, display: "flex", justifyContent: "space-between" }}>
          <div><p style={{ fontSize: 18, fontWeight: 800, color: C.textPri }}>Mon Profil</p><p style={{ fontSize: 13, color: C.textSec, marginTop: 3 }}>Médecin chef — Modifier vos informations</p></div>
          <button onClick={onClose} style={{ background: C.slateSoft, border: "none", borderRadius: 8, color: C.textSec, cursor: "pointer", width: 32, height: 32, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18 }}>×</button>
        </div>
        <div style={{ padding: "24px 28px", display: "flex", flexDirection: "column", gap: 14 }}>
          <FInput label="Nom complet" req><Inp value={form.nom} onChange={e => f("nom", e.target.value)} placeholder="Ex : Dr. Doumbouya" /></FInput>
          <FInput label="Email" req><Inp type="email" value={form.email} onChange={e => f("email", e.target.value)} placeholder="email@cab.gn" /></FInput>
          <FInput label="Téléphone"><Inp value={form.telephone} onChange={e => f("telephone", e.target.value)} placeholder="+224 6XX XX XX XX" /></FInput>
          
          <div style={{ marginTop: 8 }}>
            <p style={{ fontSize: 14, fontWeight: 700, color: C.textPri, marginBottom: 12 }}>Changer le mot de passe</p>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              <FInput label="Ancien mot de passe"><Inp type="password" value={form.ancienMotDePasse} onChange={e => f("ancienMotDePasse", e.target.value)} placeholder="••••••••" /></FInput>
              <FInput label="Nouveau mot de passe"><Inp type="password" value={form.nouveauMotDePasse} onChange={e => f("nouveauMotDePasse", e.target.value)} placeholder="Min. 6 caractères" /></FInput>
              <FInput label="Confirmer le mot de passe"><Inp type="password" value={form.confirmerMotDePasse} onChange={e => f("confirmerMotDePasse", e.target.value)} placeholder="••••••••" /></FInput>
              {form.nouveauMotDePasse && form.nouveauMotDePasse !== form.confirmerMotDePasse && (
                <p style={{ fontSize: 11, color: C.red }}>Les mots de passe ne correspondent pas</p>
              )}
            </div>
          </div>

          <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, paddingTop: 8, borderTop: "1px solid " + C.border }}>
            <Btn onClick={onClose} variant="secondary">Annuler</Btn>
            <Btn onClick={handleSave} disabled={!ok || !motDePasseOk}>Enregistrer</Btn>
          </div>
        </div>
      </div>
    </Overlay>
  )
}

function ModalCreerMedecin({ onClose, onCreer }) {
  const [form,setForm]=useState({ nom:"",prenom:"",specialite:SERVICES[6],email:"",telephone:"",motDePasse:"" })
  const f=(k,v)=>setForm(p=>({...p,[k]:v}))
  const ok=form.nom&&form.prenom&&form.email&&form.motDePasse&&form.telephone
  return (
    <Overlay onClose={onClose}>
      <div style={{ background:C.white, borderRadius:20, width:"100%", maxWidth:560, maxHeight:"90vh", overflow:"auto", boxShadow:"0 25px 60px rgba(0,0,0,0.2)" }}>
        <div style={{ padding:"22px 28px 18px", borderBottom:"1px solid "+C.border, display:"flex", justifyContent:"space-between" }}>
          <div><p style={{ fontSize:18, fontWeight:800, color:C.textPri }}>Créer un compte médecin</p><p style={{ fontSize:13, color:C.textSec, marginTop:3 }}>Le médecin recevra ses identifiants par email</p></div>
          <button onClick={onClose} style={{ background:C.slateSoft, border:"none", borderRadius:8, color:C.textSec, cursor:"pointer", width:32, height:32, display:"flex", alignItems:"center", justifyContent:"center", fontSize:18 }}>×</button>
        </div>
        <div style={{ padding:"24px 28px", display:"flex", flexDirection:"column", gap:14 }}>
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:14 }}>
            <FInput label="Nom" req><Inp value={form.nom} onChange={e=>f("nom",e.target.value)} placeholder="Ex : Camara"/></FInput>
            <FInput label="Prénom" req><Inp value={form.prenom} onChange={e=>f("prenom",e.target.value)} placeholder="Ex : Ibrahima"/></FInput>
          </div>
          <FInput label="Spécialité" req><Sel value={form.specialite} onChange={e=>f("specialite",e.target.value)}>{SERVICES.map(s=><option key={s}>{s}</option>)}</Sel></FInput>
          <FInput label="Email" req><Inp type="email" value={form.email} onChange={e=>f("email",e.target.value)} placeholder="prenom.nom@cab.gn"/></FInput>
          <FInput label="Téléphone" req><Inp value={form.telephone} onChange={e=>f("telephone",e.target.value)} placeholder="+224 6XX XX XX XX"/></FInput>
          <FInput label="Mot de passe provisoire" req><Inp type="password" value={form.motDePasse} onChange={e=>f("motDePasse",e.target.value)} placeholder="Min. 8 caractères"/></FInput>
          <div style={{ background:C.blueSoft, border:"1px solid "+C.blue+"33", borderRadius:10, padding:"12px 16px" }}>
            <p style={{ fontSize:13, color:C.textPri }}>ℹ️ Le médecin devra changer son mot de passe dès la première connexion.</p>
          </div>
          <div style={{ display:"flex", justifyContent:"flex-end", gap:10, paddingTop:8, borderTop:"1px solid "+C.border }}>
            <Btn onClick={onClose} variant="outline">Annuler</Btn>
            <Btn onClick={()=>{ if(ok){ onCreer(form); onClose() } }} disabled={!ok}>Créer le compte</Btn>
          </div>
        </div>
      </div>
    </Overlay>
  )
}

function ModalCreerCompte({ onClose, onCreer }) {
  const [form,setForm]=useState({ nom:"",email:"",role:"secretaire",motDePasse:"" })
  const f=(k,v)=>setForm(p=>({...p,[k]:v}))
  const roles=["secretaire","medecin","infirmier","pharmacien","laborantin"]
  const ok=form.nom&&form.email&&form.motDePasse
  return (
    <Overlay onClose={onClose}>
      <div style={{ background:C.white, borderRadius:20, width:"100%", maxWidth:480, maxHeight:"90vh", overflow:"auto", boxShadow:"0 25px 60px rgba(0,0,0,0.2)" }}>
        <div style={{ padding:"22px 28px 18px", borderBottom:"1px solid "+C.border, display:"flex", justifyContent:"space-between" }}>
          <div><p style={{ fontSize:18, fontWeight:800, color:C.textPri }}>Créer un compte utilisateur</p><p style={{ fontSize:13, color:C.textSec, marginTop:3 }}>Seul le médecin chef peut créer des comptes</p></div>
          <button onClick={onClose} style={{ background:C.slateSoft, border:"none", borderRadius:8, color:C.textSec, cursor:"pointer", width:32, height:32, display:"flex", alignItems:"center", justifyContent:"center", fontSize:18 }}>×</button>
        </div>
        <div style={{ padding:"24px 28px", display:"flex", flexDirection:"column", gap:14 }}>
          <FInput label="Nom complet" req><Inp value={form.nom} onChange={e=>f("nom",e.target.value)} placeholder="Ex : Mariama Diallo"/></FInput>
          <FInput label="Email" req><Inp type="email" value={form.email} onChange={e=>f("email",e.target.value)} placeholder="utilisateur@cab.gn"/></FInput>
          <FInput label="Rôle" req><Sel value={form.role} onChange={e=>f("role",e.target.value)}>{roles.map(r=><option key={r} value={r}>{ROLES_LABEL[r]}</option>)}</Sel></FInput>
          <FInput label="Mot de passe provisoire" req><Inp type="password" value={form.motDePasse} onChange={e=>f("motDePasse",e.target.value)} placeholder="Min. 8 caractères"/></FInput>
          <div style={{ display:"flex", justifyContent:"flex-end", gap:10, paddingTop:8, borderTop:"1px solid "+C.border }}>
            <Btn onClick={onClose} variant="outline">Annuler</Btn>
            <Btn onClick={()=>{ if(ok){ onCreer(form); onClose() } }} disabled={!ok}>Créer</Btn>
          </div>
        </div>
      </div>
    </Overlay>
  )
}

export default function PageComptes({ comptes, setComptes, medecins, setMedecins, user }) {
  const [tab,              setTab]              = useState("medecins")
  const [showMedecin,      setShowMedecin]      = useState(false)
  const [showCompte,       setShowCompte]       = useState(false)
  const [medecinToEdit,    setMedecinToEdit]    = useState(null)
  const [showMonProfil,    setShowMonProfil]    = useState(false)

  const toggleM = id => setMedecins(prev=>prev.map(d=>d.id===id?{...d,statut:d.statut==="actif"?"bloque":"actif"}:d))
  const toggleC = id => setComptes(prev=>prev.map(c=>c.id===id?{...c,statut:c.statut==="actif"?"bloque":"actif"}:c))
  const creerMedecin = form => setMedecins(prev=>[...prev,{ id:prev.length+1, nom:"Dr. "+form.nom, prenom:form.prenom, specialite:form.specialite, email:form.email, telephone:form.telephone, estChef:false, statut:"actif", creeLe:today() }])
  const creerCompte  = form => setComptes(prev=>[...prev,{ id:prev.length+1, nom:form.nom, role:form.role, email:form.email, statut:"actif", creeLe:today(), dernConn:"Jamais" }])
  const modifierMedecin = (medecinModifie) => {
    setMedecins(prev=>prev.map(d=>d.id===medecinModifie.id ? medecinModifie : d))
    alert("Médecin modifié avec succès !")
  }
  const modifierMonProfil = (data) => {
    // Simulation de la modification du profil
    if (data.changerMotDePasse) {
      alert("Profil et mot de passe mis à jour !")
    } else {
      alert("Profil mis à jour !")
    }
  }

  return (
    <div style={{ maxWidth:960, margin:"0 auto" }}>
      {showMedecin && <ModalCreerMedecin onClose={()=>setShowMedecin(false)} onCreer={creerMedecin}/>}
      {showCompte && <ModalCreerCompte onClose={()=>setShowCompte(false)} onCreer={creerCompte}/>}
      {medecinToEdit && <ModalModifierMedecin medecin={medecinToEdit} onClose={()=>setMedecinToEdit(null)} onSave={modifierMedecin}/>}
      {showMonProfil && <ModalMonProfil user={user} onClose={()=>setShowMonProfil(false)} onSave={modifierMonProfil}/>}
      <div style={{ display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:24 }}>
        <div><p style={{ fontSize:22,fontWeight:800,color:C.textPri }}>Gestion Personnel</p><p style={{ fontSize:14,color:C.textSec }}>Gérer les comptes du personnel médical</p></div>
        <div style={{ display:"flex",gap:10 }}>
          <Btn onClick={()=>setShowMedecin(true)} variant="success" small>+ Nouveau médecin</Btn>
          <Btn onClick={()=>setShowCompte(true)} small>+ Autre compte</Btn>
        </div>
      </div>
      <div style={{ display:"flex",borderBottom:"1px solid "+C.border,marginBottom:20 }}>
        {[{id:"medecins",l:"Médecins ("+medecins.length+")"},{id:"autres",l:"Autres utilisateurs ("+comptes.length+")"}].map(t=>(
          <button key={t.id} onClick={()=>setTab(t.id)}
            style={{ padding:"12px 24px",border:"none",background:"none",cursor:"pointer",fontSize:14,fontWeight:tab===t.id?700:500,color:tab===t.id?C.blue:C.textSec,borderBottom:tab===t.id?"2px solid "+C.blue:"2px solid transparent",fontFamily:"inherit" }}>{t.l}</button>
        ))}
      </div>
      {tab==="medecins"&&(
        <Card>
          <table style={{ width:"100%",borderCollapse:"collapse" }}>
            <thead><tr style={{ background:C.slateSoft }}>{["Médecin","Spécialité","Email","Téléphone","Depuis","Statut","Action"].map(h=>(<th key={h} style={{ padding:"12px 14px",textAlign:"left",fontSize:11,fontWeight:700,color:C.textSec,letterSpacing:"0.05em",textTransform:"uppercase" }}>{h}</th>))}</tr></thead>
            <tbody>
              {medecins.map((d,i)=>(
                <tr key={d.id} style={{ borderBottom:i<medecins.length-1?"1px solid "+C.border:"none",opacity:d.statut==="bloque"?.6:1 }}
                  onMouseEnter={e=>e.currentTarget.style.background=C.slateSoft}
                  onMouseLeave={e=>e.currentTarget.style.background="transparent"}>
                  <td style={{ padding:"13px 14px" }}>
                    <div style={{ display:"flex",alignItems:"center",gap:10 }}>
                      <Avatar name={d.nom} size={34}/>
                      <div>
                        <div style={{ display:"flex",alignItems:"center",gap:6 }}>
                          <p style={{ fontSize:13,fontWeight:700,color:C.textPri }}>{d.nom}</p>
                          {d.estChef&&<span style={{ fontSize:10,background:C.slateSoft,color:C.slate,padding:"2px 7px",borderRadius:10,fontWeight:700 }}>CHEF</span>}
                        </div>
                        <p style={{ fontSize:11,color:C.textMuted }}>{d.prenom}</p>
                      </div>
                    </div>
                  </td>
                  <td style={{ padding:"13px 14px",fontSize:13,color:C.textPri,fontWeight:500 }}>{d.specialite}</td>
                  <td style={{ padding:"13px 14px",fontSize:12,color:C.textSec }}>{d.email}</td>
                  <td style={{ padding:"13px 14px",fontSize:12,color:C.textSec }}>{d.telephone}</td>
                  <td style={{ padding:"13px 14px",fontSize:12,color:C.textMuted }}>{fmt(d.creeLe)}</td>
                  <td style={{ padding:"13px 14px" }}><StatutBadge statut={d.statut}/></td>
                  <td style={{ padding:"13px 14px" }}>
                    <div style={{ display:"flex", gap:6, flexDirection: d.estChef ? "row" : "column" }}>
                      <button onClick={()=>setMedecinToEdit(d)}
                        style={{ padding:"6px 14px",borderRadius:8,border:"1px solid "+C.blue,background:"transparent",color:C.blue,fontSize:12,fontWeight:600,cursor:"pointer",fontFamily:"inherit", whiteSpace:"nowrap" }}>
                        ✏️ Modifier
                      </button>
                      {!d.estChef && <button onClick={()=>toggleM(d.id)}
                        style={{ padding:"6px 14px",borderRadius:8,border:"1px solid "+(d.statut==="actif"?C.red:C.green),background:"transparent",color:d.statut==="actif"?C.red:C.green,fontSize:12,fontWeight:600,cursor:"pointer",fontFamily:"inherit" }}>
                        {d.statut==="actif"?"Bloquer":"Débloquer"}
                      </button>}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      )}
      {tab==="autres"&&(
        <Card>
          <table style={{ width:"100%",borderCollapse:"collapse" }}>
            <thead><tr style={{ background:C.slateSoft }}>{["Utilisateur","Rôle","Email","Créé le","Dernière connexion","Statut","Action"].map(h=>(<th key={h} style={{ padding:"12px 14px",textAlign:"left",fontSize:11,fontWeight:700,color:C.textSec,letterSpacing:"0.05em",textTransform:"uppercase" }}>{h}</th>))}</tr></thead>
            <tbody>
              {comptes.map((c,i)=>(
                <tr key={c.id} style={{ borderBottom:i<comptes.length-1?"1px solid "+C.border:"none",opacity:c.statut==="bloque"?.6:1 }}
                  onMouseEnter={e=>e.currentTarget.style.background=C.slateSoft}
                  onMouseLeave={e=>e.currentTarget.style.background="transparent"}>
                  <td style={{ padding:"13px 14px" }}><div style={{ display:"flex",alignItems:"center",gap:10 }}><Avatar name={c.nom} size={32}/><p style={{ fontSize:13,fontWeight:600,color:C.textPri }}>{c.nom}</p></div></td>
                  <td style={{ padding:"13px 14px" }}><RoleBadge role={c.role}/></td>
                  <td style={{ padding:"13px 14px",fontSize:12,color:C.textSec }}>{c.email}</td>
                  <td style={{ padding:"13px 14px",fontSize:12,color:C.textMuted }}>{fmt(c.creeLe)}</td>
                  <td style={{ padding:"13px 14px",fontSize:12,color:C.textMuted }}>{c.dernConn}</td>
                  <td style={{ padding:"13px 14px" }}><StatutBadge statut={c.statut}/></td>
                  <td style={{ padding:"13px 14px" }}>
                    <button onClick={()=>toggleC(c.id)}
                      style={{ padding:"6px 14px",borderRadius:8,border:"1px solid "+(c.statut==="actif"?C.red:C.green),background:"transparent",color:c.statut==="actif"?C.red:C.green,fontSize:12,fontWeight:600,cursor:"pointer",fontFamily:"inherit" }}>
                      {c.statut==="actif"?"Bloquer":"Débloquer"}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      )}
    </div>
  )
}
