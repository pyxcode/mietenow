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

async function updateRealUserPlan() {
  await connectDB()
  
  // Utiliser l'ID réel de l'utilisateur
  const userId = new mongoose.Types.ObjectId('68f92e46d6eccb4abe01e633')
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
    subscription_status: user.subscription_status
  })
  
  // Activer un plan 1-mois
  const now = new Date()
  const expiresAt = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000) // 30 jours
  
  const updateData = {
    plan: '1mois',
    subscription_status: 'active',
    plan_expires_at: expiresAt,
    last_payment_date: now,
    plan_duration_days: 30,
    // Ajouter des coordonnées GPS précises
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
    console.log('✅ Plan activé avec succès:', {
      plan: '1mois',
      subscription_status: 'active',
      expires_at: expiresAt,
      last_payment_date: now,
      plan_duration_days: 30,
      coordinates: { lat: 52.5200, lng: 13.4050 }
    })
    
    // Vérifier les informations finales
    const updatedUser = await usersCollection.findOne({ _id: userId })
    console.log('\n📊 INFORMATIONS FINALES:')
    console.log('=' .repeat(50))
    console.log(`👤 Nom: ${updatedUser.first_name} ${updatedUser.last_name}`)
    console.log(`📧 Email: ${updatedUser.email}`)
    console.log(`📦 Plan: ${updatedUser.plan}`)
    console.log(`🔄 Statut: ${updatedUser.subscription_status}`)
    console.log(`📅 Expire le: ${updatedUser.plan_expires_at}`)
    console.log(`💰 Dernier paiement: ${updatedUser.last_payment_date}`)
    console.log(`⏱️ Durée: ${updatedUser.plan_duration_days} jours`)
    console.log(`📍 Adresse: ${updatedUser.search_preferences?.address}`)
    console.log(`🗺️ Coordonnées: ${updatedUser.search_preferences?.coordinates?.lat}, ${updatedUser.search_preferences?.coordinates?.lng}`)
  } else {
    console.log('⚠️ Aucune modification effectuée')
  }
  
  await mongoose.disconnect()
  console.log('\n✅ Déconnecté de MongoDB')
}

updateRealUserPlan().catch(console.error)
