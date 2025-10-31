import NextAuth from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import connectDB from '@/lib/mongodb'
import mongoose from 'mongoose'
import { User } from '@/models'
import bcrypt from 'bcryptjs'

const handler = NextAuth({
  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null
        }

        try {
          await connectDB()
          
          // Forcer l'utilisation de mietenow-prod
          const connection = mongoose.connection.useDb('mietenow-prod')
          console.log(`🔐 NextAuth - Base de données: ${connection.db?.databaseName || 'unknown'}`)
          
          // Utiliser la connexion forcée pour chercher l'utilisateur
          const user = await User.findOne({ email: credentials.email.toLowerCase() })
          
          if (!user) {
            console.log('❌ Utilisateur non trouvé:', credentials.email)
            return null
          }

          // Vérifier le mot de passe
          const passwordField = user.password || user.password_hash
          if (!passwordField) {
            console.log('❌ Pas de mot de passe pour:', credentials.email)
            return null
          }

          const isPasswordValid = await bcrypt.compare(credentials.password, passwordField)
          if (!isPasswordValid) {
            console.log('❌ Mot de passe invalide pour:', credentials.email)
            return null
          }

          console.log('✅ Connexion réussie pour:', credentials.email)

          // Retourner l'objet utilisateur qui sera stocké dans la session
          return {
            id: user._id.toString(),
            email: user.email,
            firstName: user.first_name,
            lastName: user.last_name,
            plan: user.plan,
            subscription_status: user.subscription_status,
            plan_expires_at: user.plan_expires_at,
            isSubscribed: user.isSubscribed,
            // Stocker l'ID utilisateur pour les appels API backend
            userId: user._id.toString()
          }
        } catch (error) {
          console.error('Erreur lors de l\'autorisation:', error)
          return null
        }
      }
    })
  ],
  callbacks: {
    async jwt({ token, user }) {
      // Stocker les informations utilisateur dans le token JWT
      if (user) {
        token.userId = user.userId
        token.firstName = user.firstName
        token.lastName = user.lastName
        token.plan = user.plan
        token.subscription_status = user.subscription_status
        token.plan_expires_at = user.plan_expires_at
        token.isSubscribed = user.isSubscribed
      }
      return token
    },
    async session({ session, token }) {
      // Envoyer les propriétés vers le client
      if (token) {
        session.user.id = token.userId
        session.user.firstName = token.firstName
        session.user.lastName = token.lastName
        session.user.plan = token.plan
        session.user.subscription_status = token.subscription_status
        session.user.plan_expires_at = token.plan_expires_at
        session.user.isSubscribed = token.isSubscribed
      }
      return session
    }
  },
  pages: {
    signIn: '/login',
    error: '/login'
  },
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 jours
  },
  secret: process.env.NEXTAUTH_SECRET || 'your-nextauth-secret-key'
})

export { handler as GET, handler as POST }
