(async () => {
  try {
    const base = 'http://localhost:5000/api'
    console.log('LOGIN')
    const loginRes = await fetch(base + '/auth/login', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'secretaire@clinique.com', mot_de_passe: '1234' })
    })
    const loginText = await loginRes.text()
    console.log('LOGIN STATUS', loginRes.status)
    console.log('LOGIN BODY', loginText)
    if (!loginRes.ok) process.exit(2)
    const login = JSON.parse(loginText)
    const token = login.token
    if (!token) { console.error('No token'); process.exit(3) }

    console.log('CREATE PATIENT')
    const patientRes = await fetch(base + '/patients', {
      method: 'POST', headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + token },
      body: JSON.stringify({ nom: 'Test Patient', date_naissance: '1990-01-01', sexe: 'F', telephone: '612345678', quartier: 'Ratoma', secteur: 'Kaloum', profession: 'Etudiant', responsable: 'Mamadou' })
    })
    const patientText = await patientRes.text()
    console.log('PATIENT STATUS', patientRes.status)
    console.log('PATIENT BODY', patientText)
    if (!patientRes.ok) process.exit(4)
    const patient = JSON.parse(patientText)

    console.log('ADD TO FILE')
    const fileRes = await fetch(base + '/file', {
      method: 'POST', headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + token },
      body: JSON.stringify({ patient_id: patient.patient.id, type_visite: 'consultation', montant_consultation: 50000 })
    })
    const fileText = await fileRes.text()
    console.log('FILE STATUS', fileRes.status)
    console.log('FILE BODY', fileText)
    if (!fileRes.ok) process.exit(5)

    console.log('OK')
    process.exit(0)
  } catch (err) {
    console.error('ERR', err)
    process.exit(1)
  }
})();
