import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import { IUser } from '@/models/User'

const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-jwt-key'

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12)
}

export async function verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
  return bcrypt.compare(password, hashedPassword)
}

export function generateToken(user: IUser): string {
  return jwt.sign(
    { 
      userId: user._id, 
      email: user.email,
      plan: user.plan 
    },
    JWT_SECRET,
    { expiresIn: '7d' }
  )
}

export function verifyToken(token: string): any {
  try {
    return jwt.verify(token, JWT_SECRET)
  } catch (error) {
    return null
  }
}

export function extractTokenFromRequest(request: Request): string | null {
  const authHeader = request.headers.get('authorization')
  if (authHeader && authHeader.startsWith('Bearer ')) {
    return authHeader.substring(7)
  }
  return null
}
