'use client'

import { useState, useEffect } from 'react'
import { ArrowLeft, MapPin, Home, Calendar, ChevronLeft, ChevronRight, Users, Bed, Square, Building, ExternalLink } from 'lucide-react'
import { useLanguage } from '@/contexts/LanguageContext'

interface Listing {
  id: string
  title: string
  description: string
  price: string | number
  address?: string
  size?: number
  rooms: number
  type: string
  images: string[]
  link?: string
  url?: string
  platform?: string
  scrapedAt?: string
  lat: number
  lng: number
  furnished?: boolean
  features?: string[]
}

interface ListingDetailViewProps {
  listing: Listing
  onBack: () => void
}

export default function ListingDetailView({ listing, onBack }: ListingDetailViewProps) {
  const { language } = useLanguage()
  const [currentImageIndex, setCurrentImageIndex] = useState(0)

  // Reset image index when listing changes
  useEffect(() => {
    setCurrentImageIndex(0)
  }, [listing.id])

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffTime = Math.abs(now.getTime() - date.getTime())
    const diffMinutes = Math.floor(diffTime / (1000 * 60))
    const diffHours = Math.floor(diffTime / (1000 * 60 * 60))
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    
    if (diffMinutes < 60) {
      return `${diffMinutes} ${language === 'de' ? 'Min' : 'min'} ago`
    } else if (diffHours < 24) {
      return `${diffHours} ${language === 'de' ? 'Std' : 'h'} ago`
    } else if (diffDays === 1) {
      return language === 'de' ? 'Gestern' : 'Yesterday'
    } else if (diffDays < 7) {
      return `${diffDays} ${language === 'de' ? 'Tage' : 'days'} ago`
    } else if (diffDays < 30) {
      return `${Math.ceil(diffDays / 7)} ${language === 'de' ? 'Wochen' : 'weeks'} ago`
    } else {
      return `${Math.ceil(diffDays / 30)} ${language === 'de' ? 'Monate' : 'months'} ago`
    }
  }

  const handleApply = () => {
    console.log('View Details clicked, listing.link:', listing.link)
    if (listing.link && listing.link !== '#') {
      window.open(listing.link, '_blank')
    } else if (listing.url && listing.url !== '#') {
      window.open(listing.url, '_blank')
    } else {
      alert(language === 'de' ? 'Kein Link verfügbar' : 'No link available')
    }
  }

  const nextImage = () => {
    if (listing.images && listing.images.length > 1) {
      setCurrentImageIndex((prev) => (prev + 1) % listing.images.length)
    }
  }

  const prevImage = () => {
    if (listing.images && listing.images.length > 1) {
      setCurrentImageIndex((prev) => (prev - 1 + listing.images.length) % listing.images.length)
    }
  }


  return (
    <div className="h-full flex flex-col bg-gray-50">
      {/* Header moderne */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="flex items-center justify-between p-4">
          <button
            onClick={onBack}
            className="flex items-center gap-2 text-gray-600 hover:text-mineral transition-colors p-2 -ml-2 rounded-lg hover:bg-gray-100"
          >
            <ArrowLeft className="w-5 h-5" />
            <span className="font-medium">{language === 'de' ? 'Zurück' : 'Back'}</span>
          </button>
          
          <h1 className="text-lg font-bold text-gray-900 truncate px-4 flex-1 text-center">
            {listing.title}
          </h1>
          
          {listing.url && listing.url !== '#' && (
            <button
              onClick={() => window.open(listing.url, '_blank', 'noopener,noreferrer')}
              className="flex items-center gap-1 text-mineral hover:text-mineral/80 transition-colors p-2 -mr-2 rounded-lg hover:bg-gray-100"
            >
              <ExternalLink className="w-4 h-4" />
              <span className="text-sm font-medium">{language === 'de' ? 'Original' : 'Original'}</span>
            </button>
          )}
        </div>
      </div>

      {/* Contenu scrollable */}
      <div className="flex-1 overflow-y-auto">
        {/* Image principale avec overlay d'informations */}
        <div className="relative">
          <div className="h-96 bg-gray-200 overflow-hidden">
            {listing.images && listing.images.length > 0 ? (
              <>
                <img
                  src={listing.images[currentImageIndex]}
                  alt={listing.title}
                  className="w-full h-full object-contain bg-white"
                  loading="lazy"
                  style={{ imageRendering: 'auto' }}
                  onError={(e) => {
                    e.currentTarget.style.display = 'none'
                    const nextElement = e.currentTarget.nextElementSibling as HTMLElement
                    if (nextElement) {
                      nextElement.style.display = 'flex'
                    }
                  }}
                />
                <div className="w-full h-full flex items-center justify-center" style={{display: listing.images && listing.images.length > 0 ? 'none' : 'flex'}}>
                  <Home className="w-16 h-16 text-gray-400" />
                </div>
                
                {/* Navigation des images */}
                {listing.images.length > 1 && (
                  <>
                    <button
                      onClick={prevImage}
                      className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-black/60 text-white p-3 rounded-full hover:bg-black/80 transition-colors backdrop-blur-sm"
                    >
                      <ChevronLeft className="w-5 h-5" />
                    </button>
                    <button
                      onClick={nextImage}
                      className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-black/60 text-white p-3 rounded-full hover:bg-black/80 transition-colors backdrop-blur-sm"
                    >
                      <ChevronRight className="w-5 h-5" />
                    </button>
                    
                    {/* Indicateurs d'images */}
                    <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex gap-2">
                      {listing.images.map((_, index) => (
                        <button
                          key={index}
                          onClick={() => setCurrentImageIndex(index)}
                          className={`w-2 h-2 rounded-full transition-colors ${
                            index === currentImageIndex ? 'bg-white' : 'bg-white/50'
                          }`}
                        />
                      ))}
                    </div>
                    
                    {/* Compteur d'images */}
                    <div className="absolute top-4 right-4 bg-black/60 text-white px-3 py-1 rounded-full text-sm backdrop-blur-sm">
                      {currentImageIndex + 1} / {listing.images.length}
                    </div>
                  </>
                )}
              </>
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <Home className="w-16 h-16 text-gray-400" />
              </div>
            )}
          </div>

          {/* Overlay avec prix et infos principales */}
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-6">
            <div className="text-white">
              <div className="text-3xl font-bold mb-2">
                {typeof listing.price === 'number' ? `${listing.price} €` : listing.price}
              </div>
              <div className="flex items-center gap-4 text-white/90">
                <div className="flex items-center gap-1">
                  <MapPin className="w-4 h-4" />
                  <span className="text-sm">{listing.address || 'Berlin, Germany'}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Calendar className="w-4 h-4" />
                  <span className="text-sm">{formatDate(listing.scrapedAt || new Date().toISOString())}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Contenu principal */}
        <div className="bg-white -mt-4 rounded-t-3xl relative z-10">
          <div className="p-6">
            {/* Badges des critères principaux - design simplifié */}
            <div className="flex flex-wrap gap-2 mb-6">
              {listing.furnished !== undefined && (
                <div className="px-3 py-1 bg-gray-100 text-gray-700 rounded-md text-sm font-medium">
                  {listing.furnished ? (language === 'de' ? 'Möbliert' : 'Furnished') : (language === 'de' ? 'Unmöbliert' : 'Unfurnished')}
                </div>
              )}
              <div className="px-3 py-1 bg-gray-100 text-gray-700 rounded-md text-sm font-medium">
                {listing.rooms} {language === 'de' ? 'Zimmer' : 'Bedrooms'}
              </div>
              {listing.size && (
                <div className="px-3 py-1 bg-gray-100 text-gray-700 rounded-md text-sm font-medium">
                  {listing.size} m²
                </div>
              )}
              <div className="px-3 py-1 bg-gray-100 text-gray-700 rounded-md text-sm font-medium capitalize">
                {listing.type}
              </div>
            </div>

            {/* Description */}
            <div className="mb-6">
              <h3 className="text-lg font-bold text-gray-900 mb-3">
                {language === 'de' ? 'Beschreibung' : 'Description'}
              </h3>
              <div className="text-gray-700 leading-relaxed whitespace-pre-wrap break-words bg-gray-50 p-4 rounded-xl">
                {listing.description ? (
                  <p className="text-sm">{listing.description}</p>
                ) : (
                  <p className="text-sm text-gray-500 italic">
                    {language === 'de' ? 'Keine Beschreibung verfügbar' : 'No description available'}
                  </p>
                )}
              </div>
            </div>

            {/* Détails techniques - design simplifié */}
            <div className="mb-6">
              <h3 className="text-lg font-bold text-gray-900 mb-3">
                {language === 'de' ? 'Details' : 'Details'}
              </h3>
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-gray-50 p-3 rounded-lg">
                  <div className="text-xs text-gray-600 mb-1">
                    {language === 'de' ? 'Typ' : 'Type'}
                  </div>
                  <div className="font-semibold text-gray-900 capitalize">{listing.type}</div>
                </div>
                <div className="bg-gray-50 p-3 rounded-lg">
                  <div className="text-xs text-gray-600 mb-1">
                    {language === 'de' ? 'Zimmer' : 'Rooms'}
                  </div>
                  <div className="font-semibold text-gray-900">{listing.rooms}</div>
                </div>
                {listing.size && (
                  <div className="bg-gray-50 p-3 rounded-lg">
                    <div className="text-xs text-gray-600 mb-1">
                      {language === 'de' ? 'Fläche' : 'Size'}
                    </div>
                    <div className="font-semibold text-gray-900">{listing.size} m²</div>
                  </div>
                )}
                <div className="bg-gray-50 p-3 rounded-lg">
                  <div className="text-xs text-gray-600 mb-1">
                    {language === 'de' ? 'Quelle' : 'Source'}
                  </div>
                  <div className="font-semibold text-gray-900 capitalize">{listing.platform || 'unknown'}</div>
                </div>
              </div>
            </div>
          </div>

          {/* Bouton d'action fixe en bas */}
          <div className="sticky bottom-0 bg-white border-t border-gray-200 p-6">
            <button
              onClick={handleApply}
              disabled={(!listing.link || listing.link === '#') && (!listing.url || listing.url === '#')}
              className={`w-full py-4 px-6 rounded-2xl font-bold text-lg transition-all duration-200 ${
                (listing.link && listing.link !== '#') || (listing.url && listing.url !== '#')
                  ? 'bg-gradient-to-r from-mineral to-mineral/90 text-white hover:from-mineral/90 hover:to-mineral shadow-lg hover:shadow-xl transform hover:-translate-y-0.5'
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }`}
            >
              {language === 'de' ? 'Jetzt bewerben' : 'Apply Now'}
            </button>
            
            <p className="text-xs text-gray-500 text-center mt-3">
              {(listing.link && listing.link !== '#') || (listing.url && listing.url !== '#')
                ? (language === 'de' 
                    ? 'Sie werden zur Originalanzeige weitergeleitet' 
                    : 'You will be redirected to the original listing')
                : (language === 'de'
                    ? 'Kein Link verfügbar'
                    : 'No link available')
              }
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}