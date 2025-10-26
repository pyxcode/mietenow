'use client'

import Header from '@/components/Header'
import Footer from '@/components/Footer'
import { useTranslation } from '@/hooks/useTranslation'

export default function PrivacyPage() {
  const { t, language } = useTranslation()

  return (
    <div className="min-h-screen bg-white">
      <Header />
      
      <main>
        {/* Hero Section */}
        <section className="bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 py-16">
          <div className="container-custom text-center">
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-6">
              {language === 'de' ? 'Datenschutzerklärung' : 'Privacy Policy'}
            </h1>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              {language === 'de' 
                ? 'Informationen zum Schutz Ihrer persönlichen Daten bei mietenow.'
                : 'Information about the protection of your personal data at mietenow.'
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
                {language === 'de' ? '1. Verantwortlicher' : '1. Controller'}
              </h2>
              <p className="text-gray-600 mb-8">
                {language === 'de' 
                  ? 'Verantwortlicher für die Datenverarbeitung auf dieser Website ist mietenow GmbH, Friedrichstraße 123, 10117 Berlin, Deutschland. E-Mail: privacy@mietenow.de'
                  : 'The controller for data processing on this website is mietenow GmbH, Friedrichstraße 123, 10117 Berlin, Germany. Email: privacy@mietenow.de'
                }
              </p>

              <h2 className="text-2xl font-bold text-gray-900 mb-6">
                {language === 'de' ? '2. Erhebung und Verwendung von Daten' : '2. Collection and Use of Data'}
              </h2>
              <p className="text-gray-600 mb-4">
                {language === 'de' 
                  ? 'Wir erheben und verarbeiten personenbezogene Daten nur, soweit dies für die Bereitstellung unserer Dienstleistungen erforderlich ist:'
                  : 'We collect and process personal data only to the extent necessary for providing our services:'
                }
              </p>
              <ul className="list-disc pl-6 text-gray-600 mb-8">
                <li>{language === 'de' ? 'Kontaktdaten (Name, E-Mail-Adresse)' : 'Contact data (name, email address)'}</li>
                <li>{language === 'de' ? 'Suchkriterien und Präferenzen' : 'Search criteria and preferences'}</li>
                <li>{language === 'de' ? 'Nutzungsdaten zur Verbesserung unserer Services' : 'Usage data to improve our services'}</li>
                <li>{language === 'de' ? 'Zahlungsdaten (verschlüsselt verarbeitet)' : 'Payment data (processed encrypted)'}</li>
              </ul>

              <h2 className="text-2xl font-bold text-gray-900 mb-6">
                {language === 'de' ? '3. Rechtsgrundlage' : '3. Legal Basis'}
              </h2>
              <p className="text-gray-600 mb-8">
                {language === 'de' 
                  ? 'Die Verarbeitung Ihrer Daten erfolgt auf Grundlage von Art. 6 Abs. 1 lit. b DSGVO (Vertragserfüllung) und Art. 6 Abs. 1 lit. f DSGVO (berechtigtes Interesse).'
                  : 'The processing of your data is based on Art. 6 para. 1 lit. b GDPR (contract fulfillment) and Art. 6 para. 1 lit. f GDPR (legitimate interest).'
                }
              </p>

              <h2 className="text-2xl font-bold text-gray-900 mb-6">
                {language === 'de' ? '4. Datenweitergabe' : '4. Data Sharing'}
              </h2>
              <p className="text-gray-600 mb-8">
                {language === 'de' 
                  ? 'Wir geben Ihre Daten nicht an Dritte weiter, außer wenn dies für die Erfüllung unserer Dienstleistungen erforderlich ist oder gesetzlich vorgeschrieben ist. Ausnahmen bilden unsere vertrauenswürdigen Partner für Zahlungsabwicklung.'
                  : 'We do not share your data with third parties, except when necessary for fulfilling our services or legally required. Exceptions are our trusted partners for payment processing.'
                }
              </p>

              <h2 className="text-2xl font-bold text-gray-900 mb-6">
                {language === 'de' ? '5. Ihre Rechte' : '5. Your Rights'}
              </h2>
              <p className="text-gray-600 mb-4">
                {language === 'de' 
                  ? 'Sie haben folgende Rechte bezüglich Ihrer personenbezogenen Daten:'
                  : 'You have the following rights regarding your personal data:'
                }
              </p>
              <ul className="list-disc pl-6 text-gray-600 mb-8">
                <li>{language === 'de' ? 'Recht auf Auskunft (Art. 15 DSGVO)' : 'Right to information (Art. 15 GDPR)'}</li>
                <li>{language === 'de' ? 'Recht auf Berichtigung (Art. 16 DSGVO)' : 'Right to rectification (Art. 16 GDPR)'}</li>
                <li>{language === 'de' ? 'Recht auf Löschung (Art. 17 DSGVO)' : 'Right to erasure (Art. 17 GDPR)'}</li>
                <li>{language === 'de' ? 'Recht auf Einschränkung (Art. 18 DSGVO)' : 'Right to restriction (Art. 18 GDPR)'}</li>
                <li>{language === 'de' ? 'Recht auf Datenübertragbarkeit (Art. 20 DSGVO)' : 'Right to data portability (Art. 20 GDPR)'}</li>
                <li>{language === 'de' ? 'Widerspruchsrecht (Art. 21 DSGVO)' : 'Right to object (Art. 21 GDPR)'}</li>
              </ul>

              <h2 className="text-2xl font-bold text-gray-900 mb-6">
                {language === 'de' ? '6. Datensicherheit' : '6. Data Security'}
              </h2>
              <p className="text-gray-600 mb-8">
                {language === 'de' 
                  ? 'Wir verwenden moderne Sicherheitsmaßnahmen zum Schutz Ihrer Daten, einschließlich SSL-Verschlüsselung, regelmäßiger Sicherheitsupdates und Zugriffskontrollen.'
                  : 'We use modern security measures to protect your data, including SSL encryption, regular security updates, and access controls.'
                }
              </p>

              <h2 className="text-2xl font-bold text-gray-900 mb-6">
                {language === 'de' ? '7. Kontakt' : '7. Contact'}
              </h2>
              <p className="text-gray-600 mb-8">
                {language === 'de' 
                  ? 'Bei Fragen zum Datenschutz kontaktieren Sie uns unter privacy@mietenow.de oder schreiben Sie an unsere oben genannte Adresse.'
                  : 'For questions about data protection, contact us at privacy@mietenow.de or write to our address mentioned above.'
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
