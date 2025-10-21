'use client'

import React, { useState, useEffect } from 'react'
import {
  PaymentElement,
  useStripe,
  useElements,
  Elements,
} from '@stripe/react-stripe-js'
import { loadStripe } from '@stripe/stripe-js'
import { useLanguage } from '@/contexts/LanguageContext'
import { useAuth } from '@/contexts/AuthContext'

interface PaymentFormProps {
  selectedPlan: string
  onSuccess: () => void
  onError: (error: string) => void
}

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!)

const CheckoutForm: React.FC<PaymentFormProps> = ({ selectedPlan, onSuccess, onError }) => {
  const stripe = useStripe()
  const elements = useElements()
  const { language } = useLanguage()
  const { user } = useAuth()

  const [message, setMessage] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [clientSecret, setClientSecret] = useState<string | null>(null)

  useEffect(() => {
    const fetchClientSecret = async () => {
      console.log('Fetching client secret for plan:', selectedPlan)
      try {
        const priceIds = {
          '2-week': 'price_1SKRhoCLZ8IL4RE4BESFrtzu',
          '1-month': 'price_1SKRh8CLZ8IL4RE4XWUw9lLP',
          '3-month': 'price_1SKRgUCLZ8IL4RE4o9zRXYtc'
        }
        const priceId = priceIds[selectedPlan as keyof typeof priceIds]
        console.log('Using price ID:', priceId)

        if (!priceId) {
          console.error('Plan not found:', selectedPlan)
          onError(language === 'de' ? 'Plan nicht gefunden.' : 'Plan not found.')
          return
        }

        console.log('Making API call to create payment intent...')
        const response = await fetch('/api/create-payment-intent', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            priceId, 
            plan: selectedPlan,
            userId: user?.id || 'anonymous'
          }),
        })

        console.log('API response status:', response.status)
        const data = await response.json()
        console.log('API response data:', data)

        if (data.clientSecret) {
          console.log('Client secret received, setting state...')
          setClientSecret(data.clientSecret)
        } else {
          console.error('No client secret in response:', data)
          onError(data.error || (language === 'de' ? 'Fehler beim Erstellen des Payment Intents.' : 'Error creating Payment Intent.'))
        }
      } catch (error) {
        console.error('Error fetching client secret:', error)
        onError(language === 'de' ? 'Netzwerkfehler.' : 'Network error.')
      }
    }

    fetchClientSecret()
  }, [selectedPlan, onError, language])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    console.log('Form submitted!')

    if (!stripe || !elements || !clientSecret) {
      console.log('Missing dependencies:', { stripe: !!stripe, elements: !!elements, clientSecret: !!clientSecret })
      setMessage(language === 'de' ? 'Zahlungssystem nicht bereit.' : 'Payment system not ready.')
      return
    }

    console.log('Starting payment process...')
    setIsLoading(true)
    setMessage(null)

    // Appeler elements.submit() AVANT stripe.confirmPayment()
    const { error: submitError } = await elements.submit()
    
    if (submitError) {
      setMessage(submitError.message || (language === 'de' ? 'Formularfehler.' : 'Form error.'))
      onError(submitError.message || (language === 'de' ? 'Formularfehler.' : 'Form error.'))
      setIsLoading(false)
      return
    }

    const { error, paymentIntent } = await stripe.confirmPayment({
      elements,
      clientSecret,
      redirect: 'if_required',
    })

    console.log('Stripe response:', { error, paymentIntent })

    if (error) {
      console.error('Stripe error details:', error)
      if (error.type === 'card_error' || error.type === 'validation_error') {
        setMessage(error.message || (language === 'de' ? 'Kartenfehler.' : 'Card error.'))
      } else {
        setMessage(language === 'de' ? 'Ein unerwarteter Fehler ist aufgetreten.' : 'An unexpected error occurred.')
      }
      onError(error.message || (language === 'de' ? 'Zahlung fehlgeschlagen.' : 'Payment failed.'))
    } else if (paymentIntent) {
      if (paymentIntent.status === 'succeeded') {
        console.log('Payment succeeded:', paymentIntent)
        setMessage(language === 'de' ? '✅ Zahlung erfolgreich! Weiterleitung...' : '✅ Payment successful! Redirecting...')
        // Attendre un peu pour que l'utilisateur voie le message de succès
        setTimeout(() => {
          onSuccess()
        }, 1500)
      } else if (paymentIntent.status === 'requires_action') {
        console.log('Payment requires action:', paymentIntent)
        setMessage(language === 'de' ? 'Zahlung erfordert weitere Aktion.' : 'Payment requires additional action.')
      } else {
        console.log('Payment status:', paymentIntent.status)
        setMessage(language === 'de' ? 'Zahlung nicht abgeschlossen.' : 'Payment not completed.')
      }
    } else {
      console.log('No payment intent returned')
      setMessage(language === 'de' ? 'Keine Antwort vom Zahlungssystem.' : 'No response from payment system.')
    }

    setIsLoading(false)
  }

  // Debug: Log the state of dependencies
  console.log('PaymentForm render:', { 
    isLoading, 
    stripe: !!stripe, 
    elements: !!elements, 
    clientSecret: !!clientSecret,
    buttonDisabled: isLoading || !stripe || !elements || !clientSecret
  })

  return (
    <form 
      id="payment-form" 
      onSubmit={(e) => {
        console.log('Form onSubmit triggered!')
        handleSubmit(e)
      }} 
      className="bg-white p-6 rounded-lg shadow-lg"
    >
      {clientSecret && (
        <PaymentElement id="payment-element" options={{ layout: 'tabs' }} />
      )}
      {!clientSecret && (
        <div className="text-center py-4 text-gray-600">
          {language === 'de' ? 'Lade Zahlungsformular...' : 'Loading payment form...'}
        </div>
      )}
      <button 
        disabled={isLoading || !stripe || !elements || !clientSecret} 
        id="submit"
        type="submit"
        className="w-full bg-[#00BFA6] hover:bg-[#00A693] text-white py-4 rounded-lg font-bold text-lg mt-6 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
        onClick={(e) => {
          console.log('Button clicked!', { isLoading, stripe: !!stripe, elements: !!elements, clientSecret: !!clientSecret })
          if (isLoading || !stripe || !elements || !clientSecret) {
            e.preventDefault()
            console.log('Button click prevented due to missing dependencies')
            return
          }
          console.log('Button click allowed, form should submit')
        }}
      >
        <span id="button-text">
          {isLoading ? (language === 'de' ? 'Verarbeitung...' : 'Processing...') : (language === 'de' ? 'Jetzt bezahlen' : 'Pay now')}
        </span>
      </button>
      {message && (
        <div id="payment-message" className={`mt-4 p-3 rounded-lg text-sm font-medium ${
          message.includes('succeeded') || message.includes('réussi') 
            ? 'bg-green-100 text-green-800 border border-green-200' 
            : 'bg-red-100 text-red-800 border border-red-200'
        }`}>
          {message}
        </div>
      )}
    </form>
  )
}

const PaymentForm: React.FC<PaymentFormProps> = (props) => {
  const { language } = useLanguage()
  const { user } = useAuth()
  const [options, setOptions] = useState<any>(null)

  useEffect(() => {
    if (props.selectedPlan) {
      const priceIds = {
        '2-week': 'price_1SKRhoCLZ8IL4RE4BESFrtzu',
        '1-month': 'price_1SKRh8CLZ8IL4RE4XWUw9lLP',
        '3-month': 'price_1SKRgUCLZ8IL4RE4o9zRXYtc'
      }
      const priceId = priceIds[props.selectedPlan as keyof typeof priceIds]

      if (!priceId) {
        props.onError(language === 'de' ? 'Plan non trouvé.' : 'Plan not found.')
        return
      }

      fetch('/api/create-payment-intent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          priceId, 
          plan: props.selectedPlan,
          userId: user?.id || 'anonymous'
        }),
      })
        .then((res) => res.json())
        .then((data) => {
          if (data.clientSecret) {
            setOptions({ clientSecret: data.clientSecret })
          } else {
            props.onError(data.error || (language === 'de' ? 'Erreur lors de la création du Payment Intent.' : 'Error creating Payment Intent.'))
          }
        })
        .catch((error) => {
          console.error('Error fetching client secret:', error)
          props.onError(language === 'de' ? 'Erreur réseau.' : 'Network error.')
        })
    }
  }, [props.selectedPlan, props.onError, language])

  if (!options) {
    return (
      <div className="flex justify-center items-center h-48 bg-white p-6 rounded-lg shadow-lg">
        <p className="text-gray-600">{language === 'de' ? 'Laden des Zahlungsformulars...' : 'Loading payment form...'}</p>
      </div>
    )
  }

  return (
    <Elements options={options} stripe={stripePromise}>
      <CheckoutForm {...props} />
    </Elements>
  )
}

export default PaymentForm