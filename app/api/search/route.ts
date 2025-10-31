import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'
import ListingModel from '@/models/Listing'
import mongoose from 'mongoose'

export const dynamic = 'force-dynamic'

const DB_NAME = 'mietenow-prod'

function buildMongoFilter(criteria: any) {
  // TEMPORAIREMENT: Pas de filtre sur active pour voir tous les listings
  const filter: any = {}
  
  // Si pas de critère city ou city = Berlin, ne pas filtrer par ville
  // Sinon, filtrer par ville
  if (criteria.city && typeof criteria.city === 'string' && criteria.city.toLowerCase() !== 'berlin') {
    filter.$or = [
      { location: { $regex: criteria.city, $options: 'i' } },
      { address: { $regex: criteria.city, $options: 'i' } },
      { district: { $regex: criteria.city, $options: 'i' } }
    ]
  }
  if (criteria.minPrice || criteria.maxPrice) {
    filter.price = {}
    if (criteria.minPrice) filter.price.$gte = parseInt(criteria.minPrice)
    if (criteria.maxPrice) filter.price.$lte = parseInt(criteria.maxPrice)
  }
  if (criteria.minSize || criteria.maxSize) {
    filter.surface = {}
    if (criteria.minSize) filter.surface.$gte = parseInt(criteria.minSize)
    if (criteria.maxSize) filter.surface.$lte = parseInt(criteria.maxSize)
  }
  if (criteria.minRooms || criteria.maxRooms) {
    filter.rooms = {}
    if (criteria.minRooms) filter.rooms.$gte = parseInt(criteria.minRooms)
    if (criteria.maxRooms) filter.rooms.$lte = parseInt(criteria.maxRooms)
  }
  if (criteria.type && criteria.type !== 'Any') {
    const typeMapping: Record<string, string> = { room: 'WG', studio: 'studio', apartment: 'apartment', house: 'house' }
    const typeKey = typeof criteria.type === 'string' ? criteria.type.toLowerCase() : ''
    filter.type = (typeKey && typeMapping[typeKey]) ? typeMapping[typeKey] : criteria.type
  }
  if (criteria.districts && criteria.districts.length > 0) {
    filter.district = { $in: criteria.districts }
  }
  if (criteria.furnished !== undefined) {
    filter.furnished = criteria.furnished === 'true' || criteria.furnished === true
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
      furnished: searchParams.get('furnished') || undefined,
      districts: searchParams.get('districts')?.split(',') || undefined
    }

    await connectDB()
    
    // IMPORTANT: S'assurer d'utiliser la bonne base de données (mietenow-prod)
    // Mongoose pourrait utiliser une autre DB si elle est dans l'URI
    const connection = mongoose.connection.useDb(DB_NAME)
    const db = connection.db
    const collection = db.collection('listings')
    
    console.log(`📊 Using database: ${db.databaseName}`)
    console.log(`📊 Connection state: ${mongoose.connection.readyState}`)
    
    // Pour debug: d'abord compter tous les listings dans la collection
    const totalCount = await collection.countDocuments({})
    console.log(`📊 Total listings in database (${db.databaseName}): ${totalCount}`)
    
    // Essayer d'abord sans filtre pour voir s'il y a des listings
    if (totalCount === 0) {
      console.log('⚠️ No listings in database at all!')
      return NextResponse.json({ 
        success: true, 
        data: { listings: [], totalFound: 0, scrapersStatus: [], errors: [] }, 
        criteria 
      })
    }
    
    // Debug: voir quelques listings pour comprendre leur structure
    const sampleListings = await collection.find({}).limit(3).toArray()
    console.log('📋 Sample listings structure (raw):', sampleListings.map(l => ({
      _id: l._id?.toString().substring(0, 10),
      title: l.title?.substring(0, 30),
      active: l.active,
      is_active: l.is_active,
      price: l.price,
      location: l.location,
      hasActiveField: 'active' in l,
      hasIsActiveField: 'is_active' in l
    })))
    
    const filter = buildMongoFilter(criteria)
    const limit = parseInt(searchParams.get('limit') || '300')

    console.log('🔍 Search API - Criteria:', JSON.stringify(criteria, null, 2))
    console.log('🔍 Search API - Filter:', JSON.stringify(filter, null, 2))
    console.log('🔍 Search API - Limit:', limit)

    // Utiliser la collection directement pour être sûr d'utiliser la bonne DB
    console.log('📋 Fetching listings with filter:', JSON.stringify(filter, null, 2))
    const listings = await collection.find(filter)
      .sort({ createdAt: -1, created_at: -1, scraped_at: -1 })
      .limit(limit)
      .toArray()
    
    console.log(`✅ Found ${listings.length} listings (raw from collection)`)

    console.log(`✅ Found ${listings.length} listings matching criteria`)
    
    // Debug: si aucun listing trouvé avec filtre, essayer sans filtre
    if (listings.length === 0 && totalCount > 0) {
      console.log('⚠️ No listings found with filter, trying without any filter...')
      const allListings = await ListingModel.find({}).limit(10).lean().exec()
      console.log(`📋 Found ${allListings.length} listings without filter`)
      // Retourner ces listings pour debug
      const mappedDebugListings = allListings.map((listing: any) => ({
        _id: listing._id,
        id: listing.id || listing._id,
        title: listing.title,
        description: listing.description || listing.title,
        price: listing.price,
        location: listing.location || listing.address,
        district: listing.district,
        surface: listing.surface,
        size: listing.surface,
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
      
      // Si le filtre échoue, retourner quand même les listings sans filtre
      return NextResponse.json({ 
        success: true, 
        data: { 
          listings: mappedDebugListings, 
          totalFound: mappedDebugListings.length, 
          scrapersStatus: [], 
          errors: [],
          debug: { filterFailed: true, usedNoFilter: true }
        }, 
        criteria 
      })
    }

    const mappedListings = listings.map((listing: any) => ({
      _id: listing._id,
      id: listing.id || listing._id,
      title: listing.title,
      description: listing.description || listing.title,
      price: listing.price,
      location: listing.location || listing.address,
      district: listing.district,
      surface: listing.surface,
      size: listing.surface,
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

    return NextResponse.json({ success: true, data: { listings: mappedListings, totalFound: mappedListings.length, scrapersStatus: [], errors: [] }, criteria })
  } catch (error) {
    console.error('Search API error:', error)
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const criteria = body.criteria

    await connectDB()
    const filter = buildMongoFilter(criteria)

    const listings = await ListingModel.find(filter)
      .sort({ createdAt: -1 })
      .limit(parseInt(body.limit) || 500)
      .lean()
      .exec()

    const mappedListings = listings.map((listing: any) => ({
      _id: listing._id,
      id: listing.id || listing._id,
      title: listing.title,
      description: listing.description || listing.title,
      price: listing.price,
      location: listing.location || listing.address,
      district: listing.district,
      surface: listing.surface,
      size: listing.surface,
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

    return NextResponse.json({ success: true, data: { listings: mappedListings, totalFound: mappedListings.length, scrapersStatus: [], errors: [] }, criteria })
  } catch (error) {
    console.error('Search API POST error:', error)
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 })
  }
}