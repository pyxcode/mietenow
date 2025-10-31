# Configuration MongoDB Atlas - Whitelist IP

## Problème
Erreur : "Could not connect to any servers in your MongoDB Atlas cluster. One common reason is that you're trying to access the database from an IP that isn't whitelisted."

## Solution 1 : Ajouter ton IP actuelle (Recommandé)

1. Va sur https://cloud.mongodb.com/
2. Connecte-toi à ton compte
3. Sélectionne ton cluster (`mietenow-cluster` ou similaire)
4. Clique sur **"Network Access"** dans le menu de gauche
5. Clique sur **"Add IP Address"**
6. Tu as deux options :
   - **"Add Current IP Address"** - Ajoute automatiquement ton IP actuelle
   - **"Allow Access from Anywhere"** - Autorise toutes les IPs (0.0.0.0/0) ⚠️ Moins sécurisé mais pratique pour le dev

## Solution 2 : Autoriser toutes les IPs (Pour développement uniquement)

⚠️ **ATTENTION** : Cette méthode est moins sécurisée mais pratique pour le développement.

1. Va sur https://cloud.mongodb.com/
2. Sélectionne ton cluster
3. Clique sur **"Network Access"**
4. Clique sur **"Add IP Address"**
5. Dans "Access List Entry", entre : `0.0.0.0/0`
6. Clique sur **"Confirm"**

Cela autorise l'accès depuis n'importe quelle IP (utile pour les déploiements Render/Vercel).

## Vérification

Après avoir ajouté ton IP, attends 1-2 minutes pour que les changements prennent effet, puis :

1. Essaie à nouveau : `http://localhost:3001/debug-db`
2. Ou teste la connexion :
   ```bash
   node scripts/change-password.js
   ```

## Pour Render/Vercel

Si tu déploies sur Render ou Vercel, tu dois autoriser leurs IPs ou utiliser `0.0.0.0/0` car leurs IPs peuvent changer.

