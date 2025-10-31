#!/usr/bin/env node

/**
 * Delete Test Database Script
 * 
 * Supprime complètement la base de données "test" de MongoDB
 * 
 * Usage: node scripts/delete-test-database.js
 */

import { config } from 'dotenv'
config({ path: '.env.local' })

import { MongoClient } from 'mongodb'

const MONGODB_URI = process.env.MONGODB_URI || process.env.MONGODB_URI2

// Forcer l'URI pour utiliser mietenow-prod (mais on se connecte d'abord pour lister les DBs)
function getMongoUriForAdmin() {
  if (!MONGODB_URI) {
    throw new Error('MONGODB_URI not configured')
  }
  
  // Pour lister les bases de données, on a besoin de se connecter sans base spécifique
  // On retire le nom de base de l'URI
  let uri = MONGODB_URI
  
  if (uri.includes('mongodb+srv://')) {
    const match = uri.match(/mongodb\+srv:\/\/([^:]+):([^@]+)@([^/]+)\/([^?]+)?(\?.*)?/)
    if (match) {
      const [, username, password, host, database, query] = match
      uri = `mongodb://${username}:${password}@${host}:27017/admin${query || ''}`
    }
  } else {
    // Retirer le nom de base, utiliser admin pour les opérations admin
    uri = uri.replace(/\/[^\/\?]+(\?|$)/, '/admin$1')
    if (uri.includes('/?')) {
      uri = uri.replace('/?', '/admin?')
    }
  }
  
  return uri
}

async function deleteTestDatabase() {
  console.log('🗑️  Suppression de la base de données "test"...\n')

  if (!MONGODB_URI) {
    console.error('❌ MONGODB_URI not configured')
    process.exit(1)
  }

  // Se connecter à la base admin pour pouvoir lister et supprimer des bases
  const adminUri = getMongoUriForAdmin()
  const client = new MongoClient(adminUri)

  try {
    await client.connect()
    console.log('✅ Connecté à MongoDB\n')

    // Lister toutes les bases de données
    const adminDb = client.db().admin()
    const dbs = await adminDb.listDatabases()
    
    console.log('📋 Bases de données trouvées:')
    dbs.databases.forEach(db => {
      console.log(`   - ${db.name} (${(db.sizeOnDisk / 1024 / 1024).toFixed(2)} MB)`)
    })
    console.log()

    // Vérifier si "test" existe
    const testDbExists = dbs.databases.some(db => db.name === 'test')
    
    if (!testDbExists) {
      console.log('✅ La base "test" n\'existe pas - rien à supprimer')
      return
    }

    console.log('⚠️  ATTENTION: Vous êtes sur le point de supprimer la base "test"')
    console.log('   Cette action est IRRÉVERSIBLE!\n')
    console.log('   Appuyez sur Ctrl+C pour annuler, ou attendez 5 secondes...\n')
    
    await new Promise(resolve => setTimeout(resolve, 5000))

    // Supprimer la base "test"
    const testDb = client.db('test')
    await testDb.dropDatabase()
    
    console.log('✅ Base de données "test" supprimée avec succès!')
    
    // Vérifier à nouveau
    const dbsAfter = await adminDb.listDatabases()
    const stillExists = dbsAfter.databases.some(db => db.name === 'test')
    
    if (stillExists) {
      console.log('⚠️  La base "test" existe toujours - peut-être qu\'elle n\'était pas vide?')
    } else {
      console.log('✅ Confirmation: La base "test" n\'existe plus')
    }

  } catch (error) {
    console.error('❌ Erreur:', error.message)
    process.exit(1)
  } finally {
    await client.close()
    console.log('\n✅ Déconnecté de MongoDB')
  }
}

deleteTestDatabase().catch(console.error)

