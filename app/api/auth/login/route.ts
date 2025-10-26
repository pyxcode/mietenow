import { NextRequest, NextResponse } from 'next/server'
export const runtime = 'nodejs'

import bcrypt from 'bcryptjs'
import connectDB from '@/lib/mongodb'
import { User } from '@/models'

const JWT_SECRET = process.env.JWT_SECRET
if (!JWT_SECRET) {
  throw new Error('JWT_SECRET not configured')
}

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json()

    // Validation des données
    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email et mot de passe requis' },
        { status: 400 }
      )
    }

    // Connexion à la base de données
    await connectDB()

    // Trouver l'utilisateur par email
    console.log('🔍 Recherche utilisateur avec email:', email.toLowerCase())
    const user = await User.findOne({ email: email.toLowerCase() })
    console.log('🔍 User found:', user ? 'YES' : 'NO')
    if (user) {
      console.log('🔍 User details:', {
        id: user._id,
        email: user.email,
        plan: user.plan,
        password_exists: !!user.password
      })
    }
    if (!user) {
      console.log('❌ Utilisateur non trouvé pour:', email.toLowerCase())
      return NextResponse.json(
        { error: 'Email ou mot de passe incorrect' },
        { status: 401 }
      )
    }

    // Vérifier le mot de passe
    const passwordField = user.password || user.password_hash
    console.log('🔑 Password field exists:', !!passwordField)
    if (!passwordField) {
      return NextResponse.json(
        { error: 'Email ou mot de passe incorrect' },
        { status: 401 }
      )
    }
    const isPasswordValid = await bcrypt.compare(password, passwordField)
    console.log('✅ Password valid:', isPasswordValid)
    if (!isPasswordValid) {
      return NextResponse.json(
        { error: 'Email ou mot de passe incorrect' },
        { status: 401 }
      )
    }

    // Mettre à jour la dernière connexion
    user.last_login = new Date()
    await user.save()

      // Créer le token JWT
      const { generateToken } = await import('@/lib/auth')
      const token = await generateToken(user)

    // Retourner la réponse sans le mot de passe
    return NextResponse.json({
      success: true,
      message: 'Connexion réussie',
      user: {
        id: user._id,
        firstName: user.first_name,
        lastName: user.last_name,
        email: user.email,
        plan: user.plan,
        subscription_status: user.subscription_status,
        plan_expires_at: user.plan_expires_at,
        isSubscribed: user.isSubscribed
      },
      token
    })

  } catch (error: any) {
    console.error('Erreur lors de la connexion:', error)
    return NextResponse.json(
      { error: 'Erreur serveur lors de la connexion' },
      { status: 500 }
    )
  }
}