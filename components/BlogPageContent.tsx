'use client'

import Header from '@/components/Header'
import Footer from '@/components/Footer'
import Link from 'next/link'
import { Calendar, User, ArrowRight, Tag } from 'lucide-react'
import { useTranslation } from '@/hooks/useTranslation'

export default function BlogPageContent() {
  const { t, language } = useTranslation()

  const blogPosts = [
    {
      id: 1,
      title: language === 'de' ? 'Wie man in Berlin eine Wohnung findet' : 'How to Find an Apartment in Berlin',
      excerpt: language === 'de' 
        ? 'Ein kompletter Leitfaden für die Wohnungssuche in Berlin, von der Vorbereitung bis zum Einzug.'
        : 'A complete guide to apartment hunting in Berlin, from preparation to move-in.',
      date: '2024-01-15',
      author: 'Mietenow Team',
      category: language === 'de' ? 'Wohnungssuche' : 'Apartment Hunting',
      readTime: '5 min read',
      image: '/Logos/Blog1.jpg'
    },
    {
      id: 2,
      title: language === 'de' ? 'Die häufigsten Betrugsmaschen bei der Wohnungssuche' : 'Common Rental Scams to Avoid',
      excerpt: language === 'de'
        ? 'Erkenne und vermeide die häufigsten Betrugsmaschen bei der Wohnungssuche in Berlin.'
        : 'Recognize and avoid the most common rental scams in Berlin.',
      date: '2024-01-10',
      author: 'Mietenow Team',
      category: language === 'de' ? 'Sicherheit' : 'Safety',
      readTime: '3 min read',
      image: '/Logos/Blog2.jpg'
    },
    {
      id: 3,
      title: language === 'de' ? 'Berliner Bezirke: Wo soll ich wohnen?' : 'Berlin Districts: Where Should I Live?',
      excerpt: language === 'de'
        ? 'Ein Überblick über die verschiedenen Bezirke Berlins und was sie zu bieten haben.'
        : 'An overview of Berlin\'s different districts and what they have to offer.',
      date: '2024-01-05',
      author: 'Mietenow Team',
      category: language === 'de' ? 'Bezirke' : 'Districts',
      readTime: '7 min read',
      image: '/Logos/Blog3.jpg'
    },
    {
      id: 4,
      title: language === 'de' ? 'Erfolgreiche Bewerbung: Tipps für Mieter' : 'Successful Application: Tips for Renters',
      excerpt: language === 'de'
        ? 'Wie du deine Chancen bei der Wohnungssuche maximierst und erfolgreich eine Wohnung findest.'
        : 'How to maximize your chances in the apartment search and successfully find a place.',
      date: '2024-01-01',
      author: 'Mietenow Team',
      category: language === 'de' ? 'Bewerbung' : 'Application',
      readTime: '4 min read',
      image: '/Logos/Blog4.jpg'
    },
    {
      id: 5,
      title: language === 'de' ? 'Mietenow vs. traditionelle Wohnungssuche' : 'Mietenow vs. Traditional Apartment Hunting',
      excerpt: language === 'de'
        ? 'Warum unser Ansatz die Wohnungssuche revolutioniert und wie es dir helfen kann.'
        : 'Why our approach revolutionizes apartment hunting and how it can help you.',
      date: '2023-12-28',
      author: 'Mietenow Team',
      category: language === 'de' ? 'Innovation' : 'Innovation',
      readTime: '6 min read',
      image: '/Logos/Blog5.jpg'
    },
    {
      id: 6,
      title: language === 'de' ? 'Erste Schritte in Berlin: Ein Umzugsleitfaden' : 'First Steps in Berlin: A Moving Guide',
      excerpt: language === 'de'
        ? 'Alles was du wissen musst, wenn du nach Berlin ziehst, von der Anmeldung bis zur Integration.'
        : 'Everything you need to know when moving to Berlin, from registration to integration.',
      date: '2023-12-25',
      author: 'Mietenow Team',
      category: language === 'de' ? 'Umzug' : 'Moving',
      readTime: '8 min read',
      image: '/Logos/Blog6.jpg'
    }
  ]

  return (
    <div className="min-h-screen">
      <Header />
      
      <main className="min-h-screen">
        {/* Hero Section */}
        <section className="bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 min-h-screen flex items-center justify-center relative overflow-hidden">
          <div className="container-custom z-10">
            <div className="text-center">
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6 leading-tight">
                {language === 'de' ? 'Blog' : 'Blog'}
              </h1>
              <p className="text-xl md:text-2xl text-gray-300 mb-8 max-w-3xl mx-auto">
                {language === 'de' 
                  ? 'Tipps, Tricks und Geschichten rund um die Wohnungssuche in Berlin'
                  : 'Tips, tricks and stories about apartment hunting in Berlin'
                }
              </p>
            </div>
          </div>

          {/* Floating Elements */}
          <div className="absolute top-1/4 left-1/4 w-24 h-24 bg-[#00BFA6]/30 rounded-full blur-2xl"></div>
          <div className="absolute bottom-1/4 right-1/4 w-40 h-40 bg-white/10 rounded-full blur-2xl"></div>
          <div className="absolute top-1/2 right-1/3 w-16 h-16 bg-[#004AAD]/20 rounded-full blur-xl"></div>
        </section>

        {/* Blog Posts Section */}
        <section className="py-20 bg-white">
          <div className="container-custom">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {blogPosts.map((post) => (
                <article key={post.id} className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300">
                  <div className="aspect-w-16 aspect-h-9">
                    <img 
                      src={post.image} 
                      alt={post.title}
                      className="w-full h-48 object-cover"
                    />
                  </div>
                  <div className="p-6">
                    <div className="flex items-center gap-4 text-sm text-gray-500 mb-3">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        {post.date}
                      </span>
                      <span className="flex items-center gap-1">
                        <User className="w-4 h-4" />
                        {post.author}
                      </span>
                    </div>
                    
                    <div className="mb-3">
                      <span className="inline-flex items-center gap-1 px-3 py-1 bg-[#00BFA6]/10 text-[#00BFA6] text-sm font-medium rounded-full">
                        <Tag className="w-3 h-3" />
                        {post.category}
                      </span>
                    </div>
                    
                    <h2 className="text-xl font-bold text-gray-900 mb-3 line-clamp-2">
                      {post.title}
                    </h2>
                    
                    <p className="text-gray-600 mb-4 line-clamp-3">
                      {post.excerpt}
                    </p>
                    
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-500">{post.readTime}</span>
                      <Link 
                        href={`/blog/${post.id}`}
                        className="inline-flex items-center gap-2 text-[#00BFA6] hover:text-[#00A693] font-medium transition-colors"
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
