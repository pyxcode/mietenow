#!/usr/bin/env node

/**
 * HTTP-Only Real Estate Crawler
 * Crawls and extracts listing information without JavaScript execution
 * Integrated with MongoDB for persistence
 */

// Load environment variables
import { config } from 'dotenv'
config({ path: '.env.local' })

import * as cheerio from 'cheerio'
import { URL } from 'url'
import { writeFileSync } from 'fs'
import crypto from 'crypto'
import { MongoClient } from 'mongodb'
import { getSiteConfig } from './site-configs.js'
// Dynamic import for OpenAI to avoid errors if not configured
let extractListingWithOpenAI = null
async function loadOpenAIExtractor() {
  if (!extractListingWithOpenAI && process.env.OPENAI_API_KEY) {
    try {
      const module = await import('../lib/openai-extractor.js')
      extractListingWithOpenAI = module.extractListingWithOpenAI
    } catch (e) {
      console.log('⚠️ OpenAI module not available:', e.message)
    }
  }
  return extractListingWithOpenAI
}

const DEFAULT_HEADERS = {
  'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
  'Accept-Language': 'de-DE,de;q=0.9,en;q=0.8',
  'Accept-Encoding': 'gzip, deflate, br',
  'Connection': 'keep-alive',
  'Upgrade-Insecure-Requests': '1'
}

const BLACKLISTED_DOMAINS = [
  'student.com',
  'cn.student.com',
  'uniplaces.com',
  'spotahome.com',
  'erasmusu.com'
]

function isBlacklistedUrl(url) {
  try {
    const host = new URL(url).hostname.toLowerCase()
    return BLACKLISTED_DOMAINS.some(d => host === d || host.endsWith('.' + d))
  } catch {
    return false
  }
}

class HttpOnlyCrawler {
  constructor(rootUrl, options = {}) {
    this.rootUrl = rootUrl
    this.rootDomain = new URL(rootUrl).origin
    this.visitedUrls = new Set()
    this.listingUrls = new Set()
    this.disallowedPaths = new Set()
    this.results = []
    this.errors = []
    
    // MongoDB connection
    this.mongoUri = process.env.MONGODB_URI || process.env.MONGODB_URI2
    this.dbName = 'mietenow-prod'
    this.collectionName = 'listings'
    this.mongoClient = null
    this.mongoCollection = null
    this.saveToMongo = options.saveToMongo !== false // Default to true
    
    // Detect provider from URL
    this.provider = this.detectProvider(rootUrl)
    
    // Site-specific configuration - S'ADAPTE AUTOMATIQUEMENT À CHAQUE SITE
    this.siteConfig = getSiteConfig(rootUrl) || {}
    if (this.siteConfig) {
      console.log(`✅ Configuration spécifique chargée pour: ${this.provider}`)
    }
    
    // Learning system: tracks successful patterns
    this.learnedPatterns = {
      listingSelectors: [], // Successfully used selectors
      pricePatterns: [],    // Patterns that found prices
      surfacePatterns: [],  // Patterns that found surface
      roomsPatterns: [],   // Patterns that found rooms
      listingUrlPatterns: [], // Patterns that identify listing URLs
      successRate: {}       // Track success rate per pattern
    }
    
    // Statistics for learning
    this.stats = {
      totalProcessed: 0,
      successfulExtractions: 0,
      failedExtractions: 0,
      patternUsage: {},
      savedToMongo: 0
    }
  }

  /**
   * Detect provider from URL
   */
  detectProvider(url) {
    const urlLower = url.toLowerCase()
    if (urlLower.includes('wg-gesucht')) return 'wg-gesucht'
    if (urlLower.includes('immobilienscout24')) return 'immoscout'
    if (urlLower.includes('immowelt')) return 'immowelt'
    if (urlLower.includes('immonet')) return 'immonet'
    if (urlLower.includes('kleinanzeigen')) return 'kleinanzeigen'
    return 'unknown'
  }

  /**
   * Build hash for deduplication
   */
  buildHash(...inputs) {
    const cleaned = inputs
      .filter(Boolean)
      .map(input => String(input).trim().toLowerCase())
      .join(',')
    return crypto.createHash('sha256').update(cleaned).digest('hex')
  }

  /**
   * Connect to MongoDB
   */
  async connectMongo() {
    if (!this.saveToMongo || !this.mongoUri) {
      console.log('⚠️  MongoDB not configured or disabled')
      return false
    }

    try {
      // Convert mongodb+srv to mongodb if needed
      let mongoUri = this.mongoUri
      if (mongoUri && mongoUri.includes('mongodb+srv://')) {
        const match = mongoUri.match(/mongodb\+srv:\/\/([^:]+):([^@]+)@([^/]+)\/([^?]+)(\?.*)?/)
        if (match) {
          const [, username, password, host, database, query] = match
          mongoUri = `mongodb://${username}:${password}@${host}:27017/${database}${query || ''}`
        }
      }

      // Replace database name if needed
      if (mongoUri && mongoUri.includes('/?') && !mongoUri.includes(this.dbName)) {
        mongoUri = mongoUri.replace('/?', `/${this.dbName}?`)
      } else if (mongoUri && !mongoUri.includes(`/${this.dbName}`)) {
        mongoUri = mongoUri.replace(/\/[^/]*(\?|$)/, `/${this.dbName}$1`)
      }

      if (!mongoUri) {
        console.log('⚠️  MONGODB_URI not found in environment variables')
        return false
      }

      this.mongoClient = new MongoClient(mongoUri)
      await this.mongoClient.connect()
      const db = this.mongoClient.db(this.dbName)
      this.mongoCollection = db.collection(this.collectionName)
      console.log('✅ Connected to MongoDB')
      return true
    } catch (error) {
      console.error('❌ MongoDB connection failed:', error.message)
      return false
    }
  }

  /**
   * Disconnect from MongoDB
   */
  async disconnectMongo() {
    if (this.mongoClient) {
      await this.mongoClient.close()
      console.log('✅ Disconnected from MongoDB')
    }
  }

  /**
   * Analyze HTML structure to detect listing patterns
   */
  analyzeHtmlStructure(html) {
    const $ = cheerio.load(html)
    const analysis = {
      isListingPage: false,
      isIndexPage: false,
      potentialSelectors: [],
      dataAttributes: [],
      classPatterns: [],
      priceIndicators: [],
      structurePattern: null
    }

    // Check for listing page indicators
    const listingIndicators = [
      'price', 'preis', 'miete', 'rent',
      'surface', 'fläche', 'size', 'qm',
      'rooms', 'zimmer', 'bedrooms',
      'description', 'beschreibung'
    ]

    // Check for index page indicators
    const indexIndicators = [
      'listing', 'result', 'item', 'card',
      'offer', 'anzeige', 'expose'
    ]

    // Analyze structure
    const text = $.text().toLowerCase()
    const htmlLower = html.toLowerCase()

    // Count potential listing containers
    const containers = [
      'article', '.listing', '.result-item', '.property-item',
      '.offer-item', '[data-id]', '[data-listing-id]',
      '.card', '.item', '.ad-item'
    ]

    let containerCount = 0
    for (const selector of containers) {
      const count = $(selector).length
      if (count > 0) {
        analysis.potentialSelectors.push({ selector, count })
        if (count > 8) {
          containerCount = count
        }
      }
    }

    // Determine page type
    const hasPrice = listingIndicators.some(ind => text.includes(ind))
    const hasMultipleItems = containerCount > 8
    const hasSingleItem = containerCount >= 1 && containerCount <= 3

    if (hasMultipleItems && !hasPrice) {
      analysis.isIndexPage = true
    } else if (hasSingleItem && hasPrice) {
      analysis.isListingPage = true
    } else if (hasPrice) {
      analysis.isListingPage = true
    }

    // Extract data attributes
    $('[data-id], [data-listing-id], [data-ad-id]').each((i, el) => {
      const attrs = {}
      Object.keys(el.attribs || {}).forEach(key => {
        if (key.startsWith('data-')) {
          attrs[key] = el.attribs[key]
        }
      })
      if (Object.keys(attrs).length > 0) {
        analysis.dataAttributes.push(attrs)
      }
    })

    // Find price indicators
    const priceRegex = /(\d{1,6}[.,]\d{0,2}|\d{1,6})\s*(€|EUR|Euro|EUR\/Monat)/gi
    const priceMatches = text.match(priceRegex)
    if (priceMatches && priceMatches.length > 0) {
      analysis.priceIndicators = priceMatches.slice(0, 5)
    }

    // Detect structure pattern
    if ($('article').length > 0) {
      analysis.structurePattern = 'article-based'
    } else if ($('[data-id]').length > 0) {
      analysis.structurePattern = 'data-attribute-based'
    } else if ($('.listing, .result-item').length > 0) {
      analysis.structurePattern = 'class-based'
    }

    return analysis
  }

  /**
   * Learn from successful extraction
   */
  learnFromSuccess(html, extractedData, url) {
    const analysis = this.analyzeHtmlStructure(html)
    const $ = cheerio.load(html)

    // Track which patterns worked
    if (extractedData.price) {
      // Find where price was found
      const pricePatterns = [
        { pattern: 'meta[property="product:price:amount"]', found: $('meta[property="product:price:amount"]').length > 0 },
        { pattern: '[itemprop="price"]', found: $('[itemprop="price"]').length > 0 },
        { pattern: '.price', found: $('.price').length > 0 },
        { pattern: 'regex', found: true }
      ]
      pricePatterns.forEach(p => {
        if (p.found) {
          this.learnedPatterns.pricePatterns.push({
            pattern: p.pattern,
            url: url,
            timestamp: Date.now()
          })
        }
      })
    }

    if (extractedData.surface) {
      const surfacePatterns = [
        { pattern: '[itemprop="floorSize"]', found: $('[itemprop="floorSize"]').length > 0 },
        { pattern: '.surface, .size', found: $('.surface, .size').length > 0 },
        { pattern: 'regex', found: true }
      ]
      surfacePatterns.forEach(p => {
        if (p.found) {
          this.learnedPatterns.surfacePatterns.push({
            pattern: p.pattern,
            url: url,
            timestamp: Date.now()
          })
        }
      })
    }

    // Track successful listing URL patterns
    if (analysis.isListingPage) {
      const urlPattern = this.extractUrlPattern(url)
      if (urlPattern) {
        this.learnedPatterns.listingUrlPatterns.push({
          pattern: urlPattern,
          success: true,
          timestamp: Date.now()
        })
      }
    }

    this.stats.successfulExtractions++
  }

  /**
   * Extract URL pattern for learning
   */
  extractUrlPattern(url) {
    const urlObj = new URL(url)
    const pathParts = urlObj.pathname.split('/').filter(p => p)
    
    // Extract numeric patterns
    const numericId = pathParts.find(p => /^\d+$/.test(p))
    if (numericId) {
      return `/${numericId}.html`
    }

    // Extract common patterns
    const patterns = ['/expose/', '/anzeige/', '/wohnung/', '/listing/', '/immobilie/']
    for (const pattern of patterns) {
      if (urlObj.pathname.includes(pattern)) {
        return pattern
      }
    }

    return null
  }

  /**
   * Get best patterns based on learning
   */
  getBestPatterns() {
    const best = {
      price: this.getMostSuccessfulPattern(this.learnedPatterns.pricePatterns),
      surface: this.getMostSuccessfulPattern(this.learnedPatterns.surfacePatterns),
      rooms: this.getMostSuccessfulPattern(this.learnedPatterns.roomsPatterns),
      listingUrl: this.getMostSuccessfulPattern(this.learnedPatterns.listingUrlPatterns)
    }
    return best
  }

  /**
   * Delay helper to avoid rate limiting
   */
  async delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms))
  }

  /**
   * Get most successful pattern from history
   */
  getMostSuccessfulPattern(patterns) {
    if (!patterns || patterns.length === 0) return null

    const counts = {}
    patterns.forEach(p => {
      counts[p.pattern] = (counts[p.pattern] || 0) + 1
    })

    let maxCount = 0
    let bestPattern = null
    for (const [pattern, count] of Object.entries(counts)) {
      if (count > maxCount) {
        maxCount = count
        bestPattern = pattern
      }
    }

    return bestPattern
  }

  /**
   * Make HTTP GET request
   */
  async fetch(url, options = {}) {
    try {
      const response = await globalThis.fetch(url, {
        ...options,
        headers: { ...DEFAULT_HEADERS, ...options.headers },
        redirect: 'follow'
      })

      const statusCode = response.status
      const headers = {}
      // Handle both Headers object and Map
      if (response.headers.forEach) {
        response.headers.forEach((value, key) => {
          headers[key] = value
        })
      } else if (response.headers.entries) {
        for (const [key, value] of response.headers.entries()) {
          headers[key] = value
        }
      } else {
        Object.assign(headers, response.headers)
      }
      const contentType = headers['content-type'] || ''

      let bodyText = ''
      let jsonData = null

      if (contentType.includes('application/json')) {
        jsonData = await response.json()
        bodyText = JSON.stringify(jsonData, null, 2)
      } else {
        bodyText = await response.text()
      }

      // Extract JSON-LD if HTML
      let jsonLd = null
      if (contentType.includes('text/html')) {
        jsonLd = this.extractJsonLd(bodyText)
      }

      return {
        url,
        statusCode,
        headers,
        bodyText,
        jsonData,
        jsonLd,
        contentType
      }
    } catch (error) {
      this.errors.push({ url, error: error.message })
      return null
    }
  }

  /**
   * Check robots.txt
   */
  async checkRobotsTxt() {
    try {
      const robotsUrl = `${this.rootDomain}/robots.txt`
      const response = await this.fetch(robotsUrl)
      
      if (!response || response.statusCode !== 200) {
        console.log('⚠️  No robots.txt found or not accessible')
        return
      }

      const lines = response.bodyText.split('\n')
      let currentUserAgent = '*'

      for (const line of lines) {
        const trimmed = line.trim()
        if (!trimmed || trimmed.startsWith('#')) continue

        if (trimmed.toLowerCase().startsWith('user-agent:')) {
          currentUserAgent = trimmed.split(':')[1].trim()
        } else if (trimmed.toLowerCase().startsWith('disallow:') && (currentUserAgent === '*' || currentUserAgent.includes('*'))) {
          const path = trimmed.split(':')[1].trim()
          if (path) {
            this.disallowedPaths.add(path)
          }
        }
      }

      console.log(`✅ Parsed robots.txt: ${this.disallowedPaths.size} disallowed paths`)
    } catch (error) {
      console.log(`⚠️  Error checking robots.txt: ${error.message}`)
    }
  }

  /**
   * Check if URL is disallowed by robots.txt
   */
  isDisallowed(url) {
    const urlPath = new URL(url).pathname
    for (const disallowed of this.disallowedPaths) {
      if (urlPath.startsWith(disallowed)) {
        return true
      }
    }
    return false
  }

  /**
   * Parse sitemap.xml (simple regex-based parser)
   */
  async parseSitemap(sitemapUrl) {
    try {
      const response = await this.fetch(sitemapUrl)
      if (!response || response.statusCode !== 200) {
        return []
      }

      const urls = []
      const keywords = ['listing', 'angebot', 'wohnungen', 'mieten', 'rent', 'search', 'wohnung', 'immobilie']

      // Extract URLs using regex (simple XML parsing)
      const urlMatches = response.bodyText.match(/<loc>(.*?)<\/loc>/gi)
      if (urlMatches) {
        for (const match of urlMatches) {
          const loc = match.replace(/<\/?loc>/gi, '').trim()
          if (loc) {
            // Check if it's a sitemap index entry
            if (loc.includes('sitemap') && loc.endsWith('.xml')) {
              const nestedUrls = await this.parseSitemap(loc)
              urls.push(...nestedUrls)
            } else {
              // Check if URL contains listing keywords
              const hasKeyword = keywords.some(k => loc.toLowerCase().includes(k))
              if (hasKeyword) {
                urls.push(loc)
              }
            }
          }
        }
      }

      return urls
    } catch (error) {
      console.log(`⚠️  Error parsing sitemap ${sitemapUrl}: ${error.message}`)
      return []
    }
  }

  /**
   * Find listing pages from homepage
   */
  async findListingPagesFromHomepage() {
    try {
      const response = await this.fetch(this.rootUrl)
      if (!response || response.statusCode !== 200) {
        throw new Error(`Failed to fetch homepage: ${response?.statusCode}`)
      }

      const $ = cheerio.load(response.bodyText)
      const listingKeywords = ['mieten', 'wohnungen', 'rent', 'offers', 'listings', 'angebote', 'wohnung', 'immobilie']
      const urls = new Set()

      // Find all anchor tags
      $('a[href]').each((i, el) => {
        const href = $(el).attr('href')
        if (!href) return

        const absoluteUrl = new URL(href, this.rootUrl).href
        const urlLower = absoluteUrl.toLowerCase()

        // Check if URL contains listing keywords
        const hasKeyword = listingKeywords.some(k => urlLower.includes(k))
        if (hasKeyword && !this.isDisallowed(absoluteUrl)) {
          urls.add(absoluteUrl)
        }
      })

      return Array.from(urls)
    } catch (error) {
      console.log(`⚠️  Error finding listing pages: ${error.message}`)
      return []
    }
  }

  /**
   * Vérifie si une URL ressemble à une vraie URL de listing (pas blog, pas info)
   */
  isValidListingUrl(url) {
    const urlLower = url.toLowerCase()
    
    // EXCLUSION: URLs qui ne sont PAS des listings
    const exclusionPatterns = [
      // Pages d'information
      /\/blog\//, /\/article\//, /\/news\//, /\/press\//, /\/magazine\//,
      /\/about/, /\/contact/, /\/impressum/, /\/datenschutz/, /\/privacy/, /\/legal/,
      /\/faq/, /\/help/, /\/support/, /\/login/, /\/signup/, /\/register/,
      /\/account/, /\/profile/, /\/settings/, /\/admin/, /\/dashboard/,
      
      // Pages de recherche et filtres
      /\/search\?/, /\/suche\?/, /\/filter/, /\/category/, /\/kategorie/,
      /\/tag/, /\/tags/, /\/archive/, /\/archiv/, /\/sitemap/, /\/robots/,
      /\/feed/, /\/rss/, /\/api\//,
      
      // Sites de réservation/tourisme (pas de location longue durée)
      /spotahome/, /booking/, /airbnb/, /hostel/, /pension/, /gasthaus/,
      /hotel/, /travel/, /reise/, /urlaub/, /trip/, /vacation/,
      
      // Pages de résultats de recherche génériques
      /\/results/, /\/suchergebnisse/, /\/listings\?/, /\/wohnungen\?/,
      /\/mieten\?/, /\/rent\?/, /\/offers\?/, /\/angebote\?/,
      
      // Fichiers
      /\.(pdf|doc|docx|xls|xlsx|zip|rar|jpg|jpeg|png|gif|svg|css|js|map|txt|xml|ico|woff|woff2|ttf|eot|otf|mp4|mp3|avi|mov|wmv|flv|webm|ogg|wav|aac|m4a|m4v|3gp|3g2|mkv|ts|mts|m2ts|vob|asf|rm|rmvb|divx|xvid|mpg|mpeg|mpe|m1v|m2v|m4v|3gp|3g2|3gpp|3gpp2|amv|asf|avi|bik|bix|box|cam|dat|divx|drc|dv|dvr-ms|evo|f4v|fli|flv|gvi|gxf|h264|h265|hevc|ivf|m1v|m2ts|m2v|m4v|mkv|mod|mp2|mp4|mpe|mpeg|mpg|mpl|mpls|mts|mxf|nsv|nuv|ogg|ogm|ogv|ogx|ps|rec|rm|rmvb|roq|rpl|smi|smil|srt|ssa|sub|sup|swf|tivo|tod|ts|tts|txd|vob|vro|webm|wm|wmv|wtv|xesc|xvid|yuv)$/,
      
      // Paramètres de recherche
      /\?.*(search|suche|filter|category|kategorie|tag|page|p=)/,
      /\?.*(sort|order|price|min|max|rooms|size|surface|type|furnished)/,
      
      // Pages de listing génériques (pas d'annonce spécifique)
      /\/listings$/, /\/wohnungen$/, /\/mieten$/, /\/rent$/, /\/offers$/,
      /\/angebote$/, /\/results$/, /\/suchergebnisse$/
    ]
    
    // Vérifier les exclusions
    for (const pattern of exclusionPatterns) {
      if (pattern.test(urlLower)) {
        return false
      }
    }
    
    // INCLUSION: URLs qui RESSEMBLENT à des listings spécifiques
    const inclusionPatterns = [
      // Patterns avec ID numérique (le plus fiable)
      /\/\d{4,}\.html$/,           // /12345.html
      /\/\d{4,}$/,                 // /12345 (sans extension)
      
      // Patterns avec UUID ou slug
      /\/expose\/[\w-]+$/,         // /expose/uuid
      /\/anzeige\/\d+$/,           // /anzeige/12345
      /\/wohnung\/\d+$/,           // /wohnung/12345
      /\/listing\/\d+$/,           // /listing/12345
      /\/property\/\d+$/,          // /property/12345
      /\/immobilie\/\d+$/,         // /immobilie/12345
      /\/ad\/\d+$/,                // /ad/12345
      /\/offer\/\d+$/,             // /offer/12345
      /\/rental\/\d+$/,            // /rental/12345
      /\/mieten\/\d+$/,            // /mieten/12345
      /\/vermieten\/\d+$/,         // /vermieten/12345
      /\/apartment\/\d+$/,         // /apartment/12345
      /\/studio\/\d+$/,            // /studio/12345
      /\/room\/\d+$/,              // /room/12345
      /\/zimmer\/\d+$/,            // /zimmer/12345
      /\/wg\/\d+$/,                // /wg/12345
      /\/haus\/\d+$/,              // /haus/12345
      /\/house\/\d+$/,             // /house/12345
      /\/flat\/\d+$/,              // /flat/12345
      /\/appartement\/\d+$/,       // /appartement/12345
      /\/wohnraum\/\d+$/,          // /wohnraum/12345
      /\/unterkunft\/\d+$/,        // /unterkunft/12345
      /\/accommodation\/\d+$/,     // /accommodation/12345
      /\/rent\/\d+$/,              // /rent/12345
      /\/miete\/\d+$/,             // /miete/12345
      /\/vermietung\/\d+$/         // /vermietung/12345
    ]
    
    // Vérifier les inclusions
    for (const pattern of inclusionPatterns) {
      if (pattern.test(urlLower)) {
        return true
      }
    }
    
    return false
  }

  /**
   * Vérifie si c'est définitivement PAS une page de listing
   */
  isDefinitelyNotListing(html, url) {
    const $ = cheerio.load(html)
    const text = $.text().toLowerCase()
    const urlLower = url.toLowerCase()
    
    // EXCLUSION: Mots-clés qui indiquent que ce n'est définitivement PAS une listing
    const exclusionKeywords = [
      'blog', 'article', 'news', 'press', 'magazine',
      'impressum', 'datenschutz', 'privacy', 'legal',
      'about', 'contact', 'über uns', 'kontakt',
      'faq', 'help', 'hilfe', 'support',
      'login', 'signup', 'register', 'anmelden',
      'job', 'career', 'karriere', 'stellenangebot',
      'event', 'veranstaltung', 'calendar',
      'shop', 'buy', 'kaufen', 'verkauf',
      'forum', 'community', 'discussion',
      'advertisement', 'werbung', 'ads',
      '404', 'not found', 'seite nicht gefunden',
      'error', 'fehler', 'page not found'
    ]
    
    // Vérifier l'URL
    for (const keyword of exclusionKeywords) {
      if (urlLower.includes(keyword) && !urlLower.includes('expose')) {
        return true
      }
    }
    
    // Vérifier qu'il n'y a pas de structure de blog typique
    const hasBlogStructure = $('article time').length > 3 || 
                             $('.post-date').length > 2 ||
                             $('.author').length > 2 ||
                             $('.blog-post').length > 1 ||
                             $('[class*="blog"]').length > 5
    
    return hasBlogStructure
  }

  /**
   * Vérifie si c'est une vraie page de listing (pas un blog, pas une page d'info)
   */
  isValidListingPage(html, url) {
    const $ = cheerio.load(html)
    const text = $.text().toLowerCase()
    const urlLower = url.toLowerCase()
    
    // EXCLUSION: Mots-clés qui indiquent que ce n'est PAS une listing
    const exclusionKeywords = [
      'blog', 'article', 'news', 'press', 'magazine',
      'impressum', 'datenschutz', 'privacy', 'legal',
      'about', 'contact', 'über uns', 'kontakt',
      'faq', 'help', 'hilfe', 'support',
      'login', 'signup', 'register', 'anmelden',
      'job', 'career', 'karriere', 'stellenangebot',
      'event', 'veranstaltung', 'calendar',
      'shop', 'buy', 'kaufen', 'verkauf',
      'forum', 'community', 'discussion',
      'advertisement', 'werbung', 'ads',
      'cookie', 'javascript', 'enable javascript',
      '404', 'not found', 'seite nicht gefunden',
      'error', 'fehler', 'page not found'
    ]
    
    // Vérifier l'URL
    for (const keyword of exclusionKeywords) {
      if (urlLower.includes(keyword)) {
        return false
      }
    }
    
    // Vérifier le contenu HTML
    for (const keyword of exclusionKeywords) {
      if (text.includes(keyword) && text.split(keyword).length > 3) {
        // Si le mot apparaît plusieurs fois, c'est probablement pas une listing
        return false
      }
    }
    
    // INCLUSION: Mots-clés qui indiquent que c'est une vraie listing
    const listingKeywords = [
      'miete', 'rent', 'wohnung', 'apartment',
      'preis', 'price', '€', 'eur',
      'm²', 'qm', 'surface', 'fläche',
      'zimmer', 'rooms', 'bedroom',
      'verfügbar', 'available', 'ab',
      'expose', 'angebot', 'offering',
      'immobilie', 'property', 'real estate'
    ]
    
    // Doit contenir au moins 2 mots-clés de listing
    let listingKeywordCount = 0
    for (const keyword of listingKeywords) {
      if (text.includes(keyword)) {
        listingKeywordCount++
      }
    }
    
    if (listingKeywordCount < 2) {
      return false
    }
    
    // Vérifier la présence d'un prix valide
    const priceMatch = text.match(/(\d{1,3}(?:\.\d{3})*(?:,\d{2})?)\s*€|€\s*(\d{1,3}(?:\.\d{3})*(?:,\d{2})?)/i)
    if (!priceMatch) {
      return false
    }
    
    // Vérifier la présence d'une surface ou de chambres (au moins un des deux)
    const hasSurface = /(\d{1,4})\s*(m²|qm|m2)/i.test(text)
    const hasRooms = /(\d+)\s*(zimmer|rooms?|bedrooms?)/i.test(text)
    
    if (!hasSurface && !hasRooms) {
      return false
    }
    
    // Vérifier qu'il n'y a pas trop de liens (signe de navigation/blog)
    const linkCount = $('a[href]').length
    const textLength = text.length
    if (linkCount > 50 && linkCount / (textLength / 100) > 2) {
      // Trop de liens par rapport au texte = probablement une page de navigation
      return false
    }
    
    // Vérifier la structure: doit avoir un titre principal
    const hasTitle = $('h1').length > 0 || $('title').text().length > 10
    if (!hasTitle) {
      return false
    }
    
    // Vérifier qu'il n'y a pas de structure de blog typique
    const hasBlogStructure = $('article time').length > 0 || 
                             $('.post-date').length > 0 ||
                             $('.author').length > 0 ||
                             $('.blog-post').length > 0 ||
                             $('[class*="blog"]').length > 3
    
    if (hasBlogStructure) {
      return false
    }
    
    // Vérifier les meta tags
    const ogType = $('meta[property="og:type"]').attr('content')
    if (ogType && (ogType.includes('article') || ogType.includes('blog'))) {
      return false
    }
    
    return true
  }

  /**
   * Détecte si c'est une PAGE DE LISTE DE LISTINGS (avec 10-290 liens)
   * Cette fonction identifie les vraies pages de recherche/listing index
   */
  isListingIndexPageAdvanced(html, url) {
    const $ = cheerio.load(html)
    const urlLower = url.toLowerCase()
    
    // Mots-clés dans l'URL qui indiquent une page de recherche/liste
    const searchPageKeywords = [
      'suche', 'search', 'listings', 'wohnungen', 'mieten',
      'rent', 'offers', 'angebote', 'results', 'suchergebnisse'
    ]
    
    const hasSearchKeyword = searchPageKeywords.some(kw => urlLower.includes(kw))
    
    // Compter les liens qui ressemblent à des listings
    let listingLinkCount = 0
    const listingUrls = new Set()
    
    // Pour WG-Gesucht spécifiquement: chercher les data-id et les liens /12345.html
    if (this.provider === 'wg-gesucht') {
      // Pattern 1: Extraire data-id="12345" et construire /12345.html
      const dataIdMatches = html.match(/data-id="(\d{4,})"/g)
      if (dataIdMatches) {
        dataIdMatches.forEach(match => {
          const id = match.match(/\d{4,}/)[0]
          const listingUrl = `${this.rootDomain}/${id}.html`
          listingUrls.add(listingUrl)
          listingLinkCount++
        })
      }
      
      // Pattern 2: Chercher les liens /12345.html directement dans les href
      const linkMatches = html.match(/href="([^"]*\/(\d{4,})\.html[^"]*)"/gi)
      if (linkMatches) {
        linkMatches.forEach(linkMatch => {
          const hrefMatch = linkMatch.match(/href="([^"]+)"/i)
          if (hrefMatch) {
            try {
              const absoluteUrl = new URL(hrefMatch[1], url).href
              if (absoluteUrl.match(/\/\d{4,}\.html$/)) {
                listingUrls.add(absoluteUrl)
                listingLinkCount++
              }
            } catch (e) {}
          }
        })
      }
    } else {
      // Pour les autres sites: méthode générique
      $('a[href]').each((i, el) => {
        const href = $(el).attr('href')
        if (!href) return
        
        try {
          const absoluteUrl = new URL(href, url).href
          if (this.isValidListingUrl(absoluteUrl)) {
            listingUrls.add(absoluteUrl)
            listingLinkCount++
          }
        } catch (e) {}
      })
    }
    
    // Une vraie page de liste a 10-290 liens de listings
    const isListingIndex = listingLinkCount >= 10 && listingLinkCount <= 290
    
    // Aussi vérifier la structure HTML: plusieurs conteneurs similaires
    const containers = [
      'article',
      '.listing-item',
      '.result-item',
      '.property-item',
      '.offer-item',
      '[data-id]',
      '.card',
      '.listing'
    ]
    
    let containerCount = 0
    for (const selector of containers) {
      const count = $(selector).length
      if (count >= 10 && count <= 290) {
        containerCount = count
        break
      }
    }
    
    return {
      isListingIndex: isListingIndex || containerCount >= 10,
      listingLinkCount: listingUrls.size,
      containerCount,
      hasSearchKeyword,
      listingUrls: Array.from(listingUrls)
    }
  }

  /**
   * Recherche approfondie: cherche dans les scripts JS, data-*, JSON, etc.
   */
  deepSearchForListings(html, url) {
    const $ = cheerio.load(html)
    const listingUrls = new Set()
    const apiEndpoints = []
    
    // 1. Chercher dans les scripts JavaScript
    $('script').each((i, el) => {
      const scriptContent = $(el).html() || ''
      
      // Chercher des IDs de listings dans les scripts
      const idPatterns = [
        /\/\d{4,}\.html/g,
        /\/listing\/\d{4,}/g,
        /\/expose\/[\w-]+/g,
        /\/anzeige\/\d{4,}/g,
        /data-id["']?\s*[:=]\s*["']?(\d{4,})/g,
        /listingId["']?\s*[:=]\s*["']?(\d{4,})/g,
        /id["']?\s*[:=]\s*["']?(\d{4,})["']?\s*[,}]/g,
      ]
      
      idPatterns.forEach(pattern => {
        const matches = scriptContent.match(pattern)
        if (matches) {
          matches.forEach(match => {
            try {
              // Si c'est déjà une URL complète
              if (match.includes('http')) {
                const absoluteUrl = new URL(match, url).href
                if (this.isValidListingUrl(absoluteUrl)) {
                  listingUrls.add(absoluteUrl)
                }
              } else {
                // C'est un ID ou un path
                const idMatch = match.match(/\d{4,}/)
                const uuidMatch = match.match(/[\w-]{8,}/)
                
                if (idMatch) {
                  const id = idMatch[0]
                  const listingUrl = `${this.rootDomain}/${id}.html`
                  if (this.isValidListingUrl(listingUrl)) {
                    listingUrls.add(listingUrl)
                  }
                } else if (uuidMatch && match.includes('/expose/')) {
                  const uuid = uuidMatch[0]
                  const listingUrl = `${this.rootDomain}/expose/${uuid}`
                  if (this.isValidListingUrl(listingUrl)) {
                    listingUrls.add(listingUrl)
                  }
                }
              }
            } catch (e) {}
          })
        }
      })
    })
    
    // 2. Chercher data-id dans le HTML
    const dataIdMatches = html.match(/data-id=["']?(\d{4,})["']?/gi)
    if (dataIdMatches) {
      dataIdMatches.forEach(match => {
        const idMatch = match.match(/\d{4,}/)
        if (idMatch) {
          const id = idMatch[0]
          const listingUrl = `${this.rootDomain}/${id}.html`
          listingUrls.add(listingUrl)
        }
      })
    }
    
    // 3. Chercher des liens href avec patterns de listings
    $('a[href]').each((i, el) => {
      const href = $(el).attr('href')
      if (!href) return
      
      try {
        const absoluteUrl = new URL(href, url).href
        
        // Patterns de listings
        const listingPatterns = [
          /\/\d{4,}\.html$/,
          /\/listing\/\d+/,
          /\/expose\/[\w-]+/,
          /\/anzeige\/\d+/,
          /\/wohnung\/\d+/,
          /\/property\/\d+/,
          /\/immobilie\/\d+/,
        ]
        
        for (const pattern of listingPatterns) {
          if (pattern.test(absoluteUrl)) {
            if (this.isValidListingUrl(absoluteUrl)) {
              listingUrls.add(absoluteUrl)
            }
            break
          }
        }
      } catch (e) {}
    })
    
    // 4. Chercher dans les attributs data-*
    $('[data-listing-id], [data-id], [data-property-id]').each((i, el) => {
      const listingId = $(el).attr('data-listing-id') || 
                       $(el).attr('data-id') || 
                       $(el).attr('data-property-id')
      
      if (listingId && listingId.match(/^\d{4,}$/)) {
        const listingUrl = `${this.rootDomain}/${listingId}.html`
        listingUrls.add(listingUrl)
      }
    })
    
    return {
      listingUrls: Array.from(listingUrls),
      apiEndpoints
    }
  }

  /**
   * Extract pagination URLs from a listing index page
   */
  extractPaginationUrls(html, baseUrl) {
    const $ = cheerio.load(html)
    const paginationUrls = new Set()
    
    // Patterns pour trouver les liens de pagination
    const paginationSelectors = [
      'a[href*="p="]',
      '.pagination a',
      '.pager a',
      '[class*="pagination"] a',
      '[class*="pager"] a',
      'a:contains("next")',
      'a:contains("weiter")',
      'a:contains("»")',
      'a:contains(">")'
    ]
    
    paginationSelectors.forEach(selector => {
      $(selector).each((i, el) => {
        const href = $(el).attr('href')
        if (!href) return
        
        try {
          const absoluteUrl = new URL(href, baseUrl).href
          // Vérifier que c'est bien une URL de pagination (contient page/seite/p)
          if (absoluteUrl.startsWith(this.rootDomain) && 
              (absoluteUrl.includes('page=') || 
               absoluteUrl.includes('seite=') || 
               absoluteUrl.includes('&p=') ||
               absoluteUrl.match(/\/\d+$/)) && // URL se termine par un nombre
              !this.isDisallowed(absoluteUrl)) {
            paginationUrls.add(absoluteUrl)
          }
        } catch (e) {}
      })
    })
    
    return Array.from(paginationUrls).slice(0, 10) // Limiter à 10 pages max
  }

  /**
   * Extract listing URLs from a listings index page - improved with learning
   */
  extractListingUrls(html, baseUrl) {
    const $ = cheerio.load(html)
    const urls = new Set()

    // PRIORITÉ 1: Utiliser la fonction d'extraction spécifique du site
    if (this.siteConfig?.extractListingUrls && typeof this.siteConfig.extractListingUrls === 'function') {
      try {
        const siteUrls = this.siteConfig.extractListingUrls(html, baseUrl)
        if (siteUrls && siteUrls.length > 0) {
          siteUrls.forEach(url => {
            try {
              const absoluteUrl = new URL(url, baseUrl).href
              // ✅ FILTRER: Vérifier que ce n'est pas un blog ou une page d'info
              if (absoluteUrl.startsWith(this.rootDomain) && 
                  !this.isDisallowed(absoluteUrl) &&
                  this.isValidListingUrl(absoluteUrl)) {
                urls.add(absoluteUrl)
              }
            } catch (e) {}
          })
          if (urls.size > 0) {
            return Array.from(urls)
          }
        }
      } catch (error) {
        console.log(`   ⚠️ Erreur extraction spécifique: ${error.message}`)
      }
    }

    // PRIORITÉ 2: Utiliser les patterns spécifiques du site
    if (this.siteConfig?.listingUrlPatterns) {
      for (const pattern of this.siteConfig.listingUrlPatterns) {
        const regex = new RegExp(pattern.source || pattern, pattern.flags || 'gi')
        const matches = html.match(regex)
        if (matches && matches.length > 0) {
          matches.forEach(match => {
            let href = null
            const hrefMatch = match.match(/href="([^"]+)"/i)
            const dataIdMatch = match.match(/data-id="(\d+)"/i)
            
            if (hrefMatch) {
              href = hrefMatch[1]
            } else if (dataIdMatch && this.provider === 'wg-gesucht') {
              href = `/${dataIdMatch[1]}.html`
            } else if (match.match && match[0]) {
              href = match[0]
            }
            
            if (href) {
              try {
                const absoluteUrl = new URL(href, baseUrl).href
                // ✅ FILTRER: Vérifier que ce n'est pas un blog ou une page d'info
                if (absoluteUrl.startsWith(this.rootDomain) && 
                    !this.isDisallowed(absoluteUrl) &&
                    this.isValidListingUrl(absoluteUrl)) {
                  urls.add(absoluteUrl)
                }
              } catch (e) {}
            }
          })
        }
      }
      
      if (urls.size > 0) {
        return Array.from(urls)
      }
    }

    // PRIORITÉ 3: Utiliser les sélecteurs spécifiques du site
    const linkSelectors = this.siteConfig?.listingContainer?.map(sel => `${sel} a`) || [
      'a[href*="/expose/"]',
      'a[href*="/angebot/"]',
      'a[href*="/wohnung/"]',
      'a[href*="/listing/"]',
      'a[href*="/immobilie/"]',
      'a[href*="/mieten/"]',
      'a[href*="/anzeige/"]',
      'a[href*="/ad/"]',
      'article a[href*="/"]',
      '.listing a',
      '.result-item a',
      '.property-item a',
      '.offer-item a',
      '[data-listing-id] a',
      '[data-id] a'
    ]

    // Also check for WG-Gesucht specific patterns (from existing scraper)
    const wgGesuchtPatterns = [
      /\/\d+\.html/,  // /12345.html format
      /\/anzeigen\/\d+/, // /anzeigen/12345 format
    ]

    // Pattern-based extraction (like existing scrapers)
    const patterns = [
      // Pattern 1: Links with numeric IDs
      /<a[^>]*href="[^"]*\/(\d{4,})[^"]*"[^>]*>/gi,
      // Pattern 2: Links with /expose/
      /<a[^>]*href="[^"]*\/expose\/[^"]*"[^>]*>/gi,
      // Pattern 3: Links with /anzeige/
      /<a[^>]*href="[^"]*\/anzeige\/[^"]*"[^>]*>/gi,
      // Pattern 4: Links with data-id (WG-Gesucht style)
      /<a[^>]*data-id="(\d+)"[^>]*>/gi,
    ]

    // Try pattern-based extraction first (more reliable)
    for (const pattern of patterns) {
      const matches = html.match(pattern)
      if (matches && matches.length > 0) {
        for (const match of matches) {
          // Extract href or data-id
          const hrefMatch = match.match(/href="([^"]+)"/i)
          const dataIdMatch = match.match(/data-id="(\d+)"/i)
          
          let href = hrefMatch ? hrefMatch[1] : null
          
          // If data-id found, construct URL
          if (dataIdMatch && !href) {
            href = `/${dataIdMatch[1]}.html`
          }
          
          if (href) {
            try {
              const absoluteUrl = new URL(href, baseUrl).href
              if (absoluteUrl.startsWith(this.rootDomain) && 
                  !this.isDisallowed(absoluteUrl) &&
                  !absoluteUrl.includes('?cat=') &&
                  !absoluteUrl.includes('wohnraumangebote')) {
                urls.add(absoluteUrl)
              }
            } catch (e) {
              // Invalid URL, skip
            }
          }
        }
        
        // If we found good matches, prefer them
        if (urls.size > 0) {
          break
        }
      }
    }

    // Fallback to selector-based extraction
    if (urls.size === 0) {
      for (const selector of linkSelectors) {
        $(selector).each((i, el) => {
          const href = $(el).attr('href')
          if (!href) return

          try {
            const absoluteUrl = new URL(href, baseUrl).href
            
            // Check if URL matches listing patterns (avoid index pages)
            const isListingUrl = wgGesuchtPatterns.some(pattern => pattern.test(absoluteUrl)) ||
                                 absoluteUrl.includes('/expose/') ||
                                 absoluteUrl.includes('/anzeige/') ||
                                 absoluteUrl.includes('/ad/') ||
                                 (absoluteUrl.includes('/wohnung/') && !absoluteUrl.includes('?cat='))
            
            if (absoluteUrl.startsWith(this.rootDomain) && 
                !this.isDisallowed(absoluteUrl) && 
                this.isValidListingUrl(absoluteUrl) &&
                isListingUrl) {
              urls.add(absoluteUrl)
            }
          } catch (e) {
            // Invalid URL, skip
          }
        })
      }

      // Also search for numeric IDs in links (common pattern)
      $('a[href]').each((i, el) => {
        const href = $(el).attr('href')
        if (!href) return
        
        try {
          const absoluteUrl = new URL(href, baseUrl).href
          // Check for numeric ID patterns (e.g., /12345.html, /wohnung/12345)
          const numericIdMatch = absoluteUrl.match(/\/(\d{4,})/)
          if (numericIdMatch && 
              absoluteUrl.startsWith(this.rootDomain) && 
              !this.isDisallowed(absoluteUrl) &&
              this.isValidListingUrl(absoluteUrl) &&
              !absoluteUrl.includes('?cat=') &&
              !absoluteUrl.includes('wohnraumangebote')) {
            urls.add(absoluteUrl)
          }
        } catch (e) {
          // Invalid URL, skip
        }
      })
    }

    return Array.from(urls)
  }

  /**
   * Follow pagination
   */
  async followPagination(listingsIndexUrl) {
    const listingUrls = new Set()
    const visitedPages = new Set()
    const toVisit = [listingsIndexUrl]

    while (toVisit.length > 0) {
      const currentUrl = toVisit.shift()
      if (visitedPages.has(currentUrl)) continue
      visitedPages.add(currentUrl)

      await this.delay(1000) // Rate limiting

      const response = await this.fetch(currentUrl)
      if (!response || response.statusCode !== 200) continue

      // Extract listing URLs from this page
      const urls = this.extractListingUrls(response.bodyText, currentUrl)
      urls.forEach(url => listingUrls.add(url))

      // Find next page link
      const $ = cheerio.load(response.bodyText)
      const nextPageSelectors = [
        'a[aria-label*="next"]',
        'a[aria-label*="Next"]',
        'a[aria-label*="next"]',
        '.pagination a:contains("next")',
        '.pagination a:contains("Next")',
        'a[href*="page="]',
        'a[href*="/p="]',
        'a[href*="/page/"]'
      ]

      for (const selector of nextPageSelectors) {
        const nextLink = $(selector).first().attr('href')
        if (nextLink) {
          try {
            const nextUrl = new URL(nextLink, currentUrl).href
            if (nextUrl.startsWith(this.rootDomain) && !visitedPages.has(nextUrl)) {
              toVisit.push(nextUrl)
              break
            }
          } catch (e) {
            // Invalid URL
          }
        }
      }
    }

    return Array.from(listingUrls)
  }

  /**
   * Extract JSON-LD structured data
   */
  extractJsonLd(html) {
    const $ = cheerio.load(html)
    const jsonLdScripts = $('script[type="application/ld+json"]')
    const jsonLdData = []

    jsonLdScripts.each((i, el) => {
      try {
        const content = $(el).html()
        if (content) {
          const parsed = JSON.parse(content)
          jsonLdData.push(parsed)
        }
      } catch (e) {
        // Invalid JSON
      }
    })

    return jsonLdData.length > 0 ? jsonLdData : null
  }

  /**
   * Extract listing data from JSON-LD
   */
  extractFromJsonLd(jsonLd) {
    if (!jsonLd || !Array.isArray(jsonLd)) return null

    for (const item of jsonLd) {
      if (item['@type'] === 'Product' || item['@type'] === 'Apartment' || item['@type'] === 'RealEstateListing') {
        const offers = item.offers || {}
        const address = item.address || {}
        const geo = item.geo || {}

        return {
          price: this.extractPrice(offers.price || offers.priceSpecification?.price || item.price),
          surface: this.extractSurface(item.floorSize?.value || item.floorSize),
          rooms: this.extractRooms(item.numberOfRooms || item.bedrooms),
          type: this.extractType(item.name || item.description || ''),
          furnished: this.extractFurnished(item.description || item.name || ''),
          location: address.addressLocality || address.addressRegion || '',
          district: address.addressLocality || null,
          address: address.streetAddress || address.addressCountry || null,
          lat: geo.latitude ? parseFloat(geo.latitude) : null,
          lng: geo.longitude ? parseFloat(geo.longitude) : null,
          description: item.description || '',
          pictures: this.extractImages(item.image || []),
          scrapedAt: new Date().toISOString()
        }
      }
    }

    return null
  }

  /**
   * Extract listing data from HTML (fallback) - with adaptive learning
   */
  extractFromHtml(html, url) {
    const $ = cheerio.load(html)
    const text = $.text()
    const analysis = this.analyzeHtmlStructure(html)
    const bestPatterns = this.getBestPatterns()

    // Try multiple extraction strategies in order of success
    let price = null
    let surface = null
    let rooms = null

    // Price extraction - try learned patterns first
    if (bestPatterns.price) {
      if (bestPatterns.price === 'meta[property="product:price:amount"]') {
        const metaPrice = $('meta[property="product:price:amount"]').attr('content')
        price = this.extractPrice(metaPrice)
      } else if (bestPatterns.price === '[itemprop="price"]') {
        const itempropPrice = $('[itemprop="price"]').attr('content') || $('[itemprop="price"]').text()
        price = this.extractPrice(itempropPrice)
      } else if (bestPatterns.price === '.price') {
        const priceEl = $('.price').first().text()
        price = this.extractPrice(priceEl)
      }
    }

    // Fallback to regex if learned pattern didn't work
    if (!price) {
      const pricePatterns = [
        /([\d.,]+)\s*(€|EUR|Euro|EUR\/Monat)/i,
        /(€|EUR|Euro)\s*([\d.,]+)/i,
        /preis[:\s]*([\d.,]+)/i,
        /miete[:\s]*([\d.,]+)/i,
        /([\d.,]+)\s*(EUR|Euro)\s*\/\s*Monat/i
      ]
      
      for (const pattern of pricePatterns) {
        const match = text.match(pattern)
        if (match) {
          const value = match[1] || match[2]
          price = this.extractPrice(value)
          if (price && price > 100 && price < 50000) break // Sanity check
        }
      }
    }

    // Surface extraction - try learned patterns first
    if (bestPatterns.surface) {
      if (bestPatterns.surface === '[itemprop="floorSize"]') {
        const floorSize = $('[itemprop="floorSize"]').attr('content') || $('[itemprop="floorSize"]').text()
        surface = this.extractSurface(floorSize)
      } else if (bestPatterns.surface === '.surface, .size') {
        const surfaceEl = $('.surface, .size').first().text()
        surface = this.extractSurface(surfaceEl)
      }
    }

    // Fallback to regex for surface
    if (!surface) {
      const surfacePatterns = [
        /([\d.,]+)\s*(m²|qm|m2|square\s*meters?)/i,
        /fläche[:\s]*([\d.,]+)/i,
        /size[:\s]*([\d.,]+)/i,
        /([\d.,]+)\s*(m²|qm)/i
      ]
      
      for (const pattern of surfacePatterns) {
        const match = text.match(pattern)
        if (match) {
          surface = this.extractSurface(match[1])
          if (surface && surface > 10 && surface < 1000) break // Sanity check
        }
      }
    }

    // Rooms extraction - try multiple patterns
    const roomsPatterns = [
      /(\d+(?:\.\d+)?)\s*(Zimmer|rooms?|pièces|bedrooms?)/i,
      /(\d+)\s*Z/i,
      /zimmer[:\s]*(\d+)/i,
      /rooms?[:\s]*(\d+)/i
    ]
    
    for (const pattern of roomsPatterns) {
      const match = text.match(pattern)
      if (match) {
        rooms = this.extractRooms(match[1])
        if (rooms && rooms > 0 && rooms < 20) break // Sanity check
      }
    }

    // Extract title - PRIORITÉ: Vraies annonces ont un bon titre
    let title = null
    
    // PRIORITÉ 1: Utiliser les sélecteurs spécifiques au site
    const titleSelectors = this.siteConfig?.titleSelectors || [
      'h1.listing-title',
      '.listing-title',
      '[itemprop="name"]',
      '.property-title',
      '.expose-title',
      'h1.title',
      '.headline',
      'h1', // H1 en dernier recours, mais on vérifiera qu'il est valide
      'title'
    ]
    
    for (const selector of titleSelectors) {
      const titleEl = $(selector).first()
      if (titleEl.length > 0) {
        title = titleEl.text().trim()
        // Nettoyer le titre
        title = title.replace(/\s+/g, ' ').trim()
        // Vérifier que c'est un vrai titre (pas trop court, pas trop long, pas générique)
        if (title.length >= 10 && title.length <= 200 && 
            !title.match(/^(Home|Startseite|Willkommen|Welcome|Error|404)$/i) &&
            !title.includes('JavaScript') && !title.includes('Cookie')) {
          break
        }
      }
    }
    
    // PRIORITÉ 2: Si pas de titre trouvé, chercher dans les meta tags
    if (!title || title.length < 10) {
      const ogTitle = $('meta[property="og:title"]').attr('content')
      const metaTitle = $('meta[name="title"]').attr('content')
      const titleTag = $('title').text()
      
      // Essayer og:title en premier (généralement le meilleur)
      if (ogTitle && ogTitle.length >= 10 && ogTitle.length <= 200) {
        title = ogTitle.trim().replace(/\s+/g, ' ')
        // Retirer les suffixes comme " | Immowelt", " - WG-Gesucht", etc.
        title = title.split('|')[0].split('- WG-Gesucht')[0].split('- Immowelt')[0].split('- ImmobilienScout24')[0].trim()
      } else if (metaTitle && metaTitle.length >= 10) {
        title = metaTitle.trim().replace(/\s+/g, ' ')
      } else if (titleTag && titleTag.length >= 10) {
        title = titleTag.trim().replace(/\s+/g, ' ')
        // Retirer les suffixes
        title = title.split('|')[0].split('-')[0].trim()
      }
    }
    
    // PRIORITÉ 3: Si toujours pas de titre, chercher dans le premier H1 ou H2
    if (!title || title.length < 10) {
      const h1 = $('h1').first().text().trim()
      const h2 = $('h2').first().text().trim()
      if (h1.length >= 10 && h1.length <= 200) {
        title = h1
      } else if (h2.length >= 10 && h2.length <= 200) {
        title = h2
      }
    }

    // Extract type
    const type = this.extractType(text)

    // Extract furnished status
    const furnished = this.extractFurnished(text)

    // Extract address first (needed for location extraction)
    const addressTag = $('address').text().trim() || $('[itemprop="address"]').text().trim()
    const address = addressTag || null

    // Extract location from meta tags or address elements
    let location = $('meta[property="og:locality"]').attr('content') || 
                   $('meta[name="locality"]').attr('content') || 
                   $('meta[property="og:title"]').attr('content')?.split(',')[0]?.trim() || 
                   $('[itemprop="addressLocality"]').text().trim() ||
                   $('address [itemprop="addressLocality"]').text().trim() ||
                   ''

    // Try to extract from address if still empty
    if (!location && addressTag) {
      const locationMatch = addressTag.match(/([A-ZÄÖÜ][a-zäöüß]+(?:[- ][A-ZÄÖÜ][a-zäöüß]+)?)/)
      if (locationMatch) {
        location = locationMatch[1]
      }
    }

    // Extract district
    const districtMatch = text.match(/in\s+([A-ZÄÖÜ][a-zäöüß]+(?:[- ][A-ZÄÖÜ][a-zäöüß]+)?)/)
    const district = districtMatch ? districtMatch[1] : null

    // Extract lat/lng from meta tags or data attributes
    const lat = parseFloat($('meta[property="place:location:latitude"]').attr('content') || 
                           $('meta[name="latitude"]').attr('content') || 
                           $('[data-lat]').attr('data-lat') ||
                           $('[data-latitude]').attr('data-latitude') ||
                           '') || null
    const lng = parseFloat($('meta[property="place:location:longitude"]').attr('content') || 
                           $('meta[name="longitude"]').attr('content') || 
                           $('[data-lng]').attr('data-lng') ||
                           $('[data-longitude]').attr('data-longitude') ||
                           '') || null

    // Extract description from multiple possible locations - IMPROVED
    let description = $('meta[name="description"]').attr('content') || 
                       $('meta[property="og:description"]').attr('content') || 
                       $('.description').first().text().trim() || 
                       $('[itemprop="description"]').text().trim() ||
                       $('.listing-description').text().trim() ||
                       $('.ad-description').text().trim() ||
                       $('.expose-description').text().trim() ||
                       $('.detail-description').text().trim() ||
                       $('#description').text().trim() ||
                       $('.text').first().text().trim() ||
                       null

    // If description is too short, try to extract from paragraphs
    if (!description || description.length < 100) {
      const paragraphs = []
      $('p').each((i, el) => {
        const text = $(el).text().trim()
        if (text.length > 50 && !text.includes('JavaScript') && !text.includes('Cookie')) {
          paragraphs.push(text)
        }
      })
      if (paragraphs.length > 0) {
        const fullDescription = paragraphs.join('\n\n')
        if (fullDescription.length > (description?.length || 0)) {
          description = fullDescription
        }
      }
    }

    // Note: We'll fetch the FULL description separately in fetchDetailedDescription
    // This is just a basic extract for initial validation

    // Extract images - PRIORITÉ: Config spécifique > Fallback générique
    const pictures = []
    
    // PRIORITÉ 1: Utiliser les sélecteurs spécifiques du site
    const imageSelectors = this.siteConfig?.imageSelectors || [
      'img[src*="wg-gesucht"]',
      'img[data-src]',
      '.gallery img',
      '.images img',
      '.photos img',
      '.listing-images img',
      'img[src*="immobilie"]',
      'img[src*="listing"]'
    ]
    
    for (const selector of imageSelectors) {
      $(selector).each((i, el) => {
        const src = $(el).attr('src') || $(el).attr('data-src') || $(el).attr('data-lazy-src')
        if (src && !src.includes('logo') && !src.includes('icon') && !src.includes('register-sofa')) {
          try {
            const absoluteUrl = new URL(src, url).href
            if (absoluteUrl.startsWith('http') && !pictures.includes(absoluteUrl)) {
              pictures.push(absoluteUrl)
            }
          } catch (e) {
            // Invalid URL
          }
        }
      })
      if (pictures.length > 0) break // Stop if we found images
    }
    
    // Fallback: get all images
    if (pictures.length === 0) {
      $('img').each((i, el) => {
        const src = $(el).attr('src') || $(el).attr('data-src')
        if (src && !src.includes('logo') && !src.includes('icon') && !src.includes('register-sofa')) {
          try {
            const absoluteUrl = new URL(src, url).href
            if (absoluteUrl.startsWith('http') && !pictures.includes(absoluteUrl)) {
              pictures.push(absoluteUrl)
            }
          } catch (e) {
            // Invalid URL
          }
        }
      })
    }

    // Extract additional details
    const additionalDetails = {}
    
    // Extract available from date
    const availableFromMatch = text.match(/(ab|from|available|verfügbar|miete)(\s*:)?\s*(\d{1,2})[.\/](\d{1,2})[.\/](\d{4})/i)
    if (availableFromMatch) {
      additionalDetails.availableFrom = `${availableFromMatch[5]}-${availableFromMatch[4]}-${availableFromMatch[3]}`
    }

    // Extract features/amenities
    const features = []
    const featureKeywords = ['balkon', 'balcony', 'garten', 'garden', 'parkplatz', 'parking', 'garage', 'keller', 'basement', 'elevator', 'aufzug', 'wifi', 'internet', 'washing', 'waschmaschine']
    for (const keyword of featureKeywords) {
      if (text.toLowerCase().includes(keyword)) {
        features.push(keyword)
      }
    }
    additionalDetails.features = features

    return {
      price,
      surface,
      rooms,
      type,
      furnished,
      location,
      district,
      address,
      lat,
      lng,
      description: description || null,
      pictures: pictures.slice(0, 20), // Limit to 20 images
      scrapedAt: new Date().toISOString(),
      ...additionalDetails
    }
  }

  /**
   * Extract price from various formats
   */
  extractPrice(value) {
    if (!value) return null
    if (typeof value === 'number') return value
    const match = String(value).match(/(\d+(?:[.,]\d+)?)/)
    return match ? parseFloat(match[1].replace(',', '.')) : null
  }

  /**
   * Extract surface from various formats
   */
  extractSurface(value) {
    if (!value) return null
    if (typeof value === 'number') return value
    const match = String(value).match(/(\d+(?:[.,]\d+)?)/)
    return match ? parseFloat(match[1].replace(',', '.')) : null
  }

  /**
   * Extract number of rooms
   */
  extractRooms(value) {
    if (!value) return null
    if (typeof value === 'number') return value
    const match = String(value).match(/(\d+(?:[.,]\d+)?)/)
    return match ? parseFloat(match[1].replace(',', '.')) : null
  }

  /**
   * Extract property type
   */
  extractType(text) {
    const lowerText = String(text || '').toLowerCase()
    if (lowerText.includes('wg') || lowerText.includes('wgs')) return 'WG'
    if (lowerText.includes('studio')) return 'studio'
    if (lowerText.includes('apartment') || lowerText.includes('wohnung')) return 'apartment'
    if (lowerText.includes('house') || lowerText.includes('haus')) return 'house'
    return 'other'
  }

  /**
   * Extract furnished status
   */
  extractFurnished(text) {
    const lowerText = String(text || '').toLowerCase()
    if (lowerText.includes('möbliert') || lowerText.includes('furnished')) return true
    if (lowerText.includes('unmöbliert') || lowerText.includes('non-furnished') || lowerText.includes('unfurnished')) return false
    return false // Default to false
  }

  /**
   * Extract images from JSON-LD or array
   */
  extractImages(images) {
    if (!images) return []
    if (typeof images === 'string') return [images]
    if (Array.isArray(images)) return images.filter(img => typeof img === 'string')
    return []
  }

  /**
   * Normalize listing data to MongoDB schema
   */
  normalizeListing(data, url) {
    // Extract external ID from URL
    const externalId = this.extractExternalId(url)
    
    // Build hash for deduplication
    const hash = this.buildHash(
      url,
      data.price || '',
      data.surface || '',
      data.rooms || '',
      data.location || ''
    )

    // Extract title - utiliser le titre extrait (priorité)
    let title = data.title || 'No title'
    
    // Nettoyer le titre - retirer les suffixes de site
    if (title && title.length > 0) {
      title = title.split('|')[0].split('- WG-Gesucht')[0].split('- Immowelt')[0].split('- ImmobilienScout24')[0].trim()
    }
    
    // Si le titre est trop court, générique, ou ressemble à du contenu (commence par "Sind Sie", "Hier finden", etc.)
    const genericPatterns = [
      /^Sind Sie/i,
      /^Hier finden/i,
      /^Willkommen/i,
      /^Welcome/i,
      /^Home$/i,
      /^Startseite$/i,
      /^Listing$/i,
      /^No title$/i
    ]
    
    const isGeneric = genericPatterns.some(p => p.test(title))
    
    if (!title || title.length < 10 || isGeneric) {
      // Construire un titre basé sur les données disponibles
      const parts = []
      if (data.location) parts.push(data.location)
      if (data.surface) parts.push(`${data.surface}m²`)
      if (data.rooms) parts.push(`${data.rooms} Zimmer`)
      if (data.price) parts.push(`${data.price}€`)
      if (parts.length > 0) {
        title = parts.join(' - ')
      } else if (data.description) {
        // Prendre les premiers mots significatifs de la description
        const descWords = data.description.split(/[.!?]/)[0].trim()
        if (descWords.length >= 10 && descWords.length <= 150) {
          title = descWords
        } else {
          title = data.description.substring(0, 80).trim()
        }
      }
    }

    // Parse available_from date
    let availableFrom = new Date()
    if (data.availableFrom) {
      availableFrom = new Date(data.availableFrom)
    }

    return {
      // Required fields for MongoDB schema
      title: title.substring(0, 200),
      description: (data.description || ''), // Keep full description, will be updated with detailed one
      price: data.price ? parseInt(data.price) : 0,
      location: data.location || '',
      district: data.district || data.location || '',
      surface: data.surface ? parseFloat(data.surface) : 0,
      rooms: data.rooms ? parseFloat(data.rooms) : 0,
      type: this.normalizeType(data.type || 'other'),
      images: data.pictures || [],
      url_source: url,
      source_name: this.provider,
      scraped_at: new Date(),
      is_active: true,
      available_from: availableFrom,
      
      // Additional fields
      hash: hash,
      provider: this.provider,
      external_id: externalId,
      lat: data.lat || null,
      lng: data.lng || null,
      address: data.address || null,
      furnished: data.furnished || false,
      features: data.features || [],
      
      // Status tracking
      active: true,
      last_seen_at: new Date(),
      last_checked: new Date(),
      
      // Metadata
      createdAt: new Date(),
      updatedAt: new Date()
    }
  }

  /**
   * Extract external ID from URL
   */
  extractExternalId(url) {
    try {
      const urlObj = new URL(url)
      const pathParts = urlObj.pathname.split('/').filter(p => p)
      
      // Extract numeric ID (e.g., /12345.html)
      const numericId = pathParts.find(p => /^\d+/.test(p))
      if (numericId) {
        return numericId.replace('.html', '')
      }
      
      // Extract ID from path
      return pathParts[pathParts.length - 1] || url
    } catch (e) {
      return url
    }
  }

  /**
   * Normalize type to match schema enum
   */
  normalizeType(type) {
    const typeLower = type.toLowerCase()
    if (typeLower.includes('wg') || typeLower.includes('room')) return 'WG'
    if (typeLower.includes('studio')) return 'studio'
    if (typeLower.includes('apartment') || typeLower.includes('wohnung')) return 'apartment'
    if (typeLower.includes('house') || typeLower.includes('haus')) return 'house'
    return 'apartment' // Default
  }

  /**
   * Save listing to MongoDB
   */
  async saveListingToMongo(listing) {
    if (!this.mongoCollection) {
      return false
    }

    try {
      // Check if listing exists (by hash or provider+external_id)
      const existing = await this.mongoCollection.findOne({
        $or: [
          { hash: listing.hash },
          { provider: listing.provider, external_id: listing.external_id }
        ]
      })

      if (existing) {
        // Update existing listing
        listing.updatedAt = new Date()
        listing.last_seen_at = new Date()
        listing.last_checked = new Date()
        
        await this.mongoCollection.updateOne(
          { _id: existing._id },
          { $set: listing }
        )
        
        return 'updated'
      } else {
        // Insert new listing
        await this.mongoCollection.insertOne(listing)
        this.stats.savedToMongo++
        return 'inserted'
      }
    } catch (error) {
      console.error(`   ⚠️ Error saving listing to MongoDB: ${error.message}`)
      return false
    }
  }

  /**
   * Fetch detailed description from listing page (improved extraction)
   */
  async fetchDetailedDescription(listingUrl) {
    try {
      const response = await this.fetch(listingUrl)
      if (!response || response.statusCode !== 200) {
        return null
      }

      const $ = cheerio.load(response.bodyText)
      
      // Try multiple selectors for detailed description - prioritize main content
      const descriptionSelectors = [
        '.panel-body',           // WG-Gesucht main content
        '.description-content',  // Generic description content
        '.listing-description',  // Listing description
        '.ad-description',       // Ad description
        '.expose-description',   // Expose description
        '.detail-description',   // Detail description
        '#description',          // Description ID
        '[itemprop="description"]', // Schema.org description
        '.text-content',         // Text content
        '.content',              // Generic content
        '.main-content',         // Main content area
        'article .text',         // Article text
        '.post-content'          // Post content
      ]

      let fullDescription = ''
      
      // Try selectors in order
      for (const selector of descriptionSelectors) {
        const element = $(selector).first()
        if (element.length > 0) {
          const text = element.text().trim()
          // Get longer description if found
          if (text.length > fullDescription.length && text.length > 100) {
            fullDescription = text
          }
        }
      }

      // If no good selector found, extract from all paragraphs (combine them)
      if (!fullDescription || fullDescription.length < 100) {
        const paragraphs = []
        $('p').each((i, el) => {
          const text = $(el).text().trim()
          if (text.length > 20 && 
              !text.includes('JavaScript') && 
              !text.includes('Cookie') &&
              !text.includes('Werbeblocker') &&
              !text.includes('Please enable') &&
              !text.includes('Bitte aktivieren') &&
              !text.match(/^\d+$/) && // Skip pure numbers
              !text.match(/^(OK|Cancel|Close|Schließen)$/i)) {
            paragraphs.push(text)
          }
        })
        if (paragraphs.length > 0) {
          const combinedDescription = paragraphs.join('\n\n')
          if (combinedDescription.length > fullDescription.length) {
            fullDescription = combinedDescription
          }
        }
      }

      // Also try to extract from divs with common classes
      if (!fullDescription || fullDescription.length < 100) {
        const contentDivs = $('.description, .content, .text, .body, .details, .panel-body, .main-content')
        contentDivs.each((i, el) => {
          const text = $(el).text().trim()
          // Skip if it's too short or contains navigation/menu items
          if (text.length > 100 && 
              text.length > fullDescription.length &&
              !text.includes('Navigation') &&
              !text.includes('Menu') &&
              !text.includes('Cookie')) {
            fullDescription = text
          }
        })
      }

      // Try to get all text from main content area
      if (!fullDescription || fullDescription.length < 200) {
        // Look for main content containers
        const mainContent = $('main, article, .main, .content-wrapper, .listing-details')
        if (mainContent.length > 0) {
          const mainText = mainContent.first().text().trim()
          if (mainText.length > fullDescription.length && mainText.length > 200) {
            fullDescription = mainText
          }
        }
      }

      // Remove common noise patterns
      if (fullDescription) {
        fullDescription = fullDescription
          .replace(/\n{3,}/g, '\n\n') // Remove excessive newlines
          .replace(/\s{3,}/g, ' ')    // Remove excessive spaces
          .trim()
      }

      return fullDescription || null
    } catch (error) {
      console.error(`   ⚠️ Error fetching detailed description: ${error.message}`)
      return null
    }
  }

  /**
   * Process a single listing URL - with learning and validation
   */
  async processListingUrl(listingUrl) {
    if (this.visitedUrls.has(listingUrl)) return null

    // Skip blacklisted marketplaces (student housing or non-Berlin portals)
    if (isBlacklistedUrl(listingUrl)) {
      console.log(`   ❌ Skipping blacklisted domain: ${listingUrl}`)
      this.stats.failedExtractions++
      return null
    }

    this.visitedUrls.add(listingUrl)

    await this.delay(500) // Rate limiting

    const response = await this.fetch(listingUrl)
    if (!response || response.statusCode !== 200) {
      this.stats.failedExtractions++
      return null
    }

    // ✅ PHASE DE VÉRIFICATION: Est-ce une vraie page de listing?
    // Note: Validation moins stricte - on vérifiera les données extraites après
    const isDefinitelyNotListing = this.isDefinitelyNotListing(response.bodyText, listingUrl)
    if (isDefinitelyNotListing) {
      console.log(`   ⚠️ Page ignorée (pas une vraie listing): ${listingUrl.substring(0, 60)}...`)
      this.stats.failedExtractions++
      return null
    }

    this.stats.totalProcessed++

    // Analyze page structure first
    const analysis = this.analyzeHtmlStructure(response.bodyText)
    
    // Skip if it's clearly an index page (unless we're learning)
    if (analysis.isIndexPage && !analysis.isListingPage) {
      // Try to extract listing URLs from this index page
      const listingUrls = this.extractListingUrls(response.bodyText, listingUrl)
      if (listingUrls.length > 0) {
        console.log(`   📊 Found ${listingUrls.length} listings on index page`)
        listingUrls.forEach(url => this.listingUrls.add(url))
      }
      return null
    }

    // Use ONLY OpenAI for extraction - no fallbacks, no keywords
    let listingData = null
    
    if (response.bodyText) {
      const openAIExtractor = await loadOpenAIExtractor()
        if (openAIExtractor) {
          console.log(`   🤖 Using OpenAI to extract ALL information from HTML...`)
          listingData = await openAIExtractor(response.bodyText, listingUrl)
          
          // Check if GPT determined this is not a valid listing
          if (listingData && listingData.isValidListing === false) {
            console.log(`   ❌ GPT determined this is not a valid rental listing - skipping`)
            this.stats.failedExtractions++
            return null
          }
          
          if (listingData && listingData.price) {
            console.log(`   ✅ OpenAI extraction successful`)
          } else {
            console.log(`   ❌ OpenAI extraction failed - skipping this listing`)
            this.stats.failedExtractions++
            return null
          }
        } else {
          console.log(`   ❌ OpenAI not configured - skipping this listing`)
          this.stats.failedExtractions++
          return null
        }
    } else {
      console.log(`   ❌ No HTML content - skipping this listing`)
      this.stats.failedExtractions++
      return null
    }

    // Validate extraction quality - on sauvegarde seulement les vraies annonces
    if (!listingData || !listingData.price || listingData.price < 50 || listingData.price > 50000) {
      console.log(`   ⚠️ Données invalides: prix manquant ou invalide (${listingData?.price || 'N/A'})`)
      this.stats.failedExtractions++
      return null
    }
    
    // Normaliser les données selon le schéma MongoDB
    const normalized = this.normalizeListing(listingData, listingUrl)
    
    // VALIDATION: Ensure this is a real rental listing
    if (!normalized.price || normalized.price <= 0) {
      console.log(`   ❌ No valid price found - skipping this listing`)
      this.stats.failedExtractions++
      return null
    }
    
    // VALIDATION: Let GPT decide if it's a valid rental listing
    // We trust GPT's intelligence to determine if this is a real rental listing
    // No more limited keyword-based validation
    
    // Si pas de coordonnées mais qu'on a une adresse, utiliser géocodage approximatif selon quartier
    if (!normalized.lat || !normalized.lng) {
      const districtLower2 = (normalized.district || '').toLowerCase()
      const coordsMap = {
        'mitte': { lat: 52.5200, lng: 13.4050 },
        'friedrichshain': { lat: 52.5145, lng: 13.4531 },
        'kreuzberg': { lat: 52.4991, lng: 13.4031 },
        'charlottenburg': { lat: 52.5170, lng: 13.2999 },
        'neukölln': { lat: 52.4823, lng: 13.4342 },
        'prenzlauer berg': { lat: 52.5438, lng: 13.4071 },
        'wedding': { lat: 52.5439, lng: 13.3541 },
        'moabit': { lat: 52.5269, lng: 13.3453 },
        'schöneberg': { lat: 52.4889, lng: 13.3553 }
      }
      
      for (const [district, coords] of Object.entries(coordsMap)) {
        if (districtLower2.includes(district)) {
          normalized.lat = coords.lat
          normalized.lng = coords.lng
          console.log(`   📍 Coordonnées approximatives ajoutées pour ${district}`)
          break
        }
      }
      
      // Fallback au centre de Berlin
      if (!normalized.lat || !normalized.lng) {
        normalized.lat = 52.5200
        normalized.lng = 13.4050
        console.log(`   📍 Coordonnées par défaut: centre de Berlin`)
      }
    }
    
    // Validation finale des champs requis MongoDB - on sauvegarde les vraies annonces
    if (!normalized.title || normalized.title.length < 5) {
      console.log(`   ⚠️ Titre invalide ou trop court: "${normalized.title}"`)
      this.stats.failedExtractions++
      return null
    }
    
    // Description: minimum 20 caractères OU si on a prix+location valides on accepte
    const hasBasicInfo = normalized.price && normalized.price > 0 && normalized.location && normalized.location.length > 1
    if (!normalized.description || (normalized.description.length < 20 && !hasBasicInfo)) {
      console.log(`   ⚠️ Description invalide ou trop courte (${normalized.description?.length || 0} chars)`)
      this.stats.failedExtractions++
      return null
    }
    
    if (!normalized.location || normalized.location.length < 1) {
      console.log(`   ⚠️ Localisation manquante`)
      this.stats.failedExtractions++
      return null
    }
    
    // Surface: optionnelle pour les WG/chambres, mais si présente doit être valide
    if (normalized.surface && normalized.surface > 0 && (normalized.surface < 5 || normalized.surface > 1000)) {
      console.log(`   ⚠️ Surface invalide: ${normalized.surface}m²`)
      // Pour les WG, on peut accepter de petites surfaces, alors on continue si c'est une chambre
      if (normalized.type !== 'WG' || normalized.surface < 3) {
        this.stats.failedExtractions++
        return null
      }
    }
    
    // Nettoyer le titre - retirer les textes de pub et garder seulement le vrai titre
    if (normalized.title) {
      // Retirer les patterns de pub communs
      normalized.title = normalized.title
        .replace(/URBANELITE\.COM\s*\/\/.*?\/\//gi, '')
        .replace(/Keine Kaution.*?\/\//gi, '')
        .replace(/\/\/.*?\/\//g, '')
        .replace(/^[^a-zA-Z0-9äöüÄÖÜ]*/g, '')
        .trim()
      
      // Si titre toujours invalide ou générique, générer un nouveau
      if (!normalized.title || normalized.title.length < 5 || normalized.title.match(/^(Home|Startseite|Welcome|Listing|No title|Sind Sie|URBANELITE)/i)) {
        const parts = []
        if (normalized.location && !normalized.location.includes('URBANELITE')) parts.push(normalized.location.split(',')[1]?.trim() || normalized.location)
        if (normalized.surface) parts.push(`${normalized.surface}m²`)
        if (normalized.rooms) parts.push(`${normalized.rooms} Zimmer`)
        if (normalized.type) parts.push(normalized.type === 'WG' ? 'Zimmer' : normalized.type)
        if (normalized.price) parts.push(`${normalized.price}€`)
        
        if (parts.length > 0) {
          normalized.title = parts.join(' - ')
        } else if (normalized.description) {
          normalized.title = normalized.description.substring(0, 80).split('.')[0].trim()
        }
        console.log(`   📝 Titre nettoyé/généré: ${normalized.title.substring(0, 60)}...`)
      }
    }
    
    // Nettoyer location aussi
    if (normalized.location) {
      normalized.location = normalized.location
        .replace(/URBANELITE\.COM.*?\/\//gi, '')
        .replace(/\/\/.*?\/\//g, '')
        .trim()
      
      // S'assurer que location contient Berlin
      if (normalized.location && !normalized.location.toLowerCase().includes('berlin')) {
        normalized.location = `Berlin, ${normalized.location}`
      }
    }
    
    // Fetch detailed description si on a une description basique
    if (!normalized.description || normalized.description.length < 100) {
      console.log(`   📝 Fetching FULL detailed description...`)
      const detailedDescription = await this.fetchDetailedDescription(listingUrl)
      if (detailedDescription && detailedDescription.length > 50) {
        normalized.description = detailedDescription
      }
    }
    
    // Ensure description fits MongoDB schema (maxlength: 2000)
    if (normalized.description && normalized.description.length > 2000) {
      normalized.description = normalized.description.substring(0, 2000)
    }
    
    this.results.push(normalized)
    
    // Save to MongoDB - TOUJOURS sauvegarder si validation passée
    if (this.saveToMongo && this.mongoCollection) {
      try {
        const saveResult = await this.saveListingToMongo(normalized)
        if (saveResult) {
          console.log(`   ✅ Sauvegardé dans MongoDB [${saveResult === 'inserted' ? '✓ Nouveau' : '↑ Existant'}] - ${normalized.title.substring(0, 50)}`)
          this.stats.savedToMongo = (this.stats.savedToMongo || 0) + 1
        } else {
          console.log(`   ⚠️ Échec sauvegarde MongoDB - voir erreurs ci-dessus`)
        }
      } catch (error) {
        console.error(`   ❌ Erreur sauvegarde MongoDB: ${error.message}`)
      }
    } else if (!this.mongoCollection) {
      console.log(`   ⚠️ MongoDB non connecté - listing non sauvegardé`)
    }
    
    // Learn from successful extraction
    this.learnFromSuccess(response.bodyText, listingData, listingUrl)
    
    return normalized
  }

  /**
   * Check if URL is a listing search page
   */
  isListingSearchPage(url) {
    const urlLower = url.toLowerCase()
    const searchPatterns = [
      /wohnungen-in-.*\.\d+\.\d+\.\d+\.\d+\.html/i, // WG-Gesucht
      /\/Suche\//i, // ImmobilienScout24
      /\/liste\/.*\/wohnungen/i, // Immowelt
      /\/mieten\//i, // Generic
    ]
    return searchPatterns.some(pattern => pattern.test(urlLower))
  }

  /**
   * Start from listing search page (known pattern)
   */
  async startFromSearchPage(searchUrl) {
    console.log(`\n🎯 Detected listing search page!`)
    console.log(`📍 URL: ${searchUrl}`)
    
    const response = await this.fetch(searchUrl)
    if (!response || response.statusCode !== 200) {
      console.log(`⚠️  Could not fetch search page`)
      return []
    }

    // Extract listing URLs using improved methods
    const listingUrls = this.extractListingUrls(response.bodyText, searchUrl)
    
    // Also try WG-Gesucht specific extraction (data-id pattern)
    const $ = cheerio.load(response.bodyText)
    const sections = response.bodyText.split(/data-id="(\d+)"/)
    if (sections.length > 1) {
      console.log(`📊 Found ${(sections.length - 1) / 2} listings with data-id pattern`)
      for (let i = 1; i < sections.length; i += 2) {
        const id = sections[i]
        if (id) {
          const listingUrl = `https://www.wg-gesucht.de/${id}.html`
          listingUrls.push(listingUrl)
        }
      }
    }

    console.log(`✅ Found ${listingUrls.length} total listing URLs`)
    
    // Follow pagination if this is an index page
    const analysis = this.analyzeHtmlStructure(response.bodyText)
    if (analysis.isIndexPage && listingUrls.length > 0) {
      console.log(`📄 Following pagination...`)
      const paginatedUrls = await this.followPagination(searchUrl)
      listingUrls.push(...paginatedUrls)
      console.log(`✅ Total listing URLs after pagination: ${listingUrls.length}`)
    }
    
    return [...new Set(listingUrls)] // Remove duplicates
  }

  /**
   * Main crawling process
   */
  async crawl() {
    console.log(`🚀 Starting HTTP-only crawl for: ${this.rootUrl}`)
    console.log('=' .repeat(60))

    // Connect to MongoDB
    if (this.saveToMongo) {
      await this.connectMongo()
    }

    // Check if this is a listing search page
    if (this.isListingSearchPage(this.rootUrl)) {
      console.log(`\n✅ Detected listing search page - using optimized extraction`)
      // Utiliser la recherche approfondie pour trouver les vraies URLs de listings
      const response = await this.fetch(this.rootUrl)
      if (response && response.statusCode === 200) {
        // RECHERCHE APPROFONDIE: chercher dans les scripts, data-*, etc.
        const deepAnalysis = this.deepSearchForListings(response.bodyText, this.rootUrl)
        
        if (deepAnalysis.listingUrls.length > 0) {
          console.log(`✅ Found ${deepAnalysis.listingUrls.length} listing URLs via deep search`)
          this.listingUrls = new Set(deepAnalysis.listingUrls)
        } else {
          // Fallback à l'analyse standard si recherche approfondie ne trouve rien
          const analysis = this.isListingIndexPageAdvanced(response.bodyText, this.rootUrl)
          
          if (analysis.isListingIndex && analysis.listingUrls.length > 0) {
            console.log(`✅ Found ${analysis.listingUrls.length} listing links via standard analysis`)
            this.listingUrls = new Set(analysis.listingUrls)
          }
        }
        
        if (this.listingUrls.size > 0) {
          // Chercher la pagination
          console.log(`\n📄 Checking for pagination...`)
          const paginationUrls = this.extractPaginationUrls(response.bodyText, this.rootUrl)
          if (paginationUrls.length > 0) {
            console.log(`   📋 Found ${paginationUrls.length} additional pages`)
            for (const paginationUrl of paginationUrls.slice(0, 5)) {
              const pagResponse = await this.fetch(paginationUrl)
              if (pagResponse && pagResponse.statusCode === 200) {
                const pagAnalysis = this.isListingIndexPageAdvanced(pagResponse.bodyText, paginationUrl)
                if (pagAnalysis.isListingIndex && pagAnalysis.listingUrls.length > 0) {
                  pagAnalysis.listingUrls.forEach(url => this.listingUrls.add(url))
                  console.log(`   ✅ Added ${pagAnalysis.listingUrls.length} listings from page ${paginationUrls.indexOf(paginationUrl) + 2}`)
                }
              }
              await this.delay(500)
            }
          }
        } else {
          // Fallback à startFromSearchPage si l'analyse avancée ne trouve rien
          console.log(`⚠️  Advanced analysis found ${analysis.listingLinkCount} links, trying fallback...`)
          const listingUrls = await this.startFromSearchPage(this.rootUrl)
          this.listingUrls = new Set(listingUrls)
        }
      }
    } else {
      // Step 1: Check robots.txt
      console.log('\n📋 Step 1: Checking robots.txt...')
      await this.checkRobotsTxt()

      // Step 2: Try sitemap.xml
      console.log('\n🗺️  Step 2: Checking sitemap.xml...')
      const sitemapUrls = await this.parseSitemap(`${this.rootDomain}/sitemap.xml`)
      if (sitemapUrls.length > 0) {
        console.log(`✅ Found ${sitemapUrls.length} URLs in sitemap`)
        this.listingUrls = new Set(sitemapUrls)
      } else {
        // Step 3: Find listing pages from homepage
        console.log('\n🔍 Step 3: Finding listing pages from homepage...')
        const candidateUrls = await this.findListingPagesFromHomepage()
        console.log(`✅ Found ${candidateUrls.length} candidate URLs`)

      // Step 4: Identify listings index pages
      console.log('\n📊 Step 4: Identifying listings index pages...')
      
      // PRIORITÉ: Utiliser les conteneurs spécifiques du site pour détecter les index
      const listingSelectors = this.siteConfig?.listingContainer || [
        'article',
        '[data-listing-id]',
        '[data-id]',
        '.listing',
        '.result-item',
        '.property-item',
        '.offer-item',
        '.ad-item'
      ]
      
      for (const url of candidateUrls.slice(0, 5)) { // Check first 5
        const response = await this.fetch(url)
        if (response && response.statusCode === 200) {
          const analysis = this.isListingIndexPageAdvanced(response.bodyText, url)
          if (analysis.isListingIndex && analysis.listingUrls.length > 0) {
            console.log(`✅ Found listings index: ${url}`)
            analysis.listingUrls.forEach(u => this.listingUrls.add(u))
            break // Use first valid index
          }
        }
      }

        // If no index found, try to extract listings from candidate URLs
        if (this.listingUrls.size === 0) {
          console.log('⚠️  No listings index found, trying to extract from candidate URLs...')
          for (const url of candidateUrls.slice(0, 3)) {
            const response = await this.fetch(url)
            if (response && response.statusCode === 200) {
              const listingUrls = this.extractListingUrls(response.bodyText, url)
              listingUrls.forEach(u => this.listingUrls.add(u))
              if (listingUrls.length > 0) {
                console.log(`✅ Extracted ${listingUrls.length} listing URLs from ${url}`)
                break
              }
            }
          }
          
          // If still no listings found, use candidates as-is (but filter out index pages)
          if (this.listingUrls.size === 0) {
            candidateUrls.forEach(u => {
              // Skip obvious index pages
              if (!u.includes('?cat=') && !u.includes('wohnraumangebote')) {
                this.listingUrls.add(u)
              }
            })
          }
        }
      }
    }

    console.log(`\n📋 Found ${this.listingUrls.size} listing URLs to process`)

    // Step 5: Process each listing URL
    console.log('\n🔄 Step 5: Processing listing URLs...')
    const maxListings = this.options?.maxListings || 50 // Allow configurable limit
    let processed = 0
    for (const url of Array.from(this.listingUrls).slice(0, maxListings)) {
      processed++
      process.stdout.write(`\r   Processing ${processed}/${Math.min(this.listingUrls.size, maxListings)}...`)
      
      const listing = await this.processListingUrl(url)
      if (listing) {
        // Small delay between requests
        await this.delay(500)
      }
    }
    console.log(`\n✅ Processed ${processed} listings`)

    // Summary
    console.log('\n' + '='.repeat(60))
    console.log('📊 CRAWLING SUMMARY')
    console.log('='.repeat(60))
    console.log(`Total URLs found: ${this.listingUrls.size}`)
    console.log(`Total listings extracted: ${this.results.length}`)
    console.log(`Errors: ${this.errors.length}`)
    console.log(`\n📈 LEARNING STATS:`)
    console.log(`  Success rate: ${this.stats.totalProcessed > 0 ? Math.round((this.stats.successfulExtractions / this.stats.totalProcessed) * 100) : 0}%`)
    console.log(`  Successful: ${this.stats.successfulExtractions}`)
    console.log(`  Failed: ${this.stats.failedExtractions}`)
    if (this.saveToMongo) {
      console.log(`  Saved to MongoDB: ${this.stats.savedToMongo}`)
    }
    
    const bestPatterns = this.getBestPatterns()
    if (bestPatterns.price || bestPatterns.surface) {
      console.log(`\n🎯 LEARNED PATTERNS:`)
      if (bestPatterns.price) console.log(`  Best price pattern: ${bestPatterns.price}`)
      if (bestPatterns.surface) console.log(`  Best surface pattern: ${bestPatterns.surface}`)
      if (bestPatterns.listingUrl) console.log(`  Best listing URL pattern: ${bestPatterns.listingUrl}`)
    }

    // Disconnect from MongoDB
    if (this.saveToMongo) {
      await this.disconnectMongo()
    }

    if (this.results.length > 0) {
      console.log('\n📋 Sample Results:')
      this.results.slice(0, 3).forEach((result, i) => {
      console.log(`\nListing ${i + 1}:`)
      console.log(`  URL: ${result.url_source}`)
      console.log(`  Title: ${result.title}`)
      console.log(`  Price: ${result.price}€`)
      console.log(`  Surface: ${result.surface}m²`)
      console.log(`  Rooms: ${result.rooms}`)
      console.log(`  Type: ${result.type}`)
      console.log(`  Location: ${result.location}`)
      console.log(`  Description: ${result.description ? result.description.substring(0, 100) + '...' : 'N/A'}`)
      })
    }

    return {
      totalUrls: this.listingUrls.size,
      listings: this.results,
      errors: this.errors
    }
  }
}

// Export for use as module
export default HttpOnlyCrawler
export { HttpOnlyCrawler }

// CLI usage - check if this script is being run directly (not imported)
if (typeof process !== 'undefined' && process.argv[1] && 
    process.argv[1].endsWith('http-only-crawler.js') &&
    !process.argv[1].includes('multi-site-crawler')) {
  const rootUrl = process.argv[2]
  if (!rootUrl) {
    console.error('Usage: node http-only-crawler.js <root-url>')
    console.error('Example: node http-only-crawler.js https://www.immobilienscout24.de')
    process.exit(1)
  }

  const crawler = new HttpOnlyCrawler(rootUrl)
  crawler.crawl()
    .then(results => {
      console.log('\n✅ Crawling completed successfully!')
      // Optionally save results to file
      if (results.listings.length > 0) {
        const filename = `crawl-results-${Date.now()}.json`
        writeFileSync(
          filename,
          JSON.stringify(results, null, 2)
        )
        console.log(`\n💾 Results saved to ${filename}`)
      }
      process.exit(0)
    })
    .catch(error => {
      console.error('\n❌ Crawling failed:', error)
      process.exit(1)
    })
}

