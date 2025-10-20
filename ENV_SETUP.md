# 🔧 Configuration des Variables d'Environnement - MieteNow

## 📁 Structure des Fichiers d'Environnement

```
mietenow/
├── .env.local          # Variables locales (développement)
├── .env.development    # Variables de développement
├── .env.production     # Variables de production
├── .env.example        # Template des variables
└── .gitignore          # Protection des fichiers sensibles
```

## 🚀 Configuration Rapide

### 1. Variables Locales (Développement)
```bash
# Copiez .env.example vers .env.local
cp .env.example .env.local

# Éditez .env.local avec vos vraies valeurs
nano .env.local
```

### 2. Génération de Clés Sécurisées
```bash
# Générez des clés JWT et NextAuth sécurisées
node scripts/generate-secrets.js
```

### 3. Configuration par Environnement

#### 🏠 Développement Local
- **Fichier** : `.env.local`
- **URL** : `http://localhost:3000`
- **Base de données** : MongoDB Atlas (cluster dev)
- **Stripe** : Clés de test (`pk_test_`, `sk_test_`)

#### 🧪 Développement
- **Fichier** : `.env.development`
- **URL** : `http://localhost:3000`
- **Base de données** : MongoDB Atlas (cluster dev)
- **Stripe** : Clés de test

#### 🚀 Production
- **Fichier** : `.env.production`
- **URL** : `https://mietenow.vercel.app`
- **Base de données** : MongoDB Atlas (cluster prod)
- **Stripe** : Clés live (`pk_live_`, `sk_live_`)

## 🔐 Variables Requises

### Base de Données
```bash
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/mietenow
```

### Authentification
```bash
JWT_SECRET=your-super-secret-jwt-key-here
NEXTAUTH_SECRET=your-nextauth-secret
NEXTAUTH_URL=http://localhost:3000  # ou https://mietenow.vercel.app
```

### Email (Mailgun)
```bash
MAILGUN_API_KEY=your-mailgun-api-key
MAILGUN_DOMAIN=your-mailgun-domain
MAILGUN_FROM_EMAIL=noreply@mietenow.de
```

### Paiements (Stripe)
```bash
# Test
STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_SECRET_KEY=sk_test_...

# Production
STRIPE_PUBLISHABLE_KEY=pk_live_...
STRIPE_SECRET_KEY=sk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...
```

### Scraping (Bright Data)
```bash
BRIGHT_DATA_USERNAME=your-username
BRIGHT_DATA_PASSWORD=your-password
BRIGHT_DATA_ENDPOINT=your-endpoint
```

### Configuration App
```bash
NODE_ENV=development  # ou production
NEXT_PUBLIC_APP_URL=http://localhost:3000  # ou https://mietenow.vercel.app
```

## 🛡️ Sécurité

### ✅ À FAIRE
- ✅ Utilisez des clés différentes pour chaque environnement
- ✅ Gardez vos clés secrètes et ne les partagez jamais
- ✅ Utilisez des clés de test pour le développement
- ✅ Activez 2FA sur tous vos comptes de service

### ❌ À ÉVITER
- ❌ Ne commitez jamais de fichiers `.env*` (sauf `.env.example`)
- ❌ N'utilisez pas les mêmes clés en dev et prod
- ❌ Ne partagez pas vos clés dans des messages ou emails
- ❌ N'utilisez pas de clés de production en local

## 🚀 Déploiement

### Vercel
1. Allez dans Vercel Dashboard → Settings → Environment Variables
2. Ajoutez toutes les variables de `.env.production`
3. Redéployez votre application

### MongoDB Atlas
1. Créez un cluster séparé pour la production
2. Configurez les IPs autorisées
3. Créez un utilisateur dédié
4. Copiez la connection string

## 🔧 Commandes Utiles

```bash
# Vérifier les variables d'environnement
npm run dev  # Charge .env.local automatiquement

# Générer de nouvelles clés
node scripts/generate-secrets.js

# Vérifier la configuration
echo $NODE_ENV
echo $NEXT_PUBLIC_APP_URL
```

## 📞 Support

Si vous avez des questions sur la configuration :
- 📧 Email : hello@mietenow.de
- 📚 Documentation : [Next.js Environment Variables](https://nextjs.org/docs/basic-features/environment-variables)
- 🔐 Sécurité : [Vercel Environment Variables](https://vercel.com/docs/concepts/projects/environment-variables)
