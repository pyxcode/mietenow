import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'

export const runtime = 'nodejs'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-09-30.clover',
})

export async function POST(req: NextRequest) {
  try {
    const { priceId, plan, userId } = await req.json()

    // Récupérer les détails du prix depuis Stripe
    const price = await stripe.prices.retrieve(priceId)
    
    // Créer le Payment Intent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: price.unit_amount!,
      currency: price.currency,
      metadata: {
        plan: plan,
        priceId: priceId,
        userId: userId || 'anonymous' // Inclure le userId pour le webhook
      },
      automatic_payment_methods: {
        enabled: true,
      },
    })

    return NextResponse.json({ 
      clientSecret: paymentIntent.client_secret,
      amount: price.unit_amount,
      currency: price.currency
    })
  } catch (error: any) {
    console.error('Payment Intent creation failed:', error)
    return new NextResponse(`Error: ${error.message}`, { status: 400 })
  }
}
