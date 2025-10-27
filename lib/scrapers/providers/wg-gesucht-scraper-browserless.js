/**
 * WG-Gesucht Scraper avec Browserless
 */

import { BaseScraper } from '../core/base-scraper-browserless.js'

export class WGGesuchtScraperBrowserless extends BaseScraper {
  constructor() {
    super('wg-gesucht')
    this.url = 'https://www.wg-gesucht.de/wohnungen-in-Berlin.8.0.1.0.html'
  }

  async scrape() {
    try {
      const html = await this.fetchPage(this.url)
      if (!html) return []

      const listings = this.extractListings(html)
      console.log(`✅ ${this.platformName}: ${listings.length} listings found`)
      
      // Enrichir avec les coordonnées géographiques
      const enrichedListings = await this.enrichListingsWithCoordinates(listings)
      
      return enrichedListings.map(listing => this.normalizeListing(listing))
    } catch (error) {
      console.error(`❌ ${this.platformName}: Scraping failed:`, error.message)
      return []
    }
  }

  extractListings(html) {
    const cheerio = require('cheerio')
    const $ = cheerio.load(html)
    
    const listings = []
    
    $('.offer_list_item').each((i, element) => {
      const $el = $(element)
      
      // Titre dans h2
      const title = $el.find('h2').text().trim()
      
      // Lien principal
      const linkElement = $el.find('a[href*="/wg-zimmer-in-Berlin"]').first()
      const link = linkElement.attr('href')
      
      // Prix (chercher dans le texte)
      const priceText = $el.text()
      const priceMatch = priceText.match(/(\d+)\s*€/)
      const price = priceMatch ? priceMatch[1] + '€' : 'N/A'
      
      // Quartier (chercher dans le lien ou le texte)
      const districtMatch = link ? link.match(/Berlin-([^.]+)/) : null
      const district = districtMatch ? districtMatch[1] : 'Berlin'
      
      if (title && title.length > 10) {
        listings.push({
          title: title.substring(0, 200),
          price: price,
          size: 'N/A', // WG-Gesucht ne donne pas toujours la taille
          rooms: 'N/A', // WG-Gesucht ne donne pas toujours le nombre de pièces
          address: district,
          link: link ? `https://www.wg-gesucht.de${link}` : null,
          platform: 'wg-gesucht',
          scrapedAt: new Date()
        })
      }
    })
    
    return listings
  }
}
