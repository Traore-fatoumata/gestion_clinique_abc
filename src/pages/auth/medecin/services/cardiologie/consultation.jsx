/**
 * ═══════════════════════════════════════════════════════════
 *  CARDIOLOGIE — Formulaire de consultation spécifique
 *  ═══════════════════════════════════════════════════════════
 * 
 *  Formulaire de consultation adapté aux besoins spécifiques
 *  de la cardiologie, incluant les champs pour l'évaluation
 *  cardiovasculaire, les antécédents cardiaques et le suivi.
 */

import { useState } from "react"
import { C, inputSt, labelSt, RegSection, Btn } from "../../shared.jsx"
import { 
  CONSULTATION_CARDIO_DEFAULT, 
  CLASSES_NYHA, 
  FACTEURS_RISQUE_CARDIO 
} from "./consultationConstants.js"

/**
 * Composant pour le formulaire de consultation en cardiologie
 */
export default function ConsultationCardio({
  patient,
  consultation,
  onSave,
  onCancel,
}) {
  const [form, setForm] = useState(() => ({
    ...CONSULTATION_CARDIO_DEFAULT,
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
          Consultation de Cardiologie
        </h3>
        <p style={{ fontSize: "12px", color: C.textMuted }}>
          Patient : {patient?.nom} — {patient?.pid}
        </p>
      </div>

      {/* Signes vitaux */}
      <RegSection title="Signes vitaux & mesures">
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12 }}>
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
            <label style={labelSt}>Fréquence cardiaque (bpm)</label>
            <input
              type="number"
              value={form.frequenceCardiaque}
              onChange={e => f("frequenceCardiaque", e.target.value)}
              placeholder="70"
              style={inputSt}
            />
          </div>
          <div>
            <label style={labelSt}>Fréquence respiratoire (/min)</label>
            <input
              type="number"
              value={form.frequenceRespiratoire}
              onChange={e => f("frequenceRespiratoire", e.target.value)}
              placeholder="16"
              style={inputSt}
            />
          </div>
          <div>
            <label style={labelSt}>Saturation O₂ (%)</label>
            <input
              type="number"
              value={form.saturationO2}
              onChange={e => f("saturationO2", e.target.value)}
              placeholder="98"
              style={inputSt}
            />
          </div>
          <div>
            <label style={labelSt}>Poids (kg)</label>
            <input
              type="number"
              value={form.poids}
              onChange={e => f("poids", e.target.value)}
              placeholder="70"
              style={inputSt}
            />
          </div>
          <div>
            <label style={labelSt}>Taille (cm)</label>
            <input
              type="number"
              value={form.taille}
              onChange={e => f("taille", e.target.value)}
              placeholder="170"
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
        </div>
      </RegSection>

      {/* Antécédents */}
      <RegSection title="Antécédents cardiovasculaires">
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <div>
            <label style={labelSt}>Antécédents cardiaques personnels</label>
            <textarea
              value={form.antecédentsCardiaques}
              onChange={e => f("antecédentsCardiaques", e.target.value)}
              placeholder="Infarctus, angioplastie, chirurgie cardiaque, arythmie..."
              rows={2}
              style={inputSt}
            />
          </div>
          <div>
            <label style={labelSt}>Antécédents familiaux (cardiovasculaires)</label>
            <textarea
              value={form.antecédentsFamiliaux}
              onChange={e => f("antecédentsFamiliaux", e.target.value)}
              placeholder="MCV prématurées dans la famille..."
              rows={2}
              style={inputSt}
            />
          </div>
          <div>
            <label style={labelSt}>Facteurs de risque (cocher les cases pertinentes)</label>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginTop: 6 }}>
              {FACTEURS_RISQUE_CARDIO.map(fr => (
                <label key={fr} style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, cursor: "pointer" }}>
                  <input
                    type="checkbox"
                    checked={form.facteursRisque.includes(fr)}
                    onChange={e => {
                      if (e.target.checked) {
                        f("facteursRisque", [...form.facteursRisque, fr])
                      } else {
                        f("facteursRisque", form.facteursRisque.filter(r => r !== fr))
                      }
                    }}
                    style={{ accentColor: C.blue }}
                  />
                  {fr}
                </label>
              ))}
            </div>
          </div>
        </div>
      </RegSection>

      {/* Symptômes */}
      <RegSection title="Symptômes cardiaques">
        <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 12 }}>
          <div>
            <label style={labelSt}>Douleur thoracique</label>
            <textarea
              value={form.douleurThoracique}
              onChange={e => f("douleurThoracique", e.target.value)}
              placeholder="Type, localisation, irradiation, durée..."
              rows={2}
              style={inputSt}
            />
          </div>
          <div>
            <label style={labelSt}>Dyspnée</label>
            <textarea
              value={form.dyspnee}
              onChange={e => f("dyspnee", e.target.value)}
              placeholder="Effort, repos, NYHA..."
              rows={2}
              style={inputSt}
            />
          </div>
          <div>
            <label style={labelSt}>Palpitations</label>
            <textarea
              value={form.palpitations}
              onChange={e => f("palpitations", e.target.value)}
              placeholder="Fréquence, durée, facteurs déclenchants..."
              rows={2}
              style={inputSt}
            />
          </div>
          <div>
            <label style={labelSt}>Syncopes / Lipothymies</label>
            <textarea
              value={form.syncopes}
              onChange={e => f("syncopes", e.target.value)}
              placeholder="Circonstances, fréquence..."
              rows={2}
              style={inputSt}
            />
          </div>
          <div>
            <label style={labelSt}>Œdèmes</label>
            <textarea
              value={form.oedemes}
              onChange={e => f("oedemes", e.target.value)}
              placeholder="Localisation, horaire..."
              rows={2}
              style={inputSt}
            />
          </div>
          <div>
            <label style={labelSt}>Orthopnée / Dyspnée paroxystique</label>
            <textarea
              value={form.orthopnee}
              onChange={e => f("orthopnee", e.target.value)}
              placeholder="Nombre d'oreillers, réveils nocturnes..."
              rows={2}
              style={inputSt}
            />
          </div>
        </div>
      </RegSection>

      {/* Examen clinique */}
      <RegSection title="Examen clinique cardiovasculaire">
        <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 12 }}>
          <div>
            <label style={labelSt}>Auscultation cardiaque</label>
            <textarea
              value={form.auscultationCardiaque}
              onChange={e => f("auscultationCardiaque", e.target.value)}
              placeholder="Rythme, régularité, bruits..."
              rows={2}
              style={inputSt}
            />
          </div>
          <div>
            <label style={labelSt}>Souffle cardiaque</label>
            <textarea
              value={form.souffle}
              onChange={e => f("souffle", e.target.value)}
              placeholder="Type, siège, irradiation, grade..."
              rows={2}
              style={inputSt}
            />
          </div>
          <div>
            <label style={labelSt}>Bruits surajoutés</label>
            <textarea
              value={form.bruitsSurajoutes}
              onChange={e => f("bruitsSurajoutes", e.target.value)}
              placeholder="B3, B4, clic, frottement..."
              rows={2}
              style={inputSt}
            />
          </div>
          <div>
            <label style={labelSt}>Pouls périphériques</label>
            <textarea
              value={form.pouls}
              onChange={e => f("pouls", e.target.value)}
              placeholder="Symétriques, réguliers, amplitude..."
              rows={2}
              style={inputSt}
            />
          </div>
          <div>
            <label style={labelSt}>Turgescence jugulaire</label>
            <select
              value={form.turgescenceJugulaire}
              onChange={e => f("turgescenceJugulaire", e.target.value)}
              style={inputSt}
            >
              <option value="">—</option>
              <option value="absente">Absente</option>
              <option value="présente">Présente</option>
              <option value="importante">Importante</option>
            </select>
          </div>
          <div>
            <label style={labelSt}>Hépatomégalie</label>
            <select
              value={form.hepatomegalie}
              onChange={e => f("hepatomegalie", e.target.value)}
              style={inputSt}
            >
              <option value="">—</option>
              <option value="absente">Absente</option>
              <option value="présente">Présente</option>
              <option value="douloureuse">Douloureuse</option>
            </select>
          </div>
        </div>
      </RegSection>

      {/* Examens complémentaires */}
      <RegSection title="Examens complémentaires">
        <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 12 }}>
          <div>
            <label style={{ ...labelSt, display: "flex", alignItems: "center", gap: 8 }}>
              <input
                type="checkbox"
                checked={form.ecgFait}
                onChange={e => f("ecgFait", e.target.checked)}
                style={{ accentColor: C.blue }}
              />
              ECG réalisé
            </label>
            <textarea
              value={form.ecgResultat}
              onChange={e => f("ecgResultat", e.target.value)}
              placeholder="Rythme sinusal, anomalies..."
              rows={2}
              style={{ ...inputSt, marginTop: 6 }}
              disabled={!form.ecgFait}
            />
          </div>
          <div>
            <label style={{ ...labelSt, display: "flex", alignItems: "center", gap: 8 }}>
              <input
                type="checkbox"
                checked={form.echoCardioFait}
                onChange={e => f("echoCardioFait", e.target.checked)}
                style={{ accentColor: C.blue }}
              />
              Échocardiographie réalisée
            </label>
            <textarea
              value={form.echoCardioResultat}
              onChange={e => f("echoCardioResultat", e.target.value)}
              placeholder="FEVG, valves, dimensions..."
              rows={2}
              style={{ ...inputSt, marginTop: 6 }}
              disabled={!form.echoCardioFait}
            />
          </div>
          <div>
            <label style={{ ...labelSt, display: "flex", alignItems: "center", gap: 8 }}>
              <input
                type="checkbox"
                checked={form.holterFait}
                onChange={e => f("holterFait", e.target.checked)}
                style={{ accentColor: C.blue }}
              />
              Holter ECG réalisé
            </label>
            <textarea
              value={form.holterResultat}
              onChange={e => f("holterResultat", e.target.value)}
              placeholder="Résultats du Holter..."
              rows={2}
              style={{ ...inputSt, marginTop: 6 }}
              disabled={!form.holterFait}
            />
          </div>
          <div>
            <label style={{ ...labelSt, display: "flex", alignItems: "center", gap: 8 }}>
              <input
                type="checkbox"
                checked={form.testEffortFait}
                onChange={e => f("testEffortFait", e.target.checked)}
                style={{ accentColor: C.blue }}
              />
              Test d'effort réalisé
            </label>
            <textarea
              value={form.testEffortResultat}
              onChange={e => f("testEffortResultat", e.target.value)}
              placeholder="Résultats du test d'effort..."
              rows={2}
              style={{ ...inputSt, marginTop: 6 }}
              disabled={!form.testEffortFait}
            />
          </div>
        </div>
      </RegSection>

      {/* Évaluation fonctionnelle */}
      <RegSection title="Évaluation fonctionnelle">
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
          <div>
            <label style={labelSt}>Classe NYHA</label>
            <select
              value={form.classeNYHA}
              onChange={e => f("classeNYHA", e.target.value)}
              style={inputSt}
            >
              <option value="">—</option>
              {CLASSES_NYHA.map(c => (
                <option key={c.valeur} value={c.valeur}>{c.label}</option>
              ))}
            </select>
            {form.classeNYHA && (
              <p style={{ fontSize: 11, color: C.textMuted, marginTop: 4 }}>
                {CLASSES_NYHA.find(c => c.valeur === form.classeNYHA)?.desc}
              </p>
            )}
          </div>
          <div>
            <label style={labelSt}>Score de risque (si applicable)</label>
            <input
              value={form.scoreRisque}
              onChange={e => f("scoreRisque", e.target.value)}
              placeholder="SCORE2, GRACE, TIMI..."
              style={inputSt}
            />
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
              placeholder="Ex: Insuffisance cardiaque, Cardiopathie ischémique..."
              style={inputSt}
            />
          </div>
          <div>
            <label style={labelSt}>Diagnostics secondaires</label>
            <input
              value={form.diagnosticsSecondaires}
              onChange={e => f("diagnosticsSecondaires", e.target.value)}
              placeholder="Séparer par des virgules"
              style={inputSt}
            />
          </div>
          <div>
            <label style={labelSt}>Plan de traitement</label>
            <textarea
              value={form.planTraitement}
              onChange={e => f("planTraitement", e.target.value)}
              placeholder="Médicaments, posologies, ajustements..."
              rows={3}
              style={inputSt}
            />
          </div>
          <div>
            <label style={labelSt}>Recommandations (hygiène de vie, régime...)</label>
            <textarea
              value={form.recommandations}
              onChange={e => f("recommandations", e.target.value)}
              placeholder="Régime hyposodé, activité physique, arrêt tabac..."
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