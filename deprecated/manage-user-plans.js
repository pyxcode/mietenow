#!/usr/bin/env node

const mongoose = require('mongoose')
require('dotenv').config({ path: '.env.local' })

// Modèle User simplifié pour le script
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

UserSchema.methods.calculatePlanExpiry = function(planType) {
  const now = new Date()
  const daysToAdd = {
    '2sem': 14,
    '1mois': 30,
    '3mois': 90
  }
  
  const days = daysToAdd[planType] || 0
  return new Date(now.getTime() + (days * 24 * 60 * 60 * 1000))
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

async function listUsers() {
  console.log('\n📋 Liste des utilisateurs:')
  const users = await User.find({}).select('email first_name last_name plan plan_expires_at subscription_status')
  
  users.forEach((user, index) => {
    const isValid = user.isPlanValid()
    const status = user.subscription_status
    const plan = user.plan
    const expiresAt = user.plan_expires_at ? new Date(user.plan_expires_at).toLocaleDateString() : 'N/A'
    
    console.log(`${index + 1}. ${user.email}`)
    console.log(`   Nom: ${user.first_name} ${user.last_name}`)
    console.log(`   Plan: ${plan} | Statut: ${status} | Valide: ${isValid ? '✅' : '❌'}`)
    console.log(`   Expire le: ${expiresAt}`)
    console.log('')
  })
}

async function activatePlan(email, planType) {
  try {
    const user = await User.findOne({ email })
    if (!user) {
      console.log(`❌ Utilisateur ${email} non trouvé`)
      return
    }

    const expiryDate = user.calculatePlanExpiry(planType)
    
    await User.findByIdAndUpdate(user._id, {
      plan: planType,
      plan_expires_at: expiryDate,
      subscription_status: 'active'
    })

    console.log(`✅ Plan ${planType} activé pour ${email}`)
    console.log(`   Expire le: ${expiryDate.toLocaleDateString()}`)
  } catch (error) {
    console.error(`❌ Erreur lors de l'activation du plan:`, error.message)
  }
}

async function cancelPlan(email) {
  try {
    const user = await User.findOne({ email })
    if (!user) {
      console.log(`❌ Utilisateur ${email} non trouvé`)
      return
    }

    await User.findByIdAndUpdate(user._id, {
      subscription_status: 'canceled'
    })

    console.log(`✅ Abonnement annulé pour ${email}`)
  } catch (error) {
    console.error(`❌ Erreur lors de l'annulation:`, error.message)
  }
}

async function expirePlan(email) {
  try {
    const user = await User.findOne({ email })
    if (!user) {
      console.log(`❌ Utilisateur ${email} non trouvé`)
      return
    }

    await User.findByIdAndUpdate(user._id, {
      subscription_status: 'expired'
    })

    console.log(`✅ Plan marqué comme expiré pour ${email}`)
  } catch (error) {
    console.error(`❌ Erreur lors de l'expiration:`, error.message)
  }
}

async function resetPlan(email) {
  try {
    const user = await User.findOne({ email })
    if (!user) {
      console.log(`❌ Utilisateur ${email} non trouvé`)
      return
    }

    await User.findByIdAndUpdate(user._id, {
      plan: 'empty',
      plan_expires_at: null,
      subscription_status: 'active'
    })

    console.log(`✅ Plan remis à zéro pour ${email}`)
  } catch (error) {
    console.error(`❌ Erreur lors de la remise à zéro:`, error.message)
  }
}

async function checkExpiredPlans() {
  console.log('\n🔍 Vérification des plans expirés...')
  
  const now = new Date()
  const expiredUsers = await User.find({
    plan: { $ne: 'empty' },
    $or: [
      { subscription_status: 'expired' },
      { subscription_status: 'canceled' },
      { plan_expires_at: { $lt: now } }
    ]
  })

  if (expiredUsers.length === 0) {
    console.log('✅ Aucun plan expiré trouvé')
  } else {
    console.log(`❌ ${expiredUsers.length} plans expirés trouvés:`)
    expiredUsers.forEach(user => {
      console.log(`   - ${user.email} (${user.plan})`)
    })
  }
}

async function main() {
  const args = process.argv.slice(2)
  const command = args[0]

  await connectDB()

  switch (command) {
    case 'list':
      await listUsers()
      break

    case 'activate':
      const email = args[1]
      const planType = args[2]
      if (!email || !planType) {
        console.log('Usage: node manage-user-plans.js activate <email> <plan>')
        console.log('Plans disponibles: 2sem, 1mois, 3mois')
        process.exit(1)
      }
      await activatePlan(email, planType)
      break

    case 'cancel':
      const cancelEmail = args[1]
      if (!cancelEmail) {
        console.log('Usage: node manage-user-plans.js cancel <email>')
        process.exit(1)
      }
      await cancelPlan(cancelEmail)
      break

    case 'expire':
      const expireEmail = args[1]
      if (!expireEmail) {
        console.log('Usage: node manage-user-plans.js expire <email>')
        process.exit(1)
      }
      await expirePlan(expireEmail)
      break

    case 'reset':
      const resetEmail = args[1]
      if (!resetEmail) {
        console.log('Usage: node manage-user-plans.js reset <email>')
        process.exit(1)
      }
      await resetPlan(resetEmail)
      break

    case 'check':
      await checkExpiredPlans()
      break

    default:
      console.log('🔧 Gestionnaire de plans utilisateur')
      console.log('')
      console.log('Commandes disponibles:')
      console.log('  list                    - Lister tous les utilisateurs')
      console.log('  activate <email> <plan>  - Activer un plan (2sem, 1mois, 3mois)')
      console.log('  cancel <email>          - Annuler l\'abonnement')
      console.log('  expire <email>          - Marquer comme expiré')
      console.log('  reset <email>           - Remettre à zéro')
      console.log('  check                   - Vérifier les plans expirés')
      console.log('')
      console.log('Exemples:')
      console.log('  node manage-user-plans.js list')
      console.log('  node manage-user-plans.js activate user@example.com 1mois')
      console.log('  node manage-user-plans.js cancel user@example.com')
      break
  }

  await mongoose.disconnect()
  console.log('\n✅ Déconnecté de MongoDB')
}

main().catch(console.error)
