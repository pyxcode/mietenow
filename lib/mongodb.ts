import mongoose from 'mongoose'

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/mietenow'

// Forcer l'utilisation de la base mietenow-prod pour le cloud
const getMongoUri = () => {
  if (process.env.MONGODB_URI && process.env.MONGODB_URI.includes('mongodb+srv://')) {
    // Si c'est une URI cloud, ajouter le nom de la base
    const baseUri = process.env.MONGODB_URI.endsWith('/') 
      ? process.env.MONGODB_URI.slice(0, -1) 
      : process.env.MONGODB_URI
    return `${baseUri}/mietenow-prod`
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