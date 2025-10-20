import { NextRequest, NextResponse } from 'next/server'
import dbConnect from '@/lib/mongodb'
import User from '@/models/User'
import { generateToken } from '@/lib/auth'

export async function POST(req: NextRequest) {
  try {
    await dbConnect()

    const { email, password } = await req.json()

    if (!email || !password) {
      return NextResponse.json({ error: 'Email et mot de passe requis' }, { status: 400 })
    }

    // Trouver l'utilisateur avec le mot de passe
    const user = await User.findOne({ email }).select('+password')
    
    if (!user) {
      return NextResponse.json({ error: 'Email ou mot de passe incorrect' }, { status: 401 })
    }

    // Vérifier le mot de passe
    const isPasswordValid = await user.comparePassword(password)
    
    if (!isPasswordValid) {
      return NextResponse.json({ error: 'Email ou mot de passe incorrect' }, { status: 401 })
    }

    // Générer le token JWT
    const token = generateToken(user)

    return NextResponse.json({
      success: true,
      token,
      user: {
        id: user._id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        isSubscribed: user.isSubscribed
      }
    })

  } catch (error: any) {
    console.error('Login error:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
