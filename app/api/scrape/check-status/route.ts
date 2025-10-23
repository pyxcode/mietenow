import { NextRequest, NextResponse } from 'next/server'
import { connectDB } from '@/lib/mongodb'
import Listing from '@/models/Listing'

export const runtime = 'nodejs'

export async function POST(request: NextRequest) {
  try {
    console.log('🔍 Starting status check for listings...')
    
    await connectDB()
    
    // Récupérer toutes les annonces actives
    const listings = await Listing.find({ 
      active: { $ne: false } 
    }).limit(100) // Limiter pour éviter de surcharger
    
    const results = {
      total: listings.length,
      checked: 0,
      removed: 0,
      errors: 0,
      details: [] as any[]
    }
    
    // Vérifier chaque annonce
    for (const listing of listings) {
      try {
        results.checked++
        
        // Vérifier si le lien est accessible
        const controller = new AbortController()
        const timeoutId = setTimeout(() => controller.abort(), 10000)
        
        const response = await fetch(listing.link, {
          method: 'HEAD',
          signal: controller.signal,
          headers: {
            'User-Agent': 'Mozilla/5.0 (compatible; MieteNow/1.0)'
          }
        })
        
        clearTimeout(timeoutId)
        
        if (!response.ok) {
          // Marquer l'annonce comme inactive
          await Listing.findByIdAndUpdate(listing._id, { 
            active: false,
            status_checked_at: new Date(),
            status_error: `HTTP ${response.status}`
          })
          
          results.removed++
          results.details.push({
            id: listing._id,
            title: listing.title,
            link: listing.link,
            status: response.status,
            action: 'deactivated'
          })
          
          console.log(`❌ Listing ${listing._id} deactivated: HTTP ${response.status}`)
        } else {
          // Mettre à jour la date de vérification
          await Listing.findByIdAndUpdate(listing._id, { 
            status_checked_at: new Date(),
            status_error: null
          })
          
          results.details.push({
            id: listing._id,
            title: listing.title,
            link: listing.link,
            status: response.status,
            action: 'verified'
          })
          
          console.log(`✅ Listing ${listing._id} verified: HTTP ${response.status}`)
        }
        
        // Pause entre les vérifications pour éviter de surcharger les serveurs
        await new Promise(resolve => setTimeout(resolve, 1000))
        
      } catch (error) {
        results.errors++
        console.error(`❌ Error checking listing ${listing._id}:`, error)
        
        results.details.push({
          id: listing._id,
          title: listing.title,
          link: listing.link,
          status: 'error',
          action: 'error',
          error: error instanceof Error ? error.message : 'Unknown error'
        })
      }
    }
    
    console.log('✅ Status check completed:', results)
    
    return NextResponse.json({
      success: true,
      data: results,
      message: 'Status check completed successfully'
    })

  } catch (error) {
    console.error('❌ Status check failed:', error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      message: 'Status check failed'
    }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    await connectDB()
    
    // Statistiques des annonces
    const stats = await Listing.aggregate([
      {
        $group: {
          _id: null,
          total: { $sum: 1 },
          active: { $sum: { $cond: [{ $ne: ['$active', false] }, 1, 0] } },
          inactive: { $sum: { $cond: [{ $eq: ['$active', false] }, 1, 0] } },
          byPlatform: {
            $push: {
              platform: '$platform',
              active: { $cond: [{ $ne: ['$active', false] }, 1, 0] }
            }
          }
        }
      }
    ])
    
    // Dernières vérifications
    const lastChecks = await Listing.find({ 
      status_checked_at: { $exists: true } 
    })
    .sort({ status_checked_at: -1 })
    .limit(10)
    .select('title platform status_checked_at status_error active')
    
    return NextResponse.json({
      success: true,
      data: {
        stats: stats[0] || { total: 0, active: 0, inactive: 0 },
        lastChecks,
        lastRun: new Date().toISOString()
      }
    })

  } catch (error) {
    console.error('❌ Error getting status info:', error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
