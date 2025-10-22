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

// Fonction de géocodage simple
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
    console.error('Erreur de géocodage:', error)
    return null
  }
}

async function geocodeListings() {
  await connectDB()
  
  const db = mongoose.connection.db
  const listingsCollection = db.collection('listings')
  
  // Trouver les annonces sans coordonnées
  const listingsWithoutCoords = await listingsCollection.find({
    $or: [
      { lat: { $exists: false } },
      { lng: { $exists: false } },
      { lat: null },
      { lng: null }
    ]
  }).limit(10).toArray()
  
  console.log(`🔍 ${listingsWithoutCoords.length} annonces sans coordonnées trouvées`)
  
  for (const listing of listingsWithoutCoords) {
    try {
      // Essayer de géocoder avec le titre ou créer une adresse par défaut à Berlin
      let addressToGeocode = listing.title || 'Berlin, Germany'
      
      // Si le titre contient des informations de localisation, l'utiliser
      if (listing.title && listing.title.includes(',')) {
        addressToGeocode = listing.title
      } else {
        // Sinon, utiliser Berlin par défaut
        addressToGeocode = 'Berlin, Germany'
      }
      
      console.log(`🗺️ Géocodage: "${addressToGeocode}"`)
      
      const geocoded = await geocodeAddress(addressToGeocode)
      
      if (geocoded) {
        // Mettre à jour l'annonce avec les coordonnées
        await listingsCollection.updateOne(
          { _id: listing._id },
          { 
            $set: {
              lat: geocoded.lat,
              lng: geocoded.lng,
              address: geocoded.formatted_address
            }
          }
        )
        
        console.log(`✅ Coordonnées ajoutées: ${geocoded.lat}, ${geocoded.lng}`)
      } else {
        console.log(`❌ Impossible de géocoder: ${addressToGeocode}`)
      }
      
      // Attendre un peu pour éviter de surcharger l'API
      await new Promise(resolve => setTimeout(resolve, 1000))
      
    } catch (error) {
      console.error(`❌ Erreur pour l'annonce ${listing._id}:`, error)
    }
  }
  
  // Vérifier le résultat
  const totalWithCoords = await listingsCollection.countDocuments({
    lat: { $exists: true, $ne: null },
    lng: { $exists: true, $ne: null }
  })
  
  console.log(`\n📊 Résultat: ${totalWithCoords} annonces avec coordonnées`)
  
  await mongoose.disconnect()
  console.log('\n✅ Déconnecté de MongoDB')
}

geocodeListings().catch(console.error)
