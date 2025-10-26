'use client'

import Header from '@/components/Header'
import Footer from '@/components/Footer'
import { useTranslation } from '@/hooks/useTranslation'
import { useState } from 'react'
import { ChevronUp, ChevronDown, MessageCircle, Clock, User, Filter } from 'lucide-react'

export default function CommunityPage() {
  const { t, language } = useTranslation()
  const [sortBy, setSortBy] = useState('hot')
  const [filter, setFilter] = useState('all')

  const posts = [
    {
      id: 1,
      title: language === 'de' 
        ? 'Erste Wohnung in Berlin gefunden! 🎉' 
        : 'Found my first apartment in Berlin! 🎉',
      content: language === 'de' 
        ? 'Nach 3 Monaten Suche mit mietenow habe ich endlich meine Traumwohnung gefunden. Die Benachrichtigungen haben mir wirklich geholfen, schnell zu reagieren!'
        : 'After 3 months of searching with mietenow, I finally found my dream apartment. The notifications really helped me react quickly!',
      author: 'BerlinNewcomer',
      time: '2 hours ago',
      upvotes: 24,
      comments: 8,
      category: 'success',
      tags: ['berlin', 'success-story', 'first-apartment']
    },
    {
      id: 2,
      title: language === 'de' 
        ? 'Tipps für WG-Bewerbungen?' 
        : 'Tips for shared apartment applications?',
      content: language === 'de' 
        ? 'Ich suche nach einer WG in Friedrichshain. Hat jemand Tipps für eine erfolgreiche Bewerbung? Was sollte ich in meine Nachricht schreiben?'
        : 'I\'m looking for a shared apartment in Friedrichshain. Does anyone have tips for a successful application? What should I write in my message?',
      author: 'StudentMax',
      time: '5 hours ago',
      upvotes: 12,
      comments: 15,
      category: 'question',
      tags: ['wg', 'tips', 'friedrichshain']
    },
    {
      id: 3,
      title: language === 'de' 
        ? 'Mietenow vs. andere Plattformen - Vergleich' 
        : 'Mietenow vs. other platforms - comparison',
      content: language === 'de' 
        ? 'Ich habe verschiedene Plattformen getestet und mietenow ist definitiv die effizienteste. Hier ist mein Vergleich...'
        : 'I\'ve tested different platforms and mietenow is definitely the most efficient. Here\'s my comparison...',
      author: 'ApartmentHunter',
      time: '1 day ago',
      upvotes: 18,
      comments: 6,
      category: 'review',
      tags: ['comparison', 'review', 'platform']
    },
    {
      id: 4,
      title: language === 'de' 
        ? 'Warnung: Betrügerische Anzeige erkannt' 
        : 'Warning: Fraudulent listing detected',
      content: language === 'de' 
        ? 'Ich bin auf eine verdächtige Anzeige gestoßen. Hier sind die roten Flaggen, auf die ihr achten solltet...'
        : 'I came across a suspicious listing. Here are the red flags you should watch out for...',
      author: 'SafetyFirst',
      time: '2 days ago',
      upvotes: 31,
      comments: 12,
      category: 'warning',
      tags: ['scam', 'warning', 'safety']
    },
    {
      id: 5,
      title: language === 'de' 
        ? 'Neue Features von mietenow?' 
        : 'New mietenow features?',
      content: language === 'de' 
        ? 'Hat jemand schon die neuen Features ausprobiert? Die Kartenansicht ist wirklich hilfreich!'
        : 'Has anyone tried the new features yet? The map view is really helpful!',
      author: 'TechEnthusiast',
      time: '3 days ago',
      upvotes: 9,
      comments: 4,
      category: 'discussion',
      tags: ['features', 'update', 'feedback']
    }
  ]

  const categories = [
    { id: 'all', name: language === 'de' ? 'Alle' : 'All' },
    { id: 'success', name: language === 'de' ? 'Erfolgsgeschichten' : 'Success Stories' },
    { id: 'question', name: language === 'de' ? 'Fragen' : 'Questions' },
    { id: 'review', name: language === 'de' ? 'Bewertungen' : 'Reviews' },
    { id: 'warning', name: language === 'de' ? 'Warnungen' : 'Warnings' },
    { id: 'discussion', name: language === 'de' ? 'Diskussionen' : 'Discussions' }
  ]

  const filteredPosts = filter === 'all' 
    ? posts 
    : posts.filter(post => post.category === filter)

  const getCategoryColor = (category: string) => {
    const colors = {
      success: 'bg-green-100 text-green-800',
      question: 'bg-blue-100 text-blue-800',
      review: 'bg-purple-100 text-purple-800',
      warning: 'bg-red-100 text-red-800',
      discussion: 'bg-gray-100 text-gray-800'
    }
    return colors[category as keyof typeof colors] || 'bg-gray-100 text-gray-800'
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <main>
        {/* Hero Section */}
        <section className="bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 py-16">
          <div className="container-custom text-center">
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-6">
              {language === 'de' ? 'Community' : 'Community'}
            </h1>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              {language === 'de' 
                ? 'Tauschen Sie sich mit anderen Mietern aus, teilen Sie Ihre Erfahrungen und helfen Sie sich gegenseitig.'
                : 'Exchange with other tenants, share your experiences and help each other.'
              }
            </p>
          </div>
        </section>

        {/* Community Content */}
        <section className="py-8">
          <div className="container-custom">
            <div className="max-w-4xl mx-auto">
              {/* Controls */}
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
                <div className="flex items-center gap-4">
                  <Filter className="w-5 h-5 text-gray-500" />
                  <div className="flex gap-2">
                    {categories.map((category) => (
                      <button
                        key={category.id}
                        onClick={() => setFilter(category.id)}
                        className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                          filter === category.id
                            ? 'bg-[#00BFA6] text-white'
                            : 'bg-white text-gray-600 hover:bg-gray-100'
                        }`}
                      >
                        {category.name}
                      </button>
                    ))}
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-600">
                    {language === 'de' ? 'Sortieren nach:' : 'Sort by:'}
                  </span>
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#00BFA6] focus:border-transparent"
                  >
                    <option value="hot">{language === 'de' ? 'Beliebt' : 'Hot'}</option>
                    <option value="new">{language === 'de' ? 'Neu' : 'New'}</option>
                    <option value="top">{language === 'de' ? 'Top' : 'Top'}</option>
                  </select>
                </div>
              </div>

              {/* Posts */}
              <div className="space-y-4">
                {filteredPosts.map((post) => (
                  <div key={post.id} className="bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
                    <div className="p-6">
                      <div className="flex gap-4">
                        {/* Voting */}
                        <div className="flex flex-col items-center gap-2">
                          <button className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                            <ChevronUp className="w-5 h-5 text-gray-500 hover:text-[#00BFA6]" />
                          </button>
                          <span className="text-sm font-semibold text-gray-700">{post.upvotes}</span>
                          <button className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                            <ChevronDown className="w-5 h-5 text-gray-500 hover:text-red-500" />
                          </button>
                        </div>

                        {/* Content */}
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getCategoryColor(post.category)}`}>
                              {categories.find(c => c.id === post.category)?.name}
                            </span>
                            <span className="text-xs text-gray-500">•</span>
                            <span className="text-xs text-gray-500">u/{post.author}</span>
                            <span className="text-xs text-gray-500">•</span>
                            <span className="text-xs text-gray-500 flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              {post.time}
                            </span>
                          </div>
                          
                          <h2 className="text-lg font-semibold text-gray-900 mb-2 hover:text-[#00BFA6] cursor-pointer">
                            {post.title}
                          </h2>
                          
                          <p className="text-gray-600 mb-4 line-clamp-3">
                            {post.content}
                          </p>
                          
                          <div className="flex items-center gap-4 text-sm text-gray-500">
                            <button className="flex items-center gap-1 hover:text-[#00BFA6] transition-colors">
                              <MessageCircle className="w-4 h-4" />
                              {post.comments} {language === 'de' ? 'Kommentare' : 'comments'}
                            </button>
                            <div className="flex gap-1">
                              {post.tags.map((tag, index) => (
                                <span key={index} className="px-2 py-1 bg-gray-100 text-gray-600 rounded text-xs">
                                  #{tag}
                                </span>
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Load More */}
              <div className="text-center mt-8">
                <button className="bg-[#00BFA6] hover:bg-[#00A693] text-white px-8 py-3 rounded-lg font-semibold transition-colors">
                  {language === 'de' ? 'Mehr laden' : 'Load more'}
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-16 bg-[#002E73]">
          <div className="container-custom text-center">
            <h2 className="text-3xl font-bold text-white mb-6">
              {language === 'de' ? 'Teilen Sie Ihre Erfahrung' : 'Share your experience'}
            </h2>
            <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
              {language === 'de' 
                ? 'Haben Sie eine Geschichte zu erzählen? Teilen Sie sie mit der Community!'
                : 'Do you have a story to tell? Share it with the community!'
              }
            </p>
            <button className="bg-[#00BFA6] hover:bg-[#00A693] text-white px-8 py-4 rounded-lg text-lg font-semibold transition-colors">
              {language === 'de' ? 'Beitrag erstellen' : 'Create post'}
            </button>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}
