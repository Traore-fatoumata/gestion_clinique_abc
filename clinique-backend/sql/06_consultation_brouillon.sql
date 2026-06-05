ALTER TABLE consultations ADD COLUMN IF NOT EXISTS donnees_brouillon JSONB DEFAULT '{}'::jsonb;
