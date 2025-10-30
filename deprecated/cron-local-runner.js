#!/usr/bin/env node

/**
 * Local Cron Runner
 * Runs scraping and email reporting locally
 */

import { config } from 'dotenv'
config({ path: '.env.local' })

import { scrapeBerlinListings } from './cron-scrape-berlin-minute.js'
import { sendScrapingReport } from './cron-send-scraping-report.js'

const SCRAPE_INTERVAL = 60 * 1000 // 1 minute
const REPORT_INTERVAL = 30 * 60 * 1000 // 30 minutes

console.log('🚀 Starting Local Cron Runner')
console.log(`📅 ${new Date().toISOString()}`)
console.log(`⏰ Scraping every: ${SCRAPE_INTERVAL / 1000}s`)
console.log(`📧 Reports every: ${REPORT_INTERVAL / 1000 / 60} minutes`)
console.log('')

// Initial run
console.log('▶️ Running initial scrape...')
scrapeBerlinListings().catch(err => {
  console.error('❌ Initial scrape failed:', err.message)
})

// Run scraping every minute
const scrapeTimer = setInterval(async () => {
  console.log(`\n⏰ ${new Date().toLocaleTimeString()} - Running scrape cycle...`)
  try {
    await scrapeBerlinListings()
  } catch (error) {
    console.error('❌ Scrape cycle failed:', error.message)
  }
}, SCRAPE_INTERVAL)

// Run report every 30 minutes
const reportTimer = setInterval(async () => {
  console.log(`\n📧 ${new Date().toLocaleTimeString()} - Sending report...`)
  try {
    await sendScrapingReport()
  } catch (error) {
    console.error('❌ Report failed:', error.message)
  }
}, REPORT_INTERVAL)

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('\n\n🛑 Shutting down...')
  clearInterval(scrapeTimer)
  clearInterval(reportTimer)
  process.exit(0)
})

console.log('✅ Cron runner started. Press Ctrl+C to stop.')

