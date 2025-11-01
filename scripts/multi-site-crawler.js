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

// Import de la liste centralisée des sites à scraper
import { SCRAPING_SITES, TOP_10_SITES, TOP_20_SITES } from './scraping-sites.js'

// Utiliser la liste centralisée
const TOP_5_SITES = SCRAPING_SITES

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

// Exporter les sites pour compatibilité avec les autres scripts
export { scrapeAll, scrapeSite, TOP_5_SITES, TOP_10_SITES, TOP_20_SITES }
