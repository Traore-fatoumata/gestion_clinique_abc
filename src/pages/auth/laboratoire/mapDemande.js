/** Formate une demande API pour le dashboard laboratoire */
export function mapDemandeApi(d) {
  const patient = d.patient && typeof d.patient === "object"
    ? d.patient
    : { id: d.patientId, nom: d.patient || "—", pid: d.pid || "—" }

  return {
    id: d.id,
    patientId: d.patientId ?? patient.id,
    patient,
    dateDemande: d.dateDemande,
    heureDemande: d.heureDemande,
    medecinPrescripteur: d.medecinPrescripteur || "—",
    service: d.service,
    examens: (d.examens || []).map(e => ({
      id: e.id,
      nom: e.nom,
      prix: Number(e.prix) || 0,
      type: e.type,
    })),
    statut: d.statut,
    datePrelevement: d.datePrelevement,
    heurePrelevement: d.heurePrelevement,
    dateRendu: d.dateRendu,
    heureRendu: d.heureRendu,
    resultats: d.resultats || {},
    valide: d.valide,
    validePar: d.validePar,
    valideLe: d.valideLe,
    urgent: d.urgent,
    commentaireGlobal: d.commentaireGlobal,
    tarifsFixes: (d.examens || []).every(e => Number(e.prix) > 0),
  }
}
