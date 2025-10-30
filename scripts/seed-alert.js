#!/usr/bin/env node
import { config } from 'dotenv'
config({ path: '.env.local' })

import { MongoClient, ObjectId } from 'mongodb'

const MONGODB_URI = process.env.MONGODB_URI || process.env.MONGODB_URI2
const DB_NAME = 'mietenow-prod'

async function main() {
  const email = process.argv[2] || process.env.TEST_ALERT_EMAIL || 'louan.bardou@icloud.com'
  const userId = process.argv[3] || new ObjectId().toString()

  if (!MONGODB_URI) {
    console.error('Missing MONGODB_URI')
    process.exit(1)
  }

  const client = new MongoClient(MONGODB_URI)
  try {
    await client.connect()
    const db = client.db(DB_NAME)
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


