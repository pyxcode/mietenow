import { NextRequest, NextResponse } from 'next/server'
import { connectDB } from '@/lib/mongodb'
import Alert from '@/models/Alert'
import User from '@/models/User'
import mongoose from 'mongoose'
// import { getServerSession } from 'next-auth'
// import { authOptions } from '@/lib/auth'

// GET - Récupérer les alertes de l'utilisateur
export async function GET(request: NextRequest) {
  try {
    await connectDB()
    
    // const session = await getServerSession(authOptions)
    // if (!session?.user?.id) {
    //   return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    // }

    const alerts = await Alert.find({ 
      // user_id: session.user.id,
      active: true 
    }).sort({ created_at: -1 })

    return NextResponse.json({ 
      success: true, 
      data: alerts 
    })

  } catch (error) {
    console.error('Error fetching alerts:', error)
    return NextResponse.json({ 
      error: 'Failed to fetch alerts' 
    }, { status: 500 })
  }
}

// POST - Créer une nouvelle alerte
export async function POST(request: NextRequest) {
  try {
    await connectDB()
    
    // const session = await getServerSession(authOptions)
    // if (!session?.user?.id) {
    //   return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    // }

    const body = await request.json()
    const { 
      title, 
      criteria, 
      frequency = 'daily',
      email 
    } = body

    // Validation des données
    if (!title || !criteria || !email) {
      return NextResponse.json({ 
        error: 'Missing required fields' 
      }, { status: 400 })
    }

    // Vérifier que l'utilisateur existe
    // const user = await User.findById(session.user.id)
    // if (!user) {
    //   return NextResponse.json({ 
    //     error: 'User not found' 
    //   }, { status: 404 })
    // }

    // Créer l'alerte
    const alert = new Alert({
      user_id: new mongoose.Types.ObjectId(), // Temporaire pour les tests
      email: email || 'test@example.com',
      title,
      criteria,
      frequency,
      active: true
    })

    await alert.save()

    return NextResponse.json({ 
      success: true, 
      data: alert,
      message: 'Alert created successfully' 
    })

  } catch (error) {
    console.error('Error creating alert:', error)
    return NextResponse.json({ 
      error: 'Failed to create alert' 
    }, { status: 500 })
  }
}

// PUT - Mettre à jour une alerte
export async function PUT(request: NextRequest) {
  try {
    await connectDB()
    
    // Pour les tests, on utilise un user_id factice
    const user_id = new mongoose.Types.ObjectId()

    const body = await request.json()
    const { alertId, ...updateData } = body

    if (!alertId) {
      return NextResponse.json({ 
        error: 'Alert ID is required' 
      }, { status: 400 })
    }

    const alert = await Alert.findOneAndUpdate(
      { 
        _id: alertId, 
        user_id: user_id 
      },
      updateData,
      { new: true }
    )

    if (!alert) {
      return NextResponse.json({ 
        error: 'Alert not found' 
      }, { status: 404 })
    }

    return NextResponse.json({ 
      success: true, 
      data: alert,
      message: 'Alert updated successfully' 
    })

  } catch (error) {
    console.error('Error updating alert:', error)
    return NextResponse.json({ 
      error: 'Failed to update alert' 
    }, { status: 500 })
  }
}

// DELETE - Supprimer une alerte
export async function DELETE(request: NextRequest) {
  try {
    await connectDB()
    
    // Pour les tests, on utilise un user_id factice
    const user_id = new mongoose.Types.ObjectId()

    const { searchParams } = new URL(request.url)
    const alertId = searchParams.get('id')

    if (!alertId) {
      return NextResponse.json({ 
        error: 'Alert ID is required' 
      }, { status: 400 })
    }

    const alert = await Alert.findOneAndDelete({
      _id: alertId,
      user_id: user_id
    })

    if (!alert) {
      return NextResponse.json({ 
        error: 'Alert not found' 
      }, { status: 404 })
    }

    return NextResponse.json({ 
      success: true,
      message: 'Alert deleted successfully' 
    })

  } catch (error) {
    console.error('Error deleting alert:', error)
    return NextResponse.json({ 
      error: 'Failed to delete alert' 
    }, { status: 500 })
  }
}
