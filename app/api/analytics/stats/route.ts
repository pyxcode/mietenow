import { NextRequest, NextResponse } from 'next/server'
import { MongoClient } from 'mongodb'

const MONGODB_URI = process.env.MONGODB_URI || process.env.MONGODB_URI2
const DB_NAME = 'mietenow-prod'
const COLLECTION_NAME = 'listings'

// Prix OpenAI GPT-4.1-nano (après optimisations)
const COST_PER_CALL_EUR = 0.001028 // ~0.103 centimes par appel

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  if (!MONGODB_URI) {
    return NextResponse.json(
      { error: 'MongoDB URI not configured' },
      { status: 500 }
    )
  }

  try {
    const client = new MongoClient(MONGODB_URI)
    await client.connect()
    const db = client.db(DB_NAME)
    const collection = db.collection(COLLECTION_NAME)

    const now = new Date()
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0)
    const yesterday = new Date(today.getTime() - 24 * 60 * 60 * 1000)
    const last7Days = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000)
    const last30Days = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000)
    const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1)
    const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1)

    // Total listings
    const totalListings = await collection.countDocuments()
    const activeListings = await collection.countDocuments({ active: true, is_active: true })
    
    // New listings by period (check both created_at and createdAt)
    const dateFilter = (gte: Date, lt?: Date) => {
      const filter: any = {
        $or: [
          { created_at: { $gte: gte } },
          { createdAt: { $gte: gte } }
        ]
      }
      if (lt) {
        filter.$or = filter.$or.map((f: any) => {
          const key = Object.keys(f)[0]
          return { [key]: { $gte: gte, $lt: lt } }
        })
      }
      return filter
    }

    const todayCount = await collection.countDocuments(dateFilter(today))
    
    const yesterdayCount = await collection.countDocuments({
      $or: [
        { created_at: { $gte: yesterday, $lt: today } },
        { createdAt: { $gte: yesterday, $lt: today } }
      ]
    })
    
    const last7DaysCount = await collection.countDocuments({
      $or: [
        { created_at: { $gte: last7Days } },
        { createdAt: { $gte: last7Days } }
      ]
    })
    
    const last30DaysCount = await collection.countDocuments({
      $or: [
        { created_at: { $gte: last30Days } },
        { createdAt: { $gte: last30Days } }
      ]
    })
    
    const thisMonthCount = await collection.countDocuments({
      $or: [
        { created_at: { $gte: thisMonth } },
        { createdAt: { $gte: thisMonth } }
      ]
    })
    
    const lastMonthCount = await collection.countDocuments({
      $or: [
        { created_at: { $gte: lastMonth, $lt: thisMonth } },
        { createdAt: { $gte: lastMonth, $lt: thisMonth } }
      ]
    })

    // Average price
    const avgPriceResult = await collection.aggregate([
      { $match: { active: true, is_active: true, price: { $exists: true } } },
      { $group: { _id: null, avgPrice: { $avg: '$price' } } }
    ]).toArray()
    const avgPrice = avgPriceResult[0]?.avgPrice || 0

    // Price range
    const priceStats = await collection.aggregate([
      { $match: { active: true, is_active: true, price: { $exists: true } } },
      { 
        $group: {
          _id: null,
          minPrice: { $min: '$price' },
          maxPrice: { $max: '$price' },
          medianPrice: { $median: '$price' }
        }
      }
    ]).toArray()

    // Listings by type
    const listingsByType = await collection.aggregate([
      { $match: { active: true, is_active: true } },
      { $group: { _id: '$type', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]).toArray()

    // Listings by provider
    const listingsByProvider = await collection.aggregate([
      { $match: { active: true, is_active: true } },
      { $group: { _id: '$provider', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]).toArray()

    // Daily stats for last 30 days
    const dailyStats = []
    for (let i = 29; i >= 0; i--) {
      const date = new Date(today)
      date.setDate(date.getDate() - i)
      const nextDate = new Date(date)
      nextDate.setDate(nextDate.getDate() + 1)
      
      const count = await collection.countDocuments({
        $or: [
          { created_at: { $gte: date, $lt: nextDate } },
          { createdAt: { $gte: date, $lt: nextDate } }
        ]
      })
      
      dailyStats.push({
        date: date.toISOString().split('T')[0],
        count,
        // Estimate OpenAI calls (1 call per listing)
        costEUR: count * COST_PER_CALL_EUR
      })
    }

    // Estimated OpenAI costs (1 call per listing = 1 GPT extraction)
    const estimatedOpenAICalls = totalListings // Assumption: 1 call per listing
    const totalCostEUR = estimatedOpenAICalls * COST_PER_CALL_EUR
    const thisMonthCost = thisMonthCount * COST_PER_CALL_EUR
    const lastMonthCost = lastMonthCount * COST_PER_CALL_EUR
    const todayCost = todayCount * COST_PER_CALL_EUR
    const last7DaysCost = last7DaysCount * COST_PER_CALL_EUR
    const last30DaysCost = last30DaysCount * COST_PER_CALL_EUR

    // Inactive/removed listings
    const inactiveListings = await collection.countDocuments({ 
      $or: [{ active: false }, { is_active: false }] 
    })

    // Recent activity
    const recentActivity = await collection
      .find({})
      .sort({ created_at: -1, createdAt: -1 })
      .limit(10)
      .toArray()

    await client.close()

    return NextResponse.json({
      totals: {
        totalListings,
        activeListings,
        inactiveListings,
        avgPrice: Math.round(avgPrice),
        minPrice: priceStats[0]?.minPrice || 0,
        maxPrice: priceStats[0]?.maxPrice || 0,
      },
      newListings: {
        today: todayCount,
        yesterday: yesterdayCount,
        last7Days: last7DaysCount,
        last30Days: last30DaysCount,
        thisMonth: thisMonthCount,
        lastMonth: lastMonthCount,
      },
      openAICosts: {
        totalCostEUR: totalCostEUR.toFixed(4),
        thisMonthCost: thisMonthCost.toFixed(4),
        lastMonthCost: lastMonthCost.toFixed(4),
        todayCost: todayCost.toFixed(4),
        last7DaysCost: last7DaysCost.toFixed(4),
        last30DaysCost: last30DaysCost.toFixed(4),
        estimatedCalls: estimatedOpenAICalls,
        costPerCall: COST_PER_CALL_EUR,
      },
      breakdown: {
        byType: listingsByType.map(item => ({
          type: item._id || 'unknown',
          count: item.count
        })),
        byProvider: listingsByProvider.map(item => ({
          provider: item._id || 'unknown',
          count: item.count
        })),
      },
      dailyStats,
      recentActivity: recentActivity.map(listing => ({
        title: listing.title,
        price: listing.price,
        provider: listing.provider,
        createdAt: listing.created_at || listing.createdAt || new Date(),
        url: listing.url_source
      })),
      lastUpdated: new Date().toISOString()
    })

  } catch (error: any) {
    console.error('Error fetching analytics:', error)
    return NextResponse.json(
      { error: 'Failed to fetch analytics data', message: error.message },
      { status: 500 }
    )
  }
}

