import { NextRequest, NextResponse } from 'next/server'
export const runtime = 'nodejs'

import bcrypt from 'bcryptjs'
import connectDB from '@/lib/mongodb'
import { getUserModel } from '@/lib/get-user-model'

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

    // Connexion à la base de données (force déjà mietenow-prod)
    await connectDB()
    
    // Obtenir le modèle User (déjà sur mietenow-prod)
    const UserModel = await getUserModel()
    console.log(`🔐 Login - Utilise le modèle User`)

    // Trouver l'utilisateur par email
    console.log('🔍 Recherche utilisateur avec email:', email.toLowerCase())
    const user = await UserModel.findOne({ email: email.toLowerCase() })
    console.log('🔍 User found:', user ? 'YES' : 'NO')
    if (user) {
      const userDoc = user.toObject ? user.toObject() : user
      console.log('🔍 User details:', {
        id: user._id,
        email: (userDoc as any).email,
        plan: (userDoc as any).plan,
        password_exists: !!((userDoc as any).password || (userDoc as any).password_hash)
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
    const userDoc = user.toObject ? user.toObject() : user
    const passwordField = (userDoc as any).password || (userDoc as any).password_hash
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
    ;(user as any).last_login = new Date()
    await (user as any).save()

      // Créer le token JWT
      const { generateToken } = await import('@/lib/auth')
      const token = await generateToken(user as any)

    // Retourner la réponse sans le mot de passe
    return NextResponse.json({
      success: true,
      message: 'Connexion réussie',
      user: {
        id: user._id,
        firstName: (userDoc as any).first_name,
        lastName: (userDoc as any).last_name,
        email: (userDoc as any).email,
        plan: (userDoc as any).plan,
        subscription_status: (userDoc as any).subscription_status,
        plan_expires_at: (userDoc as any).plan_expires_at,
        isSubscribed: (userDoc as any).isSubscribed || false
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