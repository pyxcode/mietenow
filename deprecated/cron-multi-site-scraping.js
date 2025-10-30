#!/usr/bin/env node

/**
 * Cron Job for Multi-Site Scraping
 * Designed for Render.com - no external dependencies needed
 * Runs multi-site crawler and saves to MongoDB
 */

// Load environment variables
import { config } from 'dotenv'
config({ path: '.env.local' })

import { scrapeAll } from './multi-site-crawler.js'

console.log('🚀 Starting scheduled multi-site scraping...')
console.log(`⏰ Time: ${new Date().toISOString()}`)

scrapeAll()
  .then((results) => {
    const successful = results.filter(r => r.success).length
    const failed = results.filter(r => !r.success).length
    
    console.log('\n' + '='.repeat(60))
    console.log('✅ CRON JOB COMPLETED')
    console.log('='.repeat(60))
    console.log(`✅ Successful: ${successful}/${results.length}`)
    console.log(`❌ Failed: ${failed}/${results.length}`)
    
    // Exit with code 0 if at least some sites succeeded
    process.exit(successful > 0 ? 0 : 1)
  })
  .catch((error) => {
    console.error('\n❌ CRON JOB FAILED:', error)
    process.exit(1)
  })

