/**
 * End-to-End Validation Script for Exam Pricing, Auto-Billing, and Payments
 * Run: node test_exam_billing.js
 */
(async () => {
  try {
    const base = 'http://localhost:5000/api'
    
    // --- Step 1: Login as Secretary ---
    console.log('STEP 1: LOGIN AS SECRETARY (secretaire@clinique.com)')
    const secLoginRes = await fetch(base + '/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'secretaire@clinique.com', mot_de_passe: '1234' })
    })
    if (!secLoginRes.ok) {
      console.error('❌ Secretary login failed', await secLoginRes.text())
      process.exit(1)
    }
    const secToken = (await secLoginRes.json()).token
    console.log('  Sec login ok.')

    // --- Step 2: Create Patient ---
    console.log('\nSTEP 2: CREATE PATIENT')
    const uniquePhone = '601' + Math.floor(100000 + Math.random() * 900000)
    const patientName = 'Oumar Test Billing ' + Math.floor(100000 + Math.random() * 900000)
    const patientRes = await fetch(base + '/patients', {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + secToken
      },
      body: JSON.stringify({
        nom: patientName,
        date_naissance: '1995-10-12',
        sexe: 'M',
        telephone: uniquePhone,
        quartier: 'Ratoma',
        secteur: 'Kipé',
        profession: 'Etudiant',
        responsable: 'Diallo Alfa'
      })
    })
    if (!patientRes.ok) {
      console.error('❌ Patient creation failed', await patientRes.text())
      process.exit(1)
    }
    const patient = (await patientRes.json()).patient
    console.log(`  Patient created. Name: ${patient.nom}, ID: ${patient.id}, PID: ${patient.pid}`)

    // --- Step 3: Add Patient to Queue (file_attente) ---
    console.log('\nSTEP 3: ADD PATIENT TO QUEUE')
    const queueRes = await fetch(base + '/file', {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + secToken
      },
      body: JSON.stringify({
        patient_id: patient.id,
        type_visite: 'consultation',
        montant_consultation: 50000
      })
    })
    if (!queueRes.ok) {
      console.error('❌ Queue addition failed', await queueRes.text())
      process.exit(1)
    }
    const queueData = await queueRes.json()
    const queueEntry = queueData.entree
    console.log(`  Patient added to queue. Queue Entry ID: ${queueEntry.id}`)

    // --- Step 4: Login as Doctor ---
    console.log('\nSTEP 4: LOGIN AS DOCTOR (medecin@clinique.com)')
    const docLoginRes = await fetch(base + '/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'medecin@clinique.com', mot_de_passe: '1234' })
    })
    if (!docLoginRes.ok) {
      console.error('❌ Doctor login failed', await docLoginRes.text())
      process.exit(1)
    }
    const doc = await docLoginRes.json()
    const docToken = doc.token
    console.log(`  Doctor login ok. Name: ${doc.user.nom}, ID: ${doc.user.id}`)

    // --- Step 5: Save Consultation with 2 Exams ---
    console.log('\nSTEP 5: DOCTOR PRESCRIBES EXAMS (NFS + Widal with prices)')
    const todayStr = new Date().toISOString().slice(0, 10)
    const saveConsultRes = await fetch(base + '/consultations', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + docToken
      },
      body: JSON.stringify({
        patient_id: patient.id,
        medecin_id: doc.user.id,
        date: todayStr,
        service: 'Médecine générale',
        motif: 'Fièvre persistante',
        plaintes: 'Céphalées et fatigue',
        diagnostics: ['Suspicion Paludisme ou Typhoïde'],
        traitements: ['Paracétamol 1g'],
        type_consultation: 'standard',
        envoyer_labo: true,
        examens_commandes: [
          { nom: 'NFS', prix: 15000 },
          { nom: 'Widal', prix: 25000 }
        ]
      })
    })
    if (!saveConsultRes.ok) {
      console.error('❌ Saving consultation failed', await saveConsultRes.text())
      process.exit(1)
    }
    console.log('  Consultation saved and exams prescribed.')

    // --- Step 6: Login as Accountant & Verify Bill ---
    console.log('\nSTEP 6: LOGIN AS ACCOUNTANT AND VERIFY EXAM BILL')
    const comptaLoginRes = await fetch(base + '/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'comptable@clinique.com', mot_de_passe: '1234' })
    })
    if (!comptaLoginRes.ok) {
      console.error('❌ Accountant login failed', await comptaLoginRes.text())
      process.exit(1)
    }
    const comptaToken = (await comptaLoginRes.json()).token
    console.log('  Accountant login ok.')

    // List payments for today
    const paymentsRes = await fetch(base + `/paiements?date=${todayStr}`, {
      method: 'GET',
      headers: { 'Authorization': 'Bearer ' + comptaToken }
    })
    if (!paymentsRes.ok) {
      console.error('❌ Failed to retrieve payments list', await paymentsRes.text())
      process.exit(1)
    }
    const paymentsData = await paymentsRes.json()
    const activePatientPayment = paymentsData.paiements.find(p => p.patientId === patient.id)
    if (!activePatientPayment) {
      console.error('❌ Patient not found in accountant payments list')
      process.exit(1)
    }
    console.log('  Patient found in payments list.')
    console.log('  Paiement consultation:', JSON.stringify(activePatientPayment.paiementConsultation))
    console.log('  Paiement examens:', JSON.stringify(activePatientPayment.paiementExamens))
    
    // Check that billing is correctly populated
    const pe = activePatientPayment.paiementExamens
    if (!pe || pe.montantTotal !== 40000 || pe.statut !== 'en_attente') {
      console.error('❌ Exam billing calculation incorrect! Expected total: 40000, status: en_attente. Got:', pe)
      process.exit(1)
    }
    console.log('  ✅ Success: Bill calculated correctly (15000 + 25000 = 40000) and set to "en_attente"!')

    // --- Step 7: Update Consultation (Modify Exams) ---
    console.log('\nSTEP 7: DOCTOR UPDATES PRESCRIPTION (Removes Widal, changes price of NFS to 18000)')
    const updateConsultRes = await fetch(base + '/consultations', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + docToken
      },
      body: JSON.stringify({
        patient_id: patient.id,
        medecin_id: doc.user.id,
        date: todayStr,
        service: 'Médecine générale',
        motif: 'Fièvre persistante',
        plaintes: 'Céphalées et fatigue',
        diagnostics: ['Suspicion Paludisme'],
        traitements: ['Paracétamol 1g'],
        type_consultation: 'standard',
        envoyer_labo: true,
        examens_commandes: [
          { nom: 'NFS', prix: 18000 }
        ]
      })
    })
    if (!updateConsultRes.ok) {
      console.error('❌ Updating consultation failed', await updateConsultRes.text())
      process.exit(1)
    }
    console.log('  Consultation updated.')

    // Accountant checks updated bill
    const paymentsRes2 = await fetch(base + `/paiements?date=${todayStr}`, {
      method: 'GET',
      headers: { 'Authorization': 'Bearer ' + comptaToken }
    })
    const pe2 = (await paymentsRes2.json()).paiements.find(p => p.patientId === patient.id).paiementExamens
    if (!pe2 || pe2.montantTotal !== 18000 || pe2.statut !== 'en_attente') {
      console.error('❌ Exam billing update incorrect! Expected total: 18000, status: en_attente. Got:', pe2)
      process.exit(1)
    }
    console.log('  ✅ Success: Accountant saw updated bill instantly (Total: 18000)!')

    // --- Step 8: Pay Bill ---
    console.log('\nSTEP 8: ACCOUNTANT ENTERS PAYMENT FOR THE EXAMS')
    const payRes = await fetch(base + '/paiements/examens', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + comptaToken
      },
      body: JSON.stringify({
        file_id: queueEntry.id,
        patient_id: patient.id,
        montant_paye: 18000,
        methode: 'orange_money',
        note: 'Payé par Orange Money'
      })
    })
    if (!payRes.ok) {
      console.error('❌ Recording payment failed', await payRes.text())
      process.exit(1)
    }
    const payData = await payRes.json()
    console.log('  Payment recorded. Response:', JSON.stringify(payData.paiement))
    if (payData.paiement.statut !== 'paye' || payData.paiement.montant_paye !== 18000) {
      console.error('❌ Payment status or amount mismatch!')
      process.exit(1)
    }
    console.log('  ✅ Success: Exam bill is fully paid!')

    console.log('\n🎉 ALL E2E EXAM AUTO-BILLING AND PAYMENT TESTS PASSED SUCCESSFULLY!')
    process.exit(0)
  } catch (err) {
    console.error('❌ Unexpected error:', err)
    process.exit(1)
  }
})();
