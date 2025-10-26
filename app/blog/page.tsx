'use client'

import Header from '@/components/Header'
import Footer from '@/components/Footer'
import { useTranslation } from '@/hooks/useTranslation'
import { useState } from 'react'
import { Calendar, User, ArrowRight, Search, Tag } from 'lucide-react'
import Link from 'next/link'

export default function BlogPage() {
  const { t, language } = useTranslation()
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')

  const articles = [
    {
      id: 1,
      title: language === 'de' 
        ? 'Der ultimative Guide zur Wohnungssuche in Berlin 2024' 
        : 'The ultimate guide to apartment hunting in Berlin 2024',
      excerpt: language === 'de' 
        ? 'Alles was Sie über die Wohnungssuche in Berlin wissen müssen: von der Vorbereitung bis zur Unterzeichnung des Mietvertrags.'
        : 'Everything you need to know about apartment hunting in Berlin: from preparation to signing the rental contract.',
      author: 'Sarah Müller',
      date: '15. März 2024',
      readTime: '8 min',
      category: 'guide',
      image: '/Logos/berlin.png',
      featured: true
    },
    {
      id: 2,
      title: language === 'de' 
        ? '5 Tipps für erfolgreiche WG-Bewerbungen' 
        : '5 tips for successful shared apartment applications',
      excerpt: language === 'de' 
        ? 'Wie Sie Ihre Chancen erhöhen, in einer Wohngemeinschaft angenommen zu werden. Praktische Tipps von Experten.'
        : 'How to increase your chances of being accepted into a shared apartment. Practical tips from experts.',
      author: 'Max Weber',
      date: '12. März 2024',
      readTime: '5 min',
      category: 'tips',
      image: '/Logos/houses.svg',
      featured: false
    },
    {
      id: 3,
      title: language === 'de' 
        ? 'Mietpreise in Berlin: Trends und Prognosen' 
        : 'Rental prices in Berlin: trends and forecasts',
      excerpt: language === 'de' 
        ? 'Eine detaillierte Analyse der Mietpreisentwicklung in verschiedenen Berliner Bezirken und was für 2024 zu erwarten ist.'
        : 'A detailed analysis of rental price development in different Berlin districts and what to expect for 2024.',
      author: 'Dr. Anna Schmidt',
      date: '10. März 2024',
      readTime: '12 min',
      category: 'analysis',
      image: '/Logos/Munchen_optimized.jpg',
      featured: false
    },
    {
      id: 4,
      title: language === 'de' 
        ? 'Betrug bei der Wohnungssuche: So schützen Sie sich' 
        : 'Apartment hunting fraud: how to protect yourself',
      excerpt: language === 'de' 
        ? 'Erkennen Sie betrügerische Anzeigen und schützen Sie sich vor Wohnungsbetrug. Die häufigsten Betrugsmaschen im Überblick.'
        : 'Recognize fraudulent listings and protect yourself from rental fraud. An overview of the most common fraud schemes.',
      author: 'Tom Richter',
      date: '8. März 2024',
      readTime: '6 min',
      category: 'safety',
      image: '/Logos/frankfurt_optimized.jpg',
      featured: false
    },
    {
      id: 5,
      title: language === 'de' 
        ? 'Digitalisierung der Immobilienbranche: Was bringt die Zukunft?' 
        : 'Digitalization of the real estate industry: what does the future hold?',
      excerpt: language === 'de' 
        ? 'Wie Technologie die Art und Weise verändert, wie wir Wohnungen suchen und finden. Ein Blick in die Zukunft der Immobilienbranche.'
        : 'How technology is changing the way we search for and find apartments. A look into the future of the real estate industry.',
      author: 'Lisa Chen',
      date: '5. März 2024',
      readTime: '10 min',
      category: 'technology',
      image: '/Logos/koln_optimized.jpg',
      featured: false
    },
    {
      id: 6,
      title: language === 'de' 
        ? 'Erfolgsgeschichte: Von der WG zur eigenen Wohnung' 
        : 'Success story: from shared apartment to own apartment',
      excerpt: language === 'de' 
        ? 'Maria erzählt ihre Geschichte: Wie sie mit mietenow ihre Traumwohnung in Prenzlauer Berg gefunden hat.'
        : 'Maria tells her story: How she found her dream apartment in Prenzlauer Berg with mietenow.',
      author: 'Maria Gonzalez',
      date: '3. März 2024',
      readTime: '4 min',
      category: 'story',
      image: '/Logos/hamburg_optimized.jpg',
      featured: false
    }
  ]

  const categories = [
    { id: 'all', name: language === 'de' ? 'Alle' : 'All' },
    { id: 'guide', name: language === 'de' ? 'Guides' : 'Guides' },
    { id: 'tips', name: language === 'de' ? 'Tipps' : 'Tips' },
    { id: 'analysis', name: language === 'de' ? 'Analysen' : 'Analysis' },
    { id: 'safety', name: language === 'de' ? 'Sicherheit' : 'Safety' },
    { id: 'technology', name: language === 'de' ? 'Technologie' : 'Technology' },
    { id: 'story', name: language === 'de' ? 'Geschichten' : 'Stories' }
  ]

  const filteredArticles = selectedCategory === 'all' 
    ? articles 
    : articles.filter(article => article.category === selectedCategory)

  const featuredArticle = articles.find(article => article.featured)
  const regularArticles = filteredArticles.filter(article => !article.featured)

  return (
    <div className="min-h-screen bg-white">
      <Header />
      
      <main>
        {/* Hero Section */}
        <section className="bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 py-20">
          <div className="container-custom text-center">
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-6">
              {language === 'de' ? 'Blog' : 'Blog'}
            </h1>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto mb-8">
              {language === 'de' 
                ? 'Tipps, Guides und Insights rund um die Wohnungssuche in Deutschland.'
                : 'Tips, guides and insights around apartment hunting in Germany.'
              }
            </p>
            
            {/* Search Bar */}
            <div className="max-w-2xl mx-auto">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder={language === 'de' ? 'Artikel durchsuchen...' : 'Search articles...'}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-12 pr-4 py-4 rounded-lg border border-gray-300 focus:ring-2 focus:ring-[#00BFA6] focus:border-transparent text-gray-900"
                />
              </div>
            </div>
          </div>
        </section>

        {/* Categories */}
        <section className="py-8 bg-gray-50">
          <div className="container-custom">
            <div className="flex flex-wrap gap-2 justify-center">
              {categories.map((category) => (
                <button
                  key={category.id}
                  onClick={() => setSelectedCategory(category.id)}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                    selectedCategory === category.id
                      ? 'bg-[#00BFA6] text-white'
                      : 'bg-white text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  {category.name}
                </button>
              ))}
            </div>
          </div>
        </section>

        {/* Featured Article */}
        {featuredArticle && selectedCategory === 'all' && (
          <section className="py-16">
            <div className="container-custom">
              <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
                {language === 'de' ? 'Empfohlener Artikel' : 'Featured Article'}
              </h2>
              <div className="max-w-4xl mx-auto">
                <div className="bg-white rounded-2xl overflow-hidden shadow-lg">
                  <div className="md:flex">
                    <div className="md:w-1/2">
                      <img 
                        src={featuredArticle.image} 
                        alt={featuredArticle.title}
                        className="w-full h-64 md:h-full object-cover"
                      />
                    </div>
                    <div className="md:w-1/2 p-8">
                      <div className="flex items-center gap-2 mb-4">
                        <Tag className="w-4 h-4 text-[#00BFA6]" />
                        <span className="text-sm font-medium text-[#00BFA6] uppercase">
                          {categories.find(c => c.id === featuredArticle.category)?.name}
                        </span>
                      </div>
                      <h3 className="text-2xl font-bold text-gray-900 mb-4">
                        {featuredArticle.title}
                      </h3>
                      <p className="text-gray-600 mb-6">
                        {featuredArticle.excerpt}
                      </p>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4 text-sm text-gray-500">
                          <span className="flex items-center gap-1">
                            <User className="w-4 h-4" />
                            {featuredArticle.author}
                          </span>
                          <span className="flex items-center gap-1">
                            <Calendar className="w-4 h-4" />
                            {featuredArticle.date}
                          </span>
                          <span>{featuredArticle.readTime}</span>
                        </div>
                        <Link 
                          href={`/blog/${featuredArticle.id}`}
                          className="flex items-center gap-2 text-[#00BFA6] hover:text-[#00A693] font-semibold transition-colors"
                        >
                          {language === 'de' ? 'Lesen' : 'Read'}
                          <ArrowRight className="w-4 h-4" />
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* Articles Grid */}
        <section className="py-16">
          <div className="container-custom">
            <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
              {language === 'de' ? 'Alle Artikel' : 'All Articles'}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {regularArticles.map((article) => (
                <article key={article.id} className="bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                  <img 
                    src={article.image} 
                    alt={article.title}
                    className="w-full h-48 object-cover"
                  />
                  <div className="p-6">
                    <div className="flex items-center gap-2 mb-3">
                      <Tag className="w-4 h-4 text-[#00BFA6]" />
                      <span className="text-sm font-medium text-[#00BFA6] uppercase">
                        {categories.find(c => c.id === article.category)?.name}
                      </span>
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-3 line-clamp-2">
                      {article.title}
                    </h3>
                    <p className="text-gray-600 mb-4 line-clamp-3">
                      {article.excerpt}
                    </p>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3 text-sm text-gray-500">
                        <span className="flex items-center gap-1">
                          <User className="w-4 h-4" />
                          {article.author}
                        </span>
                        <span className="flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          {article.date}
                        </span>
                        <span>{article.readTime}</span>
                      </div>
                      <Link 
                        href={`/blog/${article.id}`}
                        className="flex items-center gap-1 text-[#00BFA6] hover:text-[#00A693] font-semibold transition-colors"
                      >
                        {language === 'de' ? 'Lesen' : 'Read'}
                        <ArrowRight className="w-4 h-4" />
                      </Link>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}
