/**
 * Test des préférences via l'API Next.js
 * Usage: node scripts/test-api-preferences.mjs
 * 
 * Ce script teste les endpoints API pour vérifier que les préférences sont bien sauvegardées
 */

import { config } from 'dotenv'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

// Charger les variables d'environnement
config({ path: join(__dirname, '..', '.env.local') })

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'

console.log('🧪 Test des API de préférences')
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
console.log(`API Base URL: ${API_BASE_URL}\n`)

// ID d'utilisateur de test (vous pouvez le changer)
const TEST_USER_ID = process.argv[2] || '690610e27efe92e1933a9bab'

async function testPreferencesAPI() {
  try {
    console.log('📋 Test 1: Récupération des préférences')
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
    
    const getResponse = await fetch(`${API_BASE_URL}/api/user/preferences?userId=${TEST_USER_ID}`)
    
    if (!getResponse.ok) {
      console.error(`❌ Erreur HTTP: ${getResponse.status} ${getResponse.statusText}`)
      const errorText = await getResponse.text()
      console.error('Réponse:', errorText)
      return
    }
    
    const getData = await getResponse.json()
    
    if (getData.success && getData.data) {
      const prefs = getData.data.search_preferences
      console.log('✅ Préférences récupérées:')
      console.log(`   City: ${prefs.city || 'N/A'}`)
      console.log(`   Min Price: ${prefs.min_price !== undefined && prefs.min_price !== null ? prefs.min_price + '€ ✅' : '❌ MISSING'}`)
      console.log(`   Max Price: ${prefs.max_price || 'N/A'}€`)
      console.log(`   Type: ${prefs.type || 'N/A'}`)
      console.log(`   Furnishing: ${prefs.furnishing || 'N/A'}`)
      console.log(`   Min Bedrooms: ${prefs.min_bedrooms !== undefined && prefs.min_bedrooms !== null ? prefs.min_bedrooms + ' ✅' : '❌ MISSING'}`)
      console.log(`   Address: ${prefs.address || '❌ MISSING'}`)
      console.log(`   Radius: ${prefs.radius || 'N/A'} km`)
      
      // Validation
      const issues = []
      if (prefs.min_price === undefined || prefs.min_price === null) {
        issues.push('❌ min_price est manquant')
      }
      if (!prefs.address || prefs.address.trim() === '') {
        issues.push('❌ address est manquante ou vide')
      }
      if (prefs.type === 'Any') {
        issues.push('⚠️  type est toujours "Any" (devrait être sauvegardé depuis la page criteria)')
      }
      if (prefs.furnishing === 'Any') {
        issues.push('⚠️  furnishing est toujours "Any" (devrait être sauvegardé depuis la page criteria)')
      }
      if (prefs.min_bedrooms === undefined || prefs.min_bedrooms === null || prefs.min_bedrooms === 0) {
        issues.push('⚠️  min_bedrooms est manquant ou 0 (devrait être sauvegardé depuis la page criteria)')
      }
      
      if (issues.length > 0) {
        console.log('\n⚠️  Problèmes détectés:')
        issues.forEach(issue => console.log(`   ${issue}`))
      } else {
        console.log('\n✅ Toutes les préférences sont présentes!')
      }
    } else {
      console.error('❌ Réponse inattendue:', getData)
    }
    
    console.log('\n📋 Test 2: Sauvegarde de préférences test')
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
    
    const testPreferences = {
      min_price: 900,
      max_price: 1500,
      type: 'Room',
      furnishing: 'Furnished',
      min_bedrooms: 2,
      address: 'Test Address, Berlin',
      radius: 5
    }
    
    console.log('📤 Envoi de préférences de test:', testPreferences)
    
    const postResponse = await fetch(`${API_BASE_URL}/api/user/preferences`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-user-id': TEST_USER_ID
      },
      body: JSON.stringify({
        step: 'test',
        preferences: testPreferences,
        userId: TEST_USER_ID
      })
    })
    
    if (!postResponse.ok) {
      console.error(`❌ Erreur HTTP: ${postResponse.status} ${postResponse.statusText}`)
      const errorText = await postResponse.text()
      console.error('Réponse:', errorText)
      return
    }
    
    const postData = await postResponse.json()
    
    if (postData.success) {
      console.log('✅ Préférences sauvegardées avec succès!')
      const savedPrefs = postData.data.search_preferences
      console.log('\n📋 Préférences sauvegardées:')
      console.log(`   Min Price: ${savedPrefs.min_price}€ ${savedPrefs.min_price === 900 ? '✅' : '❌ (devrait être 900)'}`)
      console.log(`   Max Price: ${savedPrefs.max_price}€ ${savedPrefs.max_price === 1500 ? '✅' : '❌ (devrait être 1500)'}`)
      console.log(`   Type: ${savedPrefs.type} ${savedPrefs.type === 'Room' ? '✅' : '❌ (devrait être Room)'}`)
      console.log(`   Furnishing: ${savedPrefs.furnishing} ${savedPrefs.furnishing === 'Furnished' ? '✅' : '❌ (devrait être Furnished)'}`)
      console.log(`   Min Bedrooms: ${savedPrefs.min_bedrooms} ${savedPrefs.min_bedrooms === 2 ? '✅' : '❌ (devrait être 2)'}`)
      console.log(`   Address: ${savedPrefs.address} ${savedPrefs.address === 'Test Address, Berlin' ? '✅' : '❌'}`)
      
      // Vérifier que min_price n'est pas écrasé
      if (savedPrefs.min_price === 900) {
        console.log('\n✅✅ min_price est bien sauvegardé et préservé!')
      } else {
        console.log('\n❌❌ min_price n\'a pas été sauvegardé correctement!')
      }
    } else {
      console.error('❌ Échec de la sauvegarde:', postData.error)
    }
    
    console.log('\n📋 Test 3: Vérification de la sauvegarde')
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
    
    // Attendre un peu pour que la sauvegarde soit complète
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    const verifyResponse = await fetch(`${API_BASE_URL}/api/user/preferences?userId=${TEST_USER_ID}`)
    const verifyData = await verifyResponse.json()
    
    if (verifyData.success && verifyData.data) {
      const verifyPrefs = verifyData.data.search_preferences
      
      if (verifyPrefs.min_price === 900) {
        console.log('✅ min_price est bien persisté dans la base de données!')
      } else {
        console.log(`❌ min_price n'est pas persistant: attendu 900, trouvé ${verifyPrefs.min_price}`)
      }
      
      if (verifyPrefs.type === 'Room') {
        console.log('✅ type est bien persisté dans la base de données!')
      } else {
        console.log(`❌ type n'est pas persistant: attendu Room, trouvé ${verifyPrefs.type}`)
      }
      
      if (verifyPrefs.min_bedrooms === 2) {
        console.log('✅ min_bedrooms est bien persisté dans la base de données!')
      } else {
        console.log(`❌ min_bedrooms n'est pas persistant: attendu 2, trouvé ${verifyPrefs.min_bedrooms}`)
      }
    }
    
    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
    console.log('✅ Tests terminés!')
    
  } catch (error) {
    console.error('❌ Erreur lors des tests:', error)
    console.error('\n💡 Assurez-vous que:')
    console.error('   1. Le serveur Next.js est démarré (npm run dev)')
    console.error('   2. L\'URL de l\'API est correcte')
    console.error('   3. Le userId est valide')
  }
}

// Exécuter les tests
testPreferencesAPI()


