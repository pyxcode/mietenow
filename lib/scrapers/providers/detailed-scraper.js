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
        await new Promise(resolve => setTimeout(resolve, 5000)) // Augmenté à 5 secondes
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
      
      // Ajouter un délai avant chaque requête pour éviter les erreurs 429
      await new Promise(resolve => setTimeout(resolve, 3000)) // 3 secondes
      
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
      // Utiliser une approche simple avec des regex au lieu de cheerio
      // pour éviter les conflits avec Next.js
      
      // Méthodes d'extraction selon la plateforme
      const selectors = [
        // WG-Gesucht
        'panel-body.*?truncate',
        'panel-body.*?<p',
        'description',
        
        // Immonet
        'text-225',
        'classified-description',
        'description-text',
        
        // Immowelt
        'description',
        'expose-description',
        'text-content',
        
        // Kleinanzeigen
        'l-container-row.*?text',
        'ad-description',
        'description-text',
        
        // ImmobilienScout24
        'is24-expose-description',
        'expose-description',
        'description'
      ]
      
      for (const selector of selectors) {
        const regex = new RegExp(`<[^>]*class="[^"]*${selector}[^"]*"[^>]*>([^<]*)`, 'i')
        const match = html.match(regex)
        if (match && match[1] && match[1].trim().length > 20) {
          return match[1].trim()
        }
      }
      
      // Fallback: chercher des paragraphes de texte
      const textMatches = html.match(/<p[^>]*>([^<]{50,})</gi)
      if (textMatches && textMatches.length > 0) {
        for (const match of textMatches) {
          const text = match.replace(/<[^>]*>/g, '').trim()
          if (text.length > 50 && 
              !text.includes('€') && 
              !text.includes('m²') &&
              !text.includes('Zimmer')) {
            return text
          }
        }
      }
      
      return null
      
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