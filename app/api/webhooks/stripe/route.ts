import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import connectDB from '@/lib/mongodb'
import { User, Transaction } from '@/models'

export const runtime = 'nodejs'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-09-30.clover',
})

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!

export async function POST(req: NextRequest) {
  try {
    const body = await req.text()
    const signature = req.headers.get('stripe-signature')!

    let event: Stripe.Event

    try {
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret)
    } catch (err: any) {
      console.error('Webhook signature verification failed:', err.message)
      return new NextResponse(`Webhook Error: ${err.message}`, { status: 400 })
    }

    // Connexion à la base de données
    await connectDB()

    // Gérer les événements de paiement
    switch (event.type) {
      case 'payment_intent.succeeded':
        await handlePaymentIntentSucceeded(event.data.object as Stripe.PaymentIntent)
        break
      
      case 'payment_intent.payment_failed':
        await handlePaymentIntentFailed(event.data.object as Stripe.PaymentIntent)
        break
      
      default:
        console.log(`Unhandled event type: ${event.type}`)
    }

    return NextResponse.json({ received: true })
  } catch (error: any) {
    console.error('Webhook error:', error)
    return new NextResponse(`Webhook Error: ${error.message}`, { status: 400 })
  }
}

async function handlePaymentIntentSucceeded(paymentIntent: Stripe.PaymentIntent) {
  try {
    const { userId, plan, priceId } = paymentIntent.metadata
    
    console.log('Payment succeeded:', {
      paymentIntentId: paymentIntent.id,
      userId,
      plan,
      amount: paymentIntent.amount,
      currency: paymentIntent.currency
    })

    // Vérifier si l'utilisateur existe
    if (userId && userId !== 'anonymous') {
      const user = await User.findById(userId)
      
      if (user) {
        // Calculer la date d'expiration basée sur le plan
        const expiresAt = calculateExpirationDate(plan)
        
        // Créer une nouvelle transaction
        const transaction = new Transaction({
          user_id: user._id,
          stripe_id: paymentIntent.id,
          plan: plan,
          amount: paymentIntent.amount,
          currency: paymentIntent.currency,
          payment_status: 'completed',
          expires_at: expiresAt
        })

        await transaction.save()

        // Mettre à jour le plan de l'utilisateur
        user.plan = mapPlanToUserPlan(plan)
        user.subscription_status = 'active'
        await user.save()

        console.log('Transaction created and user updated:', {
          transactionId: transaction._id,
          userId: user._id,
          newPlan: user.plan
        })
      } else {
        console.error('User not found:', userId)
      }
    } else {
      console.log('Anonymous payment - no user to update')
    }
  } catch (error) {
    console.error('Error handling payment success:', error)
  }
}

async function handlePaymentIntentFailed(paymentIntent: Stripe.PaymentIntent) {
  try {
    const { userId, plan } = paymentIntent.metadata
    
    console.log('Payment failed:', {
      paymentIntentId: paymentIntent.id,
      userId,
      plan,
      amount: paymentIntent.amount
    })

    // Créer une transaction avec statut failed
    if (userId && userId !== 'anonymous') {
      const transaction = new Transaction({
        user_id: userId,
        stripe_id: paymentIntent.id,
        plan: plan,
        amount: paymentIntent.amount,
        currency: paymentIntent.currency,
        payment_status: 'failed',
        expires_at: new Date() // Pas d'expiration pour un paiement échoué
      })

      await transaction.save()
      console.log('Failed transaction recorded:', transaction._id)
    }
  } catch (error) {
    console.error('Error handling payment failure:', error)
  }
}

function calculateExpirationDate(plan: string): Date {
  const now = new Date()
  
  switch (plan) {
    case '2-week':
      return new Date(now.getTime() + 14 * 24 * 60 * 60 * 1000) // 14 jours
    case '1-month':
      return new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000) // 30 jours
    case '3-month':
      return new Date(now.getTime() + 90 * 24 * 60 * 60 * 1000) // 90 jours
    default:
      return new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000) // Par défaut 30 jours
  }
}

function mapPlanToUserPlan(plan: string): 'Free' | 'Premium' | 'Pro' {
  switch (plan) {
    case '2-week':
    case '1-month':
      return 'Premium'
    case '3-month':
      return 'Pro'
    default:
      return 'Premium'
  }
}
