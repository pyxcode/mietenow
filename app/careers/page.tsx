'use client'

import Header from '@/components/Header'
import Footer from '@/components/Footer'
import { useTranslation } from '@/hooks/useTranslation'
import { MapPin, Clock, Users, Heart } from 'lucide-react'

export default function CareersPage() {
  const { t, language } = useTranslation()

  const benefits = [
    {
      icon: MapPin,
      title: language === 'de' ? 'Zentrale Lage' : 'Central Location',
      description: language === 'de' 
        ? 'Unser Büro befindet sich im Herzen von Berlin'
        : 'Our office is located in the heart of Berlin'
    },
    {
      icon: Clock,
      title: language === 'de' ? 'Flexible Arbeitszeiten' : 'Flexible Hours',
      description: language === 'de' 
        ? 'Arbeiten Sie, wann es für Sie am besten passt'
        : 'Work when it suits you best'
    },
    {
      icon: Users,
      title: language === 'de' ? 'Diverse Teams' : 'Diverse Teams',
      description: language === 'de' 
        ? 'Arbeiten Sie mit talentierten Menschen aus der ganzen Welt'
        : 'Work with talented people from around the world'
    },
    {
      icon: Heart,
      title: language === 'de' ? 'Work-Life Balance' : 'Work-Life Balance',
      description: language === 'de' 
        ? 'Wir fördern eine gesunde Work-Life-Balance'
        : 'We promote a healthy work-life balance'
    }
  ]

  return (
    <div className="min-h-screen bg-white">
      <Header />
      
      <main>
        {/* Hero Section */}
        <section className="bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 py-20">
          <div className="container-custom text-center">
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-6">
              {language === 'de' ? 'Karriere bei mietenow' : 'Careers at mietenow'}
            </h1>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              {language === 'de' 
                ? 'Werden Sie Teil unseres Teams und helfen Sie dabei, die Zukunft des Wohnens zu gestalten.'
                : 'Join our team and help shape the future of housing.'
              }
            </p>
          </div>
        </section>

        {/* Benefits Section */}
        <section className="py-16 bg-gray-50">
          <div className="container-custom">
            <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
              {language === 'de' ? 'Warum bei uns arbeiten?' : 'Why work with us?'}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {benefits.map((benefit, index) => (
                <div key={index} className="text-center">
                  <div className="w-16 h-16 bg-[#00BFA6] rounded-full flex items-center justify-center mx-auto mb-4">
                    <benefit.icon className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">{benefit.title}</h3>
                  <p className="text-gray-600">{benefit.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* No Open Positions */}
        <section className="py-16">
          <div className="container-custom text-center">
            <div className="max-w-2xl mx-auto">
              <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <Users className="w-10 h-10 text-gray-400" />
              </div>
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                {language === 'de' ? 'Aktuell keine offenen Stellen' : 'No open positions at the moment'}
              </h2>
              <p className="text-xl text-gray-600">
                {language === 'de' 
                  ? 'Wir haben derzeit keine offenen Stellen, aber schauen Sie gerne regelmäßig vorbei.'
                  : 'We currently have no open positions, but please check back regularly.'
                }
              </p>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}
