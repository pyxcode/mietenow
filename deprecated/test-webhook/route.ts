import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'
import { User, Transaction } from '@/models'

export async function POST(req: NextRequest) {
  try {
    const { userId, plan, amount, currency = 'eur' } = await req.json()
    
    if (!userId || !plan || !amount) {
      return NextResponse.json(
        { error: 'userId, plan, and amount are required' },
        { status: 400 }
      )
    }

    await connectDB()

    // Vérifier si l'utilisateur existe
    const user = await User.findById(userId)
    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    // Simuler un PaymentIntent réussi
    const mockPaymentIntent = {
      id: `pi_test_${Date.now()}`,
      amount: amount,
      currency: currency,
      metadata: {
        userId: userId,
        plan: plan,
        priceId: 'price_test'
      }
    }

    // Calculer la date d'expiration
    const expiresAt = calculateExpirationDate(plan)
    
    // Créer une nouvelle transaction
    const transaction = new Transaction({
      user_id: user._id,
      stripe_id: mockPaymentIntent.id,
      plan: plan,
      amount: amount,
      currency: currency,
      payment_status: 'completed',
      expires_at: expiresAt
    })

    await transaction.save()

    // Mettre à jour le plan de l'utilisateur
    const newPlan = mapPlanToUserPlan(plan)
    user.plan = newPlan
    user.subscription_status = 'active'
    await user.save()

    return NextResponse.json({
      success: true,
      message: 'Test transaction created successfully',
      transaction: {
        id: transaction._id,
        stripeId: transaction.stripe_id,
        plan: transaction.plan,
        amount: transaction.amount,
        currency: transaction.currency,
        status: transaction.payment_status,
        expiresAt: transaction.expires_at
      },
      user: {
        id: user._id,
        email: user.email,
        plan: user.plan,
        subscriptionStatus: user.subscription_status
      }
    })
  } catch (error: any) {
    console.error('Test webhook error:', error)
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    )
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
