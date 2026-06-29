-- Migration 003: Références Inter-Services et Soins d'Urgence
-- À appliquer sur la base de données clinique_marouane

-- 1. Configuration de la clinique pour le paiement des urgences
CREATE TABLE IF NOT EXISTS configuration_clinique (
    id SERIAL PRIMARY KEY,
    regle_paiement_urgences VARCHAR(50) NOT NULL DEFAULT 'soigner_d_abord', -- 'payer_d_abord' ou 'soigner_d_abord'
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_by INTEGER REFERENCES utilisateurs(id)
);

-- Insérer par défaut la configuration
INSERT INTO configuration_clinique (id, regle_paiement_urgences)
VALUES (1, 'soigner_d_abord')
ON CONFLICT (id) DO NOTHING;

-- 2. Traçabilité du parcours patient
CREATE TABLE IF NOT EXISTS parcours_patient (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    patient_id INTEGER NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
    date_entree TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    date_sortie TIMESTAMP,
    statut VARCHAR(50) NOT NULL DEFAULT 'admis', -- 'admis', 'en_consultation', 'en_soins_urgence', 'sorti'
    service_actuel VARCHAR(100),
    motif_admission TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 3. Références inter-services
CREATE TABLE IF NOT EXISTS references_services (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    parcours_id UUID REFERENCES parcours_patient(id) ON DELETE SET NULL,
    patient_id INTEGER NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
    medecin_demandeur_id INTEGER NOT NULL REFERENCES utilisateurs(id),
    service_origine VARCHAR(100) NOT NULL,
    service_destinataire VARCHAR(100) NOT NULL,
    motif_reference TEXT NOT NULL,
    priorite VARCHAR(50) NOT NULL DEFAULT 'Normale', -- 'Normale', 'Urgente', 'Critique'
    statut VARCHAR(50) NOT NULL DEFAULT 'En attente', -- 'En attente', 'Acceptée', 'En cours', 'Terminée', 'Annulée'
    commentaires TEXT,
    date_creation TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    date_mise_a_jour TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 4. Prises en charge d'urgence / Premiers soins
CREATE TABLE IF NOT EXISTS prises_en_charge_urgence (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    parcours_id UUID REFERENCES parcours_patient(id) ON DELETE SET NULL,
    patient_id INTEGER NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
    personnel_soignant_id INTEGER NOT NULL REFERENCES utilisateurs(id),
    date_heure_arrivee TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    constantes_vitales JSONB, -- TA, Pouls, T°, SaO2, Glasgow
    observations_initiales TEXT,
    soins_administres TEXT[], -- Liste des actes faits
    medicaments_urgence JSONB[], -- Liste d'objets [{nom, quantite, prix}]
    consommables_utilises JSONB[], -- [{nom, quantite, prix}]
    examens_urgents_commandes TEXT[],
    facture_generee_id INTEGER,
    statut_paiement VARCHAR(30) DEFAULT 'non_paye', -- 'non_paye', 'paye'
    signe BOOLEAN DEFAULT FALSE,
    signe_le TIMESTAMPTZ,
    signe_par VARCHAR(120),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 5. Indexation
CREATE INDEX IF NOT EXISTS idx_ref_dest_statut ON references_services(service_destinataire, statut);
CREATE INDEX IF NOT EXISTS idx_ref_patient ON references_services(patient_id);
