import { NextRequest, NextResponse } from 'next/server'
import { createMongoClient } from '@/lib/mongodb-client'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { 
      title, 
      criteria, 
      frequency = 'daily',
      email 
    } = body

    console.log('Creating/updating alert:', { title, criteria, email })

    // Connecter à MongoDB - FORCER mietenow-prod
    const client = await createMongoClient()
    const db = client.db('mietenow-prod')
    const collection = db.collection('alerts')
    
    // Vérifier s'il existe déjà une alerte pour cet email
    const existingAlert = await collection.findOne({ 
      email: email || 'test@example.com',
      active: true 
    })
    
    const alertData = {
      email: email || 'test@example.com',
      title,
      criteria,
      frequency,
      active: true,
      last_triggered_at: new Date()
    }
    
    let result
    let message
    
    if (existingAlert) {
      // Mettre à jour l'alerte existante
      result = await collection.updateOne(
        { _id: existingAlert._id },
        { 
          $set: {
            ...alertData,
            updated_at: new Date()
          }
        }
      )
      message = 'Alert updated successfully'
      console.log('Alert updated successfully:', existingAlert._id)
    } else {
      // Créer une nouvelle alerte
      const newAlert = {
        ...alertData,
        user_id: new Date().getTime().toString(), // ID temporaire
        created_at: new Date()
      }
      result = await collection.insertOne(newAlert)
      message = 'Alert created successfully'
      console.log('Alert created successfully:', result.insertedId)
    }
    
    await client.close()
    
    return NextResponse.json({ 
      success: true, 
      data: existingAlert ? { ...existingAlert, ...alertData } : { ...alertData, _id: (result as any).insertedId || (result as any).upsertedId },
      message 
    })

  } catch (error) {
    console.error('Error creating/updating alert:', error)
    return NextResponse.json({ 
      error: 'Failed to create/update alert',
      message: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    // Connecter à MongoDB - FORCER mietenow-prod
    const client = await createMongoClient()
    const db = client.db('mietenow-prod')
    const collection = db.collection('alerts')
    
    const alerts = await collection.find({ active: true }).sort({ created_at: -1 }).toArray()
    await client.close()
    
    return NextResponse.json({ 
      success: true, 
      data: alerts 
    })

  } catch (error) {
    console.error('Error fetching alerts:', error)
    return NextResponse.json({ 
      error: 'Failed to fetch alerts',
      message: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
