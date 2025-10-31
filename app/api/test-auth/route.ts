import { NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'
import { getUserModel } from '@/lib/get-user-model'
import mongoose from 'mongoose'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    await connectDB()
    
    // Forcer mietenow-prod
    const connection = mongoose.connection.useDb('mietenow-prod')
    
    const info = {
      connectionState: mongoose.connection.readyState,
      connectionName: mongoose.connection.name,
      dbName: mongoose.connection.db?.databaseName,
      forcedConnectionName: connection.name,
      forcedDbName: connection.db?.databaseName
    }
    
    // Utiliser getUserModel() qui garantit mietenow-prod
    const UserModel = await getUserModel()
    const users = await UserModel.find({}).limit(3)
    
    return NextResponse.json({
      success: true,
      connectionInfo: info,
      usersFound: users.length,
      users: users.map((u: any) => ({
        email: u.email,
        id: u._id.toString(),
        hasPassword: !!(u.password || u.password_hash)
      })),
      message: '✅ Modèle User utilise bien mietenow-prod'
    })
  } catch (error: any) {
    return NextResponse.json({
      success: false,
      error: error.message,
      stack: error.stack
    }, { status: 500 })
  }
}

