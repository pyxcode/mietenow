import { BaseScraper } from './base-scraper'
import { WGGesuchtScraper } from './wg-gesucht-scraper'
import { Listing, SearchCriteria, ScraperResult } from '@/types/listing'

export class ScraperManager {
  private scrapers: BaseScraper[]
  private results: Map<string, ScraperResult> = new Map()

  constructor() {
    this.scrapers = [
      new WGGesuchtScraper(),
      // Ajouter d'autres scrapers ici
    ]
  }

  async searchAll(criteria: SearchCriteria): Promise<{
    listings: Listing[]
    results: Map<string, ScraperResult>
    totalFound: number
    errors: string[]
  }> {
    console.log(`Starting search across ${this.scrapers.length} platforms...`)
    
    const allListings: Listing[] = []
    const allErrors: string[] = []

    // Lancer tous les scrapers en parallèle
    const promises = this.scrapers.map(async (scraper) => {
      try {
        console.log(`Scraping ${scraper.constructor.name}...`)
        const result = await scraper.search(criteria)
        
        this.results.set(scraper.constructor.name, result)
        allListings.push(...result.listings)
        allErrors.push(...result.errors)
        
        console.log(`✓ ${scraper.constructor.name}: ${result.listings.length} listings found`)
        
        return result
      } catch (error) {
        const errorMsg = `${scraper.constructor.name} failed: ${error}`
        allErrors.push(errorMsg)
        console.error(`✗ ${scraper.constructor.name}:`, error)
        
        return {
          listings: [],
          totalFound: 0,
          hasMore: false,
          errors: [errorMsg]
        }
      }
    })

    // Attendre que tous les scrapers terminent
    await Promise.allSettled(promises)

    // Supprimer les doublons basés sur l'URL
    const uniqueListings = this.removeDuplicates(allListings)

    console.log(`Search completed: ${uniqueListings.length} unique listings found`)

    return {
      listings: uniqueListings,
      results: this.results,
      totalFound: uniqueListings.length,
      errors: allErrors
    }
  }

  async getListingDetails(url: string, source: string): Promise<Listing | null> {
    const scraper = this.scrapers.find(s => 
      s.constructor.name.toLowerCase().includes(source.toLowerCase())
    )

    if (!scraper) {
      console.error(`No scraper found for source: ${source}`)
      return null
    }

    return await scraper.getListingDetails(url)
  }

  private removeDuplicates(listings: Listing[]): Listing[] {
    const seen = new Set<string>()
    return listings.filter(listing => {
      const key = `${listing.source}_${listing.sourceId}`
      if (seen.has(key)) {
        return false
      }
      seen.add(key)
      return true
    })
  }

  getScrapersStatus(): Array<{
    name: string
    status: 'active' | 'error' | 'idle'
    lastResult?: ScraperResult
  }> {
    return this.scrapers.map(scraper => {
      const result = this.results.get(scraper.constructor.name)
      return {
        name: scraper.constructor.name,
        status: result ? (result.errors.length > 0 ? 'error' : 'active') : 'idle',
        lastResult: result
      }
    })
  }
}
