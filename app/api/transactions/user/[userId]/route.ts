import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'
import { Transaction } from '@/models'

export const runtime = 'nodejs'

export async function GET(
  req: NextRequest,
  { params }: { params: { userId: string } }
) {
  try {
    await connectDB()
    
    const { userId } = params
    
    // Récupérer toutes les transactions de l'utilisateur
    const transactions = await Transaction.find({ user_id: userId })
      .sort({ created_at: -1 })
      .limit(10)
    
    // Récupérer les transactions actives
    const activeTransactions = await Transaction.find({
      user_id: userId,
      payment_status: 'completed',
      expires_at: { $gt: new Date() }
    }).sort({ created_at: -1 })
    
    return NextResponse.json({
      success: true,
      userId,
      totalTransactions: transactions.length,
      activeTransactionsCount: activeTransactions.length,
      transactions: transactions.map(t => ({
        id: t._id,
        stripeId: t.stripe_id,
        plan: t.plan,
        amount: t.amount,
        currency: t.currency,
        status: t.payment_status,
        createdAt: t.created_at,
        expiresAt: t.expires_at,
        isActive: t.payment_status === 'completed' && t.expires_at > new Date()
      })),
      activeTransactions: activeTransactions.map(t => ({
        id: t._id,
        plan: t.plan,
        expiresAt: t.expires_at,
        daysRemaining: Math.ceil((t.expires_at.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))
      }))
    })
  } catch (error: any) {
    console.error('Error fetching user transactions:', error)
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    )
  }
}
