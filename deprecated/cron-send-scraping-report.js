#!/usr/bin/env node

/**
 * Cron Job - Send scraping report email every 30 minutes
 * Reads stats from logs/scraping-stats.json and sends email summary
 */

import { config } from 'dotenv'
config({ path: '.env.local' })

import { readFileSync, existsSync } from 'fs'
import { join } from 'path'
import sgMail from '@sendgrid/mail'

const STATS_FILE = join(process.cwd(), 'logs', 'scraping-stats.json')

// Configure SendGrid
if (process.env.APIKEYSENDGRID) {
  sgMail.setApiKey(process.env.APIKEYSENDGRID)
}

async function sendScrapingReport() {
  console.log('\n📧 Preparing scraping report email...')
  console.log(`📅 ${new Date().toISOString()}`)
  
  // Load stats
  if (!existsSync(STATS_FILE)) {
    console.log('⚠️ No stats file found, skipping report')
    return
  }
  
  let stats
  try {
    stats = JSON.parse(readFileSync(STATS_FILE, 'utf8'))
  } catch (error) {
    console.error('❌ Error reading stats file:', error.message)
    return
  }
  
  // Calculate stats for last 30 minutes
  const thirtyMinutesAgo = Date.now() - 30 * 60 * 1000
  const recentCycles = stats.cycles?.filter(c => {
    const cycleTime = new Date(c.timestamp).getTime()
    return cycleTime >= thirtyMinutesAgo
  }) || []
  
  // Calculate totals
  const successfulCycles = recentCycles.filter(c => c.errors.length === 0)
  const failedCycles = recentCycles.filter(c => c.errors.length > 0)
  
  // Get MongoDB count for new listings
  let newListingsCount = 0
  try {
    const { MongoClient } = await import('mongodb')
    const mongoUri = process.env.MONGODB_URI || process.env.MONGODB_URI2
    let mongoUriConverted = mongoUri
    
    if (mongoUri && mongoUri.includes('mongodb+srv://')) {
      const match = mongoUri.match(/mongodb\+srv:\/\/([^:]+):([^@]+)@([^/]+)\/([^?]+)(\?.*)?/)
      if (match) {
        const [, u, p, h, d, q] = match
        mongoUriConverted = `mongodb://${u}:${p}@${h}:27017/${d}${q || ''}`
      }
    }
    
    if (mongoUriConverted && mongoUriConverted.includes('/?') && !mongoUriConverted.includes('mietenow-prod')) {
      mongoUriConverted = mongoUriConverted.replace('/?', '/mietenow-prod?')
    } else if (mongoUriConverted && !mongoUriConverted.includes('mietenow-prod')) {
      mongoUriConverted = mongoUriConverted.replace(/\/[^/]*(\?|$)/, '/mietenow-prod$1')
    }
    
    const client = new MongoClient(mongoUriConverted)
    await client.connect()
    const db = client.db('mietenow-prod')
    const collection = db.collection('listings')
    
    const thirtyMinutesAgoDate = new Date(thirtyMinutesAgo)
    newListingsCount = await collection.countDocuments({
      active: { $ne: false },
      $or: [
        { createdAt: { $gte: thirtyMinutesAgoDate } },
        { scraped_at: { $gte: thirtyMinutesAgoDate } }
      ]
    })
    
    await client.close()
  } catch (error) {
    console.error('❌ Error getting MongoDB count:', error.message)
  }
  
  // Build email HTML
  const emailHTML = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>Scraping Report - Berlin Listings</title>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #00BFA6; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
        .content { background: #f9f9f9; padding: 20px; border-radius: 0 0 8px 8px; }
        .stat-box { background: white; margin: 10px 0; padding: 15px; border-radius: 8px; border-left: 4px solid #00BFA6; }
        .stat-number { font-size: 32px; font-weight: bold; color: #00BFA6; }
        .stat-label { color: #666; margin-top: 5px; }
        .success { border-left-color: #4CAF50; }
        .error { border-left-color: #f44336; }
        .footer { text-align: center; margin-top: 20px; color: #666; font-size: 12px; }
        table { width: 100%; border-collapse: collapse; margin: 20px 0; }
        th, td { padding: 10px; text-align: left; border-bottom: 1px solid #ddd; }
        th { background: #00BFA6; color: white; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>📊 Scraping Report - Berlin Listings</h1>
          <p>Last 30 Minutes Summary</p>
          <p style="font-size: 14px;">${new Date().toLocaleString()}</p>
        </div>
        
        <div class="content">
          <div class="stat-box success">
            <div class="stat-number">${newListingsCount}</div>
            <div class="stat-label">New Listings Scraped & Saved to MongoDB</div>
          </div>
          
          <div class="stat-box">
            <div class="stat-number">${recentCycles.length}</div>
            <div class="stat-label">Scraping Cycles Completed</div>
          </div>
          
          <div class="stat-box ${successfulCycles.length > 0 ? 'success' : ''}">
            <div class="stat-number">${successfulCycles.length}</div>
            <div class="stat-label">Successful Cycles</div>
          </div>
          
          ${failedCycles.length > 0 ? `
          <div class="stat-box error">
            <div class="stat-number">${failedCycles.length}</div>
            <div class="stat-label">Failed Cycles</div>
          </div>
          ` : ''}
          
          <h3>Site Performance (Last 30 Min)</h3>
          <table>
            <thead>
              <tr>
                <th>Site</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              ${TOP_20_SITES.slice(0, 10).map(site => {
                const siteCycles = recentCycles.filter(c => 
                  c.sites?.some(s => s.name === site.name)
                )
                const siteSuccess = siteCycles.every(c => 
                  c.sites?.find(s => s.name === site.name)?.success !== false
                )
                return `
                  <tr>
                    <td>${site.name}</td>
                    <td>${siteSuccess ? '✅ OK' : '⚠️ Errors'}</td>
                  </tr>
                `
              }).join('')}
            </tbody>
          </table>
          
          ${failedCycles.length > 0 ? `
          <h3>Errors (Last 30 Min)</h3>
          <div style="background: #ffebee; padding: 15px; border-radius: 8px; margin: 20px 0;">
            ${failedCycles.map(cycle => `
              <p><strong>${new Date(cycle.timestamp).toLocaleString()}:</strong></p>
              <ul>
                ${cycle.errors.map(e => `<li>${e.site || e.type}: ${e.error}</li>`).join('')}
              </ul>
            `).join('')}
          </div>
          ` : ''}
        </div>
        
        <div class="footer">
          <p>MieteNow - Automated Berlin Listings Scraper</p>
          <p>This is an automated report. Scraping runs every minute.</p>
        </div>
      </div>
    </body>
    </html>
  `
  
  // Send email to louan.bardou@icloud.com
  const recipientEmail = 'louan.bardou@icloud.com'
  
  if (!process.env.APIKEYSENDGRID) {
    console.log('⚠️ SendGrid not configured, skipping email send')
    console.log('📊 Report would be sent to:', recipientEmail)
    console.log(`   New listings: ${newListingsCount}`)
    console.log(`   Cycles: ${recentCycles.length}`)
    return
  }
  
  try {
    const msg = {
      to: recipientEmail,
      from: 'julia@mietenow.iqorbis.com',
      subject: `📊 Berlin Scraping Report - ${newListingsCount} new listings (Last 30min)`,
      html: emailHTML,
      text: `Berlin Scraping Report\n\nNew Listings: ${newListingsCount}\nCycles: ${recentCycles.length}\nSuccessful: ${successfulCycles.length}\nFailed: ${failedCycles.length}`
    }
    
    await sgMail.send(msg)
    console.log(`✅ Report email sent to ${recipientEmail}`)
    
  } catch (error) {
    console.error('❌ Error sending email:', error.message)
  }
}

// Import TOP_20_SITES
import { TOP_20_SITES } from './multi-site-crawler.js'

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}` || process.argv[1]?.endsWith('cron-send-scraping-report.js')) {
  sendScrapingReport()
    .then(() => {
      console.log('\n✅ Report generation completed')
      process.exit(0)
    })
    .catch((error) => {
      console.error('\n❌ Report generation failed:', error)
      process.exit(1)
    })
}

export { sendScrapingReport }

