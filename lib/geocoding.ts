/**
 * Fonction utilitaire pour convertir une adresse en coordonnées GPS
 * Utilise l'API Nominatim d'OpenStreetMap
 */

export interface GeocodingResult {
  lat: number
  lng: number
  display_name: string
  address?: {
    road?: string
    suburb?: string
    city_district?: string
    city?: string
    country?: string
  }
}

export interface GeocodingOptions {
  city?: string
  country?: string
  limit?: number
}

/**
 * Convertit une adresse en coordonnées GPS
 * @param address - L'adresse à convertir
 * @param options - Options de géocodage
 * @returns Promise<GeocodingResult | null>
 */
export async function geocodeAddress(
  address: string, 
  options: GeocodingOptions = {}
): Promise<GeocodingResult | null> {
  try {
    const { city = 'Berlin', country = 'Germany', limit = 1 } = options
    
    // Construire la requête
    const query = `${address}, ${city}, ${country}`
    const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=${limit}&addressdetails=1`
    
    const response = await fetch(url)
    
    if (!response.ok) {
      throw new Error(`Geocoding failed: ${response.status}`)
    }
    
    const data = await response.json()
    
    if (!data || data.length === 0) {
      return null
    }
    
    const result = data[0]
    
    return {
      lat: parseFloat(result.lat),
      lng: parseFloat(result.lon),
      display_name: result.display_name,
      address: result.address
    }
  } catch (error) {
    console.error('Error geocoding address:', error)
    return null
  }
}

/**
 * Convertit plusieurs adresses en coordonnées GPS
 * @param addresses - Les adresses à convertir
 * @param options - Options de géocodage
 * @returns Promise<GeocodingResult[]>
 */
export async function geocodeAddresses(
  addresses: string[], 
  options: GeocodingOptions = {}
): Promise<GeocodingResult[]> {
  const results: GeocodingResult[] = []
  
  for (const address of addresses) {
    const result = await geocodeAddress(address, options)
    if (result) {
      results.push(result)
    }
    
    // Délai pour respecter les limites de l'API Nominatim
    await new Promise(resolve => setTimeout(resolve, 1000))
  }
  
  return results
}

/**
 * Recherche des suggestions d'adresses (pour autocomplétion)
 * @param query - La requête de recherche
 * @param options - Options de géocodage
 * @returns Promise<GeocodingResult[]>
 */
export async function searchAddressSuggestions(
  query: string, 
  options: GeocodingOptions = {}
): Promise<GeocodingResult[]> {
  try {
    const { city = 'Berlin', country = 'Germany', limit = 5 } = options
    
    if (query.length < 3) {
      return []
    }
    
    const searchQuery = `${query}, ${city}, ${country}`
    const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchQuery)}&limit=${limit}&addressdetails=1`
    
    const response = await fetch(url)
    
    if (!response.ok) {
      throw new Error(`Address search failed: ${response.status}`)
    }
    
    const data = await response.json()
    
    return data.map((item: any) => ({
      lat: parseFloat(item.lat),
      lng: parseFloat(item.lon),
      display_name: item.display_name,
      address: item.address
    }))
  } catch (error) {
    console.error('Error searching addresses:', error)
    return []
  }
}

/**
 * Calcule la distance entre deux points GPS (formule de Haversine)
 * @param lat1 - Latitude du premier point
 * @param lng1 - Longitude du premier point
 * @param lat2 - Latitude du deuxième point
 * @param lng2 - Longitude du deuxième point
 * @returns Distance en kilomètres
 */
export function calculateDistance(
  lat1: number, 
  lng1: number, 
  lat2: number, 
  lng2: number
): number {
  const R = 6371 // Rayon de la Terre en km
  const dLat = (lat2 - lat1) * Math.PI / 180
  const dLng = (lng2 - lng1) * Math.PI / 180
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLng/2) * Math.sin(dLng/2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a))
  return R * c
}
