import { NextRequest, NextResponse } from 'next/server'
import { MongoClient } from 'mongodb'

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

    // Connecter à MongoDB
    const client = new MongoClient(process.env.MONGODB_URI!)
    await client.connect()
    
    const db = client.db('mietenow-prod')
    const collection = db.collection('listings')
    
    // Rechercher l'annonce par ID
    const listing = await collection.findOne({ id: id })
    
    await client.close()

    if (!listing) {
      return NextResponse.json({
        success: false,
        error: 'Listing not found'
      }, { status: 404 })
    }

    // Transformer les données pour le frontend
    const transformedListing = {
      id: listing.id,
      title: listing.title || 'Furnished Room',
      description: listing.description || listing.title || 'Beautiful accommodation in Berlin',
      price: listing.price || 'N/A',
      address: listing.address || 'Berlin, Germany',
      size: listing.size || null,
      rooms: listing.rooms || 1,
      type: listing.type || 'Room',
      images: listing.images || [],
      link: listing.link || '#',
      platform: listing.platform || 'unknown',
      scrapedAt: listing.scrapedAt || listing.createdAt || new Date().toISOString(),
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
