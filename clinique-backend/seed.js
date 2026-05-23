/**
 * SEED SCRIPT — Comptes démo Clinique ABC Marouane
 * Usage : node seed.js
 * Crée tous les comptes avec le mot de passe "1234"
 */
require("dotenv").config()
const bcrypt = require("bcryptjs")
const pool   = require("./src/config/db")

const SALT_ROUNDS = 10

const UTILISATEURS = [
  // ── Personnel général ────────────────────────────────
  {
    email:      "secretaire@clinique.com",
    nom:        "Mme. Diallo Kadiatou",
    role:       "secretaire",
    specialite: null,
    titre:      "Secrétaire Médicale",
  },
  {
    email:      "chef@clinique.com",
    nom:        "Dr. Doumbouya",
    role:       "medecin_chef",
    specialite: "Médecine générale",
    titre:      "Médecin Chef",
  },
  {
    email:      "comptable@clinique.com",
    nom:        "M. Kourouma Ibrahima",
    role:       "comptable",
    specialite: null,
    titre:      "Comptable",
  },
  {
    email:      "labo@clinique.com",
    nom:        "M. Baldé Oumar",
    role:       "labo",
    specialite: null,
    titre:      "Technicien Laboratoire",
  },
  {
    email:      "infirmier@clinique.com",
    nom:        "Mme. Diallo Mariam",
    role:       "infirmier",
    specialite: null,
    titre:      "Infirmière Principale",
  },
  // ── Médecins spécialistes ─────────────────────────────
  {
    email:      "medecin@clinique.com",
    nom:        "Dr. Camara Moussa",
    role:       "medecin",
    specialite: "Cardiologie",
    titre:      "Cardiologue",
  },
  {
    email:      "generaliste@clinique.com",
    nom:        "Dr. Barry Amadou",
    role:       "medecin",
    specialite: "Diabétologie",
    titre:      "Diabétologue",
  },
  {
    email:      "pediatre@clinique.com",
    nom:        "Dr. Souaré Fatoumata",
    role:       "medecin",
    specialite: "Pédiatrie",
    titre:      "Pédiatre",
  },
  {
    email:      "gynecologue@clinique.com",
    nom:        "Dr. Keïta Mariama",
    role:       "medecin",
    specialite: "Gynécologie",
    titre:      "Gynécologue",
  },
  {
    email:      "ophtalmologue@clinique.com",
    nom:        "Dr. Bah Ibrahima",
    role:       "medecin",
    specialite: "Ophtalmologie",
    titre:      "Ophtalmologue",
  },
  {
    email:      "traumatologue@clinique.com",
    nom:        "Dr. Diallo Sékou",
    role:       "medecin",
    specialite: "Traumatologie",
    titre:      "Traumatologue",
  },
  {
    email:      "neurologue@clinique.com",
    nom:        "Dr. Konaté Aboubacar",
    role:       "medecin",
    specialite: "Neurologie",
    titre:      "Neurologue",
  },
  {
    email:      "orl@clinique.com",
    nom:        "Dr. Traoré Mamadou",
    role:       "medecin",
    specialite: "ORL",
    titre:      "ORL",
  },
  {
    email:      "urologue@clinique.com",
    nom:        "Dr. Baldé Aliou",
    role:       "medecin",
    specialite: "Urologie",
    titre:      "Urologue",
  },
  {
    email:      "chirurgien@clinique.com",
    nom:        "Dr. Condé Lansana",
    role:       "medecin",
    specialite: "Chirurgie",
    titre:      "Chirurgien",
  },
  {
    email:      "dermatologue@clinique.com",
    nom:        "Dr. Soumah Aissatou",
    role:       "medecin",
    specialite: "Dermatologie",
    titre:      "Dermatologue",
  },
  {
    email:      "oncologue@clinique.com",
    nom:        "Dr. Cissé Mohamed",
    role:       "medecin",
    specialite: "Oncologie",
    titre:      "Oncologue",
  },
  {
    email:      "infectiologue@clinique.com",
    nom:        "Dr. Bangoura Thierno",
    role:       "medecin",
    specialite: "Maladies infectieuses",
    titre:      "Infectiologue",
  },
  {
    email:      "stomatologue@clinique.com",
    nom:        "Dr. Fofana Kadiatou",
    role:       "medecin",
    specialite: "Stomatologie",
    titre:      "Stomatologue",
  },
]

const PARAMETRES = [
  { cle: "nomClinique",     valeur: "Clinique Médicale ABC Marouane" },
  { cle: "adresse",         valeur: "Tannerie, Kaloum, Conakry" },
  { cle: "telephone",       valeur: "+224 624 00 00 00" },
  { cle: "tarifNourrisson", valeur: "30000" },
  { cle: "tarifEnfant",     valeur: "35000" },
  { cle: "tarifAdulte",     valeur: "50000" },
  { cle: "tarifSenior",     valeur: "40000" },
  { cle: "devise",          valeur: "GNF" },
]

async function seed() {
  console.log("\n🌱 Démarrage du seed Clinique ABC Marouane...\n")

  try {
    // Hash unique pour "1234"
    console.log("🔐 Hachage du mot de passe par défaut (1234)...")
    const hash = await bcrypt.hash("1234", SALT_ROUNDS)

    // Insérer les utilisateurs
    console.log("👤 Insertion des comptes utilisateurs...\n")
    let ok = 0, skip = 0

    for (const u of UTILISATEURS) {
      try {
        await pool.query(
          `INSERT INTO utilisateurs (email, mot_de_passe, nom, role, specialite, titre)
           VALUES ($1, $2, $3, $4, $5, $6)
           ON CONFLICT (email) DO NOTHING`,
          [u.email, hash, u.nom, u.role, u.specialite, u.titre]
        )
        console.log(`  ✅ ${u.nom.padEnd(35)} [${u.role}]`)
        ok++
      } catch (err) {
        console.log(`  ⚠️  ${u.email} — ignoré (${err.message})`)
        skip++
      }
    }

    // Insérer les paramètres clinique
    console.log("\n⚙️  Insertion des paramètres clinique...")
    for (const p of PARAMETRES) {
      await pool.query(
        `INSERT INTO parametres_clinique (cle, valeur)
         VALUES ($1, $2)
         ON CONFLICT (cle) DO UPDATE SET valeur = EXCLUDED.valeur`,
        [p.cle, p.valeur]
      )
    }

    console.log(`
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
✅ Seed terminé :
   ${ok} compte(s) créé(s), ${skip} ignoré(s)
   Mot de passe par défaut : 1234
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
`)
  } catch (err) {
    console.error("\n❌ Erreur seed:", err.message)
    console.error("   Vérifiez que la base existe et que le schéma est appliqué.")
  } finally {
    await pool.end()
  }
}

seed()
