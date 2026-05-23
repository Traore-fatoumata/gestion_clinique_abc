-- ═══════════════════════════════════════════════════════
--  DONNÉES INITIALES — Comptes démo + paramètres clinique
--  Mot de passe pour tous : "1234" (hash bcrypt)
-- ═══════════════════════════════════════════════════════

-- Hash bcrypt de "1234" (rounds=10)
-- $2b$10$YourHashHere — généré via script Node séparé
-- On insère via la fonction crypt de pgcrypto (ou le seed Node)

-- ── PARAMÈTRES CLINIQUE ─────────────────────────────────
INSERT INTO parametres_clinique (cle, valeur) VALUES
  ('nomClinique',      'Clinique Médicale ABC Marouane'),
  ('adresse',          'Tannerie, Kaloum, Conakry'),
  ('telephone',        '+224 624 00 00 00'),
  ('tarifNourrisson',  '30000'),
  ('tarifEnfant',      '35000'),
  ('tarifAdulte',      '50000'),
  ('tarifSenior',      '40000'),
  ('devise',           'GNF')
ON CONFLICT (cle) DO NOTHING;

-- ── COMPTES UTILISATEURS ────────────────────────────────
-- Les mots de passe bcrypt seront insérés par le seed Node.js
-- Ce fichier définit la structure; voir 02_seed_node.js pour les hashes
