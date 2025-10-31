import mongoose from 'mongoose'

const MONGODB_URI = process.env.MONGODB_URI || process.env.MONGODB_URI2 || 'mongodb://louanbardou_db_user:1Hdkkeb8205eE@ac-zdt3xyl-shard-00-00.6srfa0f.mongodb.net:27017/?authSource=admin&ssl=true&directConnection=true'
const DB_NAME = 'mietenow-prod'

// Fonction pour obtenir l'URI MongoDB avec la bonne base de données
// IMPORTANT: Force toujours mietenow-prod, ignore tout autre nom de base dans l'URI
const getMongoUri = () => {
  if (!MONGODB_URI) {
    throw new Error('MONGODB_URI environment variable is not defined')
  }
  
  let uri = MONGODB_URI
  
  // Si c'est une URI mongodb+srv://, la convertir en mongodb:// direct
  if (uri.includes('mongodb+srv://')) {
    const match = uri.match(/mongodb\+srv:\/\/([^:]+):([^@]+)@([^/]+)\/([^?]+)?(\?.*)?/)
    if (match) {
      const [, username, password, host, database, query] = match
      // TOUJOURS utiliser mietenow-prod, ignorer le database de l'URI
      uri = `mongodb://${username}:${password}@${host}:27017/${DB_NAME}${query || ''}`
    }
  } else {
    // Pour mongodb://, extraire la base URI et forcer mietenow-prod
    const uriMatch = uri.match(/^(mongodb:\/\/[^\/]+)\/?([^?]*)(\?.*)?$/)
    if (uriMatch) {
      const [, baseUri, existingDb, query] = uriMatch
      // TOUJOURS utiliser mietenow-prod, ignorer existingDb (même si c'est "test")
      uri = `${baseUri}/${DB_NAME}${query || ''}`
    } else {
      // Fallback: remplacer n'importe quelle base de données par mietenow-prod
      uri = uri.replace(/\/[^\/\?]+(\?|$)/, `/${DB_NAME}$1`)
      if (!uri.includes(`/${DB_NAME}`)) {
        if (uri.includes('/?')) {
          uri = uri.replace('/?', `/${DB_NAME}?`)
        } else if (uri.endsWith('/')) {
          uri = uri + DB_NAME
        } else {
          uri = uri + '/' + DB_NAME
        }
      }
    }
  }
  
  // Vérification finale: s'assurer qu'on n'utilise JAMAIS "test"
  if (uri.includes('/test')) {
    uri = uri.replace('/test', `/${DB_NAME}`)
  }
  
  return uri
}

if (!MONGODB_URI) {
  throw new Error('Please define the MONGODB_URI environment variable inside .env.local')
}

/**
 * Global is used here to maintain a cached connection across hot reloads
 * in development. This prevents connections growing exponentially
 * during API Route usage.
 */
let cached = global.mongoose

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null }
}

async function connectDB() {
  if (cached.conn) {
    console.log('🔄 Utilisation de la connexion MongoDB en cache')
    return cached.conn
  }

  if (!cached.promise) {
    const opts = {
      bufferCommands: false,
    }

    const uri = getMongoUri()
    console.log('🔗 Connexion à MongoDB - URI:', uri.replace(/:[^:@]+@/, ':****@')) // Masquer le mot de passe
    console.log('🔗 Base de données forcée:', DB_NAME)
    cached.promise = mongoose.connect(uri, opts) as any
  }

  try {
    cached.conn = await cached.promise
    const dbName = (cached.conn as any)?.db?.databaseName || mongoose.connection.db?.databaseName || 'unknown'
    console.log(`✅ Connecté à MongoDB - Base: ${dbName}`)
    if (dbName !== DB_NAME) {
      console.error(`⚠️ ATTENTION: Base de données incorrecte! Attendu: ${DB_NAME}, Obtenu: ${dbName}`)
      // Forcer l'utilisation de la bonne base
      mongoose.connection.useDb(DB_NAME)
      console.log(`✅ Base de données changée pour: ${DB_NAME}`)
    }
  } catch (e) {
    cached.promise = null
    throw e
  }

  return cached.conn
}

export { connectDB }
export default connectDB