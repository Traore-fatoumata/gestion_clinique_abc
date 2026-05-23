-- ═══════════════════════════════════════════════════════
--  CLINIQUE ABC MAROUANE — Schéma PostgreSQL complet
-- ═══════════════════════════════════════════════════════

-- Extension pour UUID
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ── RÔLES DISPONIBLES ───────────────────────────────────
-- secretaire | medecin_chef | medecin | comptable | labo | infirmier

-- ── UTILISATEURS / COMPTES ──────────────────────────────
CREATE TABLE IF NOT EXISTS utilisateurs (
  id            SERIAL PRIMARY KEY,
  email         VARCHAR(150) UNIQUE NOT NULL,
  mot_de_passe  TEXT NOT NULL,                      -- bcrypt hash
  nom           VARCHAR(120) NOT NULL,
  role          VARCHAR(40)  NOT NULL,               -- voir rôles ci-dessus
  specialite    VARCHAR(120),                        -- pour médecins
  titre         VARCHAR(80),
  actif         BOOLEAN DEFAULT TRUE,
  created_at    TIMESTAMPTZ DEFAULT NOW(),
  updated_at    TIMESTAMPTZ DEFAULT NOW()
);

-- ── PATIENTS ────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS patients (
  id              SERIAL PRIMARY KEY,
  pid             VARCHAR(20) UNIQUE NOT NULL,       -- ex: P-123456
  nom             VARCHAR(120) NOT NULL,
  date_naissance  DATE,
  sexe            CHAR(1) CHECK (sexe IN ('M','F')),
  telephone       VARCHAR(30),
  quartier        VARCHAR(100),
  secteur         VARCHAR(100),
  profession      VARCHAR(100),
  responsable     VARCHAR(120),
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW()
);

-- ── FILE D'ATTENTE ──────────────────────────────────────
CREATE TABLE IF NOT EXISTS file_attente (
  id                      SERIAL PRIMARY KEY,
  patient_id              INT NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
  medecin_id              INT REFERENCES utilisateurs(id),
  type_visite             VARCHAR(20) DEFAULT 'consultation' CHECK (type_visite IN ('consultation','rendez_vous')),
  statut                  VARCHAR(20) DEFAULT 'en_attente'  CHECK (statut IN ('en_attente','en_cours','termine')),
  motif                   TEXT,
  service                 VARCHAR(100),
  arrivee                 TIME,
  date_entree             DATE DEFAULT CURRENT_DATE,
  montant_consultation    INT DEFAULT 0,
  type_consultation       VARCHAR(40) DEFAULT 'standard',
  rdv_id                  INT,                               -- référence au RDV si applicable
  created_at              TIMESTAMPTZ DEFAULT NOW(),
  updated_at              TIMESTAMPTZ DEFAULT NOW()
);

-- ── PAIEMENTS CONSULTATION ──────────────────────────────
CREATE TABLE IF NOT EXISTS paiements_consultation (
  id              SERIAL PRIMARY KEY,
  file_id         INT NOT NULL REFERENCES file_attente(id) ON DELETE CASCADE,
  patient_id      INT NOT NULL REFERENCES patients(id),
  statut          VARCHAR(20) DEFAULT 'en_attente' CHECK (statut IN ('paye','en_attente')),
  montant         INT NOT NULL DEFAULT 0,
  methode         VARCHAR(30) DEFAULT 'cash' CHECK (methode IN ('cash','orange_money','wave','virement')),
  note            TEXT,
  date_paiement   DATE,
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

-- ── CONSULTATIONS ───────────────────────────────────────
CREATE TABLE IF NOT EXISTS consultations (
  id              SERIAL PRIMARY KEY,
  patient_id      INT NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
  medecin_id      INT NOT NULL REFERENCES utilisateurs(id),
  date_consult    DATE DEFAULT CURRENT_DATE,
  service         VARCHAR(100),
  motif           TEXT,
  plaintes        TEXT,
  diagnostics     TEXT[],                            -- tableau de diagnostics
  traitements     TEXT[],
  frais_examens   INT DEFAULT 0,
  type_consultation VARCHAR(40) DEFAULT 'standard',
  signe           BOOLEAN DEFAULT FALSE,
  signe_le        TIMESTAMPTZ,
  signe_par       VARCHAR(120),
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW()
);

-- ── EXAMENS COMMANDÉS ───────────────────────────────────
CREATE TABLE IF NOT EXISTS examens_commandes (
  id              SERIAL PRIMARY KEY,
  consultation_id INT REFERENCES consultations(id) ON DELETE CASCADE,
  file_id         INT REFERENCES file_attente(id),
  nom             VARCHAR(150) NOT NULL,
  prix            INT DEFAULT 0,
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

-- ── PAIEMENTS EXAMENS ───────────────────────────────────
CREATE TABLE IF NOT EXISTS paiements_examens (
  id              SERIAL PRIMARY KEY,
  file_id         INT NOT NULL REFERENCES file_attente(id) ON DELETE CASCADE,
  patient_id      INT NOT NULL REFERENCES patients(id),
  montant_total   INT NOT NULL DEFAULT 0,
  montant_paye    INT NOT NULL DEFAULT 0,
  statut          VARCHAR(20) DEFAULT 'en_attente' CHECK (statut IN ('paye','partiel','en_attente')),
  methode         VARCHAR(30) DEFAULT 'cash',
  note            TEXT,
  date_paiement   DATE,
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW()
);

-- ── RENDEZ-VOUS ─────────────────────────────────────────
CREATE TABLE IF NOT EXISTS rendez_vous (
  id              SERIAL PRIMARY KEY,
  patient_id      INT NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
  medecin_id      INT NOT NULL REFERENCES utilisateurs(id),
  date_rdv        DATE NOT NULL,
  heure_rdv       TIME NOT NULL,
  motif           TEXT,
  service         VARCHAR(100),
  rappel_envoye   BOOLEAN DEFAULT FALSE,
  statut          VARCHAR(20) DEFAULT 'planifie' CHECK (statut IN ('planifie','confirme','annule','passe')),
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

-- ── RÉSULTATS LABORATOIRE ───────────────────────────────
CREATE TABLE IF NOT EXISTS demandes_labo (
  id                    SERIAL PRIMARY KEY,
  patient_id            INT NOT NULL REFERENCES patients(id),
  medecin_prescripteur  VARCHAR(120),
  service               VARCHAR(100),
  date_demande          DATE DEFAULT CURRENT_DATE,
  heure_demande         TIME,
  date_prelevement      DATE,
  heure_prelevement     TIME,
  date_rendu            DATE,
  heure_rendu           TIME,
  statut                VARCHAR(20) DEFAULT 'en_attente' CHECK (statut IN ('en_attente','en_cours','termine')),
  urgent                BOOLEAN DEFAULT FALSE,
  commentaire_global    TEXT,
  valide                BOOLEAN DEFAULT FALSE,
  valide_par            VARCHAR(120),
  valide_le             TIMESTAMPTZ,
  created_at            TIMESTAMPTZ DEFAULT NOW(),
  updated_at            TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS examens_labo (
  id              SERIAL PRIMARY KEY,
  demande_id      INT NOT NULL REFERENCES demandes_labo(id) ON DELETE CASCADE,
  nom             VARCHAR(150) NOT NULL,
  prix            INT DEFAULT 0,
  resultat        TEXT,
  unite           VARCHAR(50),
  valeur_normale  VARCHAR(100),
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

-- ── SOINS INFIRMIERS ────────────────────────────────────
CREATE TABLE IF NOT EXISTS soins (
  id                  SERIAL PRIMARY KEY,
  patient_id          INT NOT NULL REFERENCES patients(id),
  infirmier_id        INT REFERENCES utilisateurs(id),
  type_soin           VARCHAR(100) NOT NULL,
  zone                VARCHAR(100),
  medicament          VARCHAR(150),
  dose                VARCHAR(80),
  voie                VARCHAR(60),
  observations        TEXT,
  tolerance           VARCHAR(20) CHECK (tolerance IN ('bonne','moyenne','mauvaise')),
  statut              VARCHAR(20) DEFAULT 'programme' CHECK (statut IN ('programme','en_cours','fait','retarde','annule')),
  urgent              BOOLEAN DEFAULT FALSE,
  date_programmee     DATE,
  heure_programmee    TIME,
  heure_execution     TIME,
  created_at          TIMESTAMPTZ DEFAULT NOW(),
  updated_at          TIMESTAMPTZ DEFAULT NOW()
);

-- ── PRÉSENCE MÉDECINS ───────────────────────────────────
CREATE TABLE IF NOT EXISTS presence (
  id              SERIAL PRIMARY KEY,
  medecin_id      INT NOT NULL REFERENCES utilisateurs(id),
  date_presence   DATE DEFAULT CURRENT_DATE,
  heure_arrivee   TIME,
  heure_depart    TIME,
  present         BOOLEAN DEFAULT FALSE,
  type_absence    VARCHAR(50),                       -- conge, maladie, formation, urgence
  description     TEXT,
  justificatif    VARCHAR(255),
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(medecin_id, date_presence)
);

-- ── NOTIFICATIONS ───────────────────────────────────────
CREATE TABLE IF NOT EXISTS notifications (
  id              SERIAL PRIMARY KEY,
  docteur_id      INT NOT NULL REFERENCES utilisateurs(id),
  titre           VARCHAR(200),
  patient_nom     VARCHAR(120),
  motif           TEXT,
  service         VARCHAR(100),
  lu              BOOLEAN DEFAULT FALSE,
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

-- ── PARAMÈTRES CLINIQUE ─────────────────────────────────
CREATE TABLE IF NOT EXISTS parametres_clinique (
  id              SERIAL PRIMARY KEY,
  cle             VARCHAR(80) UNIQUE NOT NULL,
  valeur          TEXT NOT NULL,
  updated_at      TIMESTAMPTZ DEFAULT NOW()
);

-- Index utiles pour performances
CREATE INDEX IF NOT EXISTS idx_file_date      ON file_attente(date_entree);
CREATE INDEX IF NOT EXISTS idx_file_patient   ON file_attente(patient_id);
CREATE INDEX IF NOT EXISTS idx_consult_date   ON consultations(date_consult);
CREATE INDEX IF NOT EXISTS idx_consult_med    ON consultations(medecin_id);
CREATE INDEX IF NOT EXISTS idx_rdv_date       ON rendez_vous(date_rdv);
CREATE INDEX IF NOT EXISTS idx_rdv_medecin    ON rendez_vous(medecin_id);
CREATE INDEX IF NOT EXISTS idx_notif_docteur  ON notifications(docteur_id);
CREATE INDEX IF NOT EXISTS idx_presence_date  ON presence(date_presence);
