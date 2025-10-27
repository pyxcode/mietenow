import mongoose from 'mongoose'

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://louanbardou_db_user:1Hdkkeb8205eE@ac-zdt3xyl-shard-00-00.6srfa0f.mongodb.net:27017/?authSource=admin&ssl=true&directConnection=true'

// Fonction pour obtenir l'URI MongoDB
const getMongoUri = () => {
  if (!MONGODB_URI) {
    throw new Error('MONGODB_URI environment variable is not defined')
  }
  
  // Utiliser l'URI directe si disponible, sinon convertir mongodb+srv
  if (MONGODB_URI.includes('mongodb://')) {
    return MONGODB_URI
  }
  
  // Si c'est une URI mongodb+srv://, la convertir en mongodb:// direct pour éviter les problèmes DNS
  if (MONGODB_URI.includes('mongodb+srv://')) {
    // Extraire les composants de l'URI
    const match = MONGODB_URI.match(/mongodb\+srv:\/\/([^:]+):([^@]+)@([^/]+)\/([^?]+)(\?.*)?/)
    if (match) {
      const [, username, password, host, database, query] = match
      // Convertir en URI direct (utilise le premier shard disponible)
      const directUri = `mongodb://${username}:${password}@${host}:27017/${database}${query || ''}`
      return directUri
    }
  }
  
  return MONGODB_URI
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
    console.log('🔗 Connexion à MongoDB:', uri)
    cached.promise = mongoose.connect(uri, opts) as any
  }

  try {
    cached.conn = await cached.promise
    console.log('✅ Connecté à MongoDB - Base:', (cached.conn as any)?.db?.databaseName || 'unknown')
  } catch (e) {
    cached.promise = null
    throw e
  }

  return cached.conn
}

export { connectDB }
export default connectDB