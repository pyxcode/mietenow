/**
 * Script de test pour vérifier que toutes les préférences sont bien sauvegardées
 * Usage: node scripts/test-preferences-saving.js [userId]
 */

const mongoose = require('mongoose')
require('dotenv').config({ path: '.env.local' })

const MONGODB_URI = process.env.MONGODB_URI

if (!MONGODB_URI) {
  console.error('❌ MONGODB_URI not found in environment variables')
  process.exit(1)
}

const UserSchema = new mongoose.Schema({
  first_name: String,
  last_name: String,
  email: String,
  search_preferences: {
    city: String,
    min_price: Number,
    max_price: Number,
    type: String,
    furnishing: String,
    address: String,
    exact_address: String,
    radius: Number,
    coordinates: {
      lat: Number,
      lng: Number
    },
    min_bedrooms: Number,
    min_surface: Number,
    max_surface: Number,
    districts: [String]
  },
  plan: String,
  plan_expires_at: Date,
  subscription_status: String,
  last_payment_date: Date,
  onboarding_completed: Boolean,
  current_step: String
}, { timestamps: true })

async function testPreferences() {
  try {
    console.log('🔌 Connecting to MongoDB...')
    await mongoose.connect(MONGODB_URI)
    
    const db = mongoose.connection.db
    console.log(`✅ Connected to database: ${db.databaseName}`)
    
    const usersCollection = db.collection('users')
    
    // Récupérer le userId depuis les arguments ou utiliser celui fourni
    const userId = process.argv[2]
    
    if (!userId) {
      console.log('📋 Listing all users with their preferences:')
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
      
      const users = await usersCollection.find({}).sort({ createdAt: -1 }).limit(10).toArray()
      
      users.forEach((user, index) => {
        console.log(`\n👤 User ${index + 1}:`)
        console.log(`   ID: ${user._id}`)
        console.log(`   Name: ${user.first_name} ${user.last_name}`)
        console.log(`   Email: ${user.email}`)
        console.log(`   Plan: ${user.plan || 'N/A'}`)
        console.log(`   Onboarding Completed: ${user.onboarding_completed || false}`)
        console.log(`   Last Payment Date: ${user.last_payment_date || 'N/A'}`)
        console.log(`   Plan Expires At: ${user.plan_expires_at || 'N/A'}`)
        
        if (user.search_preferences) {
          console.log(`\n   📋 Search Preferences:`)
          console.log(`      City: ${user.search_preferences.city || 'N/A'}`)
          console.log(`      Min Price: ${user.search_preferences.min_price !== undefined ? user.search_preferences.min_price + '€' : '❌ MISSING'}`)
          console.log(`      Max Price: ${user.search_preferences.max_price || 'N/A'}€`)
          console.log(`      Type: ${user.search_preferences.type || 'N/A'}`)
          console.log(`      Furnishing: ${user.search_preferences.furnishing || 'N/A'}`)
          console.log(`      Min Bedrooms: ${user.search_preferences.min_bedrooms !== undefined ? user.search_preferences.min_bedrooms : '❌ MISSING'}`)
          console.log(`      Address: ${user.search_preferences.address || '❌ MISSING'}`)
          console.log(`      Exact Address: ${user.search_preferences.exact_address || 'N/A'}`)
          console.log(`      Radius: ${user.search_preferences.radius || 'N/A'} km`)
          
          if (user.search_preferences.coordinates) {
            console.log(`      Coordinates: lat=${user.search_preferences.coordinates.lat}, lng=${user.search_preferences.coordinates.lng}`)
          }
        } else {
          console.log(`   ❌ No search preferences found`)
        }
        
        // Vérifier les problèmes
        const issues = []
        if (user.plan === 'empty' && user.subscription_status === 'active') {
          issues.push('⚠️  Plan is "empty" but subscription_status is "active"')
        }
        if (user.subscription_status === 'active' && !user.last_payment_date) {
          issues.push('⚠️  subscription_status is "active" but last_payment_date is missing')
        }
        if (user.subscription_status === 'active' && !user.plan_expires_at) {
          issues.push('⚠️  subscription_status is "active" but plan_expires_at is missing')
        }
        if (user.onboarding_completed === false && user.subscription_status === 'active') {
          issues.push('⚠️  onboarding_completed is false but subscription_status is "active"')
        }
        if (user.search_preferences) {
          if (user.search_preferences.min_price === undefined || user.search_preferences.min_price === null) {
            issues.push('⚠️  min_price is missing')
          }
          if (!user.search_preferences.address || user.search_preferences.address.trim() === '') {
            issues.push('⚠️  address is missing or empty')
          }
          if (user.search_preferences.type === 'Any' && user.subscription_status === 'active') {
            issues.push('⚠️  type is still "Any" (should be saved from criteria page)')
          }
          if (user.search_preferences.furnishing === 'Any' && user.subscription_status === 'active') {
            issues.push('⚠️  furnishing is still "Any" (should be saved from criteria page)')
          }
          if (user.search_preferences.min_bedrooms === undefined || user.search_preferences.min_bedrooms === null || user.search_preferences.min_bedrooms === 0) {
            if (user.subscription_status === 'active') {
              issues.push('⚠️  min_bedrooms is missing or 0 (should be saved from criteria page)')
            }
          }
        }
        
        if (issues.length > 0) {
          console.log(`\n   ⚠️  Issues found:`)
          issues.forEach(issue => console.log(`      ${issue}`))
        } else {
          console.log(`\n   ✅ No issues found`)
        }
        
        console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
      })
    } else {
      console.log(`🔍 Testing user with ID: ${userId}`)
      
      const user = await usersCollection.findOne({ _id: new mongoose.Types.ObjectId(userId) })
      
      if (!user) {
        console.error(`❌ User not found with ID: ${userId}`)
        process.exit(1)
      }
      
      console.log('\n📋 User Details:')
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
      console.log(`Name: ${user.first_name} ${user.last_name}`)
      console.log(`Email: ${user.email}`)
      console.log(`Plan: ${user.plan}`)
      console.log(`Subscription Status: ${user.subscription_status}`)
      console.log(`Onboarding Completed: ${user.onboarding_completed}`)
      console.log(`Last Payment Date: ${user.last_payment_date}`)
      console.log(`Plan Expires At: ${user.plan_expires_at}`)
      console.log(`Current Step: ${user.current_step}`)
      
      console.log('\n📋 Search Preferences:')
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
      if (user.search_preferences) {
        const prefs = user.search_preferences
        console.log(`City: ${prefs.city || '❌ MISSING'}`)
        console.log(`Min Price: ${prefs.min_price !== undefined && prefs.min_price !== null ? prefs.min_price + '€ ✅' : '❌ MISSING'}`)
        console.log(`Max Price: ${prefs.max_price || '❌ MISSING'}`)
        console.log(`Type: ${prefs.type || '❌ MISSING'}`)
        console.log(`Furnishing: ${prefs.furnishing || '❌ MISSING'}`)
        console.log(`Min Bedrooms: ${prefs.min_bedrooms !== undefined && prefs.min_bedrooms !== null ? prefs.min_bedrooms + ' ✅' : '❌ MISSING'}`)
        console.log(`Address: ${prefs.address || '❌ MISSING'}`)
        console.log(`Exact Address: ${prefs.exact_address || 'N/A'}`)
        console.log(`Radius: ${prefs.radius || 'N/A'} km`)
        if (prefs.coordinates) {
          console.log(`Coordinates: lat=${prefs.coordinates.lat}, lng=${prefs.coordinates.lng}`)
        }
        
        // Tests de validation
        console.log('\n🧪 Validation Tests:')
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
        
        const tests = []
        
        // Test 1: min_price
        if (prefs.min_price !== undefined && prefs.min_price !== null) {
          tests.push({ name: 'min_price', status: '✅', value: prefs.min_price })
        } else {
          tests.push({ name: 'min_price', status: '❌', value: 'MISSING' })
        }
        
        // Test 2: max_price
        if (prefs.max_price !== undefined && prefs.max_price !== null) {
          tests.push({ name: 'max_price', status: '✅', value: prefs.max_price })
        } else {
          tests.push({ name: 'max_price', status: '❌', value: 'MISSING' })
        }
        
        // Test 3: type
        if (prefs.type && prefs.type !== 'Any') {
          tests.push({ name: 'type', status: '✅', value: prefs.type })
        } else {
          tests.push({ name: 'type', status: '⚠️', value: prefs.type || 'MISSING (should not be "Any" if user selected)' })
        }
        
        // Test 4: furnishing
        if (prefs.furnishing && prefs.furnishing !== 'Any') {
          tests.push({ name: 'furnishing', status: '✅', value: prefs.furnishing })
        } else {
          tests.push({ name: 'furnishing', status: '⚠️', value: prefs.furnishing || 'MISSING (should not be "Any" if user selected)' })
        }
        
        // Test 5: min_bedrooms
        if (prefs.min_bedrooms !== undefined && prefs.min_bedrooms !== null && prefs.min_bedrooms > 0) {
          tests.push({ name: 'min_bedrooms', status: '✅', value: prefs.min_bedrooms })
        } else {
          tests.push({ name: 'min_bedrooms', status: '❌', value: prefs.min_bedrooms || 'MISSING (should be > 0 if user selected)' })
        }
        
        // Test 6: address
        if (prefs.address && prefs.address.trim() !== '') {
          tests.push({ name: 'address', status: '✅', value: prefs.address })
        } else {
          tests.push({ name: 'address', status: '❌', value: 'MISSING or EMPTY' })
        }
        
        // Test 7: coordinates
        if (prefs.coordinates && prefs.coordinates.lat && prefs.coordinates.lng) {
          tests.push({ name: 'coordinates', status: '✅', value: `${prefs.coordinates.lat}, ${prefs.coordinates.lng}` })
        } else {
          tests.push({ name: 'coordinates', status: '⚠️', value: 'MISSING (optional but recommended)' })
        }
        
        tests.forEach(test => {
          console.log(`${test.status} ${test.name}: ${test.value}`)
        })
        
        // Test 8: Payment and onboarding
        console.log('\n💳 Payment & Onboarding Tests:')
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
        
        if (user.subscription_status === 'active') {
          if (user.plan && user.plan !== 'empty') {
            console.log(`✅ Plan: ${user.plan}`)
          } else {
            console.log(`❌ Plan: ${user.plan} (should not be "empty" if subscription is active)`)
          }
          
          if (user.last_payment_date) {
            console.log(`✅ Last Payment Date: ${user.last_payment_date}`)
          } else {
            console.log(`❌ Last Payment Date: MISSING (should be set when payment succeeds)`)
          }
          
          if (user.plan_expires_at) {
            console.log(`✅ Plan Expires At: ${user.plan_expires_at}`)
          } else {
            console.log(`❌ Plan Expires At: MISSING (should be set when payment succeeds)`)
          }
          
          if (user.onboarding_completed === true) {
            console.log(`✅ Onboarding Completed: true`)
          } else {
            console.log(`❌ Onboarding Completed: ${user.onboarding_completed} (should be true after payment)`)
          }
        } else {
          console.log(`ℹ️  Subscription Status: ${user.subscription_status} (not active, skipping payment tests)`)
        }
        
        const failedTests = tests.filter(t => t.status === '❌')
        if (failedTests.length === 0 && user.onboarding_completed === true && user.subscription_status === 'active') {
          console.log('\n🎉 All tests passed! User preferences are correctly saved.')
        } else if (failedTests.length > 0) {
          console.log(`\n⚠️  ${failedTests.length} test(s) failed. Please check the issues above.`)
        }
      } else {
        console.log('❌ No search preferences found for this user')
      }
    }
    
  } catch (error) {
    console.error('❌ Error:', error)
    process.exit(1)
  } finally {
    await mongoose.disconnect()
    console.log('\n✅ Disconnected from MongoDB')
  }
}

testPreferences()

