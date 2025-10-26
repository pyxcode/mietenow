import { NextRequest, NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'
import connectDB from '@/lib/mongodb'
import { User } from '@/models'

export const runtime = 'nodejs'

const JWT_SECRET = process.env.JWT_SECRET
if (!JWT_SECRET) {
  throw new Error('JWT_SECRET not configured')
}

export async function GET(req: NextRequest) {
  try {
    const authHeader = req.headers.get('authorization')
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Token d\'authentification requis' },
        { status: 401 }
      )
    }

    const token = authHeader.substring(7) // Enlever "Bearer "

      // Vérifier le token JWT
      const { verifyToken } = await import('@/lib/auth')
      const decoded = await verifyToken(token)

    // Connexion à la base de données
    await connectDB()

    // Trouver l'utilisateur
    const user = await User.findById(decoded.userId)
    if (!user) {
      return NextResponse.json(
        { error: 'Utilisateur non trouvé' },
        { status: 404 }
      )
    }

    // Retourner les informations utilisateur
    return NextResponse.json({
      success: true,
      user: {
        id: user._id,
        firstName: user.first_name,
        lastName: user.last_name,
        email: user.email,
        plan: user.plan,
        subscription_status: user.subscription_status,
        plan_expires_at: user.plan_expires_at,
        isSubscribed: user.isSubscribed,
        searchPreferences: user.search_preferences
      }
    })

  } catch (error: any) {
    if (error.name === 'JsonWebTokenError') {
      return NextResponse.json(
        { error: 'Token invalide' },
        { status: 401 }
      )
    }
    
    if (error.name === 'TokenExpiredError') {
      return NextResponse.json(
        { error: 'Token expiré' },
        { status: 401 }
      )
    }

    console.error('Erreur lors de la vérification:', error)
    return NextResponse.json(
      { error: 'Erreur serveur lors de la vérification' },
      { status: 500 }
    )
  }
}
