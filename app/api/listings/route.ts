import { NextRequest, NextResponse } from 'next/server'
import { connectDB } from '@/lib/mongodb'
import mongoose from 'mongoose'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    // Forcer la connexion à mietenow-prod via connectDB (qui force déjà mietenow-prod)
    await connectDB()
    
    // S'assurer qu'on utilise bien mietenow-prod
    const connection = mongoose.connection.useDb('mietenow-prod')
    const db = connection.db
    
    const { searchParams } = new URL(request.url)
    
    // Paramètres de filtrage
    const minPrice = searchParams.get('minPrice')
    const maxPrice = searchParams.get('maxPrice')
    const minSurface = searchParams.get('minSurface')
    const maxSurface = searchParams.get('maxSurface')
    const rooms = searchParams.get('rooms')
    const type = searchParams.get('type')
    const district = searchParams.get('district')
    const furnished = searchParams.get('furnished')
    const lat = searchParams.get('lat')
    const lng = searchParams.get('lng')
    const radius = searchParams.get('radius') || '5000' // 5km par défaut
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    
    if (!db) {
      throw new Error('Database connection not established')
    }
    console.log(`📊 Using database: ${db.databaseName}`)
    const listingsCollection = db.collection('listings')
    
    // Construire la requête MongoDB
    const query: any = {
      active: { $ne: false } // Utiliser le champ 'active' au lieu de 'is_active'
    }
    
    // Filtres de prix
    if (minPrice || maxPrice) {
      query.price = {}
      if (minPrice) query.price.$gte = parseInt(minPrice)
      if (maxPrice) query.price.$lte = parseInt(maxPrice)
    }
    
    // Filtres de surface
    if (minSurface || maxSurface) {
      query.surface = {}
      if (minSurface) query.surface.$gte = parseInt(minSurface)
      if (maxSurface) query.surface.$lte = parseInt(maxSurface)
    }
    
    // Filtres de pièces
    if (rooms) {
      query.rooms = { $gte: parseInt(rooms) }
    }
    
    // Filtre de type
    if (type) {
      query.type = type
    }
    
    // Filtre de district
    if (district) {
      query.district = district
    }
    
    // Filtre meublé
    if (furnished !== null && furnished !== undefined) {
      query.furnished = furnished === 'true'
    }
    
    // Filtre géographique (si lat/lng fournis)
    if (lat && lng) {
      const latNum = parseFloat(lat)
      const lngNum = parseFloat(lng)
      const radiusNum = parseInt(radius)
      
      // Utiliser l'opérateur géospatial de MongoDB
      query.$or = [
        {
          lat: { $exists: true },
          lng: { $exists: true },
          $expr: {
            $lte: [
              {
                $multiply: [
                  {
                    $acos: {
                      $add: [
                        {
                          $multiply: [
                            { $sin: { $multiply: [{ $divide: ['$lat', 180] }, Math.PI] } },
                            { $sin: { $multiply: [{ $divide: [latNum, 180] }, Math.PI] } }
                          ]
                        },
                        {
                          $multiply: [
                            { $cos: { $multiply: [{ $divide: ['$lat', 180] }, Math.PI] } },
                            { $cos: { $multiply: [{ $divide: [latNum, 180] }, Math.PI] } },
                            { $cos: { $multiply: [{ $divide: [{ $subtract: ['$lng', lngNum] }, 180] }, Math.PI] } }
                          ]
                        }
                      ]
                    }
                  },
                  6371 // Rayon de la Terre en km
                ]
              },
              radiusNum / 1000 // Convertir en km
            ]
          }
        },
        // Fallback pour les annonces sans coordonnées
        {
          lat: { $exists: false },
          lng: { $exists: false }
        }
      ]
    }
    
    // Pagination
    const skip = (page - 1) * limit
    
    // Exécuter la requête
    const [listings, total] = await Promise.all([
      listingsCollection.find(query)
        .sort({ created_at: -1 })
        .skip(skip)
        .limit(limit)
        .toArray(),
      listingsCollection.countDocuments(query)
    ])
    
    return NextResponse.json({
      success: true,
      data: {
        listings,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit)
        }
      }
    })
    
  } catch (error) {
    console.error('Error fetching listings:', error)
    
    return NextResponse.json({
      success: false,
      message: 'Failed to fetch listings',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}