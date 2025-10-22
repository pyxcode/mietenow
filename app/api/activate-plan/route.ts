import { NextRequest, NextResponse } from 'next/server'
import { connectDB } from '@/lib/mongodb'
import mongoose from 'mongoose'

export const runtime = 'nodejs'

export async function POST(request: NextRequest) {
  try {
    // Forcer la connexion à mietenow-prod
    const MONGODB_URI = process.env.MONGODB_URI
    if (!MONGODB_URI) {
      return NextResponse.json({ error: 'MONGODB_URI not configured' }, { status: 500 })
    }
    
    // Forcer l'utilisation de mietenow-prod
    const mongoUri = MONGODB_URI.endsWith('/') 
      ? MONGODB_URI.slice(0, -1) 
      : MONGODB_URI
    const finalUri = `${mongoUri}/mietenow-prod`
    
    await mongoose.connect(finalUri)
    
    const { plan, userId } = await request.json()
    
    if (!plan) {
      return NextResponse.json({ error: 'Plan is required' }, { status: 400 })
    }
    
    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 })
    }
    
    // Utiliser l'ID de l'utilisateur passé en paramètre
    const userObjectId = new mongoose.Types.ObjectId(userId)
    
    // Utiliser directement la collection MongoDB
    const db = mongoose.connection.db
    if (!db) {
      throw new Error('Database connection not established')
    }
    const usersCollection = db.collection('users')
    
    const user = await usersCollection.findOne({ _id: userObjectId })
    
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }
    
    // Calculer la date d'expiration
    const now = new Date()
    let expiresAt: Date
    let durationDays: number
    
    switch (plan) {
      case '2-week':
        expiresAt = new Date(now.getTime() + 14 * 24 * 60 * 60 * 1000)
        durationDays = 14
        break
      case '1-month':
        expiresAt = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000)
        durationDays = 30
        break
      case '3-month':
        expiresAt = new Date(now.getTime() + 90 * 24 * 60 * 60 * 1000)
        durationDays = 90
        break
      default:
        expiresAt = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000)
        durationDays = 30
    }
    
    // Mapper le plan
    let userPlan: 'empty' | '2sem' | '1mois' | '3mois'
    switch (plan) {
      case '2-week':
        userPlan = '2sem'
        break
      case '1-month':
        userPlan = '1mois'
        break
      case '3-month':
        userPlan = '3mois'
        break
      default:
        userPlan = '1mois'
    }
    
    // Mettre à jour l'utilisateur dans MongoDB
    const result = await usersCollection.updateOne(
      { _id: userObjectId },
      { 
        $set: {
          plan: userPlan,
          plan_expires_at: expiresAt,
          subscription_status: 'active',
          last_payment_date: now,
          plan_duration_days: durationDays
        }
      }
    )
    
    if (result.modifiedCount === 0) {
      return NextResponse.json({ error: 'Failed to update user' }, { status: 500 })
    }
    
    console.log('✅ Plan activé automatiquement:', {
      userId: user._id,
      plan: userPlan,
      expiresAt: expiresAt,
      durationDays: durationDays
    })
    
    return NextResponse.json({
      success: true,
      message: 'Plan activated successfully',
      data: {
        plan: userPlan,
        expires_at: expiresAt,
        duration_days: durationDays
      }
    })
    
  } catch (error) {
    console.error('Error activating plan:', error)
    return NextResponse.json({
      error: 'Failed to activate plan',
      details: error instanceof Error ? error.message : String(error)
    }, { status: 500 })
  }
}
