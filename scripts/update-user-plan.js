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
      await mongoose.connect(MONGODB_URI, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
      })
      console.log('✅ Connecté à MongoDB')
    } catch (error) {
      console.error('❌ Erreur de connexion à MongoDB:', error)
      process.exit(1)
    }
  }
}

async function updateUserPlan() {
  await connectDB()
  
  // Trouver l'utilisateur avec l'ID factice
  const userId = new mongoose.Types.ObjectId('507f1f77bcf86cd799439011')
  
  // Utiliser directement la collection MongoDB
  const db = mongoose.connection.db
  const usersCollection = db.collection('users')
  
  const user = await usersCollection.findOne({ _id: userId })
  
  if (!user) {
    console.error('❌ Utilisateur non trouvé')
    return
  }
  
  console.log('👤 Utilisateur trouvé:', {
    id: user._id,
    name: `${user.first_name} ${user.last_name}`,
    email: user.email,
    current_plan: user.plan,
    subscription_status: user.subscription_status,
    plan_expires_at: user.plan_expires_at,
    last_payment_date: user.last_payment_date,
    plan_duration_days: user.plan_duration_days
  })
  
  // Mettre à jour le plan avec toutes les informations
  const now = new Date()
  const planExpiry = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000) // 30 jours
  
  const updateData = {
    plan: '1mois',
    subscription_status: 'active',
    plan_expires_at: planExpiry,
    last_payment_date: now,
    plan_duration_days: 30,
    // Ajouter des coordonnées GPS si pas présentes
    'search_preferences.coordinates': {
      lat: 52.5200,
      lng: 13.4050
    },
    'search_preferences.address': 'Berlin, Germany'
  }
  
  const result = await usersCollection.updateOne(
    { _id: userId },
    { $set: updateData }
  )
  
  if (result.modifiedCount > 0) {
    console.log('✅ Plan mis à jour avec succès:', {
      plan: '1mois',
      subscription_status: 'active',
      expires_at: planExpiry,
      last_payment_date: now,
      plan_duration_days: 30,
      coordinates: { lat: 52.5200, lng: 13.4050 }
    })
  } else {
    console.log('⚠️ Aucune modification effectuée')
  }
  
  await mongoose.disconnect()
  console.log('✅ Déconnecté de MongoDB')
}

updateUserPlan().catch(console.error)
