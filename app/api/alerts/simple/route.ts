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

    // Validation des champs requis
    if (!email) {
      console.error('❌ Missing email in alert creation request')
      return NextResponse.json({ 
        error: 'Email is required',
        message: 'Email is required to create an alert'
      }, { status: 400 })
    }

    if (!criteria) {
      console.error('❌ Missing criteria in alert creation request')
      return NextResponse.json({ 
        error: 'Criteria is required',
        message: 'Criteria is required to create an alert'
      }, { status: 400 })
    }

    console.log('📧 Creating/updating alert:', { title, criteria: JSON.stringify(criteria), email })

    // Connecter à MongoDB - FORCER mietenow-prod
    let client
    try {
      client = await createMongoClient()
      console.log('✅ MongoDB client created')
    } catch (dbError) {
      console.error('❌ Failed to create MongoDB client:', dbError)
      return NextResponse.json({ 
        error: 'Database connection failed',
        message: dbError instanceof Error ? dbError.message : 'Unknown database error'
      }, { status: 500 })
    }

    const db = client.db('mietenow-prod')
    console.log('✅ Using database:', db.databaseName)
    
    const collection = db.collection('alerts')
    
    // Vérifier s'il existe déjà une alerte pour cet email
    const existingAlert = await collection.findOne({ 
      email: email,
      active: true 
    })
    
    console.log(existingAlert ? `📋 Existing alert found: ${existingAlert._id}` : '📝 No existing alert, creating new one')
    
    const alertData = {
      email: email,
      title: title || `Alert for ${criteria.city || 'Berlin'}`,
      criteria,
      frequency,
      active: true,
      last_triggered_at: new Date()
    }
    
    let result
    let message
    
    try {
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
        console.log('✅ Alert updated successfully:', existingAlert._id, 'Modified count:', result.modifiedCount)
      } else {
        // Créer une nouvelle alerte
        const newAlert = {
          ...alertData,
          user_id: new Date().getTime().toString(), // ID temporaire
          created_at: new Date()
        }
        result = await collection.insertOne(newAlert)
        message = 'Alert created successfully'
        console.log('✅ Alert created successfully:', result.insertedId)
      }
    } catch (dbOpError) {
      console.error('❌ Database operation failed:', dbOpError)
      await client.close()
      return NextResponse.json({ 
        error: 'Failed to save alert',
        message: dbOpError instanceof Error ? dbOpError.message : 'Unknown database operation error'
      }, { status: 500 })
    }
    
    await client.close()
    
    return NextResponse.json({ 
      success: true, 
      data: existingAlert ? { ...existingAlert, ...alertData } : { ...alertData, _id: (result as any).insertedId || (result as any).upsertedId },
      message 
    })

  } catch (error) {
    console.error('❌ Error creating/updating alert:', error)
    return NextResponse.json({ 
      error: 'Failed to create/update alert',
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined
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
