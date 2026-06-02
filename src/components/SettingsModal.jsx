import { useState } from 'react'
import { useClinicSettings } from '../hooks/useClinicSettings.jsx'

// ══════════════════════════════════════════════════════════════════
//  DESIGN TOKENS
// ══════════════════════════════════════════════════════════════════
const T = {
  white:'#ffffff', bg:'#ffffff', bgDeep:'#f8faf8',
  border:'#e2e8f0', borderMd:'#cbd5e1',
  txt:'#000000', txtSec:'#333333', txtMuted:'#666666',
  blue:'#2d7a3f', blueSoft:'#e8f5ec',
  green:'#2d7a3f', greenSoft:'#e8f5ec',
  red:'#cc2222',   redSoft:'#fff0f0',
  amber:'#444444', amberSoft:'#eeeeee',
  teal:'#1a5c30',  tealSoft:'#e8f5ec',
  purple:'#1a4a25',purpleSoft:'#d8eed8',
}

// ══════════════════════════════════════════════════════════════════
//  MICRO-COMPOSANTS
// ══════════════════════════════════════════════════════════════════
const Lbl = ({ children, required }) => (
  <label style={{ display:'block', fontSize:11, fontWeight:700, color:T.txtSec,
    textTransform:'uppercase', letterSpacing:'0.07em', marginBottom:6 }}>
    {children}{required && <span style={{ color:T.red, marginLeft:3 }}>*</span>}
  </label>
)

const Field = ({ label, required, span=1, children }) => (
  <div style={{ gridColumn:`span ${span}` }}>
    {label && <Lbl required={required}>{label}</Lbl>}
    {children}
  </div>
)

function TextInput({ value, onChange, placeholder, type='text', disabled, mono, prefix }) {
  const [focus, setFocus] = useState(false)
  return (
    <div style={{ position:'relative' }}>
      {prefix && <span style={{ position:'absolute', left:11, top:'50%', transform:'translateY(-50%)',
        fontSize:12, color:T.txtMuted, pointerEvents:'none', fontWeight:600 }}>{prefix}</span>}
      <input type={type} value={value} onChange={onChange} placeholder={placeholder} disabled={disabled}
        style={{
          width:'100%', padding:`9px 11px 9px ${prefix?'32px':'11px'}`, fontSize:13,
          border:`1.5px solid ${focus ? T.green : T.border}`, borderRadius:8,
          background: disabled ? T.bgDeep : T.white, color: disabled ? T.txtMuted : T.txt,
          outline:'none', fontFamily: mono ? 'monospace' : 'inherit',
          boxShadow: focus ? `0 0 0 3px ${T.greenSoft}` : 'none',
          transition:'border-color .15s, box-shadow .15s',
        }}
        onFocus={() => setFocus(true)} onBlur={() => setFocus(false)}
      />
    </div>
  )
}

function SelectInput({ value, onChange, children, disabled }) {
  const [focus, setFocus] = useState(false)
  return (
    <select value={value} onChange={onChange} disabled={disabled}
      style={{
        width:'100%', padding:'9px 11px', fontSize:13,
        border:`1.5px solid ${focus ? T.green : T.border}`, borderRadius:8,
        background: disabled ? T.bgDeep : T.white, color: T.txt,
        outline:'none', cursor:'pointer', fontFamily:'inherit', appearance:'none',
        boxShadow: focus ? `0 0 0 3px ${T.greenSoft}` : 'none',
      }}
      onFocus={() => setFocus(true)} onBlur={() => setFocus(false)}
    >{children}</select>
  )
}

function Toggle({ value, onChange }) {
  return (
    <button onClick={() => onChange(!value)} style={{
      width:44, height:24, borderRadius:12, border:'none', flexShrink:0,
      background: value ? T.green : T.borderMd,
      cursor:'pointer', position:'relative', transition:'background .2s',
    }}>
      <div style={{
        width:20, height:20, borderRadius:'50%', background:'#fff',
        position:'absolute', top:2, left: value ? 22 : 2,
        transition:'left .2s', boxShadow:'0 1px 4px rgba(0,0,0,0.22)',
      }}/>
    </button>
  )
}

function ToggleRow({ label, desc, value, onChange }) {
  return (
    <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center',
      padding:'12px 14px', background:T.white, borderRadius:10, border:`1px solid ${T.border}` }}>
      <div style={{ paddingRight:16 }}>
        <p style={{ fontSize:13, fontWeight:600, color:T.txt, marginBottom:2 }}>{label}</p>
        {desc && <p style={{ fontSize:12, color:T.txtMuted }}>{desc}</p>}
      </div>
      <Toggle value={value} onChange={onChange}/>
    </div>
  )
}

function SectionTitle({ icon, title, desc }) {
  return (
    <div style={{ display:'flex', alignItems:'flex-start', gap:10, marginBottom:16,
      paddingBottom:12, borderBottom:`1.5px solid ${T.border}` }}>
      <div style={{ width:32, height:32, borderRadius:8, background:T.greenSoft,
        display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0, color:T.green }}>
        {icon}
      </div>
      <div>
        <p style={{ fontSize:13, fontWeight:700, color:T.txt }}>{title}</p>
        {desc && <p style={{ fontSize:12, color:T.txtMuted, marginTop:1 }}>{desc}</p>}
      </div>
    </div>
  )
}

function InfoBox({ color, bg, border, icon, children }) {
  return (
    <div style={{ padding:'11px 14px', background:bg, borderRadius:10,
      border:`1px solid ${border}`, display:'flex', gap:9, alignItems:'flex-start' }}>
      <span style={{ fontSize:15, flexShrink:0, marginTop:1 }}>{icon}</span>
      <p style={{ fontSize:12, color, lineHeight:1.6 }}>{children}</p>
    </div>
  )
}

function StatCard({ label, value, color, bg }) {
  return (
    <div style={{ padding:'12px 14px', background:bg, borderRadius:10,
      border:`1px solid ${color}22`, textAlign:'center' }}>
      <p style={{ fontSize:20, fontWeight:800, color, lineHeight:1 }}>{value}</p>
      <p style={{ fontSize:11, color:T.txtSec, marginTop:4 }}>{label}</p>
    </div>
  )
}

function SaveBanner({ show }) {
  if (!show) return null
  return (
    <div style={{ position:'fixed', bottom:24, right:24, zIndex:10000,
      background:T.green, color:'#fff', borderRadius:12, padding:'12px 20px',
      fontSize:13, fontWeight:700, display:'flex', alignItems:'center', gap:8,
      boxShadow:'0 8px 24px rgba(22,163,74,0.35)', animation:'fadeUp .3s ease' }}>
      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><polyline points="20 6 9 17 4 12"/></svg>
      Paramètres sauvegardés avec succès
    </div>
  )
}

// ══════════════════════════════════════════════════════════════════
//  ONGLET 1 — ÉTABLISSEMENT
// ══════════════════════════════════════════════════════════════════
function TabEtablissement({ s, u }) {
  return (
    <div style={{ display:'flex', flexDirection:'column', gap:28 }}>

      {/* Identité */}
      <section>
        <SectionTitle icon={<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>} title="Identité de l'établissement"
          desc="Ces informations apparaissent sur les ordonnances, reçus et rapports officiels." />
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12 }}>
          <Field label="Raison sociale complète" required span={2}>
            <TextInput value={s.nomClinique} onChange={e=>u('nomClinique',e.target.value)} placeholder="Clinique Médicale ABC Marouane"/>
          </Field>
          <Field label="Nom abrégé (affiché dans l'interface)">
            <TextInput value={s.nomCourt} onChange={e=>u('nomCourt',e.target.value)} placeholder="Marouane"/>
          </Field>
          <Field label="Slogan / devise">
            <TextInput value={s.slogan} onChange={e=>u('slogan',e.target.value)} placeholder="Des soins de qualité..."/>
          </Field>
          <Field label="N° d'agrément ministériel">
            <TextInput value={s.numeroAgrément} onChange={e=>u('numeroAgrément',e.target.value)} placeholder="Ex : AGR-2024-0042" mono/>
          </Field>
          <Field label="N° CNSS / Registre fiscal">
            <TextInput value={s.numeroCNSS} onChange={e=>u('numeroCNSS',e.target.value)} placeholder="Ex : CNSS-224-00123" mono/>
          </Field>
        </div>
      </section>

      {/* Localisation */}
      <section>
        <SectionTitle icon={<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>} title="Localisation & Contacts"
          desc="Coordonnées affichées sur les documents patients et la page de connexion." />
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12 }}>
          <Field label="Adresse complète" span={2}>
            <TextInput value={s.adresse} onChange={e=>u('adresse',e.target.value)} placeholder="Quartier, Commune, Ville"/>
          </Field>
          <Field label="Pays">
            <TextInput value={s.pays} onChange={e=>u('pays',e.target.value)} placeholder="République de Guinée"/>
          </Field>
          <Field label="Ville">
            <TextInput value={s.ville} onChange={e=>u('ville',e.target.value)} placeholder="Conakry"/>
          </Field>
          <Field label="Téléphone principal" required>
            <TextInput value={s.telephone} onChange={e=>u('telephone',e.target.value)} placeholder="+224 624 00 00 00" prefix="📞"/>
          </Field>
          <Field label="Téléphone secondaire (urgences)">
            <TextInput value={s.telephone2} onChange={e=>u('telephone2',e.target.value)} placeholder="+224 625 00 00 00" prefix="📞"/>
          </Field>
          <Field label="Adresse email">
            <TextInput value={s.email} onChange={e=>u('email',e.target.value)} placeholder="clinique@exemple.com" type="email" prefix="✉️"/>
          </Field>
          <Field label="Site web (optionnel)">
            <TextInput value={s.siteWeb} onChange={e=>u('siteWeb',e.target.value)} placeholder="https://cliniquemarouane.gn" prefix="🌐"/>
          </Field>
        </div>
      </section>

      {/* Localisation monétaire */}
      <section>
        <SectionTitle icon={<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="12" r="10"/><path d="M16 8h-6a2 2 0 1 0 0 4h4a2 2 0 1 1 0 4H8"/><line x1="12" y1="6" x2="12" y2="18"/></svg>} title="Localisation monétaire"
          desc="Devise et langue par défaut pour l'interface." />
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12 }}>
          <Field label="Devise de facturation">
            <SelectInput value={s.devise} onChange={e=>u('devise',e.target.value)}>
              <option value="GNF">GNF — Franc Guinéen</option>
              <option value="USD">USD — Dollar américain</option>
              <option value="EUR">EUR — Euro</option>
              <option value="XOF">XOF — Franc CFA UEMOA</option>
              <option value="XAF">XAF — Franc CFA CEMAC</option>
            </SelectInput>
          </Field>
          <Field label="Préfixe numéro de dossier">
            <TextInput value={s.prefixeDossier} onChange={e=>u('prefixeDossier',e.target.value)} placeholder="ABC" mono/>
          </Field>
        </div>
        <div style={{ marginTop:10 }}>
          <InfoBox color={T.green} bg={T.greenSoft} border={T.green} icon="ℹ️">
            Le numéro de dossier sera généré automatiquement sous la forme <strong>{s.prefixeDossier||'ABC'}-XXXXXX</strong> à chaque enregistrement patient.
          </InfoBox>
        </div>
      </section>
    </div>
  )
}

// ══════════════════════════════════════════════════════════════════
//  ONGLET 2 — HORAIRES & CAPACITÉ
// ══════════════════════════════════════════════════════════════════
function TabHoraires({ s, u, uh, JOURS }) {
  const joursOuverts = Object.values(s.horaires).filter(h=>h.ouvert).length

  return (
    <div style={{ display:'flex', flexDirection:'column', gap:28 }}>

      {/* Urgences */}
      <section>
        <SectionTitle icon={<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><polygon points="7.86 2 16.14 2 22 7.86 22 16.14 16.14 22 7.86 22 2 16.14 2 7.86 7.86 2"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>} title="Service des urgences"
          desc="Affiché sur la page de connexion, les reçus et les rapports d'activité." />
        <ToggleRow
          label="Urgences disponibles 24h/24 — 7j/7"
          desc="La clinique reste accessible pour les urgences en dehors des horaires normaux"
          value={s.urgences24h} onChange={v=>u('urgences24h',v)}
        />
      </section>

      {/* Horaires d'ouverture */}
      <section>
        <SectionTitle icon={<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>} title="Horaires d'ouverture"
          desc="Définissez les jours et heures d'ouverture de la clinique." />

        <div style={{ borderRadius:12, border:`1px solid ${T.border}`, overflow:'hidden', background:T.white }}>
          {/* En-tête tableau */}
          <div style={{ display:'grid', gridTemplateColumns:'130px 54px 1fr 16px 1fr',
            gap:8, padding:'10px 16px', background:T.bgDeep,
            borderBottom:`1px solid ${T.border}` }}>
            {['Jour','Ouvert','Ouverture','','Fermeture'].map((h,i)=>(
              <p key={i} style={{ fontSize:10, fontWeight:700, color:T.txtSec,
                textTransform:'uppercase', letterSpacing:'0.08em' }}>{h}</p>
            ))}
          </div>

          {Object.entries(JOURS).map(([key, label], idx, arr) => {
            const h = s.horaires[key] || { ouvert:false, debut:'08:00', fin:'17:00' }
            const isLast = idx === arr.length - 1
            return (
              <div key={key} style={{
                display:'grid', gridTemplateColumns:'130px 54px 1fr 16px 1fr',
                gap:8, padding:'11px 16px', alignItems:'center',
                borderBottom: isLast ? 'none' : `1px solid ${T.border}`,
                background: h.ouvert ? T.white : T.bgDeep,
                transition:'background .15s',
              }}>
                <p style={{ fontSize:13, fontWeight: h.ouvert ? 600 : 400,
                  color: h.ouvert ? T.txt : T.txtMuted }}>{label}</p>

                <div style={{ display:'flex', justifyContent:'flex-start' }}>
                  <Toggle value={h.ouvert} onChange={v => uh(key,'ouvert',v)}/>
                </div>

                {h.ouvert ? (
                  <>
                    <input type="time" value={h.debut} onChange={e=>uh(key,'debut',e.target.value)}
                      style={{ padding:'7px 10px', fontSize:13, border:`1.5px solid ${T.border}`,
                        borderRadius:8, background:T.white, color:T.txt, outline:'none',
                        fontFamily:'inherit', width:'100%' }}/>
                    <p style={{ textAlign:'center', color:T.txtMuted, fontSize:12, fontWeight:600 }}>→</p>
                    <input type="time" value={h.fin} onChange={e=>uh(key,'fin',e.target.value)}
                      style={{ padding:'7px 10px', fontSize:13, border:`1.5px solid ${T.border}`,
                        borderRadius:8, background:T.white, color:T.txt, outline:'none',
                        fontFamily:'inherit', width:'100%' }}/>
                  </>
                ) : (
                  <p style={{ gridColumn:'span 3', fontSize:12, color:T.txtMuted, fontStyle:'italic', paddingLeft:4 }}>
                    Fermé ce jour
                  </p>
                )}
              </div>
            )
          })}
        </div>

        {/* Résumé */}
        <div style={{ marginTop:12, display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:10 }}>
          <StatCard label="Jours d'ouverture" value={joursOuverts} color={T.green} bg={T.greenSoft}/>
          <StatCard label="Jours de fermeture" value={7-joursOuverts} color={T.txtSec} bg={T.bgDeep}/>
          <StatCard label="Urgences" value={s.urgences24h?'24h/24':'Non'} color={s.urgences24h?T.red:T.txtMuted} bg={s.urgences24h?T.redSoft:T.bgDeep}/>
        </div>
      </section>

      {/* Capacité */}
      <section>
        <SectionTitle icon={<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>} title="Capacité & Rendez-vous"
          desc="Paramètres de gestion du flux de patients." />
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12 }}>
          <Field label="Capacité journalière maximale (patients)">
            <TextInput type="number" value={s.capaciteJournaliere}
              onChange={e=>u('capaciteJournaliere',parseInt(e.target.value)||0)}
              placeholder="50"/>
          </Field>
          <Field label="Durée par défaut d'un RDV (minutes)">
            <SelectInput value={s.dureeRdvDefautMin} onChange={e=>u('dureeRdvDefautMin',parseInt(e.target.value))}>
              {[10,15,20,30,45,60,90].map(v=>(
                <option key={v} value={v}>{v} minutes</option>
              ))}
            </SelectInput>
          </Field>
          <Field label="Délai rappel avant RDV">
            <SelectInput value={s.rappelRdvDelaiH} onChange={e=>u('rappelRdvDelaiH',parseInt(e.target.value))}>
              <option value={1}>1 heure avant</option>
              <option value={2}>2 heures avant</option>
              <option value={12}>12 heures avant</option>
              <option value={24}>24 heures avant</option>
              <option value={48}>48 heures avant</option>
            </SelectInput>
          </Field>
          <Field label="Âge de majorité médicale (ans)">
            <SelectInput value={s.ageMajoriteAns} onChange={e=>u('ageMajoriteAns',parseInt(e.target.value))}>
              {[15,16,17,18,21].map(v=>(<option key={v} value={v}>{v} ans</option>))}
            </SelectInput>
          </Field>
        </div>
        <div style={{ marginTop:10 }}>
          <ToggleRow
            label="Rappel automatique des rendez-vous actif"
            desc="Envoie une notification au patient avant chaque rendez-vous"
            value={s.rappelRdvActif} onChange={v=>u('rappelRdvActif',v)}
          />
        </div>
      </section>
    </div>
  )
}

// ══════════════════════════════════════════════════════════════════
//  ONGLET 3 — TARIFICATION
// ══════════════════════════════════════════════════════════════════
function TabTarification({ s, u }) {
  const devise = s.devise || 'GNF'
  const tva = s.tvaActif ? (1 + s.tvaTaux/100) : 1
  const fmt = v => Math.round(v).toLocaleString('fr-FR')

  const tarifs = [
    { key:'tarifConsultation',    icon:'🩺', label:'Consultation standard',        desc:'Médecine générale, 1er examen' },
    { key:'tarifRendezVous',      icon:'📅', label:'Rendez-vous spécialisé',        desc:'Consultation avec médecin spécialiste' },
    { key:'tarifUrgence',         icon:'🚨', label:'Consultation urgence',          desc:'Prise en charge hors horaires normaux' },
    { key:'tarifLaboratoire',     icon:'🔬', label:'Analyses de laboratoire',       desc:'Bilan biologique de base' },
    { key:'tarifHospitalisation', icon:'🛏️', label:'Hospitalisation (par jour)',    desc:'Chambre, surveillance, soins de base' },
  ]

  return (
    <div style={{ display:'flex', flexDirection:'column', gap:28 }}>

      {/* Grille tarifaire */}
      <section>
        <SectionTitle icon={<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><rect x="2" y="5" width="20" height="14" rx="2"/><line x1="2" y1="10" x2="22" y2="10"/></svg>} title="Grille tarifaire de base"
          desc={`Tarifs standards appliqués par défaut en ${devise}.`}/>

        <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
          {tarifs.map(({ key, icon, label, desc }) => {
            const base = s[key] || 0
            const ttc  = Math.round(base * tva)
            return (
              <div key={key} style={{ display:'grid', gridTemplateColumns:'1fr 180px 120px',
                gap:12, alignItems:'center', padding:'14px 16px',
                background:T.white, borderRadius:12, border:`1px solid ${T.border}` }}>
                <div style={{ display:'flex', alignItems:'center', gap:10 }}>
                  <span style={{ fontSize:20, flexShrink:0 }}>{icon}</span>
                  <div>
                    <p style={{ fontSize:13, fontWeight:600, color:T.txt }}>{label}</p>
                    <p style={{ fontSize:11, color:T.txtMuted }}>{desc}</p>
                  </div>
                </div>
                <div style={{ position:'relative' }}>
                  <input type="number" value={base}
                    onChange={e=>u(key, parseInt(e.target.value)||0)}
                    style={{ width:'100%', padding:'9px 52px 9px 11px', fontSize:14, fontWeight:700,
                      border:`1.5px solid ${T.border}`, borderRadius:8,
                      background:T.bgDeep, color:T.txt, outline:'none', fontFamily:'inherit' }}
                    onFocus={e=>{ e.target.style.borderColor=T.green; e.target.style.background=T.white }}
                    onBlur={e=>{  e.target.style.borderColor=T.border; e.target.style.background=T.bgDeep }}
                  />
                  <span style={{ position:'absolute', right:10, top:'50%', transform:'translateY(-50%)',
                    fontSize:10, fontWeight:700, color:T.txtMuted }}>{devise}</span>
                </div>
                <div style={{ textAlign:'right' }}>
                  <p style={{ fontSize:11, color:T.txtMuted, marginBottom:2 }}>TTC</p>
                  <p style={{ fontSize:14, fontWeight:800, color:T.green }}>{fmt(ttc)} {devise}</p>
                </div>
              </div>
            )
          })}
        </div>
      </section>

      {/* Tarifs par âge */}
      <section>
        <SectionTitle icon={<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/></svg>} title="Tarifs consultation par tranche d'âge"
          desc={`Appliqués automatiquement lors des consultations en médecine générale. Modifiables ici par l'administration.`}/>
        <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
          {[
            { key:'tarifEnfant', icon:'🧒', label:'0 – 15 ans', desc:'Tarif consultation enfants et jeunes' },
            { key:'tarifAdulte', icon:'🧑', label:'> 15 ans',  desc:'Tarif consultation adultes et seniors' },
          ].map(({ key, icon, label, desc }) => {
            const base = s[key] || 0
            const ttc  = Math.round(base * tva)
            return (
              <div key={key} style={{ display:'grid', gridTemplateColumns:'1fr 180px 120px',
                gap:12, alignItems:'center', padding:'14px 16px',
                background:T.white, borderRadius:12, border:`1px solid ${T.border}` }}>
                <div style={{ display:'flex', alignItems:'center', gap:10 }}>
                  <span style={{ fontSize:20, flexShrink:0 }}>{icon}</span>
                  <div>
                    <p style={{ fontSize:13, fontWeight:600, color:T.txt }}>{label}</p>
                    <p style={{ fontSize:11, color:T.txtMuted }}>{desc}</p>
                  </div>
                </div>
                <div style={{ position:'relative' }}>
                  <input type="number" value={base}
                    onChange={e=>u(key, parseInt(e.target.value)||0)}
                    style={{ width:'100%', padding:'9px 52px 9px 11px', fontSize:14, fontWeight:700,
                      border:`1.5px solid ${T.border}`, borderRadius:8,
                      background:T.bgDeep, color:T.txt, outline:'none', fontFamily:'inherit' }}
                    onFocus={e=>{ e.target.style.borderColor=T.green; e.target.style.background=T.white }}
                    onBlur={e=>{  e.target.style.borderColor=T.border; e.target.style.background=T.bgDeep }}
                  />
                  <span style={{ position:'absolute', right:10, top:'50%', transform:'translateY(-50%)',
                    fontSize:10, fontWeight:700, color:T.txtMuted }}>{devise}</span>
                </div>
                <div style={{ textAlign:'right' }}>
                  <p style={{ fontSize:11, color:T.txtMuted, marginBottom:2 }}>TTC</p>
                  <p style={{ fontSize:14, fontWeight:800, color:T.green }}>{fmt(ttc)} {devise}</p>
                </div>
              </div>
            )
          })}
        </div>
      </section>

      {/* TVA */}
      <section>
        <SectionTitle icon={<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>} title="Fiscalité & TVA"
          desc="La TVA sera calculée et incluse sur chaque reçu de paiement si activée."/>
        <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
          <ToggleRow
            label="Appliquer la TVA sur les factures"
            desc="Obligatoire si la clinique est assujettie à la TVA"
            value={s.tvaActif} onChange={v=>u('tvaActif',v)}
          />
          {s.tvaActif && (
            <div style={{ padding:'16px', background:T.white, borderRadius:12, border:`1px solid ${T.border}` }}>
              <div style={{ display:'flex', alignItems:'center', gap:14, marginBottom:14 }}>
                <Lbl>Taux de TVA applicable</Lbl>
                <div style={{ marginLeft:'auto', background:T.greenSoft, borderRadius:8,
                  padding:'6px 16px', fontSize:16, fontWeight:800, color:T.green }}>
                  {s.tvaTaux}%
                </div>
              </div>
              <input type="range" min="0" max="30" step="1" value={s.tvaTaux}
                onChange={e=>u('tvaTaux',parseInt(e.target.value))}
                style={{ width:'100%', accentColor:T.green, height:4 }}/>
              <div style={{ display:'flex', justifyContent:'space-between', fontSize:11, color:T.txtMuted, marginTop:4 }}>
                <span>0%</span><span>10%</span><span>18%</span><span>25%</span><span>30%</span>
              </div>
            </div>
          )}

          {/* Remise max */}
          <div style={{ padding:'14px 16px', background:T.white, borderRadius:12, border:`1px solid ${T.border}` }}>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:8 }}>
              <div>
                <p style={{ fontSize:13, fontWeight:600, color:T.txt }}>Remise maximale sans validation chef</p>
                <p style={{ fontSize:12, color:T.txtMuted }}>Au-delà de ce seuil, l'accord du médecin chef est requis</p>
              </div>
              <div style={{ background:T.greenSoft, borderRadius:8, padding:'6px 14px',
                fontSize:14, fontWeight:800, color:T.green }}>{s.remiseMaxPct}%</div>
            </div>
            <input type="range" min="0" max="50" step="5" value={s.remiseMaxPct}
              onChange={e=>u('remiseMaxPct',parseInt(e.target.value))}
              style={{ width:'100%', accentColor:T.green, height:4 }}/>
          </div>
        </div>
      </section>

      {/* Simulation */}
      <section>
        <SectionTitle icon={<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><rect x="4" y="2" width="16" height="20" rx="2"/><line x1="8" y1="6" x2="16" y2="6"/><line x1="8" y1="10" x2="16" y2="10"/><line x1="8" y1="14" x2="12" y2="14"/></svg>} title="Simulateur de facturation"
          desc="Aperçu du montant final pour une consultation standard."/>
        <div style={{ background:T.white, borderRadius:14, border:`1px solid ${T.border}`, overflow:'hidden' }}>
          <div style={{ padding:'14px 18px', background:T.bgDeep, borderBottom:`1px solid ${T.border}` }}>
            <p style={{ fontSize:12, fontWeight:700, color:T.txtSec, textTransform:'uppercase', letterSpacing:'0.08em' }}>
              Consultation standard — simulation
            </p>
          </div>
          <div style={{ padding:'16px 18px', display:'flex', flexDirection:'column', gap:8 }}>
            {[
              { label:'Tarif de base (HT)', value:`${fmt(s.tarifConsultation)} ${devise}`, color:T.txt },
              s.tvaActif && { label:`TVA (${s.tvaTaux}%)`, value:`+ ${fmt(s.tarifConsultation*s.tvaTaux/100)} ${devise}`, color:T.green },
            ].filter(Boolean).map(r=>(
              <div key={r.label} style={{ display:'flex', justifyContent:'space-between', fontSize:13 }}>
                <span style={{ color:T.txtSec }}>{r.label}</span>
                <span style={{ fontWeight:600, color:r.color }}>{r.value}</span>
              </div>
            ))}
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center',
              paddingTop:10, marginTop:4, borderTop:`2px solid ${T.border}` }}>
              <span style={{ fontSize:14, fontWeight:700, color:T.txt }}>Total TTC</span>
              <span style={{ fontSize:18, fontWeight:800, color:T.green }}>
                {fmt(s.tarifConsultation * tva)} {devise}
              </span>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}

// ══════════════════════════════════════════════════════════════════
//  ONGLET 4 — DOSSIERS PATIENTS
// ══════════════════════════════════════════════════════════════════
function TabDossiers({ s, u }) {
  return (
    <div style={{ display:'flex', flexDirection:'column', gap:28 }}>

      <section>
        <SectionTitle icon={<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/></svg>} title="Gestion des dossiers patients"
          desc="Paramètres de création, conservation et sécurité des dossiers médicaux."/>
        <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
          <ToggleRow
            label="Alerte doublon automatique"
            desc="Vérifie si le patient est déjà enregistré à la création d'un nouveau dossier"
            value={s.alerteDoublonActif} onChange={v=>u('alerteDoublonActif',v)}
          />
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12 }}>
            <div style={{ padding:'14px 16px', background:T.white, borderRadius:12, border:`1px solid ${T.border}` }}>
              <Lbl>Durée de conservation légale</Lbl>
              <SelectInput value={s.conservationDossierAns} onChange={e=>u('conservationDossierAns',parseInt(e.target.value))}>
                {[5,7,10,15,20].map(v=>(<option key={v} value={v}>{v} ans</option>))}
              </SelectInput>
              <p style={{ fontSize:11, color:T.txtMuted, marginTop:6 }}>Durée minimale recommandée : 10 ans</p>
            </div>
            <div style={{ padding:'14px 16px', background:T.white, borderRadius:12, border:`1px solid ${T.border}` }}>
              <Lbl>Âge de majorité médicale</Lbl>
              <SelectInput value={s.ageMajoriteAns} onChange={e=>u('ageMajoriteAns',parseInt(e.target.value))}>
                {[15,16,17,18,21].map(v=>(<option key={v} value={v}>{v} ans</option>))}
              </SelectInput>
              <p style={{ fontSize:11, color:T.txtMuted, marginTop:6 }}>En dessous, un tuteur est obligatoire</p>
            </div>
          </div>
        </div>
      </section>

      <section>
        <SectionTitle icon={<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><polyline points="9 11 12 14 22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/></svg>} title="Champs obligatoires à l'enregistrement"
          desc="Ces champs doivent être remplis pour valider l'enregistrement d'un nouveau patient."/>
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:8 }}>
          {[
            { key:'nom',        label:'Nom de famille' },
            { key:'prenom',     label:'Prénom(s)' },
            { key:'sexe',       label:'Sexe' },
            { key:'telephone',  label:'Téléphone' },
            { key:'dateNaissance', label:'Date de naissance' },
            { key:'quartier',   label:'Quartier / Adresse' },
            { key:'responsable',label:'Personne responsable' },
            { key:'profession', label:'Profession' },
          ].map(({ key, label }) => {
            const isRequired = s.champsObligatoires?.includes(key)
            return (
              <div key={key} onClick={()=>{
                  const curr = s.champsObligatoires||[]
                  u('champsObligatoires', isRequired ? curr.filter(c=>c!==key) : [...curr,key])
                }}
                style={{ display:'flex', alignItems:'center', gap:10, padding:'10px 14px',
                  background: isRequired ? T.greenSoft : T.white, borderRadius:10,
                  border:`1.5px solid ${isRequired ? T.green+'55' : T.border}`,
                  cursor:'pointer', transition:'all .15s' }}>
                <div style={{ width:18, height:18, borderRadius:5, flexShrink:0,
                  background: isRequired ? T.green : T.white,
                  border:`2px solid ${isRequired ? T.green : T.borderMd}`,
                  display:'flex', alignItems:'center', justifyContent:'center' }}>
                  {isRequired && <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3" strokeLinecap="round"><polyline points="20 6 9 17 4 12"/></svg>}
                </div>
                <p style={{ fontSize:13, fontWeight: isRequired ? 600 : 400,
                  color: isRequired ? T.green : T.txtSec }}>{label}</p>
              </div>
            )
          })}
        </div>
        <div style={{ marginTop:10 }}>
          <InfoBox color={T.green} bg={T.greenSoft} border={T.green} icon="⚠️">
            Nom, prénom et sexe sont toujours obligatoires et ne peuvent pas être décochés. Les autres champs peuvent être facultatifs selon votre workflow.
          </InfoBox>
        </div>
      </section>
    </div>
  )
}

// ══════════════════════════════════════════════════════════════════
//  ONGLET 5 — NOTIFICATIONS
// ══════════════════════════════════════════════════════════════════
function TabNotifications({ s, u }) {
  return (
    <div style={{ display:'flex', flexDirection:'column', gap:28 }}>
      <section>
        <SectionTitle icon={<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>} title="Alertes & Notifications"
          desc="Configurez quand et comment le système vous alerte des événements importants."/>
        <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
          <ToggleRow
            label="Nouveau patient enregistré"
            desc="Notification à l'arrivée de chaque nouveau dossier patient"
            value={s.notifNouveauPatient} onChange={v=>u('notifNouveauPatient',v)}
          />
          <ToggleRow
            label="Alerte paiement impayé"
            desc="Notification dès qu'un patient quitte sans régler sa facture"
            value={s.notifPaiementImpaye} onChange={v=>u('notifPaiementImpaye',v)}
          />
          <ToggleRow
            label="Absence d'un médecin"
            desc="Notification au médecin chef quand un médecin ne pointe pas à l'heure"
            value={s.notifAbsenceMedecin} onChange={v=>u('notifAbsenceMedecin',v)}
          />
          <ToggleRow
            label="Récapitulatif des RDV du jour"
            desc="Envoyé chaque matin à l'ouverture de la clinique"
            value={s.notifRdvJour} onChange={v=>u('notifRdvJour',v)}
          />
          <ToggleRow
            label="Sons d'interface actifs"
            desc="Bip sonore pour les alertes et confirmations d'actions"
            value={s.soundActif} onChange={v=>u('soundActif',v)}
          />
        </div>
      </section>

      <section>
        <SectionTitle icon={<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 13a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.6 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/></svg>} title="Rappels patients"
          desc="Paramètres des rappels envoyés automatiquement aux patients."/>
        <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
          <ToggleRow
            label="Rappel automatique avant rendez-vous"
            desc="Message envoyé au patient avant son rendez-vous programmé"
            value={s.rappelRdvActif} onChange={v=>u('rappelRdvActif',v)}
          />
          {s.rappelRdvActif && (
            <div style={{ padding:'14px 16px', background:T.white, borderRadius:12, border:`1px solid ${T.border}` }}>
              <Lbl>Délai d'envoi du rappel</Lbl>
              <SelectInput value={s.rappelRdvDelaiH} onChange={e=>u('rappelRdvDelaiH',parseInt(e.target.value))}>
                <option value={1}>1 heure avant le RDV</option>
                <option value={2}>2 heures avant le RDV</option>
                <option value={12}>12 heures avant le RDV</option>
                <option value={24}>La veille (24h avant)</option>
                <option value={48}>2 jours avant</option>
              </SelectInput>
            </div>
          )}
          <InfoBox color={T.green} bg={T.greenSoft} border={T.green} icon="ℹ️">
            Les rappels sont actuellement simulés. Ils seront envoyés par SMS ou email dès la connexion au backend.
          </InfoBox>
        </div>
      </section>
    </div>
  )
}

// ══════════════════════════════════════════════════════════════════
//  ONGLET 6 — APPARENCE
// ══════════════════════════════════════════════════════════════════
function TabApparence({ s, u, THEMES_PRESET, FONT_SIZES }) {
  return (
    <div style={{ display:'flex', flexDirection:'column', gap:28 }}>

      <section>
        <SectionTitle icon={<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="13.5" cy="6.5" r="0.5" fill="currentColor"/><circle cx="17.5" cy="10.5" r="0.5" fill="currentColor"/><circle cx="8.5" cy="7.5" r="0.5" fill="currentColor"/><circle cx="6.5" cy="12.5" r="0.5" fill="currentColor"/><path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10c.926 0 1.648-.746 1.648-1.688 0-.437-.18-.835-.437-1.125-.29-.289-.438-.652-.438-1.125a1.64 1.64 0 0 1 1.668-1.668h1.996c3.051 0 5.555-2.503 5.555-5.554C21.965 6.012 17.461 2 12 2z"/></svg>} title="Thème de couleurs"
          desc="Adaptez l'apparence de l'interface à votre charte graphique."/>
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10, marginBottom:14 }}>
          {Object.entries(THEMES_PRESET).map(([name, theme]) => {
            const isActive = s.couleurPrimaire === theme.couleurPrimaire
            return (
              <div key={name} onClick={()=>{
                Object.entries(theme).forEach(([k,v]) => u(k,v))
              }} style={{
                display:'flex', alignItems:'center', gap:12, padding:'12px 14px',
                borderRadius:12, cursor:'pointer', transition:'all .15s',
                border:`2px solid ${isActive ? theme.couleurPrimaire : T.border}`,
                background: isActive ? theme.couleurPrimaire+'10' : T.white,
              }}>
                <div style={{ position:'relative', flexShrink:0 }}>
                  <div style={{ width:36, height:36, borderRadius:'50%',
                    background:theme.couleurPrimaire,
                    boxShadow:`0 3px 10px ${theme.couleurPrimaire}44` }}/>
                  {isActive && (
                    <div style={{ position:'absolute', inset:0, display:'flex',
                      alignItems:'center', justifyContent:'center' }}>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3" strokeLinecap="round"><polyline points="20 6 9 17 4 12"/></svg>
                    </div>
                  )}
                </div>
                <div>
                  <p style={{ fontSize:13, fontWeight:700, color:T.txt }}>{name}</p>
                  <p style={{ fontSize:11, color:T.txtMuted }}>{theme.theme==='dark'?'Mode sombre':'Mode clair'}</p>
                </div>
                {isActive && <span style={{ marginLeft:'auto', fontSize:10, fontWeight:700,
                  color:theme.couleurPrimaire, background:theme.couleurPrimaire+'15',
                  padding:'3px 8px', borderRadius:6 }}>Actif</span>}
              </div>
            )
          })}
        </div>

        {/* Couleurs custom */}
        <div style={{ padding:'16px', background:T.white, borderRadius:12, border:`1px solid ${T.border}` }}>
          <p style={{ fontSize:12, fontWeight:700, color:T.txtSec, marginBottom:12,
            textTransform:'uppercase', letterSpacing:'0.07em' }}>Couleurs personnalisées</p>
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:12 }}>
            {[
              { key:'couleurPrimaire',   label:'Principale' },
              { key:'couleurSecondaire', label:'Secondaire' },
              { key:'couleurAccent',     label:'Accent' },
            ].map(({ key, label }) => (
              <div key={key}>
                <Lbl>{label}</Lbl>
                <div style={{ display:'flex', gap:8, alignItems:'center' }}>
                  <input type="color" value={s[key]} onChange={e=>u(key,e.target.value)}
                    style={{ width:36, height:34, border:`1.5px solid ${T.border}`,
                      borderRadius:8, cursor:'pointer', padding:2, flexShrink:0 }}/>
                  <input type="text" value={s[key]} onChange={e=>u(key,e.target.value)}
                    style={{ flex:1, padding:'7px 9px', fontSize:11, fontFamily:'monospace',
                      border:`1.5px solid ${T.border}`, borderRadius:8,
                      background:T.white, color:T.txt, outline:'none' }}/>
                </div>
              </div>
            ))}
          </div>
          {/* Aperçu */}
          <div style={{ display:'flex', gap:8, marginTop:14 }}>
            {[
              { label:'Principale', color:s.couleurPrimaire },
              { label:'Secondaire', color:s.couleurSecondaire },
              { label:'Accent',     color:s.couleurAccent },
            ].map(({ label, color }) => (
              <div key={label} style={{ flex:1, background:color, borderRadius:8,
                padding:'10px 6px', textAlign:'center' }}>
                <p style={{ fontSize:10, color:'#fff', fontWeight:700, opacity:.9 }}>{label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section>
        <SectionTitle icon={<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><rect x="2" y="3" width="20" height="14" rx="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/></svg>} title="Fond de l'interface"/>
        <div style={{ display:'flex', gap:8, marginBottom:12 }}>
          {[{ val:'color', label:'Couleur unie' },{ val:'gradient', label:'Dégradé' }].map(opt=>(
            <button key={opt.val} onClick={()=>u('backgroundType',opt.val)} style={{
              flex:1, padding:'9px', borderRadius:10, cursor:'pointer', fontSize:13, fontWeight:600,
              fontFamily:'inherit',
              border:`2px solid ${s.backgroundType===opt.val ? T.green : T.border}`,
              background: s.backgroundType===opt.val ? T.greenSoft : T.white,
              color: s.backgroundType===opt.val ? T.green : T.txtSec,
            }}>{opt.label}</button>
          ))}
        </div>
        {s.backgroundType==='color' ? (
          <div style={{ display:'flex', gap:10, alignItems:'center' }}>
            <input type="color" value={s.backgroundColor} onChange={e=>u('backgroundColor',e.target.value)}
              style={{ width:48, height:40, border:`1.5px solid ${T.border}`, borderRadius:8, cursor:'pointer', padding:2 }}/>
            <input type="text" value={s.backgroundColor} onChange={e=>u('backgroundColor',e.target.value)}
              style={{ flex:1, padding:'9px 11px', fontSize:13, fontFamily:'monospace',
                border:`1.5px solid ${T.border}`, borderRadius:8, background:T.white, color:T.txt, outline:'none' }}/>
          </div>
        ) : (
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10 }}>
            {[{ key:'gradientDebut', label:'Couleur de départ' },{ key:'gradientFin', label:'Couleur de fin' }].map(f=>(
              <div key={f.key}>
                <Lbl>{f.label}</Lbl>
                <div style={{ display:'flex', gap:8, alignItems:'center' }}>
                  <input type="color" value={s[f.key]} onChange={e=>u(f.key,e.target.value)}
                    style={{ width:36, height:34, border:`1.5px solid ${T.border}`, borderRadius:8, cursor:'pointer', padding:2 }}/>
                  <input type="text" value={s[f.key]} onChange={e=>u(f.key,e.target.value)}
                    style={{ flex:1, padding:'7px 9px', fontSize:11, fontFamily:'monospace',
                      border:`1.5px solid ${T.border}`, borderRadius:8, background:T.white, color:T.txt, outline:'none' }}/>
                </div>
              </div>
            ))}
          </div>
        )}
        <div style={{ marginTop:10, height:48, borderRadius:10, border:`1px solid ${T.border}`,
          background: s.backgroundType==='gradient'
            ? `linear-gradient(135deg, ${s.gradientDebut}, ${s.gradientFin})`
            : s.backgroundColor,
          display:'flex', alignItems:'center', justifyContent:'center' }}>
          <p style={{ fontSize:11, fontWeight:700, color:'rgba(0,0,0,0.35)' }}>Aperçu du fond</p>
        </div>
      </section>

      <section>
        <SectionTitle icon={<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><polyline points="4 7 4 4 20 4 20 7"/><line x1="9" y1="20" x2="15" y2="20"/><line x1="12" y1="4" x2="12" y2="20"/></svg>} title="Taille de police & Interface"/>
        <div style={{ display:'flex', gap:6, marginBottom:14 }}>
          {FONT_SIZES.map(sz=>(
            <button key={sz.value} onClick={()=>u('fontSize',sz.value)} style={{
              flex:1, padding:'10px 4px', borderRadius:10, cursor:'pointer',
              fontFamily:'inherit', fontSize:sz.value, fontWeight:700,
              border:`2px solid ${s.fontSize===sz.value ? T.green : T.border}`,
              background: s.fontSize===sz.value ? T.greenSoft : T.white,
              color: s.fontSize===sz.value ? T.green : T.txtSec,
            }}>{sz.label}</button>
          ))}
        </div>
        <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
          <ToggleRow label="Mode compact" desc="Réduit les espacements pour afficher plus d'informations"
            value={s.compactMode} onChange={v=>u('compactMode',v)}/>
          <ToggleRow label="Animations & transitions" desc="Effets visuels lors des changements d'écran et ouvertures de modales"
            value={s.showAnimations} onChange={v=>u('showAnimations',v)}/>
        </div>
      </section>
    </div>
  )
}

// ══════════════════════════════════════════════════════════════════
//  ONGLET 7 — SAUVEGARDE
// ══════════════════════════════════════════════════════════════════
function TabSauvegarde({ s, resetSettings, exportSettings, importSettings }) {
  const [importError,   setImportError]   = useState('')
  const [importSuccess, setImportSuccess] = useState(false)
  const [confirmReset,  setConfirmReset]  = useState(false)

  const handleImport = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    const result = importSettings(await file.text())
    if (result.success) { setImportSuccess(true); setTimeout(()=>setImportSuccess(false),3000) }
    else setImportError(result.error)
  }

  return (
    <div style={{ display:'flex', flexDirection:'column', gap:28 }}>

      <section>
        <SectionTitle icon={<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>} title="Export & Import des paramètres"
          desc="Sauvegardez votre configuration ou transférez-la vers un autre appareil."/>
        <div style={{ display:'flex', gap:10, marginBottom:10 }}>
          <button onClick={exportSettings} style={{
            flex:1, padding:'13px 16px', borderRadius:12,
            border:`2px solid ${T.green}`, background:T.greenSoft,
            color:T.green, fontSize:13, fontWeight:700, cursor:'pointer', fontFamily:'inherit',
            display:'flex', alignItems:'center', justifyContent:'center', gap:8,
          }}>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
            Exporter la configuration
          </button>
          <label style={{
            flex:1, padding:'13px 16px', borderRadius:12,
            border:`2px solid ${T.borderMd}`, background:T.white,
            color:T.txtSec, fontSize:13, fontWeight:700, cursor:'pointer', fontFamily:'inherit',
            display:'flex', alignItems:'center', justifyContent:'center', gap:8,
          }}>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
            Importer un fichier
            <input type="file" accept=".json" onChange={handleImport} style={{ display:'none' }}/>
          </label>
        </div>
        {importSuccess && <InfoBox color={T.green} bg={T.greenSoft} border={T.green} icon="✅">Paramètres importés avec succès !</InfoBox>}
        {importError   && <InfoBox color={T.red}   bg={T.redSoft}   border={T.red}   icon="⚠️">Erreur : {importError}</InfoBox>}
        <div style={{ padding:'12px 14px', background:T.bgDeep, borderRadius:10, border:`1px solid ${T.border}` }}>
          <p style={{ fontSize:12, color:T.txtSec, lineHeight:1.8 }}>
            • Le fichier exporté est au format <strong>JSON</strong> — lisible et modifiable<br/>
            • Les paramètres sont aussi sauvegardés <strong>automatiquement</strong> dans le navigateur<br/>
            • Un export est recommandé <strong>avant toute réinitialisation</strong>
          </p>
        </div>
      </section>

      <section>
        <SectionTitle icon={<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>} title="Informations système"/>
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:8 }}>
          {[
            { label:'Clinique',  value: s.nomCourt || 'Marouane' },
            { label:'Devise',    value: s.devise   || 'GNF' },
            { label:'Version',   value: '1.0.0' },
            { label:'Build',     value: 'Avril 2026 — UGANC' },
          ].map(({ label, value }) => (
            <div key={label} style={{ padding:'11px 14px', background:T.white,
              borderRadius:10, border:`1px solid ${T.border}` }}>
              <p style={{ fontSize:10, color:T.txtMuted, textTransform:'uppercase',
                letterSpacing:'0.08em', marginBottom:3 }}>{label}</p>
              <p style={{ fontSize:13, fontWeight:700, color:T.txt }}>{value}</p>
            </div>
          ))}
        </div>
      </section>

      <section>
        <SectionTitle icon={<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>} title="Zone de danger"
          desc="Actions irréversibles — agissez avec précaution."/>
        {!confirmReset ? (
          <div style={{ padding:'16px', background:T.redSoft, borderRadius:12, border:`1px solid ${T.red}33` }}>
            <p style={{ fontSize:14, fontWeight:700, color:T.red, marginBottom:6 }}>
              Réinitialiser tous les paramètres
            </p>
            <p style={{ fontSize:12, color:'#991b1b', marginBottom:14, lineHeight:1.6 }}>
              Supprime toutes vos personnalisations (identité de la clinique, tarifs, horaires, couleurs)
              et restaure les valeurs d'usine. Cette action est <strong>irréversible</strong>.
            </p>
            <button onClick={()=>setConfirmReset(true)} style={{
              padding:'9px 20px', borderRadius:10, border:`1.5px solid ${T.red}`,
              background:T.white, color:T.red, fontSize:13, fontWeight:600,
              cursor:'pointer', fontFamily:'inherit',
            }}>Réinitialiser les paramètres</button>
          </div>
        ) : (
          <div style={{ padding:'16px', background:T.redSoft, borderRadius:12, border:`2px solid ${T.red}` }}>
            <p style={{ fontSize:14, fontWeight:700, color:T.red, marginBottom:8 }}>
              ⚠️ Confirmer la réinitialisation ?
            </p>
            <p style={{ fontSize:12, color:'#991b1b', marginBottom:16 }}>
              Toutes vos données de configuration seront supprimées définitivement.
            </p>
            <div style={{ display:'flex', gap:10 }}>
              <button onClick={()=>{ resetSettings(); setConfirmReset(false) }} style={{
                padding:'9px 20px', borderRadius:10, border:'none',
                background:T.red, color:'#fff', fontSize:13, fontWeight:700,
                cursor:'pointer', fontFamily:'inherit',
              }}>Oui, réinitialiser</button>
              <button onClick={()=>setConfirmReset(false)} style={{
                padding:'9px 20px', borderRadius:10, border:`1.5px solid ${T.border}`,
                background:T.white, color:T.txtSec, fontSize:13, fontWeight:600,
                cursor:'pointer', fontFamily:'inherit',
              }}>Annuler</button>
            </div>
          </div>
        )}
      </section>
    </div>
  )
}

// ══════════════════════════════════════════════════════════════════
//  MODAL PRINCIPAL
// ══════════════════════════════════════════════════════════════════
const IC = {
  // Établissement — croix médicale dans un bâtiment
  building: <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2"/><line x1="12" y1="8" x2="12" y2="16"/><line x1="8" y1="12" x2="16" y2="12"/></svg>,
  // Horaires — calendrier
  clock:    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/><line x1="8" y1="14" x2="10" y2="14"/><line x1="14" y1="14" x2="16" y2="14"/><line x1="8" y1="18" x2="10" y2="18"/></svg>,
  // Tarification — étiquette prix
  card:     <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"/><line x1="7" y1="7" x2="7.01" y2="7" strokeWidth="3"/></svg>,
  // Dossiers — presse-papiers médical
  folder:   <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/><rect x="8" y="2" width="8" height="4" rx="1"/><line x1="9" y1="12" x2="15" y2="12"/><line x1="9" y1="16" x2="13" y2="16"/></svg>,
  // Notifications — cloche avec point
  bell:     <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/><circle cx="18" cy="5" r="3" fill="currentColor" stroke="none"/></svg>,
  // Apparence — palette de couleurs
  sliders:  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="13.5" cy="6.5" r=".8" fill="currentColor" stroke="none"/><circle cx="17.5" cy="10.5" r=".8" fill="currentColor" stroke="none"/><circle cx="8.5" cy="7.5" r=".8" fill="currentColor" stroke="none"/><circle cx="6.5" cy="12.5" r=".8" fill="currentColor" stroke="none"/><path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10c.926 0 1.648-.746 1.648-1.688 0-.437-.18-.835-.437-1.125-.29-.289-.438-.652-.438-1.125a1.64 1.64 0 0 1 1.668-1.668h1.996c3.051 0 5.555-2.503 5.555-5.554C21.965 6.012 17.461 2 12 2z"/></svg>,
  // Sauvegarde — bouclier avec coche
  save:     <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><polyline points="9 12 11 14 15 10"/></svg>,
}

const TABS = [
  { id:'etablissement', label:'Établissement', icon: IC.building, desc:'Identité & coordonnées'    },
  { id:'horaires',      label:'Horaires',       icon: IC.clock,   desc:'Ouverture & capacité'      },
  { id:'tarification',  label:'Tarification',   icon: IC.card,    desc:'Tarifs & TVA'              },
  { id:'dossiers',      label:'Dossiers',        icon: IC.folder,  desc:'Patients & conservation'   },
  { id:'notifications', label:'Notifications',   icon: IC.bell,    desc:'Alertes & rappels'         },
  { id:'apparence',     label:'Apparence',       icon: IC.sliders, desc:'Couleurs & interface'      },
  { id:'sauvegarde',    label:'Sauvegarde',      icon: IC.save,    desc:'Export & réinitialisation' },
]

export default function SettingsModal({ onClose }) {
  const {
    settings, updateSetting, updateHoraire,
    resetSettings, exportSettings, importSettings,
    JOURS, THEMES_PRESET, FONT_SIZES,
  } = useClinicSettings()

  const [tab,   setTab]   = useState('etablissement')
  const [saved, setSaved] = useState(false)

  const handleSave = () => {
    setSaved(true)
    setTimeout(() => setSaved(false), 2800)
  }

  const activeTab = TABS.find(t => t.id === tab)

  return (
    <>
      <SaveBanner show={saved}/>

      {/* Overlay */}
      <div style={{
        position:'fixed', inset:0, zIndex:9999,
        background:'rgba(15,23,42,0.65)',
        display:'flex', alignItems:'center', justifyContent:'center',
        padding:20, backdropFilter:'blur(4px)',
      }} onClick={e=>{ if(e.target===e.currentTarget) onClose() }}>

        {/* Boîte modale */}
        <div style={{
          background:T.bg, borderRadius:20,
          width:'100%', maxWidth:900, maxHeight:'94vh',
          display:'flex', flexDirection:'column',
          boxShadow:'0 32px 80px rgba(0,0,0,0.35)',
          isolation:'isolate', overflow:'hidden',
        }}>

          {/* ── EN-TÊTE ── */}
          <div style={{
            padding:'18px 24px', background:T.white,
            borderBottom:`1px solid ${T.border}`, flexShrink:0,
            display:'flex', alignItems:'center', gap:14,
          }}>
            <div style={{ width:42, height:42, borderRadius:12, background:T.greenSoft,
              border:`1px solid ${T.green}33`, display:'flex', alignItems:'center',
              justifyContent:'center', flexShrink:0, color:T.green }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><line x1="12" y1="8" x2="12" y2="13"/><line x1="9" y1="10.5" x2="15" y2="10.5"/></svg>
            </div>
            <div style={{ flex:1 }}>
              <p style={{ fontSize:17, fontWeight:800, color:T.txt }}>Paramètres — {settings.nomCourt || 'Clinique Marouane'}</p>
              <p style={{ fontSize:12, color:T.txtMuted }}>
                {activeTab?.desc} · {activeTab?.label}
              </p>
            </div>
            <button onClick={onClose} style={{
              width:34, height:34, borderRadius:10, border:`1px solid ${T.border}`,
              background:T.bg, color:T.txtSec, cursor:'pointer',
              display:'flex', alignItems:'center', justifyContent:'center', fontSize:18,
            }}>×</button>
          </div>

          {/* ── CORPS : SIDEBAR + CONTENU ── */}
          <div style={{ display:'flex', flex:1, overflow:'hidden' }}>

            {/* Sidebar navigation */}
            <nav style={{
              width:200, flexShrink:0, background:T.white,
              borderRight:`1px solid ${T.border}`,
              padding:'12px 8px', display:'flex',
              flexDirection:'column', gap:2, overflowY:'auto',
            }}>
              {TABS.map(t => {
                const isActive = tab === t.id
                return (
                  <button key={t.id} onClick={()=>setTab(t.id)} style={{
                    width:'100%', padding:'10px 12px', borderRadius:10, border:'none',
                    background: isActive ? '#f0fdf4' : 'transparent',
                    color: isActive ? T.green : T.txtSec,
                    cursor:'pointer', textAlign:'left', fontFamily:'inherit',
                    display:'flex', alignItems:'center', gap:10,
                    transition:'all .15s',
                    borderLeft: isActive ? `3px solid ${T.green}` : '3px solid transparent',
                  }}
                    onMouseEnter={e=>{ if(!isActive) e.currentTarget.style.background=T.bgDeep }}
                    onMouseLeave={e=>{ if(!isActive) e.currentTarget.style.background='transparent' }}
                  >
                    <span style={{ display:'flex', flexShrink:0 }}>{t.icon}</span>
                    <div>
                      <p style={{ fontSize:12, fontWeight: isActive ? 700 : 500, lineHeight:1.2 }}>{t.label}</p>
                      <p style={{ fontSize:10, color:T.txtMuted, marginTop:1 }}>{t.desc}</p>
                    </div>
                  </button>
                )
              })}
            </nav>

            {/* Zone de contenu scrollable */}
            <div style={{ flex:1, overflowY:'auto', padding:'24px 28px' }}>
              {tab==='etablissement' && <TabEtablissement  s={settings} u={updateSetting}/>}
              {tab==='horaires'      && <TabHoraires       s={settings} u={updateSetting} uh={updateHoraire} JOURS={JOURS}/>}
              {tab==='tarification'  && <TabTarification   s={settings} u={updateSetting}/>}
              {tab==='dossiers'      && <TabDossiers        s={settings} u={updateSetting}/>}
              {tab==='notifications' && <TabNotifications   s={settings} u={updateSetting}/>}
              {tab==='apparence'     && <TabApparence       s={settings} u={updateSetting} THEMES_PRESET={THEMES_PRESET} FONT_SIZES={FONT_SIZES}/>}
              {tab==='sauvegarde'    && <TabSauvegarde      s={settings} resetSettings={resetSettings} exportSettings={exportSettings} importSettings={importSettings}/>}
            </div>
          </div>

          {/* ── PIED DE PAGE ── */}
          <div style={{
            padding:'13px 24px', background:T.white,
            borderTop:`1px solid ${T.border}`, flexShrink:0,
            display:'flex', justifyContent:'space-between', alignItems:'center',
          }}>
            <p style={{ fontSize:11, color:T.txtMuted }}>
              Modifications appliquées en temps réel · Sauvegarde automatique active
            </p>
            <div style={{ display:'flex', gap:10 }}>
              <button onClick={onClose} style={{
                padding:'9px 20px', borderRadius:10, border:`1.5px solid ${T.border}`,
                background:T.white, color:T.txtSec, fontSize:13, fontWeight:600,
                cursor:'pointer', fontFamily:'inherit',
              }}>Fermer</button>
              <button onClick={handleSave} style={{
                padding:'9px 22px', borderRadius:10, border:'none',
                background:T.green, color:'#fff', fontSize:13, fontWeight:700,
                cursor:'pointer', fontFamily:'inherit',
                display:'flex', alignItems:'center', gap:7,
                boxShadow:`0 4px 14px ${T.green}44`,
              }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                  <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/>
                  <polyline points="17 21 17 13 7 13 7 21"/>
                  <polyline points="7 3 7 8 15 8"/>
                </svg>
                Sauvegarder
              </button>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes fadeUp { from { opacity:0; transform:translateY(12px) } to { opacity:1; transform:translateY(0) } }
      `}</style>
    </>
  )
}