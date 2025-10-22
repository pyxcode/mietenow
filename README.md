# 🏠 MieteNow - Plateforme de Recherche Immobilière

## 🚀 Déploiement Rapide sur Render

### ⚡ **Déploiement en 5 Minutes**

```bash
# 1. Cloner le projet
git clone https://github.com/VOTRE_USERNAME/mietenow-production.git
cd mietenow-production

# 2. Copier le template d'environnement
cp env-template.txt .env.local

# 3. Remplir les variables dans .env.local
# 4. Déployer sur Render avec render.yaml
```

### 📋 **Structure du Projet**

```
mietenow/
├── app/                    # Next.js App Router
├── components/             # Composants React
├── lib/                    # Utilitaires et services
├── scripts/               # Scripts de maintenance
├── package.json           # Dépendances et scripts
├── render.yaml            # Configuration Render
├── env-template.txt        # Template variables d'environnement
└── RENDER_DEPLOYMENT_GUIDE.md  # Guide de déploiement
```

### 🔧 **Scripts Disponibles**

```bash
npm run dev              # Développement local
npm run build            # Build de production
npm run start            # Démarrer en production
npm run scrape           # Scraping manuel
npm run cleanup:prod     # Nettoyage manuel
npm run alerts           # Envoyer alertes
npm run plans            # Vérifier plans
npm run geocode          # Géocoder annonces
npm run change-password  # Changer mot de passe
```

### 🌐 **Services Render**

- **Web Service** : Application Next.js principale
- **Cron Scraper** : Scraping automatique (3x/jour)
- **Cron Cleanup** : Nettoyage automatique (1x/jour)
- **Cron Alerts** : Alertes automatiques (2x/jour)
- **Cron Plans** : Vérification plans (1x/jour)

### 🔐 **Variables d'Environnement Requises**

Voir `env-template.txt` pour la liste complète des variables nécessaires.

### 📖 **Documentation**

- [Guide de Déploiement](RENDER_DEPLOYMENT_GUIDE.md) - Instructions détaillées
- [Configuration Render](render.yaml) - Services et cron jobs
- [Template Variables](env-template.txt) - Variables d'environnement

### 🛠️ **Technologies**

- **Frontend** : Next.js 14, React, TypeScript, Tailwind CSS
- **Backend** : Next.js API Routes, MongoDB, Stripe
- **Maps** : Leaflet, React-Leaflet
- **Scraping** : Puppeteer, Cheerio
- **Email** : SendGrid
- **Images** : Cloudinary
- **Deployment** : Render

### 🚀 **Déploiement**

1. Suivre le [Guide de Déploiement](RENDER_DEPLOYMENT_GUIDE.md)
2. Configurer les variables d'environnement
3. Déployer sur Render avec `render.yaml`
4. Tester l'application

**🎯 Résultat : Application 100% opérationnelle sur Render !**