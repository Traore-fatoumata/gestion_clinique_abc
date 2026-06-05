-- Workflow consultation / laboratoire / notifications
ALTER TABLE consultations
  ADD COLUMN IF NOT EXISTS attente_resultats_labo BOOLEAN DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS labo_demande_id INT REFERENCES demandes_labo(id);

ALTER TABLE demandes_labo
  ADD COLUMN IF NOT EXISTS file_id INT REFERENCES file_attente(id),
  ADD COLUMN IF NOT EXISTS consultation_id INT REFERENCES consultations(id),
  ADD COLUMN IF NOT EXISTS medecin_id INT REFERENCES utilisateurs(id);

ALTER TABLE notifications
  ADD COLUMN IF NOT EXISTS type_notif VARCHAR(50) DEFAULT 'assignation',
  ADD COLUMN IF NOT EXISTS patient_id INT REFERENCES patients(id);

CREATE INDEX IF NOT EXISTS idx_consult_labo ON consultations(labo_demande_id);
CREATE INDEX IF NOT EXISTS idx_labo_file ON demandes_labo(file_id);
