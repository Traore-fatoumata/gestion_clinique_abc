import { useEffect, useState, useCallback } from "react"
import { useSharedData } from "../../../hooks/useSharedData"
import { C, Btn, Avatar } from "./shared.jsx"

export default function PageReferencesRecues({ medecin }) {
  const { recupererReferencesRecues, mettreAJourStatutReference, rafraichir } = useSharedData()
  const [references, setReferences] = useState([])
  const [loadingRef, setLoadingRef] = useState(false)
  const [filtreStatut, setFiltreStatut] = useState("En attente")

  const chargerReferences = useCallback(async () => {
    if (!medecin?.specialite) return
    setLoadingRef(true)
    try {
      const list = await recupererReferencesRecues(medecin.specialite)
      setReferences(list)
    } catch (err) {
      console.error(err)
    } finally {
      setLoadingRef(false)
    }
  }, [medecin?.specialite, recupererReferencesRecues])

  useEffect(() => {
    chargerReferences()
  }, [chargerReferences])

  const handleAccepter = async (id) => {
    try {
      await mettreAJourStatutReference(id, "Acceptée")
      alert("Référence acceptée. Le patient a été ajouté à votre file d'attente.")
      await chargerReferences()
      if (rafraichir) await rafraichir()
    } catch (err) {
      alert("Erreur lors de l'acceptation: " + err.message)
    }
  }

  const handleRefuser = async (id) => {
    if (!window.confirm("Êtes-vous sûr de vouloir annuler cette référence ?")) return
    const raison = window.prompt("Motif de l'annulation (optionnel) :")
    try {
      await mettreAJourStatutReference(id, "Annulée", raison)
      alert("Référence annulée.")
      await chargerReferences()
    } catch (err) {
      alert("Erreur lors de l'annulation: " + err.message)
    }
  }

  const filtrerRef = references.filter(r => r.statut === filtreStatut)

  const getPriorityColor = (prio) => {
    switch (prio) {
      case "Critique": return { bg: "#fef2f2", border: "#fca5a5", text: "#b91c1c" }
      case "Urgente": return { bg: "#fff7ed", border: "#fdba74", text: "#c2410c" }
      default: return { bg: "#eff6ff", border: "#93c5fd", text: "#1d4ed8" }
    }
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <div style={{ display: "flex", gap: 8, borderBottom: "1px solid " + C.border, paddingBottom: 10 }}>
        {["En attente", "Acceptée", "Annulée"].map(st => (
          <button
            key={st}
            onClick={() => setFiltreStatut(st)}
            style={{
              padding: "8px 16px",
              background: filtreStatut === st ? C.blue : "transparent",
              color: filtreStatut === st ? "#fff" : C.textSec,
              border: "none",
              borderRadius: 8,
              fontSize: 13,
              fontWeight: 600,
              cursor: "pointer",
              transition: "all 0.2s"
            }}
          >
            {st} ({references.filter(r => r.statut === st).length})
          </button>
        ))}
      </div>

      {loadingRef ? (
        <div style={{ padding: "40px 0", textAlign: "center", color: C.textMuted }}>
          Chargement des orientations inter-services...
        </div>
      ) : filtrerRef.length === 0 ? (
        <div style={{ padding: "40px 20px", background: C.white, borderRadius: 16, border: "1px solid " + C.border, textAlign: "center", color: C.textMuted }}>
          Aucune demande d'orientation reçue pour le moment avec le statut <strong>{filtreStatut.toLowerCase()}</strong>.
        </div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(360px, 1fr))", gap: 16 }}>
          {filtrerRef.map(ref => {
            const prioStyle = getPriorityColor(ref.priorite)
            return (
              <div
                key={ref.id}
                style={{
                  background: C.white,
                  border: "1px solid " + C.border,
                  borderRadius: 16,
                  padding: 18,
                  boxShadow: "0 4px 12px rgba(0,0,0,0.03)",
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "space-between",
                  gap: 14,
                  transition: "transform 0.15s ease, box-shadow 0.15s ease",
                  cursor: "default"
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.transform = "translateY(-2px)"
                  e.currentTarget.style.boxShadow = "0 8px 20px rgba(0,0,0,0.06)"
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.transform = "none"
                  e.currentTarget.style.boxShadow = "0 4px 12px rgba(0,0,0,0.03)"
                }}
              >
                <div>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <Avatar name={ref.patientNom} size={38} />
                      <div>
                        <h4 style={{ fontSize: 14, fontWeight: 700, color: C.textPri, margin: 0 }}>{ref.patientNom}</h4>
                        <p style={{ fontSize: 11, color: C.textSec, margin: "2px 0 0" }}>
                          {ref.patientSexe === "F" ? "Femme" : "Homme"} · {ref.patientDateNaissance ? (new Date().getFullYear() - new Date(ref.patientDateNaissance).getFullYear()) : "—"} ans
                        </p>
                      </div>
                    </div>
                    <span
                      style={{
                        padding: "4px 8px",
                        fontSize: 10,
                        fontWeight: 800,
                        borderRadius: 6,
                        background: prioStyle.bg,
                        border: "1px solid " + prioStyle.border,
                        color: prioStyle.text,
                        textTransform: "uppercase"
                      }}
                    >
                      {ref.priorite}
                    </span>
                  </div>

                  <div style={{ fontSize: 12, borderTop: "1px solid " + C.border, paddingTop: 10, marginTop: 10 }}>
                    <p style={{ margin: "0 0 6px" }}>
                      <strong style={{ color: C.textSec }}>Demandeur :</strong> Dr. {ref.medecinDemandeurNom} ({ref.serviceOrigine})
                    </p>
                    <p style={{ margin: "0 0 6px" }}>
                      <strong style={{ color: C.textSec }}>Motif :</strong> {ref.motifReference}
                    </p>
                    {ref.commentaires && (
                      <div style={{ background: "#f8fafc", borderLeft: "3px solid " + C.blue, padding: "6px 10px", borderRadius: 4, marginTop: 8, fontStyle: "italic" }}>
                        "{ref.commentaires}"
                      </div>
                    )}
                  </div>
                </div>

                {ref.statut === "En attente" && (
                  <div style={{ display: "flex", gap: 10, borderTop: "1px solid " + C.border, paddingTop: 12, marginTop: 6 }}>
                    <Btn onClick={() => handleRefuser(ref.id)} variant="secondary" style={{ flex: 1 }}>
                      Refuser
                    </Btn>
                    <Btn onClick={() => handleAccepter(ref.id)} variant="primary" style={{ flex: 2 }}>
                      Admettre
                    </Btn>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
