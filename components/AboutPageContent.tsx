'use client'

import Header from '@/components/Header'
import Footer from '@/components/Footer'
import Image from 'next/image'
import { useTranslation } from '@/hooks/useTranslation'

export default function AboutPageContent() {
  const { t, language } = useTranslation()

  return (
    <div className="min-h-screen">
      <Header />
      
      <main className="min-h-screen">
        {/* Hero Section - Style Landing avec contenu côte à côte */}
        <section className="bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 min-h-screen flex items-center justify-center relative overflow-hidden">
          <div className="container-custom z-10">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-end">
              {/* Contenu à gauche */}
              <div className="flex flex-col">
                {/* Title */}
                <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-4 md:mb-6 leading-tight">
                  {language === 'de' ? 'Über uns' : 'About Us'}
                </h1>
                
                {/* Subtitle */}
                <p className="text-lg md:text-xl text-gray-300 mb-6 md:mb-8">
                  {language === 'de' 
                    ? 'Wir sind neun Freunde, die alle das gleiche Alptraum in Berlin erlebt haben 👋 🇩🇪'
                    : 'We\'re nine friends who all faced the same nightmare in Berlin 👋 🇩🇪'
                  }
                </p>

                {/* Story Content - Même taille que l'image */}
                <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 md:p-8 h-[500px] flex flex-col justify-center">
                  <div className="space-y-6 text-xl md:text-2xl text-gray-200 leading-relaxed">
                    <h2 className="text-xl md:text-2xl">
                      {language === 'de' 
                        ? 'Unsere Geschichte'
                        : 'Our Story'
                      }
                    </h2>
                    
                    <p className="text-xl md:text-2xl">
                      {language === 'de' 
                        ? 'Endlose Bewerbungen, gefälschte Anzeigen, keine Antworten… wir waren alle da.'
                        : 'Endless applications, fake listings, no replies… we\'ve been there.'
                      }
                    </p>
                    
                    <p className="text-xl md:text-2xl">
                      {language === 'de'
                        ? 'Also haben wir ein Tool gebaut, um uns selbst zu helfen. Ein einfacher Bot, der es uns ermöglichte, den Eigentümer zuerst zu kontaktieren, jedes Mal.'
                        : 'So we built a tool to help ourselves. A simple bot, that allowed us to contact the owner first, everytime.'
                      }
                    </p>
                    
                    <p className="text-[#00BFA6] font-semibold text-xl md:text-2xl">
                      {language === 'de'
                        ? 'Es funktionierte und hat alles verändert.'
                        : 'It worked and it has changed everything.'
                      }
                    </p>
                    
                    <p className="text-xl md:text-2xl">
                      {language === 'de'
                        ? 'Jetzt helfen wir anderen, dasselbe zu tun: ihren Platz in Berlin zu finden, schneller, fairer und ohne den Kampf.'
                        : 'Now we\'re helping others do the same: find their place in Berlin, faster, fairer, and without the struggle.'
                      }
                    </p>
                  </div>
                </div>
              </div>

              {/* Photo à droite - Alignée avec le bloc de texte */}
              <div className="flex flex-col">
                {/* Espace pour aligner avec le titre et sous-titre */}
                <div className="h-[173px]"></div>
                
                {/* Image alignée avec le bloc de texte */}
                <div className="w-full h-[500px]">
                  <div className="rounded-2xl overflow-hidden shadow-2xl w-full h-full">
                    <Image
                      src="/Logos/Team1_optimized.jpg"
                      alt={language === 'de' ? 'Unser Team' : 'Our team'}
                      width={600}
                      height={500}
                      className="w-full h-full object-cover object-center"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Floating Elements */}
          <div className="absolute top-1/4 left-1/4 w-24 h-24 bg-[#00BFA6]/30 rounded-full blur-2xl"></div>
          <div className="absolute bottom-1/4 right-1/4 w-40 h-40 bg-white/10 rounded-full blur-2xl"></div>
          <div className="absolute top-1/2 right-1/3 w-16 h-16 bg-[#004AAD]/20 rounded-full blur-xl"></div>
        </section>
      </main>

      <Footer />
    </div>
  )
}
