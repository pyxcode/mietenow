'use client'

import { useSession } from 'next-auth/react'

export function usePlanCheck() {
  const { data: session, status } = useSession()
  
  const isLoading = status === 'loading'
  const user = session?.user

  const isPlanValid = user ? (
    user.plan !== 'empty' && 
    user.subscription_status === 'active' &&
    (!user.plan_expires_at || new Date() <= new Date(user.plan_expires_at))
  ) : false

  const planStatus = user ? (
    user.plan === 'empty' ? 'empty' :
    user.subscription_status === 'canceled' ? 'canceled' :
    user.subscription_status === 'expired' ? 'expired' :
    user.plan_expires_at && new Date() > new Date(user.plan_expires_at) ? 'expired' : 'active'
  ) : 'empty'

  // Fonction pour obtenir le temps restant
  const getTimeRemaining = () => {
    if (!user?.plan_expires_at) return null
    
    const now = new Date()
    const expiry = new Date(user.plan_expires_at)
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
    planExpiresAt: user?.plan_expires_at,
    planStatus,
    timeRemaining: getTimeRemaining(),
    isExpired: planStatus === 'expired',
    isCanceled: planStatus === 'canceled',
    isActive: planStatus === 'active'
  }
}
