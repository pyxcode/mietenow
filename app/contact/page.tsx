'use client'

export const dynamic = 'force-dynamic'

import Header from '@/components/Header'
import Footer from '@/components/Footer'
import { Mail, Phone, MapPin, MessageCircle, Clock, Users } from 'lucide-react'
import { useTranslation } from '@/hooks/useTranslation'

export default function ContactPage() {
  const { t, language } = useTranslation()

  const contactMethods = [
    {
      icon: MessageCircle,
      title: language === 'de' ? 'Live-Chat' : 'Live Chat',
      description: language === 'de' 
        ? 'Sofortige Hilfe von unserem Support-Team'
        : 'Instant help from our support team',
      action: language === 'de' ? 'Chat starten' : 'Start Chat',
      availability: language === 'de' ? '24/7 verfügbar' : 'Available 24/7',
      color: 'blue',
      isCrisp: true
    }
  ]

  const teamMembers = [
    {
      name: 'Sarah Müller',
      role: language === 'de' ? 'Kundensupport' : 'Customer Support',
      email: 'sarah.mueller@mietenow.de',
      phone: '+49 30 123 456 78',
      speciality: language === 'de' ? 'Wohnungssuche & Technische Fragen' : 'Apartment Search & Technical Questions'
    },
    {
      name: 'Tom Schmidt',
      role: language === 'de' ? 'Account Manager' : 'Account Manager',
      email: 'tom.schmidt@mietenow.de',
      phone: '+49 30 123 456 79',
      speciality: language === 'de' ? 'Premium-Kunden & Business' : 'Premium Customers & Business'
    },
    {
      name: 'Maria Rodriguez',
      role: language === 'de' ? 'Support-Spezialistin' : 'Support Specialist',
      email: 'maria.rodriguez@mietenow.de',
      phone: '+49 30 123 456 80',
      speciality: language === 'de' ? 'Internationale Kunden' : 'International Customers'
    }
  ]

  const faqItems = [
    {
      question: language === 'de' 
        ? 'Wie schnell erhalte ich eine Antwort?' 
        : 'How quickly will I receive a response?',
      answer: language === 'de'
        ? 'Unser Live-Chat ist 24/7 verfügbar und du erhältst sofort eine Antwort. E-Mails beantworten wir normalerweise innerhalb von 24 Stunden, oft sogar schneller.'
        : 'Our live chat is available 24/7 and you get an instant response. We usually respond to emails within 24 hours, often even faster.'
    },
    {
      question: language === 'de'
        ? 'Kann ich auch außerhalb der Geschäftszeiten Hilfe bekommen?'
        : 'Can I get help outside business hours?',
      answer: language === 'de'
        ? 'Ja! Unser Live-Chat ist rund um die Uhr verfügbar. Für dringende technische Probleme haben wir auch einen Notfall-Support.'
        : 'Yes! Our live chat is available around the clock. For urgent technical issues, we also have emergency support.'
    },
    {
      question: language === 'de'
        ? 'Welche Sprachen werden unterstützt?'
        : 'What languages are supported?',
      answer: language === 'de'
        ? 'Wir unterstützen Deutsch, Englisch, Spanisch und Französisch. Unser internationales Team hilft dir gerne in deiner bevorzugten Sprache.'
        : 'We support German, English, Spanish and French. Our international team is happy to help you in your preferred language.'
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
                {language === 'de' ? 'Kontakt' : 'Contact'}
              </h1>
              <p className="text-xl text-gray-300 mb-8">
                {language === 'de' 
                  ? 'Wir sind hier, um dir zu helfen. Kontaktiere uns über den für dich bequemsten Weg.'
                  : 'We are here to help you. Contact us in the way that is most convenient for you.'
                }
              </p>
            </div>
          </div>
        </section>

        {/* Contact Methods */}
        <section className="py-20 bg-white">
          <div className="container-custom">
            <div className="max-w-6xl mx-auto">
              <h2 className="text-3xl font-bold text-gray-900 mb-12 text-center">
                {language === 'de' ? 'Kontaktmöglichkeiten' : 'Contact Options'}
              </h2>
              
              <div className="max-w-md mx-auto">
                {contactMethods.map((method, index) => (
                  <div key={index} className={`bg-${method.color}-50 rounded-xl p-8 text-center hover:shadow-lg transition-shadow`}>
                    <method.icon className={`w-12 h-12 text-${method.color}-600 mx-auto mb-4`} />
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">{method.title}</h3>
                    <p className="text-gray-600 mb-4">{method.description}</p>
                    <div className="mb-4">
                      <span className={`inline-block bg-${method.color}-100 text-${method.color}-800 px-3 py-1 rounded-full text-sm font-medium`}>
                        {method.availability}
                      </span>
                    </div>
                    <button 
                      onClick={() => {
                        if (method.isCrisp) {
                          // Ouvrir Crisp chat
                          if (typeof window !== 'undefined' && (window as any).$crisp) {
                            (window as any).$crisp.push(['do', 'chat:open'])
                          } else {
                            // Fallback si Crisp n'est pas chargé
                            alert(language === 'de' ? 'Chat wird geöffnet...' : 'Opening chat...')
                          }
                        }
                      }}
                      className={`bg-${method.color}-600 text-white px-6 py-3 rounded-lg hover:bg-${method.color}-700 transition-colors w-full`}
                    >
                      {method.action}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Team Section */}
        <section className="py-20 bg-gray-50">
          <div className="container-custom">
            <div className="max-w-6xl mx-auto">
              <h2 className="text-3xl font-bold text-gray-900 mb-12 text-center">
                {language === 'de' ? 'Unser Team' : 'Our Team'}
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {teamMembers.map((member, index) => (
                  <div key={index} className="bg-white rounded-xl p-6 shadow-lg text-center">
                    <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Users className="w-8 h-8 text-blue-600" />
                    </div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-1">{member.name}</h3>
                    <p className="text-blue-600 font-medium mb-2">{member.role}</p>
                    <p className="text-gray-600 text-sm mb-4">{member.speciality}</p>
                    <div className="space-y-2">
                      <a href={`mailto:${member.email}`} className="flex items-center justify-center gap-2 text-blue-600 hover:text-blue-700 text-sm">
                        <Mail className="w-4 h-4" />
                        {member.email}
                      </a>
                      <a href={`tel:${member.phone}`} className="flex items-center justify-center gap-2 text-blue-600 hover:text-blue-700 text-sm">
                        <Phone className="w-4 h-4" />
                        {member.phone}
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Office Info */}
        <section className="py-20 bg-white">
          <div className="container-custom">
            <div className="max-w-4xl mx-auto">
              <div className="bg-gradient-to-r from-blue-600 to-blue-800 rounded-2xl p-8 text-white">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div>
                    <h3 className="text-2xl font-bold mb-4">
                      {language === 'de' ? 'Unser Büro' : 'Our Office'}
                    </h3>
                    <div className="space-y-3">
                      <div className="flex items-center gap-3">
                        <MapPin className="w-5 h-5" />
                        <span>Potsdamer Platz 1, 10785 Berlin</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <Clock className="w-5 h-5" />
                        <span>{language === 'de' ? 'Mo-Fr 9:00-18:00' : 'Mon-Fri 9:00-18:00'}</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <Phone className="w-5 h-5" />
                        <span>+49 30 123 456 78</span>
                      </div>
                    </div>
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold mb-4">
                      {language === 'de' ? 'Besuche uns' : 'Visit us'}
                    </h3>
                    <p className="text-blue-100 mb-4">
                      {language === 'de' 
                        ? 'Du bist herzlich eingeladen, uns in unserem Berliner Büro zu besuchen. Vereinbare einfach einen Termin mit uns.'
                        : 'You are cordially invited to visit us in our Berlin office. Simply schedule an appointment with us.'
                      }
                    </p>
                    <button className="bg-white text-blue-600 px-6 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors">
                      {language === 'de' ? 'Termin vereinbaren' : 'Schedule Appointment'}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section className="py-20 bg-gray-50">
          <div className="container-custom">
            <div className="max-w-4xl mx-auto">
              <h2 className="text-3xl font-bold text-gray-900 mb-12 text-center">
                {language === 'de' ? 'Häufige Fragen' : 'Frequently Asked Questions'}
              </h2>
              
              <div className="space-y-6">
                {faqItems.map((item, index) => (
                  <div key={index} className="bg-white rounded-xl p-6 shadow-lg">
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">{item.question}</h3>
                    <p className="text-gray-600">{item.answer}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}
