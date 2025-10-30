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
    const cleanedHtml = html
      .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
      .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
      .replace(/<noscript[^>]*>[\s\S]*?<\/noscript>/gi, '')
      .replace(/\s+/g, ' ')
      .substring(0, 80000)

    const prompt = `Tu es un expert en détection de pages de recherche/liste d'annonces immobilières LONG TERME à Berlin, Allemagne.

URL: ${url}

Analyse cette page HTML et détermine si c'est une VRAIE PAGE DE LISTE/RECHERCHE d'annonces de location LONG TERME à Berlin.

CRITÈRES POUR VALIDER:
✅ OUI si la page contient:
- Une liste de plusieurs annonces immobilières (locations long terme à Berlin)
- Des liens vers des annonces individuelles
- Des prix, surfaces, localisations visibles
- Mots-clés: "Mietwohnungen", "Wohnung mieten", "rental", "Berlin", etc.

❌ NON si la page contient:
- Pas d'annonces immobilières visibles
- Seulement du contenu marketing/blog
- Annonces pour d'autres villes (pas Berlin)
- Marketplace étudiant ou colocation (student.com, uniplaces, etc.)
- Page d'accueil générique sans liste d'annonces

Réponds UNIQUEMENT en JSON:
{
  "isValidPage": true|false,
  "reason": "Explication courte de la décision",
  "listingCount": nombre d'annonces détectées (0 si pas valide)
}`

    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: 'Tu analyses des pages web et réponds UNIQUEMENT en JSON valide.' },
        { role: 'user', content: prompt + '\n\nHTML:\n' + cleanedHtml.substring(0, 60000) }
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
    const cleanedHtml = html
      .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
      .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
      .replace(/<noscript[^>]*>[\s\S]*?<\/noscript>/gi, '')
      .replace(/\s+/g, ' ')
      .substring(0, 150000)

    const prompt = `Tu es un expert en extraction d'annonces IMMOBILIÈRES LONG TERME à Berlin, Allemagne.

VALIDATION AVANT TOUTE CHOSE:
- Si la page n'est PAS une vraie annonce de location LONG TERME à Berlin (Allemagne), réponds STRICTEMENT {"isValidListing": false}.
- REJETER si la page appartient à un marketplace étudiant (student.com, uniplaces.com, spotahome.com, erasmusu.com) ou à une ville autre que Berlin (ex: Barcelone, Madrid, etc.).
- REJETER blogs, pages liste/sommaires, agences marketing, co-living promotionnels, réservations court terme (< 3 mois).

URL: ${url}

Si et seulement si c'est une VRAIE annonce de location à Berlin, réponds UNIQUEMENT en JSON valide strict avec:
{
  "title": string,
  "price": number,          // en euros (ex: 1200)
  "surface": number|null,   // en m²
  "rooms": number|null,
  "type": "studio"|"apartment"|"WG"|"house",
  "location": string,       // "Berlin, quartier"
  "district": string|null,
  "address": string|null,
  "description": string,    // DESCRIPTION CLAIRE ET LISIBLE (voir règles de formatage)
  "furnished": true|false|null,
  "availableFrom": "YYYY-MM-DD"|null,
  "features": string[],
  "images": string[],
  "lat": number|null,
  "lng": number|null,
  "isValidListing": true
}

RÈGLES DE FORMATAGE DE description:
- Nettoie le HTML: pas de balises, pas de spam, pas d'URL promotionnelles.
- Ajoute des retours à la ligne pour chaque paragraphe.
- Mets en évidence les infos clés en tête (ex: Disponibilité, Meublé, Étage, Balcon, Chauffage) sous forme de puces:
  - Disponibilité: ...
  - Meublé: ...
  - Étage: ...
- Conserve le texte informatif utile, supprime branding répété (ex: URBANELITE.COM) et discours marketing.
- Aucune mise en forme HTML; simple texte avec '\n' pour les retours à la ligne.

RÈGLES STRICTES:
1) Si ce n'est PAS Berlin (Allemagne) ou c'est un site étudiant/colocation marketplace listé plus haut -> {"isValidListing": false}
2) Pas d'invention: si une info manque -> null
3) images: uniquement des URLs d'images de l'annonce
`

    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: 'Tu extrais des données structurées et réponds UNIQUEMENT en JSON valide.' },
        { role: 'user', content: prompt + '\n\nHTML:\n' + cleanedHtml.substring(0, 120000) }
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

