/**
 * ═══════════════════════════════════════════════════════════
 *  PÉDIATRIE — Formulaire de consultation spécifique
 *  ═══════════════════════════════════════════════════════════
 * 
 *  Formulaire de consultation adapté aux besoins spécifiques
 *  de la pédiatrie, incluant le suivi de croissance, les 
 *  vaccinations et le développement de l'enfant.
 */

import { useState } from "react"
import { C, inputSt, labelSt, RegSection, Btn } from "../../shared.jsx"
import { 
  CONSULTATION_PEDO_DEFAULT, 
  ETAPES_DEVELOPPEMENT,
  VACCINS_PEV,
  MODES_ALIMENTATION,
} from "./consultationConstants.js"

/**
 * Composant pour le formulaire de consultation en pédiatrie
 */
export default function ConsultationPedo({
  patient,
  consultation,
  onSave,
  onCancel,
}) {
  const [form, setForm] = useState(() => ({
    ...CONSULTATION_PEDO_DEFAULT,
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

  // Calcul de l'âge en mois pour les nourrissons
  const getAgeMois = () => {
    if (!patient?.dateNaissance) return 0
    const naissance = new Date(patient.dateNaissance)
    const aujourdhui = new Date()
    const mois = (aujourdhui.getFullYear() - naissance.getFullYear()) * 12 + 
                 (aujourdhui.getMonth() - naissance.getMonth())
    return Math.max(0, mois)
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

  const ageMois = getAgeMois()
  const estNourrisson = ageMois <= 24

  return (
    <div style={{ padding: "20px", maxHeight: "70vh", overflowY: "auto" }}>
      <div style={{ marginBottom: "20px", paddingBottom: "12px", borderBottom: `1px solid ${C.border}` }}>
        <h3 style={{ fontSize: "16px", fontWeight: "700", color: C.textPri, marginBottom: "4px" }}>
          Consultation de Pédiatrie
        </h3>
        <p style={{ fontSize: "12px", color: C.textMuted }}>
          Patient : {patient?.nom} — {patient?.pid} — {ageMois} mois
        </p>
      </div>

      {/* Données anthropométriques */}
      <RegSection title="Données anthropométriques">
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12 }}>
          <div>
            <label style={labelSt}>Poids (kg)</label>
            <input
              type="number"
              value={form.poids}
              onChange={e => f("poids", e.target.value)}
              placeholder="Ex: 8.5"
              style={inputSt}
            />
          </div>
          <div>
            <label style={labelSt}>Taille (cm)</label>
            <input
              type="number"
              value={form.taille}
              onChange={e => f("taille", e.target.value)}
              placeholder="Ex: 72"
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
          {estNourrisson && (
            <div>
              <label style={labelSt}>Périmètre crânien (cm)</label>
              <input
                type="number"
                value={form.perimetreCrânien}
                onChange={e => f("perimetreCrânien", e.target.value)}
                placeholder="Ex: 44"
                style={inputSt}
              />
            </div>
          )}
        </div>
      </RegSection>

      {/* Données de naissance (pour les nourrissons) */}
      {estNourrisson && (
        <RegSection title="Données de naissance">
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12 }}>
            <div>
              <label style={labelSt}>Âge gestationnel (SA)</label>
              <input
                type="number"
                value={form.ageGestationnel}
                onChange={e => f("ageGestationnel", e.target.value)}
                placeholder="Ex: 40"
                style={inputSt}
              />
            </div>
            <div>
              <label style={labelSt}>Poids de naissance (kg)</label>
              <input
                type="number"
                value={form.poidsNaissance}
                onChange={e => f("poidsNaissance", e.target.value)}
                placeholder="Ex: 3.2"
                style={inputSt}
              />
            </div>
            <div>
              <label style={labelSt}>Taille naissance (cm)</label>
              <input
                type="number"
                value={form.tailleNaissance}
                onChange={e => f("tailleNaissance", e.target.value)}
                placeholder="Ex: 50"
                style={inputSt}
              />
            </div>
            <div>
              <label style={labelSt}>APGAR 1 min</label>
              <input
                type="number"
                value={form.apgar1}
                onChange={e => f("apgar1", e.target.value)}
                placeholder="Ex: 8"
                style={inputSt}
              />
            </div>
            <div>
              <label style={labelSt}>APGAR 5 min</label>
              <input
                type="number"
                value={form.apgar5}
                onChange={e => f("apgar5", e.target.value)}
                placeholder="Ex: 9"
                style={inputSt}
              />
            </div>
            <div>
              <label style={labelSt}>Mode d'alimentation</label>
              <select
                value={form.modeAlimentation}
                onChange={e => f("modeAlimentation", e.target.value)}
                style={inputSt}
              >
                <option value="">—</option>
                {MODES_ALIMENTATION.map(m => (
                  <option key={m} value={m}>{m}</option>
                ))}
              </select>
            </div>
          </div>
        </RegSection>
      )}

      {/* Vaccinations */}
      <RegSection title="Vaccinations">
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <div>
            <label style={labelSt}>Statut vaccinal</label>
            <select
              value={form.statutVaccinal}
              onChange={e => f("statutVaccinal", e.target.value)}
              style={inputSt}
            >
              <option value="">—</option>
              <option value="à_jour">À jour</option>
              <option value="retard">En retard</option>
              <option value="inconnu">Inconnu</option>
            </select>
          </div>
          <div>
            <label style={labelSt}>Vaccins reçus (cocher)</label>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 6, marginTop: 6 }}>
              {VACCINS_PEV.map(v => (
                <label key={v.nom} style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, cursor: "pointer" }}>
                  <input
                    type="checkbox"
                    checked={form.vaccinsRecus.includes(v.nom)}
                    onChange={e => {
                      if (e.target.checked) {
                        f("vaccinsRecus", [...form.vaccinsRecus, v.nom])
                      } else {
                        f("vaccinsRecus", form.vaccinsRecus.filter(n => n !== v.nom))
                      }
                    }}
                    style={{ accentColor: C.blue }}
                  />
                  {v.nom} ({v.age})
                </label>
              ))}
            </div>
          </div>
          <div>
            <label style={labelSt}>Vaccins en retard / manquants</label>
            <textarea
              value={form.vaccinsEnRetard}
              onChange={e => f("vaccinsEnRetard", e.target.value)}
              placeholder="Lister les vaccins manquants..."
              rows={2}
              style={inputSt}
            />
          </div>
          <div>
            <label style={labelSt}>Prochain vaccin prévu</label>
            <input
              type="date"
              value={form.prochainVaccin}
              onChange={e => f("prochainVaccin", e.target.value)}
              style={inputSt}
            />
          </div>
        </div>
      </RegSection>

      {/* Alimentation et sommeil */}
      <RegSection title="Alimentation & Sommeil">
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
          <div>
            <label style={labelSt}>Mode d'alimentation actuel</label>
            <select
              value={form.modeAlimentationActuel}
              onChange={e => f("modeAlimentationActuel", e.target.value)}
              style={inputSt}
            >
              <option value="">—</option>
              {MODES_ALIMENTATION.map(m => (
                <option key={m} value={m}>{m}</option>
              ))}
            </select>
          </div>
          <div>
            <label style={labelSt}>Diversification alimentaire</label>
            <select
              value={form.diversificationAlimentaire}
              onChange={e => f("diversificationAlimentaire", e.target.value)}
              style={inputSt}
            >
              <option value="">—</option>
              <option value="non_commencee">Non commencée</option>
              <option value="en_cours">En cours</option>
              <option value="complete">Complète</option>
            </select>
          </div>
          <div>
            <label style={labelSt}>Difficultés alimentaires</label>
            <textarea
              value={form.difficultesAlimentaires}
              onChange={e => f("difficultesAlimentaires", e.target.value)}
              placeholder="Refus alimentaire, vomissements..."
              rows={2}
              style={inputSt}
            />
          </div>
          <div>
            <label style={labelSt}>Sommeil (heures/nuit)</label>
            <input
              type="number"
              value={form.heuresSommeil}
              onChange={e => f("heuresSommeil", e.target.value)}
              placeholder="Ex: 12"
              style={inputSt}
            />
          </div>
        </div>
      </RegSection>

      {/* Développement de l'enfant */}
      {estNourrisson && (
        <RegSection title="Développement psychomoteur">
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <div>
              <label style={labelSt}>Âge correctionnel (si prématuré)</label>
              <input
                type="text"
                value={form.ageCorrectionnel}
                onChange={e => f("ageCorrectionnel", e.target.value)}
                placeholder="Ex: 4 mois (né à 36 SA)"
                style={inputSt}
              />
            </div>
            <div>
              <label style={labelSt}>Étapes de développement acquises</label>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginTop: 6 }}>
                {Object.entries(ETAPES_DEVELOPPEMENT).map(([age, etapes]) => (
                  <div key={age} style={{ marginBottom: 8, width: "100%" }}>
                    <p style={{ fontSize: 11, fontWeight: 600, color: C.textPri, marginBottom: 4 }}>{age}:</p>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
                      {etapes.map(etape => (
                        <label key={etape} style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 11, cursor: "pointer" }}>
                          <input
                            type="checkbox"
                            checked={form.etapesDevelopment?.includes(etape)}
                            onChange={e => {
                              const current = form.etapesDevelopment || []
                              if (e.target.checked) {
                                f("etapesDevelopment", [...current, etape])
                              } else {
                                f("etapesDevelopment", current.filter(e => e !== etape))
                              }
                            }}
                            style={{ accentColor: C.blue }}
                          />
                          {etape}
                        </label>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </RegSection>
      )}

      {/* Symptômes spécifiques */}
      <RegSection title="Symptômes actuels">
        <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 12 }}>
          <div>
            <label style={labelSt}>Fièvre</label>
            <textarea
              value={form.fievre}
              onChange={e => f("fievre", e.target.value)}
              placeholder="Température, durée, courbe..."
              rows={2}
              style={inputSt}
            />
          </div>
          <div>
            <label style={labelSt}>Toux</label>
            <textarea
              value={form.toux}
              onChange={e => f("toux", e.target.value)}
              placeholder="Sèche, grasse, quintes..."
              rows={2}
              style={inputSt}
            />
          </div>
          <div>
            <label style={labelSt}>Vomissements</label>
            <textarea
              value={form.vomissements}
              onChange={e => f("vomissements", e.target.value)}
              placeholder="Fréquence, aspect, quantité..."
              rows={2}
              style={inputSt}
            />
          </div>
          <div>
            <label style={labelSt}>Diarrhée</label>
            <textarea
              value={form.diarrhee}
              onChange={e => f("diarrhee", e.target.value)}
              placeholder="Fréquence, aspect, sang..."
              rows={2}
              style={inputSt}
            />
          </div>
          <div>
            <label style={labelSt}>Éruption cutanée</label>
            <textarea
              value={form.eruption}
              onChange={e => f("eruption", e.target.value)}
              placeholder="Localisation, aspect, prurit..."
              rows={2}
              style={inputSt}
            />
          </div>
          <div>
            <label style={labelSt}>Douleur</label>
            <textarea
              value={form.douleur}
              onChange={e => f("douleur", e.target.value)}
              placeholder="Localisation, type, intensité..."
              rows={2}
              style={inputSt}
            />
          </div>
        </div>
      </RegSection>

      {/* Examen clinique pédiatrique */}
      <RegSection title="Examen clinique par système">
        <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 12 }}>
          <div>
            <label style={labelSt}>État général</label>
            <textarea
              value={form.etatGeneral}
              onChange={e => f("etatGeneral", e.target.value)}
              placeholder="Vif, fatigué, geignard..."
              rows={2}
              style={inputSt}
            />
          </div>
          <div>
            <label style={labelSt}>Peau et phanères</label>
            <textarea
              value={form.examenPeau}
              onChange={e => f("examenPeau", e.target.value)}
              placeholder="Couleur, turgescence, éruption..."
              rows={2}
              style={inputSt}
            />
          </div>
          <div>
            <label style={labelSt}>Yeux</label>
            <textarea
              value={form.examenYeux}
              onChange={e => f("examenYeux", e.target.value)}
              placeholder="Conjonctives, pupilles..."
              rows={2}
              style={inputSt}
            />
          </div>
          <div>
            <label style={labelSt}>Oreilles</label>
            <textarea
              value={form.examenOreilles}
              onChange={e => f("examenOreilles", e.target.value)}
              placeholder="OT, tympan, écoulement..."
              rows={2}
              style={inputSt}
            />
          </div>
          <div>
            <label style={labelSt}>Bouche et gorge</label>
            <textarea
              value={form.examenBouche}
              onChange={e => f("examenBouche", e.target.value)}
              placeholder="Muqueuses, dents, amygdales..."
              rows={2}
              style={inputSt}
            />
          </div>
          <div>
            <label style={labelSt}>Thorax et poumons</label>
            <textarea
              value={form.examenThorax}
              onChange={e => f("examenThorax", e.target.value)}
              placeholder="Auscultation, tirage, sifflement..."
              rows={2}
              style={inputSt}
            />
          </div>
          <div>
            <label style={labelSt}>Abdomen</label>
            <textarea
              value={form.examenAbdomen}
              onChange={e => f("examenAbdomen", e.target.value)}
              placeholder="Souple, ballonné, douleurs..."
              rows={2}
              style={inputSt}
            />
          </div>
          <div>
            <label style={labelSt}>Système nerveux</label>
            <textarea
              value={form.examenNeuro}
              onChange={e => f("examenNeuro", e.target.value)}
              placeholder="Conscience, tonus, réflexes..."
              rows={2}
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
              placeholder="Ex: Bronchiolite, Gastro-entérite..."
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
              placeholder="Médicaments, posologies adaptées au poids..."
              rows={3}
              style={inputSt}
            />
          </div>
          <div>
            <label style={labelSt}>Recommandations aux parents</label>
            <textarea
              value={form.recommandations}
              onChange={e => f("recommandations", e.target.value)}
              placeholder="Hydratation, alimentation, surveillance..."
              rows={2}
              style={inputSt}
            />
          </div>
          <div>
            <label style={labelSt}>Orientation (si nécessaire)</label>
            <select
              value={form.orientation}
              onChange={e => f("orientation", e.target.value)}
              style={inputSt}
            >
              <option value="">Aucune</option>
              <option value="hospitalisation">Hospitalisation</option>
              <option value="specialiste">Spécialiste</option>
              <option value="centre_reference">Centre de référence</option>
            </select>
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