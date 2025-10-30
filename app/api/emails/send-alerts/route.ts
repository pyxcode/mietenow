import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'
import { User, Alert, Listing } from '@/models'
import { sendEmail, generateAlertEmailHTML } from '@/lib/sendgrid-esm'

export const runtime = 'nodejs'

export async function POST(request: NextRequest) {
  try {
    await connectDB()
    
    // Récupérer tous les utilisateurs avec des alertes actives
    const usersWithAlerts = await User.find({
      'search_preferences': { $exists: true },
      plan: { $ne: 'empty' } // Utilisateurs payants uniquement
    }).populate('alerts')

    let emailsSent = 0
    let errors: string[] = []

    for (const user of usersWithAlerts) {
      try {
        // Récupérer la dernière alerte de l'utilisateur
        const latestAlert = await Alert.findOne({ user_id: user._id })
          .sort({ createdAt: -1 })

        if (!latestAlert) continue

        // Rechercher les nouvelles annonces correspondant aux critères
        const searchCriteria: any = {
          active: true,
          price: { $gte: latestAlert.criteria.min_price || 0 }
        }

        if (latestAlert.criteria.max_price) {
          searchCriteria.price.$lte = latestAlert.criteria.max_price
        }

        if (latestAlert.criteria.type && latestAlert.criteria.type !== 'Any') {
          searchCriteria.type = latestAlert.criteria.type
        }

        if (latestAlert.criteria.furnishing && latestAlert.criteria.furnishing !== 'Any') {
          searchCriteria.furnishing = latestAlert.criteria.furnishing
        }

        if (latestAlert.criteria.min_bedrooms) {
          searchCriteria.bedrooms = { $gte: latestAlert.criteria.min_bedrooms }
        }

        // Filtrer par distance si l'utilisateur a une adresse
        if (user.search_preferences.coordinates && user.search_preferences.coordinates.lat) {
          const { lat, lng } = user.search_preferences.coordinates
          const radius = user.search_preferences.radius || 5
          
          // Recherche approximative par distance (simplifiée)
          searchCriteria['location.lat'] = {
            $gte: lat - (radius / 111), // 1 degré ≈ 111 km
            $lte: lat + (radius / 111)
          }
          searchCriteria['location.lng'] = {
            $gte: lng - (radius / (111 * Math.cos(lat * Math.PI / 180))),
            $lte: lng + (radius / (111 * Math.cos(lat * Math.PI / 180)))
          }
        }

        // Récupérer les annonces créées dans les dernières 24h
        const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000)
        searchCriteria.createdAt = { $gte: oneDayAgo }

        const newListings = await Listing.find(searchCriteria).limit(10)

        if (newListings.length > 0) {
          // Générer et envoyer l'email
          const emailHTML = generateAlertEmailHTML(newListings)
          
          const emailResult = await sendEmail({
            to: user.email,
            subject: `🏠 ${newListings.length} nouvelle(s) annonce(s) trouvée(s) - MieteNow`,
            html: emailHTML
          })

          if (emailResult.success) {
            emailsSent++
            console.log(`Email d'alerte envoyé à ${user.email} avec ${newListings.length} annonces`)
          } else {
            errors.push(`Erreur envoi email à ${user.email}: ${emailResult.error}`)
          }
        }
      } catch (userError) {
        errors.push(`Erreur pour utilisateur ${user.email}: ${userError}`)
      }
    }

    return NextResponse.json({
      success: true,
      emailsSent,
      totalUsers: usersWithAlerts.length,
      errors: errors.length > 0 ? errors : undefined
    })

  } catch (error) {
    console.error('Erreur lors de l\'envoi des alertes:', error)
    return NextResponse.json(
      { success: false, error: 'Erreur serveur' },
      { status: 500 }
    )
  }
}
