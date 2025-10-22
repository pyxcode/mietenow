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
  radius?: number
  coordinates?: {lat: number, lng: number}
}

export interface OnboardingState {
  onboarding_completed: boolean
  current_step: 'rent' | 'criteria' | 'signup' | 'filters' | 'complete'
}

export function useUserPreferences() {
  const { user } = useAuth()
  const router = useRouter()
  const [preferences, setPreferences] = useState<UserPreferences>({
    city: 'Berlin',
    max_price: 1500,
    type: 'Any',
    furnishing: 'Any'
  })
  const [onboardingState, setOnboardingState] = useState<OnboardingState>({
    onboarding_completed: false,
    current_step: 'rent'
  })
  const [loading, setLoading] = useState(false)

  // Charger les préférences utilisateur
  useEffect(() => {
    if (user) {
      loadUserPreferences()
    }
  }, [user])

  const loadUserPreferences = async () => {
    try {
      const response = await fetch('/api/user/preferences')
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
    if (!user) {
      router.push('/login')
      return false
    }

    setLoading(true)
    try {
      const response = await fetch('/api/user/preferences', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          step,
          preferences: newPreferences ? { ...preferences, ...newPreferences } : preferences
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
      router.push('/login')
      return false
    }

    setLoading(true)
    try {
      const response = await fetch('/api/user/preferences', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          search_preferences: { ...preferences, ...newPreferences }
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
