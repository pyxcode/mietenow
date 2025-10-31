import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'
import { getUserModel } from '@/lib/get-user-model'
import bcrypt from 'bcryptjs'

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json()
    
    console.log('\n🧪 TEST LOGIN - Début')
    console.log('📧 Email:', email)
    
    await connectDB()
    console.log('✅ MongoDB connecté')
    
    const UserModel = await getUserModel()
    console.log('✅ UserModel obtenu')
    
    const user = await UserModel.findOne({ email: email.toLowerCase() })
    console.log('🔍 User trouvé:', user ? 'OUI' : 'NON')
    
    if (!user) {
      return NextResponse.json({
        success: false,
        error: 'User not found'
      }, { status: 401 })
    }
    
    const userDoc = user.toObject ? user.toObject() : user
    const passwordField = (userDoc as any).password || (userDoc as any).password_hash
    console.log('🔑 Password field existe:', !!passwordField)
    
    if (!passwordField) {
      return NextResponse.json({
        success: false,
        error: 'No password field'
      }, { status: 401 })
    }
    
    const isValid = await bcrypt.compare(password, passwordField)
    console.log('🔐 Password valid:', isValid)
    
    return NextResponse.json({
      success: isValid,
      userFound: !!user,
      hasPassword: !!passwordField,
      passwordValid: isValid,
      email: (userDoc as any).email
    })
    
  } catch (error: any) {
    console.error('❌ Erreur test login:', error)
    return NextResponse.json({
      success: false,
      error: error.message,
      stack: error.stack
    }, { status: 500 })
  }
}

