#!/usr/bin/env node

/**
 * Site Structure Analyzer
 * Analyse automatiquement la structure HTML de chaque site
 * et génère des patterns d'extraction spécifiques
 */

import { config } from 'dotenv'
config({ path: '.env.local' })

import * as cheerio from 'cheerio'
import { URL } from 'url'
import { writeFileSync } from 'fs'

const DEFAULT_HEADERS = {
  'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
  'Accept-Language': 'de-DE,de;q=0.9,en;q=0.8',
}

class SiteStructureAnalyzer {
  constructor() {
    this.patterns = new Map()
  }

  async fetch(url) {
    try {
      const response = await fetch(url, { headers: DEFAULT_HEADERS })
      if (!response.ok) return null
      const html = await response.text()
      return cheerio.load(html)
    } catch (error) {
      console.error(`Error fetching ${url}:`, error.message)
      return null
    }
  }

  /**
   * Analyse une page de recherche pour trouver les patterns de listings
   */
  async analyzeSearchPage(siteUrl, siteName) {
    console.log(`\n🔍 Analyse de ${siteName}...`)
    console.log(`📍 URL: ${siteUrl}`)
    
    const $ = await this.fetch(siteUrl)
    if (!$) {
      console.log(`❌ Impossible de récupérer la page`)
      return null
    }

    const analysis = {
      siteName,
      siteUrl,
      listingContainer: null,
      listingLinkPattern: null,
      pricePattern: null,
      surfacePattern: null,
      roomsPattern: null,
      imagesPattern: null,
      selectors: {},
      htmlStructure: {}
    }

    // 1. Trouver le conteneur principal des listings
    analysis.listingContainer = this.findListingContainer($)
    
    // 2. Trouver les patterns de liens vers les listings
    analysis.listingLinkPattern = this.findListingLinks($, analysis.listingContainer)
    
    // 3. Trouver les patterns de prix
    analysis.pricePattern = this.findPricePattern($, analysis.listingContainer)
    
    // 4. Trouver les patterns de surface
    analysis.surfacePattern = this.findSurfacePattern($, analysis.listingContainer)
    
    // 5. Trouver les patterns de nombre de chambres
    analysis.roomsPattern = this.findRoomsPattern($, analysis.listingContainer)
    
    // 6. Trouver les patterns d'images
    analysis.imagesPattern = this.findImagesPattern($, analysis.listingContainer)
    
    // 7. Analyser la structure HTML globale
    analysis.htmlStructure = this.analyzeHtmlStructure($)
    
    // 8. Générer les sélecteurs spécifiques
    analysis.selectors = this.generateSelectors($, analysis.listingContainer)

    return analysis
  }

  /**
   * Trouve le conteneur principal des listings
   */
  findListingContainer($) {
    const candidates = []
    
    // Chercher des patterns communs
    const commonPatterns = [
      '[class*="listing"]',
      '[class*="property"]',
      '[class*="offer"]',
      '[class*="result"]',
      '[class*="item"]',
      '[id*="listing"]',
      '[id*="property"]',
      '[id*="offer"]',
      '[data-id]',
      '[data-listing-id]',
      'article',
      '.card',
      '.tile'
    ]

    commonPatterns.forEach(pattern => {
      const elements = $(pattern)
      if (elements.length > 3) {
        candidates.push({
          selector: pattern,
          count: elements.length,
          sample: elements.first().html().substring(0, 200)
        })
      }
    })

    // Trouver des éléments répétés (liste de listings)
    $('*').each((i, el) => {
      const $el = $(el)
      const className = $el.attr('class') || ''
      const id = $el.attr('id') || ''
      
      // Compter les enfants similaires
      const children = $el.children()
      if (children.length > 3) {
        const firstChild = children.first()
        const firstClass = firstChild.attr('class') || ''
        
        // Si plusieurs enfants ont la même classe, c'est probablement une liste
        const similarChildren = children.filter((idx, child) => {
          return $(child).attr('class') === firstClass
        }).length
        
        if (similarChildren > 3) {
          candidates.push({
            selector: this.generateSelector($el),
            count: similarChildren,
            type: 'repeated-children',
            className: firstClass
          })
        }
      }
    })

    // Retourner le meilleur candidat
    candidates.sort((a, b) => b.count - a.count)
    return candidates[0] || null
  }

  /**
   * Trouve les liens vers les listings individuels
   */
  findListingLinks($, container) {
    const links = []
    const baseUrl = new URL(window?.location?.href || '')
    
    // Si on a un conteneur, chercher dedans
    const searchSpace = container ? $(container.selector) : $('body')
    
    searchSpace.find('a[href]').each((i, el) => {
      const href = $(el).attr('href')
      if (!href) return
      
      const fullUrl = new URL(href, baseUrl.origin).href
      
      // Filtrer les liens qui ressemblent à des listings
      if (this.looksLikeListingUrl(fullUrl)) {
        links.push({
          url: fullUrl,
          selector: this.generateSelector($(el)),
          text: $(el).text().trim(),
          parent: this.generateSelector($(el).parent())
        })
      }
    })

    // Trouver le pattern commun
    const patterns = this.extractCommonPattern(links.map(l => l.url))
    return {
      links: links.slice(0, 10),
      pattern: patterns.pattern,
      selector: patterns.selector,
      parentSelector: links[0]?.parent || null
    }
  }

  /**
   * Vérifie si une URL ressemble à une URL de listing
   */
  looksLikeListingUrl(url) {
    const urlLower = url.toLowerCase()
    const patterns = [
      /\/expose\//,
      /\/listing\//,
      /\/property\//,
      /\/offer\//,
      /\/anzeige\//,
      /\/wohnung\//,
      /\/apartment\//,
      /\d{6,}/, // ID numérique long
      /[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}/, // UUID
    ]
    
    return patterns.some(pattern => pattern.test(url)) &&
           !url.includes('login') &&
           !url.includes('signup') &&
           !url.includes('contact') &&
           !url.includes('about')
  }

  /**
   * Trouve le pattern de prix
   */
  findPricePattern($, container) {
    const prices = []
    const searchSpace = container ? $(container.selector) : $('body')
    
    searchSpace.find('*').each((i, el) => {
      const text = $(el).text().trim()
      const priceMatch = text.match(/(\d{1,3}(?:\.\d{3})*(?:,\d{2})?)\s*€|€\s*(\d{1,3}(?:\.\d{3})*(?:,\d{2})?)|(\d{1,4})\s*EUR/i)
      if (priceMatch) {
        prices.push({
          value: priceMatch[0],
          selector: this.generateSelector($(el)),
          text: text.substring(0, 100)
        })
      }
    })

    return {
      prices: prices.slice(0, 5),
      commonSelector: this.findCommonSelector(prices.map(p => p.selector))
    }
  }

  /**
   * Trouve le pattern de surface
   */
  findSurfacePattern($, container) {
    const surfaces = []
    const searchSpace = container ? $(container.selector) : $('body')
    
    searchSpace.find('*').each((i, el) => {
      const text = $(el).text().trim()
      const surfaceMatch = text.match(/(\d{1,4})\s*m²|(\d{1,4})\s*qm|(\d{1,4})\s*m2/i)
      if (surfaceMatch) {
        surfaces.push({
          value: surfaceMatch[0],
          selector: this.generateSelector($(el)),
          text: text.substring(0, 100)
        })
      }
    })

    return {
      surfaces: surfaces.slice(0, 5),
      commonSelector: this.findCommonSelector(surfaces.map(s => s.selector))
    }
  }

  /**
   * Trouve le pattern de nombre de chambres
   */
  findRoomsPattern($, container) {
    const rooms = []
    const searchSpace = container ? $(container.selector) : $('body')
    
    searchSpace.find('*').each((i, el) => {
      const text = $(el).text().trim()
      const roomsMatch = text.match(/(\d+)\s*(?:Zimmer|room|bedroom|bed)s?/i)
      if (roomsMatch) {
        rooms.push({
          value: roomsMatch[0],
          selector: this.generateSelector($(el)),
          text: text.substring(0, 100)
        })
      }
    })

    return {
      rooms: rooms.slice(0, 5),
      commonSelector: this.findCommonSelector(rooms.map(r => r.selector))
    }
  }

  /**
   * Trouve le pattern d'images
   */
  findImagesPattern($, container) {
    const images = []
    const searchSpace = container ? $(container.selector) : $('body')
    
    searchSpace.find('img[src]').each((i, el) => {
      const src = $(el).attr('src')
      if (src && (src.includes('photo') || src.includes('image') || src.includes('img'))) {
        images.push({
          src,
          selector: this.generateSelector($(el)),
          alt: $(el).attr('alt') || ''
        })
      }
    })

    return {
      images: images.slice(0, 5),
      commonSelector: this.findCommonSelector(images.map(img => img.selector))
    }
  }

  /**
   * Analyse la structure HTML globale
   */
  analyzeHtmlStructure($) {
    return {
      hasReact: $('*[data-reactroot]').length > 0,
      hasVue: $('*[data-v-]').length > 0,
      hasAngular: $('*[ng-app]').length > 0,
      hasJSONLD: $('script[type="application/ld+json"]').length > 0,
      mainContent: this.findMainContent($),
      metaTags: {
        description: $('meta[name="description"]').attr('content'),
        ogType: $('meta[property="og:type"]').attr('content')
      }
    }
  }

  /**
   * Trouve le contenu principal
   */
  findMainContent($) {
    const candidates = ['main', 'article', '[role="main"]', '.main-content', '#main']
    for (const selector of candidates) {
      const $el = $(selector)
      if ($el.length > 0) {
        return {
          selector,
          exists: true
        }
      }
    }
    return { selector: 'body', exists: true }
  }

  /**
   * Génère des sélecteurs optimisés
   */
  generateSelectors($, container) {
    if (!container) return {}

    const selectors = {
      listingContainer: container.selector,
      listingItem: null,
      title: null,
      price: null,
      surface: null,
      rooms: null,
      image: null,
      link: null
    }

    // Analyser le premier listing pour générer les sélecteurs
    const $container = $(container.selector)
    const $firstListing = $container.first()

    // Chercher les éléments communs dans plusieurs listings
    if ($container.length > 1) {
      const $first = $container.first()
      const $second = $container.eq(1)
      
      // Comparer les structures pour trouver les patterns communs
      this.findCommonElements($first, $second, selectors)
    }

    return selectors
  }

  /**
   * Trouve les éléments communs entre deux listings
   */
  findCommonElements($first, $second, selectors) {
    const firstChildren = $first.children().toArray()
    const secondChildren = $second.children().toArray()
    
    firstChildren.forEach((child, index) => {
      if (index < secondChildren.length) {
        const $child1 = cheerio.load(child).root()
        const $child2 = cheerio.load(secondChildren[index]).root()
        
        // Si les deux ont la même classe, c'est probablement un pattern
        const class1 = $child1.attr('class')
        const class2 = $child2.attr('class')
        
        if (class1 && class1 === class2) {
          // Vérifier le contenu pour deviner le type
          const text1 = $child1.text().trim()
          if (text1.match(/€|\d+\s*m²|\d+\s*Zimmer/i)) {
            if (!selectors.price && text1.includes('€')) {
              selectors.price = `.${class1.split(' ')[0]}`
            }
            if (!selectors.surface && text1.match(/\d+\s*m²/i)) {
              selectors.surface = `.${class1.split(' ')[0]}`
            }
            if (!selectors.rooms && text1.match(/\d+\s*Zimmer/i)) {
              selectors.rooms = `.${class1.split(' ')[0]}`
            }
          }
        }
      }
    })
  }

  /**
   * Génère un sélecteur CSS pour un élément
   */
  generateSelector($el) {
    if ($el.attr('id')) {
      return `#${$el.attr('id')}`
    }
    
    const classes = $el.attr('class')
    if (classes) {
      const firstClass = classes.split(' ')[0]
      return `.${firstClass}`
    }
    
    return $el.prop('tagName').toLowerCase()
  }

  /**
   * Trouve le sélecteur commun d'une liste
   */
  findCommonSelector(selectors) {
    if (selectors.length === 0) return null
    
    // Prendre le premier sélecteur le plus spécifique
    return selectors[0]
  }

  /**
   * Extrait le pattern commun d'une liste d'URLs
   */
  extractCommonPattern(urls) {
    if (urls.length === 0) return { pattern: null, selector: null }
    
    // Analyser la structure des URLs
    const firstUrl = urls[0]
    const patterns = {
      pattern: firstUrl,
      selector: 'a[href*="' + firstUrl.split('/').pop() + '"]'
    }
    
    return patterns
  }

  /**
   * Analyse un listing individuel pour valider les patterns
   */
  async analyzeListingPage(listingUrl, analysis) {
    console.log(`  🔍 Analyse d'un listing individuel...`)
    const $ = await this.fetch(listingUrl)
    if (!$) return null

    const listingData = {
      title: this.extractTitle($, analysis),
      price: this.extractPrice($, analysis),
      surface: this.extractSurface($, analysis),
      rooms: this.extractRooms($, analysis),
      description: this.extractDescription($, analysis),
      images: this.extractImages($, analysis)
    }

    return listingData
  }

  extractTitle($, analysis) {
    const candidates = [
      'h1',
      'h2',
      '[class*="title"]',
      '[class*="heading"]',
      'title'
    ]
    
    for (const selector of candidates) {
      const $el = $(selector).first()
      if ($el.length > 0 && $el.text().trim().length > 10) {
        return {
          selector,
          value: $el.text().trim(),
          found: true
        }
      }
    }
    
    return { selector: null, value: null, found: false }
  }

  extractPrice($, analysis) {
    const text = $('body').text()
    const priceMatch = text.match(/(\d{1,3}(?:\.\d{3})*(?:,\d{2})?)\s*€|€\s*(\d{1,3}(?:\.\d{3})*(?:,\d{2})?)/i)
    if (priceMatch) {
      return {
        value: priceMatch[0],
        found: true
      }
    }
    return { value: null, found: false }
  }

  extractSurface($, analysis) {
    const text = $('body').text()
    const surfaceMatch = text.match(/(\d{1,4})\s*m²/i)
    if (surfaceMatch) {
      return {
        value: surfaceMatch[0],
        found: true
      }
    }
    return { value: null, found: false }
  }

  extractRooms($, analysis) {
    const text = $('body').text()
    const roomsMatch = text.match(/(\d+)\s*Zimmer/i)
    if (roomsMatch) {
      return {
        value: roomsMatch[0],
        found: true
      }
    }
    return { value: null, found: false }
  }

  extractDescription($, analysis) {
    const candidates = [
      '[class*="description"]',
      '[class*="content"]',
      'article',
      '.text-content',
      'p'
    ]
    
    for (const selector of candidates) {
      const $el = $(selector).first()
      const text = $el.text().trim()
      if (text.length > 50) {
        return {
          selector,
          value: text.substring(0, 200),
          found: true
        }
      }
    }
    
    return { selector: null, value: null, found: false }
  }

  extractImages($, analysis) {
    const images = []
    $('img[src]').each((i, el) => {
      const src = $(el).attr('src')
      if (src && !src.includes('logo') && !src.includes('icon')) {
        images.push(src)
      }
    })
    return images.slice(0, 5)
  }

  /**
   * Génère un fichier de configuration pour le site
   */
  generateConfig(analysis) {
    return {
      siteName: analysis.siteName,
      siteUrl: analysis.siteUrl,
      selectors: {
        listingContainer: analysis.listingContainer?.selector || null,
        listingItem: analysis.selectors.listingItem || analysis.listingContainer?.selector || null,
        title: analysis.selectors.title || 'h1, h2',
        price: analysis.selectors.price || '[class*="price"]',
        surface: analysis.selectors.surface || '[class*="surface"], [class*="size"]',
        rooms: analysis.selectors.rooms || '[class*="room"]',
        image: analysis.selectors.image || 'img[src]',
        link: analysis.listingLinkPattern?.selector || 'a[href]'
      },
      patterns: {
        listingUrl: analysis.listingLinkPattern?.pattern || null,
        price: analysis.pricePattern?.commonSelector || null,
        surface: analysis.surfacePattern?.commonSelector || null,
        rooms: analysis.roomsPattern?.commonSelector || null
      },
      htmlStructure: analysis.htmlStructure
    }
  }
}

// CLI
async function main() {
  const sites = [
    { name: 'WG-Gesucht', url: 'https://www.wg-gesucht.de/wohnungen-in-Berlin.8.0.1.0.html' },
    { name: 'ImmobilienScout24', url: 'https://www.immobilienscout24.de/Suche/de/berlin/berlin/wohnung-mieten' },
    { name: 'ImmoWelt', url: 'https://www.immowelt.de/suche/berlin/wohnungen/mieten' },
    { name: 'eBay Kleinanzeigen', url: 'https://www.kleinanzeigen.de/s-wohnung-mieten/berlin/c182l3331' }
  ]

  const analyzer = new SiteStructureAnalyzer()
  const results = []

  for (const site of sites) {
    try {
      const analysis = await analyzer.analyzeSearchPage(site.url, site.name)
      if (analysis) {
        const config = analyzer.generateConfig(analysis)
        results.push(config)
        
        console.log(`\n✅ Configuration générée pour ${site.name}`)
        console.log(`   Conteneur: ${config.selectors.listingContainer || 'N/A'}`)
        console.log(`   Liens trouvés: ${analysis.listingLinkPattern?.links?.length || 0}`)
        
        // Sauvegarder la config
        const filename = `site-config-${site.name.toLowerCase().replace(/\s+/g, '-')}.json`
        writeFileSync(filename, JSON.stringify(config, null, 2))
        console.log(`   💾 Config sauvegardée: ${filename}`)
      }
    } catch (error) {
      console.error(`❌ Erreur pour ${site.name}:`, error.message)
    }
  }

  console.log(`\n📊 Résumé: ${results.length} configurations générées`)
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(console.error)
}

export { SiteStructureAnalyzer }

