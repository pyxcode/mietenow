'use client'

import Header from '@/components/Header'
import Footer from '@/components/Footer'
import { Search } from 'lucide-react'
import { useTranslation } from '@/hooks/useTranslation'

export default function RentPage() {
  const { t, language } = useTranslation()

  return (
    <div className="min-h-screen">
      <Header />
      
      <main className="min-h-screen">
        {/* Hero Section - Style Landing avec module de recherche */}
        <section className="bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 min-h-screen flex flex-col items-center justify-center relative overflow-hidden">

          {/* Main Content */}
          <div className="text-center z-10 max-w-4xl mx-auto px-6">
            {/* Title */}
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-4 md:mb-6 leading-tight">
              {language === 'de' ? 'Finden Sie Ihre Wohnung' : 'Find Your Apartment'}
            </h1>
            
            {/* Subtitle */}
            <p className="text-lg md:text-xl text-gray-300 mb-6 md:mb-8">
              {language === 'de' 
                ? 'Der kürzeste Weg zu Ihrer nächsten Wohnung in Berlin'
                : 'The shortest way to your next apartment in Berlin'
              }
            </p>

            {/* Search Bar Complete - Berlin Only */}
            <div className="bg-white rounded-2xl shadow-xl p-6 max-w-3xl mx-auto mb-16">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Prix Min */}
                <div>
                  <label className="block text-sm font-medium text-[#6B7280] mb-2 text-left">
                    {language === 'de' ? 'Mindestpreis' : 'Min Price'}
                  </label>
                  <input
                    type="number"
                    placeholder="500"
                    defaultValue="500"
                    className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#004AAD] focus:border-transparent text-gray-900"
                  />
                </div>

                {/* Prix Max */}
                <div>
                  <label className="block text-sm font-medium text-[#6B7280] mb-2 text-left">
                    {language === 'de' ? 'Höchstpreis' : 'Max Price'}
                  </label>
                  <input
                    type="number"
                    placeholder="1500"
                    defaultValue="1500"
                    className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#004AAD] focus:border-transparent text-gray-900"
                  />
                </div>

                {/* Bouton Recherche */}
                <div className="flex items-end">
                  <button className="w-full bg-[#004AAD] hover:bg-[#002E73] text-white px-6 py-3 rounded-lg text-lg font-semibold transition-colors duration-200 flex items-center justify-center gap-2">
                    <Search className="w-5 h-5" />
                    {language === 'de' ? 'Suchen' : 'Search'}
                  </button>
                </div>
              </div>
            </div>

            {/* Additional Info */}
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 md:p-8 max-w-2xl mx-auto">
              <div className="space-y-4 text-lg md:text-xl text-gray-200 leading-relaxed">
                <p>
                  {language === 'de' 
                    ? 'Durchsuchen Sie Tausende von Anzeigen in Deutschland'
                    : 'Search through thousands of listings in Germany'
                  }
                </p>
                
                <p className="text-[#00BFA6] font-semibold">
                  {language === 'de'
                    ? 'Schnell, einfach und effizient'
                    : 'Fast, easy and efficient'
                  }
                </p>
                
                <p>
                  {language === 'de'
                    ? 'Unsere Plattform aggregiert Anzeigen von über 100 Mietseiten und zeigt Ihnen die besten Angebote in Berlin.'
                    : 'Our platform aggregates listings from over 100 rental sites and shows you the best offers in Berlin.'
                  }
                </p>
              </div>
            </div>
          </div>

          {/* Berlin Image at very bottom */}
          <div className="absolute -bottom-[340px] left-0 right-0 z-5">
            <img 
              src="/Logos/berlin.png" 
              alt="Berlin" 
              className="w-full h-auto opacity-10"
            />
          </div>

          {/* Floating Elements */}
          <div className="absolute top-1/4 left-1/4 w-24 h-24 bg-[#00BFA6]/30 rounded-full blur-2xl"></div>
          <div className="absolute bottom-1/4 right-1/4 w-40 h-40 bg-white/10 rounded-full blur-2xl"></div>
          <div className="absolute top-1/2 right-1/3 w-16 h-16 bg-[#004AAD]/20 rounded-full blur-xl"></div>
        </section>
      </main>

      <Footer />
    </div>
  )
}