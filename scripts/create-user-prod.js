#!/usr/bin/env node

require('dotenv').config({ path: '.env.local' })
const mongoose = require('mongoose')

const MONGODB_URI = process.env.MONGODB_URI

if (!MONGODB_URI) {
  console.error('MONGODB_URI non défini dans .env.local')
  process.exit(1)
}

async function connectDB() {
  if (mongoose.connection.readyState === 0) {
    try {
      // Forcer l'utilisation de mietenow-prod
      const mongoUri = MONGODB_URI.endsWith('/') 
        ? MONGODB_URI.slice(0, -1) 
        : MONGODB_URI
      const finalUri = `${mongoUri}/mietenow-prod`
      
      await mongoose.connect(finalUri, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
      })
      console.log('✅ Connecté à MongoDB - Base: mietenow-prod')
    } catch (error) {
      console.error('❌ Erreur de connexion à MongoDB:', error)
      process.exit(1)
    }
  }
}

async function createUserProd() {
  await connectDB()
  
  const db = mongoose.connection.db
  const usersCollection = db.collection('users')
  
  // Vérifier si l'utilisateur existe déjà
  const existingUser = await usersCollection.findOne({ email: 'louan.bardou@icloud.com' })
  
  if (existingUser) {
    console.log('👤 Utilisateur existe déjà dans mietenow-prod:', {
      id: existingUser._id,
      name: `${existingUser.first_name} ${existingUser.last_name}`,
      email: existingUser.email,
      plan: existingUser.plan
    })
    
    // Mettre à jour avec un plan valide
    const now = new Date()
    const expiresAt = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000) // 30 jours
    
    const updateData = {
      plan: '1mois',
      subscription_status: 'active',
      plan_expires_at: expiresAt,
      last_payment_date: now,
      plan_duration_days: 30,
      'search_preferences.coordinates': {
        lat: 52.5200,
        lng: 13.4050
      },
      'search_preferences.address': 'Berlin, Germany'
    }
    
    const result = await usersCollection.updateOne(
      { _id: existingUser._id },
      { $set: updateData }
    )
    
    if (result.modifiedCount > 0) {
      console.log('✅ Plan activé pour l\'utilisateur existant')
    }
    
  } else {
    // Créer l'utilisateur dans mietenow-prod
    const newUser = {
      first_name: 'Louan',
      last_name: 'BARDOU',
      email: 'louan.bardou@icloud.com',
      password_hash: '$2b$12$P7tUwCqcfj1Uq5lxt2Mrl0ThmcNVm6nLfHPROLPa3asAECH21QKHi',
      plan: '1mois',
      subscription_status: 'active',
      plan_expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      last_payment_date: new Date(),
      plan_duration_days: 30,
      search_preferences: {
        city: 'Berlin',
        max_price: 1500,
        type: 'Apartment',
        min_surface: 0,
        max_surface: 0,
        districts: [],
        furnishing: 'Furnished',
        address: 'Berlin, Germany',
        radius: 5,
        coordinates: {
          lat: 52.5200,
          lng: 13.4050
        },
        min_bedrooms: 2
      },
      onboarding_completed: false,
      current_step: 'criteria',
      created_at: new Date(),
      last_login: new Date()
    }
    
    const result = await usersCollection.insertOne(newUser)
    
    if (result.insertedId) {
      console.log('✅ Utilisateur créé dans mietenow-prod:', {
        id: result.insertedId,
        name: 'Louan BARDOU',
        email: 'louan.bardou@icloud.com',
        plan: '1mois'
      })
    }
  }
  
  // Afficher les informations finales
  const user = await usersCollection.findOne({ email: 'louan.bardou@icloud.com' })
  console.log('\n📊 INFORMATIONS FINALES:')
  console.log('=' .repeat(50))
  console.log(`👤 Nom: ${user.first_name} ${user.last_name}`)
  console.log(`📧 Email: ${user.email}`)
  console.log(`📦 Plan: ${user.plan}`)
  console.log(`🔄 Statut: ${user.subscription_status}`)
  console.log(`📅 Expire le: ${user.plan_expires_at}`)
  console.log(`💰 Dernier paiement: ${user.last_payment_date}`)
  console.log(`⏱️ Durée: ${user.plan_duration_days} jours`)
  console.log(`📍 Adresse: ${user.search_preferences?.address}`)
  console.log(`🗺️ Coordonnées: ${user.search_preferences?.coordinates?.lat}, ${user.search_preferences?.coordinates?.lng}`)
  
  await mongoose.disconnect()
  console.log('\n✅ Déconnecté de MongoDB')
}

createUserProd().catch(console.error)
