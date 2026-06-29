import { useState } from "react"
import {
  C, calcAge, isGynecoObst, TYPE_CONSULT_LABEL,
  SYMPTOMES_DIAGNOSTICS, PATHOLOGIES_COMMUNES, EXAMENS_PAR_CATEGORIE,
  mergePrenatalInit, mergeAccouchInit,
  Avatar, TypeConsultBadge, Btn, inputSt, labelSt, RegSection,
} from "./shared.jsx"

// Import des formulaires spécialisés par service
import ConsultationCardio from "./services/cardiologie/consultation.jsx"
import ConsultationPedo from "./services/pediatrie/consultation.jsx"
import ConsultationDiabeto from "./services/diabetologie/consultation.jsx"
import ConsultationNeuro from "./services/neurologie/consultation.jsx"
import ConsultationGyneco from "./services/gynecologie/consultation.jsx"

const LISTE_SERVICES = [
  "Cardiologie",
  "Pédiatrie",
  "Gynécologie",
  "Diabétologie",
  "Neurologie",
  "Ophtalmologie",
  "Traumatologie",
  "ORL",
  "Urologie",
  "Chirurgie",
  "Dermatologie",
  "Oncologie",
  "Maladies infectieuses",
  "Stomatologie"
]

// ══════════════════════════════════════════════════════
//  MODAL — FORMULAIRE CONSULTATION
// ══════════════════════════════════════════════════════
export default function ModalConsultation({
  patient, medecin, consultation, onClose, onSauvegarder, onSigner,
  attenteResultatsLabo = false, laboValide = false,
}) {
  const mode = patient?.typeConsultation || consultation?.typeConsultation || "standard"
  const specGyn = isGynecoObst(medecin?.specialite)

  // Use the new ConsultationGyneco form for both standard and CPN (prenatal) modes
  const showGyneco = specGyn && (mode === "standard" || mode === "prenatal")
  const showPrenatal = specGyn && mode === "prenatal" && !showGyneco // disabled in favor of showGyneco
  const showAcc = specGyn && mode === "accouchement"
  const warnWrongService = !specGyn && mode !== "standard"

  // Détection du service pour afficher le formulaire spécialisé
  const specialite = medecin?.specialite?.toLowerCase() || ""
  const showCardio = specialite.includes("cardio") && mode === "standard"
  const showPedo = (specialite.includes("pédiatre") || specialite.includes("pediatre")) && mode === "standard"
  const showDiabeto = (specialite.includes("diabéto") || specialite.includes("diabeto")) && mode === "standard"
  const showNeuro = specialite.includes("neuro") && mode === "standard"
  const showSpecializedForm = showCardio || showPedo || showDiabeto || showNeuro || showGyneco

  const dp = consultation?.donneesPrenatal || {}
  const da = consultation?.donneesAccouchement || {}
  const [observations, setObservations] = useState(consultation?.observations || "")

  const [form, setForm] = useState({
    motif: consultation?.motif || patient?.motif || "",
    plaintes: consultation?.plaintes || consultation?.observations || "",
    antecedents: consultation?.antecedents || "",
    poids: consultation?.poids || "",
    montantConsultation: consultation?.montantConsultation ?? patient?.montantConsultation ?? "",
    diagPresomption: consultation?.diagPresomption || consultation?.symptomes || "",
    diagDefinitif: (consultation?.diagDefinitif || consultation?.diagnostics || []).join(", "),
    pathologies: (consultation?.pathologies || []).join(", "),
    traitements: (consultation?.traitements || []).join(", "),
    commentaires: consultation?.commentaires || "",
  })
  const [prenatal, setPrenatal] = useState(() => mergePrenatalInit(dp))
  const [accouch, setAccouch] = useState(() => mergeAccouchInit(da))
  const [examensCommandes, setExamensCommandes] = useState(consultation?.examensCommandes || [])
  const [showAddExamen, setShowAddExamen] = useState(false)
  const [refInterServices, setRefInterServices] = useState([])
  const [refPriorite, setRefPriorite] = useState("Normale")
  const [refMotif, setRefMotif] = useState("")
  const [refCommentaires, setRefCommentaires] = useState("")
  const handleToggleService = (srv) => {
    setRefInterServices(p => p.includes(srv) ? p.filter(x => x !== srv) : [...p, srv])
  }
  const [exCat, setExCat] = useState(Object.keys(EXAMENS_PAR_CATEGORIE)[0])
  const [exCustomNom, setExCustomNom] = useState("")
  const [exCustomPrix, setExCustomPrix] = useState("")
  const fraisExamens = examensCommandes.reduce((s, e) => s + (parseInt(e.prix) || 0), 0)

  const ajouterExamen = (ex) => {
    if (examensCommandes.find(e => e.nom === ex.nom)) return
    setExamensCommandes(p => [...p, { id: Date.now(), nom: ex.nom, prix: 0, categorie: exCat }])
  }
  const ajouterCustom = () => {
    if (!exCustomNom.trim()) return
    setExamensCommandes(p => [...p, { id: Date.now(), nom: exCustomNom.trim(), prix: parseInt(exCustomPrix) || 0, categorie: "Autre" }])
    setExCustomNom(""); setExCustomPrix("")
  }
  const supprimerExamen = (id) => setExamensCommandes(p => p.filter(e => e.id !== id))
  const updateExamenPrix = (id, val) => setExamensCommandes(p => p.map(e => e.id === id ? { ...e, prix: parseInt(val) || 0 } : e))

  const ASSISTANT_VIDE = { nom: "", service: "", participation: 0, connaissances: 0, comportement: 0, commentaire: "" }
  const [assistants, setAssistants] = useState(consultation?.assistants || consultation?.stagiaires || [])
  const addAssistant = () => setAssistants(p => [...p, { ...ASSISTANT_VIDE, id: Date.now() }])
  const removeAssistant = id => setAssistants(p => p.filter(s => s.id !== id))
  const updateAssistant = (id, k, v) => setAssistants(p => p.map(s => s.id === id ? { ...s, [k]: v } : s))
  const [suggestions, setSuggestions] = useState([])
  const f = (k, v) => setForm(p => ({ ...p, [k]: v }))
  const fp = (k, v) => setPrenatal(p => ({ ...p, [k]: v }))
  const fa = (k, v) => setAccouch(p => ({ ...p, [k]: v }))

  const genSuggestions = (txt) => {
    const mots = txt.toLowerCase().split(/[,\s]+/).filter(Boolean)
    const res = new Set()
    mots.forEach(mot => {
      Object.entries(SYMPTOMES_DIAGNOSTICS).forEach(([key, diags]) => {
        if (key.toLowerCase().includes(mot) || mot.length > 3 && key.toLowerCase().split(" ").some(w => w.startsWith(mot)))
          diags.forEach(d => res.add(d))
      })
    })
    setSuggestions(Array.from(res))
  }

  const age = calcAge(patient?.dateNaissance)

  if (!patient) return null

  const ajouterTag = (champ, val) => {
    const curr = form[champ].split(",").map(x => x.trim()).filter(Boolean)
    if (!curr.includes(val)) f(champ, [...curr, val].join(", "))
  }

  const parseList = str => str.split(",").map(x => x.trim()).filter(Boolean)

  const aDesExamens = examensCommandes.length > 0
  const peutSigner = !aDesExamens || laboValide
  const doitEnvoyerLabo = aDesExamens && !attenteResultatsLabo

  const valider = (signer, envoyerLabo = false) => {
    if (!form.plaintes.trim()) { alert("Les plaintes du patient sont obligatoires."); return }
    if (signer && aDesExamens && !laboValide) {
      alert("Impossible de signer tant que le laboratoire n'a pas validé les résultats des examens.")
      return
    }
    if (signer && !form.diagDefinitif.trim()) { alert("Le diagnostic définitif est obligatoire pour signer."); return }
    if (showPrenatal && !prenatal.ddr.trim() && !prenatal.termeSA.trim()) {
      alert("Pour une CPN, indiquez au minimum la DDR ou le terme (semaines d'aménorrhée)."); return
    }
    if (showAcc && !accouch.dateAcc.trim()) {
      alert("Pour le registre d'accouchement, la date de l'accouchement est obligatoire."); return
    }
    if (refInterServices.length > 0 && !refMotif.trim()) {
      alert("Le motif de la référence inter-services est obligatoire."); return
    }
    const data = {
      motif: form.motif,
      plaintes: form.plaintes,
      montantConsultation: form.montantConsultation ? Number(form.montantConsultation) : undefined,
      antecedents: form.antecedents,
      poids: form.poids,
      diagPresomption: form.diagPresomption,
      diagDefinitif: parseList(form.diagDefinitif),
      diagnostics: parseList(form.diagDefinitif),
      pathologies: parseList(form.pathologies),
      examensCommandes,
      examens: examensCommandes.map(e => e.nom),
      fraisExamens,
      traitements: parseList(form.traitements),
      commentaires: form.commentaires,
      typeConsultation: mode,
      assistants: assistants.filter(s => s.nom.trim()),
      refInterServices,
      refPriorite,
      refMotif,
      refCommentaires,
      ...(showPrenatal && { donneesPrenatal: { ...prenatal, parite: prenatal.gestiteParite, terme: prenatal.termeSA } }),
      ...(showAcc && { donneesAccouchement: { ...accouch } }),
    }
    if (signer) onSigner(data)
    else onSauvegarder({ ...data, envoyerLabo })
  }

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(15,23,42,0.5)", zIndex: 200, display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}
      onClick={e => { if (e.target === e.currentTarget) onClose() }}>
      <div style={{ background: C.white, borderRadius: 20, width: "100%", maxWidth: showSpecializedForm || showPrenatal || showAcc ? 1000 : 680, maxHeight: "92vh", overflow: "auto", boxShadow: "0 25px 60px rgba(0,0,0,0.2)" }}>

        {/* Header bleu */}
        <div style={{ padding: "22px 28px 20px", borderBottom: "1px solid " + C.border, background: "linear-gradient(135deg,#1e40af,#2563eb)", borderRadius: "20px 20px 0 0", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
            <Avatar name={patient.nom} size={46} bg="rgba(255,255,255,0.25)" />
            <div>
              <p style={{ fontSize: 16, fontWeight: 800, color: "#fff", marginBottom: 3 }}>{patient.nom}</p>
              <p style={{ fontSize: 12, color: "rgba(255,255,255,0.75)", display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                {patient.pid} · {calcAge(patient.dateNaissance)} ans · {medecin.specialite}
                <TypeConsultBadge type={mode} />
              </p>
            </div>
          </div>
          <button onClick={onClose} style={{ background: "rgba(255,255,255,0.15)", border: "none", borderRadius: 8, color: "#fff", cursor: "pointer", width: 32, height: 32, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18 }}>×</button>
        </div>

        <div style={{ padding: "24px 28px", display: "flex", flexDirection: "column", gap: 16 }}>

          {warnWrongService && (
            <div style={{ background: C.slateSoft, border: "1px solid " + C.slate + "44", borderRadius: 12, padding: "12px 14px" }}>
              <p style={{ fontSize: 13, color: "#92400e", fontWeight: 600 }}>Ce dossier est typé « {TYPE_CONSULT_LABEL[mode]?.label || mode} ». Vous n'êtes pas en gynécologie — le formulaire spécialisé est masqué ; utilisez la consultation standard.</p>
            </div>
          )}

          {patient.typeVisite === "rendez_vous" && patient.motifRdv && (
            <div style={{ background: C.blueSoft, border: "1px solid " + C.blue + "33", borderRadius: 12, padding: "12px 14px" }}>
              <p style={{ fontSize: 11, fontWeight: 700, color: C.textPri, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 6 }}>Pourquoi ce rendez-vous</p>
              <p style={{ fontSize: 14, color: C.textPri, lineHeight: 1.45 }}>{patient.motifRdv}</p>
            </div>
          )}

          {(patient.plaintesChef || patient.symptomesChef || patient.diagnosticPreliminaireChef) && (
            <div style={{ background: C.greenSoft, border: "1px solid " + C.green + "33", borderRadius: 12, padding: "12px 14px" }}>
              <p style={{ fontSize: 11, fontWeight: 700, color: C.green, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 8 }}>Transmis par le médecin chef (accueil)</p>
              {patient.plaintesChef && <p style={{ fontSize: 13, marginBottom: 4 }}><strong>Plaintes :</strong> {patient.plaintesChef}</p>}
              {patient.symptomesChef && <p style={{ fontSize: 13, marginBottom: 4 }}><strong>Antécédents :</strong> {patient.symptomesChef}</p>}
              {patient.antecedentsChef && <p style={{ fontSize: 13, marginBottom: 4 }}><strong>Antécédents :</strong> {patient.antecedentsChef}</p>}
              {patient.diagnosticPreliminaireChef && <p style={{ fontSize: 13 }}><strong>Diag. présomption :</strong> {patient.diagnosticPreliminaireChef}</p>}
            </div>
          )}

          {showPrenatal && (
            <div style={{ background: C.bg, border: "1px solid " + C.border, borderRadius: 14, padding: "16px 18px" }}>
              <p style={{ fontSize: 13, fontWeight: 800, color: C.textPri, marginBottom: 4 }}>Registre de consultation prénatale (CPN)</p>
              <p style={{ fontSize: 11, color: C.textMuted, marginBottom: 16 }}>Champs calqués sur le registre papier — saisie par sections.</p>

              <div style={{ background: C.white, border: "1px dashed " + C.border, borderRadius: 10, padding: "10px 12px", marginBottom: 16, fontSize: 12, color: C.textSec }}>
                <strong style={{ color: C.textPri }}>Patient :</strong> {patient.nom} · {patient.pid} · {calcAge(patient.dateNaissance)} ans · {patient.adresse || "—"}
              </div>

              <RegSection title="Suivi de grossesse & rendez-vous">
                <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12 }}>
                  <div><label style={labelSt}>DDR</label><input value={prenatal.ddr} onChange={e => fp("ddr", e.target.value)} type="date" style={inputSt} /></div>
                  <div><label style={labelSt}>Âge de la grossesse (terme)</label><input value={prenatal.termeSA} onChange={e => fp("termeSA", e.target.value)} placeholder="ex. 36 sa" style={inputSt} /></div>
                  <div><label style={labelSt}>Gestité / parité (G / P)</label><input value={prenatal.gestiteParite} onChange={e => fp("gestiteParite", e.target.value)} placeholder="G2P1" style={inputSt} /></div>
                  <div><label style={labelSt}>Date du RDV</label><input value={prenatal.dateRdv} onChange={e => fp("dateRdv", e.target.value)} type="date" style={inputSt} /></div>
                  <div><label style={labelSt}>Visite CPN (n°)</label>
                    <select value={prenatal.visiteCpn} onChange={e => fp("visiteCpn", e.target.value)} style={{ ...inputSt, cursor: "pointer" }}>
                      <option value="">—</option>
                      <option value="1">1re visite</option>
                      <option value="2">2e visite</option>
                      <option value="3">3e visite</option>
                      <option value="4+">4e et +</option>
                    </select>
                  </div>
                  <div><label style={labelSt}>Risque</label>
                    <select value={prenatal.risque} onChange={e => fp("risque", e.target.value)} style={{ ...inputSt, cursor: "pointer" }}>
                      <option value="">—</option>
                      <option value="non">Non signalé</option>
                      <option value="oui">Grossesse à risque</option>
                    </select>
                  </div>
                </div>
              </RegSection>

              <RegSection title="Taille & signes vitaux (P, TA, HU)">
                <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12 }}>
                  <div><label style={labelSt}>Taille (cm)</label><input value={prenatal.tailleCm} onChange={e => fp("tailleCm", e.target.value)} style={inputSt} /></div>
                  <div><label style={labelSt}>P — Poids (kg)</label><input value={prenatal.poids} onChange={e => fp("poids", e.target.value)} style={inputSt} /></div>
                  <div><label style={labelSt}>TA</label><input value={prenatal.ta} onChange={e => fp("ta", e.target.value)} placeholder="12/8" style={inputSt} /></div>
                  <div><label style={labelSt}>HU (cm)</label><input value={prenatal.hu} onChange={e => fp("hu", e.target.value)} style={inputSt} /></div>
                </div>
              </RegSection>

              <RegSection title="Foetus — BCF, MAF, présentation">
                <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12 }}>
                  <div><label style={labelSt}>BDCF / BCF (bpm)</label><input value={prenatal.bcf} onChange={e => fp("bcf", e.target.value)} style={inputSt} /></div>
                  <div><label style={labelSt}>MAF (mouvements actifs fœtaux)</label><input value={prenatal.maf} onChange={e => fp("maf", e.target.value)} placeholder="Normaux / diminués…" style={inputSt} /></div>
                  <div><label style={labelSt}>Présentation</label><input value={prenatal.presentation} onChange={e => fp("presentation", e.target.value)} placeholder="Céphalique…" style={inputSt} /></div>
                </div>
              </RegSection>

              <RegSection title="Bandelette — albumine / sucre">
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                  <div><label style={labelSt}>Albumine</label><input value={prenatal.albumine} onChange={e => fp("albumine", e.target.value)} placeholder="Négatif / +…" style={inputSt} /></div>
                  <div><label style={labelSt}>Sucre</label><input value={prenatal.sucre} onChange={e => fp("sucre", e.target.value)} placeholder="Négatif / +…" style={inputSt} /></div>
                </div>
              </RegSection>

              <RegSection title="Vaccination (VAT) & suppléments — Fer / acide folique — TPI — MII / MILD">
                <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12 }}>
                  <div><label style={labelSt}>VAT (doses / statut)</label><input value={prenatal.vat} onChange={e => fp("vat", e.target.value)} placeholder="ex. VAT3" style={inputSt} /></div>
                  <div><label style={labelSt}>Fer</label><input value={prenatal.fer} onChange={e => fp("fer", e.target.value)} style={inputSt} /></div>
                  <div><label style={labelSt}>Acide folique</label><input value={prenatal.acideFolique} onChange={e => fp("acideFolique", e.target.value)} style={inputSt} /></div>
                  <div><label style={labelSt}>TPI (paludisme)</label><input value={prenatal.tpi} onChange={e => fp("tpi", e.target.value)} placeholder="C1, C2, C3…" style={inputSt} /></div>
                  <div><label style={labelSt}>MII / MILD (moustiquaire)</label>
                    <select value={prenatal.miiMild} onChange={e => fp("miiMild", e.target.value)} style={{ ...inputSt, cursor: "pointer" }}>
                      <option value="">—</option>
                      <option value="oui">Oui</option>
                      <option value="non">Non</option>
                    </select>
                  </div>
                </div>
              </RegSection>

              <RegSection title="PTME (prévention transmission mère-enfant)">
                <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12 }}>
                  <div><label style={labelSt}>Conseil</label><input value={prenatal.ptmeConseil} onChange={e => fp("ptmeConseil", e.target.value)} style={inputSt} /></div>
                  <div><label style={labelSt}>Test</label><input value={prenatal.ptmeTest} onChange={e => fp("ptmeTest", e.target.value)} style={inputSt} /></div>
                  <div><label style={labelSt}>Résultat</label><input value={prenatal.ptmeResultat} onChange={e => fp("ptmeResultat", e.target.value)} style={inputSt} /></div>
                  <div><label style={labelSt}>ARV</label><input value={prenatal.ptmeArv} onChange={e => fp("ptmeArv", e.target.value)} style={inputSt} /></div>
                  <div style={{ gridColumn: "1 / -1" }}><label style={labelSt}>Partenaire</label><input value={prenatal.ptmePartenaire} onChange={e => fp("ptmePartenaire", e.target.value)} style={inputSt} /></div>
                </div>
              </RegSection>

              <RegSection title="Constats / problèmes & notes CPN">
                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  <div><label style={labelSt}>Constats / problèmes</label><textarea value={prenatal.constatsProblemes} onChange={e => fp("constatsProblemes", e.target.value)} rows={2} style={inputSt} /></div>
                  <div><label style={labelSt}>Observations & notes (suivi prochain RDV, écho…)</label><textarea value={prenatal.notesCpn} onChange={e => fp("notesCpn", e.target.value)} rows={2} style={inputSt} /></div>
                </div>
              </RegSection>
            </div>
          )}

          {/* Formulaires spécialisés par service - affichés SEULEMENT si showSpecializedForm */}
          {showSpecializedForm && (
            <div style={{ background: C.bg, border: "1px solid " + C.border, borderRadius: 14, padding: "16px 18px" }}>
              {showCardio && (
                <ConsultationCardio
                  patient={patient}
                  consultation={consultation}
                  onSave={(data) => {
                    onSauvegarder({ ...form, ...data })
                    onClose()
                  }}
                  onCancel={onClose}
                />
              )}
              {showPedo && (
                <ConsultationPedo
                  patient={patient}
                  consultation={consultation}
                  onSave={(data) => {
                    onSauvegarder({ ...form, ...data })
                    onClose()
                  }}
                  onCancel={onClose}
                />
              )}
              {showDiabeto && (
                <ConsultationDiabeto
                  patient={patient}
                  consultation={consultation}
                  onSave={(data) => {
                    onSauvegarder({ ...form, ...data })
                    onClose()
                  }}
                  onCancel={onClose}
                />
              )}
              {showNeuro && (
                <ConsultationNeuro
                  patient={patient}
                  consultation={consultation}
                  onSave={(data) => {
                    onSauvegarder({ ...form, ...data })
                    onClose()
                  }}
                  onCancel={onClose}
                />
              )}
              {showGyneco && (
                <ConsultationGyneco
                  patient={patient}
                  consultation={consultation}
                  medecin={medecin}
                  onSave={(data) => {
                    onSauvegarder({ ...form, ...data })
                    onClose()
                  }}
                  onSigner={(data) => {
                    onSigner({ ...form, ...data })
                    onClose()
                  }}
                  onCancel={onClose}
                />
              )}
            </div>
          )}

          {/* Accouchement section - only show if not showing specialized form */}
          {showAcc && !showSpecializedForm && (
            <div style={{ background: C.bg, border: "1px solid " + C.border, borderRadius: 14, padding: "16px 18px" }}>
              <p style={{ fontSize: 13, fontWeight: 800, color: C.textPri, marginBottom: 4 }}>Registre de l'accouchement (CS)</p>
              <p style={{ fontSize: 11, color: C.textMuted, marginBottom: 16 }}>Aligné sur le registre papier — sections détaillées.</p>

              <RegSection title="Accouchement & séjour">
                <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12 }}>
                  <div><label style={labelSt}>Date d'accouchement <span style={{ color: C.red }}>*</span></label><input value={accouch.dateAcc} onChange={e => fa("dateAcc", e.target.value)} type="date" style={inputSt} /></div>
                  <div><label style={labelSt}>Heure</label><input value={accouch.heureAcc} onChange={e => fa("heureAcc", e.target.value)} type="time" style={inputSt} /></div>
                  <div><label style={labelSt}>Date de sortie</label><input value={accouch.dateSortie} onChange={e => fa("dateSortie", e.target.value)} type="date" style={inputSt} /></div>
                  <div><label style={labelSt}>Journées d'hospitalisation</label><input value={accouch.joursHospitalisation} onChange={e => fa("joursHospitalisation", e.target.value)} placeholder="ex. 2" style={inputSt} /></div>
                  <div style={{ gridColumn: "1 / -1" }}><label style={labelSt}>Quantité de sang perdu (ml)</label><input value={accouch.sangPerduMl} onChange={e => fa("sangPerduMl", e.target.value)} style={inputSt} /></div>
                </div>
              </RegSection>

              <RegSection title="Antécédents — derniers nés & VAT mère">
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                  <div><label style={labelSt}>Dernier né vivant</label><input value={accouch.dernierNeVivant} onChange={e => fa("dernierNeVivant", e.target.value)} style={inputSt} /></div>
                  <div><label style={labelSt}>Avant-dernier né vivant</label><input value={accouch.avantDernierNeVivant} onChange={e => fa("avantDernierNeVivant", e.target.value)} style={inputSt} /></div>
                  <div style={{ gridColumn: "1 / -1" }}><label style={labelSt}>Vaccination mère (VAT)</label><input value={accouch.vatMere} onChange={e => fa("vatMere", e.target.value)} style={inputSt} /></div>
                </div>
              </RegSection>

              <RegSection title="Voie d'accouchement & nouveau-né">
                <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12 }}>
                  <div style={{ gridColumn: "1 / -1" }}><label style={labelSt}>Voie</label>
                    <select value={accouch.voie} onChange={e => fa("voie", e.target.value)} style={{ ...inputSt, cursor: "pointer" }}>
                      <option value="">—</option>
                      <option value="basse">Voie basse</option>
                      <option value="cesarienne">Césarienne</option>
                      <option value="instrumentale">Instrumentale</option>
                    </select>
                  </div>
                  <div><label style={labelSt}>Sexe</label>
                    <select value={accouch.sexeNN} onChange={e => fa("sexeNN", e.target.value)} style={{ ...inputSt, cursor: "pointer" }}>
                      <option value="">—</option>
                      <option value="F">F</option>
                      <option value="M">M</option>
                    </select>
                  </div>
                  <div><label style={labelSt}>Poids (g)</label><input value={accouch.poidsNN} onChange={e => fa("poidsNN", e.target.value)} style={inputSt} /></div>
                  <div><label style={labelSt}>Taille (cm)</label><input value={accouch.tailleNN} onChange={e => fa("tailleNN", e.target.value)} style={inputSt} /></div>
                  <div><label style={labelSt}>PC (cm)</label><input value={accouch.pc} onChange={e => fa("pc", e.target.value)} style={inputSt} /></div>
                  <div><label style={labelSt}>APGAR 1 min</label><input value={accouch.apgar1} onChange={e => fa("apgar1", e.target.value)} style={inputSt} /></div>
                  <div><label style={labelSt}>APGAR 5 min</label><input value={accouch.apgar5} onChange={e => fa("apgar5", e.target.value)} style={inputSt} /></div>
                  <div><label style={labelSt}>APGAR 10 min</label><input value={accouch.apgar10} onChange={e => fa("apgar10", e.target.value)} style={inputSt} /></div>
                </div>
              </RegSection>

              <RegSection title="Soins immédiats — cordon, sein, yeux, Vit K1, vaccins">
                <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12 }}>
                  <div><label style={labelSt}>Mode de sortie NN</label>
                    <select value={accouch.modeSortie} onChange={e => fa("modeSortie", e.target.value)} style={{ ...inputSt, cursor: "pointer" }}>
                      <option value="">—</option>
                      <option value="vivant">Vivant</option>
                      <option value="decede">Décédé</option>
                      <option value="transfere">Transféré</option>
                    </select>
                  </div>
                  <div><label style={labelSt}>Soin du cordon</label><input value={accouch.soinCordon} onChange={e => fa("soinCordon", e.target.value)} style={inputSt} /></div>
                  <div><label style={labelSt}>Mise au sein dans l'heure</label>
                    <select value={accouch.miseAuSein1h} onChange={e => fa("miseAuSein1h", e.target.value)} style={{ ...inputSt, cursor: "pointer" }}>
                      <option value="">—</option>
                      <option value="oui">Oui</option>
                      <option value="non">Non</option>
                    </select>
                  </div>
                  <div><label style={labelSt}>Soin des yeux (ex. tétracycline)</label><input value={accouch.soinYeux} onChange={e => fa("soinYeux", e.target.value)} style={inputSt} /></div>
                  <div><label style={labelSt}>Vitamine K1</label>
                    <select value={accouch.vitamineK1} onChange={e => fa("vitamineK1", e.target.value)} style={{ ...inputSt, cursor: "pointer" }}>
                      <option value="">—</option>
                      <option value="oui">Oui</option>
                      <option value="non">Non</option>
                    </select>
                  </div>
                  <div><label style={labelSt}>VPO 0</label>
                    <select value={accouch.vpo0} onChange={e => fa("vpo0", e.target.value)} style={{ ...inputSt, cursor: "pointer" }}>
                      <option value="">—</option>
                      <option value="oui">Oui</option>
                      <option value="non">Non</option>
                    </select>
                  </div>
                  <div><label style={labelSt}>BCG</label>
                    <select value={accouch.bcg} onChange={e => fa("bcg", e.target.value)} style={{ ...inputSt, cursor: "pointer" }}>
                      <option value="">—</option>
                      <option value="oui">Oui</option>
                      <option value="non">Non</option>
                    </select>
                  </div>
                </div>
              </RegSection>

              <RegSection title="État à la sortie — partogramme — personnel">
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                  <div><label style={labelSt}>État à la sortie (mère)</label><input value={accouch.etatSortieMere} onChange={e => fa("etatSortieMere", e.target.value)} style={inputSt} /></div>
                  <div><label style={labelSt}>État à la sortie (enfant)</label><input value={accouch.etatSortieEnfant} onChange={e => fa("etatSortieEnfant", e.target.value)} style={inputSt} /></div>
                  <div><label style={labelSt}>Partogramme</label>
                    <select value={accouch.partogramme} onChange={e => fa("partogramme", e.target.value)} style={{ ...inputSt, cursor: "pointer" }}>
                      <option value="">—</option>
                      <option value="oui">Rempli</option>
                      <option value="non">Non</option>
                    </select>
                  </div>
                  <div><label style={labelSt}>Personnel qualifié (nom / signature)</label><input value={accouch.personnelQualifie} onChange={e => fa("personnelQualifie", e.target.value)} style={inputSt} /></div>
                </div>
              </RegSection>

              <RegSection title="Complications & observations">
                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  <div><label style={labelSt}>Complications (mère / enfant)</label><textarea value={accouch.complicationsMere} onChange={e => fa("complicationsMere", e.target.value)} rows={2} style={inputSt} /></div>
                  <div><label style={labelSt}>Observations</label><textarea value={accouch.notes} onChange={e => fa("notes", e.target.value)} rows={2} style={inputSt} /></div>
                </div>
              </RegSection>
            </div>
          )}

          {!showSpecializedForm && (
            <>
              {/* Motif */}
              <div>
                <label style={labelSt}>Motif de consultation</label>
                <input value={form.motif} onChange={e => f("motif", e.target.value)} placeholder="Ex : Douleur thoracique, suivi…"
                  style={{ ...inputSt, resize: "none" }}
                  onFocus={e => e.target.style.borderColor = C.blue} onBlur={e => e.target.style.borderColor = C.border} />
              </div>

              {/* Plaintes du patient */}
              <div>
                <label style={labelSt}>Plaintes du patient <span style={{ color: C.red }}>*</span></label>
                <textarea value={form.plaintes} onChange={e => f("plaintes", e.target.value)}
                  placeholder="Ce que le patient exprime : douleur, malaise, durée des symptômes…" rows={3} style={inputSt}
                  onFocus={e => e.target.style.borderColor = C.blue} onBlur={e => e.target.style.borderColor = C.border} />
              </div>

              {/* Antécédents + Poids */}
              <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: 14 }}>
                <div>
                  <label style={labelSt}>Antécédents du patient</label>
                  <textarea value={form.antecedents} onChange={e => f("antecedents", e.target.value)}
                    placeholder="Maladies chroniques, chirurgies, allergies, antécédents familiaux…" rows={2} style={inputSt}
                    onFocus={e => e.target.style.borderColor = C.blue} onBlur={e => e.target.style.borderColor = C.border} />
                </div>
                <div>
                  <label style={labelSt}>Poids (kg)</label>
                  <input type="number" value={form.poids} onChange={e => f("poids", e.target.value)} placeholder="Ex : 68"
                    style={{ ...inputSt, resize: "none" }}
                    onFocus={e => e.target.style.borderColor = C.blue} onBlur={e => e.target.style.borderColor = C.border} />
                </div>
              </div>

              <div>
                <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: C.textPri, marginBottom: 6 }}>Observations</label>
                <input value={observations} onChange={e => setObservations(e.target.value)}
                  placeholder="Ex : Etat général, température..."
                  style={inputSt}
                  onFocus={e => e.target.style.borderColor = C.blue} onBlur={e => e.target.style.borderColor = C.border}
                />
              </div>
              {/* Diagnostic de présomption + suggestions auto */}
              <div>
                <label style={labelSt}>Diagnostic de présomption</label>
                <textarea value={form.diagPresomption} onChange={e => { f("diagPresomption", e.target.value); genSuggestions(e.target.value) }}
                  placeholder="Diag. présomption diagnostique à ce stade de l'examen…" rows={2} style={inputSt}
                  onFocus={e => e.target.style.borderColor = C.blue} onBlur={e => e.target.style.borderColor = C.border} />
                {suggestions.length > 0 && (
                  <div style={{ marginTop: 8, padding: "10px 14px", background: C.blueSoft, borderRadius: 10, border: "1px solid " + C.blue + "33" }}>
                    <p style={{ fontSize: 12, fontWeight: 700, color: C.textPri, marginBottom: 8 }}>Suggestions basées sur le diagnostic de présomption :</p>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                      {suggestions.map(s => (
                        <button key={s} type="button" onClick={() => ajouterTag("diagDefinitif", s)}
                          style={{ padding: "3px 10px", background: C.white, color: C.blue, border: "1px solid " + C.blue + "44", borderRadius: 20, fontSize: 12, fontWeight: 600, cursor: "pointer" }}>
                          + {s}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Diagnostic définitif & Pathologies */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
                <div>
                  <label style={labelSt}>Diagnostic définitif <span style={{ color: C.red }}>*</span></label>
                  <input value={form.diagDefinitif} onChange={e => f("diagDefinitif", e.target.value)} placeholder="Séparer par des virgules"
                    style={{ ...inputSt, resize: "none" }}
                    onFocus={e => e.target.style.borderColor = C.blue} onBlur={e => e.target.style.borderColor = C.border} />
                </div>
                <div>
                  <label style={labelSt}>Pathologies associées</label>
                  <input value={form.pathologies} onChange={e => f("pathologies", e.target.value)} placeholder="Séparer par des virgules"
                    style={{ ...inputSt, resize: "none" }}
                    onFocus={e => e.target.style.borderColor = C.blue} onBlur={e => e.target.style.borderColor = C.border} />
                  <div style={{ marginTop: 6, display: "flex", flexWrap: "wrap", gap: 4 }}>
                    {PATHOLOGIES_COMMUNES.slice(0, 7).map(p => (
                      <button key={p} type="button" onClick={() => ajouterTag("pathologies", p)}
                        style={{ padding: "2px 8px", background: C.slateSoft, color: C.textSec, border: "1px solid " + C.border, borderRadius: 12, fontSize: 11, cursor: "pointer", fontWeight: 500 }}>
                        + {p}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Examens demandés — structurés avec prix */}
              <div style={{ border: "1px solid " + C.border, borderRadius: 14, overflow: "hidden" }}>
                <div style={{ padding: "14px 18px", background: C.blueSoft, borderBottom: "1px solid " + C.border, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <div style={{ width: 32, height: 32, borderRadius: 8, background: C.blue, display: "flex", alignItems: "center", justifyContent: "center" }}>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round"><path d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2" /><rect x="9" y="3" width="6" height="4" rx="1" /><polyline points="9 12 11 14 15 10" /></svg>
                    </div>
                    <div>
                      <p style={{ fontSize: 14, fontWeight: 700, color: C.textPri }}>Examens demandés</p>
                      <p style={{ fontSize: 11, color: C.textSec }}>
                        {examensCommandes.length === 0 ? "Aucun examen — cliquez pour en prescrire" : `${examensCommandes.length} examen${examensCommandes.length > 1 ? "s" : ""} · Frais : ${fraisExamens.toLocaleString("fr-FR")} GNF`}
                      </p>
                    </div>
                  </div>
                  <button type="button" onClick={() => setShowAddExamen(v => !v)}
                    style={{ display: "flex", alignItems: "center", gap: 6, padding: "7px 14px", background: C.blue, color: "#fff", border: "none", borderRadius: 8, fontSize: 12, fontWeight: 600, cursor: "pointer", fontFamily: "inherit" }}>
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></svg>
                    {showAddExamen ? "Fermer" : "Ajouter"}
                  </button>
                </div>

                {/* Panneau d'ajout */}
                {showAddExamen && (
                  <div style={{ padding: "14px 18px", background: "#f9fafb", borderBottom: "1px solid " + C.border }}>
                    <div style={{ display: "flex", gap: 10, marginBottom: 12, flexWrap: "wrap" }}>
                      <select value={exCat} onChange={e => setExCat(e.target.value)}
                        style={{ ...inputSt, flex: "1 1 180px", padding: "8px 12px", fontSize: 12 }}>
                        {Object.keys(EXAMENS_PAR_CATEGORIE).map(cat => (
                          <option key={cat} value={cat}>{cat}</option>
                        ))}
                      </select>
                    </div>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 14 }}>
                      {EXAMENS_PAR_CATEGORIE[exCat]?.map(ex => {
                        const deja = examensCommandes.find(e => e.nom === ex.nom)
                        return (
                          <button key={ex.nom} type="button" onClick={() => ajouterExamen(ex)} disabled={!!deja}
                            style={{ padding: "4px 10px", background: deja ? C.greenSoft : C.white, color: deja ? C.green : C.textPri, border: "1px solid " + (deja ? C.green : C.border), borderRadius: 20, fontSize: 11, fontWeight: 600, cursor: deja ? "default" : "pointer", opacity: deja ? .7 : 1 }}>
                            {deja && <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: 4 }}><polyline points="20 6 9 17 4 12" /></svg>}{ex.nom}
                          </button>
                        )
                      })}
                    </div>
                    <div style={{ borderTop: "1px dashed " + C.border, paddingTop: 12 }}>
                      <p style={{ fontSize: 11, fontWeight: 700, color: C.textSec, marginBottom: 8 }}>Examen personnalisé</p>
                      <div style={{ display: "flex", gap: 8 }}>
                        <input value={exCustomNom} onChange={e => setExCustomNom(e.target.value)} placeholder="Nom de l'examen"
                          style={{ ...inputSt, flex: 2, padding: "8px 12px", fontSize: 12 }}
                          onFocus={e => e.target.style.borderColor = C.blue} onBlur={e => e.target.style.borderColor = C.border} />
                        <input value={exCustomPrix} onChange={e => setExCustomPrix(e.target.value)} placeholder="Prix (GNF)" type="number" min="0"
                          style={{ ...inputSt, flex: 1, padding: "8px 12px", fontSize: 12 }}
                          onFocus={e => e.target.style.borderColor = C.blue} onBlur={e => e.target.style.borderColor = C.border} />
                        <button type="button" onClick={ajouterCustom}
                          style={{ padding: "8px 14px", background: C.blue, color: "#fff", border: "none", borderRadius: 8, fontSize: 12, fontWeight: 600, cursor: "pointer", whiteSpace: "nowrap" }}>
                          + Ajouter
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {/* Liste des examens commandés */}
                {examensCommandes.length > 0 && (
                  <div style={{ padding: "14px 18px", display: "flex", flexDirection: "column", gap: 8 }}>
                    {examensCommandes.map(ex => (
                      <div key={ex.id} style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 12px", background: C.white, border: "1px solid " + C.border, borderRadius: 10 }}>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <p style={{ fontSize: 13, fontWeight: 600, color: C.textPri, marginBottom: 2, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{ex.nom}</p>
                          <span style={{ fontSize: 10, fontWeight: 700, background: C.blueSoft, color: C.blue, padding: "1px 7px", borderRadius: 10 }}>{ex.categorie}</span>
                        </div>
                        <div style={{ display: "flex", alignItems: "center", gap: 6, flexShrink: 0 }}>
                          <input value={ex.prix} onChange={e => updateExamenPrix(ex.id, e.target.value)} type="number" min="0"
                            style={{ width: 110, padding: "5px 8px", fontSize: 12, border: "1px solid " + C.border, borderRadius: 8, textAlign: "right", fontFamily: "inherit" }}
                            onFocus={e => e.target.style.borderColor = C.blue} onBlur={e => e.target.style.borderColor = C.border} />
                          <span style={{ fontSize: 11, color: C.textMuted, minWidth: 30 }}>GNF</span>
                          <button type="button" onClick={() => supprimerExamen(ex.id)}
                            style={{ width: 28, height: 28, borderRadius: 6, border: "1px solid " + C.red + "44", background: C.redSoft, color: C.red, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}
                            title="Retirer l'examen">
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="5" y1="12" x2="19" y2="12" /></svg>
                          </button>
                        </div>
                      </div>
                    ))}
                    <div style={{ display: "flex", justifyContent: "flex-end", padding: "8px 4px 0", borderTop: "1px solid " + C.border, marginTop: 4 }}>
                      <p style={{ fontSize: 13, fontWeight: 700, color: C.blue }}>Total frais examens : {fraisExamens.toLocaleString("fr-FR")} GNF</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Traitements */}
              <div>
                <label style={labelSt}>Traitements prescrits</label>
                <input value={form.traitements} onChange={e => f("traitements", e.target.value)} placeholder="Ex : Paracétamol 500mg 3x/j…"
                  style={{ ...inputSt, resize: "none" }}
                  onFocus={e => e.target.style.borderColor = C.blue} onBlur={e => e.target.style.borderColor = C.border} />
              </div>

              {/* Commentaires */}
              <div>
                <label style={labelSt}>Commentaires / Suivi</label>
                <textarea value={form.commentaires} onChange={e => f("commentaires", e.target.value)}
                  placeholder="Notes supplémentaires, date du prochain suivi…" rows={2} style={inputSt}
                  onFocus={e => e.target.style.borderColor = C.blue} onBlur={e => e.target.style.borderColor = C.border} />
              </div>

              {/* ── Assistants présents ── */}
              <div style={{ border: "1px solid " + C.border, borderRadius: 14, overflow: "hidden" }}>
                <div style={{ padding: "14px 18px", background: C.greenSoft, borderBottom: "1px solid " + C.border, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <div style={{ width: 32, height: 32, borderRadius: 8, background: C.green, display: "flex", alignItems: "center", justifyContent: "center" }}>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" /></svg>
                    </div>
                    <div>
                      <p style={{ fontSize: 14, fontWeight: 700, color: C.textPri }}>Assistants présents</p>
                      <p style={{ fontSize: 11, color: C.textSec }}>{assistants.length === 0 ? "Aucun assistant · cliquez pour en ajouter" : `${assistants.length} assistant${assistants.length > 1 ? "s" : ""} enregistré${assistants.length > 1 ? "s" : ""}`}</p>
                    </div>
                  </div>
                  <button onClick={addAssistant}
                    style={{ display: "flex", alignItems: "center", gap: 6, padding: "7px 14px", background: C.green, color: "#fff", border: "none", borderRadius: 8, fontSize: 12, fontWeight: 600, cursor: "pointer", fontFamily: "inherit" }}>
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></svg>
                    Ajouter
                  </button>
                </div>

                {assistants.length > 0 && (
                  <div style={{ padding: "14px 18px", display: "flex", flexDirection: "column", gap: 14 }}>
                    {assistants.map((st, idx) => (
                      <div key={st.id} style={{ border: "1px solid " + C.border, borderRadius: 10, overflow: "hidden" }}>
                        {/* En-tête de l'assistant */}
                        <div style={{ padding: "10px 14px", background: "#f9fafb", borderBottom: "1px solid " + C.border, display: "flex", alignItems: "center", gap: 10 }}>
                          <div style={{ width: 28, height: 28, borderRadius: "50%", background: C.green + "22", display: "flex", alignItems: "center", justifyContent: "center", color: C.green, fontSize: 12, fontWeight: 800, flexShrink: 0 }}>{idx + 1}</div>
                          <input value={st.nom} onChange={e => updateAssistant(st.id, "nom", e.target.value)}
                            placeholder="Nom de l'assistant"
                            style={{ ...inputSt, flex: 1, marginBottom: 0, padding: "6px 10px" }}
                            onFocus={e => e.target.style.borderColor = C.blue} onBlur={e => e.target.style.borderColor = C.border} />
                          <input value={st.service} onChange={e => updateAssistant(st.id, "service", e.target.value)}
                            placeholder="Service / Spécialité"
                            style={{ ...inputSt, flex: 1, marginBottom: 0, padding: "6px 10px" }}
                            onFocus={e => e.target.style.borderColor = C.blue} onBlur={e => e.target.style.borderColor = C.border} />
                          <button onClick={() => removeAssistant(st.id)}
                            style={{ width: 28, height: 28, borderRadius: 6, border: "1px solid " + C.red + "44", background: C.redSoft, color: C.red, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
                          </button>
                        </div>

                        {/* Critères d'évaluation */}
                        <div style={{ padding: "12px 14px" }}>
                          {[
                            { key: "participation", label: "Participation active", desc: "S'implique, pose des questions, propose des hypothèses" },
                            { key: "connaissances", label: "Connaissances cliniques", desc: "Maîtrise les bases théoriques liées au cas traité" },
                            { key: "comportement", label: "Comportement professionnel", desc: "Tenue, respect du patient, attitude en salle" },
                          ].map(({ key, label, desc }) => (
                            <div key={key} style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 10 }}>
                              <div style={{ flex: 1, minWidth: 0 }}>
                                <p style={{ fontSize: 12, fontWeight: 600, color: C.textPri, marginBottom: 1 }}>{label}</p>
                                <p style={{ fontSize: 11, color: C.textMuted }}>{desc}</p>
                              </div>
                              <div style={{ display: "flex", gap: 4, flexShrink: 0 }}>
                                {[1, 2, 3, 4, 5].map(n => (
                                  <button key={n} type="button" onClick={() => updateAssistant(st.id, key, n)}
                                    style={{
                                      width: 28, height: 28, borderRadius: 6, border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center",
                                      background: n <= st[key] ? C.green : "#e5e7eb",
                                      color: n <= st[key] ? "#fff" : "#9ca3af",
                                      transition: "all .15s"
                                    }}>
                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" /></svg>
                                  </button>
                                ))}
                                <span style={{ fontSize: 11, color: C.textMuted, width: 30, textAlign: "center", lineHeight: "28px", flexShrink: 0 }}>{st[key] > 0 ? st[key] + "/5" : "—"}</span>
                              </div>
                            </div>
                          ))}

                          {/* Commentaire */}
                          <div style={{ marginTop: 8 }}>
                            <label style={{ ...labelSt, marginBottom: 4 }}>Commentaire libre <span style={{ fontWeight: 400, color: C.textMuted }}>(facultatif)</span></label>
                            <textarea value={st.commentaire} onChange={e => updateAssistant(st.id, "commentaire", e.target.value)}
                              placeholder="Observations particulières sur cet assistant…" rows={2}
                              style={{ ...inputSt, resize: "vertical" }}
                              onFocus={e => e.target.style.borderColor = C.blue} onBlur={e => e.target.style.borderColor = C.border} />
                          </div>

                          {/* Score moyen */}
                          {(st.participation + st.connaissances + st.comportement) > 0 && (
                            <div style={{ marginTop: 10, padding: "8px 12px", background: C.greenSoft, borderRadius: 8, display: "flex", alignItems: "center", gap: 8 }}>
                              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={C.green} strokeWidth="2" strokeLinecap="round"><polyline points="20 6 9 17 4 12" /></svg>
                              <p style={{ fontSize: 12, color: C.green, fontWeight: 600 }}>
                                Score moyen : {((st.participation + st.connaissances + st.comportement) / [st.participation, st.connaissances, st.comportement].filter(n => n > 0).length).toFixed(1)} / 5
                                {" · "}
                                {(st.participation + st.connaissances + st.comportement) / [st.participation, st.connaissances, st.comportement].filter(n => n > 0).length >= 4 ? "Excellent" :
                                  (st.participation + st.connaissances + st.comportement) / [st.participation, st.connaissances, st.comportement].filter(n => n > 0).length >= 3 ? "Satisfaisant" :
                                    (st.participation + st.connaissances + st.comportement) / [st.participation, st.connaissances, st.comportement].filter(n => n > 0).length >= 2 ? "À améliorer" : "Insuffisant"}
                              </p>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* ── Orientation & Référence Inter-Services ── */}
              <div style={{ border: "1px solid " + C.border, borderRadius: 14, overflow: "hidden", marginTop: 8 }}>
                <div style={{ padding: "14px 18px", background: C.blueSoft, borderBottom: "1px solid " + C.border, display: "flex", alignItems: "center", gap: 10 }}>
                  <div style={{ width: 32, height: 32, borderRadius: 8, background: C.blue, display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round"><polyline points="15 3 21 3 21 9" /><line x1="10" y1="14" x2="21" y2="3" /><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" /></svg>
                  </div>
                  <div>
                    <p style={{ fontSize: 14, fontWeight: 700, color: C.textPri }}>Orientation &amp; Référence Inter-Services</p>
                    <p style={{ fontSize: 11, color: C.textSec }}>
                      Référer la patiente vers d'autres services de la clinique si nécessaire
                    </p>
                  </div>
                </div>

                <div style={{ padding: "14px 18px", display: "flex", flexDirection: "column", gap: 14, background: "#fafafa" }}>
                  <div>
                    <label style={{ ...labelSt, marginBottom: 6 }}>Sélectionner le(s) service(s) destinataire(s)</label>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                      {LISTE_SERVICES.filter(s => s.toLowerCase() !== (medecin?.specialite || "").toLowerCase()).map(srv => {
                        const selected = refInterServices.includes(srv)
                        return (
                          <button key={srv} type="button" onClick={() => handleToggleService(srv)}
                            style={{
                              padding: "6px 12px",
                              background: selected ? C.blue : C.white,
                              color: selected ? "#fff" : C.textPri,
                              border: "1px solid " + (selected ? C.blue : C.border),
                              borderRadius: 20,
                              fontSize: 11,
                              fontWeight: 600,
                              cursor: "pointer",
                              transition: "all 0.15s ease",
                              boxShadow: selected ? "0 2px 6px rgba(37, 99, 235, 0.2)" : "none"
                            }}>
                            {selected && "✓ "}
                            {srv}
                          </button>
                        )
                      })}
                    </div>
                  </div>

                  {refInterServices.length > 0 && (
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 2fr", gap: 14, animation: "fadeIn 0.2s ease" }}>
                      <div>
                        <label style={labelSt}>Niveau de priorité</label>
                        <select value={refPriorite} onChange={e => setRefPriorite(e.target.value)} style={inputSt}>
                          <option value="Normale">Normale</option>
                          <option value="Urgente">Urgente</option>
                          <option value="Critique">Critique</option>
                        </select>
                      </div>
                      <div>
                        <label style={labelSt}>Motif de la référence <span style={{ color: C.red }}>*</span></label>
                        <input value={refMotif} onChange={e => setRefMotif(e.target.value)} placeholder="Ex : Suspicion de pathologie cardiaque, diagnostic approfondi..." style={inputSt} />
                      </div>
                      <div style={{ gridColumn: "span 2" }}>
                        <label style={labelSt}>Commentaires additionnels</label>
                        <textarea value={refCommentaires} onChange={e => setRefCommentaires(e.target.value)} placeholder="Détails cliniques additionnels..." rows={2} style={{ ...inputSt, resize: "vertical" }} />
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Avertissement signature */}
              <div style={{ background: C.redSoft, border: "1px solid " + C.red + "33", borderRadius: 10, padding: "12px 16px" }}>
                <p style={{ fontSize: 12, color: C.red, fontWeight: 600 }}>
                  La signature est <strong>obligatoire et définitive</strong>. Une consultation non signée est une anomalie détectée dans le système d'audit.
                </p>
              </div>

              {/* Boutons */}
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 10, paddingTop: 8, borderTop: "1px solid " + C.border }}>
                <Btn onClick={() => {
                  // Remplacer le bloc w.document.write(...) dans les deux ModalConsultation
                  const date = new Date().toLocaleDateString("fr-FR")
                  const traitement = form.traitements || "—"
                  const diagnostic = form.diagDefinitif || form.diagPresomption || "—"
                  const poidsStr = form.poids ? `${form.poids} kg` : "—"
                  // Infos cliniques complémentaires
                  const tailleStr = prenatal?.tailleCm ? `${prenatal.tailleCm} cm` :
                    form.taille ? `${form.taille} cm` : "—"
                  const taStr = prenatal?.ta || form.ta || "—"
                  const dateNaissStr = patient?.dateNaissance
                    ? new Date(patient.dateNaissance).toLocaleDateString("fr-FR")
                    : "—"
                  const sexeStr = patient?.sexe === "F" ? "Féminin" :
                    patient?.sexe === "M" ? "Masculin" : "—"
                  const antecedentsStr = form.antecedents || "—"

                  const w = window.open("", "_blank", "width=720,height=960")
                  w.document.write(`<!DOCTYPE html><html><head><meta charset="utf-8">
<title>Ordonnance — ${patient?.nom || ""}</title><style>
*{box-sizing:border-box}
body{font-family:'Segoe UI',sans-serif;margin:0;padding:36px 40px;color:#000;font-size:13px}
.header{display:flex;justify-content:space-between;align-items:flex-start;border-bottom:3px solid #16a34a;padding-bottom:14px;margin-bottom:20px}
.hclinic{flex:1}.title{font-size:20px;font-weight:800;color:#16a34a;margin:0 0 3px}
.sub{font-size:11px;color:#555;margin:2px 0}
.hdate{text-align:right;font-size:12px;color:#333}
.hdate strong{font-size:14px;display:block;margin-bottom:2px}
.ord-title{font-size:17px;font-weight:800;text-align:center;letter-spacing:.04em;margin:0 0 18px;text-transform:uppercase;color:#111}
.patient-box{border:1.5px solid #16a34a33;border-radius:8px;overflow:hidden;margin-bottom:20px}
.patient-box-header{background:#f0faf4;padding:6px 14px;font-size:10px;font-weight:800;text-transform:uppercase;letter-spacing:.06em;color:#16a34a;border-bottom:1px solid #16a34a22}
.patient-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:0}
.patient-grid-2{display:grid;grid-template-columns:repeat(3,1fr);gap:0}
.pi-item{padding:10px 14px;border-right:1px solid #e5e7eb}
.pi-item:last-child{border-right:none}
.pi-label{font-size:9px;font-weight:700;text-transform:uppercase;letter-spacing:.06em;color:#888;margin-bottom:3px}
.pi-value{font-size:13px;font-weight:700;color:#111}
.section{margin-bottom:16px}
.sec-label{font-size:10px;font-weight:800;text-transform:uppercase;letter-spacing:.06em;color:#555;margin-bottom:5px;padding-bottom:3px;border-bottom:1px solid #e5e7eb}
.sec-value{font-size:13px;padding:9px 12px;background:#fafafa;border-radius:6px;border:1px solid #e5e7eb;line-height:1.6}
.rx{font-size:28px;font-weight:900;color:#16a34a;margin:0 0 6px;line-height:1}
.footer{margin-top:40px;display:flex;justify-content:space-between;align-items:flex-end;font-size:11px;color:#888;border-top:1px solid #e5e7eb;padding-top:14px}
.sign-box{text-align:center;border-top:1.5px solid #111;padding-top:6px;width:220px;font-size:11px;color:#333}
.medecin-info{font-size:12px;color:#333;font-weight:600;margin-bottom:2px}
@media print{body{padding:20px 24px}}
</style></head><body>
<div class="header">
  <div class="hclinic">
    <div class="title">Clinique Médicale ABC Marouane</div>
    <div class="sub">Tannerie, Kaloum · Conakry, République de Guinée</div>
    <div class="sub">Tél : +224 624 00 00 00</div>
    <div class="sub">Service : ${medecin?.specialite || "—"}</div>
  </div>
  <div class="hdate"><strong>Date</strong>${date}</div>
</div>
<div class="ord-title">Ordonnance Médicale</div>
<div class="patient-box">
  <div class="patient-box-header">Informations du patient</div>
  <div class="patient-grid">
    <div class="pi-item">
      <div class="pi-label">Nom &amp; Prénom</div>
      <div class="pi-value">${patient?.sexe === "F" ? "Mme" : "M."} ${patient?.nom || "—"}</div>
    </div>
    <div class="pi-item">
      <div class="pi-label">Date de naissance</div>
      <div class="pi-value">${dateNaissStr}</div>
    </div>
    <div class="pi-item">
      <div class="pi-label">Âge</div>
      <div class="pi-value">${age} ans</div>
    </div>
    <div class="pi-item">
      <div class="pi-label">Sexe</div>
      <div class="pi-value">${sexeStr}</div>
    </div>
  </div>
  <div class="patient-grid-2" style="border-top:1px solid #e5e7eb">
    <div class="pi-item">
      <div class="pi-label">Poids</div>
      <div class="pi-value">${poidsStr}</div>
    </div>
    <div class="pi-item">
      <div class="pi-label">Taille</div>
      <div class="pi-value">${tailleStr}</div>
    </div>
    <div class="pi-item">
      <div class="pi-label">Tension artérielle</div>
      <div class="pi-value">${taStr}</div>
    </div>
  </div>
  ${antecedentsStr !== "—" ? `
  <div style="padding:8px 14px;border-top:1px solid #e5e7eb;background:#fffbf0">
    <div class="pi-label" style="margin-bottom:3px">Antécédents médicaux</div>
    <div style="font-size:12px;color:#333">${antecedentsStr}</div>
  </div>` : ""}
</div>
<div class="rx">℞</div>
<div class="section">
  <div class="sec-label">Diagnostic</div>
  <div class="sec-value">${diagnostic}</div>
</div>
<div class="section">
  <div class="sec-label">Prescriptions</div>
  <div class="sec-value">
    ${traitement.split(",").map((t, i) =>
                    `<div style="margin-bottom:6px"><strong>${i + 1}.</strong> ${t.trim()}</div>`
                  ).join("")}
  </div>
</div>
${form.commentaires ? `
<div class="section">
  <div class="sec-label">Commentaires / Suivi</div>
  <div class="sec-value">${form.commentaires}</div>
</div>` : ""}
<div class="footer">
  <div>Valable 3 mois à compter du ${date}</div>
  <div class="sign-box">
    <div class="medecin-info">Dr. ${medecin?.nom || "—"}</div>
    <div class="medecin-info" style="font-weight:400;font-size:11px">${medecin?.specialite || ""}</div>
    <div style="margin-top:28px">Signature &amp; Cachet du médecin</div>
  </div>
</div></body></html>`)
                  w.document.close()
                  setTimeout(() => w.print(), 400)
                }} variant="secondary">
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><polyline points="6 9 6 2 18 2 18 9" /><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2" /><rect x="6" y="14" width="12" height="8" /></svg>
                  Imprimer ordonnance
                </Btn>
                {aDesExamens && attenteResultatsLabo && !laboValide && (
                  <p style={{ fontSize: 12, color: C.amber, marginBottom: 10, padding: "8px 12px", background: "#fef3c7", borderRadius: 8 }}>
                    Examens envoyés au laboratoire — en attente des résultats avant signature.
                  </p>
                )}
                {laboValide && aDesExamens && (
                  <p style={{ fontSize: 12, color: C.green, marginBottom: 10, padding: "8px 12px", background: "#dcfce7", borderRadius: 8 }}>
                    Résultats du laboratoire disponibles — vous pouvez signer et valider.
                  </p>
                )}
                <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                  <Btn onClick={onClose} variant="secondary">Annuler</Btn>
                  <Btn onClick={() => valider(false)} variant="secondary">Sauvegarder</Btn>
                  {doitEnvoyerLabo && (
                    <Btn onClick={() => valider(false, true)} variant="primary">
                      Envoyer au laboratoire
                    </Btn>
                  )}
                  {peutSigner && (
                    <Btn onClick={() => valider(true)} variant="success">
                      {aDesExamens ? "Signer après résultats" : "Signer & Valider"}
                    </Btn>
                  )}
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
