# Clinique SantéPro - Système de Gestion Médicale Professionnel

Un système de gestion complet pour cliniques médicales, développé avec React et Node.js.

![Statut](https://img.shields.io/badge/statut-production-brightgreen)
![Version](https://img.shields.io/badge/version-1.0.0-blue)
![License](https://img.shields.io/badge/license-propriétaire-red)

## 🏥 Fonctionnalités

### Modules par Rôle

| Rôle | Description |
|------|-------------|
| **Secrétaire** | Accueil patients, gestion file d'attente, rendez-vous, notifications |
| **Médecin Chef** | Consultations, orientation vers spécialistes, statistiques, gestion personnel |
| **Médecin** | Consultations patients, prescriptions, historique médical |
| **Laborantin** | Résultats d'examens, suivi analyses |
| **Infirmier** | Soins infirmiers, administration traitements |
| **Comptable** | Paiements, facturation, statistiques financières |

### Fonctionnalités Générales

- ✅ **Gestion des Patients** - Dossiers médicaux électroniques complets
- ✅ **Rendez-vous** - Système de réservation et rappels
- ✅ **File d'Attente** - Gestion dynamique des patients en attente
- ✅ **Consultations** - Dossiers de consultation avec diagnostics et traitements
- ✅ **Examens** - Prescription et suivi des examens complémentaires
- ✅ **Facturation** - Système de paiement avec tarification par âge
- ✅ **Statistiques** - Tableaux de bord et rapports détaillés
- ✅ **Notifications** - Alerts en temps réel pour chaque service
- ✅ **Multi-utilisateurs** - Rôles et permissions sécurisés

## 🛠️ Technologies

### Frontend
- **React 18** - Interface utilisateur réactive
- **React Router 6** - Navigation SPA
- **Vite** - Build tool moderne et rapide
- **Tailwind CSS** - Styles utilitaires

### Backend
- **Node.js** - Serveur d'application
- **Express.js** - Framework web
- **PostgreSQL** - Base de données relationnelle
- **JWT** - Authentification sécurisée

## 📦 Installation

### Prérequis

- Node.js 18+ 
- PostgreSQL 14+
- npm ou yarn

### 1. Cloner le dépôt

```bash
git clone https://github.com/votre-organisation/clinique-santepro.git
cd gestion_clinique
```

### 2. Configuration de la Base de Données

```bash
# Créer la base de données
createdb clinique_marouane

# Exécuter le schéma
psql clinique_marouane < clinique-backend/sql/01_schema.sql
psql clinique_marouane < clinique-backend/sql/03_migrations.sql
```

### 3. Installation Backend

```bash
cd clinique-backend
npm install

# Configurer les variables d'environnement
cp .env.example .env
# Éditer .env avec vos paramètres (DB, JWT_SECRET, etc.)

# Démarrer le serveur
npm start
```

### 4. Installation Frontend

```bash
cd ../gestion_clinique
npm install

# Démarrer le serveur de développement
npm run dev

# Build de production
npm run build
```

## 🔧 Configuration

### Variables d'Environnement

#### Backend (.env)
```env
PORT=3001
DB_HOST=localhost
DB_PORT=5432
DB_NAME=clinique_santepro
DB_USER=postgres
DB_PASSWORD=votre_mot_de_passe
JWT_SECRET=votre_secret_jwt_tres_long
```

#### Frontend (.env)
```env
VITE_API_URL=http://localhost:3001/api
```

### Tarifs par Défaut

| Catégorie | Tarif (GNF) |
|-----------|-------------|
| Nourrisson (< 5 ans) | 30 000 |
| Enfant (5-14 ans) | 35 000 |
| Adulte (15-60 ans) | 50 000 |
| Senior (> 60 ans) | 40 000 |

## 📱 Utilisation

### Connexion

1. Accédez à `http://localhost:5173`
2. Identifiants par défaut (après seed) :
   - **Secrétaire** : `secretaire@clinique.com` / `password`
   - **Médecin Chef** : `chef@clinique.com` / `password`
   - **Médecin** : `medecin@clinique.com` / `password`
   - **Comptable** : `comptable@clinique.com` / `password`

### Workflow Typique

1. **Secrétaire** enregistre un nouveau patient
2. Patient rejoint la **file d'attente**
3. **Médecin Chef** consulte le patient en premier
4. Si nécessaire, orientation vers un **spécialiste**
5. **Médecin** complète la consultation
6. **Comptable** encaisse les paiements
7. **Laborantin** ajoute les résultats d'examens si prescrits

## 🏗️ Architecture

```
gestion_clinique/
├── gestion_clinique/          # Frontend React
│   ├── src/
│   │   ├── components/        # Composants réutilisables
│   │   ├── pages/             # Pages par rôle
│   │   ├── hooks/             # Custom hooks
│   │   ├── theme/             # Thème professionnel
│   │   └── api.js             # Configuration API
│   └── package.json
│
└── clinique-backend/          # Backend Node.js
    ├── src/
    │   ├── controllers/       # Logique métier
    │   ├── routes/            # Routes API
    │   ├── middleware/        # Auth, validation
    │   └── config/            # Configuration DB
    ├── sql/                   # Schémas et migrations
    └── package.json
```

## 🔒 Sécurité

- **Authentification JWT** avec expiration
- **Hachage des mots de passe** avec bcrypt
- **Validation des entrées** côté serveur
- **Protection CORS** configurée
- **HTTPS** recommandé en production

## 📊 API Endpoints

### Authentification
```
POST   /api/auth/login          - Connexion
POST   /api/auth/logout         - Déconnexion
GET    /api/auth/me             - Profil utilisateur
```

### Patients
```
GET    /api/patients            - Liste des patients
POST   /api/patients            - Créer un patient
GET    /api/patients/:id        - Détails patient
PUT    /api/patients/:id        - Modifier patient
```

### Consultations
```
GET    /api/consultations       - Liste consultations
POST   /api/consultations       - Créer consultation
PUT    /api/consultations/:id   - Modifier consultation
```

### Rendez-vous
```
GET    /api/rdv                 - Liste rendez-vous
POST   /api/rdv                 - Créer rendez-vous
DELETE /api/rdv/:id             - Annuler rendez-vous
```

## 🧪 Tests

```bash
# Backend tests
cd clinique-backend
npm test

# Frontend tests
cd gestion_clinique
npm test
```

## 🚀 Déploiement

### Production Frontend

```bash
npm run build
# Déployer le dossier dist/ sur votre serveur web
```

### Production Backend

```bash
# Utiliser PM2 pour la gestion du processus
npm install -g pm2
cd clinique-backend
pm2 start src/app.js --name clinique-api
pm2 save
pm2 startup
```

### Docker (Optionnel)

```bash
# Construire et lancer avec Docker Compose
docker-compose up -d
```

## 🤝 Contribution

1. Fork le projet
2. Créer une branche feature (`git checkout -b feature/amélioration`)
3. Commit les changements (`git commit -m 'Ajout fonctionnalité'`)
4. Push vers la branche (`git push origin feature/amélioration`)
5. Ouvrir une Pull Request

## 📄 License

Ce projet est la propriété exclusive de la Clinique Marouane. Toute reproduction ou distribution non autorisée est interdite.

## 📞 Support

Pour toute question ou assistance technique :

- **Email** : support@cliniquemarouane.com
- **Téléphone** : +224 624 00 00 00
- **Adresse** : Tannerie, Kaloum, Conakry, Guinée

---

**Développé avec ❤️ pour la Clinique Marouane**