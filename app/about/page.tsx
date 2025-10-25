'use client'

export const dynamic = 'force-dynamic'

import Header from '@/components/Header'
import Footer from '@/components/Footer'
import { useTranslation } from '@/hooks/useTranslation'

export default function AboutPage() {
  const { t } = useTranslation()

  return (
    <div className="min-h-screen bg-white">
      <Header />
      
      <div className="container mx-auto px-4 py-16">
        <h1 className="text-4xl font-bold text-gray-900 mb-8">
          About Us
        </h1>
        
        <div className="prose max-w-none">
          <p className="text-lg text-gray-600 mb-6">
            We help you find the perfect apartment in Berlin.
          </p>
        </div>
      </div>
      
      <Footer />
    </div>
  )
}
