import { Search, Bell, Shield, Zap, Users, TrendingUp } from 'lucide-react'

export default function Features() {
  const features = [
    {
      icon: Search,
      title: 'Recherche unifiée',
      description: 'Agrégation d\'annonces issues de plusieurs plateformes (WG-Gesucht, Immowelt, Nestpick…) en un seul endroit.',
      color: 'mineral'
    },
    {
      icon: Bell,
      title: 'Alertes instantanées',
      description: 'Notification e-mail et Telegram dès qu\'une annonce correspondante est publiée. Ne ratez plus aucune opportunité.',
      color: 'mint'
    },
    {
      icon: Shield,
      title: 'Filtrage intelligent',
      description: 'Élimine les doublons et fausses annonces, trie par fiabilité et pertinence pour vous faire gagner du temps.',
      color: 'mineral'
    },
    {
      icon: Zap,
      title: 'Gain de temps',
      description: 'Réduisez votre temps de recherche de 70% grâce à notre système de surveillance automatique 24/7.',
      color: 'mint'
    },
    {
      icon: Users,
      title: 'Interface moderne',
      description: 'Design épuré et intuitif qui rend la recherche d\'appartement agréable et efficace.',
      color: 'mineral'
    },
    {
      icon: TrendingUp,
      title: 'Données fiables',
      description: 'Notre algorithme analyse la fiabilité des annonces pour vous présenter uniquement les meilleures offres.',
      color: 'mint'
    }
  ]

  return (
    <section className="section-padding bg-white">
      <div className="container-custom">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
            Pourquoi choisir{' '}
            <span className="text-gradient">MieteNow</span> ?
          </h2>
          <p className="text-xl text-gray-600">
            Nous révolutionnons la recherche d'appartement en Allemagne avec des outils intelligents 
            qui vous font gagner du temps et trouvent les meilleures offres.
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <div key={index} className="card group hover:shadow-xl transition-all duration-300">
              <div className="flex items-start space-x-4">
                <div className={`p-3 rounded-xl bg-${feature.color}/10 group-hover:bg-${feature.color}/20 transition-colors`}>
                  <feature.icon className={`w-6 h-6 text-${feature.color}`} />
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-semibold text-gray-900 mb-3">
                    {feature.title}
                  </h3>
                  <p className="text-gray-600 leading-relaxed">
                    {feature.description}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Bottom CTA */}
        <div className="text-center mt-16">
          <div className="bg-gradient-to-r from-mineral/5 to-mint/5 rounded-2xl p-8 border border-gray-100">
            <h3 className="text-2xl font-bold text-gray-900 mb-4">
              Prêt à révolutionner votre recherche d'appartement ?
            </h3>
            <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
              Rejoignez des milliers d'utilisateurs qui ont déjà trouvé leur logement idéal 
              grâce à MieteNow. Commencez gratuitement dès aujourd'hui.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a href="/signup" className="btn-primary">
                Commencer gratuitement
              </a>
              <a href="/demo" className="btn-outline">
                Voir la démo
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
