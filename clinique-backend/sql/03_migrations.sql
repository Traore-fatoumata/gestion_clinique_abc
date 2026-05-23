-- ═══════════════════════════════════════════════════════
--  MIGRATION — Contraintes uniques manquantes
--  À appliquer après 01_schema.sql
-- ═══════════════════════════════════════════════════════

-- Contrainte unique pour upsert consultations (patient/médecin/jour)
ALTER TABLE consultations
  ADD CONSTRAINT uq_consult_patient_medecin_date
  UNIQUE (patient_id, medecin_id, date_consult);

-- Contrainte unique pour upsert paiements_consultation (un seul par entrée)
ALTER TABLE paiements_consultation
  ADD CONSTRAINT uq_paiement_consult_file
  UNIQUE (file_id);

-- Contrainte unique pour upsert paiements_examens (un seul par entrée)
ALTER TABLE paiements_examens
  ADD CONSTRAINT uq_paiement_examens_file
  UNIQUE (file_id);