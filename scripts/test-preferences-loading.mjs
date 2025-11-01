#!/usr/bin/env node

/**
 * Script de test pour vérifier la logique de chargement des préférences
 * Ce script simule le comportement de chargement depuis localStorage
 */

// Simuler les préférences dans localStorage (format identique)
const mockLocalStorage = {
  'temp_preferences': JSON.stringify({
    step: 'address',
    preferences: {
      city: 'Berlin',
      min_price: 300,
      max_price: 900,
      type: 'Room',
      furnishing: 'Furnished',
      min_bedrooms: 2,
      address: 'Prenzlauer Berg, Berlin',
      radius: 5
    },
    timestamp: Date.now()
  })
}

// Fonction helper pour charger les préférences depuis localStorage
const loadPreferencesFromLocalStorage = () => {
  try {
    const tempPrefs = mockLocalStorage['temp_preferences']
    if (tempPrefs) {
      const parsed = JSON.parse(tempPrefs)
      if (parsed.preferences) {
        console.log('✅ Préférences chargées depuis localStorage:', parsed.preferences)
        return parsed.preferences
      }
    }
  } catch (error) {
    console.error('❌ Error loading preferences from localStorage:', error)
  }
  return null
}

// Fonction helper pour formater les préférences en critères de recherche
const formatPreferencesToSearchCriteria = (prefs) => {
  return {
    city: prefs.city || 'Berlin',
    minPrice: prefs.min_price?.toString() || '',
    maxPrice: prefs.max_price?.toString() || '',
    minSize: prefs.min_surface?.toString() || '',
    type: prefs.type || 'Any',
    furnishing: prefs.furnishing || 'Any',
    minBedrooms: prefs.min_bedrooms?.toString() || '',
    address: prefs.address || '',
    radius: prefs.radius || 5,
  }
}

// Test 1: Chargement des préférences depuis localStorage
console.log('📋 Test 1: Chargement des préférences depuis localStorage')
const localPrefs = loadPreferencesFromLocalStorage()

if (localPrefs) {
  console.log('✅ Test 1 réussi: Préférences chargées')
  console.log('   - City:', localPrefs.city)
  console.log('   - Type:', localPrefs.type)
  console.log('   - Min price:', localPrefs.min_price)
  console.log('   - Max price:', localPrefs.max_price)
  console.log('   - Min bedrooms:', localPrefs.min_bedrooms)
  console.log('   - Address:', localPrefs.address)
} else {
  console.log('❌ Test 1 échoué: Aucune préférence chargée')
  process.exit(1)
}

// Test 2: Validation des préférences
console.log('\n📋 Test 2: Validation des préférences')
const hasValidPreferences = localPrefs.address || 
                            localPrefs.min_price || 
                            localPrefs.max_price || 
                            localPrefs.type !== 'Any' || 
                            localPrefs.furnishing !== 'Any' ||
                            localPrefs.min_bedrooms

if (hasValidPreferences) {
  console.log('✅ Test 2 réussi: Préférences valides détectées')
} else {
  console.log('❌ Test 2 échoué: Préférences invalides')
  process.exit(1)
}

// Test 3: Formatage en critères de recherche
console.log('\n📋 Test 3: Formatage en critères de recherche')
const searchCriteria = formatPreferencesToSearchCriteria(localPrefs)
console.log('✅ Critères de recherche formatés:', searchCriteria)

// Vérifications
const checks = [
  { name: 'City', value: searchCriteria.city, expected: 'Berlin' },
  { name: 'Min Price', value: searchCriteria.minPrice, expected: '300' },
  { name: 'Max Price', value: searchCriteria.maxPrice, expected: '900' },
  { name: 'Type', value: searchCriteria.type, expected: 'Room' },
  { name: 'Furnishing', value: searchCriteria.furnishing, expected: 'Furnished' },
  { name: 'Min Bedrooms', value: searchCriteria.minBedrooms, expected: '2' },
  { name: 'Address', value: searchCriteria.address, expected: 'Prenzlauer Berg, Berlin' },
  { name: 'Radius', value: searchCriteria.radius, expected: 5 },
]

let allTestsPassed = true
checks.forEach(check => {
  if (check.value === check.expected) {
    console.log(`   ✅ ${check.name}: ${check.value}`)
  } else {
    console.log(`   ❌ ${check.name}: ${check.value} (attendu: ${check.expected})`)
    allTestsPassed = false
  }
})

if (allTestsPassed) {
  console.log('\n✅ Tous les tests sont passés !')
  console.log('\n📝 Résumé:')
  console.log('   - Les préférences sont correctement chargées depuis localStorage')
  console.log('   - Les préférences sont validées correctement')
  console.log('   - Les préférences sont formatées correctement pour searchCriteria')
  console.log('\n💡 Prochaine étape:')
  console.log('   Tester dans le navigateur après un paiement pour vérifier le comportement réel')
} else {
  console.log('\n❌ Certains tests ont échoué')
  process.exit(1)
}

