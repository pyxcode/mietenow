import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { useRouter } from 'next/navigation'

export interface UserPreferences {
  city: string
  min_price?: number
  max_price: number
  type: string
  min_surface?: number
  max_surface?: number
  districts?: string[]
  furnishing?: 'Any' | 'Furnished' | 'Unfurnished'
  address?: string
  exact_address?: string
  radius?: number
  coordinates?: {lat: number, lng: number}
  min_bedrooms?: number
}

export interface OnboardingState {
  onboarding_completed: boolean
  current_step: 'rent' | 'criteria' | 'signup' | 'filters' | 'complete'
}

export function useUserPreferences() {
  const { user } = useAuth()
  const router = useRouter()
  
  // Initialiser les préférences en chargeant depuis localStorage si pas d'utilisateur
  const getInitialPreferences = (): UserPreferences => {
    if (typeof window !== 'undefined' && !user) {
      try {
        const tempPrefs = localStorage.getItem('temp_preferences')
        if (tempPrefs) {
          const parsed = JSON.parse(tempPrefs)
          if (parsed.preferences) {
            console.log('📥 Préférences chargées depuis localStorage:', parsed.preferences)
            // IMPORTANT: Utiliser d'abord les valeurs par défaut
            // PUIS le spread de parsed.preferences va ÉCRASER les valeurs par défaut
            // avec les vraies valeurs sauvegardées
            return {
              // Valeurs par défaut (seront écrasées si présentes dans parsed.preferences)
              city: 'Berlin',
              max_price: 1500,
              type: 'Any',
              furnishing: 'Any',
              // Spread operator: les valeurs de parsed.preferences ÉCRASENT les valeurs par défaut
              // Exemple: si parsed.preferences.type = 'Room', alors type devient 'Room' ✅
              ...parsed.preferences
            }
          }
        }
      } catch (error) {
        console.error('Error loading temp preferences from localStorage:', error)
      }
    }
    return {
      city: 'Berlin',
      max_price: 1500,
      type: 'Any',
      furnishing: 'Any'
    }
  }
  
  const [preferences, setPreferences] = useState<UserPreferences>(getInitialPreferences())
  const [onboardingState, setOnboardingState] = useState<OnboardingState>({
    onboarding_completed: false,
    current_step: 'rent'
  })
  const [loading, setLoading] = useState(false)

  // Charger les préférences utilisateur
  useEffect(() => {
    if (user) {
      loadUserPreferences()
    } else {
      // Charger depuis localStorage si pas d'utilisateur
      const tempPrefs = localStorage.getItem('temp_preferences')
      if (tempPrefs) {
        try {
          const parsed = JSON.parse(tempPrefs)
          if (parsed.preferences) {
            console.log('📥 Préférences chargées depuis localStorage (useEffect):', parsed.preferences)
            setPreferences(prev => ({ ...prev, ...parsed.preferences }))
          }
        } catch (error) {
          console.error('Error loading temp preferences:', error)
        }
      }
    }
  }, [user])

  const loadUserPreferences = async () => {
    try {
      // Get userId from user object or localStorage
      const userId = user?.id || localStorage.getItem('userId') || sessionStorage.getItem('userId')
      
      const url = userId 
        ? `/api/user/preferences?userId=${userId}`
        : '/api/user/preferences'
      
      const headers: HeadersInit = {}
      if (userId) {
        headers['x-user-id'] = userId
      }
      
      const response = await fetch(url, { headers })
      if (response.ok) {
        const data = await response.json()
        if (data.success) {
          setPreferences(data.data.search_preferences || preferences)
          setOnboardingState({
            onboarding_completed: data.data.onboarding_completed || false,
            current_step: data.data.current_step || 'rent'
          })
        }
      }
    } catch (error) {
      console.error('Error loading user preferences:', error)
    }
  }

  const savePreferences = async (step: string, newPreferences?: Partial<UserPreferences>) => {
    // Si pas d'utilisateur connecté, sauvegarder temporairement dans localStorage
    if (!user) {
      try {
        // IMPORTANT: Charger les préférences existantes depuis localStorage d'abord
        // pour éviter d'écraser avec des valeurs par défaut du state
        let existingPrefs: UserPreferences = {
          city: 'Berlin',
          max_price: 1500,
          type: 'Any',
          furnishing: 'Any'
        }
        
        try {
          const tempPrefs = localStorage.getItem('temp_preferences')
          if (tempPrefs) {
            const parsed = JSON.parse(tempPrefs)
            if (parsed.preferences) {
              existingPrefs = { ...existingPrefs, ...parsed.preferences }
              console.log('📥 Préférences existantes chargées depuis localStorage:', parsed.preferences)
            }
          }
        } catch (e) {
          console.warn('⚠️ Could not load existing preferences from localStorage:', e)
        }
        
        // Fusionner: d'abord les préférences existantes, puis les nouvelles
        const mergedPreferences = newPreferences 
          ? { 
              ...existingPrefs,  // D'abord les préférences depuis localStorage
              ...newPreferences   // Puis les nouvelles (écrasent seulement les champs définis)
            }
          : existingPrefs
        
        const tempPreferences = {
          step,
          preferences: mergedPreferences,
          timestamp: Date.now()
        }
        localStorage.setItem('temp_preferences', JSON.stringify(tempPreferences))
        console.log('💾 Préférences sauvegardées temporairement:', {
          step,
          newPreferences: newPreferences || '(none)',
          existingPrefs,
          mergedPreferences,
          fullTemp: tempPreferences
        })
        
        // Mettre à jour le state local aussi
        setPreferences(mergedPreferences)
        
        return true
      } catch (error) {
        console.error('❌ Error saving temp preferences:', error)
        return false
      }
    }

    setLoading(true)
    try {
      // Get userId from user object or localStorage
      const userId = user?.id || localStorage.getItem('userId') || sessionStorage.getItem('userId')
      
      const response = await fetch('/api/user/preferences', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(userId ? { 'x-user-id': userId } : {})
        },
        body: JSON.stringify({
          step,
          preferences: newPreferences ? { ...preferences, ...newPreferences } : preferences,
          ...(userId ? { userId } : {})
        })
      })

      if (response.ok) {
        const data = await response.json()
        if (data.success) {
          setPreferences(data.data.search_preferences)
          setOnboardingState({
            onboarding_completed: data.data.onboarding_completed,
            current_step: data.data.current_step
          })
          return true
        }
      }
      return false
    } catch (error) {
      console.error('Error saving preferences:', error)
      return false
    } finally {
      setLoading(false)
    }
  }

  const updatePreferences = async (newPreferences: Partial<UserPreferences>) => {
    if (!user) {
      // Si pas d'utilisateur connecté, sauvegarder temporairement dans localStorage
      try {
        const tempPreferences = {
          step: 'criteria',
          preferences: { ...preferences, ...newPreferences },
          timestamp: Date.now()
        }
        localStorage.setItem('temp_preferences', JSON.stringify(tempPreferences))
        console.log('Préférences mises à jour temporairement:', tempPreferences)
        return true
      } catch (error) {
        console.error('Error updating temp preferences:', error)
        return false
      }
    }

    setLoading(true)
    try {
      // Get userId from user object or localStorage
      const userId = user?.id || localStorage.getItem('userId') || sessionStorage.getItem('userId')
      
      const response = await fetch('/api/user/preferences', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...(userId ? { 'x-user-id': userId } : {})
        },
        body: JSON.stringify({
          search_preferences: { ...preferences, ...newPreferences },
          ...(userId ? { userId } : {})
        })
      })

      if (response.ok) {
        const data = await response.json()
        if (data.success) {
          setPreferences(data.data.search_preferences)
          return true
        }
      }
      return false
    } catch (error) {
      console.error('Error updating preferences:', error)
      return false
    } finally {
      setLoading(false)
    }
  }

  const completeOnboarding = async () => {
    return await savePreferences('complete')
  }

  const getNextStep = (currentStep: string): string => {
    const steps = ['rent', 'criteria', 'signup', 'filters', 'complete']
    const currentIndex = steps.indexOf(currentStep)
    return currentIndex < steps.length - 1 ? steps[currentIndex + 1] : 'complete'
  }

  const getPreviousStep = (currentStep: string): string => {
    const steps = ['rent', 'criteria', 'signup', 'filters', 'complete']
    const currentIndex = steps.indexOf(currentStep)
    return currentIndex > 0 ? steps[currentIndex - 1] : 'rent'
  }

  return {
    preferences,
    onboardingState,
    loading,
    savePreferences,
    updatePreferences,
    completeOnboarding,
    getNextStep,
    getPreviousStep,
    loadUserPreferences
  }
}
