'use client'

export const dynamic = 'force-dynamic'

import Header from '@/components/Header'
import Footer from '@/components/Footer'
import { useTranslation } from '@/hooks/useTranslation'

export default function TermsPage() {
  const { t, language } = useTranslation()

  return (
    <div className="min-h-screen">
      <Header />
      
      <main className="min-h-screen">
        {/* Hero Section */}
        <section className="bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 py-20">
          <div className="container-custom">
            <div className="text-center max-w-4xl mx-auto">
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6">
                {language === 'de' ? 'Allgemeine Geschäftsbedingungen' : 'Terms and Conditions'}
              </h1>
              <p className="text-xl text-gray-300 mb-8">
                {language === 'de' 
                  ? 'AGB für die Nutzung von MieteNow'
                  : 'Terms and conditions for using MieteNow'
                }
              </p>
            </div>
          </div>
        </section>

        {/* Content */}
        <section className="py-20 bg-white">
          <div className="container-custom">
            <div className="max-w-4xl mx-auto">
              <div className="bg-white rounded-xl shadow-lg p-8">
                <div className="prose prose-lg max-w-none">
                  <h2 className="text-2xl font-bold text-gray-900 mb-6">
                    {language === 'de' ? '§ 1 Geltungsbereich' : '§ 1 Scope of Application'}
                  </h2>
                  
                  <div className="space-y-4 text-gray-700">
                    <p>{language === 'de' 
                      ? 'Diese Allgemeinen Geschäftsbedingungen (nachfolgend "AGB") der MieteNow GmbH (nachfolgend "Anbieter") gelten für alle Verträge zwischen dem Anbieter und dem Nutzer (nachfolgend "Kunde") über die Nutzung der Plattform MieteNow.'
                      : 'These General Terms and Conditions (hereinafter "GTC") of MieteNow GmbH (hereinafter "Provider") apply to all contracts between the provider and the user (hereinafter "Customer") for the use of the MieteNow platform.'
                    }</p>
                  </div>

                  <h2 className="text-2xl font-bold text-gray-900 mb-6 mt-8">
                    {language === 'de' ? '§ 2 Leistungen' : '§ 2 Services'}
                  </h2>
                  
                  <div className="space-y-4 text-gray-700">
                    <p>{language === 'de' 
                      ? 'MieteNow ist eine Online-Plattform, die Nutzern bei der Suche nach Wohnungen in Berlin hilft. Die Plattform bietet verschiedene Suchfunktionen, Benachrichtigungen und Kommunikationsmöglichkeiten zwischen Mietern und Vermietern.'
                      : 'MieteNow is an online platform that helps users search for apartments in Berlin. The platform offers various search functions, notifications and communication options between tenants and landlords.'
                    }</p>
                  </div>

                  <h2 className="text-2xl font-bold text-gray-900 mb-6 mt-8">
                    {language === 'de' ? '§ 3 Registrierung und Nutzerkonto' : '§ 3 Registration and User Account'}
                  </h2>
                  
                  <div className="space-y-4 text-gray-700">
                    <p>{language === 'de' 
                      ? 'Für die Nutzung der Plattform ist eine Registrierung erforderlich. Der Nutzer verpflichtet sich, wahrheitsgemäße und vollständige Angaben zu machen. Der Nutzer ist verantwortlich für die Sicherheit seines Passworts und die Vertraulichkeit seines Kontos.'
                      : 'Registration is required to use the platform. The user undertakes to provide truthful and complete information. The user is responsible for the security of their password and the confidentiality of their account.'
                    }</p>
                  </div>

                  <h2 className="text-2xl font-bold text-gray-900 mb-6 mt-8">
                    {language === 'de' ? '§ 4 Zahlungsbedingungen' : '§ 4 Payment Terms'}
                  </h2>
                  
                  <div className="space-y-4 text-gray-700">
                    <p>{language === 'de' 
                      ? 'Die Nutzung der Grundfunktionen der Plattform ist kostenlos. Für erweiterte Funktionen gelten die jeweils aktuellen Preise. Alle Preise verstehen sich inklusive der gesetzlichen Mehrwertsteuer.'
                      : 'The use of the basic functions of the platform is free of charge. For extended functions, the current prices apply. All prices are including statutory VAT.'
                    }</p>
                  </div>

                  <h2 className="text-2xl font-bold text-gray-900 mb-6 mt-8">
                    {language === 'de' ? '§ 5 Haftung' : '§ 5 Liability'}
                  </h2>
                  
                  <div className="space-y-4 text-gray-700">
                    <p>{language === 'de' 
                      ? 'Der Anbieter haftet nicht für die Richtigkeit, Vollständigkeit oder Aktualität der auf der Plattform veröffentlichten Wohnungsanzeigen. Die Haftung für Schäden ist auf Vorsatz und grobe Fahrlässigkeit beschränkt.'
                      : 'The provider is not liable for the accuracy, completeness or timeliness of the apartment listings published on the platform. Liability for damages is limited to intent and gross negligence.'
                    }</p>
                  </div>

                  <h2 className="text-2xl font-bold text-gray-900 mb-6 mt-8">
                    {language === 'de' ? '§ 6 Datenschutz' : '§ 6 Data Protection'}
                  </h2>
                  
                  <div className="space-y-4 text-gray-700">
                    <p>{language === 'de' 
                      ? 'Die Erhebung und Verarbeitung personenbezogener Daten erfolgt gemäß der Datenschutzerklärung des Anbieters, die Bestandteil dieser AGB ist.'
                      : 'The collection and processing of personal data is carried out in accordance with the provider\'s privacy policy, which is part of these GTC.'
                    }</p>
                  </div>

                  <h2 className="text-2xl font-bold text-gray-900 mb-6 mt-8">
                    {language === 'de' ? '§ 7 Kündigung' : '§ 7 Termination'}
                  </h2>
                  
                  <div className="space-y-4 text-gray-700">
                    <p>{language === 'de' 
                      ? 'Beide Parteien können das Nutzungsverhältnis jederzeit mit einer Frist von 14 Tagen zum Monatsende kündigen. Das Recht zur fristlosen Kündigung aus wichtigem Grund bleibt unberührt.'
                      : 'Both parties can terminate the usage relationship at any time with a notice period of 14 days to the end of the month. The right to terminate without notice for important reasons remains unaffected.'
                    }</p>
                  </div>

                  <h2 className="text-2xl font-bold text-gray-900 mb-6 mt-8">
                    {language === 'de' ? '§ 8 Schlussbestimmungen' : '§ 8 Final Provisions'}
                  </h2>
                  
                  <div className="space-y-4 text-gray-700">
                    <p>{language === 'de' 
                      ? 'Sollten einzelne Bestimmungen dieser AGB unwirksam sein oder werden, bleibt die Wirksamkeit der übrigen Bestimmungen unberührt. Es gilt das Recht der Bundesrepublik Deutschland.'
                      : 'Should individual provisions of these GTC be or become invalid, the validity of the remaining provisions remains unaffected. The law of the Federal Republic of Germany applies.'
                    }</p>
                  </div>

                  <div className="mt-8 p-4 bg-gray-100 rounded-lg">
                    <p className="text-sm text-gray-600">
                      {language === 'de' 
                        ? 'Stand: Januar 2024'
                        : 'Status: January 2024'
                      }
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}
