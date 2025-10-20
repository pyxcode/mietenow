# 🏠 MieteNow

**Finde deine Wohnung schneller** - Der schnellste und einfachste Weg, eine Wohnung in Deutschland zu finden.

## 🚀 Fonctionnalités

### 🔍 **Recherche et Filtrage**
- **Recherche unifiée** : Agrégation d'annonces issues de plusieurs plateformes
- **Filtres avancés** : Prix, pièces, chambres, surface, type, équipement
- **Filtrage intelligent** : Élimination des doublons et fausses annonces
- **Recherche en temps réel** : Résultats instantanés

### 👤 **Authentification et Gestion**
- **Inscription simple** : Processus en 3 étapes (Info → Critères → Confirmation)
- **Authentification sécurisée** : JWT + bcryptjs
- **Profils utilisateurs** : Gestion des critères de recherche personnalisés
- **Abonnements** : Plans Gratuit, Pro, Premium

### 💳 **Paiement et Abonnements**
- **Page de paiement** : Interface moderne et sécurisée
- **Plans flexibles** : Gratuit, Pro (9€/mois), Premium (19€/mois)
- **Garantie** : Satisfait ou remboursé 14 jours

### 📊 **Dashboard et Gestion**
- **Tableau de bord** : Visualisation des annonces avec filtres
- **Gestion des annonces** : Stockage MongoDB avec nettoyage automatique
- **Scripts de maintenance** : Nettoyage des annonces obsolètes

### 🎨 **Interface et UX**
- **Design moderne** : Interface épurée inspirée de runthunter.nl
- **Responsive** : Optimisé pour tous les appareils
- **Animations** : Interactions fluides et engageantes

## 🎨 Design System

### Couleurs
- **Blanc cassé** : `#FAFAFB`
- **Bleu minéral** : `#004AAD`
- **Vert menthe** : `#00BFA6`
- **Gris-bleu** : `#6B7280`
- **Hover bleu foncé** : `#002E73`

### Typographie
- **H1** : Satoshi Bold 56px
- **H2** : Manrope SemiBold 32px
- **Body** : Manrope Regular 18px
- **Labels/UI** : Inter Medium 14px

## 🛠️ Stack Technique

- **Frontend** : Next.js 14 (App Router)
- **Backend** : Next.js API Routes
- **Base de données** : MongoDB avec Mongoose
- **Authentification** : JWT + bcryptjs
- **Styling** : Tailwind CSS
- **Animations** : Framer Motion
- **Icons** : Lucide React
- **TypeScript** : Support complet
- **SEO** : Optimisé pour le référencement

## 📦 Installation

```bash
# Cloner le projet
git clone https://github.com/your-username/mietenow.git
cd mietenow

# Installer les dépendances
npm install

# Configurer les variables d'environnement
cp .env.example .env.local
# Éditer .env.local avec vos clés MongoDB et JWT

# Lancer MongoDB (local ou utiliser MongoDB Atlas)
# Pour MongoDB local : mongod

# Lancer en développement
npm run dev
```

## 🏗️ Structure du Projet

```
mietenow/
├── app/                    # App Router Next.js
│   ├── api/               # API Routes
│   │   ├── auth/          # Authentification
│   │   ├── listings/      # Gestion des annonces
│   │   └── search/        # Recherche
│   ├── dashboard/         # Tableau de bord
│   ├── payment/           # Page de paiement
│   ├── search/            # Page de recherche
│   ├── signup/            # Page d'inscription
│   ├── globals.css        # Styles globaux
│   ├── layout.tsx         # Layout principal
│   └── page.tsx           # Page d'accueil
├── components/            # Composants réutilisables
│   ├── Header.tsx         # Navigation
│   ├── Hero.tsx           # Section héro
│   ├── Features.tsx       # Fonctionnalités
│   ├── Pricing.tsx        # Tarifs
│   └── Footer.tsx         # Pied de page
├── lib/                   # Utilitaires
│   ├── auth.ts            # Authentification
│   ├── mongodb.ts         # Connexion MongoDB
│   └── utils.ts           # Fonctions utilitaires
├── models/                # Modèles Mongoose
│   ├── User.ts            # Modèle utilisateur
│   └── Listing.ts         # Modèle annonce
├── scripts/               # Scripts utilitaires
│   └── cleanup-listings.ts # Nettoyage des annonces
├── types/                 # Types TypeScript
│   └── listing.ts         # Types des annonces
└── public/                # Assets statiques
```

## 🚀 Déploiement

Le projet est optimisé pour le déploiement sur Vercel :

```bash
# Build de production
npm run build

# Démarrage en production
npm start
```

## 📱 Responsive Design

- **Mobile First** : Optimisé pour tous les écrans
- **Breakpoints** : sm, md, lg, xl, 2xl
- **Touch Friendly** : Interface adaptée au tactile

## 🔍 SEO

- **SSR** : Rendu côté serveur pour un meilleur SEO
- **Métadonnées** : Optimisées pour chaque page
- **Performance** : Core Web Vitals optimisés
- **Accessibilité** : Conforme aux standards WCAG

## 📈 Performance

- **Lazy Loading** : Chargement différé des images
- **Code Splitting** : Division automatique du code
- **Optimisation** : Images et assets optimisés
- **Caching** : Stratégie de cache optimale

## 🤝 Contribution

1. Fork le projet
2. Créer une branche feature (`git checkout -b feature/AmazingFeature`)
3. Commit les changements (`git commit -m 'Add some AmazingFeature'`)
4. Push vers la branche (`git push origin feature/AmazingFeature`)
5. Ouvrir une Pull Request

## 📄 Licence

Ce projet est sous licence MIT. Voir le fichier `LICENSE` pour plus de détails.

## 📞 Contact

- **Email** : hello@mietenow.de
- **Website** : https://mietenow.de
- **Twitter** : @mietenow

---

Fait avec ❤️ pour simplifier la recherche d'appartement en Allemagne.
