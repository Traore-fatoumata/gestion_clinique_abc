# Guide des Formulaires de Consultation par Service Médical

## Vue d'ensemble

Ce projet inclut maintenant des formulaires de consultation spécifiques pour chaque service médical, similaires au formulaire détaillé de gynécologie. Chaque service a ses propres besoins en termes de données cliniques, d'examens et de suivi.

## Structure des Fichiers

### Organisation par Service

Chaque service médical dispose de son propre dossier dans `src/pages/auth/medecin/services/` :

```
src/pages/auth/medecin/services/
├── cardiologie/
│   ├── sharedCardio.jsx          (Constantes: examens, symptômes, etc.)
│   ├── consultationConstants.js  (Constantes du formulaire)
│   └── consultation.jsx          (Composant React du formulaire)
├── pediatrie/
│   ├── sharedPedo.jsx
│   ├── consultationConstants.js
│   └── consultation.jsx
├── diabetologie/
│   ├── sharedDiabeto.jsx
│   ├── consultationConstants.js
│   └── consultation.jsx
├── neurologie/
│   ├── sharedNeuro.jsx
│   ├── consultationConstants.js  (À créer)
│   └── consultation.jsx          (À créer)
└── [autres services...]
```

### Séparation Constants/Composants

Pour éviter les erreurs ESLint "Fast refresh only works when a file only exports components", nous séparons :

1. **consultationConstants.js** : Contient toutes les constantes, valeurs par défaut, et listes
2. **consultation.jsx** : Contient uniquement le composant React

## Services Déjà Implémentés

### 1. Cardiologie (`cardiologie/`)

**Champs spécifiques :**
- Signes vitaux cardiovasculaires (TA, FC, saturation)
- Antécédents cardiaques personnels et familiaux
- Facteurs de risque cardiovasculaire
- Symptômes cardiaques (douleur thoracique, dyspnée, palpitations, etc.)
- Examen clinique cardiovasculaire détaillé
- Examens complémentaires (ECG, échocardiographie, Holter, test d'effort)
- Évaluation fonctionnelle (Classe NYHA)
- Score de risque cardiovasculaire

**Fichiers :**
- `consultationConstants.js` : 85 lignes
- `consultation.jsx` : 485 lignes

### 2. Pédiatrie (`pediatrie/`)

**Champs spécifiques :**
- Données anthropométriques (poids, taille, périmètre crânien pour nourrissons)
- Données de naissance (âge gestationnel, poids de naissance, APGAR)
- Suivi des vaccinations (calendrier PEV Guinée)
- Développement psychomoteur (étapes par âge)
- Alimentation (allaitement, diversification)
- Symptômes pédiatriques spécifiques
- Examen clinique par système

**Fichiers :**
- `consultationConstants.js` : 120 lignes
- `consultation.jsx` : 520 lignes

### 3. Diabétologie (`diabetologie/`)

**Champs spécifiques :**
- Type de diabète et historique
- Surveillance glycémique (HbA1c, glycémies)
- Symptômes d'hypo/hyperglycémie
- Traitement (insuline, antidiabétiques oraux)
- Complications (rétinopathie, néphropathie, neuropathie, pied diabétique)
- Examens de suivi (microalbuminurie, DFG, fond d'œil)
- Mode de vie et éducation thérapeutique

**Fichiers :**
- `consultationConstants.js` : 130 lignes
- `consultation.jsx` : 580 lignes

## Services à Implémenter

### 4. Neurologie (`neurologie/`)

**Champs à prévoir :**
- Évaluation neurologique complète
- Échelles d'évaluation (Glasgow, NIHSS, etc.)
- Symptômes neurologiques spécifiques
- Examens (EEG, EMG, ponction lombaire)
- Suivi des maladies chroniques (épilepsie, Parkinson, etc.)

### 5. Autres Services

- Pneumologie
- Ophtalmologie
- ORL
- Dermatologie
- Traumatologie
- Chirurgie
- Urologie
- Oncologie
- Maladies infectieuses
- Stomatologie

## Comment Intégrer les Formulaires

### Étape 1 : Importer le Formulaire

Dans le composant principal de consultation (`ModalConsultation.jsx`), ajoutez :

```javascript
import ConsultationCardio from './services/cardiologie/consultation.jsx'
import ConsultationPedo from './services/pediatrie/consultation.jsx'
import ConsultationDiabeto from './services/diabetologie/consultation.jsx'
// etc.
```

### Étape 2 : Détecter le Service

Déterminez le service actuel basé sur la spécialité du médecin :

```javascript
const getServiceType = (specialite) => {
  const s = specialite?.toLowerCase() || ''
  if (s.includes('cardio')) return 'cardiologie'
  if (s.includes('pédiatre') || s.includes('pediatre')) return 'pediatrie'
  if (s.includes('diabéto') || s.includes('diabeto')) return 'diabetologie'
  if (s.includes('neuro')) return 'neurologie'
  // etc.
  return 'general'
}
```

### Étape 3 : Afficher le Formulaire Approprié

```javascript
const serviceType = getServiceType(medecin?.specialite)

return (
  <div>
    {serviceType === 'cardiologie' && (
      <ConsultationCardio
        patient={patient}
        consultation={consultation}
        onSave={handleSave}
        onCancel={handleCancel}
      />
    )}
    {serviceType === 'pediatrie' && (
      <ConsultationPedo
        patient={patient}
        consultation={consultation}
        onSave={handleSave}
        onCancel={handleCancel}
      />
    )}
    {serviceType === 'diabetologie' && (
      <ConsultationDiabeto
        patient={patient}
        consultation={consultation}
        onSave={handleSave}
        onCancel={handleCancel}
      />
    )}
    {/* Formulaire par défaut pour les autres services */}
    {serviceType === 'general' && (
      <FormulaireStandard />
    )}
  </div>
)
```

### Étape 4 : Gérer les Données

Les données des formulaires spécifiques doivent être fusionnées avec les données générales de consultation :

```javascript
const handleSave = (donneesSpecifiques) => {
  const consultationComplete = {
    ...donneesGenerales,
    ...donneesSpecifiques,
    service: medecin.specialite,
    dateConsultation: new Date().toISOString(),
  }
  
  // Sauvegarder dans la base de données
  api.saveConsultation(consultationComplete)
}
```

## Base de Données

### Structure Recommandée

```sql
CREATE TABLE consultations (
  id UUID PRIMARY KEY,
  patient_id UUID REFERENCES patients(id),
  medecin_id UUID REFERENCES medecins(id),
  service VARCHAR(50),
  type_consultation VARCHAR(50), -- standard, prenatal, accouchement, etc.
  
  -- Données générales (communes à tous les services)
  motif TEXT,
  plaintes TEXT,
  antecedents TEXT,
  poids DECIMAL(5,2),
  diagnostic_principal TEXT,
  diagnostics_secondaires TEXT,
  examens_commandes JSONB,
  traitements TEXT,
  commentaires TEXT,
  
  -- Données spécifiques au service (JSON)
  donnees_specifiques JSONB, -- Contient toutes les données du formulaire spécialisé
  
  -- Métadonnées
  statut VARCHAR(20), -- en_attente, termine, signe, non_signe
  date_consultation TIMESTAMP,
  date_signature TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

### Exemple de Données Spécifiques (JSON)

Pour la cardiologie :
```json
{
  "taSystolique": 120,
  "taDiastolique": 80,
  "frequenceCardiaque": 72,
  "antecédentsCardiaques": "Infarctus 2020",
  "facteursRisque": ["Hypertension", "Tabagisme"],
  "classeNYHA": "II",
  "ecgFait": true,
  "ecgResultat": "Rythme sinusal, pas d'anomalie",
  "diagnosticPrincipal": "Insuffisance cardiaque stable"
}
```

## Avantages de Cette Approche

1. **Spécificité** : Chaque service a exactement les champs dont il a besoin
2. **Évolutivité** : Facile d'ajouter de nouveaux services
3. **Maintenance** : Code organisé et facile to modify
4. **Expérience utilisateur** : Interface adaptée à chaque spécialité
5. **Données structurées** : Facilité d'analyse et de reporting

## Prochaines Étapes

1. **Implémenter Neurologie** : Créer les fichiers de consultation pour la neurologie
2. **Intégrer dans ModalConsultation** : Modifier le composant principal pour utiliser les formulaires spécifiques
3. **Adapter le Backend** : S'assurer que l'API peut recevoir et stocker les données spécifiques
4. **Tests** : Tester chaque formulaire avec des cas réels
5. **Formation** : Former les médecins à l'utilisation des nouveaux formulaires

## Notes Techniques

- Tous les formulaires utilisent les mêmes composants de base (`RegSection`, `inputSt`, `labelSt`, `Btn`)
- Les constantes sont séparées pour éviter les problèmes de fast-refresh
- Les formulaires sont responsives et s'adaptent aux différentes tailles d'écran
- Validation côté client avant soumission
- Possibilité d'ajouter des champs personnalisés via JSON

## Contribution

Pour ajouter un nouveau service :

1. Créer `consultationConstants.js` avec les valeurs par défaut et listes
2. Créer `consultation.jsx` avec le composant React
3. Mettre à jour `servicesIndex.jsx` pour exporter le nouveau service
4. Tester avec des données réelles
5. Documenter les champs spécifiques dans ce guide