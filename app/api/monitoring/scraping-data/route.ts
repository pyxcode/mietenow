import { NextRequest, NextResponse } from 'next/server'
import { MongoClient } from 'mongodb'

const MONGODB_URI = process.env.MONGODB_URI || process.env.MONGODB_URI2
const DB_NAME = 'mietenow-prod'
const COLLECTION_NAME = 'listings'
const STATS_COLLECTION = 'scraping_stats'

// Website configuration for monitoring
const WEBSITES = [
  { name: 'WG-Gesucht', provider: 'wg-gesucht', color: '#FF6B6B' },
  { name: 'ImmoWelt', provider: 'immowelt', color: '#4ECDC4' },
  { name: 'ImmoNet', provider: 'immonet', color: '#45B7D1' },
  { name: 'eBay Kleinanzeigen', provider: 'kleinanzeigen', color: '#96CEB4' },
  { name: 'ImmobilienScout24', provider: 'immoscout', color: '#FFEAA7' },
  { name: 'Wohnen.de', provider: 'wohnen', color: '#DDA0DD' },
  { name: 'Immopool', provider: 'immopool', color: '#98D8C8' },
  { name: 'Wohnungsboerse', provider: 'wohnungsboerse', color: '#F7DC6F' },
  { name: 'ImmoTop', provider: 'immotop', color: '#BB8FCE' },
  { name: 'Immowelt24', provider: 'immowelt24', color: '#85C1E9' }
]

type WebsiteHourStats = { name: string; color: string; scraped: number; uploaded: number }

type HourData = { hour: string; websites: Record<string, WebsiteHourStats> }

export async function GET(request: NextRequest) {
  try {
    const { createMongoClient } = await import('@/lib/mongodb-client')
    const client = await createMongoClient()
    const db = client.db(DB_NAME)
    const listingsCollection = db.collection(COLLECTION_NAME)

    // Get hourly data for the last 24 hours for each website
    const hourlyData: HourData[] = []
    for (let i = 23; i >= 0; i--) {
      const hour = new Date()
      hour.setHours(hour.getHours() - i, 0, 0, 0)
      const nextHour = new Date(hour)
      nextHour.setHours(nextHour.getHours() + 1)
      
      const hourStart = hour.toISOString()
      const hourEnd = nextHour.toISOString()
      
      const hourData: HourData = {
        hour: hour.toISOString().slice(0, 13) + ':00',
        websites: {} as Record<string, WebsiteHourStats>
      }
      
      // Get data for each website
      for (const website of WEBSITES) {
        const scrapedCount = await listingsCollection.countDocuments({
          createdAt: { $gte: hourStart, $lt: hourEnd },
          provider: website.provider
        })
        
        const uploadedCount = await listingsCollection.countDocuments({
          createdAt: { $gte: hourStart, $lt: hourEnd },
          provider: website.provider,
          status: 'active'
        })
        
        hourData.websites[website.provider] = {
          name: website.name,
          color: website.color,
          scraped: scrapedCount,
          uploaded: uploadedCount
        }
      }
      
      hourlyData.push(hourData)
    }

    // Get total statistics for each website
    const websiteStats = []
    for (const website of WEBSITES) {
      const totalScraped = await listingsCollection.countDocuments({
        provider: website.provider
      })
      
      const totalUploaded = await listingsCollection.countDocuments({
        provider: website.provider,
        status: 'active'
      })
      
      const lastScrape = await listingsCollection.findOne(
        { provider: website.provider },
        { sort: { createdAt: -1 } }
      )
      
      const last24Hours = new Date(Date.now() - 24 * 60 * 60 * 1000)
      const recentScraped = await listingsCollection.countDocuments({
        provider: website.provider,
        createdAt: { $gte: last24Hours }
      })
      
      websiteStats.push({
        name: website.name,
        provider: website.provider,
        color: website.color,
        totalScraped,
        totalUploaded,
        recentScraped,
        lastScrape: lastScrape?.createdAt || null,
        status: recentScraped > 0 ? 'healthy' : 'inactive'
      })
    }

    // Get overall statistics
    const totalListings = await listingsCollection.countDocuments()
    const activeListings = await listingsCollection.countDocuments({ status: 'active' })
    const last24Hours = new Date(Date.now() - 24 * 60 * 60 * 1000)
    const recentListings = await listingsCollection.countDocuments({
      createdAt: { $gte: last24Hours }
    })

    await client.close()

    return NextResponse.json({
      hourlyData,
      websiteStats,
      overallStats: {
        totalListings,
        activeListings,
        recentListings,
        lastUpdated: new Date().toISOString()
      },
      websites: WEBSITES
    })

  } catch (error) {
    console.error('Error fetching monitoring data:', error)
    return NextResponse.json(
      { error: 'Failed to fetch monitoring data' },
      { status: 500 }
    )
  }
}