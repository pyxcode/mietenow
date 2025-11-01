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
    
    // Connexion à la base de données (force déjà mietenow-prod)
    await connectDB()
    console.log('✅ Connecté à MongoDB - Base: mietenow-prod')
    
    // Récupérer l'ID utilisateur depuis les headers ou les query params
    const userId = request.headers.get('x-user-id') || 
                   new URL(request.url).searchParams.get('userId')
    
    if (!userId) {
      // Si pas d'userId, retourner des préférences par défaut
      return NextResponse.json({ 
        success: true, 
        data: {
          search_preferences: {
            city: 'Berlin',
            max_price: 1500,
            type: 'Any',
            districts: [],
            furnishing: 'Any',
            address: '',
            radius: 5,
            coordinates: {},
            min_bedrooms: 0,
            min_surface: 0,
            max_surface: 0
          },
          onboarding_completed: false,
          current_step: null
        }
      })
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

    // Préserver les valeurs réelles de l'utilisateur, utiliser des défauts seulement si vraiment manquant
    const completePreferences: any = {}
    
    // Ville - défaut seulement si vraiment manquant
    completePreferences.city = (cleanPreferences.city !== undefined && cleanPreferences.city !== null && cleanPreferences.city !== '') 
      ? cleanPreferences.city 
      : 'Berlin'
    
    // Prix max - défaut seulement si vraiment manquant
    completePreferences.max_price = (cleanPreferences.max_price !== undefined && cleanPreferences.max_price !== null) 
      ? cleanPreferences.max_price 
      : 1500
    
    // Prix min - peut être 0, donc on vérifie explicitement
    if (cleanPreferences.min_price !== undefined && cleanPreferences.min_price !== null) {
      completePreferences.min_price = cleanPreferences.min_price
    }
    
    // Type - défaut seulement si vraiment manquant
    completePreferences.type = (cleanPreferences.type !== undefined && cleanPreferences.type !== null && cleanPreferences.type !== '') 
      ? cleanPreferences.type 
      : 'Any'
    
    // Districts
    completePreferences.districts = cleanPreferences.districts || []
    
    // Furnishing - défaut seulement si vraiment manquant
    completePreferences.furnishing = (cleanPreferences.furnishing !== undefined && cleanPreferences.furnishing !== null && cleanPreferences.furnishing !== '') 
      ? cleanPreferences.furnishing 
      : 'Any'
    
    // Adresse - peut être vide string, donc on préserve toujours
    completePreferences.address = cleanPreferences.address !== undefined ? cleanPreferences.address : ''
    
    // Radius - défaut seulement si vraiment manquant
    completePreferences.radius = (cleanPreferences.radius !== undefined && cleanPreferences.radius !== null) 
      ? cleanPreferences.radius 
      : 5
    
    // Coordinates
    completePreferences.coordinates = cleanPreferences.coordinates || {}
    
    // Min bedrooms - peut être 0, donc on vérifie explicitement
    if (cleanPreferences.min_bedrooms !== undefined && cleanPreferences.min_bedrooms !== null) {
      completePreferences.min_bedrooms = cleanPreferences.min_bedrooms
    } else {
      completePreferences.min_bedrooms = 0
    }
    
    // Min/Max surface - peuvent être 0
    if (cleanPreferences.min_surface !== undefined && cleanPreferences.min_surface !== null) {
      completePreferences.min_surface = cleanPreferences.min_surface
    }
    if (cleanPreferences.max_surface !== undefined && cleanPreferences.max_surface !== null) {
      completePreferences.max_surface = cleanPreferences.max_surface
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
    
    // Lire le body une seule fois
    const body = await request.json()
    
    // Récupérer l'ID utilisateur depuis les headers ou le body
    const userId = request.headers.get('x-user-id') || body.userId
    
    if (!userId) {
      console.error('❌ User ID is required in POST /api/user/preferences')
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 })
    }
    
    const user_id = new mongoose.Types.ObjectId(userId)

    const { 
      step, 
      preferences,
      email 
    } = body
    
    console.log('📥 POST /api/user/preferences - Body received:', {
      userId,
      step,
      preferences,
      email: email ? 'provided' : 'not provided'
    })


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
      
      console.log('📋 Existing preferences:', JSON.stringify(existingPreferences))
      console.log('📋 New preferences to merge:', JSON.stringify(preferences))
      
      // Fusionner les nouvelles préférences avec les existantes
      // Important: préserver les valeurs fournies (même si elles sont 0, '', false, etc.)
      const mergedPreferences: any = { ...existingPreferences }
      
      // Mettre à jour uniquement les champs fournis dans preferences
      Object.keys(preferences).forEach(key => {
        // Préserver toutes les valeurs, même 0, '', false
        // IMPORTANT: min_price peut être 0, donc on doit le préserver
        const value = preferences[key]
        if (value !== undefined && value !== null) {
          mergedPreferences[key] = value
          console.log(`✅ Merged ${key}:`, value, `(type: ${typeof value})`)
        } else if (value === null) {
          // Si explicitement null, on peut le supprimer
          delete mergedPreferences[key]
          console.log(`🗑️  Removed ${key} (was null)`)
        } else {
          console.log(`⏭️ Skipping ${key}:`, value, `(undefined)`)
        }
      })
      
      // Vérification spéciale pour min_price - peut être 0
      if ('min_price' in preferences) {
        const minPriceValue = preferences.min_price
        if (minPriceValue !== undefined && minPriceValue !== null) {
          mergedPreferences.min_price = minPriceValue
          console.log(`✅✅ min_price explicitly set to:`, minPriceValue)
        }
      }
      
      console.log('📋 Merged preferences:', JSON.stringify(mergedPreferences))
      updateData.search_preferences = mergedPreferences
    }

    // Si c'est l'étape finale, marquer l'onboarding comme terminé
    if (step === 'complete') {
      updateData.onboarding_completed = true
    }

    // Mettre à jour l'email si fourni
    if (email) {
      updateData.email = email
    }

    console.log('💾 Updating user with data:', JSON.stringify(updateData))
    
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
    
    if (!user) {
      console.error('❌ User not found after update:', user_id)
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }
    
    console.log('✅ User updated successfully. Saved preferences:', JSON.stringify(user.search_preferences))


    // Nettoyer les préférences pour supprimer les champs non utilisés
    const cleanPreferences = { ...user.search_preferences }
    delete cleanPreferences.features // Supprimer le champ features

    // Préserver les valeurs réelles de l'utilisateur, utiliser des défauts seulement si vraiment manquant
    const completePreferences: any = {}
    
    // Ville - défaut seulement si vraiment manquant
    completePreferences.city = (cleanPreferences.city !== undefined && cleanPreferences.city !== null && cleanPreferences.city !== '') 
      ? cleanPreferences.city 
      : 'Berlin'
    
    // Prix max - défaut seulement si vraiment manquant
    completePreferences.max_price = (cleanPreferences.max_price !== undefined && cleanPreferences.max_price !== null) 
      ? cleanPreferences.max_price 
      : 1500
    
    // Prix min - peut être 0, donc on vérifie explicitement
    if (cleanPreferences.min_price !== undefined && cleanPreferences.min_price !== null) {
      completePreferences.min_price = cleanPreferences.min_price
    }
    
    // Type - défaut seulement si vraiment manquant
    completePreferences.type = (cleanPreferences.type !== undefined && cleanPreferences.type !== null && cleanPreferences.type !== '') 
      ? cleanPreferences.type 
      : 'Any'
    
    // Districts
    completePreferences.districts = cleanPreferences.districts || []
    
    // Furnishing - défaut seulement si vraiment manquant
    completePreferences.furnishing = (cleanPreferences.furnishing !== undefined && cleanPreferences.furnishing !== null && cleanPreferences.furnishing !== '') 
      ? cleanPreferences.furnishing 
      : 'Any'
    
    // Adresse - peut être vide string, donc on préserve toujours
    completePreferences.address = cleanPreferences.address !== undefined ? cleanPreferences.address : ''
    
    // Radius - défaut seulement si vraiment manquant
    completePreferences.radius = (cleanPreferences.radius !== undefined && cleanPreferences.radius !== null) 
      ? cleanPreferences.radius 
      : 5
    
    // Coordinates
    completePreferences.coordinates = cleanPreferences.coordinates || {}
    
    // Min bedrooms - peut être 0, donc on vérifie explicitement
    if (cleanPreferences.min_bedrooms !== undefined && cleanPreferences.min_bedrooms !== null) {
      completePreferences.min_bedrooms = cleanPreferences.min_bedrooms
    } else {
      completePreferences.min_bedrooms = 0
    }
    
    // Min/Max surface - peuvent être 0
    if (cleanPreferences.min_surface !== undefined && cleanPreferences.min_surface !== null) {
      completePreferences.min_surface = cleanPreferences.min_surface
    }
    if (cleanPreferences.max_surface !== undefined && cleanPreferences.max_surface !== null) {
      completePreferences.max_surface = cleanPreferences.max_surface
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
