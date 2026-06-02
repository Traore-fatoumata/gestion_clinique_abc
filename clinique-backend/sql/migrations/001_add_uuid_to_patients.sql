-- Migration: 001_add_uuid_to_patients.sql
-- Ajoute la colonne `uuid` à la table `patients` et la peuple.
-- Exécutez depuis la base de données cible avec un superutilisateur ou un utilisateur ayant les droits ALTER.

-- Assurer l'extension pour gen_random_uuid (pgcrypto)
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Ajouter la colonne uuid si absente
ALTER TABLE patients ADD COLUMN IF NOT EXISTS uuid UUID;

-- Remplir les lignes existantes
UPDATE patients SET uuid = gen_random_uuid() WHERE uuid IS NULL;

-- Rendre non NULL et ajouter valeur par défaut
ALTER TABLE patients ALTER COLUMN uuid SET NOT NULL;
ALTER TABLE patients ALTER COLUMN uuid SET DEFAULT gen_random_uuid();

-- Index/contrainte d'unicité
CREATE UNIQUE INDEX IF NOT EXISTS idx_patients_uuid ON patients(uuid);

-- Fin migration
