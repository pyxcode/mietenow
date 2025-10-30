import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    console.log('🚀 Starting scraping job...')
    
    // Import dynamique pour éviter les erreurs de build
    const { ScraperManager } = await import('@/lib/scrapers/core/scraper-manager.js')
    
    const manager = new ScraperManager()
    const results = await manager.scrapeAll()
    
    console.log('✅ Scraping job completed:', results)
    
    return NextResponse.json({
      success: true,
      data: results,
      message: 'Scraping completed successfully'
    })

  } catch (error) {
    console.error('❌ Scraping job failed:', error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      message: 'Scraping job failed'
    }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    // Import dynamique pour éviter les erreurs de build
    const { ScraperManager } = await import('@/lib/scrapers/core/scraper-manager.js')
    
    const manager = new ScraperManager()
    const status = manager.getScrapersStatus()
    
    return NextResponse.json({
      success: true,
      data: {
        scrapers: status,
        lastRun: new Date().toISOString()
      }
    })

  } catch (error) {
    console.error('❌ Error getting scraper status:', error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
