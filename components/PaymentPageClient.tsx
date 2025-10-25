'use client'

import { useState, useEffect } from 'react'
import { useLanguage } from '@/contexts/LanguageContext'
import { useAuth } from '@/contexts/AuthContext'
import { ChevronLeft, Check, Star, ArrowRight } from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'
import SimpleHeader from '@/components/SimpleHeader'
import Footer from '@/components/Footer'
import PaymentForm from '@/components/PaymentForm'
import { useSearchParams } from 'next/navigation'

export default function PaymentPageClient() {
  const { language } = useLanguage()
  const { user } = useAuth()
  const searchParams = useSearchParams()
  const [selectedPlan, setSelectedPlan] = useState('1-month')
  const [isOpen, setIsOpen] = useState<number | null>(null)
  const [showPaymentForm, setShowPaymentForm] = useState(false)
  const [paymentError, setPaymentError] = useState<string | null>(null)

  // Récupérer le plan depuis l'URL si présent
  useEffect(() => {
    const planFromUrl = searchParams.get('plan')
    if (planFromUrl) {
      const planMapping: { [key: string]: string } = {
        '1-month': '1-month',
        '3-month': '3-month',
        '6-month': '6-month',
      }
      setSelectedPlan(planMapping[planFromUrl] || '1-month')
    }
  }, [searchParams])

  const handlePaymentSuccess = () => {
    window.location.href = `/payment/success?plan=${selectedPlan}`
  }

  const handlePaymentError = (error: string) => {
    setPaymentError(error)
    setShowPaymentForm(false)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 relative">
      <SimpleHeader />
      <div className="flex items-center justify-center px-4 py-16">
        <div className="max-w-2xl w-full">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-3xl md:text-4xl font-bold text-white mb-4 leading-tight">
              {language === 'de' 
                ? `Wähle deinen Plan${user?.firstName ? ` ${user.firstName}` : ''}`
                : `Choose your plan${user?.firstName ? ` ${user.firstName}` : ''}`
              }
            </h1>
          </div>

          {/* Plans */}
          <div className="space-y-4 mb-8">
            {/* Plan options */}
            {/* ... (rest of the component code) ... */}
          </div>

          {/* Payment Form */}
          {showPaymentForm && (
            <PaymentForm
              selectedPlan={selectedPlan}
              onSuccess={handlePaymentSuccess}
              onError={handlePaymentError}
            />
          )}

          {paymentError && (
            <div className="mt-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
              {paymentError}
            </div>
          )}
        </div>
      </div>
      <Footer />
    </div>
  )
}
