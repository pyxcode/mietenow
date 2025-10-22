'use client'

import { useEffect, useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { usePlanCheck } from '@/hooks/usePlanCheck'
import { useRouter } from 'next/navigation'
import PlanModal from './PlanModal'

interface PlanGuardProps {
  children: React.ReactNode
  requirePaidPlan?: boolean
  requireValidPlan?: boolean
  fallbackUrl?: string
}

export default function PlanGuard({ 
  children, 
  requirePaidPlan = false, 
  requireValidPlan = false,
  fallbackUrl = '/payment'
}: PlanGuardProps) {
  const { user, loading: authLoading } = useAuth()
  const { isPlanValid, isLoading, planStatus, isExpired, isCanceled } = usePlanCheck()
  const router = useRouter()
  const [showPlanModal, setShowPlanModal] = useState(false)
  const [redirectReason, setRedirectReason] = useState<string | null>(null)

  useEffect(() => {
    if (authLoading || isLoading) return

    if (!user) {
      router.push('/login')
      return
    }

    // Vérifier les conditions d'accès
    if (requireValidPlan && !isPlanValid) {
      setRedirectReason('plan_expired')
      setShowPlanModal(true)
      return
    }

    if (requirePaidPlan && user.plan === 'empty') {
      setRedirectReason('no_plan')
      setShowPlanModal(true)
      return
    }

    // Si tout est OK, fermer la modal
    setShowPlanModal(false)
  }, [user, isPlanValid, authLoading, isLoading, requirePaidPlan, requireValidPlan, router])

  // Afficher un loader pendant la vérification
  if (authLoading || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#00BFA6] mx-auto mb-4"></div>
          <p className="text-gray-600">Vérification de votre plan...</p>
        </div>
      </div>
    )
  }

  // Si pas d'utilisateur, ne rien afficher (redirection en cours)
  if (!user) {
    return null
  }

  return (
    <>
      {children}
      
      <PlanModal 
        isOpen={showPlanModal}
        onClose={() => {
          setShowPlanModal(false)
          if (redirectReason === 'plan_expired' || redirectReason === 'no_plan') {
            router.push(fallbackUrl)
          }
        }}
      />
    </>
  )
}

// Composant pour afficher le statut du plan
export function PlanStatus() {
  const { user } = useAuth()
  const { isPlanValid, planStatus, timeRemaining, isExpired, isCanceled } = usePlanCheck()

  if (!user) return null

  const getStatusColor = () => {
    if (isExpired) return 'text-red-600'
    if (isCanceled) return 'text-orange-600'
    if (isPlanValid) return 'text-green-600'
    return 'text-gray-600'
  }

  const getStatusText = () => {
    if (isExpired) return 'Plan expiré'
    if (isCanceled) return 'Plan annulé'
    if (isPlanValid) return 'Plan actif'
    return 'Aucun plan'
  }

  return (
    <div className="bg-white rounded-lg p-4 border">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-semibold text-gray-900">Statut de votre plan</h3>
          <p className={`text-sm ${getStatusColor()}`}>
            {getStatusText()}
          </p>
          {timeRemaining && (
            <p className="text-xs text-gray-500">
              Expire dans {timeRemaining.days} jours et {timeRemaining.hours} heures
            </p>
          )}
        </div>
        <div className="text-right">
          <p className="text-sm font-medium text-gray-900">
            {user.plan === 'empty' ? 'Aucun plan' : user.plan}
          </p>
          {(user as any).plan_expires_at && (
            <p className="text-xs text-gray-500">
              {new Date((user as any).plan_expires_at).toLocaleDateString()}
            </p>
          )}
        </div>
      </div>
    </div>
  )
}
