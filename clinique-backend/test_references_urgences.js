/**
 * End-to-End Validation Script for Inter-Service References and Emergency Triage
 * Run: node test_references_urgences.js
 */
(async () => {
  try {
    const base = 'http://localhost:5000/api'
    
    // --- Step 1: Login as Chef (chef@clinique.com) ---
    console.log('STEP 1: LOGIN AS CHEF (chef@clinique.com)')
    const chefLoginRes = await fetch(base + '/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'chef@clinique.com', mot_de_passe: '1234' })
    })
    if (!chefLoginRes.ok) {
      console.error('❌ Chef login failed', await chefLoginRes.text())
      process.exit(1)
    }
    const chefToken = (await chefLoginRes.json()).token
    console.log('  Chef login ok.')

    // --- Step 2: Login as Secretary (secretaire@clinique.com) ---
    console.log('\nSTEP 2: LOGIN AS SECRETARY (secretaire@clinique.com)')
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
    console.log('  Secretary login ok.')

    // --- Step 3: Create Patients ---
    console.log('\nSTEP 3: CREATE TEST PATIENTS')
    const createPatient = async (name) => {
      const uniquePhone = '601' + Math.floor(100000 + Math.random() * 900000)
      const res = await fetch(base + '/patients', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': 'Bearer ' + secToken
        },
        body: JSON.stringify({
          nom: name,
          date_naissance: '1990-05-15',
          sexe: 'F',
          telephone: uniquePhone,
          quartier: 'Kipé',
          secteur: 'Centre',
          profession: 'Salariée',
          responsable: 'Contact Urgence'
        })
      })
      if (!res.ok) {
        console.error('❌ Patient creation failed', await res.text())
        process.exit(1)
      }
      return (await res.json()).patient
    }

    const patient1 = await createPatient('Fatoumata Test Urgence 1')
    const patient2 = await createPatient('Mariama Test Urgence 2')
    console.log(`  Patients created: ID ${patient1.id} (${patient1.nom}) and ID ${patient2.id} (${patient2.nom})`)

    // --- Step 4: Urgence payment rule: soigner_d_abord ---
    console.log('\nSTEP 4: SET CONFIG TO "soigner_d_abord" AND REGISTER TRIAGE')
    const setConfigRes = await fetch(base + '/urgences/config', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + chefToken
      },
      body: JSON.stringify({ regle_paiement_urgences: 'soigner_d_abord' })
    })
    if (!setConfigRes.ok) {
      console.error('❌ Set config failed', await setConfigRes.text())
      process.exit(1)
    }
    console.log('  Config set to "soigner_d_abord"')

    // Register urgency triage case for patient 1
    const triage1Res = await fetch(base + '/urgences', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + chefToken
      },
      body: JSON.stringify({
        patient_id: patient1.id,
        constantes_vitales: { temp: '39.2', ta: '90/60', fc: '110', poids: '58' },
        observations_initiales: 'Détresse respiratoire aiguë et fièvre élevée',
        soins_administres: ['Oxygénothérapie (par heure)', 'Pose de voie veineuse périphérique'],
        medicaments_urgence: [{ nom: 'Sérum salé 0.9% 500ml', quantite: 1, prix: 15000 }],
        consommables_utilises: [{ nom: 'Cathéter intraveineux (G18/G20)', quantite: 1, prix: 5000 }],
        examens_urgents_commandes: ['NFS (Hémogramme)']
      })
    })
    if (!triage1Res.ok) {
      console.error('❌ Triage registration failed', await triage1Res.text())
      process.exit(1)
    }
    const triage1Data = await triage1Res.json()
    console.log(`  Triage registered. Total fee: ${triage1Data.facture.montant} GNF, Status: ${triage1Data.facture.statut}`)

    // Verify patient 1 waitlist status is 'en_cours' (Soigner d'abord)
    const todayStr = new Date().toISOString().slice(0, 10)
    const waitlist1Res = await fetch(base + `/file?date=${todayStr}`, {
      method: 'GET',
      headers: { 'Authorization': 'Bearer ' + chefToken }
    })
    const waitlist1Data = await waitlist1Res.json()
    const patient1Entry = waitlist1Data.file.find(f => Number(f.patientId) === Number(patient1.id))
    if (!patient1Entry) {
      console.error('❌ Patient 1 not found in waitlist')
      process.exit(1)
    }
    console.log(`  Patient 1 queue entry found. Statut: "${patient1Entry.statut}" (Expected: "en_cours")`)
    if (patient1Entry.statut !== 'en_cours') {
      console.error('❌ Expected queue status to be en_cours for soigner_d_abord')
      process.exit(1)
    }

    // --- Step 5: Urgence payment rule: payer_d_abord ---
    console.log('\nSTEP 5: SET CONFIG TO "payer_d_abord" AND REGISTER TRIAGE')
    const setConfig2Res = await fetch(base + '/urgences/config', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + chefToken
      },
      body: JSON.stringify({ regle_paiement_urgences: 'payer_d_abord' })
    })
    if (!setConfig2Res.ok) {
      console.error('❌ Set config to payer_d_abord failed', await setConfig2Res.text())
      process.exit(1)
    }
    console.log('  Config set to "payer_d_abord"')

    // Register urgency triage case for patient 2
    const triage2Res = await fetch(base + '/urgences', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + chefToken
      },
      body: JSON.stringify({
        patient_id: patient2.id,
        constantes_vitales: { temp: '38.5', ta: '110/70', fc: '95', poids: '62' },
        observations_initiales: 'Traumatisme léger',
        soins_administres: ['Suture de plaie / Parage'],
        medicaments_urgence: [],
        consommables_utilises: [{ nom: 'Compresse stérile (paquet)', quantite: 2, prix: 3000 }],
        examens_urgents_commandes: []
      })
    })
    if (!triage2Res.ok) {
      console.error('❌ Triage registration 2 failed', await triage2Res.text())
      process.exit(1)
    }
    const triage2Data = await triage2Res.json()
    console.log(`  Triage registered. Total fee: ${triage2Data.facture.montant} GNF, Status: ${triage2Data.facture.statut}`)

    // Verify patient 2 waitlist status is 'en_attente' (Payer d'abord)
    const waitlist2Res = await fetch(base + `/file?date=${todayStr}`, {
      method: 'GET',
      headers: { 'Authorization': 'Bearer ' + chefToken }
    })
    const waitlist2Data = await waitlist2Res.json()
    const patient2Entry = waitlist2Data.file.find(f => Number(f.patientId) === Number(patient2.id))
    if (!patient2Entry) {
      console.error('❌ Patient 2 not found in waitlist')
      process.exit(1)
    }
    console.log(`  Patient 2 queue entry found. Statut: "${patient2Entry.statut}" (Expected: "en_attente")`)
    if (patient2Entry.statut !== 'en_attente') {
      console.error('❌ Expected queue status to be en_attente for payer_d_abord')
      process.exit(1)
    }

    // --- Step 6: Test Inter-Service References ---
    console.log('\nSTEP 6: TEST INTER-SERVICE REFERRALS')
    // Doctor login
    const docLoginRes = await fetch(base + '/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'medecin@clinique.com', mot_de_passe: '1234' })
    })
    if (!docLoginRes.ok) {
      console.error('❌ Doctor login failed', await docLoginRes.text())
      process.exit(1)
    }
    const docToken = (await docLoginRes.json()).token
    console.log('  Doctor login ok.')

    // Doctor refers Patient 1 to Gynécologie
    const referRes = await fetch(base + '/references', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + docToken
      },
      body: JSON.stringify({
        patient_id: patient1.id,
        services_destinataires: ['Gynécologie'],
        motif_reference: 'Avis obstétrical complémentaire',
        priorite: 'Urgente',
        commentaires: 'Suspicion de grossesse extra-utérine'
      })
    })
    if (!referRes.ok) {
      console.error('❌ Refer patient failed', await referRes.text())
      process.exit(1)
    }
    const referData = await referRes.json()
    console.log(`  Referral recorded. Total references: ${referData.references.length}`)
    const refId = referData.references[0].id

    // Chef (who has Gynécologie specialite or we check with Chef Token) lists received references
    console.log('  Retrieve received references for Gynécologie...')
    const receivedRes = await fetch(base + '/references/recues/Gynécologie', {
      method: 'GET',
      headers: { 'Authorization': 'Bearer ' + chefToken }
    })
    if (!receivedRes.ok) {
      console.error('❌ Get received references failed', await receivedRes.text())
      process.exit(1)
    }
    const receivedData = await receivedRes.json()
    const foundRef = receivedData.references.find(r => Number(r.id) === Number(refId))
    if (!foundRef) {
      console.error('❌ Referral not found in received list for Gynécologie')
      process.exit(1)
    }
    console.log(`  Found referral in list. Statut: "${foundRef.statut}" (Expected: "En attente")`)

    // Chef accepts the reference
    console.log(`  Accepting referral ID ${refId}...`)
    const acceptRes = await fetch(base + `/references/${refId}/statut`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + chefToken
      },
      body: JSON.stringify({ statut: 'Acceptée', commentaires_maj: 'Dossier accepté' })
    })
    if (!acceptRes.ok) {
      console.error('❌ Accept referral failed', await acceptRes.text())
      process.exit(1)
    }
    const acceptData = await acceptRes.json()
    console.log(`  Referral status updated to: "${acceptData.reference.statut}"`)

    // Verify patient 1 is in the waitlist for Gynécologie
    const waitlist3Res = await fetch(base + `/file?date=${todayStr}`, {
      method: 'GET',
      headers: { 'Authorization': 'Bearer ' + chefToken }
    })
    const waitlist3Data = await waitlist3Res.json()
    const gyAttente = waitlist3Data.file.find(f => Number(f.patientId) === Number(patient1.id) && f.service === 'Gynécologie')
    if (!gyAttente) {
      console.error('❌ Patient 1 not found in Gynécologie waitlist after reference accepted')
      process.exit(1)
    }
    console.log(`  Patient 1 is in Gynécologie waitlist. Arrivée: ${gyAttente.arrivee}, Motif: "${gyAttente.motif}"`)

    // Trace the patient journey
    console.log('\nSTEP 7: PATIENT JOURNEY LOG (parcours)')
    const journeyRes = await fetch(base + `/references/parcours/${patient1.id}`, {
      method: 'GET',
      headers: { 'Authorization': 'Bearer ' + chefToken }
    })
    if (!journeyRes.ok) {
      console.error('❌ Journey retrieval failed', await journeyRes.text())
      process.exit(1)
    }
    const journeyData = await journeyRes.json()
    console.log('  Journey data retrieved. Number of stages:', journeyData.parcours.length)
    console.log('  Stages list:')
    journeyData.parcours.forEach(p => {
      console.log(`    - Admission: ${p.motif_admission} | Service actuel: ${p.service_actuel} | Statut: ${p.statut}`)
    })

    console.log('\n✅ ALL E2E CHECKS PASSED FOR REFERENCES AND URGENCES! 🎉')
    process.exit(0)

  } catch (err) {
    console.error('❌ Error during E2E checks:', err)
    process.exit(1)
  }
})()
