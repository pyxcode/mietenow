# 🚀 Guide de Déploiement Render - Scraping toutes les 5 minutes

## 📋 Configuration Actuelle

Votre configuration Render est maintenant optimisée pour :
- **Scraping toutes les 5 minutes** (`*/5 * * * *`)
- **Envoi des alertes immédiatement** après chaque scraping
- **Nettoyage automatique** des anciennes annonces
- **Vérification des plans** utilisateurs

## 🎯 Étapes de Déploiement

### 1. Préparation

```bash
# 1. Vérifiez que vous êtes dans le bon répertoire
cd /Users/louan/Desktop/PROJETS/mietenow

# 2. Vérifiez que tous vos fichiers sont commités
git status

# 3. Commitez vos modifications si nécessaire
git add .
git commit -m "Configure Render cron jobs - scraping every 5 minutes"
git push origin main
```

### 2. Configuration des Variables d'Environnement

Dans le **Dashboard Render**, configurez ces variables pour chaque cron job :

#### Variables Obligatoires
```
MONGODB_URI=mongodb+srv://louanbardou_db_user:1Hdkkeb8205eE@ac-zdt3xyl-shard-00-01.6srfa0f.mongodb.net/mietenow-prod?retryWrites=true&w=majority
JWT_SECRET=your_jwt_secret
NEXTAUTH_SECRET=your_nextauth_secret
NEXTAUTH_URL=https://your-app.onrender.com
APIKEYSENDGRID=your_sendgrid_api_key
SENDGRID_FROM_EMAIL=noreply@mietenow.com
STRIPE_SECRET_KEY=your_stripe_secret_key
STRIPE_WEBHOOK_SECRET=your_stripe_webhook_secret
CLOUDINARY_URL=your_cloudinary_url
BRIGHT_DATA_USERNAME=your_bright_data_username
BRIGHT_DATA_PASSWORD=your_bright_data_password
BRIGHT_DATA_ENDPOINT=your_bright_data_endpoint
```

### 3. Déploiement Automatique (Recommandé)

#### Option A : Déploiement via Git
```bash
# 1. Connectez votre repo à Render (si pas déjà fait)
# 2. Push vos modifications
git push origin main

# 3. Render déploie automatiquement tous les services
```

#### Option B : Déploiement Manuel
```bash
# 1. Définissez votre clé API Render
export RENDER_API_KEY=your_render_api_key

# 2. Rendez le script exécutable
chmod +x scripts/deploy-render-complete.sh

# 3. Lancez le déploiement
./scripts/deploy-render-complete.sh
```

### 4. Configuration des Cron Jobs

#### Dans le Dashboard Render :

1. **Allez sur chaque cron job** :
   - `mietenow-scraper` (toutes les 5 minutes)
   - `mietenow-cleanup` (quotidien à 2h)
   - `mietenow-plans` (quotidien à 1h)
   - `mietenow-unpaid` (hebdomadaire le lundi)
   - `mietenow-daily-cleanup` (quotidien à 3h)
   - `mietenow-hourly` (toutes les heures)

2. **Configurez les variables d'environnement** pour chaque cron

3. **Testez manuellement** avec One-off Jobs

## 📊 Monitoring et Logs

### Dashboard Render
- **Logs** : Voir les logs de chaque cron job en temps réel
- **Statut** : Vérifier si les crons s'exécutent correctement
- **Historique** : Voir l'historique des exécutions

### Logs Locaux
```bash
# Voir les logs de scraping
tail -f logs/cron-scraping-standalone.log

# Voir les logs d'alertes
tail -f logs/cron-alerts.log
```

## 🔧 Configuration des Cron Jobs

### Schedule Actuel
```yaml
# Scraping toutes les 5 minutes
schedule: "*/5 * * * *"

# Nettoyage quotidien à 2h
schedule: "0 2 * * *"

# Vérification des plans à 1h
schedule: "0 1 * * *"

# Emails impayés le lundi à 9h
schedule: "0 9 * * 1"

# Nettoyage quotidien à 3h
schedule: "0 3 * * *"

# Tâches horaires
schedule: "0 * * * *"
```

### Modification du Schedule
Pour modifier les horaires, éditez `render.yaml` :

```yaml
# Exemple : Scraping toutes les 10 minutes
schedule: "*/10 * * * *"

# Exemple : Scraping toutes les heures
schedule: "0 * * * *"

# Exemple : Scraping 3 fois par jour
schedule: "0 6,12,18 * * *"
```

## 🚨 Gestion des Erreurs

### Logs d'Erreur
- **Dashboard Render** > **Logs** pour chaque cron
- **Email notifications** configurées dans Render
- **Webhooks** pour intégrer avec Slack/Discord

### Debugging
1. **Vérifiez les logs** dans le dashboard
2. **Testez localement** : `node scripts/cron-scraping-standalone.js`
3. **One-off jobs** pour tester manuellement

## 💰 Coûts Estimés

### Plans Render pour Crons
- **Starter** : $0/mois (512 MB RAM, 0.5 CPU) - **GRATUIT**
- **Standard** : $7/mois (2 GB RAM, 1 CPU)
- **Pro** : $25/mois (4 GB RAM, 2 CPU)

### Estimation avec Scraping toutes les 5 minutes
- **6 cron jobs** × **Starter plan** = **$0/mois** (gratuit)
- **Scraping toutes les 5 minutes** = **288 exécutions/jour**
- **Coût estimé** : Gratuit avec le plan Starter

## 🔄 Workflow Complet

### Scraping toutes les 5 minutes
1. **6h00** : Premier scraping de la journée
2. **6h05** : Scraping + envoi des alertes
3. **6h10** : Scraping + envoi des alertes
4. **...** : Continue toutes les 5 minutes
5. **23h55** : Dernier scraping de la journée

### Nettoyage quotidien
1. **2h00** : Nettoyage des anciennes annonces
2. **3h00** : Nettoyage quotidien simple
3. **1h00** : Vérification des plans utilisateurs

## 📞 Support et Dépannage

### Problèmes Courants
1. **Cron ne s'exécute pas** : Vérifiez les variables d'environnement
2. **Erreurs de connexion MongoDB** : Vérifiez `MONGODB_URI`
3. **Emails non envoyés** : Vérifiez `APIKEYSENDGRID`

### Contact Support
- **Documentation Render** : https://render.com/docs
- **Support Render** : Via le dashboard
- **Logs détaillés** : Dashboard > Services > Logs

---

## 🎉 Résultat Final

Une fois configuré, vous aurez :
- ✅ **Scraping automatique toutes les 5 minutes**
- ✅ **Envoi des alertes immédiatement après chaque scraping**
- ✅ **Nettoyage automatique des anciennes annonces**
- ✅ **Monitoring complet via le dashboard Render**
- ✅ **Logs détaillés pour le debugging**
- ✅ **Coût : GRATUIT avec le plan Starter**

**🚀 Votre système de scraping est maintenant entièrement automatisé sur Render !**
