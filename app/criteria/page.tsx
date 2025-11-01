'use client'

import { useState, useEffect } from 'react'
import { useLanguage } from '@/contexts/LanguageContext'
import { useUserPreferences } from '@/hooks/useUserPreferences'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'
import SimpleHeader from '@/components/SimpleHeader'
import { useRouter, useSearchParams } from 'next/navigation'

export const dynamic = 'force-dynamic'

export default function CriteriaPage() {
  const { language } = useLanguage()
  const { savePreferences } = useUserPreferences()
  const router = useRouter()
  const searchParams = useSearchParams()
  const [currentStep, setCurrentStep] = useState(0)
  const [criteria, setCriteria] = useState({
    housingType: '',
    furnishing: '',
    minSurface: '',
    bedrooms: ''
  })

  // Récupérer les prix depuis les paramètres URL UNE SEULE FOIS au chargement
  // Ne pas écraser le type/furnishing sélectionnés par l'utilisateur
  useEffect(() => {
    const minPrice = searchParams.get('minPrice')
    const maxPrice = searchParams.get('maxPrice')
    const typeFromUrl = searchParams.get('type')
    
    // Charger les préférences existantes depuis localStorage pour ne pas les écraser
    const existingPrefs = (() => {
      try {
        const temp = localStorage.getItem('temp_preferences')
        if (temp) {
          const parsed = JSON.parse(temp)
          return parsed.preferences || {}
        }
      } catch (e) {
        // Ignore
      }
      return {}
    })()
    
    if (minPrice && maxPrice) {
      // Sauvegarder uniquement les prix, NE JAMAIS écraser le type/furnishing sélectionnés
      const preferencesToSave: any = {
        min_price: parseInt(minPrice),
        max_price: parseInt(maxPrice)
      }
      
      // NE PAS toucher au type s'il existe déjà dans les préférences ou dans criteria
      // Seulement utiliser le type de l'URL si aucune sélection n'a été faite
      const hasExistingType = criteria.housingType || existingPrefs.type
      if (!hasExistingType && typeFromUrl) {
        preferencesToSave.type = typeFromUrl
      }
      // Sinon, on préserve le type existant (ne pas le mettre dans preferencesToSave)
      
      savePreferences('criteria', preferencesToSave)
    }
  }, []) // Exécuter UNE SEULE FOIS au montage, pas à chaque changement de searchParams

  const steps = [
    {
      id: 'housingType',
      title: language === 'de' ? 'Wohnungstyp' : 'Housing type',
      subtitle: language === 'de' ? 'Welche Art von Wohnung suchst du?' : 'What type of housing are you looking for?',
      options: ['Room', 'Studio', 'Apartment', 'House']
    },
    {
      id: 'furnishing',
      title: language === 'de' ? 'Ausstattung' : 'Furnishing',
      subtitle: language === 'de' ? 'Möbliert oder unmöbliert?' : 'Furnished or unfurnished?',
      options: ['Furnished', 'Unfurnished']
    },
    {
      id: 'bedrooms',
      title: language === 'de' ? 'Schlafzimmer' : 'Bedrooms',
      subtitle: language === 'de' ? 'Wie viele Schlafzimmer?' : 'How many bedrooms?',
      options: ['1+', '2+', '3+', '4+']
    }
  ]

  const handleOptionSelect = async (option: string) => {
    const currentStepData = steps[currentStep]
    const newCriteria = { ...criteria, [currentStepData.id]: option }
    setCriteria(newCriteria)
    
    // Prepare preferences to save
    const preferencesToSave: any = {}
    
    // Map housingType to type
    if (currentStepData.id === 'housingType') {
      preferencesToSave.type = option
    }
    
    // Map furnishing
    if (currentStepData.id === 'furnishing') {
      preferencesToSave.furnishing = option
    }
    
    // Map bedrooms and convert "2+" format to number 2
    if (currentStepData.id === 'bedrooms') {
      const bedroomsString = option.replace('+', '').trim()
      const bedroomsNumber = parseInt(bedroomsString, 10)
      if (!isNaN(bedroomsNumber) && bedroomsNumber > 0) {
        preferencesToSave.min_bedrooms = bedroomsNumber
        console.log(`✅ Converted bedrooms "${option}" to number ${bedroomsNumber}`)
      } else {
        console.error(`❌ Invalid bedrooms value: "${option}"`)
      }
    }
    
    // Save preferences immediately after each selection
    if (Object.keys(preferencesToSave).length > 0) {
      try {
        console.log('💾 Saving criteria preferences:', preferencesToSave)
        await savePreferences('criteria', preferencesToSave)
        console.log('✅ Criteria preferences saved')
      } catch (error) {
        console.error('❌ Error saving criteria preferences:', error)
      }
    }
    
    // Auto-advance to next step or go to address page
    if (currentStep < steps.length - 1) {
      setTimeout(() => {
        setCurrentStep(prev => prev + 1)
      }, 300)
    } else {
      // Last step - save all criteria one more time before redirecting
      const finalPreferences: any = {}
      if (newCriteria.housingType) {
        finalPreferences.type = newCriteria.housingType
      }
      if (newCriteria.furnishing) {
        finalPreferences.furnishing = newCriteria.furnishing
      }
      if (newCriteria.bedrooms) {
        const bedroomsString = newCriteria.bedrooms.replace('+', '').trim()
        const bedroomsNumber = parseInt(bedroomsString, 10)
        if (!isNaN(bedroomsNumber) && bedroomsNumber > 0) {
          finalPreferences.min_bedrooms = bedroomsNumber
          console.log(`✅ Final conversion: bedrooms "${newCriteria.bedrooms}" to number ${bedroomsNumber}`)
        }
      }
      
      if (Object.keys(finalPreferences).length > 0) {
        try {
          await savePreferences('criteria', finalPreferences)
          console.log('✅ Final criteria preferences saved before redirect')
        } catch (error) {
          console.error('❌ Error saving final criteria preferences:', error)
        }
      }
      
      setTimeout(() => {
        window.location.href = '/criteria/address'
      }, 300)
    }
  }

  const getMatchesEstimate = () => {
    let base = 50
    if (criteria.housingType === 'Room') base = 80
    if (criteria.housingType === 'Studio') base = 60
    if (criteria.housingType === 'Apartment') base = 40
    if (criteria.housingType === 'House') base = 20
    
    if (criteria.furnishing === 'Furnished') base = Math.floor(base * 0.7)
    if (criteria.bedrooms && parseInt(criteria.bedrooms) > 2) base = Math.floor(base * 0.7)
    
    return Math.max(base, 5)
  }

  const currentStepData = steps[currentStep]
  const isLastStep = currentStep === steps.length - 1

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
                <div className="w-8 h-8 rounded-full bg-white/20 text-white flex items-center justify-center text-sm font-semibold">3</div>
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
              {currentStepData.title}
            </h1>
            <p className="text-lg md:text-xl text-gray-300 leading-relaxed">
              {currentStepData.subtitle}
            </p>
          </div>

          {/* Options Grid */}
          <div className="grid grid-cols-2 gap-4 mb-12">
            {currentStepData.options.map((option) => (
              <button
                key={option}
                onClick={() => handleOptionSelect(option)}
                className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 border-2 border-white/20 hover:border-mineral/50 hover:bg-mineral/10 transition-all duration-300 group"
              >
                <div className="text-center">
                  <div className="text-2xl md:text-3xl font-bold text-white mb-2 group-hover:text-mineral transition-colors">
                    {option}
                  </div>
                  {currentStepData.id === 'bedrooms' && (
                    <div className="text-sm text-gray-300">
                      {language === 'de' ? 'Schlafzimmer' : 'bedrooms'}
                    </div>
                  )}
                </div>
              </button>
            ))}
          </div>

          {/* Step Indicator */}
          <div className="flex justify-center space-x-2 mb-8">
            {steps.map((_, index) => (
              <div
                key={index}
                className={`w-3 h-3 rounded-full transition-all duration-300 ${
                  index === currentStep
                    ? 'bg-mineral scale-125'
                    : index < currentStep
                    ? 'bg-mineral/50'
                    : 'bg-white/20'
                }`}
              />
            ))}
          </div>

          {/* Navigation */}
          <div className="flex justify-between items-center">
            <button
              onClick={() => setCurrentStep(Math.max(0, currentStep - 1))}
              disabled={currentStep === 0}
              className="flex items-center space-x-2 text-gray-300 hover:text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronLeft className="w-5 h-5" />
              <span className="text-sm">{language === 'de' ? 'Zurück' : 'Back'}</span>
            </button>
            
            <div className="text-sm text-gray-400">
              {language === 'de' 
                ? `${currentStep + 1} von ${steps.length}`
                : `${currentStep + 1} of ${steps.length}`
              }
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
