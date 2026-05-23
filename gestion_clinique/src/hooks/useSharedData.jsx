/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useState, useCallback } from 'react'

const SharedDataContext = createContext()

// ── Helpers ──────────────────────────────────────────────
function genId(seed) {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ0123456789"
  let result = "ABC-", n = seed * 48271 + 1000003
  for (let i = 0; i < 6; i++) { n = (n*1664525+1013904223)&0x7fffffff; result+=chars[n%chars.length] }
  return result
}
const today = () => new Date().toISOString().slice(0,10)

// ── Données initiales partagées ──────────────────────────
const INIT_PATIENTS = [
  { id:1,  pid:genId(1),  nom:"Bah Mariama",          dateNaissance:"1990-03-12", sexe:"F", telephone:"+224 622 11 22 33", quartier:"Ratoma",   secteur:"Lansanayah", profession:"Commerçante",   responsable:"Mamadou Bah"     },
  { id:2,  pid:genId(2),  nom:"Diallo Ibrahima",      dateNaissance:"1972-07-04", sexe:"M", telephone:"+224 628 44 55 66", quartier:"Kaloum",   secteur:"Boulbinet",  profession:"Enseignant",    responsable:"Lui-même"        },
  { id:3,  pid:genId(3),  nom:"Sow Fatoumata",        dateNaissance:"1996-11-20", sexe:"F", telephone:"+224 621 77 88 99", quartier:"Dixinn",   secteur:"Yimbayah",   profession:"Étudiante",     responsable:"Mamadou Sow"     },
  { id:4,  pid:genId(4),  nom:"Kouyaté Mamadou",      dateNaissance:"1963-01-15", sexe:"M", telephone:"+224 624 33 44 55", quartier:"Matam",    secteur:"Tannerie",   profession:"Commerçant",    responsable:"Lui-même"        },
  { id:5,  pid:genId(5),  nom:"Baldé Aissatou",       dateNaissance:"2018-06-08", sexe:"F", telephone:"+224 625 66 77 88", quartier:"Matoto",   secteur:"Gbessia",    profession:"Élève",         responsable:"Mamadou Baldé"   },
  { id:6,  pid:genId(6),  nom:"Touré Aminata",        dateNaissance:"1994-08-22", sexe:"F", telephone:"+224 620 12 34 56", quartier:"Coyah",    secteur:"Centre",     profession:"Enseignante",   responsable:"Ibrahima Touré"  },
  { id:7,  pid:genId(7),  nom:"Camara Oumou",         dateNaissance:"1991-01-10", sexe:"F", telephone:"+224 623 98 76 54", quartier:"Matam",    secteur:"Tannerie",   profession:"Commerçante",   responsable:"Sékou Camara"    },
  // Cardiologie
  { id:8,  pid:genId(8),  nom:"Konaté Alpha",         dateNaissance:"1958-09-22", sexe:"M", telephone:"+224 621 10 20 30", quartier:"Kaloum",   secteur:"Tombo",      profession:"Retraité",      responsable:"Lui-même"        },
  // Diabétologie
  { id:9,  pid:genId(9),  nom:"Sylla Boubacar",       dateNaissance:"1965-04-15", sexe:"M", telephone:"+224 622 40 50 60", quartier:"Matam",    secteur:"Tannerie",   profession:"Commerçant",    responsable:"Lui-même"        },
  { id:10, pid:genId(10), nom:"Barry Hawa",           dateNaissance:"1952-12-03", sexe:"F", telephone:"+224 628 70 80 90", quartier:"Dixinn",   secteur:"Landréah",   profession:"Retraitée",     responsable:"Sékou Barry"     },
  // Pédiatrie
  { id:11, pid:genId(11), nom:"Diallo Mamadou (enf)", dateNaissance:"2019-07-18", sexe:"M", telephone:"+224 625 11 22 44", quartier:"Ratoma",   secteur:"Koloma",     profession:"Élève",         responsable:"Oumar Diallo"    },
  { id:12, pid:genId(12), nom:"Bah Fatoumata (enf)",  dateNaissance:"2015-02-25", sexe:"F", telephone:"+224 624 55 66 77", quartier:"Matoto",   secteur:"Gbessia",    profession:"Élève",         responsable:"Ibrahima Bah"    },
  // Ophtalmologie
  { id:13, pid:genId(13), nom:"Traoré Ousmane",       dateNaissance:"1948-11-10", sexe:"M", telephone:"+224 620 33 44 55", quartier:"Kaloum",   secteur:"Boulbinet",  profession:"Retraité",      responsable:"Lui-même"        },
  { id:14, pid:genId(14), nom:"Baldé Mariama",        dateNaissance:"1971-06-30", sexe:"F", telephone:"+224 623 22 33 44", quartier:"Coyah",    secteur:"Centre",     profession:"Fonctionnaire", responsable:"Lui-même"        },
  // Traumatologie
  { id:15, pid:genId(15), nom:"Camara Souleymane",    dateNaissance:"1988-03-08", sexe:"M", telephone:"+224 622 88 99 00", quartier:"Matam",    secteur:"Tannerie",   profession:"Ouvrier",       responsable:"Lui-même"        },
  { id:16, pid:genId(16), nom:"Kouyaté Aissatou",     dateNaissance:"1979-09-14", sexe:"F", telephone:"+224 621 66 77 88", quartier:"Ratoma",   secteur:"Kaporo",     profession:"Commerçante",   responsable:"Mamadou Kouyaté" },
  // Neurologie
  { id:17, pid:genId(17), nom:"Diallo Oumar",         dateNaissance:"1955-01-20", sexe:"M", telephone:"+224 628 55 44 33", quartier:"Kaloum",   secteur:"Almamya",    profession:"Retraité",      responsable:"Lui-même"        },
  { id:18, pid:genId(18), nom:"Sow Kadiatou",         dateNaissance:"1973-08-05", sexe:"F", telephone:"+224 624 11 00 99", quartier:"Dixinn",   secteur:"Yimbayah",   profession:"Enseignante",   responsable:"Ibrahima Sow"    },
  // ORL
  { id:19, pid:genId(19), nom:"Bah Aminata",          dateNaissance:"1982-05-17", sexe:"F", telephone:"+224 625 44 33 22", quartier:"Ratoma",   secteur:"Hamdallaye", profession:"Infirmière",    responsable:"Lui-même"        },
  { id:20, pid:genId(20), nom:"Condé Moussa",         dateNaissance:"1990-10-28", sexe:"M", telephone:"+224 620 77 66 55", quartier:"Matoto",   secteur:"Kobaya",     profession:"Chauffeur",     responsable:"Lui-même"        },
  // Urologie
  { id:21, pid:genId(21), nom:"Kourouma Mamadou",     dateNaissance:"1960-07-12", sexe:"M", telephone:"+224 622 99 88 77", quartier:"Kaloum",   secteur:"Boulbinet",  profession:"Commerçant",    responsable:"Lui-même"        },
  { id:22, pid:genId(22), nom:"Touré Ibrahima",       dateNaissance:"1945-03-30", sexe:"M", telephone:"+224 623 44 55 66", quartier:"Matam",    secteur:"Tannerie",   profession:"Retraité",      responsable:"Sékou Touré"     },
  // Chirurgie
  { id:23, pid:genId(23), nom:"Sylla Mariam",         dateNaissance:"1975-11-22", sexe:"F", telephone:"+224 621 33 22 11", quartier:"Dixinn",   secteur:"Landréah",   profession:"Commerçante",   responsable:"Lui-même"        },
  { id:24, pid:genId(24), nom:"Diallo Kadiatou",      dateNaissance:"1993-04-08", sexe:"F", telephone:"+224 628 22 11 00", quartier:"Ratoma",   secteur:"Koloma",     profession:"Étudiante",     responsable:"Mamadou Diallo"  },
  // Dermatologie
  { id:25, pid:genId(25), nom:"Camara Ibrahima",      dateNaissance:"1985-02-14", sexe:"M", telephone:"+224 624 10 20 30", quartier:"Ratoma",   secteur:"Hamdallaye", profession:"Technicien",    responsable:"Lui-même"        },
  { id:26, pid:genId(26), nom:"Diallo Hawa",          dateNaissance:"2001-09-05", sexe:"F", telephone:"+224 625 30 40 50", quartier:"Dixinn",   secteur:"Yimbayah",   profession:"Étudiante",     responsable:"Mamadou Diallo"  },
  // Oncologie
  { id:27, pid:genId(27), nom:"Kouyaté Sékou",        dateNaissance:"1953-06-20", sexe:"M", telephone:"+224 622 50 60 70", quartier:"Kaloum",   secteur:"Almamya",    profession:"Retraité",      responsable:"Lui-même"        },
  { id:28, pid:genId(28), nom:"Barry Mariam",         dateNaissance:"1968-11-08", sexe:"F", telephone:"+224 621 80 90 01", quartier:"Matam",    secteur:"Tannerie",   profession:"Commerçante",   responsable:"Alpha Barry"     },
  // Maladies infectieuses
  { id:29, pid:genId(29), nom:"Bah Oumar",            dateNaissance:"1990-04-17", sexe:"M", telephone:"+224 628 20 30 40", quartier:"Matoto",   secteur:"Kobaya",     profession:"Ouvrier",       responsable:"Lui-même"        },
  { id:30, pid:genId(30), nom:"Sow Aminata",          dateNaissance:"2010-07-22", sexe:"F", telephone:"+224 623 60 70 80", quartier:"Coyah",    secteur:"Centre",     profession:"Élève",         responsable:"Mamadou Sow"     },
  // Stomatologie
  { id:31, pid:genId(31), nom:"Condé Fatoumata",      dateNaissance:"1978-03-30", sexe:"F", telephone:"+224 620 90 00 11", quartier:"Ratoma",   secteur:"Koloma",     profession:"Enseignante",   responsable:"Lui-même"        },
  { id:32, pid:genId(32), nom:"Traoré Mamadou",       dateNaissance:"1944-12-12", sexe:"M", telephone:"+224 622 11 33 55", quartier:"Kaloum",   secteur:"Boulbinet",  profession:"Retraité",      responsable:"Sékou Traoré"    },
]

const INIT_FILE = [
  // ── Médecin Chef / Médecine générale (id:1) ──
  { id:1,  patientId:1,  pid:genId(1),  nom:"Bah Mariama",          arrivee:"08:00", typeVisite:"consultation", statut:"en_attente", montantConsultation:50000, paiementConsultation:null, service:"Médecine générale",             docteurId:1,  motif:"Fièvre, céphalées"                            },
  // ── Cardiologie (id:2) ──
  { id:2,  patientId:2,  pid:genId(2),  nom:"Diallo Ibrahima",      arrivee:"08:15", typeVisite:"rendez_vous",  statut:"en_attente", montantConsultation:50000, paiementConsultation:null, service:"Cardiologie",                   docteurId:2,  motif:"Suivi tension artérielle"                     },
  { id:3,  patientId:8,  pid:genId(8),  nom:"Konaté Alpha",         arrivee:"09:30", typeVisite:"consultation", statut:"en_attente", montantConsultation:40000, paiementConsultation:null, service:"Cardiologie",                   docteurId:2,  motif:"Douleur thoracique, essoufflement"             },
  // ── Diabétologie (id:3) ──
  { id:4,  patientId:9,  pid:genId(9),  nom:"Sylla Boubacar",       arrivee:"08:30", typeVisite:"rendez_vous",  statut:"en_attente", montantConsultation:50000, paiementConsultation:null, service:"Diabétologie / Endocrinologie",  docteurId:3,  motif:"Suivi diabète type 2"                          },
  { id:5,  patientId:10, pid:genId(10), nom:"Barry Hawa",           arrivee:"10:00", typeVisite:"consultation", statut:"en_salle",   montantConsultation:40000, paiementConsultation:null, service:"Diabétologie / Endocrinologie",  docteurId:3,  motif:"Bilan glycémique, contrôle HbA1c"              },
  // ── Pédiatrie (id:4) ──
  { id:6,  patientId:11, pid:genId(11), nom:"Diallo Mamadou (enf)", arrivee:"08:45", typeVisite:"consultation", statut:"en_attente", montantConsultation:35000, paiementConsultation:null, service:"Pédiatrie",                     docteurId:4,  motif:"Fièvre persistante, toux"                     },
  { id:7,  patientId:12, pid:genId(12), nom:"Bah Fatoumata (enf)",  arrivee:"09:15", typeVisite:"rendez_vous",  statut:"en_attente", montantConsultation:35000, paiementConsultation:null, service:"Pédiatrie",                     docteurId:4,  motif:"Retard de croissance, suivi"                  },
  // ── Gynécologie (id:5) ──
  { id:8,  patientId:3,  pid:genId(3),  nom:"Sow Fatoumata",        arrivee:"09:00", typeVisite:"consultation", statut:"en_salle",   montantConsultation:50000, paiementConsultation:null, service:"Gynécologie",                   docteurId:5,  motif:"Douleur pelvienne"                            },
  { id:9,  patientId:6,  pid:genId(6),  nom:"Touré Aminata",        arrivee:"10:30", typeVisite:"rendez_vous",  statut:"en_attente", montantConsultation:50000, paiementConsultation:null, service:"Gynécologie",                   docteurId:5,  motif:"CPN 3e trimestre"                             },
  { id:10, patientId:7,  pid:genId(7),  nom:"Camara Oumou",         arrivee:"11:00", typeVisite:"consultation", statut:"en_salle",   montantConsultation:50000, paiementConsultation:null, service:"Gynécologie",                   docteurId:5,  motif:"Travail obstétrical"                          },
  // ── Ophtalmologie (id:6) ──
  { id:11, patientId:13, pid:genId(13), nom:"Traoré Ousmane",       arrivee:"09:00", typeVisite:"rendez_vous",  statut:"en_attente", montantConsultation:40000, paiementConsultation:null, service:"Ophtalmologie",                 docteurId:6,  motif:"Baisse de vision progressive"                 },
  { id:12, patientId:14, pid:genId(14), nom:"Baldé Mariama",        arrivee:"10:15", typeVisite:"consultation", statut:"en_attente", montantConsultation:50000, paiementConsultation:null, service:"Ophtalmologie",                 docteurId:6,  motif:"Contrôle annuel, légère myopie"               },
  // ── Traumatologie (id:7) ──
  { id:13, patientId:15, pid:genId(15), nom:"Camara Souleymane",    arrivee:"08:00", typeVisite:"urgence",      statut:"en_salle",   montantConsultation:50000, paiementConsultation:null, service:"Traumatologie",                 docteurId:7,  motif:"Fracture tibia droit suite chute"             },
  { id:14, patientId:16, pid:genId(16), nom:"Kouyaté Aissatou",     arrivee:"09:45", typeVisite:"consultation", statut:"en_attente", montantConsultation:50000, paiementConsultation:null, service:"Traumatologie",                 docteurId:7,  motif:"Entorse genou gauche, douleur"                },
  // ── Neurologie (id:8) ──
  { id:15, patientId:17, pid:genId(17), nom:"Diallo Oumar",         arrivee:"08:30", typeVisite:"rendez_vous",  statut:"en_attente", montantConsultation:40000, paiementConsultation:null, service:"Neurologie",                    docteurId:8,  motif:"Céphalées chroniques, vertiges"               },
  { id:16, patientId:18, pid:genId(18), nom:"Sow Kadiatou",         arrivee:"10:00", typeVisite:"consultation", statut:"en_attente", montantConsultation:50000, paiementConsultation:null, service:"Neurologie",                    docteurId:8,  motif:"Engourdissements membres, bilan"              },
  // ── ORL (id:9) ──
  { id:17, patientId:19, pid:genId(19), nom:"Bah Aminata",          arrivee:"09:00", typeVisite:"rendez_vous",  statut:"en_attente", montantConsultation:50000, paiementConsultation:null, service:"ORL",                           docteurId:9,  motif:"Otite chronique récidivante"                  },
  { id:18, patientId:20, pid:genId(20), nom:"Condé Moussa",         arrivee:"10:30", typeVisite:"consultation", statut:"en_salle",   montantConsultation:50000, paiementConsultation:null, service:"ORL",                           docteurId:9,  motif:"Rhinite allergique, congestion"               },
  // ── Urologie (id:10) ──
  { id:19, patientId:21, pid:genId(21), nom:"Kourouma Mamadou",     arrivee:"08:45", typeVisite:"consultation", statut:"en_attente", montantConsultation:40000, paiementConsultation:null, service:"Urologie",                      docteurId:10, motif:"Douleur lombaire, calcul rénal"               },
  { id:20, patientId:22, pid:genId(22), nom:"Touré Ibrahima",       arrivee:"10:00", typeVisite:"rendez_vous",  statut:"en_attente", montantConsultation:40000, paiementConsultation:null, service:"Urologie",                      docteurId:10, motif:"Infection urinaire récidivante"               },
  // ── Chirurgie (id:11) ──
  { id:21, patientId:23, pid:genId(23), nom:"Sylla Mariam",         arrivee:"08:15", typeVisite:"rendez_vous",  statut:"en_attente", montantConsultation:50000, paiementConsultation:null, service:"Chirurgie",                     docteurId:11, motif:"Hernie inguinale, consultation pré-op"        },
  { id:22, patientId:24, pid:genId(24), nom:"Diallo Kadiatou",      arrivee:"09:30", typeVisite:"urgence",      statut:"en_salle",   montantConsultation:50000, paiementConsultation:null, service:"Chirurgie",                     docteurId:11, motif:"Douleur abdominale aiguë, suspicion appendicite"},
  // ── Dermatologie (id:14) ──
  { id:23, patientId:25, pid:genId(25), nom:"Camara Ibrahima",      arrivee:"09:00", typeVisite:"consultation", statut:"en_attente", montantConsultation:50000, paiementConsultation:null, service:"Dermatologie",                  docteurId:14, motif:"Éruption cutanée, démangeaisons"              },
  { id:24, patientId:26, pid:genId(26), nom:"Diallo Hawa",          arrivee:"10:15", typeVisite:"rendez_vous",  statut:"en_attente", montantConsultation:50000, paiementConsultation:null, service:"Dermatologie",                  docteurId:14, motif:"Acné sévère, suivi traitement"                },
  // ── Oncologie (id:15) ──
  { id:25, patientId:27, pid:genId(27), nom:"Kouyaté Sékou",        arrivee:"08:30", typeVisite:"rendez_vous",  statut:"en_attente", montantConsultation:40000, paiementConsultation:null, service:"Oncologie",                     docteurId:15, motif:"Suivi traitement chimiothérapie"               },
  { id:26, patientId:28, pid:genId(28), nom:"Barry Mariam",         arrivee:"09:45", typeVisite:"consultation", statut:"en_attente", montantConsultation:50000, paiementConsultation:null, service:"Oncologie",                     docteurId:15, motif:"Bilan nodule mammaire"                         },
  // ── Maladies infectieuses (id:16) ──
  { id:27, patientId:29, pid:genId(29), nom:"Bah Oumar",            arrivee:"08:00", typeVisite:"consultation", statut:"en_attente", montantConsultation:50000, paiementConsultation:null, service:"Maladies infectieuses",          docteurId:16, motif:"Fièvre persistante, bilan paludisme"           },
  { id:28, patientId:30, pid:genId(30), nom:"Sow Aminata",          arrivee:"09:30", typeVisite:"rendez_vous",  statut:"en_attente", montantConsultation:35000, paiementConsultation:null, service:"Maladies infectieuses",          docteurId:16, motif:"Suivi VIH, bilan CD4"                         },
  // ── Stomatologie (id:17) ──
  { id:29, patientId:31, pid:genId(31), nom:"Condé Fatoumata",      arrivee:"08:45", typeVisite:"consultation", statut:"en_attente", montantConsultation:50000, paiementConsultation:null, service:"Stomatologie",                  docteurId:17, motif:"Douleur dentaire, caries multiples"           },
  { id:30, patientId:32, pid:genId(32), nom:"Traoré Mamadou",       arrivee:"10:00", typeVisite:"rendez_vous",  statut:"en_attente", montantConsultation:40000, paiementConsultation:null, service:"Stomatologie",                  docteurId:17, motif:"Prothèse dentaire, consultation"              },
]

const INIT_CONSULTATIONS = [
  { id:1, patientId:1, date:"2026-03-15", motif:"Fièvre persistante",  service:"Cardiologie",                   docteurId:2, observations:"TA 13/8", symptomes:"Fièvre, fatigue", diagnostics:["Infection virale"], pathologies:["Anémie"], examens:["NFS"], traitements:["Paracétamol 500mg"], commentaires:"Repos 3 jours", signe:true, signeLe:"15/03/2026 10:30", typeConsultation:"standard" },
  { id:2, patientId:2, date:"2026-03-28", motif:"Suivi cardiologie",   service:"Cardiologie",                   docteurId:2, observations:"Tension stable 12/8", symptomes:"Palpitations", diagnostics:["HTA stable"], pathologies:["HTA"], examens:["ECG"], traitements:["Amlodipine 5mg"], commentaires:"Contrôle dans 1 mois", signe:true, signeLe:"28/03/2026 11:00", typeConsultation:"standard" },
  { id:3, patientId:3, date:today(),      motif:"Douleur thoracique",  service:"Cardiologie",                   docteurId:2, observations:"", symptomes:"", diagnostics:[], pathologies:[], examens:[], traitements:[], commentaires:"", signe:false, signeLe:null, typeConsultation:"standard" },
  { id:4, patientId:6, date:"2026-02-01", motif:"CPN 2e trimestre",    service:"Gynécologie",                   docteurId:5, observations:"Échographie normale", symptomes:"—", diagnostics:["Grossesse évolutive"], pathologies:[], examens:["Échographie"], traitements:["Acide folique"], commentaires:"", signe:true, signeLe:"01/02/2026 14:00", typeConsultation:"prenatal" },
  { id:5, patientId:1, date:"2025-11-10", motif:"Migraine, fatigue",   service:"Médecine générale",             docteurId:1, observations:"Repos", symptomes:"Céphalée", diagnostics:["Migraine"], pathologies:[], examens:[], traitements:["Antalgique"], commentaires:"", signe:true, signeLe:"10/11/2025 09:00", typeConsultation:"standard" },
]

const INIT_RDV = [
  { id:1, patientId:3, patient:"Sow Fatoumata",   docteurId:5,  date:"2026-04-05", heure:"09:00", service:"Gynécologie",   docteur:"Dr. Keïta",  motif:"CPN - 7ème mois",  rappelEnvoye:false },
  { id:2, patientId:1, patient:"Bah Mariama",     docteurId:2,  date:"2026-04-05", heure:"10:00", service:"Cardiologie",   docteur:"Dr. Camara", motif:"Suivi tension",     rappelEnvoye:true  },
  { id:3, patientId:5, patient:"Baldé Aissatou",  docteurId:6,  date:"2026-04-07", heure:"08:30", service:"Ophtalmologie", docteur:"Dr. Bah",    motif:"Contrôle vue",      rappelEnvoye:false },
]

const INIT_RESULTATS_LABO = []
const INIT_SOINS = []
const INIT_NOTIFS = []

function load(key, fallback) {
  try { const v = localStorage.getItem(key); return v ? JSON.parse(v) : fallback }
  catch { return fallback }
}
function save(key, val) {
  try { localStorage.setItem(key, JSON.stringify(val)) } catch { /* ignore */ }
}

export function useSharedData() {
  const ctx = useContext(SharedDataContext)
  if (!ctx) throw new Error('useSharedData must be used within SharedDataProvider')
  return ctx
}

export function SharedDataProvider({ children }) {
  const [patients,       setPatients]      = useState(() => load('sd_patients_v3',       INIT_PATIENTS))
  const [file,           setFile]          = useState(() => load('sd_file_v3',           INIT_FILE))
  const [consultations,  setConsultations] = useState(() => load('sd_consultations_v1',  INIT_CONSULTATIONS))
  const [rdv,            setRdv]           = useState(() => load('sd_rdv_v2',            INIT_RDV))
  const [resultatsLabo,  setResultatsLabo] = useState(() => load('sd_resultats_labo_v1', INIT_RESULTATS_LABO))
  const [soins,          setSoins]         = useState(() => load('sd_soins_v1',          INIT_SOINS))
  const [notifs,         setNotifs]        = useState(() => load('sd_notifs_v1',         INIT_NOTIFS))

  // ── Patients ──────────────────────────────────────────
  const addPatient = useCallback((p) => {
    setPatients(prev => {
      const next = [...prev, { ...p, id: Date.now(), pid: genId(Date.now()) }]
      save('sd_patients_v3', next); return next
    })
  }, [])
  const updatePatient = useCallback((id, data) => {
    setPatients(prev => { const next = prev.map(p => p.id===id ? {...p,...data} : p); save('sd_patients_v3', next); return next })
  }, [])

  // ── File d'attente ─────────────────────────────────────
  const addToFile = useCallback((entry) => {
    setFile(prev => {
      const next = [...prev, { ...entry, id: Date.now() }]
      save('sd_file_v3', next); return next
    })
  }, [])
  const updateFileEntry = useCallback((id, data) => {
    setFile(prev => { const next = prev.map(f => f.id===id ? {...f,...data} : f); save('sd_file_v3', next); return next })
  }, [])
  const removeFromFile = useCallback((id) => {
    setFile(prev => { const next = prev.filter(f => f.id!==id); save('sd_file_v3', next); return next })
  }, [])

  // ── Consultations ─────────────────────────────────────
  const addConsultation = useCallback((c) => {
    setConsultations(prev => {
      const next = [...prev, { ...c, id: Date.now() }]
      save('sd_consultations_v1', next); return next
    })
  }, [])
  const updateConsultation = useCallback((id, data) => {
    setConsultations(prev => { const next = prev.map(c => c.id===id ? {...c,...data} : c); save('sd_consultations_v1', next); return next })
  }, [])

  // ── RDV ───────────────────────────────────────────────
  const addRdv = useCallback((r) => {
    setRdv(prev => { const next = [...prev, { ...r, id: Date.now() }]; save('sd_rdv_v2', next); return next })
  }, [])
  const updateRdv = useCallback((id, data) => {
    setRdv(prev => { const next = prev.map(r => r.id===id ? {...r,...data} : r); save('sd_rdv_v2', next); return next })
  }, [])
  const removeRdv = useCallback((id) => {
    setRdv(prev => { const next = prev.filter(r => r.id!==id); save('sd_rdv_v2', next); return next })
  }, [])

  // ── Résultats labo ────────────────────────────────────
  const addResultatLabo = useCallback((r) => {
    setResultatsLabo(prev => { const next = [...prev, { ...r, id: Date.now() }]; save('sd_resultats_labo_v1', next); return next })
  }, [])
  const updateResultatLabo = useCallback((id, data) => {
    setResultatsLabo(prev => { const next = prev.map(r => r.id===id ? {...r,...data} : r); save('sd_resultats_labo_v1', next); return next })
  }, [])

  // ── Soins infirmiers ──────────────────────────────────
  const addSoin = useCallback((s) => {
    setSoins(prev => { const next = [...prev, { ...s, id: Date.now() }]; save('sd_soins_v1', next); return next })
  }, [])
  const updateSoin = useCallback((id, data) => {
    setSoins(prev => { const next = prev.map(s => s.id===id ? {...s,...data} : s); save('sd_soins_v1', next); return next })
  }, [])

  // ── Notifications médecins ────────────────────────────
  // { id, docteurId, patientNom, motif, heure, date, lu }
  const addNotif = useCallback((n) => {
    setNotifs(prev => {
      const next = [...prev, { ...n, id: Date.now(), lu: false,
        date: new Date().toISOString().slice(0,10),
        heure: new Date().toLocaleTimeString('fr-FR', { hour:'2-digit', minute:'2-digit' })
      }]
      save('sd_notifs_v1', next); return next
    })
  }, [])
  const marquerNotifLue = useCallback((id) => {
    setNotifs(prev => { const next = prev.map(n => n.id===id ? {...n, lu:true} : n); save('sd_notifs_v1', next); return next })
  }, [])
  const marquerToutesLues = useCallback((docteurId) => {
    setNotifs(prev => { const next = prev.map(n => n.docteurId===docteurId ? {...n, lu:true} : n); save('sd_notifs_v1', next); return next })
  }, [])

  return (
    <SharedDataContext.Provider value={{
      patients, addPatient, updatePatient,
      file, addToFile, updateFileEntry, removeFromFile,
      consultations, addConsultation, updateConsultation,
      rdv, addRdv, updateRdv, removeRdv,
      resultatsLabo, addResultatLabo, updateResultatLabo,
      soins, addSoin, updateSoin,
      notifs, addNotif, marquerNotifLue, marquerToutesLues,
    }}>
      {children}
    </SharedDataContext.Provider>
  )
}
