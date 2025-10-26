import mongoose from 'mongoose'

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/mietenow'

// Forcer l'utilisation de la base mietenow-prod pour le cloud
const getMongoUri = () => {
  if (process.env.MONGODB_URI && process.env.MONGODB_URI.includes('mongodb+srv://')) {
    // Convertir mongodb+srv:// vers mongodb:// direct pour éviter les problèmes DNS
    const directUri = 'mongodb://louanbardou_db_user:1Hdkkeb8205eE@ac-zdt3xyl-shard-00-01.6srfa0f.mongodb.net:27017/mietenow-prod?authSource=admin&ssl=true'
    return directUri
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