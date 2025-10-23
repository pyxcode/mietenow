'use client'

export const dynamic = 'force-dynamic'

import Header from '@/components/Header'
import Footer from '@/components/Footer'
import Link from 'next/link'
import { Calendar, User, ArrowRight, Tag } from 'lucide-react'
import { useTranslation } from '@/hooks/useTranslation'

export default function BlogPage() {
  const { t, language } = useTranslation()

  const blogCategories = [
    {
      title: language === 'de' ? 'Wohnungssuche in Berlin' : 'Finding Apartments in Berlin',
      description: language === 'de' 
        ? 'Tipps, Tricks und Insider-Wissen für die Wohnungssuche in der Hauptstadt'
        : 'Tips, tricks and insider knowledge for apartment hunting in the capital',
      articles: [
        {
          title: language === 'de' ? 'Die 10 besten Bezirke für Studenten in Berlin' : 'The 10 Best Districts for Students in Berlin',
          excerpt: language === 'de' 
            ? 'Eine detaillierte Analyse der Berliner Bezirke mit Fokus auf Studentenfreundlichkeit, Mietpreisen und Lebensqualität.'
            : 'A detailed analysis of Berlin districts focusing on student-friendliness, rent prices and quality of life.',
          date: '2024-01-15',
          author: 'MieteNow Team',
          category: language === 'de' ? 'Wohnungssuche' : 'Apartment Hunting',
          readTime: '5 min'
        },
        {
          title: language === 'de' ? 'WG vs. Einzimmerwohnung: Was ist besser für dich?' : 'Shared Apartment vs. Studio: What\'s Better for You?',
          excerpt: language === 'de'
            ? 'Vergleiche die Vor- und Nachteile von Wohngemeinschaften und Einzimmerwohnungen in Berlin.'
            : 'Compare the pros and cons of shared apartments and studios in Berlin.',
          date: '2024-01-10',
          author: 'Sarah Müller',
          category: language === 'de' ? 'Wohnungssuche' : 'Apartment Hunting',
          readTime: '7 min'
        },
        {
          title: language === 'de' ? 'Mietpreise in Berlin: Der ultimative Guide 2024' : 'Rent Prices in Berlin: The Ultimate Guide 2024',
          excerpt: language === 'de'
            ? 'Aktuelle Mietpreise, Trends und Prognosen für alle Berliner Bezirke.'
            : 'Current rent prices, trends and forecasts for all Berlin districts.',
          date: '2024-01-05',
          author: 'MieteNow Team',
          category: language === 'de' ? 'Mietpreise' : 'Rent Prices',
          readTime: '8 min'
        }
      ]
    },
    {
      title: language === 'de' ? 'Leben in Berlin' : 'Living in Berlin',
      description: language === 'de'
        ? 'Alles über das Leben, Arbeiten und Studieren in der deutschen Hauptstadt'
        : 'Everything about living, working and studying in the German capital',
      articles: [
        {
          title: language === 'de' ? 'Anmeldung in Berlin: Schritt-für-Schritt Anleitung' : 'Registration in Berlin: Step-by-Step Guide',
          excerpt: language === 'de'
            ? 'Wie du dich erfolgreich in Berlin anmeldest und alle notwendigen Dokumente zusammenstellst.'
            : 'How to successfully register in Berlin and gather all necessary documents.',
          date: '2024-01-12',
          author: 'Tom Schmidt',
          category: language === 'de' ? 'Anmeldung' : 'Registration',
          readTime: '6 min'
        },
        {
          title: language === 'de' ? 'Deutsche Bürokratie verstehen: Ein Guide für Ausländer' : 'Understanding German Bureaucracy: A Guide for Foreigners',
          excerpt: language === 'de'
            ? 'Navigiere durch die deutsche Bürokratie mit unseren praktischen Tipps und Tricks.'
            : 'Navigate through German bureaucracy with our practical tips and tricks.',
          date: '2024-01-08',
          author: 'MieteNow Team',
          category: language === 'de' ? 'Bürokratie' : 'Bureaucracy',
          readTime: '10 min'
        }
      ]
    },
    {
      title: language === 'de' ? 'MieteNow Updates' : 'MieteNow Updates',
      description: language === 'de'
        ? 'Neue Features, Updates und Erfolgsgeschichten unserer Nutzer'
        : 'New features, updates and success stories from our users',
      articles: [
        {
          title: language === 'de' ? 'Neue Features: Intelligente Suchfilter' : 'New Features: Smart Search Filters',
          excerpt: language === 'de'
            ? 'Entdecke unsere neuen KI-gestützten Suchfilter, die dir helfen, die perfekte Wohnung zu finden.'
            : 'Discover our new AI-powered search filters that help you find the perfect apartment.',
          date: '2024-01-20',
          author: 'MieteNow Team',
          category: language === 'de' ? 'Updates' : 'Updates',
          readTime: '4 min'
        },
        {
          title: language === 'de' ? 'Erfolgsgeschichte: Wie Maria ihre Traumwohnung fand' : 'Success Story: How Maria Found Her Dream Apartment',
          excerpt: language === 'de'
            ? 'Eine inspirierende Geschichte darüber, wie MieteNow Maria half, ihre perfekte Wohnung in nur 2 Wochen zu finden.'
            : 'An inspiring story about how MieteNow helped Maria find her perfect apartment in just 2 weeks.',
          date: '2024-01-18',
          author: 'Maria Rodriguez',
          category: language === 'de' ? 'Erfolgsgeschichten' : 'Success Stories',
          readTime: '5 min'
        }
      ]
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
                {language === 'de' ? 'MieteNow Blog' : 'MieteNow Blog'}
              </h1>
              <p className="text-xl text-gray-300 mb-8">
                {language === 'de' 
                  ? 'Deine Quelle für Tipps, Tricks und Insider-Wissen rund um die Wohnungssuche in Berlin'
                  : 'Your source for tips, tricks and insider knowledge about apartment hunting in Berlin'
                }
              </p>
            </div>
          </div>
        </section>

        {/* Blog Categories */}
        <section className="py-20 bg-gray-50">
          <div className="container-custom">
            <div className="space-y-16">
              {blogCategories.map((category, categoryIndex) => (
                <div key={categoryIndex} className="bg-white rounded-2xl shadow-lg p-8">
                  <div className="mb-8">
                    <h2 className="text-3xl font-bold text-gray-900 mb-4">{category.title}</h2>
                    <p className="text-lg text-gray-600">{category.description}</p>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {category.articles.map((article, articleIndex) => (
                      <article key={articleIndex} className="bg-gray-50 rounded-xl p-6 hover:shadow-lg transition-shadow">
                        <div className="flex items-center gap-2 mb-3">
                          <Tag className="w-4 h-4 text-blue-600" />
                          <span className="text-sm font-medium text-blue-600">{article.category}</span>
                        </div>
                        
                        <h3 className="text-xl font-semibold text-gray-900 mb-3 line-clamp-2">
                          {article.title}
                        </h3>
                        
                        <p className="text-gray-600 mb-4 line-clamp-3">
                          {article.excerpt}
                        </p>
                        
                        <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                          <div className="flex items-center gap-4">
                            <div className="flex items-center gap-1">
                              <Calendar className="w-4 h-4" />
                              <span>{article.date}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <User className="w-4 h-4" />
                              <span>{article.author}</span>
                            </div>
                          </div>
                          <span>{article.readTime}</span>
                        </div>
                        
                        <Link 
                          href="#" 
                          className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium"
                        >
                          {language === 'de' ? 'Weiterlesen' : 'Read More'}
                          <ArrowRight className="w-4 h-4" />
                        </Link>
                      </article>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

      </main>

      <Footer />
    </div>
  )
}
