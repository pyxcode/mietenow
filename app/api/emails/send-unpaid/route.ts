import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'
import { User, Listing } from '@/models'
import { sendEmail, generateUnpaidUserEmailHTML } from '@/lib/sendgrid'

export const runtime = 'nodejs'

export async function POST(request: NextRequest) {
  try {
    await connectDB()
    
    // Récupérer tous les utilisateurs non payants avec des préférences
    const unpaidUsers = await User.find({
      'search_preferences': { $exists: true },
      plan: 'empty' // Utilisateurs non payants
    })

    let emailsSent = 0
    let errors = []

    for (const user of unpaidUsers) {
      try {
        const preferences = user.search_preferences
        
        // Rechercher des annonces correspondant aux critères
        const searchCriteria: any = {
          active: true,
          price: { $gte: preferences.min_price || 0 }
        }

        if (preferences.max_price) {
          searchCriteria.price.$lte = preferences.max_price
        }

        if (preferences.type && preferences.type !== 'Any') {
          searchCriteria.type = preferences.type
        }

        if (preferences.furnishing && preferences.furnishing !== 'Any') {
          searchCriteria.furnishing = preferences.furnishing
        }

        if (preferences.min_bedrooms) {
          searchCriteria.bedrooms = { $gte: preferences.min_bedrooms }
        }

        // Filtrer par distance si l'utilisateur a une adresse
        if (preferences.coordinates && preferences.coordinates.lat) {
          const { lat, lng } = preferences.coordinates
          const radius = preferences.radius || 5
          
          searchCriteria['location.lat'] = {
            $gte: lat - (radius / 111),
            $lte: lat + (radius / 111)
          }
          searchCriteria['location.lng'] = {
            $gte: lng - (radius / (111 * Math.cos(lat * Math.PI / 180))),
            $lte: lng + (radius / (111 * Math.cos(lat * Math.PI / 180)))
          }
        }

        // Récupérer les meilleures annonces (pas forcément nouvelles)
        const listings = await Listing.find(searchCriteria)
          .sort({ createdAt: -1 })
          .limit(5)

        if (listings.length > 0) {
          // Générer et envoyer l'email
          const emailHTML = generateUnpaidUserEmailHTML(listings, preferences)
          
          const emailResult = await sendEmail({
            to: user.email,
            subject: `🏠 ${listings.length} appartement(s) trouvé(s) pour vous - MieteNow`,
            html: emailHTML
          })

          if (emailResult.success) {
            emailsSent++
            console.log(`Email non-payant envoyé à ${user.email} avec ${listings.length} annonces`)
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
      totalUsers: unpaidUsers.length,
      errors: errors.length > 0 ? errors : undefined
    })

  } catch (error) {
    console.error('Erreur lors de l\'envoi des emails non-payants:', error)
    return NextResponse.json(
      { success: false, error: 'Erreur serveur' },
      { status: 500 }
    )
  }
}
