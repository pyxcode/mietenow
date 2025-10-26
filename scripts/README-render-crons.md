# 🚀 Migration des Crons vers Render

Ce guide vous explique comment migrer tous vos scripts cron vers Render.

## 📋 Scripts Cron Actuels

Vos scripts cron actuels :
- `cron-scraping-standalone.js` - Scraping des annonces (3x/jour)
- `cron-cleanup-standalone.js` - Nettoyage des anciennes annonces (quotidien)
- `cron-send-alerts.js` - Envoi des alertes (2x/jour)
- `cron-check-plans.js` - Vérification des plans (quotidien)
- `cron-send-unpaid.js` - Emails de paiement impayé (hebdomadaire)
- `cron-daily-cleanup.js` - Nettoyage quotidien simple
- `cron-hourly-simple.js` - Tâches horaires

## 🎯 Configuration Render

### 1. Fichier `render.yaml` ✅

Le fichier `render.yaml` est déjà configuré avec tous vos cron jobs :

```yaml
services:
  # Application web
  - type: web
    name: mietenow-web
    # ... configuration web

  # Cron jobs
  - type: cron
    name: mietenow-scraper
    schedule: "0 6,12,18 * * *"  # 6h, 12h, 18h
    startCommand: node scripts/cron-scraping-standalone.js

  - type: cron
    name: mietenow-cleanup
    schedule: "0 2 * * *"  # 2h du matin
    startCommand: node scripts/cron-cleanup-standalone.js

  # ... autres cron jobs
```

### 2. Déploiement

#### Option A : Déploiement automatique via Git
1. **Connectez votre repo** à Render
2. **Push** vos modifications : `git push origin main`
3. **Render déploie automatiquement** tous les services

#### Option B : Déploiement manuel
```bash
# Définir votre clé API
export RENDER_API_KEY=your_api_key

# Déployer via le script
chmod +x scripts/deploy-render.sh
./scripts/deploy-render.sh
```

## 🔧 Configuration des Variables d'Environnement

Dans le **Dashboard Render**, configurez ces variables pour chaque cron job :

### Variables Obligatoires
- `MONGODB_URI` - Connexion MongoDB
- `JWT_SECRET` - Clé JWT
- `NEXTAUTH_SECRET` - Clé NextAuth
- `APIKEYSENDGRID` - Clé SendGrid
- `SENDGRID_FROM_EMAIL` - Email expéditeur
- `STRIPE_SECRET_KEY` - Clé Stripe
- `STRIPE_WEBHOOK_SECRET` - Secret webhook
- `CLOUDINARY_URL` - URL Cloudinary
- `BRIGHT_DATA_USERNAME` - Username Bright Data
- `BRIGHT_DATA_PASSWORD` - Password Bright Data
- `BRIGHT_DATA_ENDPOINT` - Endpoint Bright Data

### Configuration dans Render Dashboard
1. **Allez sur chaque cron job**
2. **Settings > Environment Variables**
3. **Ajoutez toutes les variables** listées ci-dessus

## 📊 Monitoring des Crons

### Dashboard Render
- **Logs** : Voir les logs de chaque cron job
- **Statut** : Vérifier si les crons s'exécutent
- **Historique** : Voir l'historique des exécutions

### Logs en Temps Réel
```bash
# Via l'API Render
curl -H "Authorization: Bearer $RENDER_API_KEY" \
  "https://api.render.com/v1/services/CRON_SERVICE_ID/logs"
```

## 🚨 Gestion des Erreurs

### Logs d'Erreur
- **Dashboard Render** > **Logs** pour chaque cron
- **Email notifications** configurées dans Render
- **Webhooks** pour intégrer avec Slack/Discord

### Debugging
1. **Vérifiez les logs** dans le dashboard
2. **Testez localement** : `node scripts/cron-xxx.js`
3. **One-off jobs** pour tester manuellement

## 💰 Coûts

### Plans Render pour Crons
- **Starter** : $0/mois (512 MB RAM, 0.5 CPU)
- **Standard** : $7/mois (2 GB RAM, 1 CPU)
- **Pro** : $25/mois (4 GB RAM, 2 CPU)

### Estimation des Coûts
- **6 cron jobs** × **Starter plan** = **$0/mois** (gratuit)
- **6 cron jobs** × **Standard plan** = **$42/mois**

## 🔄 Migration Step-by-Step

### Étape 1 : Préparation
```bash
# Vérifiez que tous vos scripts fonctionnent
node scripts/cron-scraping-standalone.js
node scripts/cron-cleanup-standalone.js
# ... testez tous les scripts
```

### Étape 2 : Déploiement
```bash
# Push vers Git (si déploiement auto)
git add .
git commit -m "Configure Render cron jobs"
git push origin main

# OU déploiement manuel
./scripts/deploy-render.sh
```

### Étape 3 : Configuration
1. **Dashboard Render** > **Services**
2. **Configurez les variables d'environnement** pour chaque cron
3. **Testez manuellement** avec One-off Jobs

### Étape 4 : Monitoring
1. **Vérifiez les logs** après la première exécution
2. **Configurez les notifications** d'erreur
3. **Surveillez les performances**

## 🎯 Avantages de Render Crons

### ✅ Avantages
- **Gestion centralisée** de tous les crons
- **Monitoring intégré** avec logs et métriques
- **Scaling automatique** selon les besoins
- **Variables d'environnement** sécurisées
- **Notifications** d'erreur automatiques
- **One-off jobs** pour tests manuels

### 🔧 Fonctionnalités Avancées
- **Retry automatique** en cas d'échec
- **Timeout configurables** par cron job
- **Logs persistants** avec recherche
- **Métriques de performance** détaillées
- **Intégration Slack/Discord** pour notifications

## 📞 Support

Si vous rencontrez des problèmes :
1. **Vérifiez les logs** dans le dashboard Render
2. **Testez localement** vos scripts
3. **Consultez la documentation** Render
4. **Contactez le support** Render si nécessaire

---

**🎉 Une fois configuré, Render gérera automatiquement tous vos crons !**
