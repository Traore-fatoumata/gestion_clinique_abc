/**
 * Validation Script for Legacy Data Migration Features
 * Usage: node test_migrations.js
 */
(async () => {
  try {
    const base = 'http://localhost:5000/api'
    
    console.log('STEP 1: LOGIN AS ADMIN (chef@clinique.com)')
    const loginRes = await fetch(base + '/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'chef@clinique.com', mot_de_passe: '1234' })
    })
    
    const loginText = await loginRes.text()
    console.log('  Login Status:', loginRes.status)
    if (!loginRes.ok) {
      console.error('❌ Login failed:', loginText)
      process.exit(1)
    }
    
    const login = JSON.parse(loginText)
    const token = login.token
    if (!token) {
      console.error('❌ No token retrieved')
      process.exit(1)
    }
    console.log('  Authenticated successfully. Token retrieved.')

    const uniquePhone = '600' + Math.floor(100000 + Math.random() * 900000)
    const uniqueName = 'Diallo Oumar Legacy ' + Math.floor(100000 + Math.random() * 900000)
    const patientData = {
      nom: uniqueName,
      date_naissance: '1985-05-15',
      sexe: 'M',
      telephone: uniquePhone,
      quartier: 'Ratoma',
      secteur: 'Kipé',
      profession: 'Ingénieur',
      responsable: 'Diallo Mamadou'
    }

    console.log('\nSTEP 2: CREATE PAPIER DOSSIER (MANUAL MIGRATION)')
    const papierRes = await fetch(base + '/migrations/saisie-papier', {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + token
      },
      body: JSON.stringify(patientData)
    })
    
    const papierText = await papierRes.text()
    console.log('  Papier Migration Status:', papierRes.status)
    const papierData = JSON.parse(papierText)
    if (!papierRes.ok || !papierData.success) {
      console.error('❌ Saisie papier failed:', papierText)
      process.exit(1)
    }
    console.log(`  Patient created successfully with PID: ${papierData.patient.pid}`)

    console.log('\nSTEP 3: ATTEMPT TO CREATE DUPLICATE (EXPECT DUPLICATE WARNING)')
    const duplicateRes = await fetch(base + '/migrations/saisie-papier', {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + token
      },
      body: JSON.stringify(patientData)
    })
    
    const duplicateText = await duplicateRes.text()
    console.log('  Duplicate Check Status:', duplicateRes.status)
    const duplicateData = JSON.parse(duplicateText)
    if (duplicateData.success === false && duplicateData.duplicate === true) {
      console.log('  ✅ Success: Duplicate detected correctly and blocked.')
      console.log('  Message received:', duplicateData.message)
    } else {
      console.error('❌ Failure: Duplicate patient was not blocked. Response:', duplicateText)
      process.exit(1)
    }

    console.log('\nSTEP 4: FORCE DUPLICATE BYPASSING WARNING')
    const forceRes = await fetch(base + '/migrations/saisie-papier', {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + token
      },
      body: JSON.stringify({ ...patientData, force: true })
    })
    
    const forceText = await forceRes.text()
    console.log('  Force Insertion Status:', forceRes.status)
    const forceData = JSON.parse(forceText)
    if (forceRes.ok && forceData.success) {
      console.log(`  ✅ Success: Forced patient creation bypassed warning. New PID: ${forceData.patient.pid}`)
    } else {
      console.error('❌ Failure: Force duplicate insert failed. Response:', forceText)
      process.exit(1)
    }

    console.log('\nSTEP 5: GET MIGRATION HISTORY LOGS')
    const historyRes = await fetch(base + '/migrations/historique', {
      method: 'GET',
      headers: { 
        'Authorization': 'Bearer ' + token
      }
    })
    
    const historyText = await historyRes.text()
    console.log('  History Logs Status:', historyRes.status)
    const historyData = JSON.parse(historyText)
    if (!historyRes.ok || !historyData.success) {
      console.error('❌ Failed to fetch logs. Response:', historyText)
      process.exit(1)
    }
    
    console.log(`  ✅ Success: Retrieved ${historyData.logs.length} migration logs.`)
    console.log('  Latest Migration Log:', JSON.stringify(historyData.logs[0], null, 2))

    console.log('\n🎉 ALL LEGACY MIGRATION BACKEND VERIFICATIONS COMPLETED SUCCESSFULLY!')
    process.exit(0)
  } catch (err) {
    console.error('❌ Unexpected Error during verification:', err)
    process.exit(1)
  }
})();
