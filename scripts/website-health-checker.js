#!/usr/bin/env node

/**
 * Website Health Checker
 * Tests all websites and provides working URLs
 */

import { config } from 'dotenv'
config({ path: '.env.local' })

import { TOP_10_SITES } from './multi-site-crawler.js'

// Test a single website
async function testWebsite(site) {
  console.log(`\n🔍 Testing: ${site.name}`)
  console.log(`📍 URL: ${site.url}`)
  
  try {
    const response = await fetch(site.url, {
      method: 'GET',
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.5',
        'Accept-Encoding': 'gzip, deflate',
        'Connection': 'keep-alive',
        'Upgrade-Insecure-Requests': '1'
      },
      timeout: 10000
    })
    
    const status = response.status
    const contentType = response.headers.get('content-type') || 'unknown'
    const contentLength = response.headers.get('content-length') || 'unknown'
    
    console.log(`   Status: ${status}`)
    console.log(`   Content-Type: ${contentType}`)
    console.log(`   Content-Length: ${contentLength}`)
    
    if (status === 200) {
      const html = await response.text()
      const hasListings = checkForListings(html, site.provider)
      
      console.log(`   ✅ Website is reachable`)
      console.log(`   📊 Has listings: ${hasListings ? 'Yes' : 'No'}`)
      
      return {
        name: site.name,
        url: site.url,
        provider: site.provider,
        status: 'working',
        httpStatus: status,
        contentType,
        hasListings,
        lastChecked: new Date().toISOString()
      }
    } else {
      console.log(`   ❌ Website returned status ${status}`)
      return {
        name: site.name,
        url: site.url,
        provider: site.provider,
        status: 'error',
        httpStatus: status,
        error: `HTTP ${status}`,
        lastChecked: new Date().toISOString()
      }
    }
  } catch (error) {
    console.log(`   ❌ Error: ${error.message}`)
    return {
      name: site.name,
      url: site.url,
      provider: site.provider,
      status: 'error',
      error: error.message,
      lastChecked: new Date().toISOString()
    }
  }
}

// Check if HTML contains rental listings
function checkForListings(html, provider) {
  const lowerHtml = html.toLowerCase()
  
  // Common rental listing indicators
  const indicators = [
    'miete', 'rent', 'wohnung', 'apartment', 'zimmer', 'room',
    '€', 'euro', 'preis', 'price', 'qm', 'm²', 'square',
    'verfügbar', 'available', 'frei', 'free'
  ]
  
  // Provider-specific indicators
  const providerIndicators = {
    'wg-gesucht': ['wg-gesucht', 'wohnung', 'zimmer'],
    'immowelt': ['immowelt', 'expose', 'objekt'],
    'immonet': ['immonet', 'expose', 'objekt'],
    'kleinanzeigen': ['kleinanzeigen', 'anzeige', 'inserat'],
    'immoscout': ['immobilienscout', 'expose', 'objekt'],
    'wohnen': ['wohnen.de', 'expose', 'objekt'],
    'immopool': ['immopool', 'expose', 'objekt'],
    'wohnungsboerse': ['wohnungsboerse', 'expose', 'objekt'],
    'immotop': ['immotop', 'expose', 'objekt'],
    'immowelt24': ['immowelt24', 'expose', 'objekt']
  }
  
  const providerSpecific = providerIndicators[provider] || []
  const allIndicators = [...indicators, ...providerSpecific]
  
  let matchCount = 0
  for (const indicator of allIndicators) {
    if (lowerHtml.includes(indicator)) {
      matchCount++
    }
  }
  
  return matchCount >= 3
}

// Test all websites
async function checkAllWebsites() {
  console.log('🚀 Starting Website Health Check...')
  console.log(`📊 Testing ${TOP_10_SITES.length} websites`)
  
  const results = []
  
  for (let i = 0; i < TOP_10_SITES.length; i++) {
    const site = TOP_10_SITES[i]
    const result = await testWebsite(site)
    results.push(result)
    
    // Wait between tests to be respectful
    if (i < TOP_10_SITES.length - 1) {
      await new Promise(resolve => setTimeout(resolve, 2000))
    }
  }
  
  // Generate summary
  const working = results.filter(r => r.status === 'working')
  const errors = results.filter(r => r.status === 'error')
  
  console.log('\n' + '='.repeat(60))
  console.log('📊 WEBSITE HEALTH SUMMARY')
  console.log('='.repeat(60))
  console.log(`Total websites: ${results.length}`)
  console.log(`Working: ${working.length}`)
  console.log(`Errors: ${errors.length}`)
  
  console.log('\n✅ Working websites:')
  working.forEach(site => {
    console.log(`   ${site.name} - ${site.url}`)
  })
  
  console.log('\n❌ Error websites:')
  errors.forEach(site => {
    console.log(`   ${site.name} - ${site.error}`)
  })
  
  // Save results
  const report = {
    timestamp: new Date().toISOString(),
    totalWebsites: results.length,
    working: working.length,
    errors: errors.length,
    results
  }
  
  const filename = `website-health-check-${Date.now()}.json`
  const fs = await import('fs')
  fs.writeFileSync(filename, JSON.stringify(report, null, 2))
  console.log(`\n📄 Report saved to: ${filename}`)
  
  return report
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}` || process.argv[1]?.endsWith('website-health-checker.js')) {
  checkAllWebsites()
    .then(() => {
      console.log('\n✅ Health check completed!')
      process.exit(0)
    })
    .catch((error) => {
      console.error('\n❌ Health check failed:', error)
      process.exit(1)
    })
}

export { checkAllWebsites, testWebsite }
