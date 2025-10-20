import { Listing, SearchCriteria, ScraperConfig, ScraperResult } from '@/types/listing'

export abstract class BaseScraper {
  protected config: ScraperConfig
  protected userAgent: string

  constructor(config: ScraperConfig) {
    this.config = config
    this.userAgent = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
  }

  abstract search(criteria: SearchCriteria): Promise<ScraperResult>
  abstract getListingDetails(url: string): Promise<Listing | null>

  protected async delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms))
  }

  protected cleanText(text: string): string {
    return text
      .replace(/\s+/g, ' ')
      .replace(/\n/g, ' ')
      .trim()
  }

  protected extractPrice(priceText: string): number {
    const match = priceText.match(/[\d.,]+/)
    if (!match) return 0
    
    return parseFloat(match[0].replace(',', '.'))
  }

  protected extractRooms(roomsText: string): number {
    const match = roomsText.match(/(\d+)\s*(?:Zimmer|room|pièce)/i)
    return match ? parseInt(match[1]) : 0
  }

  protected extractSize(sizeText: string): number {
    const match = sizeText.match(/(\d+)\s*m²/i)
    return match ? parseInt(match[1]) : 0
  }

  protected generateId(url: string, source: string): string {
    const urlHash = Buffer.from(url).toString('base64').slice(0, 10)
    return `${source}_${urlHash}`
  }

  protected async fetchWithRetry(url: string, retries = 3): Promise<Response> {
    for (let i = 0; i < retries; i++) {
      try {
        const response = await fetch(url, {
          headers: {
            'User-Agent': this.userAgent,
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
            'Accept-Language': 'de-DE,de;q=0.9,en;q=0.8',
            'Accept-Encoding': 'gzip, deflate, br',
            'Connection': 'keep-alive',
            'Upgrade-Insecure-Requests': '1',
          },
        })

        if (response.ok) {
          return response
        }
      } catch (error) {
        console.warn(`Attempt ${i + 1} failed for ${url}:`, error)
        if (i < retries - 1) {
          await this.delay(1000 * (i + 1))
        }
      }
    }
    
    throw new Error(`Failed to fetch ${url} after ${retries} attempts`)
  }
}
