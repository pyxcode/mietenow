/**
 * OpenAI HTML Extractor
 * Extracts structured listing data from raw HTML using OpenAI
 */

import OpenAI from 'openai'

// Initialize OpenAI only if API key is present to avoid errors
// Re-initialize on each call to ensure env vars are loaded
function getOpenAIClient() {
  if (process.env.OPENAI_API_KEY) {
    return new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
  }
  return null
}

/**
 * Validate if a page is a rental listings search/index page using OpenAI
 * @param {string} html - Complete HTML content
 * @param {string} url - Page URL
 * @returns {Promise<Object>} Validation result with isValidPage boolean
 */
export async function validateListingIndexPage(html, url) {
  const openai = getOpenAIClient()
  if (!process.env.OPENAI_API_KEY || !openai) {
    return { isValidPage: true, reason: 'OpenAI not configured, skipping validation' }
  }

  try {
    // Extract main content to reduce tokens
    let contentHtml = html
      .match(/<body[^>]*>([\s\S]*?)<\/body>/i)?.[1] || html
      .match(/<main[^>]*>([\s\S]*?)<\/main>/i)?.[1] || html
    
    const cleanedHtml = (contentHtml || html)
      .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
      .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
      .replace(/<noscript[^>]*>[\s\S]*?<\/noscript>/gi, '')
      .replace(/<nav[^>]*>[\s\S]*?<\/nav>/gi, '')
      .replace(/<footer[^>]*>[\s\S]*?<\/footer>/gi, '')
      .replace(/\s+/g, ' ')
      // Reduce from 80k to 15k chars (5x reduction)
      .substring(0, 15000)

    const prompt = `Est-ce une page de LISTE d'annonces location LONG TERME à Berlin?

URL: ${url}

Réponds en JSON: {"isValidPage": true|false, "reason": "court", "listingCount": nombre}`

    const response = await openai.chat.completions.create({
      model: 'gpt-4.1-nano',
      messages: [
        { role: 'system', content: 'Réponds en JSON valide.' },
        { role: 'user', content: prompt + '\n\nHTML:\n' + cleanedHtml }
      ],
      temperature: 0.1,
      response_format: { type: 'json_object' }
    })

    const content = response.choices[0].message.content
    const result = JSON.parse(content)

    return {
      isValidPage: result.isValidPage === true,
      reason: result.reason || 'No reason provided',
      listingCount: result.listingCount || 0
    }
  } catch (error) {
    console.error(`   ⚠️ OpenAI validation error: ${error.message}`)
    return { isValidPage: true, reason: 'Validation failed, assuming valid', listingCount: 0 }
  }
}

/**
 * Extract listing data from HTML using OpenAI
 * @param {string} html - Complete HTML content
 * @param {string} url - Listing URL
 * @returns {Promise<Object|null>} Extracted listing data
 */
export async function extractListingWithOpenAI(html, url) {
  const openai = getOpenAIClient()
  if (!process.env.OPENAI_API_KEY || !openai) {
    console.log('   ⚠️ OPENAI_API_KEY not configured, skipping OpenAI extraction')
    return null
  }

  try {
    // Quick pre-filter: reject obvious non-Berlin or student sites
    const urlLower = url.toLowerCase()
    const studentSites = ['student.com', 'uniplaces.com', 'spotahome.com', 'erasmusu.com', 'housinganywhere.com']
    if (studentSites.some(site => urlLower.includes(site))) {
      console.log(`   ⚠️ Student marketplace detected, skipping GPT call`)
      return { isValidListing: false }
    }

    // Extract only main content (body, article, main, content sections)
    // This dramatically reduces token usage
    let contentHtml = html
      // Extract main content areas first
      .match(/<body[^>]*>([\s\S]*?)<\/body>/i)?.[1] || html
      .match(/<main[^>]*>([\s\S]*?)<\/main>/i)?.[1] || html
      .match(/<article[^>]*>([\s\S]*?)<\/article>/i)?.[1] || html
    
    // Clean aggressively
    const cleanedHtml = (contentHtml || html)
      .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
      .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
      .replace(/<noscript[^>]*>[\s\S]*?<\/noscript>/gi, '')
      .replace(/<nav[^>]*>[\s\S]*?<\/nav>/gi, '')
      .replace(/<footer[^>]*>[\s\S]*?<\/footer>/gi, '')
      .replace(/<header[^>]*>[\s\S]*?<\/header>/gi, '')
      .replace(/<!--[\s\S]*?-->/g, '')
      .replace(/\s+/g, ' ')
      // Reduce to 15k chars instead of 120k (8x reduction = ~8x cost reduction)
      .substring(0, 15000)

    // Shorter, more focused prompt
    const prompt = `Extrais les données de cette annonce immobilière LONG TERME à Berlin:

REJETER si: pas Berlin, marketplace étudiant, blog, liste, court terme.

URL: ${url}

Réponds en JSON:
{
  "title": string,
  "price": number,
  "surface": number|null,
  "rooms": number|null,
  "type": "studio"|"apartment"|"WG"|"house",
  "location": string,
  "district": string|null,
  "address": string|null,
  "description": string,  // IMPORTANT: Réécris et formate la description avec structure claire
  "furnished": true|false|null,
  "availableFrom": "YYYY-MM-DD"|null,
  "features": string[],
  "images": string[],
  "lat": number|null,
  "lng": number|null,
  "isValidListing": true
}

RÈGLES POUR LA DESCRIPTION:
1. Réécris la description en français ou allemand selon le contexte, de manière claire et structurée
2. Format avec sections claires:
   - Commence par les infos essentielles (disponibilité, meublé, étage, etc.)
   - Puis description du logement
   - Puis équipements et caractéristiques
   - Puis localisation et environnement
3. Utilise des sauts de ligne (\\n) pour séparer les paragraphes
4. Utilise des puces (- ) pour les listes d'équipements/caractéristiques
5. Structure recommandée:
   === DISPONIBILITÉ ET LOCALISATION ===
   - Disponible à partir de: [date]
   - Localisation: [quartier/rue]
   - Situation: [description rapide du quartier]

   === LE LOGEMENT ===
   [Description détaillée du logement, taille, agencement, style]

   === ÉQUIPEMENTS ET CARACTÉRISTIQUES ===
   - [Liste des équipements avec puces]
   - [Caractéristiques importantes]

   === ENVIRONNEMENT ===
   [Description du quartier, transports, commerces, etc.]

6. NE PERDS AUCUNE INFORMATION: inclut tous les détails importants de l'original
7. Nettoie: supprime les répétitions, le marketing excessif, les URLs
8. Garde un ton professionnel et informatif
9. Si certaines infos manquent (disponibilité, localisation), ne les invente pas, omet la section
`

    const response = await openai.chat.completions.create({
      model: 'gpt-4.1-nano',
      messages: [
        { 
          role: 'system', 
          content: 'Tu es un expert en extraction et reformatage d\'annonces immobilières. Extrait les données en JSON. Réécris la description avec une structure claire et professionnelle, sans perdre d\'informations. Réponds {"isValidListing": false} si pas Berlin/long terme.' 
        },
        { role: 'user', content: prompt + '\n\nHTML:\n' + cleanedHtml }
      ],
      temperature: 0.1,
      response_format: { type: 'json_object' }
    })

    const content = response.choices[0].message.content
    const extractedData = JSON.parse(content)

    if (extractedData && extractedData.isValidListing === false) {
      return { isValidListing: false }
    }

    console.log(`   ✅ OpenAI extraction successful`)

    return {
      title: extractedData.title || null,
      price: extractedData.price ? parseInt(extractedData.price) : null,
      surface: extractedData.surface ? parseFloat(extractedData.surface) : null,
      rooms: extractedData.rooms ? parseFloat(extractedData.rooms) : null,
      type: extractedData.type || null,
      location: extractedData.location || extractedData.district || null,
      district: extractedData.district || extractedData.location || null,
      address: extractedData.address || null,
      description: extractedData.description || null,
      furnished: typeof extractedData.furnished === 'boolean' ? extractedData.furnished : null,
      availableFrom: extractedData.availableFrom || null,
      features: Array.isArray(extractedData.features) ? extractedData.features : [],
      pictures: Array.isArray(extractedData.images) ? extractedData.images : [],
      lat: extractedData.lat ? parseFloat(extractedData.lat) : null,
      lng: extractedData.lng ? parseFloat(extractedData.lng) : null,
      isValidListing: true
    }
  } catch (error) {
    console.error(`   ⚠️ OpenAI extraction error: ${error.message}`)
    return null
  }
}

