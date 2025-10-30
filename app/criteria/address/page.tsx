'use client'

export const dynamic = 'force-dynamic'

import { useState, useEffect } from 'react'
import { useLanguage } from '@/contexts/LanguageContext'
import { useUserPreferences } from '@/hooks/useUserPreferences'
import { ChevronLeft, ChevronRight, Navigation } from 'lucide-react'
import SimpleHeader from '@/components/SimpleHeader'
import { useRouter } from 'next/navigation'
import AddressPicker from '@/components/AddressPicker'

export default function AddressCriteriaPage() {
  const { language } = useLanguage()
  const { preferences, savePreferences } = useUserPreferences()
  const router = useRouter()
  
  const [address, setAddress] = useState('')
  const [exactAddress, setExactAddress] = useState('')
  const [radius, setRadius] = useState(5)
  const [selectedCoordinates, setSelectedCoordinates] = useState<{lat: number, lng: number} | null>(null)

  // Load existing preferences
  useEffect(() => {
    if (preferences?.address) {
      setAddress(preferences.address)
    }
    if (preferences?.exact_address) {
      setExactAddress(preferences.exact_address)
    }
    if (preferences?.radius) {
      setRadius(preferences.radius)
    }
    if (preferences?.coordinates) {
      setSelectedCoordinates(preferences.coordinates)
    }
  }, [preferences])

  // Handle address selection from AddressPicker
  const handleAddressSelect = ({ address: selectedAddress, coordinates }: { address: string; coordinates: { lat: number; lng: number } }) => {
    setAddress(selectedAddress)
    setExactAddress(selectedAddress)
    setSelectedCoordinates(coordinates)
  }

  const handleContinue = async () => {
    try {
      console.log('💾 Saving address preferences:', {
        address,
        exact_address: exactAddress,
        radius,
        coordinates: selectedCoordinates
      })
      
      const saveResult = await savePreferences('address', {
        address,
        exact_address: exactAddress,
        radius,
        coordinates: selectedCoordinates || undefined
      })
      
      console.log('✅ Address preferences saved:', saveResult)
      
      // Redirect to signup page
      router.push('/signup')
    } catch (error) {
      console.error('Error saving address preferences:', error)
      // Redirect anyway
      router.push('/signup')
    }
  }

  const handleBack = () => {
    router.push('/criteria/price')
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
            <AddressPicker
              onAddressSelect={handleAddressSelect}
              initialAddress={address}
              initialCoordinates={selectedCoordinates || undefined}
              placeholder={language === 'de' ? 'Adresse eingeben...' : 'Enter address...'}
            />
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
