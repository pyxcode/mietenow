#!/usr/bin/env node

/**
 * Vérifier ce qu'il y a dans la base "test"
 */

import { config } from 'dotenv'
config({ path: '.env.local' })

import { MongoClient } from 'mongodb'

const MONGODB_URI = process.env.MONGODB_URI || process.env.MONGODB_URI2

async function checkTestDB() {
  console.log('🔍 Vérification de la base "test"...\n')
  
  if (!MONGODB_URI) {
    console.error('❌ MONGODB_URI non configuré')
    process.exit(1)
  }

  // Construire l'URI pour la base "test"
  let uri = MONGODB_URI
  
  if (uri.includes('mongodb+srv://')) {
    const match = uri.match(/mongodb\+srv:\/\/([^:]+):([^@]+)@([^/]+)\/([^?]+)?(\?.*)?/)
    if (match) {
      const [, username, password, host, database, query] = match
      uri = `mongodb://${username}:${password}@${host}:27017/test${query || ''}`
    }
  } else {
    // Remplacer le nom de base par "test"
    uri = uri.replace(/\/[^\/\?]+(\?|$)/, '/test$1')
    if (!uri.includes('/test')) {
      uri = uri.replace('/?', '/test?').replace(/\/$/, '/test')
    }
  }

  const client = new MongoClient(uri)

  try {
    await client.connect()
    console.log('✅ Connecté à MongoDB (base: test)\n')

    const db = client.db('test')
    
    // Lister les collections
    const collections = await db.listCollections().toArray()
    console.log('📋 Collections dans "test":')
    collections.forEach(col => {
      console.log(`   - ${col.name}`)
    })
    console.log()

    // Compter les users
    if (collections.some(c => c.name === 'users')) {
      const usersCount = await db.collection('users').countDocuments({})
      console.log(`👥 Users dans "test": ${usersCount}`)
      
      if (usersCount > 0) {
        const users = await db.collection('users').find({}).limit(3).toArray()
        console.log('   Exemples:')
        users.forEach(user => {
          console.log(`   - ${user.email} (${user._id})`)
        })
      }
      console.log()
    }

    // Compter les listings
    if (collections.some(c => c.name === 'listings')) {
      const listingsCount = await db.collection('listings').countDocuments({})
      console.log(`📋 Listings dans "test": ${listingsCount}\n`)
    }

    if (collections.some(c => c.name === 'users') && await db.collection('users').countDocuments({}) > 0) {
      console.log('⚠️  ATTENTION: Des utilisateurs sont dans la base "test"!')
      console.log('   Ils doivent être migrés vers "mietenow-prod"\n')
    }

  } catch (error) {
    console.error('❌ Erreur:', error.message)
  } finally {
    await client.close()
    console.log('✅ Déconnecté')
  }
}

checkTestDB().catch(console.error)

