import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'
import User from '@/models/User'
import { hashPassword } from '@/lib/auth'

export const runtime = 'nodejs'

export async function POST(request: NextRequest) {
  try {
    await connectDB()

    const body = await request.json()
    const {
      firstName,
      lastName,
      email,
      password,
      address,
      city,
      minPrice,
      maxPrice,
      minRooms,
      maxRooms,
      minBedrooms,
      maxBedrooms,
      minSize,
      maxSize,
      propertyType,
      furnishing
    } = body

    // Validation des champs requis
    if (!firstName || !lastName || !email || !password) {
      return NextResponse.json({
        success: false,
        message: 'Tous les champs requis doivent être remplis'
      }, { status: 400 })
    }

    // Vérifier si l'utilisateur existe déjà
    const existingUser = await User.findOne({ email: email.toLowerCase() })
    if (existingUser) {
      return NextResponse.json({
        success: false,
        message: 'Un compte avec cet email existe déjà'
      }, { status: 400 })
    }

    // Hasher le mot de passe
    const hashedPassword = await hashPassword(password)

    // Créer l'utilisateur
    const user = new User({
      first_name: firstName,
      last_name: lastName,
      email: email.toLowerCase(),
      password_hash: hashedPassword,
      plan: 'empty',
      subscription_status: 'active',
      search_preferences: {
        city: city || 'Berlin',
        min_price: minPrice ? parseInt(minPrice) : undefined,
        max_price: maxPrice ? parseInt(maxPrice) : undefined,
        min_rooms: minRooms ? parseInt(minRooms) : undefined,
        max_rooms: maxRooms ? parseInt(maxRooms) : undefined,
        min_bedrooms: minBedrooms ? parseInt(minBedrooms) : undefined,
        max_bedrooms: maxBedrooms ? parseInt(maxBedrooms) : undefined,
        min_surface: minSize ? parseInt(minSize) : undefined,
        max_surface: maxSize ? parseInt(maxSize) : undefined,
        type: propertyType || 'Any',
        furnishing: furnishing || 'Any',
        address: address || '',
        radius: 5
      }
    })

    await user.save()

    return NextResponse.json({
      success: true,
      message: 'Compte créé avec succès',
      user: {
        id: user._id,
        firstName: user.first_name,
        lastName: user.last_name,
        email: user.email,
        plan: user.plan
      }
    })

  } catch (error: any) {
    console.error('Signup error:', error)

    const message = process.env.NODE_ENV === 'production'
      ? 'Erreur lors de la création du compte'
      : (error?.message || JSON.stringify(error))

    return NextResponse.json({
      success: false,
      message
    }, { status: 500 })
  }
}
