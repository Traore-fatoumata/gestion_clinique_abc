/**
 * ═══════════════════════════════════════════════════════════
 *  NEUROLOGIE — Formulaire de consultation spécifique
 *  ═══════════════════════════════════════════════════════════
 * 
 *  Formulaire de consultation adapté aux besoins spécifiques
 *  de la neurologie, incluant l'évaluation neurologique complète,
 *  les échelles d'évaluation et le suivi des maladies chroniques.
 */

import { useState } from "react"
import { C, inputSt, labelSt, RegSection, Btn } from "../../shared.jsx"
import { 
  CONSULTATION_NEURO_DEFAULT,
  ECHELLE_GLASGOW,
  STADES_PARKINSON,
  TYPES_CRISES_EPILEPTIQUES,
  ANTIEPILEPTIQUES,
  ECHELLE_RANKIN,
} from "./consultationConstants.js"

/**
 * Composant pour le formulaire de consultation en neurologie
 */
export default function ConsultationNeuro({
  patient,
  consultation,
  onSave,
  onCancel,
}) {
  const [form, setForm] = useState(() => ({
    ...CONSULTATION_NEURO_DEFAULT,
    ...consultation,
  }))

  const f = (k, v) => setForm(p => ({ ...p, [k]: v }))

  // Calcul du score de Glasgow
  const calculerGlasgow = () => {
    const yeux = parseInt(form.glasgowYeux) || 0
    const verbal = parseInt(form.glasgowVerbal) || 0
    const moteur = parseInt(form.glasgowMoteur) || 0
    return yeux + verbal + moteur
  }

  const scoreGlasgow = calculerGlasgow()

  const handleSubmit = () => {
    if (!form.diagnosticPrincipal.trim()) {
      alert("Le diagnostic principal est obligatoire.")
      return
    }
    onSave({
      ...form,
      scoreGlasgow: scoreGlasgow > 0 ? scoreGlasgow : undefined,
    })
  }

  return (
    <div style={{ padding: "20px", maxHeight: "70vh", overflowY: "auto" }}>
      <div style={{ marginBottom: "20px", paddingBottom: "12px", borderBottom: `1px solid ${C.border}` }}>
        <h3 style={{ fontSize: "16px", fontWeight: "700", color: C.textPri, marginBottom: "4px" }}>
          Consultation de Neurologie
        </h3>
        <p style={{ fontSize: "12px", color: C.textMuted }}>
          Patient : {patient?.nom} — {patient?.pid}
        </p>
      </div>

      {/* Informations générales */}
      <RegSection title="Informations générales">
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <div>
            <label style={labelSt}>Motif de consultation</label>
            <textarea
              value={form.motifConsultation}
              onChange={e => f("motifConsultation", e.target.value)}
              placeholder="Ex: Céphalées, vertiges, faiblesse..."
              rows={2}
              style={inputSt}
            />
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <div>
              <label style={labelSt}>Mode de début</label>
              <select
                value={form.modeDebut}
                onChange={e => f("modeDebut", e.target.value)}
                style={inputSt}
              >
                <option value="">—</option>
                <option value="aigu">Aigu (minutes/heures)</option>
                <option value="subaigu">Subaigu (jours)</option>
                <option value="progressif">Progressif (semaines/mois)</option>
                <option value="chronique">Chronique (années)</option>
              </select>
            </div>
            <div>
              <label style={labelSt}>Évolution</label>
              <select
                value={form.evolution}
                onChange={e => f("evolution", e.target.value)}
                style={inputSt}
              >
                <option value="">—</option>
                <option value="amelioration">Amélioration</option>
                <option value="stabilite">Stabilité</option>
                <option value="aggravation">Aggravation</option>
                <option value="poussees">Par poussées</option>
              </select>
            </div>
          </div>
        </div>
      </RegSection>

      {/* Score de Glasgow */}
      <RegSection title="Score de Glasgow (si trouble de conscience)">
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12 }}>
          <div>
            <label style={labelSt}>Ouverture des yeux</label>
            <select
              value={form.glasgowYeux}
              onChange={e => f("glasgowYeux", e.target.value)}
              style={inputSt}
            >
              <option value="">—</option>
              {ECHELLE_GLASGOW.ouvertureYeux.map(o => (
                <option key={o.score} value={o.score}>{o.score} - {o.description}</option>
              ))}
            </select>
          </div>
          <div>
            <label style={labelSt}>Réponse verbale</label>
            <select
              value={form.glasgowVerbal}
              onChange={e => f("glasgowVerbal", e.target.value)}
              style={inputSt}
            >
              <option value="">—</option>
              {ECHELLE_GLASGOW.reponseVerbale.map(o => (
                <option key={o.score} value={o.score}>{o.score} - {o.description}</option>
              ))}
            </select>
          </div>
          <div>
            <label style={labelSt}>Réponse motrice</label>
            <select
              value={form.glasgowMoteur}
              onChange={e => f("glasgowMoteur", e.target.value)}
              style={inputSt}
            >
              <option value="">—</option>
              {ECHELLE_GLASGOW.reponseMotrice.map(o => (
                <option key={o.score} value={o.score}>{o.score} - {o.description}</option>
              ))}
            </select>
          </div>
        </div>
        {scoreGlasgow > 0 && (
          <div style={{ marginTop: 12, padding: "8px 12px", background: scoreGlasgow <= 8 ? C.redSoft : scoreGlasgow <= 12 ? C.amberSoft : C.greenSoft, borderRadius: 8 }}>
            <p style={{ fontSize: 13, fontWeight: 600, color: scoreGlasgow <= 8 ? C.red : scoreGlasgow <= 12 ? C.amber : C.green }}>
              Score de Glasgow : {scoreGlasgow}/15 — {scoreGlasgow <= 8 ? "Coma (intubation recommandée)" : scoreGlasgow <= 12 ? "Trouble de conscience modéré" : "Conscience normale ou peu altérée"}
            </p>
          </div>
        )}
      </RegSection>

      {/* Symptômes neurologiques */}
      <RegSection title="Symptômes neurologiques">
        <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 12 }}>
          <div>
            <label style={labelSt}>Céphalées</label>
            <textarea
              value={form.cephalées}
              onChange={e => f("cephalées", e.target.value)}
              placeholder="Type, localisation, fréquence, intensité..."
              rows={2}
              style={inputSt}
            />
          </div>
          <div>
            <label style={labelSt}>Vertiges / Étourdissements</label>
            <textarea
              value={form.vertiges}
              onChange={e => f("vertiges", e.target.value)}
              placeholder="Rotationnels, déséquilibre..."
              rows={2}
              style={inputSt}
            />
          </div>
          <div>
            <label style={labelSt}>Troubles de la vision</label>
            <textarea
              value={form.troublesVision}
              onChange={e => f("troublesVision", e.target.value)}
              placeholder="Vision double, perte visuelle..."
              rows={2}
              style={inputSt}
            />
          </div>
          <div>
            <label style={labelSt}>Troubles de la parole</label>
            <textarea
              value={form.troublesParole}
              onChange={e => f("troublesParole", e.target.value)}
              placeholder="Aphasie, dysarthrie..."
              rows={2}
              style={inputSt}
            />
          </div>
          <div>
            <label style={labelSt}>Troubles de la déglutition</label>
            <textarea
              value={form.troublesDeglutition}
              onChange={e => f("troublesDeglutition", e.target.value)}
              placeholder="Fausses routes, dysphagie..."
              rows={2}
              style={inputSt}
            />
          </div>
          <div>
            <label style={labelSt}>Faiblesse des membres</label>
            <textarea
              value={form.faiblesseMembres}
              onChange={e => f("faiblesseMembres", e.target.value)}
              placeholder="Localisation, intensité, évolution..."
              rows={2}
              style={inputSt}
            />
          </div>
          <div>
            <label style={labelSt}>Troubles de la sensibilité</label>
            <textarea
              value={form.troublesSensibilite}
              onChange={e => f("troublesSensibilite", e.target.value)}
              placeholder="Engourdissements, fourmillements..."
              rows={2}
              style={inputSt}
            />
          </div>
          <div>
            <label style={labelSt}>Tremblements / Mouvements anormaux</label>
            <textarea
              value={form.tremblements}
              onChange={e => f("tremblements", e.target.value)}
              placeholder="Type, localisation, circonstances..."
              rows={2}
              style={inputSt}
            />
          </div>
          <div>
            <label style={labelSt}>Convulsions / Crises</label>
            <textarea
              value={form.convulsions}
              onChange={e => f("convulsions", e.target.value)}
              placeholder="Type, fréquence, durée..."
              rows={2}
              style={inputSt}
            />
          </div>
          <div>
            <label style={labelSt}>Troubles de la mémoire / cognition</label>
            <textarea
              value={form.troublesMemoire}
              onChange={e => f("troublesMemoire", e.target.value)}
              placeholder="Mémoire récente, ancienne, orientation..."
              rows={2}
              style={inputSt}
            />
          </div>
          <div>
            <label style={labelSt}>Troubles de l'équilibre / marche</label>
            <textarea
              value={form.troublesEquilibre}
              onChange={e => f("troublesEquilibre", e.target.value)}
              placeholder="Instabilité, chutes, démarche..."
              rows={2}
              style={inputSt}
            />
          </div>
        </div>
      </RegSection>

      {/* Examen neurologique */}
      <RegSection title="Examen neurologique">
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <div>
              <label style={labelSt}>État de conscience</label>
              <select
                value={form.etatConscience}
                onChange={e => f("etatConscience", e.target.value)}
                style={inputSt}
              >
                <option value="">—</option>
                <option value="normal">Normal</option>
                <option value="obnubilation">Obnubilation</option>
                <option value="sopor">Sopor</option>
                <option value="coma">Coma</option>
              </select>
            </div>
            <div>
              <label style={labelSt}>Orientation</label>
              <select
                value={form.orientation}
                onChange={e => f("orientation", e.target.value)}
                style={inputSt}
              >
                <option value="">—</option>
                <option value="normale">Normale</option>
                <option value="desorientee_temporel">Désorientée temporelle</option>
                <option value="desorientee_spatial">Désorientée spatiale</option>
                <option value="desorientee_complet">Désorientée complète</option>
              </select>
            </div>
          </div>
          <div>
            <label style={labelSt}>Nerfs crâniens</label>
            <textarea
              value={form.nerfsCraniens}
              onChange={e => f("nerfsCraniens", e.target.value)}
              placeholder="Pupilles, motricité oculaire, visage, déglutition..."
              rows={2}
              style={inputSt}
            />
          </div>
        </div>
      </RegSection>

      {/* Motricité */}
      <RegSection title="Motricité">
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12 }}>
          <div>
            <label style={labelSt}>Force MS Droit (0-5)</label>
            <select
              value={form.forceMembreSuperieurD}
              onChange={e => f("forceMembreSuperieurD", e.target.value)}
              style={inputSt}
            >
              <option value="">—</option>
              <option value="5">5 - Normale</option>
              <option value="4">4 - Réduite contre résistance</option>
              <option value="3">3 - Contre pesanteur</option>
              <option value="2">2 - Gravité abolie</option>
              <option value="1">1 - Contraction visible</option>
              <option value="0">0 - Nulle</option>
            </select>
          </div>
          <div>
            <label style={labelSt}>Force MS Gauche (0-5)</label>
            <select
              value={form.forceMembreSuperieurG}
              onChange={e => f("forceMembreSuperieurG", e.target.value)}
              style={inputSt}
            >
              <option value="">—</option>
              <option value="5">5 - Normale</option>
              <option value="4">4 - Réduite contre résistance</option>
              <option value="3">3 - Contre pesanteur</option>
              <option value="2">2 - Gravité abolie</option>
              <option value="1">1 - Contraction visible</option>
              <option value="0">0 - Nulle</option>
            </select>
          </div>
          <div>
            <label style={labelSt}>Force MI Droit (0-5)</label>
            <select
              value={form.forceMembreInferieurD}
              onChange={e => f("forceMembreInferieurD", e.target.value)}
              style={inputSt}
            >
              <option value="">—</option>
              <option value="5">5 - Normale</option>
              <option value="4">4 - Réduite contre résistance</option>
              <option value="3">3 - Contre pesanteur</option>
              <option value="2">2 - Gravité abolie</option>
              <option value="1">1 - Contraction visible</option>
              <option value="0">0 - Nulle</option>
            </select>
          </div>
          <div>
            <label style={labelSt}>Force MI Gauche (0-5)</label>
            <select
              value={form.forceMembreInferieurG}
              onChange={e => f("forceMembreInferieurG", e.target.value)}
              style={inputSt}
            >
              <option value="">—</option>
              <option value="5">5 - Normale</option>
              <option value="4">4 - Réduite contre résistance</option>
              <option value="3">3 - Contre pesanteur</option>
              <option value="2">2 - Gravité abolie</option>
              <option value="1">1 - Contraction visible</option>
              <option value="0">0 - Nulle</option>
            </select>
          </div>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginTop: 12 }}>
          <div>
            <label style={labelSt}>Tonus musculaire</label>
            <textarea
              value={form.tonusMusculaire}
              onChange={e => f("tonusMusculaire", e.target.value)}
              placeholder="Normal, hypertonie, hypotonie..."
              rows={2}
              style={inputSt}
            />
          </div>
          <div>
            <label style={labelSt}>Mouvements anormaux</label>
            <textarea
              value={form.mouvementsAnormaux}
              onChange={e => f("mouvementsAnormaux", e.target.value)}
              placeholder="Tremblements, chorée, dystonie..."
              rows={2}
              style={inputSt}
            />
          </div>
        </div>
      </RegSection>

      {/* Réflexes */}
      <RegSection title="Réflexes et sensibilité">
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12 }}>
          <div>
            <label style={labelSt}>Réflexes ostéo-tendineux</label>
            <select
              value={form.reflexesOsteotendineux}
              onChange={e => f("reflexesOsteotendineux", e.target.value)}
              style={inputSt}
            >
              <option value="">—</option>
              <option value="normaux">Normaux</option>
              <option value="vifs">Vifs</option>
              <option value="abolis">Abolis</option>
              <option value="asymetriques">Asymétriques</option>
            </select>
          </div>
          <div>
            <label style={labelSt}>Signe de Babinski</label>
            <select
              value={form.signeBabinski}
              onChange={e => f("signeBabinski", e.target.value)}
              style={inputSt}
            >
              <option value="">—</option>
              <option value="absent">Absent</option>
              <option value="present">Présent</option>
              <option value="indeterminé">Indéterminé</option>
            </select>
          </div>
          <div>
            <label style={labelSt}>Sensibilité</label>
            <select
              value={form.sensibiliteTactile}
              onChange={e => f("sensibiliteTactile", e.target.value)}
              style={inputSt}
            >
              <option value="">—</option>
              <option value="normale">Normale</option>
              <option value="diminuee">Diminuée</option>
              <option value="abolie">Abolie</option>
              <option value="asymetrique">Asymétrique</option>
            </select>
          </div>
        </div>
      </RegSection>

      {/* Coordination et équilibre */}
      <RegSection title="Coordination et équilibre">
        <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 12 }}>
          <div>
            <label style={labelSt}>Épreuve doigt-nez</label>
            <select
              value={form.epreuveDoigtNez}
              onChange={e => f("epreuveDoigtNez", e.target.value)}
              style={inputSt}
            >
              <option value="">—</option>
              <option value="normale">Normale</option>
              <option value="dysmetrie">Dysmétrie</option>
              <option value="adiadococinesie">Adiadococinésie</option>
            </select>
          </div>
          <div>
            <label style={labelSt}>Épreuve genou-talon</label>
            <select
              value={form.epreuveGenouTalon}
              onChange={e => f("epreuveGenouTalon", e.target.value)}
              style={inputSt}
            >
              <option value="">—</option>
              <option value="normale">Normale</option>
              <option value="dysmetrie">Dysmétrie</option>
            </select>
          </div>
          <div>
            <label style={labelSt}>Signe de Romberg</label>
            <select
              value={form.Romberg}
              onChange={e => f("Romberg", e.target.value)}
              style={inputSt}
            >
              <option value="">—</option>
              <option value="negatif">Négatif</option>
              <option value="positif">Positif</option>
            </select>
          </div>
          <div>
            <label style={labelSt}>Marche</label>
            <select
              value={form.marche}
              onChange={e => f("marche", e.target.value)}
              style={inputSt}
            >
              <option value="">—</option>
              <option value="normale">Normale</option>
              <option value="ataxique">Ataxique</option>
              <option value="parkinsonienne">Parkinsonienne</option>
              <option value="hemiplegique">Hémiplégique</option>
              <option value="steppante">Steppante</option>
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
                checked={form.scannerFait}
                onChange={e => f("scannerFait", e.target.checked)}
                style={{ accentColor: C.blue }}
              />
              Scanner cérébral
            </label>
            <textarea
              value={form.scannerResultat}
              onChange={e => f("scannerResultat", e.target.value)}
              placeholder="Résultats..."
              rows={2}
              style={{ ...inputSt, marginTop: 6 }}
              disabled={!form.scannerFait}
            />
          </div>
          <div>
            <label style={{ ...labelSt, display: "flex", alignItems: "center", gap: 8 }}>
              <input
                type="checkbox"
                checked={form.IRMFait}
                onChange={e => f("IRMFait", e.target.checked)}
                style={{ accentColor: C.blue }}
              />
              IRM cérébrale / médullaire
            </label>
            <textarea
              value={form.IRMResultat}
              onChange={e => f("IRMResultat", e.target.value)}
              placeholder="Résultats..."
              rows={2}
              style={{ ...inputSt, marginTop: 6 }}
              disabled={!form.IRMFait}
            />
          </div>
          <div>
            <label style={{ ...labelSt, display: "flex", alignItems: "center", gap: 8 }}>
              <input
                type="checkbox"
                checked={form.EEGFait}
                onChange={e => f("EEGFait", e.target.checked)}
                style={{ accentColor: C.blue }}
              />
              EEG
            </label>
            <textarea
              value={form.EEGResultat}
              onChange={e => f("EEGResultat", e.target.value)}
              placeholder="Résultats..."
              rows={2}
              style={{ ...inputSt, marginTop: 6 }}
              disabled={!form.EEGFait}
            />
          </div>
          <div>
            <label style={{ ...labelSt, display: "flex", alignItems: "center", gap: 8 }}>
              <input
                type="checkbox"
                checked={form.EMGFait}
                onChange={e => f("EMGFait", e.target.checked)}
                style={{ accentColor: C.blue }}
              />
              EMG
            </label>
            <textarea
              value={form.EMGResultat}
              onChange={e => f("EMGResultat", e.target.value)}
              placeholder="Résultats..."
              rows={2}
              style={{ ...inputSt, marginTop: 6 }}
              disabled={!form.EMGFait}
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
              placeholder="Ex: AVC ischémique, Épilepsie, Migraine..."
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
            <label style={labelSt}>Recommandations</label>
            <textarea
              value={form.recommandations}
              onChange={e => f("recommandations", e.target.value)}
              placeholder="Surveillance, rééducation, mode de vie..."
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