#!/usr/bin/env node

require('dotenv').config({ path: '.env.local' })
const mongoose = require('mongoose')
const { sendEmail, generateAlertEmailHTML } = require('../lib/sendgrid.js')

// Modèles simplifiés
const UserSchema = new mongoose.Schema({
  email: String,
  search_preferences: {
    type: Object,
    default: {}
  },
  plan: {
    type: String,
    default: 'empty'
  }
})

const AlertSchema = new mongoose.Schema({
  user_id: mongoose.Schema.Types.ObjectId,
  criteria: {
    type: Object,
    default: {}
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
})

const ListingSchema = new mongoose.Schema({
  price: Number,
  address: String,
  surface: Number,
  bedrooms: Number,
  furnishing: String,
  type: String,
  url: String,
  active: {
    type: Boolean,
    default: true
  },
  location: {
    lat: Number,
    lng: Number
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
})

const User = mongoose.model('User', UserSchema)
const Alert = mongoose.model('Alert', AlertSchema)
const Listing = mongoose.model('Listing', ListingSchema)

async function sendAlertEmails() {
  try {
    console.log('🔄 Connexion à MongoDB...')
    await mongoose.connect(process.env.MONGODB_URI)
    console.log('✅ Connecté à MongoDB')
    
    // Récupérer tous les utilisateurs avec des alertes actives
    const usersWithAlerts = await User.find({
      'search_preferences': { $exists: true },
      plan: { $ne: 'empty' } // Utilisateurs payants uniquement
    })

    console.log(`📊 ${usersWithAlerts.length} utilisateurs payants trouvés`)

    let emailsSent = 0
    let errors = []

    for (const user of usersWithAlerts) {
      try {
        // Récupérer la dernière alerte de l'utilisateur
        const latestAlert = await Alert.findOne({ user_id: user._id })
          .sort({ createdAt: -1 })

        if (!latestAlert) {
          console.log(`⚠️ Aucune alerte trouvée pour ${user.email}`)
          continue
        }

        console.log(`🔍 Recherche d'annonces pour ${user.email}...`)

        // Rechercher les nouvelles annonces correspondant aux critères
        const searchCriteria = {
          active: true,
          price: { $gte: latestAlert.criteria.min_price || 0 }
        }

        if (latestAlert.criteria.max_price) {
          searchCriteria.price.$lte = latestAlert.criteria.max_price
        }

        if (latestAlert.criteria.type && latestAlert.criteria.type !== 'Any') {
          searchCriteria.type = latestAlert.criteria.type
        }

        if (latestAlert.criteria.furnishing && latestAlert.criteria.furnishing !== 'Any') {
          searchCriteria.furnishing = latestAlert.criteria.furnishing
        }

        if (latestAlert.criteria.min_bedrooms) {
          searchCriteria.bedrooms = { $gte: latestAlert.criteria.min_bedrooms }
        }

        // Récupérer les annonces créées dans les dernières 24h
        const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000)
        searchCriteria.createdAt = { $gte: oneDayAgo }

        const newListings = await Listing.find(searchCriteria).limit(10)

        console.log(`📋 ${newListings.length} nouvelles annonces trouvées pour ${user.email}`)

        if (newListings.length > 0) {
          // Générer et envoyer l'email
          const emailHTML = generateAlertEmailHTML(newListings, user.search_preferences)
          
          const emailResult = await sendEmail({
            to: user.email,
            subject: `🏠 ${newListings.length} nouvelle(s) annonce(s) trouvée(s) - MieteNow`,
            html: emailHTML
          })

          if (emailResult.success) {
            emailsSent++
            console.log(`✅ Email d'alerte envoyé à ${user.email}`)
          } else {
            errors.push(`Erreur envoi email à ${user.email}: ${emailResult.error}`)
          }
        }
      } catch (userError) {
        errors.push(`Erreur pour utilisateur ${user.email}: ${userError}`)
      }
    }

    console.log(`\n📊 Résumé:`)
    console.log(`✅ ${emailsSent} emails d'alertes envoyés`)
    console.log(`👥 ${usersWithAlerts.length} utilisateurs payants traités`)
    if (errors.length > 0) {
      console.log(`❌ ${errors.length} erreurs:`)
      errors.forEach(error => console.log(`   - ${error}`))
    }

    await mongoose.disconnect()
    console.log('🔌 Déconnecté de MongoDB')

  } catch (error) {
    console.error('❌ Erreur lors de l\'envoi des alertes:', error)
    process.exit(1)
  }
}

// Exécuter si appelé directement
if (require.main === module) {
  sendAlertEmails()
}

module.exports = { sendAlertEmails }
