'use client'

import { useState } from 'react'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import { Search, MapPin, Euro, Home, Filter, Loader2 } from 'lucide-react'

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
  size: number
  images: string[]
  url: string
  source: string
  features: string[]
}

export default function SearchPage() {
  const [searchCriteria, setSearchCriteria] = useState({
    city: 'Berlin',
    minPrice: '',
    maxPrice: '',
    minRooms: '',
    maxRooms: '',
    minSize: '',
    maxSize: ''
  })

  const [listings, setListings] = useState<Listing[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSearch = async () => {
    setLoading(true)
    setError('')

    try {
      const params = new URLSearchParams()
      Object.entries(searchCriteria).forEach(([key, value]) => {
        if (value) params.set(key, value)
      })

      const response = await fetch(`/api/search?${params.toString()}`)
      const data = await response.json()

      if (data.success) {
        setListings(data.data.listings)
      } else {
        setError(data.message || 'Erreur lors de la recherche')
      }
    } catch (err) {
      setError('Erreur de connexion')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-cream">
      <Header />
      
      <main className="container-custom section-padding">
        {/* Search Form */}
        <div className="bg-white rounded-2xl shadow-lg p-8 mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-6 flex items-center">
            <Search className="w-8 h-8 text-mineral mr-3" />
            Recherche d'appartements
          </h1>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <MapPin className="w-4 h-4 inline mr-1" />
                Ville
              </label>
              <input
                type="text"
                value={searchCriteria.city}
                onChange={(e) => setSearchCriteria({...searchCriteria, city: e.target.value})}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-mineral focus:border-transparent"
                placeholder="Berlin"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Euro className="w-4 h-4 inline mr-1" />
                Prix min (€)
              </label>
              <input
                type="number"
                value={searchCriteria.minPrice}
                onChange={(e) => setSearchCriteria({...searchCriteria, minPrice: e.target.value})}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-mineral focus:border-transparent"
                placeholder="500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Euro className="w-4 h-4 inline mr-1" />
                Prix max (€)
              </label>
              <input
                type="number"
                value={searchCriteria.maxPrice}
                onChange={(e) => setSearchCriteria({...searchCriteria, maxPrice: e.target.value})}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-mineral focus:border-transparent"
                placeholder="1500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Home className="w-4 h-4 inline mr-1" />
                Pièces
              </label>
              <input
                type="number"
                value={searchCriteria.minRooms}
                onChange={(e) => setSearchCriteria({...searchCriteria, minRooms: e.target.value})}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-mineral focus:border-transparent"
                placeholder="2"
              />
            </div>
          </div>

          <button
            onClick={handleSearch}
            disabled={loading}
            className="btn-primary flex items-center space-x-2"
          >
            {loading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <Search className="w-5 h-5" />
            )}
            <span>{loading ? 'Recherche...' : 'Rechercher'}</span>
          </button>
        </div>

        {/* Results */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <p className="text-red-600">{error}</p>
          </div>
        )}

        {listings.length > 0 && (
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              {listings.length} annonces trouvées
            </h2>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {listings.map((listing) => (
            <div key={listing.id} className="card hover:shadow-xl transition-all duration-300">
              {/* Image placeholder */}
              <div className="h-48 bg-gray-200 rounded-lg mb-4 flex items-center justify-center">
                <Home className="w-12 h-12 text-gray-400" />
              </div>

              {/* Content */}
              <div className="space-y-3">
                <div className="flex justify-between items-start">
                  <h3 className="text-lg font-semibold text-gray-900 line-clamp-2">
                    {listing.title}
                  </h3>
                  <span className="text-2xl font-bold text-mineral">
                    {listing.price}€
                  </span>
                </div>

                <div className="flex items-center text-gray-600">
                  <MapPin className="w-4 h-4 mr-1" />
                  <span className="text-sm">{listing.location}</span>
                </div>

                <div className="flex items-center space-x-4 text-sm text-gray-600">
                  <div className="flex items-center">
                    <Home className="w-4 h-4 mr-1" />
                    <span>{listing.rooms} Zimmer</span>
                  </div>
                  <div className="flex items-center">
                    <span>{listing.size} m²</span>
                  </div>
                </div>

                <p className="text-gray-600 text-sm line-clamp-2">
                  {listing.description}
                </p>

                {listing.features.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {listing.features.slice(0, 3).map((feature, index) => (
                      <span
                        key={index}
                        className="px-2 py-1 bg-mint/10 text-mint text-xs rounded-full"
                      >
                        {feature}
                      </span>
                    ))}
                  </div>
                )}

                <div className="flex justify-between items-center pt-3 border-t border-gray-100">
                  <span className="text-xs text-gray-500">
                    Source: {listing.source}
                  </span>
                  <a
                    href={listing.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-mineral hover:text-dark-blue text-sm font-medium"
                  >
                    Voir l'annonce →
                  </a>
                </div>
              </div>
            </div>
          ))}
        </div>

        {listings.length === 0 && !loading && (
          <div className="text-center py-12">
            <Search className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-600 mb-2">
              Aucune annonce trouvée
            </h3>
            <p className="text-gray-500">
              Essayez de modifier vos critères de recherche
            </p>
          </div>
        )}
      </main>

      <Footer />
    </div>
  )
}
