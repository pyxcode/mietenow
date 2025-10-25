import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import connectDB from '@/lib/mongodb'
import { User } from '@/models'

export const runtime = 'nodejs'

const JWT_SECRET = process.env.JWT_SECRET
if (!JWT_SECRET) {
  throw new Error('JWT_SECRET not configured')
}

export async function POST(req: NextRequest) {
  try {
    const { firstName, lastName, email, password } = await req.json()

    // Validation des données
    if (!firstName || !lastName || !email || !password) {
      return NextResponse.json(
        { error: 'Your first and last name are required' },
        { status: 400 }
      )
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: 'Le mot de passe doit contenir au moins 6 caractères' },
        { status: 400 }
      )
    }

    // Connexion à la base de données
    await connectDB()

    // Vérifier si l'utilisateur existe déjà
    const existingUser = await User.findOne({ email: email.toLowerCase() })
    if (existingUser) {
      return NextResponse.json(
        { error: 'Un compte avec cet email existe déjà' },
        { status: 400 }
      )
    }

    // Hacher le mot de passe
    const saltRounds = 12
    const passwordHash = await bcrypt.hash(password, saltRounds)

    // Créer le nouvel utilisateur
    const newUser = new User({
      first_name: firstName.trim(),
      last_name: lastName.trim(),
      email: email.toLowerCase().trim(),
      password_hash: passwordHash,
      plan: 'empty',
      subscription_status: 'active',
      search_preferences: {
        city: 'Berlin',
        max_price: 1500,
        type: 'Apartment',
        min_surface: 30
      }
    })

    await newUser.save()

      // Créer le token JWT
      const { generateToken } = await import('@/lib/auth')
      const token = await generateToken(newUser)

    // Retourner la réponse sans le mot de passe
    return NextResponse.json({
      success: true,
      message: 'Compte créé avec succès',
      user: {
        id: newUser._id,
        firstName: newUser.first_name,
        lastName: newUser.last_name,
        email: newUser.email,
        plan: newUser.plan
      },
      token
    })

  } catch (error: any) {
    console.error('Erreur lors de l\'inscription:', error)
    console.error('Détails de l\'erreur:', error.message)
    console.error('Stack trace:', error.stack)
    return NextResponse.json(
      { error: 'Erreur serveur lors de l\'inscription', details: error.message },
      { status: 500 }
    )
  }
}
