/**
 * CLEAR SCRIPT — Supprime toutes les données de la base de données
 * Usage : npm run clear
 * 
 * Ce script vide toutes les tables de la base de données tout en conservant
 * la structure (schéma). Utile pour remettre à zéro et tester l'application.
 */
require("dotenv").config()
const pool = require("./src/config/db")

async function clearDatabase() {
  console.log("\n🗑️  Démarrage de la suppression des données...\n")

  try {
    // Liste des tables dans l'ordre pour éviter les problèmes de contraintes
    const tables = [
      'notifications',
      'presence',
      'soins',
      'examens_labo',
      'demandes_labo',
      'paiements_examens',
      'examens_commandes',
      'consultations',
      'paiements_consultation',
      'file_attente',
      'rendez_vous',
      'patients',
      'utilisateurs',
      'parametres_clinique'
    ]

    for (const table of tables) {
      try {
        const result = await pool.query(`DELETE FROM ${table}`)
        console.log(`  ✅ Table "${table}" vidée (${result.rowCount} lignes supprimées)`)
      } catch (err) {
        console.log(`  ⚠️  Table "${table}" - Erreur: ${err.message}`)
      }
    }

    // Réinitialiser les séquences (pour que les IDs recommencent à 1)
    console.log("\n🔄 Réinitialisation des séquences...")
    const sequences = [
      'utilisateurs_id_seq',
      'patients_id_seq',
      'file_attente_id_seq',
      'paiements_consultation_id_seq',
      'consultations_id_seq',
      'examens_commandes_id_seq',
      'paiements_examens_id_seq',
      'rendez_vous_id_seq',
      'demandes_labo_id_seq',
      'examens_labo_id_seq',
      'soins_id_seq',
      'presence_id_seq',
      'notifications_id_seq',
      'parametres_clinique_id_seq'
    ]

    for (const seq of sequences) {
      try {
        await pool.query(`ALTER SEQUENCE ${seq} RESTART WITH 1`)
      } catch (err) {
        // Certaines séquences peuvent ne pas exister, on ignore les erreurs
      }
    }

    console.log(`
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
✅ Base de données entièrement vidée !
   Toutes les tables ont été réinitialisées.
   Vous pouvez maintenant utiliser npm run seed
   pour recréer les comptes de démonstration.
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
`)
  } catch (err) {
    console.error("\n❌ Erreur lors de la suppression:", err.message)
  } finally {
    await pool.end()
  }
}

clearDatabase()