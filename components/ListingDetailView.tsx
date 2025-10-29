'use client'

import { useState, useEffect } from 'react'
import { ArrowLeft, MapPin, Euro, Home, Calendar, ChevronLeft, ChevronRight } from 'lucide-react'
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
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    
    if (diffDays === 1) return language === 'de' ? 'Gestern' : 'Yesterday'
    if (diffDays < 7) return `${diffDays} ${language === 'de' ? 'Tage' : 'days'} ago`
    if (diffDays < 30) return `${Math.ceil(diffDays / 7)} ${language === 'de' ? 'Wochen' : 'weeks'} ago`
    return `${Math.ceil(diffDays / 30)} ${language === 'de' ? 'Monate' : 'months'} ago`
  }

  const handleApply = () => {
    console.log('View Details clicked, listing.link:', listing.link)
    if (listing.link && listing.link !== '#') {
      window.open(listing.link, '_blank')
    } else {
      console.log('No valid link found for listing:', listing.id)
      // Fallback: essayer d'ouvrir l'URL originale
      if (listing.url) {
        window.open(listing.url, '_blank')
      } else {
        alert(language === 'de' ? 'Kein Link verfügbar' : 'No link available')
      }
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
    <div className="h-full flex flex-col">
      {/* Header avec bouton retour */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-white">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-gray-600 hover:text-mineral transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          <span className="font-medium">{language === 'de' ? 'Zurück' : 'Back'}</span>
        </button>
        
        <h1 className="text-lg font-semibold text-gray-900 truncate px-4">
          {listing.title}
        </h1>
        
        <div className="w-20"></div> {/* Spacer pour centrer le titre */}
      </div>

      {/* Contenu scrollable */}
      <div className="flex-1 overflow-y-auto bg-white">
        <div className="p-4">
          {/* Images */}
          <div className="mb-6">
            <div className="relative h-64 bg-gray-200 rounded-xl overflow-hidden">
              {listing.images && listing.images.length > 0 ? (
                <>
                  <img
                    src={listing.images[currentImageIndex]}
                    alt={listing.title}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.currentTarget.style.display = 'none'
                      const nextElement = e.currentTarget.nextElementSibling as HTMLElement
                      if (nextElement) {
                        nextElement.style.display = 'flex'
                      }
                    }}
                  />
                  <div className="w-full h-full flex items-center justify-center" style={{display: listing.images && listing.images.length > 0 ? 'none' : 'flex'}}>
                    <Home className="w-12 h-12 text-gray-400" />
                  </div>
                  
                  {/* Navigation des images */}
                  {listing.images.length > 1 && (
                    <>
                      <button
                        onClick={prevImage}
                        className="absolute left-3 top-1/2 transform -translate-y-1/2 bg-black/50 text-white p-2 rounded-full hover:bg-black/70 transition-colors"
                      >
                        <ChevronLeft className="w-4 h-4" />
                      </button>
                      <button
                        onClick={nextImage}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 bg-black/50 text-white p-2 rounded-full hover:bg-black/70 transition-colors"
                      >
                        <ChevronRight className="w-4 h-4" />
                      </button>
                      
                      {/* Indicateurs d'images */}
                      <div className="absolute bottom-3 left-1/2 transform -translate-x-1/2 flex gap-1">
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
                      <div className="absolute top-3 right-3 bg-black/50 text-white px-2 py-1 rounded text-xs">
                        {currentImageIndex + 1} / {listing.images.length}
                      </div>
                    </>
                  )}
                </>
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <Home className="w-12 h-12 text-gray-400" />
                </div>
              )}
            </div>
          </div>

          {/* Informations principales */}
          <div className="mb-6">
            <div className="flex items-center gap-3 text-gray-600 mb-3">
              <div className="flex items-center gap-1">
                <MapPin className="w-4 h-4" />
                <span className="text-sm">{listing.address || 'Berlin, Germany'}</span>
              </div>
              <div className="flex items-center gap-1">
                <Calendar className="w-4 h-4" />
                <span className="text-sm">{formatDate(listing.scrapedAt || new Date().toISOString())}</span>
              </div>
            </div>
            
            <div className="text-3xl font-bold text-mineral mb-4">
              {typeof listing.price === 'number' ? `${listing.price} €` : listing.price}
            </div>
          </div>

          {/* Description - COMPLÈTE */}
          <div className="mb-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-3">
              {language === 'de' ? 'Beschreibung' : 'Description'}
            </h2>
            <div className="text-gray-700 leading-relaxed whitespace-pre-wrap break-words">
              {listing.description ? (
                <p className="text-sm">{listing.description}</p>
              ) : (
                <p className="text-sm text-gray-500 italic">
                  {language === 'de' ? 'Keine Beschreibung verfügbar' : 'No description available'}
                </p>
              )}
            </div>
          </div>

          {/* Détails */}
          <div className="mb-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-3">
              {language === 'de' ? 'Details' : 'Details'}
            </h2>
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-gray-50 p-3 rounded-lg">
                <div className="text-xs text-gray-600 mb-1">
                  {language === 'de' ? 'Typ' : 'Type'}
                </div>
                <div className="font-semibold text-gray-900 text-sm">{listing.type}</div>
              </div>
              <div className="bg-gray-50 p-3 rounded-lg">
                <div className="text-xs text-gray-600 mb-1">
                  {language === 'de' ? 'Zimmer' : 'Rooms'}
                </div>
                <div className="font-semibold text-gray-900 text-sm">{listing.rooms}</div>
              </div>
              {listing.size && (
                <div className="bg-gray-50 p-3 rounded-lg">
                  <div className="text-xs text-gray-600 mb-1">
                    {language === 'de' ? 'Fläche' : 'Size'}
                  </div>
                  <div className="font-semibold text-gray-900 text-sm">{listing.size} m²</div>
                </div>
              )}
              <div className="bg-gray-50 p-3 rounded-lg">
                <div className="text-xs text-gray-600 mb-1">
                  {language === 'de' ? 'Quelle' : 'Source'}
                </div>
                <div className="font-semibold text-gray-900 text-sm capitalize">{listing.platform || 'unknown'}</div>
              </div>
            </div>
          </div>

          {/* Bouton d'action */}
          <div className="sticky bottom-0 bg-white pt-4 border-t border-gray-100">
            <button
              onClick={handleApply}
              disabled={!listing.link || listing.link === '#'}
              className={`w-full py-3 px-6 rounded-lg font-semibold transition-colors ${
                listing.link && listing.link !== '#'
                  ? 'bg-mineral text-white hover:bg-mineral/90'
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }`}
            >
              {language === 'de' ? 'Jetzt bewerben' : 'Apply Now'}
            </button>
            
            <p className="text-xs text-gray-500 text-center mt-2">
              {listing.link && listing.link !== '#'
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
