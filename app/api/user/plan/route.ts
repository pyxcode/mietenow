import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'
import { User } from '@/models'
import { getServerSession } from 'next-auth'

export const runtime = 'nodejs'

// GET - Vérifier le statut du plan de l'utilisateur
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession()
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
    }

    await connectDB()
    
    const user = await User.findOne({ email: session.user.email })
    if (!user) {
      return NextResponse.json({ error: 'Utilisateur non trouvé' }, { status: 404 })
    }

    // Vérifier si le plan est valide
    const isPlanValid = user.isPlanValid()
    const planStatus = user.plan === 'empty' ? 'empty' : 
                      user.subscription_status === 'canceled' ? 'canceled' :
                      user.subscription_status === 'expired' ? 'expired' :
                      user.plan_expires_at && new Date() > new Date(user.plan_expires_at) ? 'expired' : 'active'

    return NextResponse.json({
      plan: user.plan,
      planExpiresAt: user.plan_expires_at,
      subscriptionStatus: user.subscription_status,
      isPlanValid,
      planStatus,
      hasPaidPlan: user.hasPaidPlan()
    })

  } catch (error) {
    console.error('Erreur lors de la vérification du plan:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}

// PUT - Mettre à jour le plan de l'utilisateur
export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession()
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
    }

    const { plan, action } = await request.json()

    await connectDB()
    
    const user = await User.findOne({ email: session.user.email })
    if (!user) {
      return NextResponse.json({ error: 'Utilisateur non trouvé' }, { status: 404 })
    }

    if (action === 'activate') {
      // Activer un nouveau plan
      const expiryDate = user.calculatePlanExpiry(plan)
      
      await User.findByIdAndUpdate(user._id, {
        plan,
        plan_expires_at: expiryDate,
        subscription_status: 'active'
      })

      return NextResponse.json({ 
        message: 'Plan activé avec succès',
        plan,
        planExpiresAt: expiryDate
      })

    } else if (action === 'cancel') {
      // Annuler l'abonnement
      await User.findByIdAndUpdate(user._id, {
        subscription_status: 'canceled'
      })

      return NextResponse.json({ message: 'Abonnement annulé' })

    } else if (action === 'expire') {
      // Marquer comme expiré
      await User.findByIdAndUpdate(user._id, {
        subscription_status: 'expired'
      })

      return NextResponse.json({ message: 'Plan marqué comme expiré' })

    } else if (action === 'reset') {
      // Remettre à zéro (pour les tests)
      await User.findByIdAndUpdate(user._id, {
        plan: 'empty',
        plan_expires_at: null,
        subscription_status: 'active'
      })

      return NextResponse.json({ message: 'Plan remis à zéro' })
    }

    return NextResponse.json({ error: 'Action non valide' }, { status: 400 })

  } catch (error) {
    console.error('Erreur lors de la mise à jour du plan:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
