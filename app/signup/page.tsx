'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useLanguage } from '@/contexts/LanguageContext'
import { useAuth } from '@/contexts/AuthContext'
import { ChevronLeft, Mail, Lock, User } from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'
import SimpleHeader from '@/components/SimpleHeader'

export const dynamic = 'force-dynamic'

export default function SignupPage() {
  const { language } = useLanguage()
  const { register } = useAuth()
  const router = useRouter()
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: ''
  })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [validationErrors, setValidationErrors] = useState({
    name: '',
    email: '',
    password: ''
  })

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    // Effacer l'erreur de validation quand l'utilisateur tape
    if (validationErrors[field as keyof typeof validationErrors]) {
      setValidationErrors(prev => ({ ...prev, [field]: '' }))
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    // Séparer le nom en prénom et nom de famille
    const nameParts = formData.name.trim().split(' ')
    const firstName = nameParts[0] || ''
    const lastName = nameParts.slice(1).join(' ') || ''

    if (!firstName) {
      setError(language === 'de' ? 'Bitte geben Sie Ihren vollständigen Namen ein' : 'Your first and last name are required')
      setLoading(false)
      return
    }

    const result = await register(firstName, lastName, formData.email, formData.password)
    
    if (result.success) {
      // Rediriger vers la page de paiement après création du compte
      router.push('/payment')
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
      
      {/* Progress Bar */}
      <div className="bg-white/10 backdrop-blur-sm border-b border-white/10 pt-4 pb-4">
          <div className="container-custom">
            <div className="flex items-center justify-center space-x-8">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 rounded-full bg-mineral text-white flex items-center justify-center text-sm font-semibold">1</div>
                <span className="text-white text-sm font-medium">{language === 'de' ? 'Standort' : 'Location'}</span>
              </div>
              <div className="w-12 h-px bg-white/20"></div>
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 rounded-full bg-mineral text-white flex items-center justify-center text-sm font-semibold">2</div>
                <span className="text-white text-sm font-medium">{language === 'de' ? 'Kriterien' : 'Criteria'}</span>
              </div>
              <div className="w-12 h-px bg-white/20"></div>
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 rounded-full bg-mineral text-white flex items-center justify-center text-sm font-semibold">3</div>
                <span className="text-white text-sm font-medium">{language === 'de' ? 'Los geht\'s!' : 'Let\'s go!'}</span>
              </div>
            </div>
          </div>
        </div>

      {/* Main Content */}
      <div className="flex items-center justify-center px-4 py-16">
        <div className="max-w-2xl w-full">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-3xl md:text-4xl font-bold text-white mb-4 leading-tight">
              {language === 'de' 
                ? 'Erhalte bis zu 42 Miet-Matches pro Tag direkt in deinem Posteingang!'
                : 'Receive up to 42 rental matches per day directly in your inbox!'
              }
            </h1>
            <p className="text-base md:text-lg text-gray-300 leading-relaxed">
              {language === 'de' 
                ? 'Beginne mit der Erstellung deines Kontos. Erhalte deine ersten Matches noch heute.'
                : 'Start by creating your account. Receive your first matches today.'
              }
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 space-y-4">
            {/* Name */}
            <div>
              <label className="block text-white text-base font-semibold mb-2">
                {language === 'de' ? 'Dein vollständiger Name' : 'Your full name'}
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  placeholder={language === 'de' ? 'Gib deinen vollständigen Namen ein' : 'Enter your full name'}
                  className="w-full pl-10 pr-4 py-3 rounded-lg border-2 border-white/20 bg-white/5 text-white placeholder-gray-400 focus:border-mineral focus:outline-none transition-colors text-sm"
                  required
                />
              </div>
            </div>

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
                ? (language === 'de' ? 'Konto wird erstellt...' : 'Creating account...')
                : (language === 'de' ? 'Zeige mir meine Matches' : 'Show me my matches')
              }
            </button>
          </form>

          {/* Navigation */}
          <div className="flex justify-between items-center mt-6">
            <Link 
              href="/criteria"
              className="flex items-center space-x-2 text-gray-300 hover:text-white transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
              <span className="text-sm">{language === 'de' ? 'Zurück' : 'Back'}</span>
            </Link>
            
          </div>
        </div>
      </div>
    </div>
  )
}
