import { NextRequest, NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'
import { connectDB } from '@/lib/mongodb'
import User from '@/models/User'
import mongoose from 'mongoose'
// import { getServerSession } from 'next-auth'
// import { authOptions } from '@/lib/auth'

export const runtime = 'nodejs'

// GET - Récupérer les préférences de l'utilisateur
export async function GET(request: NextRequest) {
  try {
    console.log('🔍 API GET /api/user/preferences appelée')
    await connectDB()
    
    // Récupérer l'ID utilisateur depuis les headers ou le body
    const userId = request.headers.get('x-user-id') || (await request.json()).userId
    
    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 })
    }
    
    const user_id = new mongoose.Types.ObjectId(userId)
    console.log('🔍 Recherche utilisateur avec ID:', user_id)
    const user = await User.findById(user_id)
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    console.log('DEBUG: User found:', {
      id: user._id,
      name: user.first_name + ' ' + user.last_name,
      preferences: user.search_preferences
    })

    // Nettoyer les préférences pour supprimer les champs non utilisés
    const cleanPreferences = { ...user.search_preferences }
    delete cleanPreferences.features // Supprimer le champ features

    // S'assurer que tous les champs attendus sont présents
    const completePreferences = {
      city: cleanPreferences.city || 'Berlin',
      max_price: cleanPreferences.max_price || 1500,
      type: cleanPreferences.type || 'Any',
      districts: cleanPreferences.districts || [],
      furnishing: cleanPreferences.furnishing || 'Any',
      address: cleanPreferences.address || '',
      radius: cleanPreferences.radius || 5,
      coordinates: cleanPreferences.coordinates || {},
      min_bedrooms: cleanPreferences.min_bedrooms || 0,
      min_surface: cleanPreferences.min_surface || 0,
      max_surface: cleanPreferences.max_surface || 0
    }

    console.log('DEBUG: cleanPreferences:', cleanPreferences)
    console.log('DEBUG: completePreferences:', completePreferences)

    return NextResponse.json({ 
      success: true, 
      data: {
        search_preferences: completePreferences,
        onboarding_completed: user.onboarding_completed,
        current_step: user.current_step
      }
    })

  } catch (error) {
    console.error('Error fetching user preferences:', error)
    return NextResponse.json({ 
      error: 'Failed to fetch preferences' 
    }, { status: 500 })
  }
}

// PUT - Mettre à jour les préférences de l'utilisateur
export async function PUT(request: NextRequest) {
  try {
    await connectDB()
    
    // Récupérer l'ID utilisateur depuis les headers ou le body
    const userId = request.headers.get('x-user-id') || (await request.json()).userId
    
    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 })
    }
    
    const user_id = new mongoose.Types.ObjectId(userId)

    const body = await request.json()
    const { 
      search_preferences, 
      current_step, 
      onboarding_completed 
    } = body

    const updateData: any = {}
    
    if (search_preferences) {
      updateData.search_preferences = search_preferences
    }
    
    if (current_step) {
      updateData.current_step = current_step
    }
    
    if (onboarding_completed !== undefined) {
      updateData.onboarding_completed = onboarding_completed
    }

    const user = await User.findByIdAndUpdate(
      user_id,
      updateData,
      { new: true }
    )

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    return NextResponse.json({ 
      success: true, 
      data: {
        search_preferences: user.search_preferences,
        onboarding_completed: user.onboarding_completed,
        current_step: user.current_step
      },
      message: 'Preferences updated successfully' 
    })

  } catch (error) {
    console.error('Error updating user preferences:', error)
    return NextResponse.json({ 
      error: 'Failed to update preferences' 
    }, { status: 500 })
  }
}

// POST - Sauvegarder les préférences depuis le flow d'onboarding
export async function POST(request: NextRequest) {
  try {
    await connectDB()
    
    // Récupérer l'ID utilisateur depuis les headers ou le body
    const userId = request.headers.get('x-user-id') || (await request.json()).userId
    
    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 })
    }
    
    const user_id = new mongoose.Types.ObjectId(userId)

    const body = await request.json()
    const { 
      step, 
      preferences,
      email 
    } = body


    if (!step) {
      return NextResponse.json({ 
        error: 'Step is required' 
      }, { status: 400 })
    }

    const updateData: any = {
      current_step: step
    }

    // Mettre à jour les préférences selon l'étape
    if (preferences) {
      // Récupérer les préférences existantes pour faire une mise à jour partielle
      const existingUser = await User.findById(user_id)
      const existingPreferences = existingUser?.search_preferences || {}
      
      // Fusionner les nouvelles préférences avec les existantes
      updateData.search_preferences = { ...existingPreferences, ...preferences }
    }

    // Si c'est l'étape finale, marquer l'onboarding comme terminé
    if (step === 'complete') {
      updateData.onboarding_completed = true
    }

    // Mettre à jour l'email si fourni
    if (email) {
      updateData.email = email
    }

    // Utiliser upsert pour créer ou mettre à jour l'utilisateur
    const user = await User.findOneAndUpdate(
      { _id: user_id },
      updateData,
      { 
        new: true, 
        upsert: true,
        setDefaultsOnInsert: true
      }
    )


    // Nettoyer les préférences pour supprimer les champs non utilisés
    const cleanPreferences = { ...user.search_preferences }
    delete cleanPreferences.features // Supprimer le champ features

    // S'assurer que tous les champs attendus sont présents
    const completePreferences = {
      city: cleanPreferences.city || 'Berlin',
      max_price: cleanPreferences.max_price || 1500,
      type: cleanPreferences.type || 'Any',
      districts: cleanPreferences.districts || [],
      furnishing: cleanPreferences.furnishing || 'Any',
      address: cleanPreferences.address || '',
      radius: cleanPreferences.radius || 5,
      coordinates: cleanPreferences.coordinates || {},
      min_bedrooms: cleanPreferences.min_bedrooms || 0,
      min_surface: cleanPreferences.min_surface || 0,
      max_surface: cleanPreferences.max_surface || 0
    }

    return NextResponse.json({ 
      success: true, 
      data: {
        search_preferences: completePreferences,
        onboarding_completed: user.onboarding_completed,
        current_step: user.current_step
      },
      message: 'Preferences saved successfully' 
    })

  } catch (error) {
    console.error('Error saving user preferences:', error)
    return NextResponse.json({ 
      error: 'Failed to save preferences' 
    }, { status: 500 })
  }
}
