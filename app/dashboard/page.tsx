'use client'

export const dynamic = 'force-dynamic'

import { useState, useEffect } from 'react'
import { Search, Filter, MapPin, Euro, Home, Bed, Square, Calendar, ExternalLink } from 'lucide-react'

interface Listing {
  id: string
  title: string
  description: string
  price: number
  currency: string
  location: string
  city: string
  district?: string
  rooms: number
  bedrooms: number
  size: number
  propertyType: string
  furnishing: string
  images: string[]
  url: string
  source: string
  publishedAt: string
  features: string[]
}

export default function DashboardPage() {
  const [listings, setListings] = useState<Listing[]>([])
  const [loading, setLoading] = useState(true)
  const [filters, setFilters] = useState({
    minPrice: '',
    maxPrice: '',
    minRooms: '',
    maxRooms: '',
    minBedrooms: '',
    maxBedrooms: '',
    minSize: '',
    maxSize: '',
    propertyType: '',
    furnishing: '',
    city: 'Berlin'
  })
  const [showFilters, setShowFilters] = useState(false)

  useEffect(() => {
    fetchListings()
  }, [])

  const fetchListings = async () => {
    try {
      const params = new URLSearchParams()
      Object.entries(filters).forEach(([key, value]) => {
        if (value) params.set(key, value)
      })

      const response = await fetch(`/api/listings?${params.toString()}`)
      const data = await response.json()

      if (data.success) {
        setListings(data.listings)
      }
    } catch (error) {
      console.error('Error fetching listings:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleFilterChange = (field: string, value: string) => {
    setFilters(prev => ({ ...prev, [field]: value }))
  }

  const applyFilters = () => {
    setLoading(true)
    fetchListings()
    setShowFilters(false)
  }

  const clearFilters = () => {
    setFilters({
      minPrice: '',
      maxPrice: '',
      minRooms: '',
      maxRooms: '',
      minBedrooms: '',
      maxBedrooms: '',
      minSize: '',
      maxSize: '',
      propertyType: '',
      furnishing: '',
      city: 'Berlin'
    })
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    })
  }

  const getPropertyTypeLabel = (type: string) => {
    const types: { [key: string]: string } = {
      'apartment': 'Appartement',
      'house': 'Maison',
      'room': 'Chambre',
      'studio': 'Studio',
      'loft': 'Loft'
    }
    return types[type] || type
  }

  const getFurnishingLabel = (furnishing: string) => {
    const furnishingTypes: { [key: string]: string } = {
      'furnished': 'Meublé',
      'unfurnished': 'Non meublé',
      'partially_furnished': 'Partiellement meublé'
    }
    return furnishingTypes[furnishing] || furnishing
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="container-custom py-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Mes annonces</h1>
              <p className="text-gray-600 mt-1">
                {listings.length} annonces trouvées
              </p>
            </div>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="btn-outline flex items-center space-x-2"
            >
              <Filter className="w-4 h-4" />
              <span>Filtres</span>
            </button>
          </div>
        </div>
      </div>

      <div className="container-custom py-8">
        <div className="flex gap-8">
          {/* Filters Sidebar */}
          {showFilters && (
            <div className="w-80 bg-white rounded-lg shadow-sm p-6 h-fit">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Filtres</h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Ville
                  </label>
                  <select
                    value={filters.city}
                    onChange={(e) => handleFilterChange('city', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-mineral focus:border-transparent"
                  >
                    <option value="Berlin">Berlin</option>
                    <option value="Munich">Munich</option>
                    <option value="Hamburg">Hamburg</option>
                    <option value="Cologne">Cologne</option>
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Prix min (€)
                    </label>
                    <input
                      type="number"
                      value={filters.minPrice}
                      onChange={(e) => handleFilterChange('minPrice', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-mineral focus:border-transparent"
                      placeholder="500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Prix max (€)
                    </label>
                    <input
                      type="number"
                      value={filters.maxPrice}
                      onChange={(e) => handleFilterChange('maxPrice', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-mineral focus:border-transparent"
                      placeholder="1500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Pièces min
                    </label>
                    <input
                      type="number"
                      value={filters.minRooms}
                      onChange={(e) => handleFilterChange('minRooms', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-mineral focus:border-transparent"
                      placeholder="2"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Chambres min
                    </label>
                    <input
                      type="number"
                      value={filters.minBedrooms}
                      onChange={(e) => handleFilterChange('minBedrooms', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-mineral focus:border-transparent"
                      placeholder="1"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Surface min (m²)
                  </label>
                  <input
                    type="number"
                    value={filters.minSize}
                    onChange={(e) => handleFilterChange('minSize', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-mineral focus:border-transparent"
                    placeholder="50"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Type de logement
                  </label>
                  <select
                    value={filters.propertyType}
                    onChange={(e) => handleFilterChange('propertyType', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-mineral focus:border-transparent"
                  >
                    <option value="">Tous</option>
                    <option value="apartment">Appartement</option>
                    <option value="house">Maison</option>
                    <option value="room">Chambre</option>
                    <option value="studio">Studio</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Équipement
                  </label>
                  <select
                    value={filters.furnishing}
                    onChange={(e) => handleFilterChange('furnishing', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-mineral focus:border-transparent"
                  >
                    <option value="">Tous</option>
                    <option value="furnished">Meublé</option>
                    <option value="unfurnished">Non meublé</option>
                    <option value="partially_furnished">Partiellement meublé</option>
                  </select>
                </div>
              </div>

              <div className="flex space-x-2 mt-6">
                <button
                  onClick={applyFilters}
                  className="flex-1 btn-primary"
                >
                  Appliquer
                </button>
                <button
                  onClick={clearFilters}
                  className="flex-1 btn-outline"
                >
                  Effacer
                </button>
              </div>
            </div>
          )}

          {/* Listings Grid */}
          <div className="flex-1">
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <div className="w-8 h-8 border-2 border-mineral border-t-transparent rounded-full animate-spin" />
              </div>
            ) : listings.length === 0 ? (
              <div className="text-center py-12">
                <Search className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-600 mb-2">
                  Aucune annonce trouvée
                </h3>
                <p className="text-gray-500">
                  Essayez de modifier vos filtres de recherche
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {listings.map((listing) => (
                  <div key={listing.id} className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow">
                    {/* Image placeholder */}
                    <div className="h-48 bg-gray-200 flex items-center justify-center">
                      <Home className="w-12 h-12 text-gray-400" />
                    </div>

                    <div className="p-4">
                      {/* Header */}
                      <div className="flex justify-between items-start mb-3">
                        <h3 className="text-lg font-semibold text-gray-900 line-clamp-2 flex-1">
                          {listing.title}
                        </h3>
                        <span className="text-xl font-bold text-mineral ml-2">
                          {listing.price}€
                        </span>
                      </div>

                      {/* Location */}
                      <div className="flex items-center text-gray-600 mb-3">
                        <MapPin className="w-4 h-4 mr-1" />
                        <span className="text-sm">{listing.location}</span>
                      </div>

                      {/* Details */}
                      <div className="grid grid-cols-2 gap-4 mb-3 text-sm text-gray-600">
                        <div className="flex items-center">
                          <Home className="w-4 h-4 mr-1" />
                          <span>{listing.rooms} pièces</span>
                        </div>
                        <div className="flex items-center">
                          <Bed className="w-4 h-4 mr-1" />
                          <span>{listing.bedrooms} ch.</span>
                        </div>
                        <div className="flex items-center">
                          <Square className="w-4 h-4 mr-1" />
                          <span>{listing.size} m²</span>
                        </div>
                        <div className="flex items-center">
                          <Calendar className="w-4 h-4 mr-1" />
                          <span>{formatDate(listing.publishedAt)}</span>
                        </div>
                      </div>

                      {/* Type and Furnishing */}
                      <div className="flex flex-wrap gap-2 mb-3">
                        <span className="px-2 py-1 bg-mineral/10 text-mineral text-xs rounded-full">
                          {getPropertyTypeLabel(listing.propertyType)}
                        </span>
                        <span className="px-2 py-1 bg-mint/10 text-mint text-xs rounded-full">
                          {getFurnishingLabel(listing.furnishing)}
                        </span>
                      </div>

                      {/* Features */}
                      {listing.features.length > 0 && (
                        <div className="flex flex-wrap gap-1 mb-3">
                          {listing.features.slice(0, 3).map((feature, index) => (
                            <span
                              key={index}
                              className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full"
                            >
                              {feature}
                            </span>
                          ))}
                        </div>
                      )}

                      {/* Footer */}
                      <div className="flex justify-between items-center pt-3 border-t border-gray-100">
                        <span className="text-xs text-gray-500">
                          {listing.source}
                        </span>
                        <a
                          href={listing.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-mineral hover:text-dark-blue text-sm font-medium flex items-center space-x-1"
                        >
                          <span>Voir l'annonce</span>
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
