import { NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'
import mongoose from 'mongoose'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    await connectDB()
    
    // FORCER l'utilisation de mietenow-prod
    const connection = mongoose.connection.useDb('mietenow-prod')
    const db = connection.db
    if (!db) {
      return NextResponse.json({
        success: false,
        error: 'Database not connected'
      }, { status: 500 })
    }
    
    console.log('📊 Database name:', db.databaseName)
    
    const usersCollection = db.collection('users')
    const users = await usersCollection.find({}).limit(10).toArray()
    
    return NextResponse.json({
      success: true,
      databaseName: db.databaseName,
      count: users.length,
      users: users.map((u: any) => ({
        email: u.email,
        firstName: u.first_name,
        lastName: u.last_name,
        id: u._id?.toString()
      }))
    })
    
  } catch (error: any) {
    console.error('❌ Erreur list users:', error)
    return NextResponse.json({
      success: false,
      error: error.message
    }, { status: 500 })
  }
}

