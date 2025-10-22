'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'

export function usePlanCheck() {
  const { user } = useAuth()
  const [isPlanValid, setIsPlanValid] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [planStatus, setPlanStatus] = useState<'empty' | 'active' | 'expired' | 'canceled'>('empty')

  useEffect(() => {
    if (!user) {
      setIsLoading(false)
      setPlanStatus('empty')
      return
    }

    // Vérifier le statut du plan
    const checkPlanStatus = () => {
      if (user.plan === 'empty') {
        setIsPlanValid(false)
        setPlanStatus('empty')
      } else {
        const now = new Date()
        const planExpiry = (user as any).plan_expires_at ? new Date((user as any).plan_expires_at) : null
        
        // Vérifier le statut de l'abonnement
        if ((user as any).subscription_status === 'canceled') {
          setIsPlanValid(false)
          setPlanStatus('canceled')
        } else if ((user as any).subscription_status === 'expired') {
          setIsPlanValid(false)
          setPlanStatus('expired')
        } else if (planExpiry && now > planExpiry) {
          // Plan expiré par la date
          setIsPlanValid(false)
          setPlanStatus('expired')
        } else {
          // Plan actif
          setIsPlanValid(true)
          setPlanStatus('active')
        }
      }
      setIsLoading(false)
    }

    checkPlanStatus()
  }, [user])

  // Fonction pour obtenir le temps restant
  const getTimeRemaining = () => {
    if (!(user as any)?.plan_expires_at) return null
    
    const now = new Date()
    const expiry = new Date((user as any).plan_expires_at)
    const diff = expiry.getTime() - now.getTime()
    
    if (diff <= 0) return null
    
    const days = Math.floor(diff / (1000 * 60 * 60 * 24))
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
    
    return { days, hours }
  }

  return {
    isPlanValid,
    isLoading,
    userPlan: user?.plan || 'empty',
    planExpiresAt: (user as any)?.plan_expires_at,
    planStatus,
    timeRemaining: getTimeRemaining(),
    isExpired: planStatus === 'expired',
    isCanceled: planStatus === 'canceled',
    isActive: planStatus === 'active'
  }
}
