import { NextRequest, NextResponse } from 'next/server'
import { MongoClient } from 'mongodb'

export const dynamic = 'force-dynamic'

function buildMongoFilter(criteria: any) {
  const filter: any = {}
  
  // Filtre par ville
  if (criteria.city) {
    filter.$or = [
      { location: { $regex: criteria.city, $options: 'i' } },
      { address: { $regex: criteria.city, $options: 'i' } },
      { district: { $regex: criteria.city, $options: 'i' } }
    ]
  }
  
  // Filtre par prix
  if (criteria.minPrice || criteria.maxPrice) {
    filter.price = {}
    if (criteria.minPrice) {
      filter.price.$gte = parseInt(criteria.minPrice)
    }
    if (criteria.maxPrice) {
      filter.price.$lte = parseInt(criteria.maxPrice)
    }
  }
  
  // Filtre par surface
  if (criteria.minSize || criteria.maxSize) {
    filter.surface = {}
    if (criteria.minSize) {
      filter.surface.$gte = parseInt(criteria.minSize)
    }
    if (criteria.maxSize) {
      filter.surface.$lte = parseInt(criteria.maxSize)
    }
  }
  
  // Filtre par nombre de pièces
  if (criteria.minRooms || criteria.maxRooms) {
    filter.rooms = {}
    if (criteria.minRooms) {
      filter.rooms.$gte = parseInt(criteria.minRooms)
    }
    if (criteria.maxRooms) {
      filter.rooms.$lte = parseInt(criteria.maxRooms)
    }
  }
  
  // Filtre par type
  if (criteria.type && criteria.type !== 'Any') {
    filter.type = criteria.type
  }
  
  // Filtre par quartier
  if (criteria.districts && criteria.districts.length > 0) {
    filter.district = { $in: criteria.districts }
  }
  
  return filter
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const criteria = {
      city: searchParams.get('city') || undefined,
      minPrice: searchParams.get('minPrice') || undefined,
      maxPrice: searchParams.get('maxPrice') || undefined,
      minRooms: searchParams.get('minRooms') || undefined,
      maxRooms: searchParams.get('maxRooms') || undefined,
      minSize: searchParams.get('minSize') || undefined,
      maxSize: searchParams.get('maxSize') || undefined,
      type: searchParams.get('type') || undefined,
      districts: searchParams.get('districts')?.split(',') || undefined
    }

    console.log('Search criteria:', criteria)

    // Construire le filtre MongoDB
    const filter = buildMongoFilter(criteria)
    
    // Connecter à MongoDB et récupérer les annonces
    const MONGODB_URI = 'mongodb://louanbardou_db_user:1Hdkkeb8205eE@ac-zdt3xyl-shard-00-00.6srfa0f.mongodb.net:27017/?authSource=admin&ssl=true&directConnection=true'
    if (!MONGODB_URI) {
      return NextResponse.json({ error: 'MONGODB_URI not configured' }, { status: 500 })
    }
    const client = new MongoClient(MONGODB_URI)
    await client.connect()
    
    const db = client.db('mietenow-prod')
    const collection = db.collection('listings')
    
    const listings = await collection
      .find(filter)
      .sort({ createdAt: -1 })
      .limit(300)
      .toArray()
    
    await client.close()

    // Mapper les données pour correspondre au format attendu par le frontend
    const mappedListings = listings.map(listing => ({
      _id: listing._id,
      id: listing.id || listing._id,
      title: listing.title,
      description: listing.description || listing.title,
      price: listing.price,
      location: listing.location || listing.address,
      district: listing.district,
      surface: listing.surface,
      size: listing.surface, // Alias pour le frontend
      rooms: listing.rooms,
      type: listing.type,
      images: listing.images || (listing.image ? [listing.image] : []),
      image: listing.image || (listing.images && listing.images.length > 0 ? listing.images[0] : null),
      url: listing.url_source || listing.link,
      link: listing.link || listing.url_source,
      source: listing.source_name || listing.platform,
      platform: listing.platform || listing.provider,
      lat: listing.lat,
      lng: listing.lng,
      address: listing.address || listing.location,
      furnished: listing.furnished,
      features: listing.features || [],
      scrapedAt: listing.scrapedAt || listing.scraped_at,
      createdAt: listing.createdAt || listing.created_at,
      active: listing.active !== false,
      is_active: listing.is_active
    }))

    // Retourner les résultats
    return NextResponse.json({
      success: true,
      data: {
        listings: mappedListings,
        totalFound: mappedListings.length,
        scrapersStatus: [
          { platform: 'wg-gesucht', status: 'active' },
          { platform: 'kleinanzeigen', status: 'active' },
          { platform: 'immowelt', status: 'active' },
          { platform: 'immobilienScout24', status: 'active' },
          { platform: 'immonet', status: 'active' }
        ],
        errors: []
      },
      criteria
    })

  } catch (error) {
    console.error('Search API error:', error)
    
    return NextResponse.json({
      success: false,
      error: 'Internal server error',
      message: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const criteria = body.criteria

    console.log('POST Search criteria:', criteria)

    // Construire le filtre MongoDB
    const filter = buildMongoFilter(criteria)
    
    // Connecter à MongoDB et récupérer les annonces
    const MONGODB_URI = 'mongodb://louanbardou_db_user:1Hdkkeb8205eE@ac-zdt3xyl-shard-00-00.6srfa0f.mongodb.net:27017/?authSource=admin&ssl=true&directConnection=true'
    if (!MONGODB_URI) {
      return NextResponse.json({ error: 'MONGODB_URI not configured' }, { status: 500 })
    }
    const client = new MongoClient(MONGODB_URI)
    await client.connect()
    
    const db = client.db('mietenow-prod')
    const collection = db.collection('listings')
    
    const listings = await collection
      .find(filter)
      .sort({ createdAt: -1 })
      .limit(parseInt(body.limit) || 500)
      .toArray()
    
    await client.close()

    // Mapper les données pour correspondre au format attendu par le frontend
    const mappedListings = listings.map(listing => ({
      _id: listing._id,
      id: listing.id || listing._id,
      title: listing.title,
      description: listing.description || listing.title,
      price: listing.price,
      location: listing.location || listing.address,
      district: listing.district,
      surface: listing.surface,
      size: listing.surface, // Alias pour le frontend
      rooms: listing.rooms,
      type: listing.type,
      images: listing.images || (listing.image ? [listing.image] : []),
      image: listing.image || (listing.images && listing.images.length > 0 ? listing.images[0] : null),
      url: listing.url_source || listing.link,
      link: listing.link || listing.url_source,
      source: listing.source_name || listing.platform,
      platform: listing.platform || listing.provider,
      lat: listing.lat,
      lng: listing.lng,
      address: listing.address || listing.location,
      furnished: listing.furnished,
      features: listing.features || [],
      scrapedAt: listing.scrapedAt || listing.scraped_at,
      createdAt: listing.createdAt || listing.created_at,
      active: listing.active !== false,
      is_active: listing.is_active
    }))

    return NextResponse.json({
      success: true,
      data: {
        listings: mappedListings,
        totalFound: mappedListings.length,
        scrapersStatus: [
          { platform: 'wg-gesucht', status: 'active' },
          { platform: 'kleinanzeigen', status: 'active' },
          { platform: 'immowelt', status: 'active' },
          { platform: 'immobilienScout24', status: 'active' },
          { platform: 'immonet', status: 'active' }
        ],
        errors: []
      },
      criteria
    })

  } catch (error) {
    console.error('Search API POST error:', error)
    
    return NextResponse.json({
      success: false,
      error: 'Internal server error',
      message: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}