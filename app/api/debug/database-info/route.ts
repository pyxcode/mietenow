import { NextResponse } from 'next/server'
import { connectDB } from '@/lib/mongodb'
import mongoose from 'mongoose'
import { createMongoClient } from '@/lib/mongodb-client'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const info: any = {
      timestamp: new Date().toISOString(),
      methods: {},
      errors: []
    }

    // Method 1: Via connectDB (mongoose)
    try {
      await connectDB()
      const connection = mongoose.connection.useDb('mietenow-prod')
      const db = connection.db
      
      if (db) {
        info.methods.connectDB = {
          success: true,
          databaseName: db.databaseName,
          connectionState: mongoose.connection.readyState,
          connectionName: mongoose.connection.name,
          uri: mongoose.connection.host || 'unknown',
          collections: []
        }
        
        // Liste des collections
        const collections = await db.listCollections().toArray()
        info.methods.connectDB.collections = collections.map((c: any) => c.name)
        
        // Compter les listings
        const listingsCollection = db.collection('listings')
        const listingsCount = await listingsCollection.countDocuments({})
        info.methods.connectDB.listingsCount = listingsCount
        
        // Compter les users
        const usersCollection = db.collection('users')
        const usersCount = await usersCollection.countDocuments({})
        info.methods.connectDB.usersCount = usersCount
      } else {
        info.methods.connectDB = {
          success: false,
          error: 'db is null'
        }
      }
    } catch (error: any) {
      info.methods.connectDB = {
        success: false,
        error: error.message
      }
    }

    // Method 2: Via createMongoClient (MongoClient)
    let mongoClient: any = null
    try {
      mongoClient = await createMongoClient()
      const db = mongoClient.db('mietenow-prod')
      
      info.methods.createMongoClient = {
        success: true,
        databaseName: db.databaseName,
        collections: []
      }
      
      // Liste des collections
      const collections = await db.listCollections().toArray()
      info.methods.createMongoClient.collections = collections.map((c: any) => c.name)
      
      // Compter les listings
      const listingsCollection = db.collection('listings')
      const listingsCount = await listingsCollection.countDocuments({})
      info.methods.createMongoClient.listingsCount = listingsCount
      
      // Compter les users
      const usersCollection = db.collection('users')
      const usersCount = await usersCollection.countDocuments({})
      info.methods.createMongoClient.usersCount = usersCount
      
    } catch (error: any) {
      info.methods.createMongoClient = {
        success: false,
        error: error.message
      }
    } finally {
      if (mongoClient) {
        await mongoClient.close()
      }
    }

    // Environment variables (sans mots de passe)
    const mongoUri1 = process.env.MONGODB_URI || ''
    const mongoUri2 = process.env.MONGODB_URI2 || ''
    
    info.environment = {
      MONGODB_URI: mongoUri1.replace(/:[^:@]+@/, ':****@'),
      MONGODB_URI2: mongoUri2.replace(/:[^:@]+@/, ':****@'),
      hasMONGODB_URI: !!process.env.MONGODB_URI,
      hasMONGODB_URI2: !!process.env.MONGODB_URI2,
      mongoUriContainsTest: mongoUri1.includes('/test') || mongoUri2.includes('/test'),
      mongoUriContainsMietenowProd: mongoUri1.includes('mietenow-prod') || mongoUri2.includes('mietenow-prod')
    }

    // Vérifier toutes les bases de données disponibles
    try {
      const client = await createMongoClient()
      const adminDb = client.db().admin()
      const dbs = await adminDb.listDatabases()
      info.availableDatabases = dbs.databases.map((db: any) => ({
        name: db.name,
        sizeMB: (db.sizeOnDisk / 1024 / 1024).toFixed(2)
      }))
      await client.close()
    } catch (error: any) {
      info.availableDatabases = {
        error: error.message
      }
    }

    return NextResponse.json({
      success: true,
      data: info
    }, { status: 200 })

  } catch (error: any) {
    console.error('Error in database-info route:', error)
    return NextResponse.json({
      success: false,
      error: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    }, { status: 500 })
  }
}

