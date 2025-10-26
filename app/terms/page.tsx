'use client'

import Header from '@/components/Header'
import Footer from '@/components/Footer'
import { useTranslation } from '@/hooks/useTranslation'

export default function TermsPage() {
  const { t, language } = useTranslation()

  return (
    <div className="min-h-screen bg-white">
      <Header />
      
      <main>
        {/* Hero Section */}
        <section className="bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 py-16">
          <div className="container-custom text-center">
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-6">
              {language === 'de' ? 'Allgemeine Geschäftsbedingungen' : 'Terms of Service'}
            </h1>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              {language === 'de' 
                ? 'Die Nutzungsbedingungen für unsere Dienstleistungen bei mietenow.'
                : 'The terms of use for our services at mietenow.'
              }
            </p>
          </div>
        </section>

        {/* Content */}
        <section className="py-16">
          <div className="container-custom">
            <div className="max-w-4xl mx-auto prose prose-lg">
              <div className="bg-gray-50 rounded-xl p-8 mb-8">
                <p className="text-sm text-gray-600 mb-0">
                  {language === 'de' 
                    ? 'Letzte Aktualisierung: 15. März 2024'
                    : 'Last updated: March 15, 2024'
                  }
                </p>
              </div>

              <h2 className="text-2xl font-bold text-gray-900 mb-6">
                {language === 'de' ? '1. Geltungsbereich' : '1. Scope'}
              </h2>
              <p className="text-gray-600 mb-8">
                {language === 'de' 
                  ? 'Diese Allgemeinen Geschäftsbedingungen gelten für alle Dienstleistungen der mietenow GmbH. Mit der Nutzung unserer Plattform akzeptieren Sie diese Bedingungen.'
                  : 'These Terms of Service apply to all services of mietenow GmbH. By using our platform, you accept these terms.'
                }
              </p>

              <h2 className="text-2xl font-bold text-gray-900 mb-6">
                {language === 'de' ? '2. Dienstleistungen' : '2. Services'}
              </h2>
              <p className="text-gray-600 mb-4">
                {language === 'de' 
                  ? 'mietenow bietet folgende Dienstleistungen an:'
                  : 'mietenow offers the following services:'
                }
              </p>
              <ul className="list-disc pl-6 text-gray-600 mb-8">
                <li>{language === 'de' ? 'Automatisierte Suche nach Mietwohnungen' : 'Automated search for rental apartments'}</li>
                <li>{language === 'de' ? 'Echtzeit-Benachrichtigungen über neue Angebote' : 'Real-time notifications about new offers'}</li>
                <li>{language === 'de' ? 'Zusammenfassung von Immobilienanzeigen' : 'Summary of real estate listings'}</li>
                <li>{language === 'de' ? 'Unterstützung bei der Wohnungssuche' : 'Support in apartment hunting'}</li>
              </ul>

              <h2 className="text-2xl font-bold text-gray-900 mb-6">
                {language === 'de' ? '3. Nutzerkonto' : '3. User Account'}
              </h2>
              <p className="text-gray-600 mb-8">
                {language === 'de' 
                  ? 'Für die Nutzung unserer Dienstleistungen ist ein Nutzerkonto erforderlich. Sie sind verpflichtet, wahrheitsgemäße Angaben zu machen und Ihre Zugangsdaten sicher zu verwahren.'
                  : 'A user account is required to use our services. You are obligated to provide truthful information and keep your access data secure.'
                }
              </p>

              <h2 className="text-2xl font-bold text-gray-900 mb-6">
                {language === 'de' ? '4. Zahlungsbedingungen' : '4. Payment Terms'}
              </h2>
              <p className="text-gray-600 mb-4">
                {language === 'de' 
                  ? 'Unsere Dienstleistungen sind kostenpflichtig. Die Preise sind auf unserer Website angegeben und können sich ändern. Zahlungen sind im Voraus zu leisten.'
                  : 'Our services are subject to charges. Prices are indicated on our website and may change. Payments are to be made in advance.'
                }
              </p>
              <p className="text-gray-600 mb-8">
                {language === 'de' 
                  ? 'Sie können Ihr Abonnement jederzeit kündigen. Bereits geleistete Zahlungen werden nicht erstattet.'
                  : 'You can cancel your subscription at any time. Payments already made will not be refunded.'
                }
              </p>

              <h2 className="text-2xl font-bold text-gray-900 mb-6">
                {language === 'de' ? '5. Haftungsausschluss' : '5. Disclaimer'}
              </h2>
              <p className="text-gray-600 mb-8">
                {language === 'de' 
                  ? 'mietenow übernimmt keine Gewähr für die Richtigkeit, Vollständigkeit oder Aktualität der bereitgestellten Informationen. Wir sind nicht verantwortlich für den Erfolg Ihrer Wohnungssuche.'
                  : 'mietenow assumes no warranty for the accuracy, completeness or timeliness of the provided information. We are not responsible for the success of your apartment search.'
                }
              </p>

              <h2 className="text-2xl font-bold text-gray-900 mb-6">
                {language === 'de' ? '6. Datenschutz' : '6. Privacy'}
              </h2>
              <p className="text-gray-600 mb-8">
                {language === 'de' 
                  ? 'Der Schutz Ihrer persönlichen Daten ist uns wichtig. Details finden Sie in unserer Datenschutzerklärung.'
                  : 'The protection of your personal data is important to us. Details can be found in our privacy policy.'
                }
              </p>

              <h2 className="text-2xl font-bold text-gray-900 mb-6">
                {language === 'de' ? '7. Änderungen der Bedingungen' : '7. Changes to Terms'}
              </h2>
              <p className="text-gray-600 mb-8">
                {language === 'de' 
                  ? 'Wir behalten uns das Recht vor, diese Bedingungen jederzeit zu ändern. Änderungen werden auf unserer Website veröffentlicht und treten sofort in Kraft.'
                  : 'We reserve the right to change these terms at any time. Changes will be published on our website and take effect immediately.'
                }
              </p>

              <h2 className="text-2xl font-bold text-gray-900 mb-6">
                {language === 'de' ? '8. Anwendbares Recht' : '8. Applicable Law'}
              </h2>
              <p className="text-gray-600 mb-8">
                {language === 'de' 
                  ? 'Es gilt deutsches Recht. Gerichtsstand ist Berlin, soweit gesetzlich zulässig.'
                  : 'German law applies. The place of jurisdiction is Berlin, insofar as legally permissible.'
                }
              </p>

              <h2 className="text-2xl font-bold text-gray-900 mb-6">
                {language === 'de' ? '9. Kontakt' : '9. Contact'}
              </h2>
              <p className="text-gray-600 mb-8">
                {language === 'de' 
                  ? 'Bei Fragen zu diesen Bedingungen kontaktieren Sie uns unter legal@mietenow.de.'
                  : 'For questions about these terms, contact us at legal@mietenow.de.'
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
