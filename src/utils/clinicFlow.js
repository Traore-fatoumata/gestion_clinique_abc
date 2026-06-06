/** Patient encore en attente à l'accueil (secrétaire / chef) — pas encore orienté */
export function estEnAttenteAccueil(entree, consultations = []) {
  if (!entree || entree.statut === "termine" || entree.typeVisite === "rendez_vous") return false
  const medId = entree.docteurId ?? entree.medecin_id
  if (medId != null && Number(medId) > 0) return false
  const todayStr = new Date().toISOString().slice(0, 10)
  const dejaTrie = (consultations || []).some(
    c => Number(c.patientId) === Number(entree.patientId)
      && (c.date?.slice(0, 10) || c.date) === todayStr
      && !c.signe
  )
  if (dejaTrie) return false
  return true
}

/** Consultation visible dans « Mes consultations » du médecin chef */
export function consultationPourMedecin(c, file, medecinId, todayStr) {
  // Si la consultation n'est pas assignée à ce médecin, elle n'est pas visible
  if (Number(c.docteurId) !== Number(medecinId)) return false
  
  // Si la consultation est signée, elle est toujours visible pour le médecin qui l'a signée
  if (c.signe === true) return true
  
  // Pour les consultations non signées, vérifier si le patient a été réassigné à un autre médecin
  const f = (file || []).find(x =>
    Number(x.patientId) === Number(c.patientId)
    && (x.dateEntree?.slice?.(0, 10) || x.dateEntree) === todayStr
  )
  
  // Si le patient a été réassigné à un autre médecin dans la file, la consultation n'est plus visible
  if (f && Number(f.docteurId) > 0 && Number(f.docteurId) !== Number(medecinId)) return false
  
  return true
}

/** Recettes du jour = paiements consultation + examens réellement encaissés */
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
    antecedents:           data.antecedents,
    poids:                 data.poids,
    diagPresomption:       data.diagPresomption,
    symptomes:             data.symptomes,
    observations:          data.observations,
    commentaires:          data.commentaires,
    pathologies:           data.pathologies,
    donneesPrenatal:       data.donneesPrenatal,
    donneesAccouchement:   data.donneesAccouchement,
    examensCommandes:      data.examensCommandes,
    montantConsultation:   data.montantConsultation,
    diagDefinitif:         data.diagDefinitif,
  }
}
