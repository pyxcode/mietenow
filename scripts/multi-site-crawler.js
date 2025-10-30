#!/usr/bin/env node

/**
 * Multi-Site HTTP-Only Crawler
 * Scrapes top 20 German rental websites
 * 10 listings per site
 * 
 * NO GPT - Pure HTTP-only crawling with HTML parsing and regex
 */

// Load environment variables
import { config } from 'dotenv'
config({ path: '.env.local' })

import { writeFileSync } from 'fs'

// Top 5 WORKING German rental websites (Berlin-focused, long-term rentals only)
// Based on health check results - only websites that are reachable and contain rental listings
const TOP_5_SITES = [
  {
    name: 'WG-Gesucht',
    url: 'https://www.wg-gesucht.de/wohnungen-in-Berlin.8.0.1.0.html',
    provider: 'wg-gesucht',
    type: 'rental',
    status: 'working'
  },
  {
    name: 'ImmoWelt',
    url: 'https://www.immowelt.de/suche/berlin/wohnungen/mieten',
    provider: 'immowelt',
    type: 'rental',
    status: 'working'
  },
  {
    name: 'ImmoNet',
    url: 'https://www.immonet.de/immobiliensuche/sel.do?objecttype=2&sortby=20&marketingtype=1&locationname=Berlin',
    provider: 'immonet',
    type: 'rental',
    status: 'working'
  },
  {
    name: 'eBay Kleinanzeigen',
    url: 'https://www.kleinanzeigen.de/s-wohnung-mieten/berlin/c182l3331',
    provider: 'kleinanzeigen',
    type: 'rental',
    status: 'working'
  },
  {
    name: 'Immopool',
    url: 'https://www.immopool.de/immobilien/wohnungen/berlin/mieten',
    provider: 'immopool',
    type: 'rental',
    status: 'working'
  }
]

// Legacy support - keep old names for compatibility
const TOP_10_SITES = TOP_5_SITES
const TOP_20_SITES = TOP_5_SITES

// Import HttpOnlyCrawler at top level
let HttpOnlyCrawler
async function initCrawler() {
  if (!HttpOnlyCrawler) {
    const module = await import('./http-only-crawler.js')
    HttpOnlyCrawler = module.default || module.HttpOnlyCrawler
  }
  return HttpOnlyCrawler
}

async function scrapeSite(site, maxListings = null) { // null = no limit, scrape all
  console.log(`\n${'='.repeat(60)}`)
  console.log(`🔍 Scraping: ${site.name}`)
  console.log(`📍 URL: ${site.url}`)
  console.log(`🎯 Target: ${maxListings} listings`)
  console.log('='.repeat(60))
  
  try {
    const CrawlerClass = await initCrawler()
    
    if (!CrawlerClass) {
      throw new Error('HttpOnlyCrawler not found in module')
    }
    
    const crawler = new CrawlerClass(site.url, {
      maxListings: maxListings,
      saveToMongo: true
    })
    
    await crawler.crawl()
    return { success: true, site: site.name }
  } catch (error) {
    console.error(`❌ ${site.name}: Error - ${error.message}`)
    return { success: false, site: site.name, error: error.message }
  }
}

async function scrapeAll() {
  console.log('\n🚀 Starting Multi-Site Crawler')
  console.log(`📊 Target: ${TOP_20_SITES.length} websites`)
  console.log(`🎯 Per site: 10 listings`)
  console.log(`📝 Method: HTTP-only (NO GPT - Pure HTML parsing + regex)`)
  console.log(`💾 Storage: MongoDB`)
  
  const results = []
  const startTime = Date.now()
  
  for (let i = 0; i < TOP_20_SITES.length; i++) {
    const site = TOP_20_SITES[i]
    
    try {
      const result = await scrapeSite(site, 10)
      results.push({
        ...result,
        index: i + 1,
        url: site.url
      })
    } catch (error) {
      console.error(`❌ Failed to scrape ${site.name}:`, error)
      results.push({
        success: false,
        site: site.name,
        index: i + 1,
        url: site.url,
        error: error.message || 'Unknown error'
      })
    }
      
    // Delay between sites to avoid rate limiting
    if (i < TOP_20_SITES.length - 1) {
      console.log(`\n⏳ Waiting 3 seconds before next site...`)
      await new Promise(resolve => setTimeout(resolve, 3000))
    }
  }
  
  const endTime = Date.now()
  const duration = ((endTime - startTime) / 1000 / 60).toFixed(2)
  
  // Summary
  console.log('\n' + '='.repeat(60))
  console.log('📊 SCRAPING SUMMARY')
  console.log('='.repeat(60))
  console.log(`Total sites: ${TOP_20_SITES.length}`)
  console.log(`Successful: ${results.filter(r => r.success).length}`)
  console.log(`Failed: ${results.filter(r => !r.success).length}`)
  console.log(`Duration: ${duration} minutes`)
  console.log('\nDetailed Results:')
  
  results.forEach((result, index) => {
    const status = result.success ? '✅' : '❌'
    console.log(`${status} ${index + 1}. ${result.site} - ${result.success ? 'Success' : 'Failed'}`)
  })
  
  // Save results to file
  const report = {
    timestamp: new Date().toISOString(),
    totalSites: TOP_20_SITES.length,
    successful: results.filter(r => r.success).length,
    failed: results.filter(r => !r.success).length,
    duration: `${duration} minutes`,
    results: results
  }
  
  const filename = `multi-site-crawl-${Date.now()}.json`
  writeFileSync(filename, JSON.stringify(report, null, 2))
  console.log(`\n📄 Report saved to: ${filename}`)
  
  return results
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}` || process.argv[1]?.endsWith('multi-site-crawler.js')) {
  scrapeAll()
    .then(() => {
      console.log('\n✅ Multi-site crawling completed!')
      process.exit(0)
    })
    .catch((error) => {
      console.error('\n❌ Multi-site crawling failed:', error)
      process.exit(1)
    })
}

export { scrapeAll, TOP_20_SITES, TOP_10_SITES, scrapeSite }
