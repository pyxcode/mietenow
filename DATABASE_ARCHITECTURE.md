# 🗄️ Architecture de la Base de Données MieteNow

## 📋 Vue d'ensemble

Cette documentation décrit l'architecture de la base de données MongoDB pour la plateforme MieteNow, une application de recherche d'appartements à Berlin.

## 🔗 Connexion

- **MongoDB Atlas** (cloud) ou **MongoDB local**
- **Mongoose ODM** pour la gestion des modèles
- **Connexion optimisée** avec cache pour éviter les reconnexions multiples

## 📊 Modèles de Données

### 🧑‍💼 User (Utilisateurs)
```typescript
{
  _id: ObjectId,
  first_name: String,
  last_name: String,
  email: String (unique),
  password_hash: String,
  plan: "Free" | "Premium" | "Pro",
  subscription_status: "active" | "expired" | "canceled",
  search_preferences: {
    city: String,
    max_price: Number,
    type: String,
    surface_min: Number
  },
  created_at: Date,
  last_login: Date
}
```

**Fonctionnalités :**
- Validation email automatique
- Index sur email, plan, subscription_status
- Méthodes : `hasPaidPlan()`, `isSubscriptionActive()`
- Virtual : `full_name`

### 🏠 Listing (Annonces)
```typescript
{
  _id: ObjectId,
  title: String,
  description: String,
  price: Number,
  location: String,
  district: String,
  surface: Number,
  rooms: Number,
  type: "studio" | "apartment" | "WG" | "house",
  images: [String],
  url_source: String,
  source_name: String,
  scraped_at: Date,
  is_active: Boolean,
  available_from: Date,
  owner_id: ObjectId (optionnel),
  created_at: Date
}
```

**Fonctionnalités :**
- Validation des URLs d'images
- Index composés pour recherches complexes
- Virtual : `price_per_sqm`
- Méthodes : `isRecent()`, `isAvailable()`
- Méthode statique : `findByCriteria()`

### 💳 Transaction (Paiements)
```typescript
{
  _id: ObjectId,
  user_id: ObjectId,
  stripe_id: String (unique),
  plan: String,
  amount: Number,
  currency: "EUR" | "USD" | "GBP",
  payment_status: "pending" | "completed" | "failed",
  created_at: Date,
  expires_at: Date
}
```

**Fonctionnalités :**
- Intégration Stripe
- Gestion des abonnements
- Méthodes : `isExpired()`, `isValid()`, `getDaysRemaining()`
- Méthodes statiques : `findActiveByUserId()`, `getRevenueStats()`

### 🔔 Alert (Notifications)
```typescript
{
  _id: ObjectId,
  user_id: ObjectId,
  title: String,
  criteria: {
    city: String,
    type: String,
    max_price: Number,
    min_surface: Number
  },
  frequency: "hourly" | "daily",
  last_triggered_at: Date,
  active: Boolean,
  created_at: Date
}
```

**Fonctionnalités :**
- Système de notifications personnalisées
- Méthodes : `shouldTrigger()`, `markAsTriggered()`
- Méthodes statiques : `findReadyToTrigger()`, `findMatchingAlerts()`

## 🚀 Utilisation

### Import des modèles
```typescript
import { User, Listing, Transaction, Alert } from '@/models'
import connectDB from '@/lib/mongodb'

// Connexion à la DB
await connectDB()

// Utilisation des modèles
const user = await User.findById(userId)
const listings = await Listing.findByCriteria({ city: 'Berlin', maxPrice: 1200 })
```

### API Routes
```typescript
// app/api/users/route.ts
import { User } from '@/models'
import connectDB from '@/lib/mongodb'

export async function GET() {
  await connectDB()
  const users = await User.find()
  return NextResponse.json(users)
}
```

## 🔍 Index et Performance

### Index créés automatiquement :
- **User** : email, plan, subscription_status
- **Listing** : location, district, price, type, is_active, created_at
- **Transaction** : user_id, stripe_id, payment_status, expires_at
- **Alert** : user_id, active, frequency, criteria.city

### Index composés pour requêtes complexes :
- Listing : `{ location: 1, type: 1, price: 1, is_active: 1 }`
- Transaction : `{ user_id: 1, payment_status: 1, expires_at: 1 }`
- Alert : `{ active: 1, criteria.city: 1, criteria.type: 1 }`

## 🧪 Test de la Base de Données

### Endpoint de test
```bash
GET /api/test-db
# Retourne les statistiques de la DB

POST /api/test-db
# Crée un utilisateur de test
```

### Variables d'environnement requises
```env
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/mietenow
```

## 📈 Évolutions Futures

### Fonctionnalités prévues :
- **Système de favoris** pour les annonces
- **Historique de recherche** des utilisateurs
- **Système de notation** des annonces
- **Chat en temps réel** avec les propriétaires
- **Analytics avancées** pour les performances

### Optimisations possibles :
- **Sharding** pour la scalabilité
- **Cache Redis** pour les requêtes fréquentes
- **Index géospatiaux** pour la recherche par proximité
- **Archivage automatique** des anciennes annonces

## 🔒 Sécurité

- **Validation stricte** des données d'entrée
- **Hachage des mots de passe** (bcrypt recommandé)
- **Sanitisation** des URLs et contenus
- **Rate limiting** sur les API routes
- **Audit trail** pour les transactions sensibles

---

*Cette architecture est conçue pour être évolutive et performante, adaptée aux besoins d'une plateforme de location d'appartements moderne.*
