#!/usr/bin/env node

const mongoose = require('mongoose')
const fs = require('fs')
const path = require('path')
require('dotenv').config({ path: '.env.local' })

// Modèle User pour le script
const UserSchema = new mongoose.Schema({
  first_name: String,
  last_name: String,
  email: { type: String, unique: true },
  plan: { type: String, enum: ['empty', '2sem', '1mois', '3mois'], default: 'empty' },
  plan_expires_at: Date,
  subscription_status: { type: String, enum: ['active', 'expired', 'canceled'], default: 'active' },
  created_at: { type: Date, default: Date.now }
})

const User = mongoose.model('User', UserSchema)

// Méthodes pour le script
UserSchema.methods.isPlanValid = function() {
  if (this.plan === 'empty') return false
  
  const now = new Date()
  const planExpiry = this.plan_expires_at ? new Date(this.plan_expires_at) : null
  
  if (!planExpiry) return true
  
  return now <= planExpiry && this.subscription_status === 'active'
}

async function connectDB() {
  try {
    const mongoUri = process.env.MONGODB_URI
    if (!mongoUri) {
      throw new Error('MONGODB_URI not found in environment variables')
    }
    
    const baseUri = mongoUri.endsWith('/') ? mongoUri.slice(0, -1) : mongoUri
    const fullUri = `${baseUri}/mietenow-prod`
    
    await mongoose.connect(fullUri)
    console.log('✅ Connecté à MongoDB')
  } catch (error) {
    console.error('❌ Erreur de connexion MongoDB:', error.message)
    process.exit(1)
  }
}

async function checkAndUpdateExpiredPlans() {
  const now = new Date()
  const logFile = path.join(__dirname, '../logs/plan-check.log')
  
  console.log(`\n🔍 Vérification des plans expirés - ${now.toISOString()}`)
  
  try {
    // 1. Trouver tous les utilisateurs avec des plans qui vont expirer dans les 3 prochains jours
    const threeDaysFromNow = new Date(now.getTime() + (3 * 24 * 60 * 60 * 1000))
    
    const usersExpiringSoon = await User.find({
      plan: { $ne: 'empty' },
      subscription_status: 'active',
      plan_expires_at: { 
        $lte: threeDaysFromNow,
        $gt: now
      }
    }).select('email first_name last_name plan plan_expires_at')

    console.log(`📧 ${usersExpiringSoon.length} utilisateurs avec des plans qui expirent bientôt`)
    
    // 2. Trouver tous les utilisateurs avec des plans expirés
    const expiredUsers = await User.find({
      plan: { $ne: 'empty' },
      subscription_status: 'active',
      plan_expires_at: { $lt: now }
    }).select('email first_name last_name plan plan_expires_at')

    console.log(`⏰ ${expiredUsers.length} utilisateurs avec des plans expirés`)

    // 3. Mettre à jour les plans expirés
    if (expiredUsers.length > 0) {
      const result = await User.updateMany(
        {
          plan: { $ne: 'empty' },
          subscription_status: 'active',
          plan_expires_at: { $lt: now }
        },
        {
          $set: { subscription_status: 'expired' }
        }
      )

      console.log(`✅ ${result.modifiedCount} plans marqués comme expirés`)
    }

    // 4. Logging détaillé
    const logEntry = {
      timestamp: now.toISOString(),
      expiringSoon: usersExpiringSoon.length,
      expired: expiredUsers.length,
      updated: expiredUsers.length,
      usersExpiringSoon: usersExpiringSoon.map(u => ({
        email: u.email,
        plan: u.plan,
        expiresAt: u.plan_expires_at
      })),
      expiredUsers: expiredUsers.map(u => ({
        email: u.email,
        plan: u.plan,
        expiredAt: u.plan_expires_at
      }))
    }

    // Écrire dans le fichier de log
    const logLine = JSON.stringify(logEntry) + '\n'
    fs.appendFileSync(logFile, logLine)

    // 5. Statistiques générales
    const totalUsers = await User.countDocuments()
    const activePlans = await User.countDocuments({ 
      plan: { $ne: 'empty' }, 
      subscription_status: 'active' 
    })
    const expiredPlans = await User.countDocuments({ 
      plan: { $ne: 'empty' }, 
      subscription_status: 'expired' 
    })
    const canceledPlans = await User.countDocuments({ 
      plan: { $ne: 'empty' }, 
      subscription_status: 'canceled' 
    })

    console.log('\n📊 Statistiques des plans:')
    console.log(`   Total utilisateurs: ${totalUsers}`)
    console.log(`   Plans actifs: ${activePlans}`)
    console.log(`   Plans expirés: ${expiredPlans}`)
    console.log(`   Plans annulés: ${canceledPlans}`)

    return {
      success: true,
      expiringSoon: usersExpiringSoon.length,
      expired: expiredUsers.length,
      updated: expiredUsers.length
    }

  } catch (error) {
    console.error('❌ Erreur lors de la vérification des plans:', error)
    
    // Log de l'erreur
    const errorLog = {
      timestamp: now.toISOString(),
      error: error.message,
      stack: error.stack
    }
    
    fs.appendFileSync(logFile, JSON.stringify(errorLog) + '\n')
    
    return {
      success: false,
      error: error.message
    }
  }
}

async function sendExpirationNotifications() {
  // Ici tu peux ajouter l'envoi d'emails aux utilisateurs
  // dont les plans expirent bientôt
  console.log('📧 Envoi des notifications d\'expiration...')
  
  // TODO: Intégrer avec SendGrid pour envoyer des emails
  // const sgMail = require('@sendgrid/mail')
  // sgMail.setApiKey(process.env.SENDGRID_API_KEY)
  
  console.log('✅ Notifications envoyées')
}

async function main() {
  const startTime = new Date()
  
  console.log(`\n🚀 Début de la vérification des plans - ${startTime.toISOString()}`)
  
  await connectDB()
  
  const result = await checkAndUpdateExpiredPlans()
  
  if (result.success) {
    console.log(`\n✅ Vérification terminée avec succès`)
    console.log(`   Plans expirant bientôt: ${result.expiringSoon}`)
    console.log(`   Plans expirés: ${result.expired}`)
    console.log(`   Plans mis à jour: ${result.updated}`)
  } else {
    console.log(`\n❌ Erreur lors de la vérification: ${result.error}`)
  }
  
  // Envoyer les notifications (optionnel)
  await sendExpirationNotifications()
  
  const endTime = new Date()
  const duration = endTime.getTime() - startTime.getTime()
  
  console.log(`\n⏱️  Durée totale: ${duration}ms`)
  console.log(`🏁 Fin de la vérification - ${endTime.toISOString()}`)
  
  await mongoose.disconnect()
  console.log('✅ Déconnecté de MongoDB')
}

// Exécuter le script
main().catch(console.error)
