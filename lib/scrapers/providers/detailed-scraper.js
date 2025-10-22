import { BaseScraper } from '../core/base-scraper.js'

export class DetailedScraper extends BaseScraper {
  constructor(platformName) {
    super(platformName)
    this.maxConcurrent = 3 // Limiter les requêtes simultanées
  }

  // Méthode pour utiliser le browser d'un autre scraper
  setBrowser(browser, page) {
    this.browser = browser
    this.page = page
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
          console.warn(`   - Failed to fetch details for listing ${batch[index].id}:`, result.reason?.message)
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
      
      // Aller sur la page de l'annonce
      await this.page.goto(listing.link, { 
        waitUntil: 'networkidle2',
        timeout: 15000 
      })
      
      // Attendre que la page se charge
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      // Extraire la description détaillée selon la plateforme
      const description = await this.extractDetailedDescription()
      
      if (description && description.length > 20) {
        return {
          ...listing,
          description: description
        }
      }
      
      return listing
      
    } catch (error) {
      console.warn(`   - Error fetching details for ${listing.id}:`, error.message)
      return listing
    }
  }

  async extractDetailedDescription() {
    try {
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
        try {
          const element = await this.page.$(selector)
          if (element) {
            const text = await this.page.evaluate(el => el.textContent, element)
            if (text && text.trim().length > 20) {
              return text.trim()
            }
          }
        } catch (e) {
          // Continuer avec le prochain sélecteur
        }
      }
      
      // Fallback: chercher dans tout le body
      const bodyText = await this.page.evaluate(() => {
        const text = document.body.textContent || ''
        // Chercher des paragraphes de description
        const paragraphs = text.split('\n').filter(p => 
          p.trim().length > 50 && 
          !p.includes('€') && 
          !p.includes('m²') &&
          !p.includes('Zimmer')
        )
        return paragraphs[0] || ''
      })
      
      return bodyText.trim()
      
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
