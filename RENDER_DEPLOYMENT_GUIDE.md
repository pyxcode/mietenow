# 🚀 Guide de Déploiement Render - MieteNow

## 📋 Prérequis

- ✅ Compte GitHub
- ✅ Compte Render (gratuit)
- ✅ Base de données MongoDB Atlas
- ✅ Comptes services (Stripe, SendGrid, Cloudinary, Bright Data)

## 🎯 Étapes de Déploiement

### 1️⃣ **Préparer le Code**

```bash
# Vérifier que tout est prêt
cd /Users/louan/Desktop/PROJETS/mietenow

# Vérifier les fichiers essentiels
ls -la package.json render.yaml env-template.txt
```

### 2️⃣ **Initialiser Git (si pas déjà fait)**

```bash
# Initialiser Git
git init

# Ajouter tous les fichiers
git add .

# Premier commit
git commit -m "🚀 Initial commit - Ready for Render deployment"
```

### 3️⃣ **Créer un Dépôt GitHub Privé**

1. Aller sur [GitHub.com](https://github.com)
2. Cliquer "New Repository"
3. Nom : `mietenow-production`
4. ✅ Cocher "Private"
5. ✅ Cocher "Add README"
6. Cliquer "Create repository"

### 4️⃣ **Connecter le Code à GitHub**

```bash
# Ajouter le remote GitHub
git remote add origin https://github.com/VOTRE_USERNAME/mietenow-production.git

# Pousser le code
git branch -M main
git push -u origin main
```

### 5️⃣ **Configurer les Variables d'Environnement**

**Copier le template :**
```bash
cp env-template.txt .env.local
```

**Remplir `.env.local` avec vos vraies valeurs :**
```bash
# Base de données
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/mietenow

# Authentification
JWT_SECRET=your-super-secret-jwt-key-here
NEXTAUTH_SECRET=your-nextauth-secret
NEXTAUTH_URL=https://mietenow.onrender.com

# Email
APIKEYSENDGRID=your-sendgrid-api-key
SENDGRID_FROM_EMAIL=noreply@mietenow.de

# Paiements
NEXT_PUBLIC_STRIPE_API=pk_live_your_stripe_publishable_key
STRIPE_SECRET_KEY=sk_live_your_stripe_secret_key
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret

# Images
CLOUDINARY_URL=cloudinary://api_key:api_secret@cloud_name

# Scraping
BRIGHT_DATA_USERNAME=your-username
BRIGHT_DATA_PASSWORD=your-password
BRIGHT_DATA_ENDPOINT=your-endpoint
```

### 6️⃣ **Déployer sur Render**

#### 🌐 **Service Web Principal**

1. Aller sur [render.com](https://render.com)
2. Cliquer "New +" → "Web Service"
3. Connecter GitHub → Choisir `mietenow-production`
4. Configuration :
   - **Name** : `mietenow-web`
   - **Environment** : `Node`
   - **Build Command** : `npm install && npm run build`
   - **Start Command** : `npm start`
   - **Plan** : `Starter` (gratuit)

#### 🔄 **Cron Jobs Automatiques**

**Scraping (3x/jour) :**
1. "New +" → "Cron Job"
2. **Name** : `mietenow-scraper`
3. **Schedule** : `0 6,12,18 * * *`
4. **Build Command** : `npm install`
5. **Start Command** : `npm run scrape`

**Nettoyage (1x/jour) :**
1. "New +" → "Cron Job"
2. **Name** : `mietenow-cleanup`
3. **Schedule** : `0 2 * * *`
4. **Build Command** : `npm install`
5. **Start Command** : `npm run cleanup:prod`

**Alertes (2x/jour) :**
1. "New +" → "Cron Job"
2. **Name** : `mietenow-alerts`
3. **Schedule** : `0 8,20 * * *`
4. **Build Command** : `npm install`
5. **Start Command** : `npm run alerts`

**Plans (1x/jour) :**
1. "New +" → "Cron Job"
2. **Name** : `mietenow-plans`
3. **Schedule** : `0 1 * * *`
4. **Build Command** : `npm install`
5. **Start Command** : `npm run plans`

### 7️⃣ **Configurer les Variables d'Environnement sur Render**

Pour **chaque service** (web + cron jobs) :

1. Aller dans le service → "Environment"
2. Ajouter toutes les variables de `.env.local`
3. **Important** : Utiliser les clés de **production** (pas de test)

### 8️⃣ **Tester le Déploiement**

```bash
# Vérifier que l'application fonctionne
curl https://mietenow.onrender.com

# Vérifier les logs
# Aller dans Render → Service → Logs
```

## 🔧 **Commandes Utiles**

### **Développement Local**
```bash
npm run dev          # Démarrer en dev
npm run build        # Build de production
npm run start        # Démarrer en production
```

### **Scripts de Maintenance**
```bash
npm run scrape       # Scraping manuel
npm run cleanup:prod # Nettoyage manuel
npm run alerts       # Envoyer alertes
npm run plans        # Vérifier plans
npm run geocode      # Géocoder annonces
```

### **Gestion des Utilisateurs**
```bash
npm run change-password  # Changer mot de passe utilisateur
```

## 📊 **Monitoring**

### **Logs Render**
- Aller dans chaque service → "Logs"
- Surveiller les erreurs et performances

### **Métriques Importantes**
- ✅ **Web Service** : Uptime, Response time
- ✅ **Scraper** : Nombre d'annonces scrapées
- ✅ **Cleanup** : Anciennes annonces supprimées
- ✅ **Alerts** : Emails envoyés
- ✅ **Plans** : Utilisateurs vérifiés

## 🚨 **Dépannage**

### **Erreurs Communes**

**Build Failed :**
```bash
# Vérifier les dépendances
npm install
npm run build
```

**Database Connection :**
```bash
# Vérifier MONGODB_URI
echo $MONGODB_URI
```

**Stripe Errors :**
```bash
# Vérifier les clés Stripe
# Utiliser les clés LIVE en production
```

### **Logs Importants**
- **Web Service** : Erreurs 500, timeouts
- **Scraper** : Erreurs de scraping, rate limits
- **Cleanup** : Erreurs de suppression
- **Alerts** : Erreurs d'envoi email

## 🎯 **Résultat Final**

Après déploiement, vous aurez :

- ✅ **Application web** : `https://mietenow.onrender.com`
- ✅ **Scraping automatique** : 3x/jour
- ✅ **Nettoyage automatique** : 1x/jour
- ✅ **Alertes automatiques** : 2x/jour
- ✅ **Vérification plans** : 1x/jour

**🚀 Votre application MieteNow sera 100% opérationnelle sur Render !**
