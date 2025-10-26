'use client'

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react'

interface User {
  id: string
  firstName: string
  lastName: string
  email: string
  plan: string
  subscription_status: string
  plan_expires_at?: string
  isSubscribed: boolean
  searchPreferences?: {
    city: string
    max_price: number
    type: string
    surface_min: number
  }
}

interface AuthContextType {
  user: User | null
  loading: boolean
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>
  register: (firstName: string, lastName: string, email: string, password: string) => Promise<{ success: boolean; error?: string }>
  logout: () => void
  updateUser: (userData: Partial<User>) => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    // Fallback pour le prerendering côté serveur
    return {
      user: null,
      loading: false,
      login: async () => ({ success: false, error: 'Not available during prerendering' }),
      register: async () => ({ success: false, error: 'Not available during prerendering' }),
      logout: () => {},
      updateUser: () => {}
    }
  }
  return context
}

interface AuthProviderProps {
  children: ReactNode
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  // Fonctions pour gérer les cookies
  const setCookie = (name: string, value: string, days: number) => {
    const expires = new Date()
    expires.setTime(expires.getTime() + (days * 24 * 60 * 60 * 1000))
    document.cookie = `${name}=${value}; expires=${expires.toUTCString()}; path=/; secure; samesite=strict`
  }

  const getCookie = (name: string): string | null => {
    const nameEQ = name + "="
    const ca = document.cookie.split(';')
    for (let i = 0; i < ca.length; i++) {
      let c = ca[i]
      while (c.charAt(0) === ' ') c = c.substring(1, c.length)
      if (c.indexOf(nameEQ) === 0) return c.substring(nameEQ.length, c.length)
    }
    return null
  }

  const deleteCookie = (name: string) => {
    document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`
  }

  // Vérifier si l'utilisateur est connecté au chargement
  useEffect(() => {
    checkAuthStatus()
  }, [])

  const checkAuthStatus = async () => {
    try {
      // Essayer d'abord localStorage, puis cookies
      let token = localStorage.getItem('authToken')
      if (!token) {
        token = getCookie('authToken')
      }
      
      if (!token) {
        console.log('🔍 Aucun token trouvé')
        setLoading(false)
        return
      }

      console.log('🔍 Token trouvé, vérification...')
      const response = await fetch('/api/auth/verify', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      console.log('🔍 Réponse de vérification:', response.status)

      if (response.ok) {
        const data = await response.json()
        console.log('✅ Utilisateur authentifié:', data.user.email)
        setUser(data.user)
      } else {
        console.log('❌ Token invalide, nettoyage...')
        // Token invalide, le supprimer de localStorage ET cookies
        localStorage.removeItem('authToken')
        localStorage.removeItem('userId')
        deleteCookie('authToken')
        deleteCookie('userId')
      }
    } catch (error) {
      console.error('❌ Erreur lors de la vérification de l\'authentification:', error)
      localStorage.removeItem('authToken')
      localStorage.removeItem('userId')
      deleteCookie('authToken')
      deleteCookie('userId')
    } finally {
      setLoading(false)
    }
  }

  const login = async (email: string, password: string) => {
    try {
      console.log('🔍 Tentative de connexion pour:', email)
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email, password })
      })

      const data = await response.json()

      if (response.ok) {
        console.log('✅ Login réussi, sauvegarde du token...')
        // Sauvegarder dans localStorage ET cookies
        localStorage.setItem('authToken', data.token)
        localStorage.setItem('userId', data.user.id)
        setCookie('authToken', data.token, 30) // 30 jours
        setCookie('userId', data.user.id, 30)
        setUser(data.user)
        console.log('✅ Token sauvegardé, utilisateur connecté:', data.user.email)
        return { success: true }
      } else {
        console.log('❌ Login échoué:', data.error)
        return { success: false, error: data.error }
      }
    } catch (error) {
      console.error('Erreur lors de la connexion:', error)
      return { success: false, error: 'Erreur de connexion' }
    }
  }

  const register = async (firstName: string, lastName: string, email: string, password: string) => {
    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ firstName, lastName, email, password })
      })

      const data = await response.json()

      if (response.ok) {
        // Sauvegarder dans localStorage ET cookies
        localStorage.setItem('authToken', data.token)
        localStorage.setItem('userId', data.user.id)
        setCookie('authToken', data.token, 30) // 30 jours
        setCookie('userId', data.user.id, 30)
        setUser(data.user)
        return { success: true }
      } else {
        return { success: false, error: data.error }
      }
    } catch (error) {
      console.error('Erreur lors de l\'inscription:', error)
      return { success: false, error: 'Erreur d\'inscription' }
    }
  }

  const logout = () => {
    // Supprimer de localStorage ET cookies
    localStorage.removeItem('authToken')
    localStorage.removeItem('userId')
    deleteCookie('authToken')
    deleteCookie('userId')
    setUser(null)
  }

  const updateUser = (userData: Partial<User>) => {
    if (user) {
      setUser({ ...user, ...userData })
    }
  }

  const value: AuthContextType = {
    user,
    loading,
    login,
    register,
    logout,
    updateUser
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}
