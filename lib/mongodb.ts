import mongoose from 'mongoose'

const DB_NAME = 'mietenow-prod'

// Obtenir l'URI et FORCER mietenow-prod
function getMongoUri(): string {
  // Préférer MONGODB_URI2 qui est en mongodb:// direct avec le bon hostname
  let uri = process.env.MONGODB_URI2 || process.env.MONGODB_URI
  
  if (!uri) {
    throw new Error('MONGODB_URI or MONGODB_URI2 environment variable is not defined')
  }
  
  // ENLEVER les quotes si présentes (bug dans .env.local)
  uri = uri.trim().replace(/^['"]|['"]$/g, '')
  
  // Convertir mongodb+srv:// en mongodb:// si nécessaire
  if (uri.includes('mongodb+srv://')) {
    const match = uri.match(/mongodb\+srv:\/\/([^:]+):([^@]+)@([^/]+)\/([^?]+)?(\?.*)?/)
    if (match) {
      const [, username, password, host, , query] = match
      // Utiliser le hostname du shard si disponible, sinon utiliser MONGODB_URI2
      const shardHost = process.env.MONGODB_URI2?.replace(/^['"]|['"]$/g, '').match(/@([^:]+):/)?.[1] || host
      uri = `mongodb://${username}:${password}@${shardHost}:27017/${DB_NAME}${query || ''}`
    }
  } else {
    // Pour mongodb://, extraire la base URI et forcer mietenow-prod
    const uriMatch = uri.match(/^(mongodb:\/\/[^\/]+)\/?([^?]*)(\?.*)?$/)
    if (uriMatch) {
      const [, baseUri, , query] = uriMatch
      uri = `${baseUri}/${DB_NAME}${query || ''}`
    }
  }
  
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
  
  return uri
}

// Cache de connexion globale - FORCER le reset si nécessaire
let cached = global.mongoose

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null }
}

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

  // Si on a une promesse en cours, attendre qu'elle se termine
  if (cached.promise) {
    try {
      await cached.promise
    } catch (e) {
      // Si la promesse a échoué, reset
      cached.promise = null
      cached.conn = null
    }
  }

  // Si on a encore une connexion après avoir attendu, vérifier
  if (cached.conn && mongoose.connection.readyState === 1) {
    const currentDb = mongoose.connection.db?.databaseName
    if (currentDb === DB_NAME) {
      return cached.conn
    }
  }

  // Créer une nouvelle connexion
  if (!cached.promise) {
    const uri = getMongoUri()
    
    console.log(`🔗 Connexion MongoDB vers: ${DB_NAME}`)
    console.log(`   URI: ${uri.replace(/:[^:@]+@/, ':****@')}`)
    
    // CRÉER UNE NOUVELLE CONNEXION avec des options explicites
    cached.promise = mongoose.connect(uri, {
      dbName: DB_NAME,  // Forcer le nom de la base dans les options
      bufferCommands: false,
    } as mongoose.ConnectOptions).then(() => {
      // Après connexion, FORCER l'utilisation de mietenow-prod
      const db = mongoose.connection.db
      if (db && db.databaseName !== DB_NAME) {
        console.warn(`⚠️ Base après connexion: ${db.databaseName}, utilisation de useDb(${DB_NAME})`)
        mongoose.connection.useDb(DB_NAME)
      }
      return mongoose.connection
    }) as any
  }

  try {
    cached.conn = await cached.promise
    
    // VÉRIFICATION STRICTE : S'assurer qu'on utilise bien mietenow-prod
    // Mongoose peut parfois ignorer dbName si l'URI contient une autre base
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
  } catch (e: any) {
    cached.promise = null
    cached.conn = null
    console.error(`❌ Erreur de connexion MongoDB: ${e.message}`)
    throw e
  }

  return cached.conn
}

export { connectDB }
export default connectDB
