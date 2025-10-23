'use client'

export const dynamic = 'force-dynamic'

import Header from '@/components/Header'
import Footer from '@/components/Footer'
import { Users, Heart, Share2, MessageCircle, Calendar } from 'lucide-react'
import { useTranslation } from '@/hooks/useTranslation'

export default function CommunityPage() {
  const { t, language } = useTranslation()

  const communityStats = [
    {
      number: '2,500+',
      label: language === 'de' ? 'Aktive Mitglieder' : 'Active Members',
      icon: Users
    },
    {
      number: '15,000+',
      label: language === 'de' ? 'Erfolgreiche Vermittlungen' : 'Successful Placements',
      icon: Heart
    },
    {
      number: '500+',
      label: language === 'de' ? 'Tipps geteilt' : 'Tips Shared',
      icon: Share2
    }
  ]


  const communityFeatures = [
    {
      title: language === 'de' ? 'Forum & Diskussionen' : 'Forum & Discussions',
      description: language === 'de'
        ? 'Tausche dich mit anderen über Wohnungssuche, Berliner Leben und mehr aus.'
        : 'Exchange ideas with others about apartment hunting, Berlin life and more.',
      icon: MessageCircle
    },
    {
      title: language === 'de' ? 'Lokale Events' : 'Local Events',
      description: language === 'de'
        ? 'Nimm an Workshops, Networking-Events und Wohnungssuche-Treffen teil.'
        : 'Participate in workshops, networking events and apartment hunting meetups.',
      icon: Calendar
    },
    {
      title: language === 'de' ? 'Tipps & Tricks' : 'Tips & Tricks',
      description: language === 'de'
        ? 'Teile und entdecke bewährte Strategien für die erfolgreiche Wohnungssuche.'
        : 'Share and discover proven strategies for successful apartment hunting.',
      icon: Share2
    },
    {
      title: language === 'de' ? 'Mentoring' : 'Mentoring',
      description: language === 'de'
        ? 'Erfahrene Mitglieder helfen Neulingen bei der Wohnungssuche.'
        : 'Experienced members help newcomers with apartment hunting.',
      icon: Users
    }
  ]

  return (
    <div className="min-h-screen">
      <Header />
      
      <main className="min-h-screen">
        {/* Hero Section */}
        <section className="bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 py-20">
          <div className="container-custom">
            <div className="text-center max-w-4xl mx-auto">
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6">
                {language === 'de' ? 'MieteNow Community' : 'MieteNow Community'}
              </h1>
              <p className="text-xl text-gray-300 mb-8">
                {language === 'de' 
                  ? 'Vernetze dich mit anderen Wohnungssuchenden, teile Erfahrungen und finde gemeinsam deine Traumwohnung'
                  : 'Connect with other apartment hunters, share experiences and find your dream apartment together'
                }
              </p>
            </div>
          </div>
        </section>

        {/* Community Stats */}
        <section className="py-20 bg-white">
          <div className="container-custom">
            <div className="max-w-6xl mx-auto">
              <h2 className="text-3xl font-bold text-gray-900 mb-12 text-center">
                {language === 'de' ? 'Unsere Community in Zahlen' : 'Our Community in Numbers'}
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {communityStats.map((stat, index) => (
                  <div key={index} className="text-center">
                    <div className="bg-blue-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                      <stat.icon className="w-8 h-8 text-blue-600" />
                    </div>
                    <div className="text-3xl font-bold text-gray-900 mb-2">{stat.number}</div>
                    <div className="text-gray-600">{stat.label}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Community Features */}
        <section className="py-20 bg-gray-50">
          <div className="container-custom">
            <div className="max-w-6xl mx-auto">
              <h2 className="text-3xl font-bold text-gray-900 mb-12 text-center">
                {language === 'de' ? 'Was du in der Community findest' : 'What you find in the Community'}
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                {communityFeatures.map((feature, index) => (
                  <div key={index} className="bg-white rounded-xl p-6 shadow-lg text-center">
                    <feature.icon className="w-12 h-12 text-blue-600 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold text-gray-900 mb-3">{feature.title}</h3>
                    <p className="text-gray-600">{feature.description}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Team Photo */}
        <section className="py-20 bg-white">
          <div className="container-custom">
            <div className="max-w-4xl mx-auto text-center">
              <h2 className="text-3xl font-bold text-gray-900 mb-8">
                {language === 'de' ? 'Unser Team' : 'Our Team'}
              </h2>
              <div className="rounded-2xl overflow-hidden shadow-2xl">
                <img
                  src="/Logos/Team1_optimized.jpg"
                  alt={language === 'de' ? 'Unser Team' : 'Our team'}
                  className="w-full h-auto object-cover"
                />
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}
