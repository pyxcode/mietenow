import { NextRequest, NextResponse } from 'next/server'
import { MongoClient } from 'mongodb'

export const runtime = 'nodejs'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { daysOld = 30 } = body

    console.log(`🧹 Starting cleanup of listings older than ${daysOld} days`)

    // Connecter à MongoDB
    const MONGODB_URI = process.env.MONGODB_URI
    if (!MONGODB_URI) {
      return NextResponse.json({ error: 'MONGODB_URI not configured' }, { status: 500 })
    }
    const client = new MongoClient(MONGODB_URI)
    await client.connect()
    
    const db = client.db('mietenow-prod')
    const collection = db.collection('listings')
    
    // Calculer la date limite
    const cutoffDate = new Date()
    cutoffDate.setDate(cutoffDate.getDate() - daysOld)
    
    console.log(`📅 Removing listings created before: ${cutoffDate.toISOString()}`)
    
    // Compter les annonces à supprimer
    const countToDelete = await collection.countDocuments({
      createdAt: { $lt: cutoffDate }
    })
    
    console.log(`📊 Found ${countToDelete} listings to delete`)
    
    // Supprimer les anciennes annonces
    const deleteResult = await collection.deleteMany({
      createdAt: { $lt: cutoffDate }
    })
    
    await client.close()
    
    console.log(`✅ Deleted ${deleteResult.deletedCount} old listings`)
    
    return NextResponse.json({
      success: true,
      data: {
        deleted: deleteResult.deletedCount,
        cutoffDate: cutoffDate.toISOString(),
        daysOld
      },
      message: `Successfully deleted ${deleteResult.deletedCount} listings older than ${daysOld} days`
    })

  } catch (error) {
    console.error('❌ Cleanup error:', error)
    
    return NextResponse.json({
      success: false,
      error: 'Internal server error',
      message: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
