/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useState, useEffect, useCallback, useRef } from "react"
import { useAuth } from "./useAuth"
import { buildDonneesBrouillon } from "../utils/clinicFlow.js"

const SharedDataContext = createContext(null)
const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000"

export function SharedDataProvider({ children }) {
  const { getToken, user } = useAuth()

  const [patients,      setPatients]      = useState([])
  const [file,          setFile]          = useState([])
  const [consultations, setConsultations] = useState([])
  const [rdv,           setRdv]           = useState([])
  const [notifs,        setNotifs]        = useState([])
  const [resultatsLabo, setResultatsLabo] = useState([])
  const [soins,         setSoins]         = useState([])
  const [loading,       setLoading]       = useState(false)
  const pollRef = useRef(null)

  const apiFetch = useCallback(async (path, opts = {}) => {
    const token = getToken()
    const res = await fetch(`${API_URL}${path}`, {
      ...opts,
      headers: {
        "Content-Type": "application/json",
        ...(opts.headers || {}),
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
    })
    if (!res.ok) {
      const err = await res.json().catch(() => ({}))
      throw new Error(err.message || `Erreur ${res.status}`)
    }
    return res.json()
  }, [getToken])

  const chargerDonnees = useCallback(async () => {
    if (!user) return
    setLoading(true)
    try {
      const today = new Date().toISOString().slice(0, 10)
      const [patientsRes, fileRes, consultsRes, notifsRes, rdvRes] = await Promise.allSettled([
        apiFetch("/api/patients"),
        apiFetch(`/api/file?date=${today}`),
        apiFetch("/api/consultations"),
        apiFetch("/api/notifications"),
        apiFetch("/api/rdv"),
      ])
      if (patientsRes.status === "fulfilled") {
        const mapped = (patientsRes.value.patients || []).map(p => ({
          ...p,
          dateNaissance: p.date_naissance || p.dateNaissance || null,
        }))
        setPatients(mapped)
      }
      if (fileRes.status      === "fulfilled") setFile(fileRes.value.file || [])
      if (consultsRes.status  === "fulfilled") setConsultations(consultsRes.value.consultations || [])
      if (notifsRes.status    === "fulfilled") setNotifs(notifsRes.value.notifications || [])
      if (rdvRes.status       === "fulfilled") setRdv(rdvRes.value.rdv || [])
    } catch (err) {
      console.error("Erreur chargement données:", err)
    } finally {
      setLoading(false)
    }
  }, [user, apiFetch])

  // Réinitialiser les données côté frontend (mode test)
  const resetAppDataForTest = useCallback(() => {
    setPatients([])
    setFile([])
    setConsultations([])
    setRdv([])
    setNotifs([])
    setResultatsLabo([])
    setSoins([])
    // Effacer quelques clés locales connues si présentes
    try {
      localStorage.removeItem('clinique_medecins_presence')
      localStorage.removeItem('clinique_historique_presence')
      // Ne supprime pas settings ni token — seulement données patients/test
    } catch {
      // Ignorer si l'accès au localStorage échoue dans certains environnements.
    }
  }, [])

  useEffect(() => {
    if (!user) return
    const load = async () => { await chargerDonnees() }
    load()
    // Poll less frequently to avoid triggering backend rate limits
    pollRef.current = setInterval(chargerDonnees, 60_000)
    return () => clearInterval(pollRef.current)
  }, [user, chargerDonnees])

  // ── PATIENTS ────────────────────────────────────────────
  const addPatient = useCallback(async (data) => {
    const res = await apiFetch("/api/patients", {
      method: "POST",
      body: JSON.stringify({
        nom:            data.nom,
        date_naissance: data.dateNaissance || null,
        sexe:           data.sexe || null,
        telephone:      data.telephone || null,
        quartier:       data.quartier || null,
        secteur:        data.secteur || null,
        profession:     data.profession || null,
        responsable:    data.responsable || null,
      }),
    })
    if (res.success) {
      const mappedPatient = {
        ...res.patient,
        dateNaissance: res.patient.date_naissance || res.patient.dateNaissance || null,
      }
      setPatients(prev => [mappedPatient, ...prev])
      return mappedPatient
    }
    throw new Error(res.message)
  }, [apiFetch])

  // ── FILE D'ATTENTE ──────────────────────────────────────
  const addToFile = useCallback(async (data) => {
    const montantConsultation = Number.isFinite(data.montantConsultation)
      ? Number(data.montantConsultation)
      : 0
    const res = await apiFetch("/api/file", {
      method: "POST",
      body: JSON.stringify({
        patient_id:           data.patientId,
        medecin_id:           data.docteurId || null,
        type_visite:          data.typeVisite || "consultation",
        motif:                data.motif || null,
        service:              data.service || null,
        montant_consultation: montantConsultation,
        type_consultation:    data.typeConsultation || "standard",
        rdv_id:               data.rdvId || null,
      }),
    })
    if (res.success) { await chargerDonnees(); return res.entree }
    throw new Error(res.message)
  }, [apiFetch, chargerDonnees])

  const updateFileEntry = useCallback(async (fileId, data) => {
    const payload = {}

    // Statut
    if (data.statut !== undefined) payload.statut = data.statut

    // Médecin assigné — supporte medecin_id ET docteurId
    if (data.medecin_id !== undefined) payload.medecin_id = data.medecin_id
    if (data.docteurId  !== undefined) payload.medecin_id = data.docteurId
    if (data.service !== undefined) payload.service = data.service
    if (data.motif !== undefined) payload.motif = data.motif

    // Examens
    if (data.fraisExamens !== undefined) {
      payload.frais_examens     = data.fraisExamens
      payload.examens_commandes = (data.examensCommandes || []).map(e => ({ nom: e.nom, prix: e.prix || 0 }))
    }
    // Montant consultation (possibilité de modifier le tarif depuis la consultation complète)
    if (data.montantConsultation !== undefined) {
      payload.montant_consultation = Number(data.montantConsultation || 0)
    }
    if (data.examensCommandes !== undefined && data.fraisExamens === undefined) {
      payload.examens_commandes = data.examensCommandes.map(e => ({ nom: e.nom, prix: e.prix || 0 }))
    }

    // Paiement consultation
    if (data.paiementConsultation) {
      payload.paiement_consultation = {
        statut:  data.paiementConsultation.statut,
        montant: data.paiementConsultation.montant,
        methode: data.paiementConsultation.methode,
        note:    data.paiementConsultation.note,
      }
    }

    // Paiement examens
    if (data.paiementExamens) {
      payload.paiement_examens = {
        montant_paye: data.paiementExamens.montantPaye,
        statut:       data.paiementExamens.statut,
        methode:      data.paiementExamens.methode,
        note:         data.paiementExamens.note,
      }
    }

    await apiFetch(`/api/file/${fileId}`, { method: "PATCH", body: JSON.stringify(payload) })

    // Mise à jour locale optimiste
    setFile(prev => prev.map(f => f.id === fileId ? {
      ...f,
      ...data,
      // Normaliser docteurId
      docteurId: data.medecin_id ?? data.docteurId ?? f.docteurId,
    } : f))

    // Rafraîchir pour récupérer les données complètes (nom médecin etc.)
    setTimeout(() => chargerDonnees(), 500)
  }, [apiFetch, chargerDonnees])

  // ── CONSULTATIONS ───────────────────────────────────────
  const addConsultation = useCallback(async (data) => {
    const res = await apiFetch("/api/consultations", {
      method: "POST",
      body: JSON.stringify({
        patient_id:        data.patientId,
        medecin_id:        data.docteurId,
        date:              data.date,
        service:           data.service,
        motif:             data.motif || data.plaintes,
        plaintes:          data.plaintes,
        diagnostics:       data.diagnostics || [],
        traitements:       data.traitements || [],
        frais_examens:     data.fraisExamens || 0,
        type_consultation: data.typeConsultation || "standard",
        examens_commandes: data.examensCommandes || [],
        signe:             data.signe === true,
        signe_par:         data.signePar || null,
        envoyer_labo:      data.envoyerLabo === true,
        donnees_brouillon: data.donneesBrouillon || buildDonneesBrouillon(data),
      }),
    })
    if (res.success) { await chargerDonnees(); return res.consultationId }
    throw new Error(res.message)
  }, [apiFetch, chargerDonnees])

  const signerConsultation = useCallback(async (consultationId, signePar) => {
    await apiFetch(`/api/consultations/${consultationId}/signer`, {
      method: "PATCH",
      body: JSON.stringify({ signe_par: signePar }),
    })
    await chargerDonnees()
  }, [apiFetch, chargerDonnees])

  const updateConsultation = useCallback(async (id, data) => {
    await addConsultation({ ...data, id })
  }, [addConsultation])

  const deleteConsultation = useCallback(async (id) => {
    await apiFetch(`/api/consultations/${id}`, { method: "DELETE" })
    setConsultations(prev => prev.filter(c => c.id !== id))
    await chargerDonnees()
  }, [apiFetch, chargerDonnees])

  // ── RDV ─────────────────────────────────────────────────
  const addRdv = useCallback(async (data) => {
    const res = await apiFetch("/api/rdv", {
      method: "POST",
      body: JSON.stringify({
        patient_id: data.patientId,
        medecin_id: data.docteurId || data.medecin_id,
        date_rdv:   data.date,
        heure_rdv:  data.heure,
        motif:      data.motif || null,
        service:    data.service || null,
      }),
    })
    if (res.success) { setRdv(prev => [...prev, res.rdv]); return res.rdv }
    throw new Error(res.message)
  }, [apiFetch])

  const updateRdv = useCallback(async (id, data) => {
    const payload = {}
    if (data.rappelEnvoye !== undefined) payload.rappel_envoye = data.rappelEnvoye
    if (data.statut !== undefined)       payload.statut        = data.statut
    await apiFetch(`/api/rdv/${id}`, { method: "PATCH", body: JSON.stringify(payload) })
    setRdv(prev => prev.map(r => r.id === id ? { ...r, ...data } : r))
  }, [apiFetch])

  const removeRdv = useCallback(async (id) => {
    await apiFetch(`/api/rdv/${id}`, { method: "DELETE" })
    setRdv(prev => prev.filter(r => r.id !== id))
  }, [apiFetch])

  // ── NOTIFICATIONS ───────────────────────────────────────
  const addNotif = useCallback(async (data) => {
    await apiFetch("/api/notifications", {
      method: "POST",
      body: JSON.stringify({
        docteur_id:  data.docteurId,
        titre:       data.titre || "Nouveau patient assigné",
        patient_nom: data.patientNom,
        motif:       data.motif,
        service:     data.service,
      }),
    })
    if (data.docteurId === user?.id) {
      const res = await apiFetch("/api/notifications")
      setNotifs(res.notifications || [])
    }
  }, [apiFetch, user])

  const marquerNotifLue = useCallback(async (id) => {
    await apiFetch(`/api/notifications/${id}/lue`, { method: "PATCH" })
    setNotifs(prev => prev.map(n => n.id === id ? { ...n, lu: true } : n))
  }, [apiFetch])

  const marquerToutesLues = useCallback(async (docteurId) => {
    if (docteurId !== user?.id) return
    await apiFetch("/api/notifications/toutes-lues", { method: "PATCH" })
    setNotifs(prev => prev.map(n => ({ ...n, lu: true })))
  }, [apiFetch, user])

  // ── LABO & SOINS ────────────────────────────────────────
  const addResultatLabo    = useCallback((data) => setResultatsLabo(prev => [data, ...prev]), [])
  const updateResultatLabo = useCallback((id, data) => setResultatsLabo(prev => prev.map(r => r.id === id ? { ...r, ...data } : r)), [])

  return (
    <SharedDataContext.Provider value={{
      patients, file, consultations, rdv, notifs, resultatsLabo, soins, loading,
      addPatient,
      addToFile, updateFileEntry,
      addConsultation, updateConsultation, deleteConsultation, signerConsultation,
      addRdv, updateRdv, removeRdv,
      addNotif, marquerNotifLue, marquerToutesLues,
      addResultatLabo, updateResultatLabo,
      // Test helpers
      resetAppDataForTest,
      rafraichir: chargerDonnees,
      apiFetch,
    }}>
      {children}
    </SharedDataContext.Provider>
  )
}

export function useSharedData() {
  const ctx = useContext(SharedDataContext)
  if (!ctx) throw new Error("useSharedData doit être dans un <SharedDataProvider>")
  return ctx
}