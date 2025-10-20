import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'
import Listing from '@/models/Listing'

export async function GET(request: NextRequest) {
  try {
    await connectDB()

    const { searchParams } = new URL(request.url)
    
    // Construire la requête de filtrage
    const query: any = {
      isActive: true,
      isAvailable: true
    }

    // Filtres de base
    const city = searchParams.get('city')
    if (city) {
      query.city = new RegExp(city, 'i')
    }

    // Filtres de prix
    const minPrice = searchParams.get('minPrice')
    const maxPrice = searchParams.get('maxPrice')
    if (minPrice || maxPrice) {
      query.price = {}
      if (minPrice) query.price.$gte = parseInt(minPrice)
      if (maxPrice) query.price.$lte = parseInt(maxPrice)
    }

    // Filtres de pièces
    const minRooms = searchParams.get('minRooms')
    const maxRooms = searchParams.get('maxRooms')
    if (minRooms || maxRooms) {
      query.rooms = {}
      if (minRooms) query.rooms.$gte = parseInt(minRooms)
      if (maxRooms) query.rooms.$lte = parseInt(maxRooms)
    }

    // Filtres de chambres
    const minBedrooms = searchParams.get('minBedrooms')
    const maxBedrooms = searchParams.get('maxBedrooms')
    if (minBedrooms || maxBedrooms) {
      query.bedrooms = {}
      if (minBedrooms) query.bedrooms.$gte = parseInt(minBedrooms)
      if (maxBedrooms) query.bedrooms.$lte = parseInt(maxBedrooms)
    }

    // Filtres de surface
    const minSize = searchParams.get('minSize')
    const maxSize = searchParams.get('maxSize')
    if (minSize || maxSize) {
      query.size = {}
      if (minSize) query.size.$gte = parseInt(minSize)
      if (maxSize) query.size.$lte = parseInt(maxSize)
    }

    // Filtre de type de propriété
    const propertyType = searchParams.get('propertyType')
    if (propertyType) {
      query.propertyType = propertyType
    }

    // Filtre d'équipement
    const furnishing = searchParams.get('furnishing')
    if (furnishing) {
      query.furnishing = furnishing
    }

    // Filtres de quartiers
    const districts = searchParams.get('districts')
    if (districts) {
      query.district = { $in: districts.split(',') }
    }

    // Pagination
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const skip = (page - 1) * limit

    // Tri
    const sortBy = searchParams.get('sortBy') || 'publishedAt'
    const sortOrder = searchParams.get('sortOrder') || 'desc'
    const sort: any = {}
    sort[sortBy] = sortOrder === 'desc' ? -1 : 1

    // Exécuter la requête
    const [listings, total] = await Promise.all([
      Listing.find(query)
        .sort(sort)
        .skip(skip)
        .limit(limit)
        .lean(),
      Listing.countDocuments(query)
    ])

    // Formater les résultats
    const formattedListings = listings.map((listing: any) => ({
      id: listing._id.toString(),
      title: listing.title,
      description: listing.description,
      price: listing.price,
      currency: listing.currency,
      location: listing.location,
      city: listing.city,
      district: listing.district,
      rooms: listing.rooms,
      bedrooms: listing.bedrooms,
      size: listing.size,
      propertyType: listing.propertyType,
      furnishing: listing.furnishing,
      images: listing.images,
      url: listing.url,
      source: listing.source,
      publishedAt: listing.publishedAt,
      features: listing.features,
      contactInfo: listing.contactInfo
    }))

    return NextResponse.json({
      success: true,
      listings: formattedListings,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      },
      filters: {
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
        furnishing,
        districts
      }
    })

  } catch (error) {
    console.error('Listings API error:', error)
    
    return NextResponse.json({
      success: false,
      error: 'Internal server error',
      message: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
