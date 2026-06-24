/**
 * Patient encore en attente à l'accueil (secrétaire / chef) — pas encore orienté.
 * Un patient peut revenir dans la file d'attente même s'il a déjà consulté aujourd'hui
 * (par exemple: consulté à 12h pour maux de tête, revient à 17h pour maux de ventre).
 */
export function estEnAttenteAccueil(entree, _consultations) {
  if (entree.statut === "termine") return false
  // Si déjà assigné à un médecin via RDV, ne pas remonter en file générale
  if (entree.docteurId && entree.typeVisite === "rendez_vous") return false
  // Si le patient a été assigné à un médecin spécialiste (docteurId > 0 et statut en_cours),
  // il ne doit plus apparaître dans la file d'attente générale
  if (entree.docteurId && entree.docteurId > 0 && entree.statut === "en_cours") return false
  // On ne vérifie plus si le patient a une consultation signée aujourd'hui
  // Car il peut revenir pour un nouveau motif dans la même journée
  return true
}

/**
 * Consultation visible dans « Mes consultations » du médecin chef.
 * Montre UNIQUEMENT les consultations où le médecin chef est le médecin traitant.
 * - Les consultations non signées (patients encore dans sa file d'attente)
 * - Les consultations signées par le médecin chef (pour historique/ordonnance)
 * Ne montre PAS les consultations des autres médecins même si le patient était dans sa file.
 */
export function consultationPourMedecin(c, file, medecinId, todayStr) {
  // Vérifier que c'est aujourd'hui
  const consultDate = (c.date?.slice?.(0, 10) || c.date)
  if (consultDate !== todayStr) return false

  // Vérifier que la consultation appartient à ce médecin (docteurId correspond)
  if (Number(c.docteurId) !== Number(medecinId)) return false

  // Si la consultation est signée, on l'affiche (le médecin chef peut voir ses consultations signées)
  if (c.signe === true) return true

  // Pour les consultations non signées, vérifier que le patient est encore dans la file d'attente du médecin chef
  const f = (file || []).find(
    x =>
      Number(x.patientId) === Number(c.patientId) &&
      (x.dateEntree?.slice?.(0, 10) || x.dateEntree) === todayStr &&
      x.statut !== "termine"
  )

  // Si le patient n'est plus dans la file (assigné à un autre médecin ou terminé), ne pas montrer
  if (!f) return false

  // Si le patient est assigné à un autre médecin, ne pas montrer
  if (Number(f.docteurId) > 0 && Number(f.docteurId) !== Number(medecinId))
    return false

  return true
}

/**
 * Recettes du jour = paiements consultation + examens réellement encaissés.
 */
export function calcRecettesJour(file, todayStr) {
  return (file || []).reduce((total, f) => {
    if ((f.dateEntree?.slice?.(0, 10) || f.dateEntree) !== todayStr) return total
    let s = total
    if (f.paiementConsultation?.statut === "paye") {
      s += Number(f.paiementConsultation.montant ?? f.montantConsultation ?? 0)
    }
    const exStatut = f.paiementExamens?.statut
    if (exStatut === "paye" || exStatut === "partiel") {
      s += Number(f.paiementExamens?.montantPaye ?? 0)
    }
    return s
  }, 0)
}

export function libelleMotifFile(f, paye) {
  if (f.motif?.trim()) return f.motif.trim()
  if (paye) return "Paiement enregistré — triage à faire"
  return "En attente de paiement"
}

export function libelleServiceFile(f) {
  if (f.service?.trim()) return f.service.trim()
  if (f.docteur?.trim()) return f.docteur.trim()
  return ""
}

export function buildDonneesBrouillon(data) {
  return {
    antecedents:         data.antecedents,
    poids:               data.poids,
    diagPresomption:     data.diagPresomption,
    symptomes:           data.symptomes,
    observations:        data.observations,
    commentaires:        data.commentaires,
    pathologies:         data.pathologies,
    donneesPrenatal:     data.donneesPrenatal,
    donneesAccouchement: data.donneesAccouchement,
    examensCommandes:    data.examensCommandes,
    montantConsultation: data.montantConsultation,
    diagDefinitif:       data.diagDefinitif,
  }
}

/**
 * TOUTES les consultations d'un médecin (sans filtre de date).
 * Utile pour l'historique complet et les consultations en attente de résultats labo.
 */
export function toutesConsultationsPourMedecin(consultations, medecinId) {
  return (consultations || []).filter(c =>
    Number(c.docteurId) === Number(medecinId)
  ).sort((a, b) => {
    // Trier par date décroissante (plus récent en premier)
    const dateA = a.date || ''
    const dateB = b.date || ''
    return dateB.localeCompare(dateA)
  })
}

/**
 * Patients assignés à un médecin (qui ont au moins une consultation en attente ou signée).
 */
export function patientsPourMedecin(consultations, patients, medecinId) {
  const consultsMedecin = toutesConsultationsPourMedecin(consultations, medecinId)
  const patientIds = [...new Set(consultsMedecin.map(c => Number(c.patientId)))]
  return (patients || []).filter(p => patientIds.includes(Number(p.id)))
}
