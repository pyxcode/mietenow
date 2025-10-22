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

async function geocodeAddress(address) {
  try {
    const response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address)}&limit=1&countrycodes=de`)
    const data = await response.json()
    
    if (data && data.length > 0) {
      return {
        lat: parseFloat(data[0].lat),
        lng: parseFloat(data[0].lon),
        formatted_address: data[0].display_name
      }
    }
    return null
  } catch (error) {
    console.error('❌ Erreur de géocodage:', error.message)
    return null
  }
}

async function updateUserAddress() {
  await connectDB()
  
  const userId = new mongoose.Types.ObjectId('507f1f77bcf86cd799439011')
  const db = mongoose.connection.db
  const usersCollection = db.collection('users')
  
  const user = await usersCollection.findOne({ _id: userId })
  
  if (!user) {
    console.error('❌ Utilisateur non trouvé')
    return
  }
  
  console.log('👤 Utilisateur trouvé:', {
    name: `${user.first_name} ${user.last_name}`,
    email: user.email,
    current_address: user.search_preferences?.address
  })
  
  // Si l'utilisateur a une adresse spécifique, la géocoder
  if (user.search_preferences?.address && user.search_preferences.address !== 'Berlin, Germany') {
    console.log(`\n🗺️ Géocodage de l'adresse: "${user.search_preferences.address}"`)
    
    const coordinates = await geocodeAddress(user.search_preferences.address)
    
    if (coordinates) {
      console.log('✅ Coordonnées trouvées:', {
        lat: coordinates.lat,
        lng: coordinates.lng,
        formatted_address: coordinates.formatted_address
      })
      
      // Mettre à jour avec les coordonnées précises
      const result = await usersCollection.updateOne(
        { _id: userId },
        { 
          $set: {
            'search_preferences.coordinates': {
              lat: coordinates.lat,
              lng: coordinates.lng
            },
            'search_preferences.formatted_address': coordinates.formatted_address
          }
        }
      )
      
      if (result.modifiedCount > 0) {
        console.log('✅ Coordonnées GPS mises à jour avec succès')
      }
    } else {
      console.log('❌ Impossible de géocoder cette adresse')
    }
  } else {
    console.log('📍 Aucune adresse spécifique trouvée, utilisation de Berlin par défaut')
    
    // Géocoder Berlin pour avoir des coordonnées précises
    const coordinates = await geocodeAddress('Berlin, Germany')
    
    if (coordinates) {
      const result = await usersCollection.updateOne(
        { _id: userId },
        { 
          $set: {
            'search_preferences.coordinates': {
              lat: coordinates.lat,
              lng: coordinates.lng
            },
            'search_preferences.formatted_address': coordinates.formatted_address
          }
        }
      )
      
      if (result.modifiedCount > 0) {
        console.log('✅ Coordonnées GPS de Berlin mises à jour')
      }
    }
  }
  
  // Afficher les informations finales
  const updatedUser = await usersCollection.findOne({ _id: userId })
  console.log('\n📊 INFORMATIONS FINALES:')
  console.log('=' .repeat(50))
  console.log(`📍 Adresse: ${updatedUser.search_preferences?.address}`)
  console.log(`🗺️ Coordonnées GPS: ${updatedUser.search_preferences?.coordinates?.lat}, ${updatedUser.search_preferences?.coordinates?.lng}`)
  console.log(`📋 Adresse formatée: ${updatedUser.search_preferences?.formatted_address}`)
  console.log(`📏 Rayon de recherche: ${updatedUser.search_preferences?.radius}km`)
  
  await mongoose.disconnect()
  console.log('\n✅ Déconnecté de MongoDB')
}

updateUserAddress().catch(console.error)
