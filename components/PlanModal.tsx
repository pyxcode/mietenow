'use client'

import { useState, useEffect } from 'react'
import { useLanguage } from '@/contexts/LanguageContext'
import { useAuth } from '@/contexts/AuthContext'
import { Star, Loader2 } from 'lucide-react'
import { loadStripe } from '@stripe/stripe-js'
import { Elements, PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js'

interface PlanModalProps {
  isOpen: boolean
  onClose: () => void
}

export default function PlanModal({ isOpen, onClose }: PlanModalProps) {
  const { language } = useLanguage()
  const { user } = useAuth()
  const [selectedPlan, setSelectedPlan] = useState('2sem')
  const [showPaymentForm, setShowPaymentForm] = useState(false)
  const [clientSecret, setClientSecret] = useState('')
  const [paymentError, setPaymentError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  if (!isOpen) return null

  const plans = [
    {
      id: '2sem',
      name: language === 'de' ? '2-Wochen-Plan' : '2-week plan',
      price: '€26',
      originalPrice: null,
      discount: null,
      popular: false
    },
    {
      id: '1mois',
      name: language === 'de' ? '1-Monats-Plan' : '1-month plan',
      price: '€34',
      originalPrice: '€51',
      discount: language === 'de' ? '33% sparen' : 'Save 33%',
      popular: true
    },
    {
      id: '3mois',
      name: language === 'de' ? '3-Monats-Plan' : '3-month plan',
      price: '€68',
      originalPrice: '€102',
      discount: language === 'de' ? '44% sparen' : 'Save 44%',
      popular: false
    }
  ]

  const handleSelectPlan = async () => {
    setIsLoading(true)
    setPaymentError(null)
    
    // Mapping des plans vers les priceIds Stripe
    const priceIds = {
      '2sem': 'price_1SKRhoCLZ8IL4RE4BESFrtzu',
      '1mois': 'price_1SKRh8CLZ8IL4RE4XWUw9lLP',
      '3mois': 'price_1SKRgUCLZ8IL4RE4o9zRXYtc'
    }
    
    const priceId = priceIds[selectedPlan as keyof typeof priceIds]
    
    if (!priceId) {
      setPaymentError(language === 'de' ? 'Plan nicht gefunden' : 'Plan not found')
      setIsLoading(false)
      return
    }
    
    try {
      const response = await fetch('/api/create-payment-intent', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          priceId: priceId,
          plan: selectedPlan,
          userId: user?.id
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to create payment intent')
      }

      const { clientSecret: secret } = await response.json()
      setClientSecret(secret)
      setShowPaymentForm(true)
    } catch (error) {
      console.error('Error creating payment intent:', error)
      setPaymentError(language === 'de' ? 'Fehler beim Erstellen der Zahlung' : 'Error creating payment')
    } finally {
      setIsLoading(false)
    }
  }

  // Composant PaymentForm intégré
  const PaymentForm = () => {
    const stripe = useStripe()
    const elements = useElements()
    const [isProcessing, setIsProcessing] = useState(false)
    const [message, setMessage] = useState('')

    const handleSubmit = async (event: React.FormEvent) => {
      event.preventDefault()

      if (!stripe || !elements) {
        return
      }

      setIsProcessing(true)
      setMessage('')

      // Appeler elements.submit() AVANT stripe.confirmPayment()
      const { error: submitError } = await elements.submit()
      
      if (submitError) {
        setMessage(submitError.message || (language === 'de' ? 'Formularfehler.' : 'Form error.'))
        setIsProcessing(false)
        return
      }

      const { error, paymentIntent } = await stripe.confirmPayment({
        elements,
        clientSecret,
        redirect: 'if_required',
      })

      if (error) {
        setMessage(error.message || (language === 'de' ? 'Zahlung fehlgeschlagen' : 'Payment failed'))
      } else if (paymentIntent?.status === 'succeeded') {
        setMessage(language === 'de' ? '✅ Zahlung erfolgreich! Weiterleitung...' : '✅ Payment succeeded! Redirecting...')
        setTimeout(() => {
          window.location.href = `/payment/success?plan=${selectedPlan}`
        }, 1500)
      }

      setIsProcessing(false)
    }

    return (
      <form onSubmit={handleSubmit} className="space-y-6">
        <PaymentElement />
        <button
          type="submit"
          disabled={!stripe || isProcessing}
          className="w-full bg-[#00BFA6] hover:bg-[#00A693] text-white py-3 px-6 rounded-lg font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {isProcessing ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              {language === 'de' ? 'Wird verarbeitet...' : 'Processing...'}
            </>
          ) : (
            language === 'de' ? 'Jetzt bezahlen' : 'Pay Now'
          )}
        </button>
        {message && (
          <div className={`p-3 rounded-lg text-sm ${
            message.includes('✅') 
              ? 'bg-green-100 text-green-800 border border-green-200' 
              : 'bg-red-100 text-red-800 border border-red-200'
          }`}>
            {message}
          </div>
        )}
      </form>
    )
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="p-6 border-b">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900">
              {language === 'de' ? 'Wählen Sie Ihren Plan' : 'Choose Your Plan'}
            </h2>
            <p className="text-gray-600 mt-1">
              {language === 'de' 
                ? 'Schalten Sie alle MieteNow-Funktionen frei' 
                : 'Unlock all MieteNow features'
              }
            </p>
          </div>
        </div>

        {/* Contenu conditionnel */}
        <div className="p-6">
          {!showPaymentForm ? (
            <>
              {/* Sélection de plan */}
              <div className="max-w-2xl mx-auto mb-8">
                {plans.map((plan) => (
                  <div
                    key={plan.id}
                    className={`bg-gray-50 border rounded-xl p-6 mb-4 cursor-pointer transition-all duration-200 ${
                      selectedPlan === plan.id
                        ? 'border-[#00BFA6] bg-white'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                    onClick={() => setSelectedPlan(plan.id)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <div className={`w-6 h-6 rounded-full border-2 mr-4 flex items-center justify-center ${
                          selectedPlan === plan.id
                            ? 'border-[#00BFA6] bg-[#00BFA6]'
                            : 'border-gray-300'
                        }`}>
                          {selectedPlan === plan.id && (
                            <div className="w-3 h-3 bg-white rounded-full"></div>
                          )}
                        </div>
                        <div className="flex items-center">
                          <span className="text-gray-900 font-semibold text-lg mr-3">{plan.name}</span>
                          {plan.popular && (
                            <span className="bg-[#00BFA6] text-white text-sm px-3 py-1 rounded-full font-medium">
                              {language === 'de' ? 'Beliebt' : 'Most Popular'}
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="text-right">
                        {plan.discount && (
                          <div className="text-green-600 text-base font-medium">{plan.discount}</div>
                        )}
                        <span className="text-gray-900 font-bold text-2xl">{plan.price}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* CTA */}
              <div className="text-center mb-6 relative z-10">
                <div className="flex justify-center">
                  <button
                    onClick={handleSelectPlan}
                    disabled={isLoading}
                    className="w-full max-w-md bg-[#00BFA6] hover:bg-[#00A693] text-white py-6 px-8 rounded-lg font-bold text-lg transition-colors duration-200 cursor-pointer relative z-20 block disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    style={{minHeight: '60px'}}
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        {language === 'de' ? 'Wird geladen...' : 'Loading...'}
                      </>
                    ) : (
                      language === 'de' ? 'Plan jetzt aktivieren' : 'Activate Your Plan Now'
                    )}
                  </button>
                </div>
              </div>
              
              {paymentError && (
                <div className="text-center mb-4">
                  <div className="bg-red-100 text-red-800 border border-red-200 px-4 py-3 rounded-lg text-sm">
                    {paymentError}
                  </div>
                </div>
              )}
              
              <div className="text-center relative z-5">
                <div className="flex items-center justify-center mb-1">
                  <span className="text-gray-900 font-medium mr-2 text-sm">
                    {language === 'de' ? 'Ausgezeichnet' : 'Excellent'}
                  </span>
                  <div className="flex items-center">
                    <Star className="w-4 h-4 text-blue-600" fill="currentColor" />
                    <Star className="w-4 h-4 text-blue-600" fill="currentColor" />
                    <Star className="w-4 h-4 text-blue-600" fill="currentColor" />
                    <Star className="w-4 h-4 text-blue-600" fill="currentColor" />
                    <Star className="w-4 h-4 text-blue-300" fill="currentColor" />
                  </div>
                </div>
                <p className="text-gray-600 text-xs">
                  {language === 'de' ? '350+ zufriedene Kunden' : '350+ satisfied customers'}
                </p>
              </div>
            </>
          ) : (
            <>
              {/* Formulaire de paiement */}
              <div className="max-w-2xl mx-auto">
                <div className="text-center mb-6">
                  <h3 className="text-xl font-bold text-gray-900 mb-2">
                    {language === 'de' ? 'Zahlung abschließen' : 'Complete Payment'}
                  </h3>
                  <p className="text-gray-600">
                    {language === 'de' 
                      ? `Plan: ${plans.find(p => p.id === selectedPlan)?.name} - ${plans.find(p => p.id === selectedPlan)?.price}`
                      : `Plan: ${plans.find(p => p.id === selectedPlan)?.name} - ${plans.find(p => p.id === selectedPlan)?.price}`
                    }
                  </p>
                </div>
                
                {clientSecret && process.env.NEXT_PUBLIC_STRIPE_API && (
                  <Elements stripe={loadStripe(process.env.NEXT_PUBLIC_STRIPE_API)} options={{ clientSecret }}>
                    <PaymentForm />
                  </Elements>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
