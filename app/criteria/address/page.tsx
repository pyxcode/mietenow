'use client'

export const dynamic = 'force-dynamic'

import { useState, useEffect, useRef } from 'react'
import { useLanguage } from '@/contexts/LanguageContext'
import { useUserPreferences } from '@/hooks/useUserPreferences'
import { ChevronLeft, ChevronRight, MapPin, Navigation } from 'lucide-react'
import Link from 'next/link'
import SimpleHeader from '@/components/SimpleHeader'
import { useRouter } from 'next/navigation'
import { geocodeAddress } from '@/lib/geocoding'

export default function AddressCriteriaPage() {
  const { language } = useLanguage()
  const { preferences, savePreferences } = useUserPreferences()
  const router = useRouter()
  
  const [address, setAddress] = useState('')
  const [radius, setRadius] = useState(5)
  const [addressSuggestions, setAddressSuggestions] = useState<any[]>([])
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [selectedCoordinates, setSelectedCoordinates] = useState<{lat: number, lng: number} | null>(null)
  const [isSearching, setIsSearching] = useState(false)
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  // Charger les préférences existantes
  useEffect(() => {
    if (preferences?.address) {
      setAddress(preferences.address)
    }
    if (preferences?.radius) {
      setRadius(preferences.radius)
    }
  }, [preferences])

  // Fonction pour rechercher des adresses avec OpenStreetMap Nominatim (avec debounce)
  const searchAddresses = (query: string) => {
    // Annuler la recherche précédente
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current)
    }

    if (query.length < 3) {
      setAddressSuggestions([])
      setShowSuggestions(false)
      setIsSearching(false)
      return
    }

    setIsSearching(true)

    // Debounce de 500ms
    searchTimeoutRef.current = setTimeout(async () => {
      try {
        const response = await fetch(
          `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query + ', Berlin, Germany')}&limit=5&addressdetails=1`
        )
        const data = await response.json()
        
        // Trier les résultats pour mettre les plus pertinents en premier
        const sortedData = data.sort((a: any, b: any) => {
          // Prioriser les résultats avec plus de détails d'adresse
          const aScore = (a.address?.road ? 1 : 0) + (a.address?.suburb ? 1 : 0) + (a.address?.city_district ? 1 : 0)
          const bScore = (b.address?.road ? 1 : 0) + (b.address?.suburb ? 1 : 0) + (b.address?.city_district ? 1 : 0)
          return bScore - aScore
        })
        
        setAddressSuggestions(sortedData)
        setShowSuggestions(true)
      } catch (error) {
        console.error('Error searching addresses:', error)
        setAddressSuggestions([])
      } finally {
        setIsSearching(false)
      }
    }, 500)
  }

  // Fonction pour sélectionner une adresse
  const selectAddress = (suggestion: any) => {
    setAddress(suggestion.display_name)
    setSelectedCoordinates({
      lat: parseFloat(suggestion.lat),
      lng: parseFloat(suggestion.lon)
    })
    // Garder les suggestions visibles un peu plus longtemps
    setTimeout(() => {
      setShowSuggestions(false)
    }, 200)
  }

  const handleContinue = async () => {
    try {
      let coordinates = selectedCoordinates
      
      // Si pas de coordonnées sélectionnées mais une adresse saisie, géocoder automatiquement
      if (!coordinates && address.trim()) {
        console.log('Géocodage automatique de l\'adresse:', address)
        
        try {
          const geocodingResult = await geocodeAddress(address, { city: 'Berlin', country: 'Germany' })
          
          if (geocodingResult) {
            coordinates = {
              lat: geocodingResult.lat,
              lng: geocodingResult.lng
            }
            console.log('Coordonnées obtenues:', coordinates)
          } else {
            console.warn('Impossible de géocoder l\'adresse:', address)
          }
        } catch (geocodingError) {
          console.error('Erreur lors du géocodage:', geocodingError)
        }
      }
      
      // Sauvegarder les préférences avec les coordonnées
      await savePreferences('address', {
        address,
        radius,
        coordinates: coordinates || undefined
      })
      
      // Rediriger vers la page de signup
      router.push('/signup')
    } catch (error) {
      console.error('Error saving preferences:', error)
      // Rediriger quand même vers signup
      router.push('/signup')
    }
  }

  const handleBack = () => {
    router.push('/criteria')
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 relative">
      <SimpleHeader />
      
      {/* Background Image */}
      <div className="absolute -bottom-[340px] left-0 right-0 z-5">
        <img 
          src="/Logos/berlin.png" 
          alt="Berlin" 
          className="w-full h-auto opacity-10"
        />
      </div>

      {/* Progress Bar */}
      <div className="bg-white/10 backdrop-blur-sm border-b border-white/10 pt-4 pb-4 relative z-10">
        <div className="container-custom">
          <div className="flex items-center justify-center space-x-8">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 rounded-full bg-mineral text-white flex items-center justify-center text-sm font-semibold">1</div>
              <span className="text-white text-sm font-medium">{language === 'de' ? 'Standort' : 'Location'}</span>
            </div>
            <div className="w-12 h-px bg-white/20"></div>
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 rounded-full bg-mineral text-white flex items-center justify-center text-sm font-semibold">2</div>
              <span className="text-white text-sm font-medium">{language === 'de' ? 'Kriterien' : 'Criteria'}</span>
            </div>
            <div className="w-12 h-px bg-white/20"></div>
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 rounded-full bg-mineral text-white flex items-center justify-center text-sm font-semibold">3</div>
              <span className="text-white text-sm font-medium">{language === 'de' ? 'Adresse' : 'Address'}</span>
            </div>
            <div className="w-12 h-px bg-white/20"></div>
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 rounded-full bg-white/20 text-white flex items-center justify-center text-sm font-semibold">4</div>
              <span className="text-white/60 text-sm font-medium">{language === 'de' ? 'Los geht\'s!' : 'Let\'s go!'}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex items-center justify-center px-4 py-16 relative z-10">
        <div className="max-w-2xl w-full">
          {/* Step Header */}
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-6 leading-tight">
              {language === 'de' ? 'Welche Adresse?' : 'What address?'}
            </h1>
            <p className="text-lg md:text-xl text-gray-300 leading-relaxed">
              {language === 'de' 
                ? 'Wo möchtest du wohnen? Wir suchen in der Nähe.'
                : 'Where do you want to live? We\'ll search nearby.'
              }
            </p>
          </div>

          {/* Address Input */}
          <div className="mb-8">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <MapPin className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                value={address}
                onChange={(e) => {
                  setAddress(e.target.value)
                  searchAddresses(e.target.value)
                }}
                onFocus={() => {
                  if (addressSuggestions.length > 0) {
                    setShowSuggestions(true)
                  }
                }}
                onBlur={() => {
                  // Délai avant de cacher les suggestions pour permettre le clic
                  setTimeout(() => {
                    setShowSuggestions(false)
                  }, 300)
                }}
                placeholder={language === 'de' ? 'Adresse eingeben...' : 'Enter address...'}
                className="w-full pl-12 pr-4 py-4 bg-white/10 backdrop-blur-sm border-2 border-white/20 rounded-2xl text-white placeholder-gray-400 focus:border-[#00BFA6] focus:outline-none transition-all duration-300"
              />
            </div>
            
            {/* Address Suggestions */}
            {(showSuggestions || isSearching) && (
              <div className="mt-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl overflow-hidden">
                {isSearching ? (
                  <div className="px-4 py-3 text-white text-center">
                    <div className="flex items-center justify-center space-x-2">
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                      <span className="text-sm">{language === 'de' ? 'Suche...' : 'Searching...'}</span>
                    </div>
                  </div>
                ) : addressSuggestions.length > 0 ? (
                  addressSuggestions.map((suggestion, index) => (
                    <button
                      key={index}
                      onClick={() => selectAddress(suggestion)}
                      className="w-full px-4 py-3 text-left text-white hover:bg-white/10 transition-colors border-b border-white/10 last:border-b-0"
                    >
                      <div className="font-medium text-sm">{suggestion.display_name}</div>
                      {suggestion.address && (
                        <div className="text-xs text-gray-300 mt-1">
                          {suggestion.address.road && `${suggestion.address.road}, `}
                          {suggestion.address.suburb && `${suggestion.address.suburb}, `}
                          {suggestion.address.city_district && `${suggestion.address.city_district}`}
                        </div>
                      )}
                    </button>
                  ))
                ) : (
                  <div className="px-4 py-3 text-gray-300 text-center text-sm">
                    {language === 'de' ? 'Keine Ergebnisse gefunden' : 'No results found'}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Radius Slider */}
          <div className="mb-12">
            <div className="text-center mb-6">
              <div className="flex items-center justify-center space-x-2 mb-2">
                <Navigation className="h-5 w-5 text-[#00BFA6]" />
                <span className="text-lg font-semibold text-white">
                  {language === 'de' ? 'Suchradius' : 'Search radius'}
                </span>
              </div>
              <div className="text-3xl font-bold text-[#00BFA6] mb-2">
                {radius} km
              </div>
              <p className="text-gray-300">
                {language === 'de' 
                  ? 'Wie weit soll gesucht werden?'
                  : 'How far should we search?'
                }
              </p>
            </div>
            
            <div className="px-4">
              <input
                type="range"
                min="1"
                max="20"
                value={radius}
                onChange={(e) => setRadius(parseInt(e.target.value))}
                className="w-full h-2 bg-white/20 rounded-lg appearance-none cursor-pointer slider"
                style={{
                  background: `linear-gradient(to right, #00BFA6 0%, #00BFA6 ${(radius - 1) / 19 * 100}%, rgba(255,255,255,0.2) ${(radius - 1) / 19 * 100}%, rgba(255,255,255,0.2) 100%)`
                }}
              />
              <div className="flex justify-between text-xs text-gray-400 mt-2">
                <span>1 km</span>
                <span>20 km</span>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <div className="flex justify-between items-center">
            <button
              onClick={handleBack}
              className="flex items-center space-x-2 text-gray-300 hover:text-white transition-colors"
            >
              <ChevronLeft className="w-5 h-5" />
              <span className="text-sm">{language === 'de' ? 'Zurück' : 'Back'}</span>
            </button>
            
            <button
              onClick={handleContinue}
              disabled={!address.trim()}
              className="flex items-center space-x-2 bg-[#00BFA6] hover:bg-[#00A693] text-white px-6 py-3 rounded-xl font-semibold transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span className="text-sm">{language === 'de' ? 'Weiter' : 'Continue'}</span>
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      <style jsx>{`
        .slider::-webkit-slider-thumb {
          appearance: none;
          height: 20px;
          width: 20px;
          border-radius: 50%;
          background: #00BFA6;
          cursor: pointer;
          border: 2px solid white;
          box-shadow: 0 2px 4px rgba(0,0,0,0.2);
        }
        
        .slider::-moz-range-thumb {
          height: 20px;
          width: 20px;
          border-radius: 50%;
          background: #00BFA6;
          cursor: pointer;
          border: 2px solid white;
          box-shadow: 0 2px 4px rgba(0,0,0,0.2);
        }
      `}</style>
    </div>
  )
}
