#!/usr/bin/env node
import { config } from 'dotenv'
config({ path: '.env.local' })

import { MongoClient, ObjectId } from 'mongodb'

const MONGODB_URI = process.env.MONGODB_URI || process.env.MONGODB_URI2
const DB_NAME = 'mietenow-prod'

// Helper function to force MongoDB URI to mietenow-prod
function forceMongoUri(originalUri) {
  if (!originalUri) {
    throw new Error('MONGODB_URI environment variable is not defined')
  }

  let uri = originalUri.trim().replace(/^['"]|['"]$/g, '')

  if (uri.includes('mongodb+srv://')) {
    const match = uri.match(/mongodb\+srv:\/\/([^:]+):([^@]+)@([^/]+)\/([^?]+)?(\?.*)?/)
    if (match) {
      const [, username, password, host, , query] = match
      const shardHost = process.env.MONGODB_URI2?.replace(/^['"]|['"]$/g, '').match(/@([^:]+):/)?.[1] || host
      const cleanQuery = (query || '').replace(/[?&]directConnection=[^&]*/gi, '')
      uri = `mongodb://${username}:${password}@${shardHost}:27017/${DB_NAME}${cleanQuery || ''}`
    }
  } else {
    const uriMatch = uri.match(/^(mongodb:\/\/[^\/]+)\/?([^?]*)(\?.*)?$/)
    if (uriMatch) {
      const [, baseUri, , query] = uriMatch
      const cleanQuery = (query || '').replace(/[?&]directConnection=[^&]*/gi, '')
      uri = `${baseUri}/${DB_NAME}${cleanQuery || ''}`
    }
  }

  if (uri.includes('/test')) {
    uri = uri.replace(/\/test(\?|$)/, `/${DB_NAME}$1`)
  }

  if (!uri.includes(`/${DB_NAME}`)) {
    if (uri.includes('/?')) {
      uri = uri.replace('/?', `/${DB_NAME}?`)
    } else if (uri.endsWith('/')) {
      uri = uri + DB_NAME
    } else if (!uri.match(/\/[^\/\?]+(\?|$)/)) {
      uri = uri + '/' + DB_NAME
    }
  }

  return uri
}

async function main() {
  const email = process.argv[2] || process.env.TEST_ALERT_EMAIL || 'louan.bardou@icloud.com'
  const userId = process.argv[3] || new ObjectId().toString()

  if (!MONGODB_URI) {
    console.error('Missing MONGODB_URI')
    process.exit(1)
  }

  const forcedUri = forceMongoUri(MONGODB_URI)
  const client = new MongoClient(forcedUri)
  try {
    await client.connect()
    const db = client.db(DB_NAME)
    
    // VÉRIFICATION
    if (db.databaseName !== DB_NAME) {
      throw new Error(`CRITICAL: Connected to "${db.databaseName}" instead of "${DB_NAME}"`)
    }
    const alerts = db.collection('alerts')

    const doc = {
      user_id: new ObjectId(userId),
      email: email.toLowerCase(),
      title: `Alert for Berlin - Any`,
      active: true,
      isActive: true, // For backward compatibility with cron
      frequency: 'daily',
      created_at: new Date(),
      createdAt: new Date(), // For backward compatibility
      last_triggered_at: new Date(Date.now() - 25 * 60 * 60 * 1000), // 25 hours ago to allow triggering
      // top-level for backward-compat with cron matching
      minPrice: 0,
      maxPrice: 20000,
      criteria: {
        city: 'Berlin',
        min_price: 0,
        max_price: 20000,
        type: 'Any',
        furnishing: 'Any',
        min_surface: 0
      }
    }

    const res = await alerts.updateOne(
      { email: email.toLowerCase() },
      { $set: doc },
      { upsert: true }
    )

    console.log('Seeded alert for', email, 'result:', JSON.stringify(res))
  } finally {
    await client.close()
  }
}

main().catch(err => {
  console.error(err)
  process.exit(1)
})


