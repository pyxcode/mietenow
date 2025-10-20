'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Search, MapPin, Euro, Home, ArrowRight, CheckCircle, Bell } from 'lucide-react'

export default function Hero() {
  const [searchQuery, setSearchQuery] = useState('')

  const stats = [
    { number: '10k+', label: 'Utilisateurs actifs' },
    { number: '50k+', label: 'Annonces indexées' },
    { number: '70%', label: 'Temps économisé' },
    { number: '24/7', label: 'Surveillance' },
  ]

  const features = [
    'Recherche unifiée sur toutes les plateformes',
    'Alertes instantanées par email et Telegram',
    'Filtrage intelligent des doublons',
    'Interface moderne et intuitive',
  ]

  return (
    <section className="bg-gradient-to-br from-cream via-white to-cream min-h-screen flex items-center">
      <div className="container-custom section-padding">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Left Column - Content */}
          <div className="space-y-8">
            {/* Badge */}
            <div className="inline-flex items-center px-4 py-2 bg-mint/10 text-mint rounded-full text-sm font-medium">
              🚀 Nouveau : Alertes Telegram disponibles
            </div>

            {/* Main Headline */}
            <div className="space-y-4">
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 leading-tight">
                Finde deine{' '}
                <span className="text-gradient">Wohnung</span>{' '}
                schneller
              </h1>
              <p className="text-xl text-gray-600 max-w-lg">
                Der schnellste und einfachste Weg, eine Wohnung in Deutschland zu finden. 
                Intelligente Benachrichtigungen und zentrale Suche über alle Plattformen.
              </p>
            </div>

            {/* Features List */}
            <div className="space-y-3">
              {features.map((feature, index) => (
                <div key={index} className="flex items-center space-x-3">
                  <CheckCircle className="w-5 h-5 text-mint flex-shrink-0" />
                  <span className="text-gray-700">{feature}</span>
                </div>
              ))}
            </div>

            {/* Search Bar */}
            <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
              <div className="space-y-4">
                <div className="flex items-center space-x-2 text-gray-600">
                  <Search className="w-5 h-5" />
                  <span className="font-medium">Recherche rapide</span>
                </div>
                <div className="flex flex-col sm:flex-row gap-3">
                  <div className="flex-1">
                    <input
                      type="text"
                      placeholder="Stadt oder Bezirk eingeben..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-mineral focus:border-transparent"
                    />
                  </div>
                  <Link 
                    href={`/search?q=${encodeURIComponent(searchQuery)}`}
                    className="btn-primary flex items-center justify-center space-x-2"
                  >
                    <span>Rechercher</span>
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              </div>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4">
              <Link href="/signup" className="btn-primary text-center">
                Gratuit starten
              </Link>
              <Link href="/demo" className="btn-outline text-center">
                Demo ansehen
              </Link>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 pt-8 border-t border-gray-200">
              {stats.map((stat, index) => (
                <div key={index} className="text-center">
                  <div className="text-2xl font-bold text-mineral">{stat.number}</div>
                  <div className="text-sm text-gray-600">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Right Column - Visual */}
          <div className="relative">
            {/* Main Dashboard Mockup */}
            <div className="bg-white rounded-2xl shadow-2xl p-6 border border-gray-100">
              <div className="space-y-4">
                {/* Header */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-gradient-primary rounded-lg"></div>
                    <span className="font-semibold text-gray-900">MieteNow</span>
                  </div>
                  <div className="flex space-x-2">
                    <div className="w-3 h-3 bg-red-400 rounded-full"></div>
                    <div className="w-3 h-3 bg-yellow-400 rounded-full"></div>
                    <div className="w-3 h-3 bg-green-400 rounded-full"></div>
                  </div>
                </div>

                {/* Search Interface */}
                <div className="space-y-3">
                  <div className="flex items-center space-x-2 text-gray-600">
                    <MapPin className="w-4 h-4" />
                    <span className="text-sm">Berlin, Mitte</span>
                  </div>
                  <div className="flex items-center space-x-2 text-gray-600">
                    <Euro className="w-4 h-4" />
                    <span className="text-sm">800-1200€</span>
                  </div>
                  <div className="flex items-center space-x-2 text-gray-600">
                    <Home className="w-4 h-4" />
                    <span className="text-sm">2 Zimmer</span>
                  </div>
                </div>

                {/* Results */}
                <div className="space-y-3">
                  <div className="bg-mint/10 p-3 rounded-lg">
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="font-medium text-gray-900">Wohnung in Mitte</div>
                        <div className="text-sm text-gray-600">2 Zimmer • 45m²</div>
                      </div>
                      <div className="text-right">
                        <div className="font-semibold text-mint">950€</div>
                        <div className="text-xs text-gray-500">Neu</div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-mineral/10 p-3 rounded-lg">
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="font-medium text-gray-900">WG Zimmer Kreuzberg</div>
                        <div className="text-sm text-gray-600">1 Zimmer • 20m²</div>
                      </div>
                      <div className="text-right">
                        <div className="font-semibold text-mineral">650€</div>
                        <div className="text-xs text-gray-500">Heute</div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Notification */}
                <div className="bg-gradient-primary text-white p-4 rounded-lg">
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                    <span className="text-sm font-medium">3 neue Anzeigen gefunden!</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Floating Elements */}
            <div className="absolute -top-4 -right-4 bg-mint text-white p-3 rounded-full shadow-lg animate-bounce-gentle">
              <Bell className="w-6 h-6" />
            </div>
            
            <div className="absolute -bottom-4 -left-4 bg-mineral text-white p-3 rounded-full shadow-lg animate-bounce-gentle" style={{ animationDelay: '1s' }}>
              <Search className="w-6 h-6" />
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
