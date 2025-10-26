'use client'

import Header from '@/components/Header'
import Footer from '@/components/Footer'
import { useTranslation } from '@/hooks/useTranslation'

export default function CookiesPage() {
  const { t, language } = useTranslation()

  return (
    <div className="min-h-screen bg-white">
      <Header />
      
      <main>
        {/* Hero Section */}
        <section className="bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 py-16">
          <div className="container-custom text-center">
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-6">
              {language === 'de' ? 'Cookie-Richtlinie' : 'Cookie Policy'}
            </h1>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              {language === 'de' 
                ? 'Informationen über die Verwendung von Cookies auf unserer Website.'
                : 'Information about the use of cookies on our website.'
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
                {language === 'de' ? 'Was sind Cookies?' : 'What are cookies?'}
              </h2>
              <p className="text-gray-600 mb-8">
                {language === 'de' 
                  ? 'Cookies sind kleine Textdateien, die auf Ihrem Gerät gespeichert werden, wenn Sie unsere Website besuchen. Sie helfen uns dabei, Ihre Präferenzen zu speichern und die Website zu verbessern.'
                  : 'Cookies are small text files that are stored on your device when you visit our website. They help us save your preferences and improve the website.'
                }
              </p>

              <h2 className="text-2xl font-bold text-gray-900 mb-6">
                {language === 'de' ? 'Arten von Cookies' : 'Types of cookies'}
              </h2>
              
              <h3 className="text-xl font-semibold text-gray-900 mb-4">
                {language === 'de' ? 'Notwendige Cookies' : 'Essential cookies'}
              </h3>
              <p className="text-gray-600 mb-6">
                {language === 'de' 
                  ? 'Diese Cookies sind für das Funktionieren der Website unerlässlich. Sie ermöglichen grundlegende Funktionen wie Navigation und Zugriff auf sichere Bereiche der Website.'
                  : 'These cookies are essential for the functioning of the website. They enable basic functions such as navigation and access to secure areas of the website.'
                }
              </p>

              <h3 className="text-xl font-semibold text-gray-900 mb-4">
                {language === 'de' ? 'Funktionale Cookies' : 'Functional cookies'}
              </h3>
              <p className="text-gray-600 mb-6">
                {language === 'de' 
                  ? 'Diese Cookies ermöglichen es der Website, sich an Ihre Entscheidungen zu erinnern und verbesserte, personalisierte Funktionen bereitzustellen.'
                  : 'These cookies allow the website to remember your choices and provide enhanced, personalized features.'
                }
              </p>

              <h3 className="text-xl font-semibold text-gray-900 mb-4">
                {language === 'de' ? 'Analytische Cookies' : 'Analytical cookies'}
              </h3>
              <p className="text-gray-600 mb-8">
                {language === 'de' 
                  ? 'Diese Cookies helfen uns zu verstehen, wie Besucher mit der Website interagieren, indem sie Informationen anonym sammeln und melden.'
                  : 'These cookies help us understand how visitors interact with the website by collecting and reporting information anonymously.'
                }
              </p>

              <h2 className="text-2xl font-bold text-gray-900 mb-6">
                {language === 'de' ? 'Verwendete Cookies' : 'Cookies used'}
              </h2>
              <div className="overflow-x-auto mb-8">
                <table className="w-full border-collapse border border-gray-300">
                  <thead>
                    <tr className="bg-gray-50">
                      <th className="border border-gray-300 px-4 py-2 text-left font-semibold">
                        {language === 'de' ? 'Cookie-Name' : 'Cookie name'}
                      </th>
                      <th className="border border-gray-300 px-4 py-2 text-left font-semibold">
                        {language === 'de' ? 'Zweck' : 'Purpose'}
                      </th>
                      <th className="border border-gray-300 px-4 py-2 text-left font-semibold">
                        {language === 'de' ? 'Gültigkeitsdauer' : 'Duration'}
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td className="border border-gray-300 px-4 py-2">session_id</td>
                      <td className="border border-gray-300 px-4 py-2">
                        {language === 'de' ? 'Sitzungsverwaltung' : 'Session management'}
                      </td>
                      <td className="border border-gray-300 px-4 py-2">
                        {language === 'de' ? 'Bis zum Schließen des Browsers' : 'Until browser closes'}
                      </td>
                    </tr>
                    <tr>
                      <td className="border border-gray-300 px-4 py-2">user_preferences</td>
                      <td className="border border-gray-300 px-4 py-2">
                        {language === 'de' ? 'Speicherung von Benutzereinstellungen' : 'Storage of user settings'}
                      </td>
                      <td className="border border-gray-300 px-4 py-2">1 Jahr</td>
                    </tr>
                    <tr>
                      <td className="border border-gray-300 px-4 py-2">analytics_id</td>
                      <td className="border border-gray-300 px-4 py-2">
                        {language === 'de' ? 'Website-Analyse' : 'Website analytics'}
                      </td>
                      <td className="border border-gray-300 px-4 py-2">2 Jahre</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <h2 className="text-2xl font-bold text-gray-900 mb-6">
                {language === 'de' ? 'Cookie-Einstellungen verwalten' : 'Manage cookie settings'}
              </h2>
              <p className="text-gray-600 mb-4">
                {language === 'de' 
                  ? 'Sie können Ihre Cookie-Einstellungen jederzeit ändern:'
                  : 'You can change your cookie settings at any time:'
                }
              </p>
              <ul className="list-disc pl-6 text-gray-600 mb-8">
                <li>{language === 'de' ? 'Über die Einstellungen Ihres Browsers' : 'Through your browser settings'}</li>
                <li>{language === 'de' ? 'Über unser Cookie-Banner auf der Website' : 'Through our cookie banner on the website'}</li>
                <li>{language === 'de' ? 'Durch Kontaktaufnahme mit uns' : 'By contacting us'}</li>
              </ul>

              <h2 className="text-2xl font-bold text-gray-900 mb-6">
                {language === 'de' ? 'Browser-Einstellungen' : 'Browser settings'}
              </h2>
              <p className="text-gray-600 mb-4">
                {language === 'de' 
                  ? 'Die meisten Browser ermöglichen es Ihnen, Cookies zu verwalten:'
                  : 'Most browsers allow you to manage cookies:'
                }
              </p>
              <ul className="list-disc pl-6 text-gray-600 mb-8">
                <li>{language === 'de' ? 'Chrome: Einstellungen > Datenschutz und Sicherheit > Cookies' : 'Chrome: Settings > Privacy and security > Cookies'}</li>
                <li>{language === 'de' ? 'Firefox: Einstellungen > Datenschutz & Sicherheit > Cookies' : 'Firefox: Settings > Privacy & Security > Cookies'}</li>
                <li>{language === 'de' ? 'Safari: Einstellungen > Datenschutz > Cookies verwalten' : 'Safari: Settings > Privacy > Manage cookies'}</li>
                <li>{language === 'de' ? 'Edge: Einstellungen > Cookies und Websiteberechtigungen' : 'Edge: Settings > Cookies and site permissions'}</li>
              </ul>

              <h2 className="text-2xl font-bold text-gray-900 mb-6">
                {language === 'de' ? 'Auswirkungen der Deaktivierung' : 'Effects of disabling'}
              </h2>
              <p className="text-gray-600 mb-8">
                {language === 'de' 
                  ? 'Wenn Sie Cookies deaktivieren, können einige Funktionen der Website möglicherweise nicht ordnungsgemäß funktionieren. Notwendige Cookies können jedoch nicht deaktiviert werden, da sie für das Funktionieren der Website erforderlich sind.'
                  : 'If you disable cookies, some website functions may not work properly. However, essential cookies cannot be disabled as they are required for the website to function.'
                }
              </p>

              <h2 className="text-2xl font-bold text-gray-900 mb-6">
                {language === 'de' ? 'Kontakt' : 'Contact'}
              </h2>
              <p className="text-gray-600 mb-8">
                {language === 'de' 
                  ? 'Bei Fragen zu unserer Cookie-Richtlinie kontaktieren Sie uns unter privacy@mietenow.de.'
                  : 'For questions about our cookie policy, contact us at privacy@mietenow.de.'
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
