#!/usr/bin/env node

/**
 * Réinitialiser le mot de passe d'un utilisateur
 * Usage: node scripts/reset-password.js email@example.com nouveauMotDePasse
 */

import { config } from 'dotenv'
config({ path: '.env.local' })

import { MongoClient } from 'mongodb'
import bcrypt from 'bcryptjs'

const [,, email, newPassword] = process.argv

if (!email || !newPassword) {
  console.error('Usage: node scripts/reset-password.js email@example.com nouveauMotDePasse')
  process.exit(1)
}

async function resetPassword() {
  console.log(`🔑 Réinitialisation du mot de passe pour: ${email}\n`)
  
  const MONGODB_URI = process.env.MONGODB_URI2 || process.env.MONGODB_URI
  if (!MONGODB_URI) {
    console.error('❌ MONGODB_URI non configuré')
    process.exit(1)
  }
  
  // Forcer mietenow-prod dans l'URI
  let uri = MONGODB_URI
  if (uri.includes('mongodb+srv://')) {
    const match = uri.match(/mongodb\+srv:\/\/([^:]+):([^@]+)@([^/]+)\/([^?]+)?(\?.*)?/)
    if (match) {
      const [, username, password, host, , query] = match
      const shardHost = process.env.MONGODB_URI2?.match(/@([^:]+):/)?.[1] || host
      uri = `mongodb://${username}:${password}@${shardHost}:27017/mietenow-prod${query || ''}`
    }
  } else {
    const uriMatch = uri.match(/^(mongodb:\/\/[^\/]+)\/?([^?]*)(\?.*)?$/)
    if (uriMatch) {
      const [, baseUri, , query] = uriMatch
      uri = `${baseUri}/mietenow-prod${query || ''}`
    }
  }
  
  try {
    const client = new MongoClient(uri, {
      directConnection: true,
      serverSelectionTimeoutMS: 5000
    })
    await client.connect()
    const db = client.db('mietenow-prod')
    const usersCollection = db.collection('users')
    
    const user = await usersCollection.findOne({ email: email.toLowerCase() })
    
    if (!user) {
      console.error(`❌ Utilisateur non trouvé: ${email}`)
      process.exit(1)
    }
    
    console.log(`✅ Utilisateur trouvé: ${user.email}`)
    
    // Hasher le nouveau mot de passe
    const hashedPassword = await bcrypt.hash(newPassword, 10)
    
    // Mettre à jour le mot de passe
    const result = await usersCollection.updateOne(
      { _id: user._id },
      { $set: { password_hash: hashedPassword } }
    )
    
    if (result.modifiedCount > 0) {
      console.log(`✅ Mot de passe mis à jour avec succès!`)
      console.log(`   Nouveau mot de passe: ${newPassword}`)
    } else {
      console.log(`⚠️ Aucune modification effectuée`)
    }
    
    await client.close()
    console.log('✅ Terminé')
    
  } catch (error) {
    console.error('❌ Erreur:', error.message)
    process.exit(1)
  }
}

resetPassword().catch(console.error)

