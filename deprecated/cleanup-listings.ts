import connectDB from '../lib/mongodb'
import Listing from '../models/Listing'

/**
 * Script pour nettoyer les annonces inactives
 * À exécuter régulièrement (cron job)
 */
async function cleanupListings() {
  try {
    await connectDB()
    console.log('🔗 Connected to MongoDB')

    // Marquer comme inactives les annonces non vérifiées depuis plus de 7 jours
    const sevenDaysAgo = new Date()
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)

    const result = await Listing.updateMany(
      {
        lastChecked: { $lt: sevenDaysAgo },
        isActive: true
      },
      {
        $set: {
          isActive: false,
          isAvailable: false,
          updatedAt: new Date()
        }
      }
    )

    console.log(`✅ Marked ${result.modifiedCount} listings as inactive`)

    // Supprimer les annonces inactives depuis plus de 30 jours
    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

    const deleteResult = await Listing.deleteMany({
      isActive: false,
      updatedAt: { $lt: thirtyDaysAgo }
    })

    console.log(`🗑️ Deleted ${deleteResult.deletedCount} old inactive listings`)

    // Statistiques
    const stats = await Listing.aggregate([
      {
        $group: {
          _id: null,
          total: { $sum: 1 },
          active: {
            $sum: { $cond: [{ $eq: ['$isActive', true] }, 1, 0] }
          },
          available: {
            $sum: { $cond: [{ $eq: ['$isAvailable', true] }, 1, 0] }
          }
        }
      }
    ])

    if (stats.length > 0) {
      const { total, active, available } = stats[0]
      console.log(`📊 Statistics:`)
      console.log(`   Total listings: ${total}`)
      console.log(`   Active listings: ${active}`)
      console.log(`   Available listings: ${available}`)
    }

    console.log('✨ Cleanup completed successfully')
    process.exit(0)

  } catch (error) {
    console.error('❌ Cleanup failed:', error)
    process.exit(1)
  }
}

// Exécuter le script si appelé directement
if (require.main === module) {
  cleanupListings()
}

export default cleanupListings
