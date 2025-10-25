import bcrypt from 'bcryptjs'
import { SignJWT, jwtVerify } from 'jose'
import { IUser } from '@/models/User'

const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-jwt-key'

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12)
}

export async function verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
  return bcrypt.compare(password, hashedPassword)
}

export async function generateToken(user: IUser): Promise<string> {
  const secret = new TextEncoder().encode(JWT_SECRET)
  return new SignJWT({ 
    userId: user._id, 
    email: user.email,
    plan: user.plan 
  })
    .setProtectedHeader({ alg: 'HS256' })
    .setExpirationTime('7d')
    .setIssuedAt()
    .sign(secret)
}

export async function verifyToken(token: string): Promise<any> {
  try {
    const secret = new TextEncoder().encode(JWT_SECRET)
    const { payload } = await jwtVerify(token, secret)
    return payload
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
