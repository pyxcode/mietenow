import { BaseScraper } from '../core/base-scraper.js'

export class DetailedScraper extends BaseScraper {
  constructor(platformName) {
    super(platformName)
    this.maxConcurrent = 3 // Limiter les requêtes simultanées
  }

  async scrapeDetailedListings(listings) {
    console.log(`🔍 ${this.platformName}: Fetching detailed descriptions for ${listings.length} listings...`)
    
    const detailedListings = []
    const batches = this.chunkArray(listings, this.maxConcurrent)
    
    for (let i = 0; i < batches.length; i++) {
      const batch = batches[i]
      console.log(`   📦 Processing batch ${i + 1}/${batches.length} (${batch.length} listings)`)
      
      const batchPromises = batch.map(listing => this.fetchDetailedListing(listing))
      const batchResults = await Promise.allSettled(batchPromises)
      
      batchResults.forEach((result, index) => {
        if (result.status === 'fulfilled' && result.value) {
          detailedListings.push(result.value)
        } else {
          console.warn(`   - Failed to fetch details for listing ${batch[index].title}:`, result.reason?.message)
          // Garder le listing original si on ne peut pas récupérer les détails
          detailedListings.push(batch[index])
        }
      })
      
      // Pause entre les batches pour éviter d'être bloqué
      if (i < batches.length - 1) {
        await new Promise(resolve => setTimeout(resolve, 2000))
      }
    }
    
    console.log(`✅ ${this.platformName}: Detailed scraping completed for ${detailedListings.length} listings`)
    return detailedListings
  }

  async fetchDetailedListing(listing) {
    try {
      if (!listing.link || listing.link === 'N/A') {
        return listing
      }

      console.log(`   🔗 Fetching details for: ${listing.title}`)
      
      // Utiliser Browserless au lieu de Puppeteer
      const html = await this.fetchPageWithBrowserless(listing.link)
      if (!html) {
        return listing
      }

      // Extraire la description détaillée avec cheerio
      const description = this.extractDescription(html)
      
      return {
        ...listing,
        description: description || 'N/A'
      }
    } catch (error) {
      console.warn(`   - Error fetching details for ${listing.title}:`, error.message)
      return listing
    }
  }

  extractDescription(html) {
    try {
      // Import dynamique de cheerio
      const cheerio = require('cheerio')
      const $ = cheerio.load(html)
      
      // Méthodes d'extraction selon la plateforme
      const selectors = [
        // WG-Gesucht
        '.panel-body .truncate',
        '.panel-body p',
        '.description',
        
        // Immonet
        '.text-225',
        '.classified-description',
        '.description-text',
        
        // Immowelt
        '.description',
        '.expose-description',
        '.text-content',
        
        // Kleinanzeigen
        '.l-container-row .text',
        '.ad-description',
        '.description-text',
        
        // ImmobilienScout24
        '.is24-expose-description',
        '.expose-description',
        '.description'
      ]
      
      for (const selector of selectors) {
        const element = $(selector).first()
        if (element.length > 0) {
          const text = element.text().trim()
          if (text && text.length > 20) {
            return text
          }
        }
      }
      
      // Fallback: chercher dans tout le body
      const bodyText = $('body').text()
      const paragraphs = bodyText.split('\n').filter(p => 
        p.trim().length > 50 && 
        !p.includes('€') && 
        !p.includes('m²') &&
        !p.includes('Zimmer')
      )
      
      return paragraphs[0] ? paragraphs[0].trim() : null
      
    } catch (error) {
      console.warn('   - Error extracting description:', error.message)
      return null
    }
  }

  chunkArray(array, chunkSize) {
    const chunks = []
    for (let i = 0; i < array.length; i += chunkSize) {
      chunks.push(array.slice(i, i + chunkSize))
    }
    return chunks
  }
}