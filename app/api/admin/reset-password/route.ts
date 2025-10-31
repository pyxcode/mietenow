import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'
import { getUserModel } from '@/lib/get-user-model'
import bcrypt from 'bcryptjs'

export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  try {
    const { email, newPassword } = await request.json()
    
    if (!email || !newPassword) {
      return NextResponse.json({
        success: false,
        error: 'Email and newPassword required'
      }, { status: 400 })
    }
    
    // Utiliser connectDB() qui force maintenant mietenow-prod
    await connectDB()
    const UserModel = await getUserModel()
    
    const user = await UserModel.findOne({ email: email.toLowerCase() })
    
    if (!user) {
      return NextResponse.json({
        success: false,
        error: 'User not found'
      }, { status: 404 })
    }
    
    // Hasher le nouveau mot de passe
    const hashedPassword = await bcrypt.hash(newPassword, 10)
    
    // Mettre à jour le mot de passe
    const result = await UserModel.updateOne(
      { email: email.toLowerCase() },
      { $set: { password_hash: hashedPassword } }
    )
    
    if (result.modifiedCount > 0) {
      return NextResponse.json({
        success: true,
        message: 'Password reset successfully'
      })
    } else {
      return NextResponse.json({
        success: false,
        error: 'No changes made'
      }, { status: 400 })
    }
    
  } catch (error: any) {
    console.error('❌ Erreur reset password:', error)
    return NextResponse.json({
      success: false,
      error: error.message
    }, { status: 500 })
  }
}

