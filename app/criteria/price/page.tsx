'use client'

export const dynamic = 'force-dynamic'

import { useState, useEffect } from 'react'
import { useLanguage } from '@/contexts/LanguageContext'
import { useUserPreferences } from '@/hooks/useUserPreferences'
import { ChevronLeft, ChevronRight, Euro } from 'lucide-react'
import SimpleHeader from '@/components/SimpleHeader'
import { useRouter } from 'next/navigation'
import PriceRangePicker from '@/components/PriceRangePicker'

export default function PriceCriteriaPage() {
  const { language } = useLanguage()
  const { preferences, savePreferences } = useUserPreferences()
  const router = useRouter()
  
  const [minPrice, setMinPrice] = useState(0)
  const [maxPrice, setMaxPrice] = useState(1500)

  // Load existing preferences
  useEffect(() => {
    if (preferences?.min_price !== undefined) {
      setMinPrice(preferences.min_price)
    }
    if (preferences?.max_price !== undefined) {
      setMaxPrice(preferences.max_price)
    }
  }, [preferences])

  const handlePriceChange = ({ minPrice: newMinPrice, maxPrice: newMaxPrice }: { minPrice: number; maxPrice: number }) => {
    setMinPrice(newMinPrice)
    setMaxPrice(newMaxPrice)
  }

  const handleContinue = async () => {
    try {
      console.log('💾 Saving price preferences:', {
        min_price: minPrice,
        max_price: maxPrice
      })
      
      const saveResult = await savePreferences('price', {
        min_price: minPrice,
        max_price: maxPrice
      })
      
      console.log('✅ Price preferences saved:', saveResult)
      
      // Redirect to address page
      router.push('/criteria/address')
    } catch (error) {
      console.error('Error saving price preferences:', error)
      // Redirect anyway
      router.push('/criteria/address')
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
              <span className="text-white text-sm font-medium">{language === 'de' ? 'Preis' : 'Price'}</span>
            </div>
            <div className="w-12 h-px bg-white/20"></div>
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 rounded-full bg-white/20 text-white flex items-center justify-center text-sm font-semibold">4</div>
              <span className="text-white/60 text-sm font-medium">{language === 'de' ? 'Adresse' : 'Address'}</span>
            </div>
            <div className="w-12 h-px bg-white/20"></div>
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 rounded-full bg-white/20 text-white flex items-center justify-center text-sm font-semibold">5</div>
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
              {language === 'de' ? 'Welches Budget?' : 'What\'s your budget?'}
            </h1>
            <p className="text-lg md:text-xl text-gray-300 leading-relaxed">
              {language === 'de' 
                ? 'Wie viel möchtest du monatlich für die Miete ausgeben?'
                : 'How much do you want to spend monthly on rent?'
              }
            </p>
          </div>

          {/* Price Range Picker */}
          <div className="mb-12">
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 border-2 border-white/20">
              <PriceRangePicker
                onPriceChange={handlePriceChange}
                initialMinPrice={minPrice}
                initialMaxPrice={maxPrice}
                minValue={0}
                maxValue={5000}
                step={50}
              />
            </div>
          </div>

          {/* Budget Tips */}
          <div className="mb-12">
            <div className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10">
              <div className="flex items-start space-x-3">
                <Euro className="h-5 w-5 text-[#00BFA6] mt-0.5 flex-shrink-0" />
                <div>
                  <h3 className="text-white font-semibold mb-2">
                    {language === 'de' ? 'Budget-Tipps' : 'Budget Tips'}
                  </h3>
                  <div className="text-sm text-gray-300 space-y-1">
                    {language === 'de' ? (
                      <>
                        <p>• WG-Zimmer: 400-800€</p>
                        <p>• Studio: 600-1200€</p>
                        <p>• 1-Zimmer: 800-1500€</p>
                        <p>• 2-Zimmer: 1200-2000€</p>
                      </>
                    ) : (
                      <>
                        <p>• Room share: 400-800€</p>
                        <p>• Studio: 600-1200€</p>
                        <p>• 1-bedroom: 800-1500€</p>
                        <p>• 2-bedroom: 1200-2000€</p>
                      </>
                    )}
                  </div>
                </div>
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
              disabled={minPrice >= maxPrice}
              className="flex items-center space-x-2 bg-[#00BFA6] hover:bg-[#00A693] text-white px-6 py-3 rounded-xl font-semibold transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span className="text-sm">{language === 'de' ? 'Weiter' : 'Continue'}</span>
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
