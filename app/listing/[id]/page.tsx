'use client'

export const dynamic = 'force-dynamic'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { ArrowLeft, MapPin, Euro, Home, Calendar, ExternalLink, Share2 } from 'lucide-react'
import { useLanguage } from '@/contexts/LanguageContext'
import Image from 'next/image'
import FormattedDescription from '@/components/FormattedDescription'

interface Listing {
  id: string
  title: string
  description: string
  price: string
  address: string
  size?: number
  rooms: number
  type: string
  images: string[]
  link: string
  platform: string
  scrapedAt: string
  lat: number
  lng: number
}

export default function ListingPage() {
  const params = useParams()
  const router = useRouter()
  const { language } = useLanguage()
  const [listing, setListing] = useState<Listing | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [currentImageIndex, setCurrentImageIndex] = useState(0)

  useEffect(() => {
    const fetchListing = async () => {
      try {
        setLoading(true)
        const response = await fetch(`/api/listings/${params.id}`)
        const data = await response.json()
        
        if (data.success) {
          setListing(data.data)
        } else {
          setError('Listing not found')
        }
      } catch (err) {
        console.error('Error fetching listing:', err)
        setError('Failed to load listing')
      } finally {
        setLoading(false)
      }
    }

    if (params.id) {
      fetchListing()
    }
  }, [params.id])

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
    if (listing?.link) {
      window.open(listing.link, '_blank')
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-cream flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-mineral mx-auto mb-4"></div>
          <p className="text-gray-600">{language === 'de' ? 'Lade Anzeige...' : 'Loading listing...'}</p>
        </div>
      </div>
    )
  }

  if (error || !listing) {
    return (
      <div className="min-h-screen bg-cream flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            {language === 'de' ? 'Anzeige nicht gefunden' : 'Listing not found'}
          </h1>
          <button
            onClick={() => router.back()}
            className="bg-mineral text-white px-6 py-3 rounded-lg hover:bg-mineral/90 transition-colors"
          >
            {language === 'de' ? 'Zurück' : 'Go Back'}
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-cream">
      {/* Header avec bouton retour */}
      <div className="bg-white shadow-sm border-b border-gray-100 sticky top-0 z-50">
        <div className="px-4 md:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <button
              onClick={() => router.back()}
              className="flex items-center gap-2 text-gray-600 hover:text-mineral transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              <span className="font-medium">{language === 'de' ? 'Zurück' : 'Back'}</span>
            </button>
            
            <div className="flex items-center gap-3">
              <button className="p-2 text-gray-600 hover:text-mineral transition-colors">
                <Share2 className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Contenu principal */}
      <div className="px-4 md:px-6 lg:px-8 py-6">
        <div className="max-w-4xl mx-auto">
          {/* Images */}
          <div className="mb-6">
            <div className="relative h-96 bg-gray-200 rounded-xl overflow-hidden">
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
                    <Home className="w-16 h-16 text-gray-400" />
                  </div>
                  
                  {/* Navigation des images */}
                  {listing.images.length > 1 && (
                    <>
                      <button
                        onClick={() => setCurrentImageIndex(Math.max(0, currentImageIndex - 1))}
                        className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-black/50 text-white p-2 rounded-full hover:bg-black/70 transition-colors"
                        disabled={currentImageIndex === 0}
                      >
                        ←
                      </button>
                      <button
                        onClick={() => setCurrentImageIndex(Math.min(listing.images.length - 1, currentImageIndex + 1))}
                        className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-black/50 text-white p-2 rounded-full hover:bg-black/70 transition-colors"
                        disabled={currentImageIndex === listing.images.length - 1}
                      >
                        →
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
                    </>
                  )}
                </>
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <Home className="w-16 h-16 text-gray-400" />
                </div>
              )}
            </div>
          </div>

          {/* Informations principales */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Colonne principale */}
            <div className="lg:col-span-2">
              <div className="mb-6">
                <h1 className="text-3xl font-bold text-gray-900 mb-2">{listing.title}</h1>
                <div className="flex items-center gap-4 text-gray-600 mb-4">
                  <div className="flex items-center gap-1">
                    <MapPin className="w-4 h-4" />
                    <span>{listing.address}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Calendar className="w-4 h-4" />
                    <span>{formatDate(listing.scrapedAt)}</span>
                  </div>
                </div>
                
                <div className="text-4xl font-bold text-mineral mb-6">
                  {listing.price}
                </div>
              </div>

              {/* Description */}
              <div className="mb-8">
                <h2 className="text-xl font-semibold text-gray-900 mb-3">
                  {language === 'de' ? 'Beschreibung' : 'Description'}
                </h2>
                <div className="bg-gray-50 p-6 rounded-xl">
                  {listing.description && (
                    <FormattedDescription description={listing.description} />
                  )}
                </div>
              </div>

              {/* Détails */}
              <div className="mb-8">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">
                  {language === 'de' ? 'Details' : 'Details'}
                </h2>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="bg-white p-4 rounded-lg border border-gray-200">
                    <div className="text-sm text-gray-600 mb-1">
                      {language === 'de' ? 'Typ' : 'Type'}
                    </div>
                    <div className="font-semibold text-gray-900">{listing.type}</div>
                  </div>
                  <div className="bg-white p-4 rounded-lg border border-gray-200">
                    <div className="text-sm text-gray-600 mb-1">
                      {language === 'de' ? 'Zimmer' : 'Rooms'}
                    </div>
                    <div className="font-semibold text-gray-900">{listing.rooms}</div>
                  </div>
                  {listing.size && (
                    <div className="bg-white p-4 rounded-lg border border-gray-200">
                      <div className="text-sm text-gray-600 mb-1">
                        {language === 'de' ? 'Fläche' : 'Size'}
                      </div>
                      <div className="font-semibold text-gray-900">{listing.size} m²</div>
                    </div>
                  )}
                  <div className="bg-white p-4 rounded-lg border border-gray-200">
                    <div className="text-sm text-gray-600 mb-1">
                      {language === 'de' ? 'Quelle' : 'Source'}
                    </div>
                    <div className="font-semibold text-gray-900 capitalize">{listing.platform}</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Colonne latérale - Bouton d'action */}
            <div className="lg:col-span-1">
              <div className="sticky top-24">
                <div className="bg-white rounded-xl border border-gray-200 p-6">
                  <div className="text-center mb-6">
                    <div className="text-3xl font-bold text-mineral mb-2">{listing.price}</div>
                    <div className="text-gray-600">
                      {language === 'de' ? 'pro Monat' : 'per month'}
                    </div>
                  </div>
                  
                  <button
                    onClick={handleApply}
                    className="w-full bg-mineral text-white py-4 px-6 rounded-lg font-semibold text-lg hover:bg-mineral/90 transition-colors mb-4 flex items-center justify-center gap-2"
                  >
                    <ExternalLink className="w-5 h-5" />
                    {language === 'de' ? 'Jetzt bewerben' : 'Apply Now'}
                  </button>
                  
                  <p className="text-xs text-gray-500 text-center">
                    {language === 'de' 
                      ? 'Sie werden zur Originalanzeige weitergeleitet' 
                      : 'You will be redirected to the original listing'
                    }
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}