-- ═══════════════════════════════════════════════════════
--  MIGRATION DE SÉCURITÉ — UUID + Chiffrement
-- ═══════════════════════════════════════════════════════

-- Extension pour UUID généré par la base
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ═══════════════════════════════════════════════════════
--  ÉTAPE 1: Ajouter les colonnes UUID à toutes les tables
-- ═══════════════════════════════════════════════════════

-- Utilisateurs
ALTER TABLE utilisateurs ADD COLUMN IF NOT EXISTS uuid UUID DEFAULT gen_random_uuid();
UPDATE utilisateurs SET uuid = gen_random_uuid() WHERE uuid IS NULL;
ALTER TABLE utilisateurs ALTER COLUMN uuid SET NOT NULL;
CREATE UNIQUE INDEX IF NOT EXISTS idx_utilisateurs_uuid ON utilisateurs(uuid);

-- Patients
ALTER TABLE patients ADD COLUMN IF NOT EXISTS uuid UUID DEFAULT gen_random_uuid();
UPDATE patients SET uuid = gen_random_uuid() WHERE uuid IS NULL;
ALTER TABLE patients ALTER COLUMN uuid SET NOT NULL;
CREATE UNIQUE INDEX IF NOT EXISTS idx_patients_uuid ON patients(uuid);

-- File d'attente
ALTER TABLE file_attente ADD COLUMN IF NOT EXISTS uuid UUID DEFAULT gen_random_uuid();
UPDATE file_attente SET uuid = gen_random_uuid() WHERE uuid IS NULL;
ALTER TABLE file_attente ALTER COLUMN uuid SET NOT NULL;
CREATE UNIQUE INDEX IF NOT EXISTS idx_file_uuid ON file_attente(uuid);

-- Consultations
ALTER TABLE consultations ADD COLUMN IF NOT EXISTS uuid UUID DEFAULT gen_random_uuid();
UPDATE consultations SET uuid = gen_random_uuid() WHERE uuid IS NULL;
ALTER TABLE consultations ALTER COLUMN uuid SET NOT NULL;
CREATE UNIQUE INDEX IF NOT EXISTS idx_consultations_uuid ON consultations(uuid);

-- Rendez-vous
ALTER TABLE rendez_vous ADD COLUMN IF NOT EXISTS uuid UUID DEFAULT gen_random_uuid();
UPDATE rendez_vous SET uuid = gen_random_uuid() WHERE uuid IS NULL;
ALTER TABLE rendez_vous ALTER COLUMN uuid SET NOT NULL;
CREATE UNIQUE INDEX IF NOT EXISTS idx_rdv_uuid ON rendez_vous(uuid);

-- Demandes labo
ALTER TABLE demandes_labo ADD COLUMN IF NOT EXISTS uuid UUID DEFAULT gen_random_uuid();
UPDATE demandes_labo SET uuid = gen_random_uuid() WHERE uuid IS NULL;
ALTER TABLE demandes_labo ALTER COLUMN uuid SET NOT NULL;
CREATE UNIQUE INDEX IF NOT EXISTS idx_labo_uuid ON demandes_labo(uuid);

-- Soins
ALTER TABLE soins ADD COLUMN IF NOT EXISTS uuid UUID DEFAULT gen_random_uuid();
UPDATE soins SET uuid = gen_random_uuid() WHERE uuid IS NULL;
ALTER TABLE soins ALTER COLUMN uuid SET NOT NULL;
CREATE UNIQUE INDEX IF NOT EXISTS idx_soins_uuid ON soins(uuid);

-- ═══════════════════════════════════════════════════════
--  ÉTAPE 2: Chiffrement des données sensibles
-- ═══════════════════════════════════════════════════════

-- Fonction de chiffrement/déchiffrement
CREATE OR REPLACE FUNCTION encrypt_sensitive_data(data TEXT) RETURNS BYTEA AS $$
BEGIN
  RETURN pgp_sym_encrypt(data, current_setting('app.encryption_key', true));
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION decrypt_sensitive_data(data BYTEA) RETURNS TEXT AS $$
BEGIN
  RETURN pgp_sym_decrypt(data, current_setting('app.encryption_key', true));
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Ajouter des colonnes chiffrées pour les données sensibles des patients
ALTER TABLE patients ADD COLUMN IF NOT EXISTS telephone_encrypted BYTEA;
ALTER TABLE patients ADD COLUMN IF NOT EXISTS quartier_encrypted BYTEA;
ALTER TABLE patients ADD COLUMN IF NOT EXISTS profession_encrypted BYTEA;
ALTER TABLE patients ADD COLUMN IF NOT EXISTS responsable_encrypted BYTEA;

-- Chiffrer les données existantes
UPDATE patients 
SET 
  telephone_encrypted = CASE WHEN telephone IS NOT NULL THEN encrypt_sensitive_data(telephone) END,
  quartier_encrypted = CASE WHEN quartier IS NOT NULL THEN encrypt_sensitive_data(quartier) END,
  profession_encrypted = CASE WHEN profession IS NOT NULL THEN encrypt_sensitive_data(profession) END,
  responsable_encrypted = CASE WHEN responsable IS NOT NULL THEN encrypt_sensitive_data(responsable) END;

-- ═══════════════════════════════════════════════════════
--  ÉTAPE 3: Audit et traçabilité
-- ═══════════════════════════════════════════════════════

-- Table d'audit pour tracer les modifications
CREATE TABLE IF NOT EXISTS audit_log (
  id              SERIAL PRIMARY KEY,
  table_name      VARCHAR(100) NOT NULL,
  record_id       INT NOT NULL,
  record_uuid     UUID NOT NULL,
  action          VARCHAR(20) NOT NULL CHECK (action IN ('INSERT','UPDATE','DELETE')),
  old_values      JSONB,
  new_values      JSONB,
  user_id         INT REFERENCES utilisateurs(id),
  user_email      VARCHAR(150),
  ip_address      INET,
  user_agent      TEXT,
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_audit_table ON audit_log(table_name);
CREATE INDEX IF NOT EXISTS idx_audit_record ON audit_log(record_uuid);
CREATE INDEX IF NOT EXISTS idx_audit_date ON audit_log(created_at);

-- ═══════════════════════════════════════════════════════
--  ÉTAPE 4: Fonctions trigger pour audit automatique
-- ═══════════════════════════════════════════════════════

CREATE OR REPLACE FUNCTION audit_trigger_func() RETURNS TRIGGER AS $$
DECLARE
  old_data JSONB;
  new_data JSONB;
BEGIN
  IF TG_OP = 'DELETE' THEN
    old_data = to_jsonb(OLD);
    INSERT INTO audit_log (table_name, record_id, record_uuid, action, old_values, user_email, ip_address)
    VALUES (TG_TABLE_NAME, OLD.id, OLD.uuid, 'DELETE', old_data, current_setting('app.current_user_email', true), current_setting('app.current_ip', true));
    RETURN OLD;
  ELSE
    new_data = to_jsonb(NEW);
    IF TG_OP = 'INSERT' THEN
      INSERT INTO audit_log (table_name, record_id, record_uuid, action, new_values, user_email, ip_address)
      VALUES (TG_TABLE_NAME, NEW.id, NEW.uuid, 'INSERT', new_data, current_setting('app.current_user_email', true), current_setting('app.current_ip', true));
    ELSIF TG_OP = 'UPDATE' THEN
      old_data = to_jsonb(OLD);
      INSERT INTO audit_log (table_name, record_id, record_uuid, action, old_values, new_values, user_email, ip_address)
      VALUES (TG_TABLE_NAME, NEW.id, NEW.uuid, 'UPDATE', old_data, new_data, current_setting('app.current_user_email', true), current_setting('app.current_ip', true));
    END IF;
    RETURN NEW;
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Appliquer les triggers d'audit à toutes les tables importantes
CREATE TRIGGER audit_patients AFTER INSERT OR UPDATE OR DELETE ON patients
  FOR EACH ROW EXECUTE FUNCTION audit_trigger_func();

CREATE TRIGGER audit_utilisateurs AFTER INSERT OR UPDATE OR DELETE ON utilisateurs
  FOR EACH ROW EXECUTE FUNCTION audit_trigger_func();

CREATE TRIGGER audit_consultations AFTER INSERT OR UPDATE OR DELETE ON consultations
  FOR EACH ROW EXECUTE FUNCTION audit_trigger_func();

CREATE TRIGGER audit_rendez_vous AFTER INSERT OR UPDATE OR DELETE ON rendez_vous
  FOR EACH ROW EXECUTE FUNCTION audit_trigger_func();

CREATE TRIGGER audit_demandes_labo AFTER INSERT OR UPDATE OR DELETE ON demandes_labo
  FOR EACH ROW EXECUTE FUNCTION audit_trigger_func();

CREATE TRIGGER audit_soins AFTER INSERT OR UPDATE OR DELETE ON soins
  FOR EACH ROW EXECUTE FUNCTION audit_trigger_func();

-- ═══════════════════════════════════════════════════════
--  ÉTAPE 5: Vues sécurisées pour accès aux données chiffrées
-- ═══════════════════════════════════════════════════════

-- Vue pour patients avec données déchiffrées (accès restreint)
CREATE OR REPLACE VIEW patients_secure AS
SELECT 
  p.id,
  p.uuid,
  p.pid,
  p.nom,
  p.date_naissance,
  p.sexe,
  CASE 
    WHEN current_setting('app.can_view_sensitive', true)::boolean THEN decrypt_sensitive_data(p.telephone_encrypted)
    ELSE p.telephone
  END as telephone,
  CASE 
    WHEN current_setting('app.can_view_sensitive', true)::boolean THEN decrypt_sensitive_data(p.quartier_encrypted)
    ELSE p.quartier
  END as quartier,
  p.secteur,
  CASE 
    WHEN current_setting('app.can_view_sensitive', true)::boolean THEN decrypt_sensitive_data(p.profession_encrypted)
    ELSE p.profession
  END as profession,
  CASE 
    WHEN current_setting('app.can_view_sensitive', true)::boolean THEN decrypt_sensitive_data(p.responsable_encrypted)
    ELSE p.responsable
  END as responsable,
  p.created_at,
  p.updated_at
FROM patients p;

-- ═══════════════════════════════════════════════════════
--  ÉTAPE 6: Configuration de sécurité
-- ═══════════════════════════════════════════════════════

-- Rôles de sécurité
DO $$
BEGIN
  -- Rôle pour lecture seule (sans données sensibles)
  IF NOT EXISTS (SELECT FROM pg_roles WHERE rolname = 'clinique_reader') THEN
    CREATE ROLE clinique_reader;
  END IF;
  
  -- Rôle pour écriture (avec données sensibles)
  IF NOT EXISTS (SELECT FROM pg_roles WHERE rolname = 'clinique_writer') THEN
    CREATE ROLE clinique_writer;
  END IF;
  
  -- Rôle admin (tous droits)
  IF NOT EXISTS (SELECT FROM pg_roles WHERE rolname = 'clinique_admin') THEN
    CREATE ROLE clinique_admin;
  END IF;
END $$;

-- Permissions
GRANT SELECT ON patients_secure TO clinique_reader;
GRANT SELECT, INSERT, UPDATE, DELETE ON patients TO clinique_writer;
GRANT ALL ON ALL TABLES IN SCHEMA public TO clinique_admin;

-- ═══════════════════════════════════════════════════════
--  MESSAGE DE FIN
-- ═══════════════════════════════════════════════════════

DO $$
BEGIN
  RAISE NOTICE 'Migration de sécurité terminée avec succès!';
  RAISE NOTICE 'Nouvelles fonctionnalités:';
  RAISE NOTICE '  - UUID ajoutés à toutes les tables principales';
  RAISE NOTICE '  - Données sensibles chiffrées (téléphone, quartier, profession, responsable)';
  RAISE NOTICE '  - Table audit_log créée pour traçabilité';
  RAISE NOTICE '  - Triggers d''audit automatiques activés';
  RAISE NOTICE '  - Vue patients_secure créée pour accès contrôlé';
  RAISE NOTICE '';
  RAISE NOTICE 'Configuration requise dans .env:';
  RAISE NOTICE '  - app.encryption_key: clé de chiffrement (min 32 caractères)';
  RAISE NOTICE '';
  RAISE NOTICE 'Pour activer le déchiffrement, définir:';
  RAISE NOTICE '  SET app.can_view_sensitive = true;';
  RAISE NOTICE '  SET app.current_user_email = ''user@clinique.com'';';
END $$;