import { NextRequest, NextResponse } from 'next/server'
import { MongoClient, ObjectId } from 'mongodb'

// Force deployment update

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params

    if (!id) {
      return NextResponse.json({
        success: false,
        error: 'Listing ID is required'
      }, { status: 400 })
    }

    // Connecter à MongoDB - FORCER mietenow-prod
    let mongoUri = process.env.MONGODB_URI || process.env.MONGODB_URI2
    if (!mongoUri) {
      return NextResponse.json({
        success: false,
        error: 'MONGODB_URI not configured'
      }, { status: 500 })
    }

    // Forcer mietenow-prod dans l'URI
    if (mongoUri.includes('mongodb+srv://')) {
      const match = mongoUri.match(/mongodb\+srv:\/\/([^:]+):([^@]+)@([^/]+)\/([^?]+)?(\?.*)?/)
      if (match) {
        const [, username, password, host, database, query] = match
        mongoUri = `mongodb://${username}:${password}@${host}:27017/mietenow-prod${query || ''}`
      }
    } else {
      // Remplacer n'importe quelle base de données par mietenow-prod
      const uriMatch = mongoUri.match(/^(mongodb:\/\/[^\/]+)\/?([^?]*)(\?.*)?$/)
      if (uriMatch) {
        const [, baseUri, existingDb, query] = uriMatch
        mongoUri = `${baseUri}/mietenow-prod${query || ''}`
      } else {
        mongoUri = mongoUri.replace(/\/[^\/\?]+(\?|$)/, `/mietenow-prod$1`)
        if (!mongoUri.includes('/mietenow-prod')) {
          mongoUri = mongoUri.replace('/?', '/mietenow-prod?').replace(/\/$/, '/mietenow-prod')
        }
      }
    }

    // S'assurer qu'on n'utilise JAMAIS "test"
    if (mongoUri.includes('/test')) {
      mongoUri = mongoUri.replace('/test', '/mietenow-prod')
    }

    const client = new MongoClient(mongoUri)
    await client.connect()
    
    const db = client.db('mietenow-prod')
    const collection = db.collection('listings')
    
    // Rechercher l'annonce par ID (essayer d'abord avec id, puis avec _id)
    let listing = await collection.findOne({ id: id })
    
    // Si pas trouvé avec id, essayer avec _id (en convertissant en ObjectId)
    if (!listing) {
      try {
        const objectId = new ObjectId(id)
        listing = await collection.findOne({ _id: objectId })
      } catch (error) {
        // Si l'id n'est pas un ObjectId valide, continuer sans erreur
        console.log('Invalid ObjectId format:', id)
      }
    }
    
    await client.close()

    if (!listing) {
      return NextResponse.json({
        success: false,
        error: 'Listing not found'
      }, { status: 404 })
    }

    // Transformer les données pour le frontend (cohérent avec l'API de recherche)
    const transformedListing = {
      _id: listing._id,
      id: listing.id || listing._id,
      title: listing.title || 'Furnished Room',
      description: listing.description || listing.title || 'Beautiful accommodation in Berlin',
      price: listing.price || 'N/A',
      address: listing.address || 'Berlin, Germany',
      size: listing.size || listing.surface || null,
      rooms: listing.rooms || 1,
      type: listing.type || 'Room',
      images: listing.images || (listing.image ? [listing.image] : []),
      link: listing.link || listing.url_source || '#',
      url: listing.url_source || listing.link,
      platform: listing.platform || listing.provider || 'unknown',
      scrapedAt: listing.scrapedAt || listing.scraped_at || listing.createdAt || listing.created_at || new Date().toISOString(),
      lat: listing.lat || 52.5208,
      lng: listing.lng || 13.4095
    }

    return NextResponse.json({
      success: true,
      data: transformedListing
    })

  } catch (error) {
    console.error('Error fetching listing:', error)
    
    return NextResponse.json({
      success: false,
      error: 'Internal server error',
      message: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
