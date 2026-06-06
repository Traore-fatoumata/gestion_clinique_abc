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
    // Étape 1 : Récupérer toutes les contraintes de clés étrangères
    console.log("🔍 Recherche des contraintes de clés étrangères...")
    const fkResult = await pool.query(`
      SELECT conname as constraint_name, conrelid::regclass as table_name
      FROM pg_constraint
      WHERE contype = 'f'
      AND conrelid::regclass::text IN (
        'notifications', 'presence', 'soins', 'examens_labo', 'demandes_labo',
        'paiements_examens', 'examens_commandes', 'consultations', 'paiements_consultation',
        'file_attente', 'rendez_vous', 'patients', 'utilisateurs'
      )
    `)
    
    // Étape 2 : Supprimer temporairement les contraintes de clés étrangères
    console.log(`🔓 Suppression de ${fkResult.rows.length} contraintes de clés étrangères...`)
    for (const fk of fkResult.rows) {
      try {
        await pool.query(`ALTER TABLE ${fk.table_name} DROP CONSTRAINT ${fk.constraint_name}`)
        console.log(`  ✅ Contrainte "${fk.constraint_name}" supprimée`)
      } catch (err) {
        console.log(`  ⚠️  Contrainte "${fk.constraint_name}" - ${err.message}`)
      }
    }

    // Étape 3 : Vider toutes les tables avec TRUNCATE
    const tables = [
      'notifications', 'presence', 'soins', 'examens_labo', 'demandes_labo',
      'paiements_examens', 'examens_commandes', 'consultations', 'paiements_consultation',
      'file_attente', 'rendez_vous', 'patients', 'utilisateurs', 'parametres_clinique'
    ]
    
    console.log("\n🗑️  Vidage des tables...")
    for (const table of tables) {
      try {
        await pool.query(`TRUNCATE TABLE ${table} RESTART IDENTITY CASCADE`)
        console.log(`  ✅ Table "${table}" vidée`)
      } catch (err) {
        console.log(`  ⚠️  Table "${table}" - ${err.message}`)
      }
    }
    
    // Étape 4 : Recréer les contraintes de clés étrangères
    console.log("\n🔒 Recréation des contraintes de clés étrangères...")
    // Les contraintes seront recréées automatiquement lors des opérations futures
    // ou on peut les recréer manuellement si nécessaire

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