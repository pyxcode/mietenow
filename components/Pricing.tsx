import { Check, Star, Zap } from 'lucide-react'

export default function Pricing() {
  const plans = [
    {
      name: 'Gratuit',
      price: '0',
      period: 'pour toujours',
      description: 'Parfait pour commencer votre recherche',
      features: [
        'Recherche sur 2 plateformes',
        'Jusqu\'à 3 alertes par semaine',
        'Notifications par email',
        'Support communautaire',
        'Interface de base'
      ],
      cta: 'Commencer gratuitement',
      href: '/signup?plan=free',
      popular: false
    },
    {
      name: 'Pro',
      price: '9',
      period: '/mois',
      description: 'Pour les chercheurs sérieux',
      features: [
        'Recherche sur toutes les plateformes',
        'Alertes illimitées',
        'Notifications email + Telegram',
        'Support prioritaire',
        'Interface avancée',
        'Filtres personnalisés',
        'Historique des recherches',
        'Statistiques détaillées'
      ],
      cta: 'Essayer Pro',
      href: '/signup?plan=pro',
      popular: true
    },
    {
      name: 'Premium',
      price: '19',
      period: '/mois',
      description: 'Pour les professionnels',
      features: [
        'Tout de Pro',
        'API personnalisée',
        'Intégrations avancées',
        'Support dédié',
        'Analyses prédictives',
        'Accès en priorité',
        'Fonctionnalités bêta',
        'Conseil personnalisé'
      ],
      cta: 'Choisir Premium',
      href: '/signup?plan=premium',
      popular: false
    }
  ]

  return (
    <section className="section-padding bg-gray-50">
      <div className="container-custom">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
            Tarifs{' '}
            <span className="text-gradient">transparents</span>
          </h2>
          <p className="text-xl text-gray-600">
            Choisissez le plan qui correspond à vos besoins. 
            Pas de frais cachés, pas d'engagement.
          </p>
        </div>

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {plans.map((plan, index) => (
            <div
              key={index}
              className={`relative bg-white rounded-2xl shadow-lg border-2 transition-all duration-300 hover:shadow-xl ${
                plan.popular 
                  ? 'border-mineral scale-105' 
                  : 'border-gray-100 hover:border-mineral/50'
              }`}
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
                  {plan.features.map((feature, featureIndex) => (
                    <li key={featureIndex} className="flex items-start space-x-3">
                      <Check className="w-5 h-5 text-mint flex-shrink-0 mt-0.5" />
                      <span className="text-gray-700">{feature}</span>
                    </li>
                  ))}
                </ul>

                {/* CTA Button */}
                <a
                  href={plan.href}
                  className={`block w-full text-center py-3 px-6 rounded-lg font-medium transition-all duration-200 ${
                    plan.popular
                      ? 'btn-primary'
                      : 'btn-outline'
                  }`}
                >
                  {plan.cta}
                </a>
              </div>
            </div>
          ))}
        </div>

        {/* Bottom Section */}
        <div className="text-center mt-16">
          <div className="bg-white rounded-2xl p-8 shadow-lg border border-gray-100 max-w-4xl mx-auto">
            <div className="flex items-center justify-center space-x-2 mb-4">
              <Zap className="w-6 h-6 text-mint" />
              <h3 className="text-2xl font-bold text-gray-900">
                Garantie satisfait ou remboursé
              </h3>
            </div>
            <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
              Essayez MieteNow pendant 14 jours. Si vous n'êtes pas satisfait, 
              nous vous remboursons intégralement, sans questions.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a href="/faq" className="text-mineral hover:text-dark-blue transition-colors">
                Questions fréquentes →
              </a>
              <a href="/contact" className="text-mineral hover:text-dark-blue transition-colors">
                Nous contacter →
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
