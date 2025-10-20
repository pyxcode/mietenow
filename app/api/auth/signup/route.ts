import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'
import User from '@/models/User'
import { hashPassword } from '@/lib/auth'

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
    const existingUser = await User.findOne({ email })
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
      firstName,
      lastName,
      email,
      password: hashedPassword,
      address,
      searchCriteria: {
        city: city || 'Berlin',
        minPrice: minPrice ? parseInt(minPrice) : undefined,
        maxPrice: maxPrice ? parseInt(maxPrice) : undefined,
        minRooms: minRooms ? parseInt(minRooms) : undefined,
        maxRooms: maxRooms ? parseInt(maxRooms) : undefined,
        minBedrooms: minBedrooms ? parseInt(minBedrooms) : undefined,
        maxBedrooms: maxBedrooms ? parseInt(maxBedrooms) : undefined,
        minSize: minSize ? parseInt(minSize) : undefined,
        maxSize: maxSize ? parseInt(maxSize) : undefined,
        propertyType: propertyType || [],
        furnishing: furnishing || []
      }
    })

    await user.save()

    return NextResponse.json({
      success: true,
      message: 'Compte créé avec succès',
      user: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        subscription: user.subscription
      }
    })

  } catch (error) {
    console.error('Signup error:', error)
    
    return NextResponse.json({
      success: false,
      message: 'Erreur lors de la création du compte'
    }, { status: 500 })
  }
}
