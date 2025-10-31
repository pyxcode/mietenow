/**
 * MongoDB Client Helper
 * Force toujours l'utilisation de mietenow-prod, ignore "test" ou tout autre nom de base
 */

import { MongoClient } from 'mongodb'

const DB_NAME = 'mietenow-prod'

/**
 * Crée une URI MongoDB qui force toujours l'utilisation de mietenow-prod
 * Ignore complètement le nom de base de données dans l'URI originale
 */
export function forceMongoUri(originalUri: string | undefined): string {
  if (!originalUri) {
    throw new Error('MONGODB_URI environment variable is not defined')
  }

  let uri = originalUri

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
    console.warn(`⚠️ URI contenait "test", remplacé par "${DB_NAME}"`)
  }

  return uri
}

/**
 * Crée un client MongoDB connecté à mietenow-prod
 */
export async function createMongoClient(): Promise<MongoClient> {
  const MONGODB_URI = process.env.MONGODB_URI || process.env.MONGODB_URI2
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

