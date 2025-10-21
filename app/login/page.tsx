'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useLanguage } from '@/contexts/LanguageContext'
import { useAuth } from '@/contexts/AuthContext'
import { ChevronLeft, Mail, Lock } from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'
import SimpleHeader from '@/components/SimpleHeader'

export default function LoginPage() {
  const { language } = useLanguage()
  const { login, user } = useAuth()
  const router = useRouter()
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  // Rediriger si déjà connecté
  useEffect(() => {
    if (user) {
      router.push('/search')
    }
  }, [user, router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    const result = await login(formData.email, formData.password)
    
    if (result.success) {
      // Rediriger vers la page de recherche après connexion
      router.push('/search')
    } else {
      setError(result.error || (language === 'de' ? 'Ein Fehler ist aufgetreten' : 'An error occurred'))
    }
    
    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 relative">
      <SimpleHeader />
      
      {/* Background Image */}
      <div className="absolute -bottom-[340px] left-0 right-0 z-5">
        <img 
          src="/Logos/berlin.png" 
          alt="Berlin" 
          className="w-full h-auto opacity-10"
        />
      </div>

      {/* Main Content */}
      <div className="flex items-center justify-center px-4 py-16">
        <div className="max-w-2xl w-full">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-3xl md:text-4xl font-bold text-white mb-4 leading-tight">
              {language === 'de' 
                ? 'Willkommen zurück!'
                : 'Welcome back!'
              }
            </h1>
            <p className="text-base md:text-lg text-gray-300 leading-relaxed">
              {language === 'de' 
                ? 'Melde dich in deinem Konto an, um deine Wohnungssuche fortzusetzen.'
                : 'Sign in to your account to continue your apartment search.'
              }
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 space-y-4">
            {/* Email */}
            <div>
              <label className="block text-white text-base font-semibold mb-2">
                {language === 'de' ? 'E-Mail' : 'E-mail'}
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  placeholder="your@email.com"
                  className="w-full pl-10 pr-4 py-3 rounded-lg border-2 border-white/20 bg-white/5 text-white placeholder-gray-400 focus:border-mineral focus:outline-none transition-colors text-sm"
                  required
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-white text-base font-semibold mb-2">
                {language === 'de' ? 'Passwort' : 'Password'}
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="password"
                  value={formData.password}
                  onChange={(e) => handleInputChange('password', e.target.value)}
                  placeholder={language === 'de' ? 'Passwort' : 'Password'}
                  className="w-full pl-10 pr-4 py-3 rounded-lg border-2 border-white/20 bg-white/5 text-white placeholder-gray-400 focus:border-mineral focus:outline-none transition-colors text-sm"
                  required
                />
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div className="bg-red-500/20 border border-red-500/30 text-red-200 px-4 py-3 rounded-lg text-sm">
                {error}
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#00BFA6] hover:bg-[#00BFA6]/90 disabled:opacity-50 disabled:cursor-not-allowed text-white py-3 rounded-lg font-semibold text-base transition-colors flex items-center justify-center"
            >
              {loading 
                ? (language === 'de' ? 'Wird angemeldet...' : 'Signing in...')
                : (language === 'de' ? 'Anmelden' : 'Sign In')
              }
            </button>
          </form>

          {/* Navigation */}
          <div className="flex justify-between items-center mt-6">
            <Link 
              href="/"
              className="flex items-center space-x-2 text-gray-300 hover:text-white transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
              <span className="text-sm">{language === 'de' ? 'Zurück' : 'Back'}</span>
            </Link>
            
            <Link 
              href="/signup"
              className="text-[#00BFA6] hover:text-[#00BFA6]/80 transition-colors text-sm font-medium"
            >
              {language === 'de' ? 'Noch kein Konto? Jetzt registrieren' : "Don't have an account? Sign up now"}
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}