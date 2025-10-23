'use client'

export const dynamic = 'force-dynamic'

import Header from '@/components/Header'
import Footer from '@/components/Footer'
import { useTranslation } from '@/hooks/useTranslation'

export default function ImpressumPage() {
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
                {language === 'de' ? 'Impressum' : 'Imprint'}
              </h1>
              <p className="text-xl text-gray-300 mb-8">
                {language === 'de' 
                  ? 'Angaben gemäß § 5 TMG'
                  : 'Information according to § 5 TMG'
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
                    {language === 'de' ? 'Anbieter' : 'Provider'}
                  </h2>
                  
                  <div className="space-y-4 text-gray-700">
                    <p><strong>MieteNow GmbH</strong></p>
                    <p>Potsdamer Platz 1<br />
                    10785 Berlin<br />
                    Deutschland</p>
                    
                    <p><strong>Geschäftsführung:</strong><br />
                    Dr. Sarah Müller<br />
                    Tom Schmidt</p>
                    
                    <p><strong>Handelsregister:</strong><br />
                    Amtsgericht Charlottenburg<br />
                    HRB 247891 B</p>
                    
                    <p><strong>Umsatzsteuer-ID:</strong><br />
                    DE342567891</p>
                  </div>

                  <h2 className="text-2xl font-bold text-gray-900 mb-6 mt-8">
                    {language === 'de' ? 'Kontakt' : 'Contact'}
                  </h2>
                  
                  <div className="space-y-4 text-gray-700">
                    <p><strong>Telefon:</strong> +49 30 847 293 65</p>
                    <p><strong>E-Mail:</strong> hello@mietenow.de</p>
                    <p><strong>Website:</strong> www.mietenow.de</p>
                  </div>

                  <h2 className="text-2xl font-bold text-gray-900 mb-6 mt-8">
                    {language === 'de' ? 'Verantwortlich für den Inhalt' : 'Responsible for Content'}
                  </h2>
                  
                  <div className="space-y-4 text-gray-700">
                    <p>Dr. Sarah Müller<br />
                    MieteNow GmbH<br />
                    Potsdamer Platz 1<br />
                    10785 Berlin</p>
                  </div>

                  <h2 className="text-2xl font-bold text-gray-900 mb-6 mt-8">
                    {language === 'de' ? 'Streitschlichtung' : 'Dispute Resolution'}
                  </h2>
                  
                  <div className="space-y-4 text-gray-700">
                    <p>{language === 'de' 
                      ? 'Die Europäische Kommission stellt eine Plattform zur Online-Streitbeilegung (OS) bereit: https://ec.europa.eu/consumers/odr/'
                      : 'The European Commission provides a platform for online dispute resolution (OS): https://ec.europa.eu/consumers/odr/'
                    }</p>
                    
                    <p>{language === 'de' 
                      ? 'Unsere E-Mail-Adresse finden Sie oben im Impressum.'
                      : 'You can find our email address above in the imprint.'
                    }</p>
                    
                    <p>{language === 'de' 
                      ? 'Wir sind nicht bereit oder verpflichtet, an Streitbeilegungsverfahren vor einer Verbraucherschlichtungsstelle teilzunehmen.'
                      : 'We are not willing or obligated to participate in dispute resolution procedures before a consumer arbitration board.'
                    }</p>
                  </div>

                  <h2 className="text-2xl font-bold text-gray-900 mb-6 mt-8">
                    {language === 'de' ? 'Haftung für Inhalte' : 'Liability for Content'}
                  </h2>
                  
                  <div className="space-y-4 text-gray-700">
                    <p>{language === 'de' 
                      ? 'Als Diensteanbieter sind wir gemäß § 7 Abs.1 TMG für eigene Inhalte auf diesen Seiten nach den allgemeinen Gesetzen verantwortlich. Nach §§ 8 bis 10 TMG sind wir als Diensteanbieter jedoch nicht unter der Verpflichtung, übermittelte oder gespeicherte fremde Informationen zu überwachen oder nach Umständen zu forschen, die auf eine rechtswidrige Tätigkeit hinweisen.'
                      : 'As a service provider, we are responsible for our own content on these pages according to general laws pursuant to § 7 para. 1 TMG. However, according to §§ 8 to 10 TMG, we as service providers are not under obligation to monitor transmitted or stored external information or to investigate circumstances that indicate illegal activity.'
                    }</p>
                  </div>

                  <h2 className="text-2xl font-bold text-gray-900 mb-6 mt-8">
                    {language === 'de' ? 'Haftung für Links' : 'Liability for Links'}
                  </h2>
                  
                  <div className="space-y-4 text-gray-700">
                    <p>{language === 'de' 
                      ? 'Unser Angebot enthält Links zu externen Websites Dritter, auf deren Inhalte wir keinen Einfluss haben. Deshalb können wir für diese fremden Inhalte auch keine Gewähr übernehmen. Für die Inhalte der verlinkten Seiten ist stets der jeweilige Anbieter oder Betreiber der Seiten verantwortlich.'
                      : 'Our offer contains links to external websites of third parties, on whose contents we have no influence. Therefore, we cannot assume any liability for these external contents. The respective provider or operator of the pages is always responsible for the contents of the linked pages.'
                    }</p>
                  </div>

                  <h2 className="text-2xl font-bold text-gray-900 mb-6 mt-8">
                    {language === 'de' ? 'Urheberrecht' : 'Copyright'}
                  </h2>
                  
                  <div className="space-y-4 text-gray-700">
                    <p>{language === 'de' 
                      ? 'Die durch die Seitenbetreiber erstellten Inhalte und Werke auf diesen Seiten unterliegen dem deutschen Urheberrecht. Die Vervielfältigung, Bearbeitung, Verbreitung und jede Art der Verwertung außerhalb der Grenzen des Urheberrechtes bedürfen der schriftlichen Zustimmung des jeweiligen Autors bzw. Erstellers.'
                      : 'The content and works created by the site operators on these pages are subject to German copyright law. The reproduction, editing, distribution and any kind of exploitation outside the limits of copyright require the written consent of the respective author or creator.'
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
