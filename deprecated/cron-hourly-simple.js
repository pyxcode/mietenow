#!/usr/bin/env node

/**
 * Script de cron simplifié pour le scraping automatique
 * Utilise l'API au lieu des imports directs
 */

const https = require('https')
const http = require('http')
const fs = require('fs')
const path = require('path')

const LOG_DIR = path.join(process.cwd(), 'logs')
const LOG_FILE = path.join(LOG_DIR, 'cron-hourly.log')

// Créer le dossier de logs s'il n'existe pas
if (!fs.existsSync(LOG_DIR)) {
  fs.mkdirSync(LOG_DIR, { recursive: true })
}

function log(message) {
  const timestamp = new Date().toISOString()
  const logMessage = `[${timestamp}] ${message}\n`
  
  console.log(logMessage.trim())
  fs.appendFileSync(LOG_FILE, logMessage)
}

function makeRequest(url, options = {}) {
  return new Promise((resolve, reject) => {
    const isHttps = url.startsWith('https://')
    const client = isHttps ? https : http
    
    const req = client.request(url, options, (res) => {
      let data = ''
      
      res.on('data', (chunk) => {
        data += chunk
      })
      
      res.on('end', () => {
        try {
          const jsonData = JSON.parse(data)
          resolve({ status: res.statusCode, data: jsonData })
        } catch (error) {
          resolve({ status: res.statusCode, data: data })
        }
      })
    })
    
    req.on('error', (error) => {
      reject(error)
    })
    
    if (options.body) {
      req.write(options.body)
    }
    
    req.end()
  })
}

async function runScraping() {
  try {
    log('🚀 Starting hourly scraping...')
    
    // Appeler l'API de scraping
    const response = await makeRequest('http://localhost:3000/api/scrape/run', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      }
    })
    
    if (response.status === 200 && response.data.success) {
      const { data } = response.data
      log(`✅ Scraping completed successfully`)
      log(`📊 Total found: ${data.total || 'N/A'}`)
      log(`💾 New saved: ${data.saved || 'N/A'}`)
      
      if (data.platforms) {
        log('📋 By platform:')
        Object.entries(data.platforms).forEach(([platform, stats]) => {
          log(`   - ${platform}: ${stats.found || 0} found, ${stats.saved || 0} saved`)
        })
      }
      
      return { success: true, data }
    } else {
      log(`❌ Scraping failed: ${response.data.message || 'Unknown error'}`)
      return { success: false, error: response.data.message }
    }
    
  } catch (error) {
    log(`💥 Scraping error: ${error.message}`)
    return { success: false, error: error.message }
  }
}

async function checkListingStatuses() {
  try {
    log('🔍 Checking listing statuses...')
    
    const response = await makeRequest('http://localhost:3000/api/scrape/check-status', {
      method: 'GET'
    })
    
    if (response.status === 200 && response.data.success) {
      const { data } = response.data
      log(`✅ Status check completed`)
      log(`📊 Checked: ${data.checked || 0}`)
      log(`❌ Removed: ${data.removed || 0}`)
      return { success: true, data }
    } else {
      log(`❌ Status check failed: ${response.data.message || 'Unknown error'}`)
      return { success: false, error: response.data.message }
    }
    
  } catch (error) {
    log(`💥 Status check error: ${error.message}`)
    return { success: false, error: error.message }
  }
}

async function cleanupOldLogs() {
  try {
    const files = fs.readdirSync(LOG_DIR)
    const now = Date.now()
    const sevenDaysAgo = now - (7 * 24 * 60 * 60 * 1000)
    
    let cleanedCount = 0
    
    files.forEach(file => {
      const filePath = path.join(LOG_DIR, file)
      const stats = fs.statSync(filePath)
      
      if (stats.mtime.getTime() < sevenDaysAgo) {
        fs.unlinkSync(filePath)
        cleanedCount++
      }
    })
    
    if (cleanedCount > 0) {
      log(`🧹 Cleaned up ${cleanedCount} old log files`)
    }
    
    return cleanedCount
    
  } catch (error) {
    log(`⚠️ Log cleanup error: ${error.message}`)
    return 0
  }
}

async function main() {
  const startTime = Date.now()
  
  try {
    log('🕐 Starting hourly cron job...')
    
    // 1. Nettoyer les anciens logs
    const cleanedCount = await cleanupOldLogs()
    
    // 2. Vérifier les statuts des annonces
    const statusResults = await checkListingStatuses()
    
    // 3. Lancer le scraping
    const scrapingResults = await runScraping()
    
    const duration = Date.now() - startTime
    log(`🎉 Cron job completed successfully in ${Math.round(duration / 1000)}s`)
    log(`📊 Summary: ${cleanedCount} cleaned, ${scrapingResults.success ? 'scraping OK' : 'scraping failed'}`)
    
    process.exit(0)
    
  } catch (error) {
    const duration = Date.now() - startTime
    log(`💥 Cron job failed after ${Math.round(duration / 1000)}s: ${error.message}`)
    process.exit(1)
  }
}

// Gestion des signaux pour un arrêt propre
process.on('SIGINT', () => {
  log('⚠️ Received SIGINT, shutting down gracefully...')
  process.exit(0)
})

process.on('SIGTERM', () => {
  log('⚠️ Received SIGTERM, shutting down gracefully...')
  process.exit(0)
})

// Exécuter le script
main()
