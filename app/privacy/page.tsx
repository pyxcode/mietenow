'use client'

export const dynamic = 'force-dynamic'

import Header from '@/components/Header'
import Footer from '@/components/Footer'
import { useTranslation } from '@/hooks/useTranslation'

export default function PrivacyPage() {
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
                {language === 'de' ? 'Datenschutzerklärung' : 'Privacy Policy'}
              </h1>
              <p className="text-xl text-gray-300 mb-8">
                {language === 'de' 
                  ? 'Informationen zum Datenschutz gemäß DSGVO'
                  : 'Information on data protection according to GDPR'
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
                    {language === 'de' ? '1. Datenschutz auf einen Blick' : '1. Data Protection at a Glance'}
                  </h2>
                  
                  <div className="space-y-4 text-gray-700">
                    <h3 className="text-xl font-semibold text-gray-900">
                      {language === 'de' ? 'Allgemeine Hinweise' : 'General Information'}
                    </h3>
                    <p>{language === 'de' 
                      ? 'Die folgenden Hinweise geben einen einfachen Überblick darüber, was mit Ihren personenbezogenen Daten passiert, wenn Sie diese Website besuchen. Personenbezogene Daten sind alle Daten, mit denen Sie persönlich identifiziert werden können.'
                      : 'The following information provides a simple overview of what happens to your personal data when you visit this website. Personal data is all data with which you can be personally identified.'
                    }</p>
                  </div>

                  <h2 className="text-2xl font-bold text-gray-900 mb-6 mt-8">
                    {language === 'de' ? '2. Datenerfassung auf dieser Website' : '2. Data Collection on this Website'}
                  </h2>
                  
                  <div className="space-y-4 text-gray-700">
                    <h3 className="text-xl font-semibold text-gray-900">
                      {language === 'de' ? 'Wer ist verantwortlich für die Datenerfassung?' : 'Who is responsible for data collection?'}
                    </h3>
                    <p>{language === 'de' 
                      ? 'Die Datenverarbeitung auf dieser Website erfolgt durch den Websitebetreiber. Dessen Kontaktdaten können Sie dem Impressum dieser Website entnehmen.'
                      : 'Data processing on this website is carried out by the website operator. You can find their contact details in the imprint of this website.'
                    }</p>
                    
                    <h3 className="text-xl font-semibold text-gray-900">
                      {language === 'de' ? 'Wie erfassen wir Ihre Daten?' : 'How do we collect your data?'}
                    </h3>
                    <p>{language === 'de' 
                      ? 'Ihre Daten werden zum einen dadurch erhoben, dass Sie uns diese mitteilen. Hierbei kann es sich z.B. um Daten handeln, die Sie in ein Kontaktformular eingeben.'
                      : 'Your data is collected, on the one hand, by you providing it to us. This can be, for example, data that you enter in a contact form.'
                    }</p>
                  </div>

                  <h2 className="text-2xl font-bold text-gray-900 mb-6 mt-8">
                    {language === 'de' ? '3. Allgemeine Hinweise und Pflichtinformationen' : '3. General Information and Mandatory Information'}
                  </h2>
                  
                  <div className="space-y-4 text-gray-700">
                    <h3 className="text-xl font-semibold text-gray-900">
                      {language === 'de' ? 'Datenschutz' : 'Data Protection'}
                    </h3>
                    <p>{language === 'de' 
                      ? 'Die Betreiber dieser Seiten nehmen den Schutz Ihrer persönlichen Daten sehr ernst. Wir behandeln Ihre personenbezogenen Daten vertraulich und entsprechend der gesetzlichen Datenschutzvorschriften sowie dieser Datenschutzerklärung.'
                      : 'The operators of these pages take the protection of your personal data very seriously. We treat your personal data confidentially and in accordance with the legal data protection regulations and this privacy policy.'
                    }</p>
                  </div>

                  <h2 className="text-2xl font-bold text-gray-900 mb-6 mt-8">
                    {language === 'de' ? '4. Datenerfassung auf dieser Website' : '4. Data Collection on this Website'}
                  </h2>
                  
                  <div className="space-y-4 text-gray-700">
                    <h3 className="text-xl font-semibold text-gray-900">
                      {language === 'de' ? 'Server-Log-Dateien' : 'Server Log Files'}
                    </h3>
                    <p>{language === 'de' 
                      ? 'Der Provider der Seiten erhebt und speichert automatisch Informationen in so genannten Server-Log-Dateien, die Ihr Browser automatisch an uns übermittelt.'
                      : 'The provider of the pages automatically collects and stores information in so-called server log files, which your browser automatically transmits to us.'
                    }</p>
                    
                    <p>{language === 'de' 
                      ? 'Dies sind: Browsertyp und Browserversion, verwendetes Betriebssystem, Referrer URL, Hostname des zugreifenden Rechners, Uhrzeit der Serveranfrage, IP-Adresse'
                      : 'These are: browser type and browser version, operating system used, referrer URL, hostname of the accessing computer, time of server request, IP address'
                    }</p>
                  </div>

                  <h2 className="text-2xl font-bold text-gray-900 mb-6 mt-8">
                    {language === 'de' ? '5. Cookies' : '5. Cookies'}
                  </h2>
                  
                  <div className="space-y-4 text-gray-700">
                    <p>{language === 'de' 
                      ? 'Unsere Internetseiten verwenden so genannte „Cookies". Cookies sind kleine Textdateien und richten auf Ihrem Endgerät keinen Schaden an. Sie werden entweder vorübergehend für die Dauer einer Sitzung (Session-Cookies) oder dauerhaft (dauerhafte Cookies) auf Ihrem Endgerät gespeichert.'
                      : 'Our websites use so-called "cookies". Cookies are small text files and do not cause any damage to your device. They are either temporarily stored for the duration of a session (session cookies) or permanently (permanent cookies) on your device.'
                    }</p>
                  </div>

                  <h2 className="text-2xl font-bold text-gray-900 mb-6 mt-8">
                    {language === 'de' ? '6. Kontaktformular' : '6. Contact Form'}
                  </h2>
                  
                  <div className="space-y-4 text-gray-700">
                    <p>{language === 'de' 
                      ? 'Wenn Sie uns per Kontaktformular Anfragen zukommen lassen, werden Ihre Angaben aus dem Anfrageformular inklusive der von Ihnen dort angegebenen Kontaktdaten zwecks Bearbeitung der Anfrage und für den Fall von Anschlussfragen bei uns gespeichert.'
                      : 'If you send us inquiries via the contact form, your details from the inquiry form, including the contact details you provided there, will be stored by us for the purpose of processing the inquiry and in case of follow-up questions.'
                    }</p>
                  </div>

                  <h2 className="text-2xl font-bold text-gray-900 mb-6 mt-8">
                    {language === 'de' ? '7. Ihre Rechte' : '7. Your Rights'}
                  </h2>
                  
                  <div className="space-y-4 text-gray-700">
                    <p>{language === 'de' 
                      ? 'Sie haben das Recht, jederzeit Auskunft über Ihre bei uns gespeicherten personenbezogenen Daten zu erhalten. Sie haben außerdem das Recht auf Berichtigung, Löschung oder Einschränkung der Verarbeitung sowie das Recht auf Datenübertragbarkeit.'
                      : 'You have the right to receive information about your personal data stored by us at any time. You also have the right to rectification, deletion or restriction of processing as well as the right to data portability.'
                    }</p>
                  </div>

                  <h2 className="text-2xl font-bold text-gray-900 mb-6 mt-8">
                    {language === 'de' ? '8. Widerspruch gegen Werbe-E-Mails' : '8. Objection to Advertising E-mails'}
                  </h2>
                  
                  <div className="space-y-4 text-gray-700">
                    <p>{language === 'de' 
                      ? 'Der Nutzung von im Rahmen der Impressumspflicht veröffentlichten Kontaktdaten zur Übersendung von nicht ausdrücklich angeforderter Werbung und Informationsmaterialien wird hiermit widersprochen.'
                      : 'The use of contact data published within the framework of the imprint obligation for sending unsolicited advertising and information materials is hereby objected to.'
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
