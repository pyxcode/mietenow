#!/usr/bin/env node

/**
 * Reset password for a user (since passwords are hashed, we can't retrieve them)
 * Usage: node scripts/get-user-password.js email@example.com
 */

import { config } from 'dotenv'
config({ path: '.env.local' })

import connectDB from '../lib/mongodb.js'
import { getUserModel } from '../lib/get-user-model.js'
import bcrypt from 'bcryptjs'

const [,, email] = process.argv

if (!email) {
  console.error('Usage: node scripts/get-user-password.js email@example.com')
  process.exit(1)
}

async function resetPassword() {
  console.log(`🔍 Recherche de l'utilisateur: ${email}\n`)
  
  try {
    await connectDB()
    const UserModel = await getUserModel()
    
    const user = await UserModel.findOne({ email: email.toLowerCase() })
    
    if (!user) {
      console.error(`❌ Utilisateur non trouvé: ${email}`)
      process.exit(1)
    }
    
    const userDoc = user.toObject ? user.toObject() : user
    console.log(`✅ Utilisateur trouvé:`)
    console.log(`   Email: ${userDoc.email}`)
    console.log(`   Nom: ${userDoc.first_name} ${userDoc.last_name}`)
    console.log(`\n⚠️  Les mots de passe sont hachés et ne peuvent pas être récupérés.`)
    console.log(`\n💡 Pour définir un nouveau mot de passe, utilisez:`)
    console.log(`   curl -X POST http://localhost:3000/api/admin/reset-password \\`)
    console.log(`     -H "Content-Type: application/json" \\`)
    console.log(`     -d '{"email":"${email}","newPassword":"tonNouveauMotDePasse"}'`)
    
  } catch (error) {
    console.error('❌ Erreur:', error.message)
    process.exit(1)
  }
  
  process.exit(0)
}

resetPassword().catch(console.error)

