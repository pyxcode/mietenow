import NextAuth from 'next-auth'

declare module 'next-auth' {
  interface Session {
    user: {
      id: string
      email: string
      firstName: string
      lastName: string
      plan: string
      subscription_status: string
      plan_expires_at?: string
      isSubscribed: boolean
    }
  }

  interface User {
    id: string
    email: string
    firstName: string
    lastName: string
    plan: string
    subscription_status: string
    plan_expires_at?: string
    isSubscribed: boolean
    userId: string
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    userId: string
    firstName: string
    lastName: string
    plan: string
    subscription_status: string
    plan_expires_at?: string
    isSubscribed: boolean
  }
}
