# 🏥 Clinique SantéPro — Guide d'intégration Backend

## Structure du projet

```
clinique-backend/
├── src/
│   ├── app.js                        ← Point d'entrée Express
│   ├── config/
│   │   └── db.js                     ← Pool de connexions PostgreSQL
│   ├── controllers/
│   │   └── authController.js         ← Login / Me / Logout / Changer MDP
│   ├── middleware/
│   │   └── auth.js                   ← Vérification JWT + rôles
│   └── routes/
│       └── auth.js                   ← Routes /api/auth/*
├── sql/
│   ├── 01_schema.sql                 ← Schéma complet de la base
│   └── 02_seed.sql                   ← Paramètres clinique
├── frontend/
│   └── useAuth.jsx                   ← Hook React à copier dans votre projet
├── seed.js                           ← Script de création des comptes démo
├── .env.example                      ← Modèle de configuration
└── package.json
```

---

## ① Créer la base PostgreSQL

```bash
# Se connecter à PostgreSQL
psql -U postgres

# Créer la base
CREATE DATABASE clinique_santepro;
\q

# Appliquer le schéma
psql -U postgres -d clinique_santepro -f sql/01_schema.sql
```

---

## ② Configurer l'environnement

```bash
# Copier le fichier exemple
cp .env.example .env

# Éditer .env avec vos informations
nano .env
```

Contenu minimal du `.env` :
```
PORT=5000
DB_HOST=localhost
DB_PORT=5432
DB_NAME=clinique_marouane
DB_USER=postgres
DB_PASSWORD=votre_mot_de_passe_postgres
JWT_SECRET=changez_cette_cle_en_production
JWT_EXPIRES_IN=8h
FRONTEND_URL=http://localhost:5173
```

---

## ③ Installer et démarrer le backend

```bash
npm install
npm run seed     # Crée tous les comptes démo (mot de passe : 1234)
npm run dev      # Démarre le serveur avec rechargement auto
```

Vérifier que tout fonctionne :
```bash
curl http://localhost:5000/api/health
# → {"status":"ok","service":"Clinique ABC Marouane API",...}
```

---

## ④ Intégrer le hook dans votre frontend React

### 1. Créer le fichier `.env` du frontend

Dans le dossier de votre projet React, créez ou éditez `.env` :
```
VITE_API_URL=http://localhost:5000/api
```

### 2. Copier le hook

Copiez `frontend/useAuth.jsx` vers :
```
src/hooks/useAuth.jsx
```

### 3. Envelopper votre app avec AuthProvider

Dans `src/main.jsx` (ou `src/index.jsx`) :
```jsx
import { AuthProvider } from "./hooks/useAuth"

ReactDOM.createRoot(document.getElementById("root")).render(
  <AuthProvider>
    <App />
  </AuthProvider>
)
```

### 4. Votre composant Login fonctionne déjà !

L'interface de `useAuth` est identique à l'ancien hook :
```jsx
const { user, login, logout, loading } = useAuth()

// Login
const result = await login(email, motDePasse)
if (!result.success) setErreur(result.error)
else navigate(result.route)
```

---

## ⑤ Tester l'authentification

```bash
# Test login
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"chef@clinique.com","mot_de_passe":"1234"}'

# Réponse attendue :
# {"success":true,"token":"eyJ...","user":{"id":2,"nom":"Dr. Doumbouya","role":"medecin_chef",...}}
```

---

## Comptes disponibles

| Rôle           | Email                         | Mot de passe |
|----------------|-------------------------------|--------------|
| Secrétaire     | secretaire@clinique.com       | 1234         |
| Médecin Chef   | chef@clinique.com             | 1234         |
| Comptable      | comptable@clinique.com        | 1234         |
| Laboratoire    | labo@clinique.com             | 1234         |
| Infirmier(e)   | infirmier@clinique.com        | 1234         |
| Dr. Camara     | medecin@clinique.com          | 1234         |
| Dr. Barry      | generaliste@clinique.com      | 1234         |
| Dr. Souaré     | pediatre@clinique.com         | 1234         |
| Dr. Keïta      | gynecologue@clinique.com      | 1234         |
| + 10 autres spécialistes…                          |

---

## Prochaines étapes — API à implémenter

Une fois l'auth validée, les prochains modules sont :

1. **`/api/patients`** — CRUD patients + recherche
2. **`/api/file`** — File d'attente du jour (secrétaire / médecin chef)
3. **`/api/consultations`** — Créer, signer, lister
4. **`/api/paiements`** — Consultation + examens (comptabilité)
5. **`/api/rdv`** — Rendez-vous médecins
6. **`/api/labo`** — Demandes + résultats laboratoire
7. **`/api/soins`** — Soins infirmiers
8. **`/api/notifications`** — Notifications médecins en temps réel
9. **`/api/parametres`** — Paramètres clinique (tarifs, nom, etc.)

---

## Architecture des tokens JWT

Le payload JWT contient :
```json
{
  "id": 2,
  "email": "chef@clinique.com",
  "nom": "Dr. Doumbouya",
  "role": "medecin_chef",
  "specialite": "Médecine générale",
  "titre": "Médecin Chef"
}
```

La durée de session est de **8h** (configurable dans `.env` via `JWT_EXPIRES_IN`).
