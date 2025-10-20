import { NextRequest, NextResponse } from 'next/server'
import { ScraperManager } from '@/lib/scrapers/scraper-manager'
import { SearchCriteria } from '@/types/listing'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    
    // Extraire les critères de recherche depuis les paramètres URL
    const criteria: SearchCriteria = {
      city: searchParams.get('city') || 'Berlin',
      minPrice: searchParams.get('minPrice') ? parseInt(searchParams.get('minPrice')!) : undefined,
      maxPrice: searchParams.get('maxPrice') ? parseInt(searchParams.get('maxPrice')!) : undefined,
      minRooms: searchParams.get('minRooms') ? parseInt(searchParams.get('minRooms')!) : undefined,
      maxRooms: searchParams.get('maxRooms') ? parseInt(searchParams.get('maxRooms')!) : undefined,
      minSize: searchParams.get('minSize') ? parseInt(searchParams.get('minSize')!) : undefined,
      maxSize: searchParams.get('maxSize') ? parseInt(searchParams.get('maxSize')!) : undefined,
      districts: searchParams.get('districts')?.split(',').filter(Boolean),
      features: searchParams.get('features')?.split(',').filter(Boolean)
    }

    console.log('Search criteria:', criteria)

    // Initialiser le gestionnaire de scrapers
    const scraperManager = new ScraperManager()
    
    // Lancer la recherche
    const results = await scraperManager.searchAll(criteria)

    // Retourner les résultats
    return NextResponse.json({
      success: true,
      data: {
        listings: results.listings,
        totalFound: results.totalFound,
        scrapersStatus: scraperManager.getScrapersStatus(),
        errors: results.errors
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
    const criteria: SearchCriteria = body.criteria

    console.log('POST Search criteria:', criteria)

    const scraperManager = new ScraperManager()
    const results = await scraperManager.searchAll(criteria)

    return NextResponse.json({
      success: true,
      data: {
        listings: results.listings,
        totalFound: results.totalFound,
        scrapersStatus: scraperManager.getScrapersStatus(),
        errors: results.errors
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
