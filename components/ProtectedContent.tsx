'use client'

import { usePlanCheck } from '@/hooks/usePlanCheck'
import { useAuth } from '@/contexts/AuthContext'

interface ProtectedContentProps {
  children: React.ReactNode
  fallback?: React.ReactNode
  requirePaidPlan?: boolean
  requireValidPlan?: boolean
}

export default function ProtectedContent({ 
  children, 
  fallback,
  requirePaidPlan = false,
  requireValidPlan = false 
}: ProtectedContentProps) {
  const { user } = useAuth()
  const { isPlanValid, isLoading, planStatus } = usePlanCheck()

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#00BFA6]"></div>
      </div>
    )
  }

  if (!user) {
    return fallback || <div>Veuillez vous connecter</div>
  }

  // Vérifier les conditions
  if (requireValidPlan && !isPlanValid) {
    return fallback || (
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <p className="text-yellow-800">Votre plan a expiré. Veuillez renouveler votre abonnement.</p>
      </div>
    )
  }

  if (requirePaidPlan && user.plan === 'empty') {
    return fallback || (
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <p className="text-blue-800">Cette fonctionnalité nécessite un plan payant.</p>
      </div>
    )
  }

  return <>{children}</>
}
