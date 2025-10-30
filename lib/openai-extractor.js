/**
 * OpenAI HTML Extractor
 * Extracts structured listing data from raw HTML using OpenAI
 */

import OpenAI from 'openai'

// Initialize OpenAI only if API key is present to avoid errors
// Re-initialize on each call to ensure env vars are loaded
function getOpenAIClient() {
  if (process.env.OPENAI_API_KEY) {
    return new OpenAI({
      apiKey: process.env.OPENAI_API_KEY
    })
  }
  return null
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
    // Clean HTML - keep only text content and essential structure
    // Remove scripts, styles, and excessive whitespace
    const cleanedHtml = html
      .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
      .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
      .replace(/<noscript[^>]*>[\s\S]*?<\/noscript>/gi, '')
      .replace(/\s+/g, ' ')
      .substring(0, 150000) // Limit to 150k chars (OpenAI context limit consideration)

    const prompt = `Tu es un expert en extraction de données d'annonces immobilières à Berlin, Allemagne.

IMPORTANT: Tu dois d'abord VÉRIFIER si cette page contient une VRAIE annonce de location immobilière. Si ce n'est PAS une annonce de location (ex: blog, page de recherche, site de réservation court terme, job, etc.), réponds avec {"isValidListing": false}.

Analyse le HTML suivant et détermine si c'est une vraie annonce de location immobilière à Berlin.

URL: ${url}

Si c'est une VRAIE annonce de location, extrais les informations suivantes et réponds UNIQUEMENT en JSON valide strict:
{
  "title": "Titre complet et descriptif de l'annonce",
  "price": nombre en euros sans le symbole € (ex: 1200, pas "1200€"),
  "surface": nombre en m² sans unité (ex: 50, pas "50m²"),
  "rooms": nombre de chambres/pièces (ex: 2 ou 2.5),
  "type": "studio" OU "apartment" OU "WG" OU "house" (détecte le type),
  "location": "Berlin, quartier" (toujours inclure Berlin),
  "district": "Nom du quartier/arrondissement à Berlin",
  "address": "Adresse complète avec rue et numéro si disponible",
  "description": "Description COMPLÈTE et DÉTAILLÉE de l'annonce (tous les détails, équipements, environnement, etc.)",
  "furnished": true OU false (détecte si "möbliert", "furnished", "meublé", "fully furnished", "unmöbliert", "unfurnished"),
  "availableFrom": "Date de disponibilité au format YYYY-MM-DD ou null",
  "features": ["liste complète", "de tous les équipements", "caractéristiques mentionnés"],
  "images": ["url complète de l'image", "url complète de l'image 2"],
  "lat": latitude en nombre décimal (ex: 52.5200) - REQUIS si adresse trouvée,
  "lng": longitude en nombre décimal (ex: 13.4050) - REQUIS si adresse trouvée
}

Règles STRICTES:
1. VALIDATION: Si ce n'est PAS une vraie annonce de location immobilière, réponds {"isValidListing": false}
2. Prix: UNIQUEMENT un nombre (ex: 1200), null si pas trouvé
3. Surface: UNIQUEMENT un nombre (ex: 50), null si pas trouvé
4. Rooms: UNIQUEMENT un nombre (ex: 2), null si pas trouvé
5. Type: UNIQUEMENT "studio", "apartment", "WG", ou "house" (choisis le plus approprié)
6. Location: FORMAT PROPRE - "Berlin, [Quartier]" (ex: "Berlin, Mitte" ou "Berlin, Friedrichshain") - PAS de texte de pub ou marketing dans location
7. District: SEULEMENT le nom du quartier (ex: "Mitte", "Friedrichshain", "Charlottenburg") - PAS de texte supplémentaire
8. Title: Titre PROPRE de l'annonce, PAS de texte publicitaire (ex: "Appartement 2 pièces Mitte" pas "URBANELITE.COM // Keine Kaution!")
9. Description: EXTRACTION COMPLÈTE - tous les paragraphes, détails, équipements mentionnés (extrait TOUT le texte descriptif visible)
10. Furnished: true si "möbliert"/"furnished"/"meublé"/"fully furnished"/"ausgestattet" trouvé, false si "unmöbliert"/"unfurnished", sinon null
11. Features: liste COMPLÈTE de tous les équipements/features mentionnés (balcon, jardin, parking, ascenseur, etc.)
12. Images: extrais TOUTES les URLs d'images de l'annonce (pas les logos)

IMPORTANT:
- Si le HTML ne contient pas certaines informations, utilise null pour ces champs
- Ne devine JAMAIS de valeurs - utilise null plutôt que des valeurs inventées
- La description doit être la plus complète possible (extrait TOUT le texte descriptif)
- Pour furnished, cherche les mots: "möbliert", "furnished", "meublé", "fully furnished", "ausgestattet", "unmöbliert", "unfurnished"
- COORDONNÉES GPS: Si une adresse complète est trouvée (rue + numéro), utilise une géocodage approximatif basé sur l'adresse:
  * Pour les adresses avec numéro de rue, estime les coordonnées en fonction de la rue et du quartier
  * Exemple: "Friedrich-Karl-Straße 22, Tempelhof" → lat: 52.4562, lng: 13.3799
  * Exemple: "Unter den Linden 1, Mitte" → lat: 52.5170, lng: 13.3889
  * Exemple: "Kurfürstendamm 1, Charlottenburg" → lat: 52.5044, lng: 13.3300
  * Si seulement le quartier est disponible, utilise les coordonnées du centre du quartier
  * Si aucune adresse précise, utilise le centre de Berlin (52.5200, 13.4050)

Réponds UNIQUEMENT avec le JSON valide, sans texte avant ou après, sans commentaires.`

    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini', // Use cheaper model for cost efficiency
      messages: [
        {
          role: 'system',
          content: 'Tu es un expert en extraction de données structurées depuis du HTML. Tu réponds UNIQUEMENT en JSON valide.'
        },
        {
          role: 'user',
          content: prompt + '\n\nHTML:\n' + cleanedHtml.substring(0, 120000) // Keep under token limits
        }
      ],
      temperature: 0.1, // Low temperature for consistent extraction
      response_format: { type: 'json_object' }
    })

    const content = response.choices[0].message.content
    const extractedData = JSON.parse(content)

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
      furnished: extractedData.furnished || false,
      availableFrom: extractedData.availableFrom || null,
      features: Array.isArray(extractedData.features) ? extractedData.features : [],
      pictures: Array.isArray(extractedData.images) ? extractedData.images : [],
      lat: extractedData.lat ? parseFloat(extractedData.lat) : null,
      lng: extractedData.lng ? parseFloat(extractedData.lng) : null
    }

  } catch (error) {
    console.error(`   ⚠️ OpenAI extraction error: ${error.message}`)
    return null
  }
}

