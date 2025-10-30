/**
 * Scraper HTTP simple sans Puppeteer pour Render
 * Utilise fetch() et cheerio pour le scraping
 */

const cheerio = require('cheerio')
const mongoose = require('mongoose')

class SimpleHttpScraper {
  constructor() {
    this.baseUrl = 'https://www.immobilienscout24.de'
    this.searchUrl = 'https://www.immobilienscout24.de/Suche/S-T/Wohnung-Miete/Berlin/Berlin'
  }

  async scrape() {
    try {
      console.log('🔍 Scraping ImmobilienScout24 avec fetch()...')
      
      const response = await fetch(this.searchUrl, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
          'Accept-Language': 'de-DE,de;q=0.9,en;q=0.8',
          'Accept-Encoding': 'gzip, deflate, br',
          'Connection': 'keep-alive',
          'Upgrade-Insecure-Requests': '1'
        }
      })

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }

      const html = await response.text()
      const $ = cheerio.load(html)
      
      const listings = []
      
      // Parser les annonces (structure simplifiée)
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

      console.log(`✅ ${listings.length} annonces trouvées sur ImmobilienScout24`)
      return listings

    } catch (error) {
      console.log(`❌ Erreur scraping ImmobilienScout24: ${error.message}`)
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

module.exports = { SimpleHttpScraper }
