#!/usr/bin/env node

// Charger les variables d'environnement en premier
require('dotenv').config({ path: '.env.local' })

const mongoose = require('mongoose')
const nodemailer = require('nodemailer')

// Configuration MongoDB
const MONGODB_URI = process.env.MONGODB_URI2 ? process.env.MONGODB_URI2.replace('/?', '/mietenow-prod?') : process.env.MONGODB_URI || 'mongodb://localhost:27017/mietenow'

console.log('🔍 Debug - MONGODB_URI:', MONGODB_URI)
console.log('🔍 Debug - MONGODB_URI2:', process.env.MONGODB_URI2)

// Configuration email
const EMAIL_CONFIG = {
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: process.env.SMTP_PORT || 587,
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS
  }
}

// Modèles MongoDB
const AlertSchema = new mongoose.Schema({
  user_id: String,
  email: String,
  title: String,
  criteria: {
    city: String,
    type: String,
    max_price: Number,
    min_price: Number,
    min_surface: Number,
    min_bedrooms: Number,
    furnishing: String,
    address: String,
    radius: Number
  },
  frequency: String,
  active: Boolean,
  last_triggered_at: Date,
  created_at: Date,
  updated_at: Date
})

const ListingSchema = new mongoose.Schema({
  id: String,
  title: String,
  description: String,
  price: String,
  address: String,
  size: String,
  rooms: Number,
  type: String,
  images: [String],
  link: String,
  platform: String,
  scrapedAt: Date,
  lat: Number,
  lng: Number
})

const Alert = mongoose.model('Alert', AlertSchema)
const Listing = mongoose.model('Listing', ListingSchema)

async function connectToDatabase() {
  try {
    console.log('🔗 Connecting to MongoDB with URI:', MONGODB_URI)
    await mongoose.connect(MONGODB_URI)
    const db = mongoose.connection.db
    console.log('✅ Connected to MongoDB - Database:', db.databaseName)
  } catch (error) {
    console.error('❌ MongoDB connection error:', error)
    process.exit(1)
  }
}

async function sendAlertEmails() {
  try {
    console.log('🚀 Starting alert email process...')
    
    await connectToDatabase()
    
    // Utiliser MongoDB natif au lieu de Mongoose pour éviter les problèmes de schéma
    const db = mongoose.connection.db
    const alertsCollection = db.collection('alerts')
    
    // Récupérer toutes les alertes actives
    const alerts = await alertsCollection.find({ active: true }).toArray()
    console.log(`📧 Found ${alerts.length} active alerts`)
    
    if (alerts.length === 0) {
      console.log('ℹ️ No active alerts found')
      return
    }
    
    // Afficher les alertes trouvées
    alerts.forEach(alert => {
      console.log('Alert found:', {
        id: alert._id,
        email: alert.email,
        title: alert.title,
        active: alert.active,
        criteria: alert.criteria
      })
    })
    
    // Configuration du transporteur email
    const transporter = nodemailer.createTransport(EMAIL_CONFIG)
    
    // Vérifier la connexion email
    try {
      await transporter.verify()
      console.log('✅ Email transporter verified')
    } catch (error) {
      console.error('❌ Email transporter error:', error)
      return
    }
    
    let emailsSent = 0
    
    for (const alert of alerts) {
      try {
        console.log(`\n🔍 Processing alert for ${alert.email}...`)
        
        // Déterminer la date de dernière vérification
        const lastCheck = alert.last_triggered_at || new Date(Date.now() - 24 * 60 * 60 * 1000) // 24h par défaut
        
        // Construire la requête de recherche
        const searchQuery = {
          scrapedAt: { $gt: lastCheck }
        }
        
        // Ajouter les critères de l'alerte
        if (alert.criteria.city && alert.criteria.city !== 'Any') {
          searchQuery.address = { $regex: alert.criteria.city, $options: 'i' }
        }
        
        if (alert.criteria.type && alert.criteria.type !== 'Any') {
          searchQuery.type = alert.criteria.type
        }
        
        if (alert.criteria.max_price && alert.criteria.max_price > 0) {
          // Convertir le prix en nombre pour la comparaison
          searchQuery.$expr = {
            $lte: [
              { $toDouble: { $regex: { input: '$price', regex: '\\d+', options: '' } } },
              alert.criteria.max_price
            ]
          }
        }
        
        if (alert.criteria.min_price && alert.criteria.min_price > 0) {
          if (!searchQuery.$expr) {
            searchQuery.$expr = {}
          }
          searchQuery.$expr.$gte = [
            { $toDouble: { $regex: { input: '$price', regex: '\\d+', options: '' } } },
            alert.criteria.min_price
          ]
        }
        
        if (alert.criteria.min_surface && alert.criteria.min_surface > 0) {
          searchQuery.size = { $gte: alert.criteria.min_surface }
        }
        
        if (alert.criteria.min_bedrooms && alert.criteria.min_bedrooms > 0) {
          searchQuery.rooms = { $gte: alert.criteria.min_bedrooms }
        }
        
        console.log('🔍 Search query:', JSON.stringify(searchQuery, null, 2))
        
        // Rechercher les nouvelles annonces
        const newListings = await Listing.find(searchQuery).limit(10).sort({ scrapedAt: -1 })
        
        console.log(`📋 Found ${newListings.length} new listings for this alert`)
        
        if (newListings.length === 0) {
          console.log('ℹ️ No new listings found for this alert')
          continue
        }
        
        // Construire le contenu de l'email
        const emailContent = buildEmailContent(alert, newListings)
        
        // Envoyer l'email
        const mailOptions = {
          from: EMAIL_CONFIG.auth.user,
          to: alert.email,
          subject: `🏠 ${newListings.length} nouvelles annonces trouvées - ${alert.title}`,
          html: emailContent
        }
        
        await transporter.sendMail(mailOptions)
        console.log(`✅ Email sent to ${alert.email}`)
        
        // Mettre à jour la date de dernière vérification
        await Alert.findByIdAndUpdate(alert._id, {
          last_triggered_at: new Date()
        })
        
        emailsSent++
        
        // Pause entre les emails pour éviter d'être bloqué
        await new Promise(resolve => setTimeout(resolve, 2000))
        
      } catch (error) {
        console.error(`❌ Error processing alert for ${alert.email}:`, error)
      }
    }
    
    console.log(`\n✅ Alert process completed. ${emailsSent} emails sent.`)
    
  } catch (error) {
    console.error('❌ Alert process error:', error)
  } finally {
    await mongoose.disconnect()
    console.log('🔌 Disconnected from MongoDB')
  }
}

function buildEmailContent(alert, listings) {
  const listingsHtml = listings.map(listing => `
    <div style="border: 1px solid #ddd; border-radius: 8px; padding: 15px; margin: 10px 0; background: #f9f9f9;">
      <h3 style="margin: 0 0 10px 0; color: #2563eb;">${listing.title}</h3>
      <p style="margin: 5px 0; color: #666;"><strong>📍 Adresse:</strong> ${listing.address}</p>
      <p style="margin: 5px 0; color: #666;"><strong>💰 Prix:</strong> ${listing.price}</p>
      <p style="margin: 5px 0; color: #666;"><strong>📏 Surface:</strong> ${listing.size || 'N/A'}</p>
      <p style="margin: 5px 0; color: #666;"><strong>🛏️ Chambres:</strong> ${listing.rooms || 'N/A'}</p>
      <p style="margin: 5px 0; color: #666;"><strong>🏢 Plateforme:</strong> ${listing.platform}</p>
      <a href="${listing.link}" style="display: inline-block; background: #2563eb; color: white; padding: 8px 16px; text-decoration: none; border-radius: 4px; margin-top: 10px;">Voir l'annonce</a>
    </div>
  `).join('')
  
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <title>Nouvelles annonces trouvées</title>
    </head>
    <body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
      <h1 style="color: #2563eb;">🏠 Nouvelles annonces trouvées</h1>
      <p>Bonjour,</p>
      <p>Nous avons trouvé <strong>${listings.length}</strong> nouvelles annonces correspondant à vos critères :</p>
      
      <div style="background: #e3f2fd; padding: 15px; border-radius: 8px; margin: 20px 0;">
        <h3 style="margin: 0 0 10px 0;">📋 Vos critères :</h3>
        <ul style="margin: 0;">
          <li><strong>Ville:</strong> ${alert.criteria.city || 'Toutes'}</li>
          <li><strong>Type:</strong> ${alert.criteria.type || 'Tous'}</li>
          <li><strong>Prix max:</strong> ${alert.criteria.max_price ? alert.criteria.max_price + ' €' : 'Aucun'}</li>
          <li><strong>Surface min:</strong> ${alert.criteria.min_surface ? alert.criteria.min_surface + ' m²' : 'Aucune'}</li>
          <li><strong>Chambres min:</strong> ${alert.criteria.min_bedrooms || 'Aucune'}</li>
        </ul>
      </div>
      
      <h2 style="color: #2563eb;">🏠 Nouvelles annonces :</h2>
      ${listingsHtml}
      
      <div style="margin-top: 30px; padding: 20px; background: #f5f5f5; border-radius: 8px;">
        <p style="margin: 0; font-size: 14px; color: #666;">
          Cet email a été envoyé automatiquement par MieteNow.<br>
          Vous recevrez des alertes selon la fréquence configurée : <strong>${alert.frequency}</strong>
        </p>
      </div>
    </body>
    </html>
  `
}

// Exécuter si appelé directement
if (require.main === module) {
  sendAlertEmails()
}

module.exports = { sendAlertEmails }
