'use client'

import Header from '@/components/Header'
import Footer from '@/components/Footer'
import Image from 'next/image'
import Link from 'next/link'
import { Search, MapPin } from 'lucide-react'
import { useTranslation } from '@/hooks/useTranslation'
import { useAuth } from '@/contexts/AuthContext'

export default function HomePage() {
  const { t, language } = useTranslation()
  const { user } = useAuth()
  
  return (
    <main className="min-h-screen">
      <Header />
      
      {/* Hero Section - Ultra Simple */}
      <section className="bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 min-h-screen flex flex-col items-center justify-center relative overflow-hidden">

        {/* Main Content */}
        <div className="text-center z-10 max-w-4xl mx-auto px-6">
          {/* Title */}
          <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold text-white mb-6 leading-tight">
            {t('home.hero.title')} <span className="text-[#00BFA6] relative">
              {t('home.hero.titleHighlight')}
              <div className="absolute inset-0 bg-[#00BFA6]/20 blur-xl -z-10"></div>
            </span>
          </h1>
          
          {/* Subtitle */}
          <p className="text-xl md:text-2xl text-gray-300 mb-12 max-w-2xl mx-auto">
            {t('home.hero.subtitle')}
          </p>

          {/* Search Bar Complete - Berlin Only */}
          <div className="bg-white rounded-2xl shadow-xl p-6 max-w-3xl mx-auto mb-16">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Prix Min */}
              <div>
                <label className="block text-sm font-medium text-[#6B7280] mb-2 text-left">
                  {t('home.hero.minPriceLabel')}
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
                  {t('home.hero.maxPriceLabel')}
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
                <Link href={user ? "/search" : "/criteria"} className="w-full bg-[#004AAD] hover:bg-[#002E73] text-white px-6 py-3 rounded-lg text-lg font-semibold transition-colors duration-200 flex items-center justify-center gap-2">
                  <Search className="w-5 h-5" />
                  {t('home.hero.searchButton')}
                </Link>
              </div>
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

        {/* Floating Elements - Plus modernes */}
        <div className="absolute top-1/4 left-1/4 w-24 h-24 bg-[#00BFA6]/30 rounded-full blur-2xl"></div>
        <div className="absolute bottom-1/4 right-1/4 w-40 h-40 bg-white/10 rounded-full blur-2xl"></div>
        <div className="absolute top-1/2 right-1/3 w-16 h-16 bg-[#004AAD]/20 rounded-full blur-xl"></div>
        </section>

        {/* Features Section - Ultra Modern */}
        <section className="bg-gradient-to-b from-gray-50 to-white py-24">
          <div className="container-custom">
            {/* Headline - More Impact */}
            <div className="text-center mb-20">
              <h2 className="text-4xl md:text-5xl font-bold text-gray-300 mb-2 tracking-tight">
                {t('home.features.headline1')}
              </h2>
              <h3 className="text-4xl md:text-5xl font-bold text-[#004AAD] tracking-tight">
                {t('home.features.headline2')}
              </h3>
            </div>

            {/* Three Column Features - Consistent Design */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-16 max-w-7xl mx-auto">
              {/* Feature 1 - Automated Search */}
              <div className="group text-center">
                <div className="relative mb-8">
                  <div className="w-24 h-24 bg-gradient-to-br from-gray-50 to-gray-100 rounded-3xl mx-auto flex items-center justify-center relative shadow-lg group-hover:shadow-xl transition-all duration-300 group-hover:scale-105">
                    <svg className="w-12 h-12 text-[#004AAD] group-hover:text-[#00BFA6] transition-colors duration-300" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                    </svg>
                    <div className="absolute -top-2 -right-2 w-6 h-6 bg-gradient-to-br from-[#00BFA6] to-[#00A693] rounded-full flex items-center justify-center shadow-lg">
                      <span className="text-white text-xs font-bold">✓</span>
                    </div>
                  </div>
                </div>
                <h4 className="text-lg md:text-xl font-bold text-gray-900 mb-4 group-hover:text-[#004AAD] transition-colors duration-300">
                  {t('home.features.automated.title')}
                </h4>
                <p className="text-gray-500 text-lg leading-relaxed max-w-sm mx-auto">
                  {t('home.features.automated.description')}
                </p>
              </div>

              {/* Feature 2 - Instant Notifications */}
              <div className="group text-center">
                <div className="relative mb-8">
                  <div className="w-24 h-24 bg-gradient-to-br from-gray-50 to-gray-100 rounded-3xl mx-auto flex items-center justify-center relative shadow-lg group-hover:shadow-xl transition-all duration-300 group-hover:scale-105">
                    <svg className="w-12 h-12 text-[#004AAD] group-hover:text-orange-500 transition-colors duration-300" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M12 22c1.1 0 2-.9 2-2h-4c0 1.1.89 2 2 2zm6-6v-5c0-3.07-1.64-5.64-4.5-6.32V4c0-.83-.67-1.5-1.5-1.5s-1.5.67-1.5 1.5v.68C7.63 5.36 6 7.92 6 11v5l-2 2v1h16v-1l-2-2z"/>
                    </svg>
                    <div className="absolute -top-2 -right-2 w-6 h-6 bg-gradient-to-br from-[#00BFA6] to-[#00A693] rounded-full flex items-center justify-center shadow-lg">
                      <span className="text-white text-xs font-bold">1</span>
                    </div>
                  </div>
                </div>
                <h4 className="text-lg md:text-xl font-bold text-gray-900 mb-4 group-hover:text-[#004AAD] transition-colors duration-300">
                  {t('home.features.notifications.title')}
                </h4>
                <p className="text-gray-500 text-lg leading-relaxed max-w-sm mx-auto">
                  {t('home.features.notifications.description')}
                </p>
              </div>

              {/* Feature 3 - Fraud Protection */}
              <div className="group text-center">
                <div className="relative mb-8">
                  <div className="w-24 h-24 bg-gradient-to-br from-gray-50 to-gray-100 rounded-3xl mx-auto flex items-center justify-center relative shadow-lg group-hover:shadow-xl transition-all duration-300 group-hover:scale-105">
                    <svg className="w-12 h-12 text-[#004AAD] group-hover:text-red-500 transition-colors duration-300" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M12,1L3,5V11C3,16.55 6.84,21.74 12,23C17.16,21.74 21,16.55 21,11V5L12,1M12,7C13.4,7 14.8,8.6 14.8,10V11H16V16H8V11H9.2V10C9.2,8.6 10.6,7 12,7M12,8.2C11.2,8.2 10.4,8.7 10.4,10V11H13.6V10C13.6,8.7 12.8,8.2 12,8.2Z"/>
                    </svg>
                    <div className="absolute -top-2 -right-2 w-6 h-6 bg-gradient-to-br from-[#00BFA6] to-[#00A693] rounded-full flex items-center justify-center shadow-lg">
                      <span className="text-white text-xs font-bold">🛡</span>
                    </div>
                  </div>
                </div>
                <h4 className="text-lg md:text-xl font-bold text-gray-900 mb-4 group-hover:text-[#004AAD] transition-colors duration-300">
                  {t('home.features.protection.title')}
                </h4>
                <p className="text-gray-500 text-lg leading-relaxed max-w-sm mx-auto">
                  {t('home.features.protection.description')}
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Popular Cities Section */}
        <section className="bg-[#002E73] py-20">
          <div className="container-custom">
            <div className="mb-12">
              <div>
                  <h2 className="text-4xl md:text-5xl font-bold text-[#FAFAFB] mb-4" style={{ fontFamily: 'Manrope, sans-serif' }}>
                    {language === 'de' ? 'Bald in weiteren Städten' : 'Coming soon to more cities'}
                  </h2>
                  <p className="text-[#FAFAFB]/80 text-lg md:text-xl" style={{ fontFamily: 'Manrope, sans-serif' }}>
                    {language === 'de' ? 'Der schnellste Weg zu Ihrer Wohnung — überall in Deutschland.' : 'The fastest way to find your home — everywhere in Germany.'}
                  </p>
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {[
                { name: 'München', image: '/Logos/Munchen_optimized.jpg' },
                { name: 'Hamburg', image: '/Logos/hamburg_optimized.jpg' },
                { name: 'Köln', image: '/Logos/koln_optimized.jpg' },
                { name: 'Frankfurt', image: '/Logos/frankfurt_optimized.jpg' },
              ].map((city, index) => (
                <div key={city.name} className="group cursor-pointer">
                  <div className="relative aspect-[4/3] rounded-xl mb-4 overflow-hidden group-hover:scale-105 transition-transform duration-300">
                    <Image
                      src={city.image}
                      alt={city.name}
                      fill
                      className="object-cover"
                    />
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                      <span className="text-[#FAFAFB] text-2xl font-bold relative z-10">{city.name}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

          </div>
        </section>

        {/* We've Been There Section */}
        <section className="bg-white py-20">
          <div className="container-custom">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
              <div>
                <h2 className="text-4xl md:text-5xl font-bold text-[#002E73] mb-6" style={{ fontFamily: 'Satoshi, sans-serif' }}>
                  {language === 'de' ? 'Von Mietern, für Mieter.' : 'Built by renters, for renters.'}
                </h2>
                <p className="text-[#6B7280] text-lg md:text-xl leading-relaxed mb-6" style={{ fontFamily: 'Manrope, sans-serif' }}>
                  {language === 'de' ? 'Wir kennen den Berliner Wohnungsmarkt. Deshalb haben wir die Wohnungssuche einfach, schnell und transparent gemacht. Keine endlosen Formulare, kein Spam, nur echte Inserate an einem Ort.' : 'We know the Berlin housing market — that\'s why we made finding an apartment simple, fast, and transparent. No endless forms, no spam, just real listings in one place.'}
                </p>
                <Link href="/about" className="bg-[#00BFA6] hover:bg-[#002E73] text-[#FAFAFB] px-6 py-3 rounded-lg text-lg font-semibold transition-colors inline-block" style={{ fontFamily: 'Inter, sans-serif' }}>
                  {language === 'de' ? 'Unser Team entdecken' : 'Discover our team'}
                </Link>
              </div>
              <div className="relative">
                <div className="aspect-[3/4] w-1/2 mx-auto rounded-2xl overflow-hidden">
                  <Image
                    src="/Logos/Team1_optimized.jpg"
                    alt="Notre équipe"
                    fill
                    className="object-cover"
                  />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Need Help Section */}
        <section className="bg-[#FAFAFB] py-16">
          <div className="container-custom">
            <div className="bg-[#002E73]/5 rounded-2xl p-8 md:p-12">
              <div className="flex flex-col md:flex-row items-center justify-between gap-8">
                <div className="flex-1">
                  <h2 className="text-4xl md:text-5xl font-bold text-[#002E73] mb-4" style={{ fontFamily: 'Manrope, sans-serif' }}>
                    {language === 'de' ? 'Brauchen Sie Hilfe?' : 'Need Help?'}
                  </h2>
                  <p className="text-[#6B7280] text-lg md:text-xl" style={{ fontFamily: 'Manrope, sans-serif' }}>
                    {language === 'de' ? 'Unser Kundendienst ist jeden Tag von 10:00 - 16:00 Uhr erreichbar.' : 'Our customer service is available every day from 10:00 - 16:00.'}
                  </p>
                </div>
                

                <Link href="mailto:hello@mietenow.de" className="bg-[#00BFA6] hover:bg-[#002E73] text-[#FAFAFB] px-6 py-3 rounded-lg text-lg font-semibold transition-colors whitespace-nowrap" style={{ fontFamily: 'Inter, sans-serif' }}>
                  {language === 'de' ? 'Hilfe erhalten' : 'Get help'}
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Ready to Find Your Home Section */}
        <section className="bg-[#002E73] py-20">
          <div className="container-custom text-center">
            <h2 className="text-4xl md:text-5xl font-bold text-[#FAFAFB] mb-6" style={{ fontFamily: 'Satoshi, sans-serif' }}>
              {language === 'de' ? 'Bereit, Ihre perfekte Wohnung in Berlin zu finden?' : 'Ready to find your perfect home in Berlin?'}
            </h2>
            <p className="text-[#FAFAFB]/80 text-lg md:text-xl mb-12 max-w-3xl mx-auto" style={{ fontFamily: 'Manrope, sans-serif' }}>
              {language === 'de' ? 'Schließen Sie sich Tausenden von Expats, Studenten und Fachkräften an, die ihre Wohnung mit mietenow gefunden haben.' : 'Join thousands of expats, students, and professionals who found their home with mietenow.'}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/mieten" className="bg-[#00BFA6] hover:bg-[#002E73] text-[#FAFAFB] px-6 py-3 rounded-lg text-lg font-semibold transition-colors" style={{ fontFamily: 'Inter, sans-serif' }}>
                {language === 'de' ? 'Jetzt suchen' : 'Search now'}
              </Link>
              <Link href="/solutions" className="bg-transparent border-2 border-[#FAFAFB] text-[#FAFAFB] hover:bg-[#FAFAFB] hover:text-[#002E73] px-6 py-3 rounded-lg text-lg font-semibold transition-colors" style={{ fontFamily: 'Inter, sans-serif' }}>
                {language === 'de' ? 'Unsere Lösung' : 'Our solution'}
              </Link>
            </div>
          </div>
        </section>
        
        <Footer />
      </main>
    )
  }
