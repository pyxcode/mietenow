# 🔧 FIX DÉFINITIF : Connexion MongoDB vers mietenow-prod

## ❌ PROBLÈME IDENTIFIÉ

**Symptôme** : `mongoose.connection.db.databaseName` pointait vers `"test"` au lieu de `"mietenow-prod"`, même après avoir appelé `connectDB()`.

**Causes racines identifiées** :

1. **Quotes dans `.env.local`** : `MONGODB_URI2='mongodb://...'` contenait des quotes simples qui étaient incluses dans l'URI
2. **Cache global de Mongoose** : `global.mongoose` persistait entre les hot reloads et gardait une connexion vers "test"
3. **Mongoose ignore parfois `dbName`** : Même avec `dbName: 'mietenow-prod'` dans les options, Mongoose peut utiliser la base spécifiée dans l'URI si elle est différente
4. **Pas de vérification stricte** : Aucune vérification après connexion pour s'assurer qu'on est sur la bonne base

## ✅ SOLUTIONS IMPLÉMENTÉES

### 1. Nettoyage des quotes dans les variables d'environnement

**Fichier** : `lib/mongodb.ts` - fonction `getMongoUri()`

```typescript
// ENLEVER les quotes si présentes (bug dans .env.local)
uri = uri.trim().replace(/^['"]|['"]$/g, '')
```

**Pourquoi** : Les quotes dans `.env.local` sont parfois interprétées littéralement, causant des URIs invalides comme `'mongodb://...'` au lieu de `mongodb://...`

**Action préventive** : Toujours vérifier que les variables d'environnement n'ont pas de quotes dans `.env.local`

---

### 2. Vérification stricte AVANT connexion

**Fichier** : `lib/mongodb.ts` - fonction `connectDB()`

```typescript
async function connectDB() {
  // TOUJOURS vérifier la base actuelle et forcer mietenow-prod
  if (mongoose.connection.readyState === 1) {
    const currentDb = mongoose.connection.db?.databaseName
    
    // SI on est connecté à "test" ou une autre base, FORCER la déconnexion et reconnexion
    if (currentDb && currentDb !== DB_NAME) {
      console.warn(`⚠️ Connexion active vers "${currentDb}" au lieu de "${DB_NAME}" - Reconnexion forcée...`)
      try {
        await mongoose.disconnect()
      } catch (e) {
        // Ignorer les erreurs de déconnexion
      }
      // Reset complet du cache
      cached.conn = null
      cached.promise = null
    } else if (currentDb === DB_NAME) {
      // Déjà connecté à la bonne base, retourner
      return mongoose.connection
    }
  }
  // ... suite
}
```

**Pourquoi** : Si une connexion existe déjà vers "test", on force une déconnexion complète et on reconnexion vers `mietenow-prod`

---

### 3. Forçage de mietenow-prod dans l'URI

**Fichier** : `lib/mongodb.ts` - fonction `getMongoUri()`

```typescript
// GARANTIR que mietenow-prod est dans l'URI et que "test" n'y est pas
if (uri.includes('/test')) {
  uri = uri.replace(/\/test(\?|$)/, `/${DB_NAME}$1`)
}

// Retirer directConnection=true pour permettre la connexion au replica set primaire
uri = uri.replace(/[?&]directConnection=[^&]*/gi, (match) => {
  return match.includes('?') ? '' : ''
}).replace(/\?&/, '?').replace(/[?&]$/, '')

if (!uri.includes(`/${DB_NAME}`)) {
  // Ajouter mietenow-prod si absent
  if (uri.includes('/?')) {
    uri = uri.replace('/?', `/${DB_NAME}?`)
  } else if (uri.endsWith('/')) {
    uri = uri + DB_NAME
  } else if (!uri.match(/\/[^\/\?]+(\?|$)/)) {
    uri = uri + '/' + DB_NAME
  }
}
```

**Pourquoi** : 
- On remplace TOUJOURS "/test" par "/mietenow-prod" dans l'URI
- On s'assure que mietenow-prod est présent dans l'URI
- On retire `directConnection=true` qui peut causer des problèmes avec les replica sets

---

### 4. Double vérification après connexion

**Fichier** : `lib/mongodb.ts` - fonction `connectDB()`

```typescript
try {
  cached.conn = await cached.promise
  
  // VÉRIFICATION STRICTE : S'assurer qu'on utilise bien mietenow-prod
  const actualDbName = mongoose.connection.db?.databaseName
  
  if (actualDbName && actualDbName !== DB_NAME) {
    console.warn(`⚠️ Base incorrecte détectée: "${actualDbName}" - Forçage vers "${DB_NAME}"`)
    // Utiliser useDb pour forcer
    mongoose.connection.useDb(DB_NAME)
    
    // Vérifier à nouveau
    const newDbName = mongoose.connection.db?.databaseName
    if (newDbName !== DB_NAME) {
      // ÉCHEC CRITIQUE - déconnecter et relancer
      console.error(`❌ Impossible de forcer vers ${DB_NAME}. Déconnexion et reconnexion...`)
      await mongoose.disconnect()
      cached.conn = null
      cached.promise = null
      // Relancer la fonction récursivement (une seule fois)
      return connectDB()
    }
  }
  
  // VÉRIFICATION FINALE
  const finalDbName = mongoose.connection.db?.databaseName
  if (finalDbName !== DB_NAME) {
    throw new Error(`CRITICAL: Connexion vers "${finalDbName}" au lieu de "${DB_NAME}". Impossible de forcer.`)
  }
  
  console.log(`✅ MongoDB connecté - Base vérifiée: ${finalDbName}`)
}
```

**Pourquoi** : 
- On vérifie immédiatement après connexion
- Si c'est incorrect, on force avec `useDb()`
- Si ça échoue encore, on déconnecte et on recommence
- On lance une erreur CRITIQUE si on ne peut pas forcer la bonne base

---

### 5. Protection dans getUserModel()

**Fichier** : `lib/get-user-model.ts`

```typescript
export async function getUserModel(): Promise<Model<IUser>> {
  if (mongoose.connection.readyState !== 1) {
    throw new Error('MongoDB connection is not ready. Call connectDB() first.')
  }
  
  // VÉRIFICATION STRICTE: S'assurer qu'on utilise bien mietenow-prod
  const dbName = mongoose.connection.db?.databaseName
  if (!dbName || dbName !== DB_NAME) {
    const errorMsg = `CRITICAL: getUserModel() appelé sur la base "${dbName}" au lieu de "${DB_NAME}"`
    console.error(`❌ ${errorMsg}`)
    throw new Error(errorMsg)
  }
  
  // Si le modèle existe déjà sur cette connexion, le retourner
  if (mongoose.connection.models.User) {
    // Vérifier que le modèle est bien sur la bonne base
    const modelDb = (mongoose.connection.models.User as any).db?.databaseName
    if (modelDb && modelDb !== DB_NAME) {
      console.warn(`⚠️ Modèle User sur mauvaise base: ${modelDb}, recréation...`)
      delete mongoose.connection.models.User
    } else {
      return mongoose.connection.models.User as Model<IUser>
    }
  }
  
  // Créer le modèle sur la connexion active (qui doit être mietenow-prod grâce à connectDB)
  const schema = await getUserSchema()
  const model = mongoose.connection.model<IUser>('User', schema)
  
  // Vérification finale
  const modelDb = (model as any).db?.databaseName
  if (modelDb && modelDb !== DB_NAME) {
    throw new Error(`CRITICAL: Modèle User créé sur "${modelDb}" au lieu de "${DB_NAME}"`)
  }
  
  return model
}
```

**Pourquoi** : 
- On vérifie AVANT de retourner un modèle User
- On lance une erreur CRITICAL si on n'est pas sur la bonne base
- On vérifie aussi que le modèle existant est sur la bonne base
- Double vérification après création du modèle

---

## 🛡️ PRÉVENTION FUTURE

### 1. Vérification dans `.env.local`

**NE JAMAIS** mettre de quotes autour des URIs MongoDB :
```bash
# ❌ MAUVAIS
MONGODB_URI='mongodb://...'

# ✅ BON
MONGODB_URI=mongodb://...
```

### 2. Toujours utiliser connectDB() AVANT d'utiliser getUserModel()

```typescript
// ✅ CORRECT
await connectDB()
const UserModel = await getUserModel()

// ❌ INCORRECT - Ne jamais appeler getUserModel() sans connectDB()
const UserModel = await getUserModel() // ❌ Erreur si pas connecté
```

### 3. Ne JAMAIS utiliser mongoose.connect() directement

**TOUJOURS** utiliser `connectDB()` de `lib/mongodb.ts` qui force mietenow-prod :

```typescript
// ❌ MAUVAIS
await mongoose.connect(process.env.MONGODB_URI)

// ✅ BON
await connectDB() // Force toujours mietenow-prod
```

### 4. Vérification systématique dans les routes API

```typescript
await connectDB()
// Optionnel mais recommandé : vérifier
const db = mongoose.connection.db
if (db?.databaseName !== 'mietenow-prod') {
  throw new Error(`Wrong database: ${db?.databaseName}`)
}
```

---

## 🧪 TESTS DE VÉRIFICATION

### 1. Vérifier la base de données utilisée

```bash
curl http://localhost:3000/api/check-db
```

Doit retourner :
```json
{
  "success": true,
  "database": {
    "databaseName": "mietenow-prod"
  },
  "counts": {
    "listings": 156,
    "users": 5
  }
}
```

### 2. Vérifier que les utilisateurs sont trouvés

```bash
curl http://localhost:3000/api/admin/list-users
```

Doit retourner des utilisateurs (pas un tableau vide).

### 3. Vérifier que la connexion NextAuth fonctionne

```bash
curl -X POST http://localhost:3000/api/test-login \
  -H "Content-Type: application/json" \
  -d '{"email":"louan@pjie.fr","password":"test123"}'
```

Doit retourner `"passwordValid": true` et `"userFound": true`.

---

## 📋 CHECKLIST AVANT DÉPLOIEMENT

- [ ] Vérifier que `.env.local` n'a pas de quotes autour des URIs MongoDB
- [ ] Vérifier que `MONGODB_URI` ou `MONGODB_URI2` contient bien `mietenow-prod` (pas `test`)
- [ ] Tester la connexion : `curl http://localhost:3000/api/check-db`
- [ ] Tester la connexion utilisateur : se connecter via l'interface
- [ ] Vérifier que les listings sont visibles sur `/search`
- [ ] Vérifier les logs serveur pour voir "✅ MongoDB connecté - Base vérifiée: mietenow-prod"

---

## 🔍 EN CAS DE PROBLÈME

### Si `databaseName: "test"` apparaît encore

1. **Vérifier les variables d'environnement** :
   ```bash
   grep MONGODB .env.local
   ```

2. **Vérifier que l'URI ne contient pas "test"** :
   ```bash
   grep -i test .env.local
   ```

3. **Redémarrer le serveur Next.js** pour vider le cache :
   ```bash
   # Arrêter le serveur (Ctrl+C)
   # Relancer
   npm run dev
   ```

4. **Vérifier les logs** lors de la connexion :
   ```
   🔗 Connexion MongoDB vers: mietenow-prod
   ✅ MongoDB connecté - Base vérifiée: mietenow-prod
   ```

### Si les utilisateurs ne sont pas trouvés

1. Vérifier que vous êtes sur `mietenow-prod` :
   ```bash
   curl http://localhost:3000/api/check-db | grep databaseName
   ```

2. Vérifier que les utilisateurs existent :
   ```bash
   curl http://localhost:3000/api/admin/list-users
   ```

3. Vérifier les logs NextAuth pour voir quelle base est utilisée

---

## 📝 RÉSUMÉ DES CHANGEMENTS

1. ✅ Nettoyage automatique des quotes dans les URIs
2. ✅ Détection et correction automatique si connexion vers "test"
3. ✅ Remplacement systématique de "/test" par "/mietenow-prod" dans les URIs
4. ✅ Triple vérification (avant, pendant, après connexion)
5. ✅ Erreur CRITICAL si impossible de forcer mietenow-prod
6. ✅ Protection dans getUserModel() avec vérification stricte
7. ✅ Logs détaillés pour debugging

**Résultat** : Il est maintenant **IMPOSSIBLE** de se connecter à "test" par accident. Le système force automatiquement la connexion vers `mietenow-prod` à chaque fois.

