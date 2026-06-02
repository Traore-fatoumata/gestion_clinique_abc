# 🔄 Réinitialisation de la base de données

Ce dossier contient des scripts pour gérer la base de données de la Clinique ABC Marouane.

## 📋 Commandes disponibles

### 1. Vider toutes les données (`npm run clear`)

Cette commande supprime **toutes les données** de toutes les tables de la base de données, tout en conservant la structure (le schéma). Les séquences (IDs auto-incrémentés) sont également réinitialisées.

```bash
cd clinique-backend
npm run clear
```

**Résultat attendu :**
- Toutes les tables sont vidées
- Les IDs recommencent à 1
- La structure de la base reste intacte

### 2. Remplir avec des données de démonstration (`npm run seed`)

Après avoir vidé la base, vous pouvez la remplir avec des comptes utilisateurs de démonstration et les paramètres de la clinique.

```bash
cd clinique-backend
npm run seed
```

**Ce qui est créé :**
- 23 comptes utilisateurs (secrétaire, médecins, infirmier, labo, comptable, etc.)
- Paramètres de la clinique (noms, tarifs, devise, etc.)
- **Mot de passe par défaut pour tous les comptes : `1234`**

## 🎯 Workflow recommandé pour tester l'application

1. **Vider la base de données :**
   ```bash
   cd clinique-backend
   npm run clear
   ```

2. **Recréer les données de démonstration :**
   ```bash
   npm run seed
   ```

3. **Démarrer le serveur :**
   ```bash
   npm run dev
   ```

4. **Tester l'application** en vous connectant avec l'un des comptes :
   - Secrétaire : `secretaire@clinique.com` / `1234`
   - Médecin chef : `chef@clinique.com` / `1234`
   - Médecin : `medecin@clinique.com` / `1234`
   - Infirmier : `infirmier@clinique.com` / `1234`
   - Labo : `labo@clinique.com` / `1234`
   - Comptable : `comptable@clinique.com` / `1234`

## ⚠️ Avertissements

- **La commande `clear` est destructive** : elle supprime définitivement toutes les données.
- Assurez-vous de ne pas l'exécuter sur une base de données de production contenant des informations importantes.
- Cette commande ne supprime pas le schéma de la base de données, seulement les données.

## 🧹 Nettoyer également le frontend

Par défaut, quand la base de données est vide, l'application frontend affichait des patients de démonstration codés en dur. 

**Depuis la modification du code** (DashboardMedecinChef.jsx ligne 31), l'application n'affiche plus ces données de démonstration. Maintenant, quand vous exécutez `npm run clear`, vous verrez vraiment une application vide.

Si vous voyez encore des données après avoir exécuté `clear`, essayez de :
1. Rafraîchir la page (F5 ou Ctrl+R)
2. Vider le cache du navigateur
3. Vous déconnecter et vous reconnecter

## 📁 Fichiers concernés

- `clear.js` - Script de suppression des données
- `seed.js` - Script de création des données de démonstration
- `sql/01_schema.sql` - Schéma complet de la base de données