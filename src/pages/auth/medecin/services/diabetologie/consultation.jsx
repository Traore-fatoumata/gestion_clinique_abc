/**
 * ═══════════════════════════════════════════════════════════
 *  DIABÉTOLOGIE — Formulaire de consultation spécifique
 *  ═══════════════════════════════════════════════════════════
 * 
 *  Formulaire de consultation adapté aux besoins spécifiques
 *  de la diabétologie, incluant le suivi glycémique, les 
 *  complications et l'éducation thérapeutique.
 */

import { useState } from "react"
import { C, inputSt, labelSt, RegSection, Btn } from "../../shared.jsx"
import { 
  CONSULTATION_DIABETO_DEFAULT,
  TYPES_DIABETE,
  OBJECTIFS_HBA1C,
  TYPES_INSULINE,
  ANTIDIABETIQUES_ORAUX,
  STADES_NEUROPATHIE,
  CLASSIFICATION_PIED_DIABETIQUE,
} from "./consultationConstants.js"

/**
 * Composant pour le formulaire de consultation en diabétologie
 */
export default function ConsultationDiabeto({
  patient,
  consultation,
  onSave,
  onCancel,
}) {
  const [form, setForm] = useState(() => ({
    ...CONSULTATION_DIABETO_DEFAULT,
    ...consultation,
  }))

  const f = (k, v) => setForm(p => ({ ...p, [k]: v }))

  // Calcul automatique de l'IMC
  const calculerIMC = () => {
    const p = parseFloat(form.poids)
    const t = parseFloat(form.taille) / 100
    if (p > 0 && t > 0) {
      return (p / (t * t)).toFixed(1)
    }
    return ""
  }

  // Interprétation de l'HbA1c
  const interpreterHbA1c = () => {
    const hba1c = parseFloat(form.hba1c)
    if (!hba1c) return null
    if (hba1c < 6.5) return { niveau: "Contrôle optimal", color: C.green }
    if (hba1c < 7.0) return { niveau: "Contrôle acceptable", color: C.blue }
    if (hba1c < 8.0) return { niveau: "Contrôle insuffisant", color: C.amber }
    return { niveau: "Contrôle très insuffisant", color: C.red }
  }

  const hba1cInterpretation = interpreterHbA1c()

  const handleSubmit = () => {
    if (!form.diagnosticPrincipal.trim()) {
      alert("Le diagnostic principal est obligatoire.")
      return
    }
    onSave({
      ...form,
      imc: calculerIMC(),
    })
  }

  return (
    <div style={{ padding: "20px", maxHeight: "70vh", overflowY: "auto" }}>
      <div style={{ marginBottom: "20px", paddingBottom: "12px", borderBottom: `1px solid ${C.border}` }}>
        <h3 style={{ fontSize: "16px", fontWeight: "700", color: C.textPri, marginBottom: "4px" }}>
          Consultation de Diabétologie
        </h3>
        <p style={{ fontSize: "12px", color: C.textMuted }}>
          Patient : {patient?.nom} — {patient?.pid}
        </p>
      </div>

      {/* Signes vitaux */}
      <RegSection title="Données anthropométriques">
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12 }}>
          <div>
            <label style={labelSt}>Poids (kg)</label>
            <input
              type="number"
              value={form.poids}
              onChange={e => f("poids", e.target.value)}
              placeholder="Ex: 75"
              style={inputSt}
            />
          </div>
          <div>
            <label style={labelSt}>Taille (m)</label>
            <input
              type="number"
              value={form.taille}
              onChange={e => f("taille", e.target.value)}
              placeholder="Ex: 1.70"
              step="0.01"
              style={inputSt}
            />
          </div>
          <div>
            <label style={labelSt}>IMC</label>
            <input
              type="text"
              value={calculerIMC()}
              disabled
              style={{ ...inputSt, background: C.slateSoft, cursor: "not-allowed" }}
            />
          </div>
          <div>
            <label style={labelSt}>TA Systolique (mmHg)</label>
            <input
              type="number"
              value={form.taSystolique}
              onChange={e => f("taSystolique", e.target.value)}
              placeholder="120"
              style={inputSt}
            />
          </div>
          <div>
            <label style={labelSt}>TA Diastolique (mmHg)</label>
            <input
              type="number"
              value={form.taDiastolique}
              onChange={e => f("taDiastolique", e.target.value)}
              placeholder="80"
              style={inputSt}
            />
          </div>
          <div>
            <label style={labelSt}>Tour de taille (cm)</label>
            <input
              type="number"
              value={form.tourDeTaille}
              onChange={e => f("tourDeTaille", e.target.value)}
              placeholder="Ex: 95"
              style={inputSt}
            />
          </div>
        </div>
      </RegSection>

      {/* Type de diabète */}
      <RegSection title="Type de diabète & historique">
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12 }}>
          <div>
            <label style={labelSt}>Type de diabète</label>
            <select
              value={form.typeDiabete}
              onChange={e => f("typeDiabete", e.target.value)}
              style={inputSt}
            >
              <option value="">—</option>
              {TYPES_DIABETE.map(t => (
                <option key={t.valeur} value={t.valeur}>{t.label}</option>
              ))}
            </select>
          </div>
          <div>
            <label style={labelSt}>Date du diagnostic</label>
            <input
              type="date"
              value={form.dateDiagnostic}
              onChange={e => f("dateDiagnostic", e.target.value)}
              style={inputSt}
            />
          </div>
          <div>
            <label style={labelSt}>Ancienneté (années)</label>
            <input
              type="number"
              value={form.ancienneteDiabete}
              onChange={e => f("ancienneteDiabete", e.target.value)}
              placeholder="Ex: 5"
              style={inputSt}
            />
          </div>
        </div>
      </RegSection>

      {/* Surveillance glycémique */}
      <RegSection title="Surveillance glycémique">
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12 }}>
          <div>
            <label style={labelSt}>HbA1c (%)</label>
            <input
              type="number"
              step="0.1"
              value={form.hba1c}
              onChange={e => f("hba1c", e.target.value)}
              placeholder="Ex: 7.2"
              style={inputSt}
            />
            {hba1cInterpretation && (
              <p style={{ fontSize: 11, color: hba1cInterpretation.color, marginTop: 4, fontWeight: 600 }}>
                {hba1cInterpretation.niveau}
              </p>
            )}
          </div>
          <div>
            <label style={labelSt}>Date HbA1c</label>
            <input
              type="date"
              value={form.dateHba1c}
              onChange={e => f("dateHba1c", e.target.value)}
              style={inputSt}
            />
          </div>
          <div>
            <label style={labelSt}>Fréquence surveillance</label>
            <select
              value={form.frequenceSurveillance}
              onChange={e => f("frequenceSurveillance", e.target.value)}
              style={inputSt}
            >
              <option value="">—</option>
              <option value="quotidienne">Quotidienne</option>
              <option value="hebdomadaire">Hebdomadaire</option>
              <option value="occasionnelle">Occasionnelle</option>
            </select>
          </div>
          <div>
            <label style={labelSt}>Glycémie à jeun (g/L)</label>
            <input
              type="number"
              step="0.01"
              value={form.glycemieMatinale}
              onChange={e => f("glycemieMatinale", e.target.value)}
              placeholder="Ex: 1.20"
              style={inputSt}
            />
          </div>
          <div>
            <label style={labelSt}>Glycémie post-prandiale (g/L)</label>
            <input
              type="number"
              step="0.01"
              value={form.glycemiePostPrandiale}
              onChange={e => f("glycemiePostPrandiale", e.target.value)}
              placeholder="Ex: 1.80"
              style={inputSt}
            />
          </div>
        </div>
      </RegSection>

      {/* Symptômes */}
      <RegSection title="Symptômes évocateurs d'un déséquilibre">
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12 }}>
          <div>
            <label style={labelSt}>Soif intense (polydipsie)</label>
            <select
              value={form.soif}
              onChange={e => f("soif", e.target.value)}
              style={inputSt}
            >
              <option value="">—</option>
              <option value="oui">Oui</option>
              <option value="non">Non</option>
            </select>
          </div>
          <div>
            <label style={labelSt}>Urines abondantes (polyurie)</label>
            <select
              value={form.polyurie}
              onChange={e => f("polyurie", e.target.value)}
              style={inputSt}
            >
              <option value="">—</option>
              <option value="oui">Oui</option>
              <option value="non">Non</option>
            </select>
          </div>
          <div>
            <label style={labelSt}>Fatigue (asthénie)</label>
            <select
              value={form.fatigue}
              onChange={e => f("fatigue", e.target.value)}
              style={inputSt}
            >
              <option value="">—</option>
              <option value="oui">Oui</option>
              <option value="non">Non</option>
            </select>
          </div>
          <div>
            <label style={labelSt}>Troubles de la vision</label>
            <select
              value={form.troublesVision}
              onChange={e => f("troublesVision", e.target.value)}
              style={inputSt}
            >
              <option value="">—</option>
              <option value="oui">Oui</option>
              <option value="non">Non</option>
            </select>
          </div>
          <div>
            <label style={labelSt}>Engourdissements / Fourmillements</label>
            <select
              value={form.engourdissements}
              onChange={e => f("engourdissements", e.target.value)}
              style={inputSt}
            >
              <option value="">—</option>
              <option value="oui">Oui</option>
              <option value="non">Non</option>
            </select>
          </div>
          <div>
            <label style={labelSt}>Plaies aux pieds</label>
            <select
              value={form.plaiesPieds}
              onChange={e => f("plaiesPieds", e.target.value)}
              style={inputSt}
            >
              <option value="">—</option>
              <option value="oui">Oui</option>
              <option value="non">Non</option>
            </select>
          </div>
        </div>
      </RegSection>

      {/* Traitement */}
      <RegSection title="Traitement antidiabétique">
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <div>
            <label style={{ ...labelSt, display: "flex", alignItems: "center", gap: 8 }}>
              <input
                type="checkbox"
                checked={form.insuline}
                onChange={e => f("insuline", e.target.checked)}
                style={{ accentColor: C.blue }}
              />
              Traitement par insuline
            </label>
          </div>
          {form.insuline && (
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              <div>
                <label style={labelSt}>Type d'insuline</label>
                <select
                  value={form.typeInsuline}
                  onChange={e => f("typeInsuline", e.target.value)}
                  style={inputSt}
                >
                  <option value="">—</option>
                  {TYPES_INSULINE.map(t => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
              </div>
              <div>
                <label style={labelSt}>Doses (UI/jour)</label>
                <input
                  value={form.dosesInsuline}
                  onChange={e => f("dosesInsuline", e.target.value)}
                  placeholder="Ex: 30 UI (20 matin, 10 soir)"
                  style={inputSt}
                />
              </div>
            </div>
          )}
          <div>
            <label style={labelSt}>Antidiabétiques oraux</label>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginTop: 6 }}>
              {ANTIDIABETIQUES_ORAUX.map(m => (
                <label key={m} style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 12, cursor: "pointer" }}>
                  <input
                    type="checkbox"
                    checked={form.antidiabetiquesOraux?.includes(m)}
                    onChange={e => {
                      const current = form.antidiabetiquesOraux || []
                      if (e.target.checked) {
                        f("antidiabetiquesOraux", [...current, m])
                      } else {
                        f("antidiabetiquesOraux", current.filter(d => d !== m))
                      }
                    }}
                    style={{ accentColor: C.blue }}
                  />
                  {m}
                </label>
              ))}
            </div>
          </div>
          <div>
            <label style={labelSt}>Observance du traitement</label>
            <select
              value={form.observanceTraitement}
              onChange={e => f("observanceTraitement", e.target.value)}
              style={inputSt}
            >
              <option value="">—</option>
              <option value="bonne">Bonne</option>
              <option value="moyenne">Moyenne</option>
              <option value="mauvaise">Mauvaise</option>
            </select>
          </div>
          <div>
            <label style={labelSt}>Effets secondaires / Hypoglycémies</label>
            <textarea
              value={form.effetsSecondaires}
              onChange={e => f("effetsSecondaires", e.target.value)}
              placeholder="Fréquence, symptômes, circonstances..."
              rows={2}
              style={inputSt}
            />
          </div>
        </div>
      </RegSection>

      {/* Complications */}
      <RegSection title="Recherche de complications">
        <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 12 }}>
          <div>
            <label style={labelSt}>Rétinopathie diabétique</label>
            <select
              value={form.retinopathie}
              onChange={e => f("retinopathie", e.target.value)}
              style={inputSt}
            >
              <option value="">—</option>
              <option value="absente">Absente</option>
              <option value="non_proliferative">Non proliférative</option>
              <option value="proliferative">Proliférative</option>
              <option value="maculopathie">Maculopathie</option>
            </select>
          </div>
          <div>
            <label style={labelSt}>Néphropathie diabétique</label>
            <select
              value={form.nephropathie}
              onChange={e => f("nephropathie", e.target.value)}
              style={inputSt}
            >
              <option value="">—</option>
              <option value="absente">Absente</option>
              <option value="microalbuminurie">Microalbuminurie</option>
              <option value="proteinurie">Protéinurie</option>
              <option value="insuffisance_renale">Insuffisance rénale</option>
            </select>
          </div>
          <div>
            <label style={labelSt}>Neuropathie diabétique</label>
            <select
              value={form.neuropathie}
              onChange={e => f("neuropathie", e.target.value)}
              style={inputSt}
            >
              <option value="">—</option>
              {STADES_NEUROPATHIE.map(s => (
                <option key={s.stade} value={s.stade}>Stade {s.stade} - {s.description}</option>
              ))}
            </select>
          </div>
          <div>
            <label style={labelSt}>Pied diabétique</label>
            <select
              value={form.piedDiabetique}
              onChange={e => f("piedDiabetique", e.target.value)}
              style={inputSt}
            >
              <option value="">—</option>
              {CLASSIFICATION_PIED_DIABETIQUE.map(c => (
                <option key={c.grade} value={c.grade}>Grade {c.grade} - {c.description}</option>
              ))}
            </select>
          </div>
          <div>
            <label style={labelSt}>Maladie cardiovasculaire</label>
            <select
              value={form.maladieCardiovasculaire}
              onChange={e => f("maladieCardiovasculaire", e.target.value)}
              style={inputSt}
            >
              <option value="">—</option>
              <option value="absente">Absente</option>
              <option value="coronarienne">Coronarienne</option>
              <option value="cerebrovasculaire">Cérébrovasculaire</option>
              <option value="arteriopathie">Artériopathie des MI</option>
            </select>
          </div>
        </div>
      </RegSection>

      {/* Examens de suivi */}
      <RegSection title="Examens de suivi">
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12 }}>
          <div>
            <label style={labelSt}>Microalbuminurie (mg/24h)</label>
            <input
              type="number"
              value={form.microalbuminurie}
              onChange={e => f("microalbuminurie", e.target.value)}
              placeholder="Ex: 15"
              style={inputSt}
            />
          </div>
          <div>
            <label style={labelSt}>Créatinine (mg/L)</label>
            <input
              type="number"
              step="0.01"
              value={form.creatinine}
              onChange={e => f("creatinine", e.target.value)}
              placeholder="Ex: 8.5"
              style={inputSt}
            />
          </div>
          <div>
            <label style={labelSt}>DFG (mL/min/1.73m²)</label>
            <input
              type="number"
              value={form.dfg}
              onChange={e => f("dfg", e.target.value)}
              placeholder="Ex: 85"
              style={inputSt}
            />
          </div>
          <div>
            <label style={labelSt}>Bilan lipidique (CT g/L)</label>
            <input
              type="number"
              step="0.01"
              value={form.bilanLipidique}
              onChange={e => f("bilanLipidique", e.target.value)}
              placeholder="Ex: 1.90"
              style={inputSt}
            />
          </div>
          <div>
            <label style={labelSt}>Fond d'œil</label>
            <select
              value={form.fondOeil}
              onChange={e => f("fondOeil", e.target.value)}
              style={inputSt}
            >
              <option value="">—</option>
              <option value="normal">Normal</option>
              <option value="anormal">Anormal</option>
              <option value="non_fait">Non fait</option>
            </select>
          </div>
          <div>
            <label style={labelSt}>Date dernier fond d'œil</label>
            <input
              type="date"
              value={form.dateDernierFondOeil}
              onChange={e => f("dateDernierFondOeil", e.target.value)}
              style={inputSt}
            />
          </div>
        </div>
      </RegSection>

      {/* Mode de vie */}
      <RegSection title="Mode de vie & éducation thérapeutique">
        <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 12 }}>
          <div>
            <label style={labelSt}>Alimentation</label>
            <select
              value={form.alimentation}
              onChange={e => f("alimentation", e.target.value)}
              style={inputSt}
            >
              <option value="">—</option>
              <option value="equilibree">Équilibrée</option>
              <option value="a_ameliorer">À améliorer</option>
              <option value="deséquilibree">Déséquilibrée</option>
            </select>
          </div>
          <div>
            <label style={labelSt}>Activité physique</label>
            <select
              value={form.activitePhysique}
              onChange={e => f("activitePhysique", e.target.value)}
              style={inputSt}
            >
              <option value="">—</option>
              <option value="reguliere">Régulière</option>
              <option value="occasionnelle">Occasionnelle</option>
              <option value="sedentaire">Sédentaire</option>
            </select>
          </div>
          <div>
            <label style={labelSt}>Tabac</label>
            <select
              value={form.tabac}
              onChange={e => f("tabac", e.target.value)}
              style={inputSt}
            >
              <option value="">—</option>
              <option value="non_fumeur">Non fumeur</option>
              <option value="ancien_fumeur">Ancien fumeur</option>
              <option value="fumeur_actif">Fumeur actif</option>
            </select>
          </div>
          <div>
            <label style={labelSt}>Alcool</label>
            <select
              value={form.alcool}
              onChange={e => f("alcool", e.target.value)}
              style={inputSt}
            >
              <option value="">—</option>
              <option value="non">Non</option>
              <option value="occasionnel">Occasionnel</option>
              <option value="regulier">Régulier</option>
            </select>
          </div>
        </div>
      </RegSection>

      {/* Conclusion */}
      <RegSection title="Conclusion & plan thérapeutique">
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <div>
            <label style={labelSt}>Diagnostic principal <span style={{ color: C.red }}>*</span></label>
            <input
              value={form.diagnosticPrincipal}
              onChange={e => f("diagnosticPrincipal", e.target.value)}
              placeholder="Ex: Diabète de type 2 déséquilibré..."
              style={inputSt}
            />
          </div>
          <div>
            <label style={labelSt}>Objectifs glycémiques</label>
            <textarea
              value={form.objectifsGlycemiques}
              onChange={e => f("objectifsGlycemiques", e.target.value)}
              placeholder="HbA1c cible, glycémies à jeun, post-prandiales..."
              rows={2}
              style={inputSt}
            />
          </div>
          <div>
            <label style={labelSt}>Plan de traitement</label>
            <textarea
              value={form.planTraitement}
              onChange={e => f("planTraitement", e.target.value)}
              placeholder="Ajustements thérapeutiques, nouvelles prescriptions..."
              rows={3}
              style={inputSt}
            />
          </div>
          <div>
            <label style={labelSt}>Recommandations</label>
            <textarea
              value={form.recommandations}
              onChange={e => f("recommandations", e.target.value)}
              placeholder="Régime, activité physique, autosurveillance..."
              rows={2}
              style={inputSt}
            />
          </div>
          <div>
            <label style={labelSt}>Prochain rendez-vous</label>
            <input
              type="date"
              value={form.prochainRDV}
              onChange={e => f("prochainRDV", e.target.value)}
              style={inputSt}
            />
          </div>
        </div>
      </RegSection>

      {/* Boutons */}
      <div style={{ display: "flex", gap: 10, justifyContent: "flex-end", marginTop: 20 }}>
        <Btn onClick={onCancel} variant="secondary">Annuler</Btn>
        <Btn onClick={handleSubmit} variant="success">Enregistrer</Btn>
      </div>
    </div>
  )
}