'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { CreditCard, Check, Star, Zap, Shield, ArrowRight } from 'lucide-react'

export default function PaymentPage() {
  const router = useRouter()
  const [selectedPlan, setSelectedPlan] = useState('pro')
  const [loading, setLoading] = useState(false)

  const plans = [
    {
      id: 'free',
      name: 'Gratuit',
      price: 0,
      period: 'pour toujours',
      description: 'Parfait pour commencer',
      features: [
        'Recherche sur 2 plateformes',
        'Jusqu\'à 3 alertes par semaine',
        'Notifications par email',
        'Support communautaire'
      ],
      popular: false
    },
    {
      id: 'pro',
      name: 'Pro',
      price: 9,
      period: '/mois',
      description: 'Pour les chercheurs sérieux',
      features: [
        'Recherche sur toutes les plateformes',
        'Alertes illimitées',
        'Notifications email + Telegram',
        'Support prioritaire',
        'Interface avancée',
        'Filtres personnalisés'
      ],
      popular: true
    },
    {
      id: 'premium',
      name: 'Premium',
      price: 19,
      period: '/mois',
      description: 'Pour les professionnels',
      features: [
        'Tout de Pro',
        'API personnalisée',
        'Intégrations avancées',
        'Support dédié',
        'Analyses prédictives',
        'Accès en priorité'
      ],
      popular: false
    }
  ]

  const handlePayment = async () => {
    setLoading(true)
    
    try {
      // Simuler le processus de paiement
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      // Rediriger vers le dashboard
      router.push('/dashboard')
    } catch (error) {
      console.error('Payment error:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Choisissez votre plan
          </h1>
          <p className="text-xl text-gray-600">
            Débloquez toutes les fonctionnalités pour trouver votre logement idéal
          </p>
        </div>

        {/* Plans */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
          {plans.map((plan) => (
            <div
              key={plan.id}
              className={`relative bg-white rounded-2xl shadow-lg border-2 transition-all duration-300 hover:shadow-xl cursor-pointer ${
                selectedPlan === plan.id
                  ? 'border-mineral scale-105'
                  : 'border-gray-100 hover:border-mineral/50'
              }`}
              onClick={() => setSelectedPlan(plan.id)}
            >
              {/* Popular Badge */}
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <div className="bg-gradient-primary text-white px-4 py-2 rounded-full text-sm font-medium flex items-center space-x-1">
                    <Star className="w-4 h-4" />
                    <span>Populaire</span>
                  </div>
                </div>
              )}

              <div className="p-8">
                {/* Plan Header */}
                <div className="text-center mb-8">
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">
                    {plan.name}
                  </h3>
                  <p className="text-gray-600 mb-4">
                    {plan.description}
                  </p>
                  <div className="flex items-baseline justify-center">
                    <span className="text-4xl font-bold text-gray-900">
                      {plan.price}€
                    </span>
                    <span className="text-gray-600 ml-1">
                      {plan.period}
                    </span>
                  </div>
                </div>

                {/* Features List */}
                <ul className="space-y-4 mb-8">
                  {plan.features.map((feature, index) => (
                    <li key={index} className="flex items-start space-x-3">
                      <Check className="w-5 h-5 text-mint flex-shrink-0 mt-0.5" />
                      <span className="text-gray-700">{feature}</span>
                    </li>
                  ))}
                </ul>

                {/* Selection Indicator */}
                {selectedPlan === plan.id && (
                  <div className="flex items-center justify-center space-x-2 text-mineral font-medium">
                    <Check className="w-5 h-5" />
                    <span>Sélectionné</span>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Payment Section */}
        <div className="bg-white rounded-2xl shadow-lg p-8">
          <div className="max-w-2xl mx-auto">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">
              Informations de paiement
            </h2>

            {/* Payment Form */}
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <CreditCard className="w-4 h-4 inline mr-1" />
                  Numéro de carte
                </label>
                <input
                  type="text"
                  placeholder="1234 5678 9012 3456"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-mineral focus:border-transparent"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Date d'expiration
                  </label>
                  <input
                    type="text"
                    placeholder="MM/YY"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-mineral focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    CVV
                  </label>
                  <input
                    type="text"
                    placeholder="123"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-mineral focus:border-transparent"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nom sur la carte
                </label>
                <input
                  type="text"
                  placeholder="John Doe"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-mineral focus:border-transparent"
                />
              </div>
            </div>

            {/* Security Features */}
            <div className="flex items-center justify-center space-x-6 mt-8 py-4 border-t border-gray-200">
              <div className="flex items-center space-x-2 text-gray-600">
                <Shield className="w-5 h-5" />
                <span className="text-sm">Paiement sécurisé</span>
              </div>
              <div className="flex items-center space-x-2 text-gray-600">
                <Zap className="w-5 h-5" />
                <span className="text-sm">Activation immédiate</span>
              </div>
            </div>

            {/* Payment Button */}
            <button
              onClick={handlePayment}
              disabled={loading}
              className="w-full btn-primary flex items-center justify-center space-x-2 mt-8"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <span>Payer {plans.find(p => p.id === selectedPlan)?.price}€/mois</span>
                  <ArrowRight className="w-5 h-5" />
                </>
              )}
            </button>

            {/* Money Back Guarantee */}
            <div className="text-center mt-6">
              <p className="text-sm text-gray-500">
                <Shield className="w-4 h-4 inline mr-1" />
                Garantie satisfait ou remboursé 14 jours
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
