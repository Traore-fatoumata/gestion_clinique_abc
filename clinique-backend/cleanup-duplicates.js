/**
 * Script de nettoyage des consultations en double
 * 
 * Ce script supprime :
 * 1. Les consultations non signées créées par le médecin chef pour des patients assignés à d'autres médecins
 * 2. Les consultations non signées en double pour un même patient le même jour avec le même médecin
 * 
 * Utilisation : node cleanup-duplicates.js
 */

require('dotenv').config({ path: '.env' });
const { Pool } = require('pg');

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5432,
  database: process.env.DB_NAME || 'clinique_marouane',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || '',
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

async function cleanupDuplicates() {
  const client = await pool.connect();
  
  try {
    console.log('🔍 Début du nettoyage des consultations en double...\n');
    
    // 1. Supprimer les consultations non signées créées par le chef pour des patients assignés à d'autres médecins
    // Ces consultations ne devraient pas exister car le chef ne doit pas créer de consultation quand il assigne
    console.log('📋 Étape 1: Suppression des consultations de triage obsolètes (patients assignés à d\'autres médecins)');
    
    const query1 = `
      DELETE FROM consultations c1
      USING file_attente f
      WHERE c1.patient_id = f.patient_id
        AND c1.medecin_id = 1  -- Médecin chef (id=1)
        AND c1.signe = false
        AND f.medecin_id IS NOT NULL
        AND f.medecin_id != 1
        AND f.statut = 'en_cours'
        AND c1.date_consult = f.date_entree;
    `;
    
    const result1 = await client.query(query1);
    console.log(`   ✅ ${result1.rowCount} consultations de triage obsolètes supprimées\n`);
    
    // 2. Supprimer les consultations non signées en double pour un même patient le même jour avec le même médecin
    // Garder uniquement la plus récente
    console.log('📋 Étape 2: Suppression des consultations non signées en double (même patient, même jour, même médecin)');
    
    const query2 = `
      DELETE FROM consultations c1
      USING consultations c2
      WHERE c1.patient_id = c2.patient_id
        AND c1.medecin_id = c2.medecin_id
        AND c1.date_consult = c2.date_consult
        AND c1.signe = false
        AND c2.signe = false
        AND c1.id < c2.id;
    `;
    
    const result2 = await client.query(query2);
    console.log(`   ✅ ${result2.rowCount} consultations en double supprimées\n`);
    
    // 3. Afficher les consultations restantes pour vérification
    console.log('📊 Résumé des consultations restantes aujourd\'hui :');
    
    const summary = await client.query(`
      SELECT 
        c.medecin_id,
        d.nom as docteur_nom,
        COUNT(*) as total,
        COUNT(CASE WHEN c.signe = false THEN 1 END) as non_signees,
        COUNT(CASE WHEN c.signe = true THEN 1 END) as signees
      FROM consultations c
      LEFT JOIN utilisateurs d ON c.medecin_id = d.id
      WHERE c.date_consult = CURRENT_DATE
      GROUP BY c.medecin_id, d.nom
      ORDER BY c.medecin_id;
    `);
    
    console.log('   Docteur | Total | Non signées | Signées');
    console.log('   --------|-------|-------------|--------');
    summary.rows.forEach(row => {
      console.log(`   ${row.docteur_nom || 'ID:' + row.docteur_id} | ${row.total} | ${row.non_signees} | ${row.signees}`);
    });
    
    console.log('\n✅ Nettoyage terminé avec succès !');
    
  } catch (error) {
    console.error('❌ Erreur lors du nettoyage:', error.message);
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
}

// Exécuter le script
cleanupDuplicates()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });