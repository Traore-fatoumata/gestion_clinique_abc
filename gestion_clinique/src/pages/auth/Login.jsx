import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import logo from "../../assets/images/logo.jpeg"
import { useAuth } from "../../hooks/useAuth"

export default function Login() {
  const [email, setEmail]           = useState("")
  const [motDePasse, setMotDePasse] = useState("")
  const [chargement, setChargement] = useState(false)
  const [erreur, setErreur]         = useState("")
  const [voir, setVoir]             = useState(false)
  const navigate                    = useNavigate()
  const { login, user }             = useAuth()

  useEffect(() => {
    if (user) {
      navigate(user.route || "/", { replace: true })
    }
  }, [user, navigate])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setErreur("")
    if (!email || !motDePasse) {
      setErreur("Veuillez remplir tous les champs.")
      return
    }

    setChargement(true)
    const result = await login(email, motDePasse)
    setChargement(false)

    if (!result.success) {
      setErreur(result.error)
      return
    }

    navigate(result.route, { replace: true })
  }

  const onFocus = e => { e.target.style.borderColor="#16a34a"; e.target.style.boxShadow="0 0 0 3px rgba(22,163,74,0.15)" }
  const onBlur  = e => { e.target.style.borderColor="#e2e8e2"; e.target.style.boxShadow="none" }

  const COMPTES = [
    { groupe:"Personnel", items:[
      { titre:"Secrétaire",      email:"secretaire@clinique.com"   },
      { titre:"Médecin Chef",    email:"chef@clinique.com"         },
      { titre:"Comptable",       email:"comptable@clinique.com"    },
      { titre:"Laboratoire",     email:"labo@clinique.com"         },
      { titre:"Infirmier(e)",    email:"infirmier@clinique.com"    },
    ]},
    { groupe:"Médecins", items:[
      { titre:"Dr. Camara — Cardiologie",            email:"medecin@clinique.com"        },
      { titre:"Dr. Barry — Diabétologie",            email:"generaliste@clinique.com"    },
      { titre:"Dr. Souaré — Pédiatrie",              email:"pediatre@clinique.com"       },
      { titre:"Dr. Keïta — Gynécologie",             email:"gynecologue@clinique.com"    },
      { titre:"Dr. Bah — Ophtalmologie",             email:"ophtalmologue@clinique.com"  },
      { titre:"Dr. Diallo — Traumatologie",          email:"traumatologue@clinique.com"  },
      { titre:"Dr. Konaté — Neurologie",             email:"neurologue@clinique.com"     },
      { titre:"Dr. Traoré — ORL",                    email:"orl@clinique.com"            },
      { titre:"Dr. Baldé — Urologie",                email:"urologue@clinique.com"       },
      { titre:"Dr. Condé — Chirurgie",               email:"chirurgien@clinique.com"     },
      { titre:"Dr. Soumah — Dermatologie",           email:"dermatologue@clinique.com"   },
      { titre:"Dr. Cissé — Oncologie",               email:"oncologue@clinique.com"      },
      { titre:"Dr. Bangoura — Maladies infectieuses",email:"infectiologue@clinique.com"  },
      { titre:"Dr. Fofana — Stomatologie",           email:"stomatologue@clinique.com"   },
    ]},
  ]

  const IST = {
    width:"100%", padding:"13px 14px 13px 44px", fontSize:"14px",
    border:"1.5px solid #e2e8e2", borderRadius:"10px",
    background:"#ffffff", color:"#111", outline:"none", fontFamily:"inherit",
    transition:"border-color 0.15s, box-shadow 0.15s",
  }

  return (
    <div style={{ minHeight:"100vh", display:"flex", fontFamily:"'Segoe UI',system-ui,sans-serif" }}>

      {/* ── PANNEAU GAUCHE ── */}
      <div style={{
        width:"48%", position:"relative", overflow:"hidden",
        background:"linear-gradient(150deg,#14532d 0%,#15803d 50%,#16a34a 100%)",
        display:"flex", flexDirection:"column", justifyContent:"space-between",
        padding:"52px 56px",
      }}>
        {/* motif discret */}
        <svg style={{ position:"absolute",inset:0,width:"100%",height:"100%",opacity:0.05,pointerEvents:"none" }} viewBox="0 0 500 800" preserveAspectRatio="xMidYMid slice">
          <circle cx="400" cy="100" r="220" fill="#fff"/>
          <circle cx="50"  cy="700" r="180" fill="#fff"/>
        </svg>

        {/* contenu centré : logo + nom + slogan */}
        <div style={{ position:"relative", zIndex:2, flex:1, display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", gap:28 }}>

          {/* logo en grand */}
          <div style={{ width:200, height:200, borderRadius:24, background:"#ffffff", padding:10, boxShadow:"0 8px 40px rgba(0,0,0,0.35)", display:"flex", alignItems:"center", justifyContent:"center" }}>
            <img src={logo} alt="Logo Clinique" style={{ width:"100%", height:"100%", borderRadius:16, objectFit:"contain", display:"block" }}/>
          </div>

          {/* nom + adresse */}
          <div style={{ textAlign:"center" }}>
            <p style={{ color:"#ffffff", fontSize:"20px", fontWeight:800, lineHeight:1.3, marginBottom:6 }}>Clinique Médicale ABC Marouane</p>
            <p style={{ color:"rgba(255,255,255,0.65)", fontSize:"13px" }}>Tannerie, Kaloum · Conakry, Guinée</p>
          </div>

          {/* séparateur + slogan */}
          <div style={{ textAlign:"center" }}>
            <div style={{ width:40, height:3, background:"#FCD116", borderRadius:2, margin:"0 auto 18px" }}/>
            <p style={{ color:"rgba(255,255,255,0.6)", fontSize:"13px", lineHeight:1.8, maxWidth:280 }}>
              Plateforme de gestion médicale réservée au personnel de la clinique.
            </p>
          </div>
        </div>

        {/* pied */}
        <div style={{ position:"relative", zIndex:2, textAlign:"center" }}>
          <p style={{ color:"rgba(255,255,255,0.4)", fontSize:"11px" }}>© 2026 Clinique Médicale ABC Marouane</p>
        </div>
      </div>

      {/* ── PANNEAU DROIT ── */}
      <div style={{ flex:1, display:"flex", alignItems:"center", justifyContent:"center", background:"#ffffff", padding:"40px 32px" }}>
        <div style={{ width:"100%", maxWidth:"380px" }}>

          {/* Logo centré */}
          <div style={{ textAlign:"center", marginBottom:32 }}>
            <div style={{ width:88, height:88, borderRadius:16, background:"#ffffff", margin:"0 auto 16px", padding:6, boxShadow:"0 6px 24px rgba(22,163,74,0.25)", border:"2px solid #dcfce7", display:"flex", alignItems:"center", justifyContent:"center" }}>
              <img src={logo} alt="" style={{ width:"100%", height:"100%", borderRadius:10, objectFit:"contain", display:"block" }}/>
            </div>
            <h1 style={{ fontSize:"22px", fontWeight:800, color:"#111", marginBottom:4 }}>Connexion</h1>
            <p style={{ fontSize:"13px", color:"#888" }}>Accès réservé au personnel</p>
          </div>

          {/* Erreur */}
          {erreur && (
            <div style={{ display:"flex", alignItems:"center", gap:8, background:"#fff5f5", border:"1px solid #fca5a5", borderRadius:10, padding:"10px 14px", marginBottom:20, color:"#cc2222", fontSize:"13px" }}>
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
              {erreur}
            </div>
          )}

          {/* Formulaire */}
          <form onSubmit={handleSubmit} style={{ display:"flex", flexDirection:"column", gap:16 }}>

            {/* Email */}
            <div>
              <label style={{ display:"block", fontSize:"12px", fontWeight:700, color:"#555", marginBottom:6, textTransform:"uppercase", letterSpacing:"0.05em" }}>Email</label>
              <div style={{ position:"relative" }}>
                <svg style={{ position:"absolute",left:14,top:"50%",transform:"translateY(-50%)",pointerEvents:"none" }} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#b0b0b0" strokeWidth="1.8" strokeLinecap="round">
                  <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/>
                </svg>
                <input type="email" value={email} onChange={e=>setEmail(e.target.value)}
                  placeholder="votre@email.com" style={IST} onFocus={onFocus} onBlur={onBlur}/>
              </div>
            </div>

            {/* Mot de passe */}
            <div>
              <label style={{ display:"block", fontSize:"12px", fontWeight:700, color:"#555", marginBottom:6, textTransform:"uppercase", letterSpacing:"0.05em" }}>Mot de passe</label>
              <div style={{ position:"relative" }}>
                <svg style={{ position:"absolute",left:14,top:"50%",transform:"translateY(-50%)",pointerEvents:"none" }} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#b0b0b0" strokeWidth="1.8" strokeLinecap="round">
                  <rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                </svg>
                <input type={voir?"text":"password"} value={motDePasse} onChange={e=>setMotDePasse(e.target.value)}
                  placeholder="••••••••" style={{ ...IST, paddingRight:44 }} onFocus={onFocus} onBlur={onBlur}/>
                <button type="button" onClick={()=>setVoir(!voir)}
                  style={{ position:"absolute",right:12,top:"50%",transform:"translateY(-50%)",background:"none",border:"none",cursor:"pointer",color:"#b0b0b0",padding:4,display:"flex" }}>
                  {voir
                    ? <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/><path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
                    : <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                  }
                </button>
              </div>
            </div>

            {/* Bouton */}
            <button type="submit" disabled={chargement} style={{
              width:"100%", padding:"14px", marginTop:4,
              background:chargement?"#22c55e":"#16a34a", color:"#fff",
              fontSize:"15px", fontWeight:700, border:"none", borderRadius:10,
              cursor:chargement?"not-allowed":"pointer", fontFamily:"inherit",
              display:"flex", alignItems:"center", justifyContent:"center", gap:8,
              boxShadow:"0 4px 16px rgba(45,122,63,0.3)", transition:"all 0.15s",
            }}
              onMouseEnter={e=>{ if(!chargement) e.currentTarget.style.background="#236030" }}
              onMouseLeave={e=>{ if(!chargement) e.currentTarget.style.background="#16a34a" }}>
              {chargement
                ? <><div style={{ width:16,height:16,border:"2.5px solid rgba(255,255,255,0.3)",borderTopColor:"#fff",borderRadius:"50%",animation:"spin 0.7s linear infinite" }}/>Connexion...</>
                : <>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round"><path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4M10 17l5-5-5-5M15 12H3"/></svg>
                    Se connecter
                  </>
              }
            </button>
          </form>

          {/* Accès démo — très discret */}
          <details style={{ marginTop:24 }}>
            <summary style={{ fontSize:"11px", color:"#bbb", cursor:"pointer", listStyle:"none", display:"flex", alignItems:"center", justifyContent:"center", gap:5, userSelect:"none" }}>
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
              Accès démonstration
            </summary>
            <div style={{ marginTop:10, border:"1px solid #eee", borderRadius:8, overflow:"hidden", maxHeight:260, overflowY:"auto" }}>
              {COMPTES.map((grp, gi) => (
                <div key={grp.groupe}>
                  <div style={{ padding:"5px 12px 3px", background:"#f8f8f8", borderBottom:"1px solid #eee", borderTop: gi>0?"1px solid #eee":"none" }}>
                    <span style={{ fontSize:"9px", fontWeight:800, color:"#999", textTransform:"uppercase", letterSpacing:"0.08em" }}>{grp.groupe}</span>
                  </div>
                  {grp.items.map((c, i) => (
                    <button key={c.email} type="button"
                      onClick={()=>{ setEmail(c.email); setMotDePasse("1234"); setErreur("") }}
                      style={{ width:"100%", display:"flex", justifyContent:"space-between", alignItems:"center", padding:"7px 12px", border:"none", borderBottom:i<grp.items.length-1?"1px solid #f5f5f5":"none", background:"#fff", cursor:"pointer", fontFamily:"inherit" }}
                      onMouseEnter={e=>e.currentTarget.style.background="#f5faf5"}
                      onMouseLeave={e=>e.currentTarget.style.background="#fff"}>
                      <span style={{ fontSize:"12px", fontWeight:600, color:"#333" }}>{c.titre}</span>
                      <span style={{ fontSize:"10px", color:"#bbb" }}>{c.email}</span>
                    </button>
                  ))}
                </div>
              ))}
            </div>
          </details>

        </div>
      </div>

      <style>{`@keyframes spin{to{transform:rotate(360deg)}} *{box-sizing:border-box}`}</style>
    </div>
  )
}
