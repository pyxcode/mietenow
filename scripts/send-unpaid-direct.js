#!/usr/bin/env node

require('dotenv').config({ path: '.env.local' })
const mongoose = require('mongoose')
const { sendEmail, generateUnpaidUserEmailHTML } = require('../lib/sendgrid.js')

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
const Listing = mongoose.model('Listing', ListingSchema)

async function sendUnpaidUserEmails() {
  try {
    console.log('🔄 Connexion à MongoDB...')
    await mongoose.connect(process.env.MONGODB_URI)
    console.log('✅ Connecté à MongoDB')
    
    // Récupérer tous les utilisateurs non payants avec des préférences
    const unpaidUsers = await User.find({
      'search_preferences': { $exists: true },
      plan: 'empty' // Utilisateurs non payants
    })

    console.log(`📊 ${unpaidUsers.length} utilisateurs non-payants trouvés`)

    let emailsSent = 0
    let errors = []

    for (const user of unpaidUsers) {
      try {
        const preferences = user.search_preferences
        
        console.log(`🔍 Recherche d'annonces pour ${user.email}...`)

        // Rechercher des annonces correspondant aux critères
        const searchCriteria = {
          active: true,
          price: { $gte: preferences.min_price || 0 }
        }

        if (preferences.max_price) {
          searchCriteria.price.$lte = preferences.max_price
        }

        if (preferences.type && preferences.type !== 'Any') {
          searchCriteria.type = preferences.type
        }

        if (preferences.furnishing && preferences.furnishing !== 'Any') {
          searchCriteria.furnishing = preferences.furnishing
        }

        if (preferences.min_bedrooms) {
          searchCriteria.bedrooms = { $gte: preferences.min_bedrooms }
        }

        // Récupérer les meilleures annonces (pas forcément nouvelles)
        const listings = await Listing.find(searchCriteria)
          .sort({ createdAt: -1 })
          .limit(5)

        console.log(`📋 ${listings.length} annonces trouvées pour ${user.email}`)

        if (listings.length > 0) {
          // Générer et envoyer l'email
          const emailHTML = generateUnpaidUserEmailHTML(listings, preferences)
          
          const emailResult = await sendEmail({
            to: user.email,
            subject: `🏠 ${listings.length} appartement(s) trouvé(s) pour vous - MieteNow`,
            html: emailHTML
          })

          if (emailResult.success) {
            emailsSent++
            console.log(`✅ Email non-payant envoyé à ${user.email}`)
          } else {
            errors.push(`Erreur envoi email à ${user.email}: ${emailResult.error}`)
          }
        }
      } catch (userError) {
        errors.push(`Erreur pour utilisateur ${user.email}: ${userError}`)
      }
    }

    console.log(`\n📊 Résumé:`)
    console.log(`✅ ${emailsSent} emails envoyés aux utilisateurs non-payants`)
    console.log(`👥 ${unpaidUsers.length} utilisateurs non-payants traités`)
    if (errors.length > 0) {
      console.log(`❌ ${errors.length} erreurs:`)
      errors.forEach(error => console.log(`   - ${error}`))
    }

    await mongoose.disconnect()
    console.log('🔌 Déconnecté de MongoDB')

  } catch (error) {
    console.error('❌ Erreur lors de l\'envoi des emails non-payants:', error)
    process.exit(1)
  }
}

// Exécuter si appelé directement
if (require.main === module) {
  sendUnpaidUserEmails()
}

module.exports = { sendUnpaidUserEmails }
