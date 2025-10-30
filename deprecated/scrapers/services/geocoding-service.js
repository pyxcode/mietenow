/**
 * Service de géocodage pour convertir les adresses en coordonnées
 */

export class GeocodingService {
  constructor() {
    this.cache = new Map()
    this.rateLimitDelay = 50 // Délai entre les requêtes (ms)
    
    // Base de données des quartiers de Berlin avec leurs centres
    this.berlinDistricts = {
      'mitte': { lat: 52.5208, lng: 13.4095, name: 'Mitte' },
      'prenzlauer berg': { lat: 52.5398, lng: 13.4256, name: 'Prenzlauer Berg' },
      'kreuzberg': { lat: 52.4861, lng: 13.3860, name: 'Kreuzberg' },
      'friedrichshain': { lat: 52.5122, lng: 13.4503, name: 'Friedrichshain' },
      'neukölln': { lat: 52.4460, lng: 13.4618, name: 'Neukölln' },
      'charlottenburg': { lat: 52.5050, lng: 13.3045, name: 'Charlottenburg' },
      'schöneberg': { lat: 52.4889, lng: 13.3569, name: 'Schöneberg' },
      'tempelhof': { lat: 52.4700, lng: 13.4044, name: 'Tempelhof' },
      'steglitz': { lat: 52.4569, lng: 13.3322, name: 'Steglitz' },
      'zehlendorf': { lat: 52.4333, lng: 13.2500, name: 'Zehlendorf' },
      'spandau': { lat: 52.5369, lng: 13.2006, name: 'Spandau' },
      'reinickendorf': { lat: 52.5667, lng: 13.3333, name: 'Reinickendorf' },
      'pankow': { lat: 52.5667, lng: 13.4000, name: 'Pankow' },
      'weissensee': { lat: 52.5500, lng: 13.4667, name: 'Weißensee' },
      'hohenschönhausen': { lat: 52.5500, lng: 13.5000, name: 'Hohenschönhausen' },
      'lichtenberg': { lat: 52.5167, lng: 13.5167, name: 'Lichtenberg' },
      'treptow': { lat: 52.4833, lng: 13.4500, name: 'Treptow' },
      'köpenick': { lat: 52.4500, lng: 13.5833, name: 'Köpenick' },
      'moabit': { lat: 52.5250, lng: 13.3417, name: 'Moabit' },
      'wedding': { lat: 52.5500, lng: 13.3667, name: 'Wedding' },
      'gesundbrunnen': { lat: 52.5500, lng: 13.3833, name: 'Gesundbrunnen' },
      'tiergarten': { lat: 52.5167, lng: 13.3667, name: 'Tiergarten' },
      'hansaviertel': { lat: 52.5167, lng: 13.3500, name: 'Hansaviertel' },
      'altglienicke': { lat: 52.4167, lng: 13.5500, name: 'Altglienicke' },
      'adlershof': { lat: 52.4333, lng: 13.5500, name: 'Adlershof' },
      'britz': { lat: 52.4500, lng: 13.4333, name: 'Britz' },
      'buckow': { lat: 52.4333, lng: 13.4167, name: 'Buckow' },
      'gropiusstadt': { lat: 52.4167, lng: 13.4667, name: 'Gropiusstadt' },
      'rudow': { lat: 52.4000, lng: 13.4833, name: 'Rudow' },
      'marienfelde': { lat: 52.4000, lng: 13.3667, name: 'Marienfelde' },
      'lankwitz': { lat: 52.4333, lng: 13.3500, name: 'Lankwitz' },
      'lichtenrade': { lat: 52.4000, lng: 13.4000, name: 'Lichtenrade' },
      'dahlem': { lat: 52.4500, lng: 13.2833, name: 'Dahlem' },
      'nikolassee': { lat: 52.4167, lng: 13.2000, name: 'Nikolassee' },
      'wannsee': { lat: 52.4167, lng: 13.1833, name: 'Wannsee' },
      'grunewald': { lat: 52.4833, lng: 13.2667, name: 'Grunewald' },
      'westend': { lat: 52.5167, lng: 13.2833, name: 'Westend' },
      'charlottenburg-nord': { lat: 52.5333, lng: 13.3000, name: 'Charlottenburg-Nord' },
      'halensee': { lat: 52.5000, lng: 13.3000, name: 'Halensee' },
      'schmargendorf': { lat: 52.4667, lng: 13.3167, name: 'Schmargendorf' },
      'wilmersdorf': { lat: 52.4833, lng: 13.3167, name: 'Wilmersdorf' },
      'grunewald': { lat: 52.4833, lng: 13.2667, name: 'Grunewald' },
      'friedenau': { lat: 52.4667, lng: 13.3333, name: 'Friedenau' },
      'schöneberg': { lat: 52.4889, lng: 13.3569, name: 'Schöneberg' },
      'tempelhof-schöneberg': { lat: 52.4700, lng: 13.4044, name: 'Tempelhof-Schöneberg' },
      'mariendorf': { lat: 52.4333, lng: 13.3833, name: 'Mariendorf' },
      'marienfelde': { lat: 52.4000, lng: 13.3667, name: 'Marienfelde' },
      'lankwitz': { lat: 52.4333, lng: 13.3500, name: 'Lankwitz' },
      'lichtenrade': { lat: 52.4000, lng: 13.4000, name: 'Lichtenrade' },
      'dahlem': { lat: 52.4500, lng: 13.2833, name: 'Dahlem' },
      'nikolassee': { lat: 52.4167, lng: 13.2000, name: 'Nikolassee' },
      'wannsee': { lat: 52.4167, lng: 13.1833, name: 'Wannsee' },
      'grunewald': { lat: 52.4833, lng: 13.2667, name: 'Grunewald' },
      'westend': { lat: 52.5167, lng: 13.2833, name: 'Westend' },
      'charlottenburg-nord': { lat: 52.5333, lng: 13.3000, name: 'Charlottenburg-Nord' },
      'halensee': { lat: 52.5000, lng: 13.3000, name: 'Halensee' },
      'schmargendorf': { lat: 52.4667, lng: 13.3167, name: 'Schmargendorf' },
      'wilmersdorf': { lat: 52.4833, lng: 13.3167, name: 'Wilmersdorf' },
      'grunewald': { lat: 52.4833, lng: 13.2667, name: 'Grunewald' },
      'friedenau': { lat: 52.4667, lng: 13.3333, name: 'Friedenau' }
    }
  }

  /**
   * Convertit une adresse en coordonnées géographiques
   * @param {string} address - L'adresse à géocoder
   * @returns {Promise<{lat: number, lng: number, formatted_address: string} | null>}
   */
  async geocodeAddress(address) {
    if (!address || address === 'N/A' || address === 'Berlin') {
      // Retourner le centre de Berlin par défaut
      return {
        lat: 52.5208,
        lng: 13.4095,
        formatted_address: 'Berlin, Germany'
      }
    }

    // Vérifier le cache
    const cacheKey = address.toLowerCase().trim()
    if (this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey)
    }

    try {
      // 1. D'abord essayer de trouver le quartier dans notre base de données
      const districtMatch = this.findDistrictInAddress(address)
      if (districtMatch) {
        const result = {
          lat: districtMatch.lat,
          lng: districtMatch.lng,
          formatted_address: `${districtMatch.name}, Berlin, Germany`
        }
        this.cache.set(cacheKey, result)
        return result
      }

      // 2. Essayer l'API de géocodage rapide (Photon)
      const photonResult = await this.tryPhotonGeocoding(address)
      if (photonResult) {
        this.cache.set(cacheKey, photonResult)
        return photonResult
      }

      // 3. Fallback vers Nominatim si nécessaire
      const nominatimResult = await this.tryNominatimGeocoding(address)
      if (nominatimResult) {
        this.cache.set(cacheKey, nominatimResult)
        return nominatimResult
      }
      
      // 4. Si tout échoue, retourner le centre de Berlin
      const fallback = {
        lat: 52.5208,
        lng: 13.4095,
        formatted_address: 'Berlin, Germany'
      }
      this.cache.set(cacheKey, fallback)
      return fallback
      
    } catch (error) {
      console.warn(`Geocoding failed for "${address}":`, error.message)
      
      // En cas d'erreur, retourner le centre de Berlin
      const fallback = {
        lat: 52.5208,
        lng: 13.4095,
        formatted_address: 'Berlin, Germany'
      }
      this.cache.set(cacheKey, fallback)
      return fallback
    }
  }

  /**
   * Trouve un quartier dans l'adresse
   * @param {string} address - L'adresse à analyser
   * @returns {Object|null} - Les coordonnées du quartier ou null
   */
  findDistrictInAddress(address) {
    const lowerAddress = address.toLowerCase()
    
    // Chercher les quartiers dans l'adresse
    for (const [key, district] of Object.entries(this.berlinDistricts)) {
      if (lowerAddress.includes(key)) {
        return district
      }
    }
    
    return null
  }

  /**
   * Essaie le géocodage avec l'API Photon (plus rapide)
   * @param {string} address - L'adresse à géocoder
   * @returns {Promise<Object|null>} - Les coordonnées ou null
   */
  async tryPhotonGeocoding(address) {
    try {
      const encodedAddress = encodeURIComponent(`${address}, Berlin, Germany`)
      const url = `https://photon.komoot.io/api?q=${encodedAddress}&limit=1&lang=de`
      
      const response = await fetch(url, {
        headers: {
          'User-Agent': 'MieteNow/1.0 (https://mietenow.com)'
        }
      })
      
      if (!response.ok) return null
      
      const data = await response.json()
      
      if (data && data.features && data.features.length > 0) {
        const feature = data.features[0]
        const [lng, lat] = feature.geometry.coordinates
        
        return {
          lat: lat,
          lng: lng,
          formatted_address: feature.properties.name || address
        }
      }
      
      return null
    } catch (error) {
      console.warn('Photon geocoding failed:', error.message)
      return null
    }
  }

  /**
   * Essaie le géocodage avec l'API Nominatim (fallback)
   * @param {string} address - L'adresse à géocoder
   * @returns {Promise<Object|null>} - Les coordonnées ou null
   */
  async tryNominatimGeocoding(address) {
    try {
      const encodedAddress = encodeURIComponent(`${address}, Berlin, Germany`)
      const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodedAddress}&limit=1&countrycodes=de`
      
      // Attendre pour respecter le rate limiting
      await new Promise(resolve => setTimeout(resolve, this.rateLimitDelay))
      
      const response = await fetch(url, {
        headers: {
          'User-Agent': 'MieteNow/1.0 (https://mietenow.com)'
        }
      })
      
      if (!response.ok) return null
      
      const data = await response.json()
      
      if (data && data.length > 0) {
        return {
          lat: parseFloat(data[0].lat),
          lng: parseFloat(data[0].lon),
          formatted_address: data[0].display_name
        }
      }
      
      return null
    } catch (error) {
      console.warn('Nominatim geocoding failed:', error.message)
      return null
    }
  }

  /**
   * Géocode plusieurs adresses en parallèle (avec rate limiting)
   * @param {string[]} addresses - Les adresses à géocoder
   * @returns {Promise<Array<{lat: number, lng: number, formatted_address: string}>>}
   */
  async geocodeAddresses(addresses) {
    const results = []
    
    for (const address of addresses) {
      const result = await this.geocodeAddress(address)
      results.push(result)
    }
    
    return results
  }

  /**
   * Nettoie et normalise une adresse
   * @param {string} address - L'adresse à nettoyer
   * @returns {string} - L'adresse nettoyée
   */
  cleanAddress(address) {
    if (!address || address === 'N/A') {
      return 'Berlin, Germany'
    }
    
    // Nettoyer l'adresse
    let cleaned = address.trim()
    
    // Supprimer les caractères HTML
    cleaned = cleaned.replace(/&nbsp;/g, ' ')
    cleaned = cleaned.replace(/&amp;/g, '&')
    
    // Supprimer les informations supplémentaires dans les titres
    if (cleaned.includes(' - ')) {
      const parts = cleaned.split(' - ')
      // Prendre la partie qui contient probablement l'adresse
      for (const part of parts) {
        if (part.includes('Berlin') || part.includes('Straße') || part.includes('Platz')) {
          cleaned = part.trim()
          break
        }
      }
    }
    
    // S'assurer que Berlin est mentionné
    if (!cleaned.includes('Berlin') && !cleaned.includes('Germany')) {
      cleaned = `${cleaned}, Berlin, Germany`
    }
    
    return cleaned
  }

  /**
   * Extrait l'adresse d'un titre d'annonce
   * @param {string} title - Le titre de l'annonce
   * @returns {string} - L'adresse extraite
   */
  extractAddressFromTitle(title) {
    if (!title) return 'Berlin, Germany'
    
    // Nettoyer le titre
    let cleanTitle = title.replace(/&nbsp;/g, ' ').replace(/&amp;/g, '&')
    
    // Patterns pour extraire l'adresse du titre
    const patterns = [
      // "Titre - Quartier, Berlin - Prix"
      /^[^-]+-\s*([^,]+),\s*Berlin[^-]*-\s*[^-]+$/,
      // "Titre - Adresse, Quartier - Prix"
      /^[^-]+-\s*([^,]+(?:Straße|Platz|Allee|Weg|Gasse|Ufer)[^,]*),\s*([^-]+)/,
      // "Titre - Quartier - Prix"
      /^[^-]+-\s*([^,]+),\s*Berlin/,
      // "Titre - Quartier, Berlin"
      /^[^-]+-\s*([^,]+),\s*Berlin/,
      // "Quartier, Berlin" (début du titre)
      /^([^,]+),\s*Berlin/,
      // "Adresse, Quartier" (début du titre)
      /^([^,]+(?:Straße|Platz|Allee|Weg|Gasse|Ufer)[^,]*),\s*([^,]+)/
    ]
    
    for (const pattern of patterns) {
      const match = cleanTitle.match(pattern)
      if (match) {
        let address = match[1] ? match[1].trim() : 'Berlin'
        
        // Si on a un deuxième groupe (quartier), l'utiliser
        if (match[2]) {
          const district = match[2].trim()
          address = `${address}, ${district}`
        }
        
        return `${address}, Berlin, Germany`
      }
    }
    
    // Essayer de trouver un quartier dans le titre
    const districtMatch = this.findDistrictInAddress(cleanTitle)
    if (districtMatch) {
      return `${districtMatch.name}, Berlin, Germany`
    }
    
    return 'Berlin, Germany'
  }
}
