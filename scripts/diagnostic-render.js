/**
 * Script de diagnostic complet pour Browserless sur Render
 * Simule exactement l'environnement Render
 */

const mongoose = require('mongoose')
const fs = require('fs')
const path = require('path')

// Simulation de l'environnement Render
console.log('🚀 Simulation environnement Render...')
console.log('📁 Répertoire de travail:', process.cwd())
console.log('🔧 Node version:', process.version)
console.log('🌍 Environnement:', process.env.NODE_ENV || 'production')

// Charger les variables d'environnement
try {
  require('dotenv').config({ path: '.env.local' })
  console.log('✅ Variables d\'environnement chargées')
} catch (error) {
  console.log('⚠️ Erreur chargement .env.local:', error.message)
}

// Vérifier les variables critiques
console.log('🔍 Vérification des variables d\'environnement:')
console.log('  - MONGODB_URI:', process.env.MONGODB_URI ? '✅ Définie' : '❌ Manquante')
console.log('  - BROWSERLESS_TOKEN:', process.env.BROWSERLESS_TOKEN ? '✅ Définie' : '❌ Manquante')

if (!process.env.BROWSERLESS_TOKEN) {
  console.log('❌ BROWSERLESS_TOKEN manquant!')
  process.exit(1)
}

// Test de connexion Browserless
async function testBrowserlessConnection() {
  try {
    console.log('\n🧪 Test de connexion Browserless...')
    
    const response = await fetch('https://production-sfo.browserless.io/content?token=' + process.env.BROWSERLESS_TOKEN, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        url: 'https://www.google.com',
        waitFor: 2000
      })
    })
    
    console.log('📊 Status Browserless:', response.status)
    
    if (response.ok) {
      const html = await response.text()
      console.log('✅ Browserless fonctionne! Taille réponse:', html.length)
      return true
    } else {
      const error = await response.text()
      console.log('❌ Erreur Browserless:', error)
      return false
    }
  } catch (error) {
    console.log('❌ Erreur connexion Browserless:', error.message)
    return false
  }
}

// Test de scraping ImmobilienScout24
async function testScraping() {
  try {
    console.log('\n🕷️ Test de scraping ImmobilienScout24...')
    
    const response = await fetch('https://production-sfo.browserless.io/content?token=' + process.env.BROWSERLESS_TOKEN, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        url: 'https://www.immobilienscout24.de/Suche/S-T/Wohnung-Miete/Berlin/Berlin',
        waitFor: 3000
      })
    })
    
    console.log('📊 Status scraping:', response.status)
    
    if (!response.ok) {
      const error = await response.text()
      console.log('❌ Erreur scraping:', error)
      return []
    }
    
    const html = await response.text()
    console.log('✅ Page chargée! Taille:', html.length)
    
    // Parse simple avec cheerio
    const cheerio = require('cheerio')
    const $ = cheerio.load(html)
    
    const listings = []
    $('.result-list-entry').each((i, element) => {
      const $el = $(element)
      const title = $el.find('.result-list-entry__brand-title').text().trim()
      
      if (title) {
        listings.push({
          title,
          platform: 'immobilienScout24',
          scrapedAt: new Date()
        })
      }
    })
    
    console.log('🏠 Annonces trouvées:', listings.length)
    
    if (listings.length > 0) {
      console.log('\n📋 Premières annonces:')
      listings.slice(0, 3).forEach((listing, index) => {
        console.log(`  ${index + 1}. ${listing.title}`)
      })
    }
    
    return listings
    
  } catch (error) {
    console.log('❌ Erreur scraping:', error.message)
    return []
  }
}

// Test de connexion MongoDB
async function testMongoDB() {
  try {
    console.log('\n🔗 Test de connexion MongoDB...')
    
    if (!process.env.MONGODB_URI) {
      console.log('❌ MONGODB_URI manquant')
      return false
    }
    
    // Convertir mongodb+srv en mongodb si nécessaire
    const mongoUri = process.env.MONGODB_URI.startsWith('mongodb+srv://')
      ? process.env.MONGODB_URI.replace('mongodb+srv://', 'mongodb://')
      : process.env.MONGODB_URI
    
    console.log('📡 Tentative de connexion MongoDB...')
    
    await mongoose.connect(mongoUri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 10000
    })
    
    console.log('✅ Connecté à MongoDB!')
    console.log('📊 Base de données:', mongoose.connection.name)
    
    await mongoose.disconnect()
    console.log('✅ Déconnecté de MongoDB')
    
    return true
    
  } catch (error) {
    console.log('❌ Erreur MongoDB:', error.message)
    return false
  }
}

// Fonction principale
async function main() {
  console.log('\n🎯 Début des tests de diagnostic...')
  
  // Test 1: Browserless
  const browserlessOk = await testBrowserlessConnection()
  
  // Test 2: Scraping
  let scrapingOk = false
  if (browserlessOk) {
    const listings = await testScraping()
    scrapingOk = listings.length > 0
  }
  
  // Test 3: MongoDB
  const mongoOk = await testMongoDB()
  
  // Résumé
  console.log('\n📊 Résumé des tests:')
  console.log('  - Browserless:', browserlessOk ? '✅ OK' : '❌ ÉCHEC')
  console.log('  - Scraping:', scrapingOk ? '✅ OK' : '❌ ÉCHEC')
  console.log('  - MongoDB:', mongoOk ? '✅ OK' : '❌ ÉCHEC')
  
  if (browserlessOk && scrapingOk && mongoOk) {
    console.log('\n🎉 Tous les tests sont OK! Le cron devrait fonctionner.')
  } else {
    console.log('\n⚠️ Certains tests ont échoué. Vérifiez les problèmes ci-dessus.')
  }
}

main().catch(console.error)
