/**
 * Scraper utilisant Browserless.io (Chrome distant)
 * Plus économique et fiable que l'auto-hébergement
 */

const cheerio = require('cheerio')
const mongoose = require('mongoose')

class BrowserlessScraper {
  constructor() {
    this.browserlessUrl = 'https://production-sfo.browserless.io'
    this.token = process.env.BROWSERLESS_TOKEN || 'your-token-here'
    this.baseUrl = 'https://www.immobilienscout24.de'
    this.searchUrl = 'https://www.immobilienscout24.de/Suche/S-T/Wohnung-Miete/Berlin/Berlin'
  }

  async scrapeWithBrowserless() {
    try {
      console.log('🔍 Scraping avec Browserless.io...')
      
      const response = await fetch(`${this.browserlessUrl}/content?token=${this.token}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          url: this.searchUrl,
          waitFor: 3000,
          waitUntil: 'networkidle0',
          viewport: {
            width: 1920,
            height: 1080
          },
          userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
        })
      })

      if (!response.ok) {
        throw new Error(`Browserless error: ${response.status} ${response.statusText}`)
      }

      const html = await response.text()
      const $ = cheerio.load(html)
      
      const listings = []
      
      // Parser les annonces ImmobilienScout24
      $('.result-list-entry').each((index, element) => {
        try {
          const $el = $(element)
          
          const title = $el.find('.result-list-entry__brand-title').text().trim() || 
                       $el.find('h3').text().trim() || 
                       'Titre non disponible'
          
          const price = $el.find('.result-list-entry__brand-price').text().trim() || 
                       $el.find('.font-semibold').text().trim() || 
                       'Prix non disponible'
          
          const size = $el.find('.result-list-entry__brand-size').text().trim() || 
                      $el.find('.font-semibold').next().text().trim() || 
                      'Taille non disponible'
          
          const link = $el.find('a').attr('href')
          const fullLink = link ? `${this.baseUrl}${link}` : null
          
          const image = $el.find('img').attr('src') || 
                       $el.find('img').attr('data-src') || 
                       null
          
          if (title && title !== 'Titre non disponible' && fullLink) {
            listings.push({
              title: title,
              price: price,
              size: size,
              rooms: null,
              type: 'Apartment',
              furnished: false,
              address: 'Berlin, Germany',
              link: fullLink,
              image: image,
              description: 'N/A',
              lat: 52.5200,
              lng: 13.4050,
              formatted_address: 'Berlin, Germany',
              platform: 'immobilienScout24',
              scrapedAt: new Date(),
              createdAt: new Date(),
              updatedAt: new Date(),
              imageSource: 'original'
            })
          }
        } catch (error) {
          console.log(`⚠️ Erreur parsing annonce ${index}: ${error.message}`)
        }
      })

      console.log(`✅ ${listings.length} annonces trouvées avec Browserless`)
      return listings

    } catch (error) {
      console.log(`❌ Erreur Browserless: ${error.message}`)
      return []
    }
  }

  async scrapeWGGesucht() {
    try {
      console.log('🔍 Scraping WG-Gesucht avec Browserless...')
      
      const wgUrl = 'https://www.wg-gesucht.de/wohnungen-in-Berlin.8.0.1.0.html'
      
      const response = await fetch(`${this.browserlessUrl}/content?token=${this.token}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          url: wgUrl,
          waitFor: 3000,
          waitUntil: 'networkidle0',
          viewport: {
            width: 1920,
            height: 1080
          },
          userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
        })
      })

      if (!response.ok) {
        throw new Error(`Browserless error: ${response.status} ${response.statusText}`)
      }

      const html = await response.text()
      const $ = cheerio.load(html)
      
      const listings = []
      
      // Parser les annonces WG-Gesucht
      $('.offer_list_item').each((index, element) => {
        try {
          const $el = $(element)
          
          const title = $el.find('.headline').text().trim() || 'Titre non disponible'
          const price = $el.find('.rent').text().trim() || 'Prix non disponible'
          const size = $el.find('.size').text().trim() || 'Taille non disponible'
          const link = $el.find('a').attr('href')
          const fullLink = link ? `https://www.wg-gesucht.de${link}` : null
          const image = $el.find('img').attr('src') || null
          
          if (title && title !== 'Titre non disponible' && fullLink) {
            listings.push({
              title: title,
              price: price,
              size: size,
              rooms: null,
              type: 'Room',
              furnished: false,
              address: 'Berlin, Germany',
              link: fullLink,
              image: image,
              description: 'N/A',
              lat: 52.5200,
              lng: 13.4050,
              formatted_address: 'Berlin, Germany',
              platform: 'wg-gesucht',
              scrapedAt: new Date(),
              createdAt: new Date(),
              updatedAt: new Date(),
              imageSource: 'original'
            })
          }
        } catch (error) {
          console.log(`⚠️ Erreur parsing WG-Gesucht ${index}: ${error.message}`)
        }
      })

      console.log(`✅ ${listings.length} annonces WG-Gesucht trouvées`)
      return listings

    } catch (error) {
      console.log(`❌ Erreur WG-Gesucht: ${error.message}`)
      return []
    }
  }

  async scrapeAll() {
    try {
      console.log('🚀 Démarrage du scraping avec Browserless...')
      
      const allListings = []
      
      // Scraper ImmobilienScout24
      const immoListings = await this.scrapeWithBrowserless()
      allListings.push(...immoListings)
      
      // Scraper WG-Gesucht
      const wgListings = await this.scrapeWGGesucht()
      allListings.push(...wgListings)
      
      return allListings
      
    } catch (error) {
      console.log(`❌ Erreur scraping global: ${error.message}`)
      return []
    }
  }

  async saveListings(listings) {
    try {
      const Listing = require('./models/Listing.js')
      let savedCount = 0

      for (const listingData of listings) {
        try {
          // Vérifier si l'annonce existe déjà
          const existingListing = await Listing.findOne({
            platform: listingData.platform,
            link: listingData.link
          })

          if (!existingListing) {
            const listing = new Listing(listingData)
            await listing.save()
            savedCount++
            console.log(`✅ Annonce sauvegardée: ${listingData.title}`)
          } else {
            console.log(`⚠️ Annonce déjà existante: ${listingData.title}`)
          }
        } catch (error) {
          console.log(`❌ Erreur sauvegarde annonce ${listingData.title}: ${error.message}`)
        }
      }

      return savedCount
    } catch (error) {
      console.log(`❌ Erreur sauvegarde: ${error.message}`)
      return 0
    }
  }
}

module.exports = { BrowserlessScraper }
