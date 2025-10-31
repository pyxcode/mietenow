import { NextResponse } from 'next/server'
import { createMongoClient } from '@/lib/mongodb-client'

export const dynamic = 'force-dynamic'

export async function GET() {
  let client: any = null
  
  try {
    // Utiliser createMongoClient qui force mietenow-prod
    client = await createMongoClient()
    const db = client.db('mietenow-prod')
    
    // Info de base
    const info = {
      databaseName: db.databaseName,
      host: client.options?.hosts?.[0] || 'unknown'
    }
    
    // Compter les collections principales
    const listingsCollection = db.collection('listings')
    const usersCollection = db.collection('users')
    
    // Compter directement
    const [listingsCount, usersCount] = await Promise.all([
      listingsCollection.countDocuments({}),
      usersCollection.countDocuments({})
    ])
    
    // Debug: Vérifier avec un sample pour confirmer
    const sampleUsers = await usersCollection.find({}).limit(5).toArray()
      
    return NextResponse.json({
      success: true,
      database: info,
      counts: {
        listings: listingsCount,
        users: usersCount
      },
      sampleUsers: sampleUsers.map((u: any) => ({
        email: u.email,
        id: u._id?.toString(),
        firstName: u.first_name,
        lastName: u.last_name
      })),
      message: db.databaseName === 'mietenow-prod' ? 
        '✅ Utilise la base mietenow-prod' : 
        `⚠️ Utilise la base ${db.databaseName} au lieu de mietenow-prod`
    })
    
  } catch (error: any) {
    const errorMessage = error.message || 'Unknown error'
    
    // Détecter les erreurs spécifiques
    let helpfulMessage = errorMessage
    if (errorMessage.includes('whitelist') || errorMessage.includes('IP')) {
      helpfulMessage = 'IP non autorisée dans MongoDB Atlas. Ajoute ton IP dans Network Access: https://cloud.mongodb.com/'
    } else if (errorMessage.includes('authentication')) {
      helpfulMessage = 'Erreur d\'authentification. Vérifie MONGODB_URI dans .env.local'
    } else if (errorMessage.includes('ENOTFOUND') || errorMessage.includes('getaddrinfo')) {
      helpfulMessage = 'Impossible de résoudre le hostname. Vérifie MONGODB_URI'
    }
    
    return NextResponse.json({
      success: false,
      error: helpfulMessage,
      originalError: errorMessage
    }, { status: 500 })
  } finally {
    if (client) {
      await client.close()
    }
  }
}

