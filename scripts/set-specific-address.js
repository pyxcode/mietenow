#!/usr/bin/env node

require('dotenv').config({ path: '.env.local' })
const mongoose = require('mongoose')
const readline = require('readline')

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
    console.log(`🔍 Géocodage de: "${address}"`)
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

function askQuestion(question) {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  })
  
  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      rl.close()
      resolve(answer)
    })
  })
}

async function setSpecificAddress() {
  await connectDB()
  
  const userId = new mongoose.Types.ObjectId('507f1f77bcf86cd799439011')
  const db = mongoose.connection.db
  const usersCollection = db.collection('users')
  
  const user = await usersCollection.findOne({ _id: userId })
  
  if (!user) {
    console.error('❌ Utilisateur non trouvé')
    return
  }
  
  console.log('👤 Utilisateur actuel:', {
    name: `${user.first_name} ${user.last_name}`,
    email: user.email,
    current_address: user.search_preferences?.address
  })
  
  // Demander l'adresse à l'utilisateur
  const address = await askQuestion('\n📍 Entrez l\'adresse précise (ex: "Potsdamer Platz 1, Berlin" ou "Alexanderplatz, Berlin"): ')
  
  if (!address.trim()) {
    console.log('❌ Aucune adresse saisie')
    await mongoose.disconnect()
    return
  }
  
  console.log(`\n🗺️ Géocodage de l'adresse: "${address}"`)
  
  const coordinates = await geocodeAddress(address)
  
  if (coordinates) {
    console.log('✅ Coordonnées trouvées:', {
      lat: coordinates.lat,
      lng: coordinates.lng,
      formatted_address: coordinates.formatted_address
    })
    
    // Demander le rayon de recherche
    const radiusInput = await askQuestion('\n📏 Entrez le rayon de recherche en km (défaut: 5): ')
    const radius = radiusInput.trim() ? parseInt(radiusInput) : 5
    
    // Mettre à jour avec les coordonnées précises
    const result = await usersCollection.updateOne(
      { _id: userId },
      { 
        $set: {
          'search_preferences.address': address,
          'search_preferences.coordinates': {
            lat: coordinates.lat,
            lng: coordinates.lng
          },
          'search_preferences.formatted_address': coordinates.formatted_address,
          'search_preferences.radius': radius
        }
      }
    )
    
    if (result.modifiedCount > 0) {
      console.log('\n✅ Adresse et coordonnées mises à jour avec succès!')
      
      // Afficher les informations finales
      const updatedUser = await usersCollection.findOne({ _id: userId })
      console.log('\n📊 INFORMATIONS FINALES:')
      console.log('=' .repeat(50))
      console.log(`📍 Adresse: ${updatedUser.search_preferences?.address}`)
      console.log(`🗺️ Coordonnées GPS: ${updatedUser.search_preferences?.coordinates?.lat}, ${updatedUser.search_preferences?.coordinates?.lng}`)
      console.log(`📋 Adresse formatée: ${updatedUser.search_preferences?.formatted_address}`)
      console.log(`📏 Rayon de recherche: ${updatedUser.search_preferences?.radius}km`)
    }
  } else {
    console.log('❌ Impossible de géocoder cette adresse. Vérifiez que l\'adresse est correcte et se trouve en Allemagne.')
  }
  
  await mongoose.disconnect()
  console.log('\n✅ Déconnecté de MongoDB')
}

setSpecificAddress().catch(console.error)
