import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { connectToDatabase } from '@/lib/mongodb'
import User from '@/models/User'

export async function requireValidPlan(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.email) {
      return NextResponse.redirect(new URL('/login', request.url))
    }

    await connectToDatabase()
    
    const user = await User.findOne({ email: session.user.email })
    if (!user) {
      return NextResponse.redirect(new URL('/login', request.url))
    }

    // Vérifier si le plan est valide
    const isPlanValid = user.isPlanValid()
    
    if (!isPlanValid) {
      // Rediriger vers la page de paiement avec un message
      const url = new URL('/payment', request.url)
      url.searchParams.set('reason', 'plan_expired')
      return NextResponse.redirect(url)
    }

    return null // Pas de redirection, l'utilisateur peut continuer

  } catch (error) {
    console.error('Erreur dans le middleware de plan:', error)
    return NextResponse.redirect(new URL('/login', request.url))
  }
}

export async function requirePaidPlan(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.email) {
      return NextResponse.redirect(new URL('/login', request.url))
    }

    await connectToDatabase()
    
    const user = await User.findOne({ email: session.user.email })
    if (!user) {
      return NextResponse.redirect(new URL('/login', request.url))
    }

    // Vérifier si l'utilisateur a un plan payant
    const hasPaidPlan = user.hasPaidPlan()
    
    if (!hasPaidPlan) {
      // Rediriger vers la page de paiement
      const url = new URL('/payment', request.url)
      url.searchParams.set('reason', 'no_plan')
      return NextResponse.redirect(url)
    }

    return null // Pas de redirection, l'utilisateur peut continuer

  } catch (error) {
    console.error('Erreur dans le middleware de plan payant:', error)
    return NextResponse.redirect(new URL('/login', request.url))
  }
}
