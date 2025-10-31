/**
 * MongoDB Client Helper
 * Force toujours l'utilisation de mietenow-prod
 */

import { MongoClient } from 'mongodb'

const DB_NAME = 'mietenow-prod'

/**
 * Crée une URI MongoDB qui force toujours l'utilisation de mietenow-prod
 */
export function forceMongoUri(originalUri: string | undefined): string {
  if (!originalUri) {
    throw new Error('MONGODB_URI environment variable is not defined')
  }

  let uri = originalUri

  // Convertir mongodb+srv:// en mongodb:// si nécessaire
  if (uri.includes('mongodb+srv://')) {
    const match = uri.match(/mongodb\+srv:\/\/([^:]+):([^@]+)@([^/]+)\/([^?]+)?(\?.*)?/)
    if (match) {
      const [, username, password, host, , query] = match
      // Utiliser le hostname du shard si disponible
      const shardHost = process.env.MONGODB_URI2?.replace(/^['"]|['"]$/g, '').match(/@([^:]+):/)?.[1] || host
      // Retirer directConnection=true pour permettre la connexion au replica set
      const cleanQuery = (query || '').replace(/[?&]directConnection=[^&]*/gi, '')
      uri = `mongodb://${username}:${password}@${shardHost}:27017/${DB_NAME}${cleanQuery || ''}`
    }
  } else {
    // Pour mongodb://, extraire la base URI et forcer mietenow-prod
    const uriMatch = uri.match(/^(mongodb:\/\/[^\/]+)\/?([^?]*)(\?.*)?$/)
    if (uriMatch) {
      const [, baseUri, , query] = uriMatch
      uri = `${baseUri}/${DB_NAME}${query || ''}`
    }
  }

  return uri
}

/**
 * Crée un client MongoDB connecté à mietenow-prod
 */
export async function createMongoClient(): Promise<MongoClient> {
  // Préférer MONGODB_URI2 qui est déjà en mongodb:// direct avec le bon hostname
  const MONGODB_URI = process.env.MONGODB_URI2 || process.env.MONGODB_URI
  const forcedUri = forceMongoUri(MONGODB_URI)
  
  console.log(`🔗 Connexion MongoDB forcée vers: ${DB_NAME}`)
  
  const client = new MongoClient(forcedUri)
  await client.connect()
  
  // Vérification: utiliser la base spécifiée dans l'URI
  // Note: client.db(DB_NAME) crée juste un objet Db, la vraie connexion est dans l'URI
  console.log(`✅ Connecté à MongoDB - Base forcée: ${DB_NAME}`)
  console.log(`🔗 URI utilisée: ${forcedUri.replace(/:[^:@]+@/, ':****@')}`) // Masquer le mot de passe
  
  return client
}

/**
 * Obtient la collection "listings" de mietenow-prod
 */
export async function getListingsCollection() {
  const client = await createMongoClient()
  return {
    client,
    db: client.db(DB_NAME),
    collection: client.db(DB_NAME).collection('listings')
  }
}

/**
 * Obtient une collection spécifique de mietenow-prod
 */
export async function getCollection(collectionName: string) {
  const client = await createMongoClient()
  return {
    client,
    db: client.db(DB_NAME),
    collection: client.db(DB_NAME).collection(collectionName)
  }
}

