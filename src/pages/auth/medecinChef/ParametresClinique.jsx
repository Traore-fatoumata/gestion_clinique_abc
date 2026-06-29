import { useState, useEffect } from "react"
import { useSharedData } from "../../../hooks/useSharedData"
import { C, Btn } from "./shared.jsx"

export default function ParametresClinique() {
  const { chargerConfigUrgences, sauvegarderConfigUrgences } = useSharedData()
  const [regle, setRegle] = useState("soigner_d_abord")
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    setLoading(true)
    chargerConfigUrgences()
      .then(config => {
        setRegle(config.regle_paiement_urgences)
      })
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [chargerConfigUrgences])

  const handleSave = async (nouvelleRegle) => {
    setSaving(true)
    try {
      await sauvegarderConfigUrgences({ regle_paiement_urgences: nouvelleRegle })
      setRegle(nouvelleRegle)
      alert("Politique de paiement des urgences mise à jour avec succès.")
    } catch (err) {
      alert("Erreur lors de la mise à jour: " + err.message)
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return <div style={{ padding: 40, textAlign: "center", color: C.textMuted }}>Chargement des configurations...</div>
  }

  return (
    <div style={{ maxWidth: 800, background: C.white, border: "1px solid " + C.border, borderRadius: 16, padding: 24, boxShadow: "0 4px 12px rgba(0,0,0,0.03)" }}>
      <h3 style={{ fontSize: 16, fontWeight: 800, color: C.textPri, margin: 0, borderBottom: "1px solid " + C.border, paddingBottom: 14 }}>
        Paramètres de la Clinique
      </h3>

      <div style={{ marginTop: 20 }}>
        <h4 style={{ fontSize: 13.5, fontWeight: 700, color: C.textPri, marginBottom: 4 }}>
          Politique administrative de facturation des Urgences
        </h4>
        <p style={{ fontSize: 12, color: C.textSec, marginBottom: 20 }}>
          Déterminez comment le système de facturation et de soins doit interagir lors de l'admission d'une urgence médicale.
        </p>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
          {/* Option 1: Payer d'abord */}
          <div
            onClick={() => !saving && handleSave("payer_d_abord")}
            style={{
              border: "2px solid " + (regle === "payer_d_abord" ? C.blue : C.border),
              background: regle === "payer_d_abord" ? "#f0f9ff" : C.white,
              borderRadius: 12,
              padding: 20,
              cursor: saving ? "default" : "pointer",
              transition: "all 0.15s ease",
              opacity: saving ? 0.6 : 1
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
              <span style={{ fontSize: 13.5, fontWeight: 700, color: C.textPri }}>Option 1 : Payer d'abord</span>
              <input type="radio" checked={regle === "payer_d_abord"} readOnly style={{ accentColor: C.blue }} />
            </div>
            <p style={{ fontSize: 12, color: C.textSec, lineHeight: 1.5, margin: 0 }}>
              Les actes, consommables et médicaments d'urgence génèrent une facture d'urgence. Le patient doit <strong>régler la facture en caisse</strong> avant que ses examens ou soins secondaires ne soient validés ou débloqués dans d'autres services.
            </p>
            <div style={{ marginTop: 12, background: "#fffbeb", padding: "6px 10px", borderRadius: 6, fontSize: 11, color: "#92400e" }}>
              ⚠️ Adapté pour limiter les créances, mais peut retarder les soins critiques.
            </div>
          </div>

          {/* Option 2: Soigner d'abord */}
          <div
            onClick={() => !saving && handleSave("soigner_d_abord")}
            style={{
              border: "2px solid " + (regle === "soigner_d_abord" ? C.blue : C.border),
              background: regle === "soigner_d_abord" ? "#f0f9ff" : C.white,
              borderRadius: 12,
              padding: 20,
              cursor: saving ? "default" : "pointer",
              transition: "all 0.15s ease",
              opacity: saving ? 0.6 : 1
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
              <span style={{ fontSize: 13.5, fontWeight: 700, color: C.textPri }}>Option 2 : Soigner d'abord</span>
              <input type="radio" checked={regle === "soigner_d_abord"} readOnly style={{ accentColor: C.blue }} />
            </div>
            <p style={{ fontSize: 12, color: C.textSec, lineHeight: 1.5, margin: 0 }}>
              La prise en charge médicale est immédiate. Le patient est inséré directement dans la file d'attente. Les factures de premiers soins et de consommables sont générées et <strong>mises "en attente"</strong> pour être acquittées au moment de la sortie administrative.
            </p>
            <div style={{ marginTop: 12, background: "#ecfdf5", padding: "6px 10px", borderRadius: 6, fontSize: 11, color: "#065f46" }}>
              ✅ Recommandé pour la déontologie médicale et la rapidité de traitement vital.
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
