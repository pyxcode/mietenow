export const dynamic = 'force-dynamic'

import PlanGuard from '@/components/PlanGuard'
import PlanStatus from '@/components/PlanGuard'

export default function ProtectedSearchPage() {
  return (
    <PlanGuard requireValidPlan={true}>
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 py-8">
          <h1 className="text-3xl font-bold mb-8">Recherche Protégée</h1>
          
          {/* Afficher le statut du plan */}
          <div className="mb-8">
            <PlanStatus>
              <div>Statut du plan</div>
            </PlanStatus>
          </div>
          
          {/* Contenu de la page */}
          <div className="bg-white rounded-lg p-6">
            <p>Cette page nécessite un plan valide pour y accéder.</p>
            <p>Si votre plan est expiré, vous serez redirigé vers la page de paiement.</p>
          </div>
        </div>
      </div>
    </PlanGuard>
  )
}
