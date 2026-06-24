-- ═══════════════════════════════════════════════════════
--  MIGRATION: MIGRATION DES ANCIENNES DONNÉES PATIENTS
-- ═══════════════════════════════════════════════════════

-- 1. Ajout des colonnes de traçabilité à la table patients
ALTER TABLE patients 
ADD COLUMN IF NOT EXISTS source_donnees VARCHAR(30) DEFAULT 'NOUVEAU_PATIENT' CHECK (source_donnees IN ('PAPIER', 'IMPORT_EXCEL', 'NOUVEAU_PATIENT')),
ADD COLUMN IF NOT EXISTS date_migration TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS migre_par INTEGER REFERENCES utilisateurs(id) ON DELETE SET NULL;

-- 2. Création de la table de journalisation des opérations de migration
CREATE TABLE IF NOT EXISTS migration_logs (
  id              SERIAL PRIMARY KEY,
  type_migration  VARCHAR(30) CHECK (type_migration IN ('PAPIER', 'IMPORT_EXCEL')),
  nombre_importe  INTEGER NOT NULL DEFAULT 0,
  nombre_erreurs  INTEGER NOT NULL DEFAULT 0,
  utilisateur_id  INTEGER REFERENCES utilisateurs(id) ON DELETE SET NULL,
  date_operation  TIMESTAMPTZ DEFAULT NOW(),
  details         TEXT
);

-- Index pour accélérer les jointures ou filtres sur les tables
CREATE INDEX IF NOT EXISTS idx_patients_source_donnees ON patients(source_donnees);
CREATE INDEX IF NOT EXISTS idx_migration_logs_utilisateur ON migration_logs(utilisateur_id);
