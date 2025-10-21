'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Menu, X, Globe } from 'lucide-react'
import { useTranslation } from '@/hooks/useTranslation'
import { useAuth } from '@/contexts/AuthContext'
import UserDropdown from './UserDropdown'

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isLanguageOpen, setIsLanguageOpen] = useState(false)
  const { language, changeLanguage, t } = useTranslation()
  const { user, loading } = useAuth()

  const navigation = [
    { name: t('nav.rent'), href: '/mieten' },
    { name: t('nav.solutions'), href: '/solutions' },
    { name: t('nav.about'), href: '/about' },
  ]

  return (
    <header className="bg-white shadow-sm border-b border-gray-100 sticky top-0 z-[2000]">
      <div className="container-custom">
        <div className="flex justify-between items-center h-20">
          {/* Logo */}
          <Link href="/" className="flex items-center">
            <Image
              src="/Logos/L1.png"
              alt="MieteNow"
              width={120}
              height={55}
              className="h-52 w-auto"
            />
          </Link>

          {/* Navigation Desktop */}
          <nav className="hidden md:flex items-center space-x-8">
            {navigation.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className="text-gray-600 hover:text-mineral transition-colors duration-200"
              >
                {item.name}
              </Link>
            ))}
          </nav>

          {/* Language Selector & CTA Buttons */}
          <div className="hidden md:flex items-center space-x-4">
            {/* Language Selector */}
            <div className="relative">
              <button
                onClick={() => setIsLanguageOpen(!isLanguageOpen)}
                className="flex items-center space-x-2 text-gray-600 hover:text-mineral transition-colors bg-gray-50 hover:bg-gray-100 px-3 py-2 rounded-lg"
              >
                <span className="text-lg">{language === 'de' ? '🇩🇪' : '🇬🇧'}</span>
                <span className="text-sm font-medium">{language.toUpperCase()}</span>
              </button>
              
              {isLanguageOpen && (
                <div className="absolute right-0 mt-2 w-32 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50">
                  <button
                    onClick={() => {
                      changeLanguage('de')
                      setIsLanguageOpen(false)
                    }}
                    className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-50 transition-colors ${
                      language === 'de' ? 'text-mineral font-medium' : 'text-gray-600'
                    }`}
                  >
                    🇩🇪 Deutsch
                  </button>
                  <button
                    onClick={() => {
                      changeLanguage('en')
                      setIsLanguageOpen(false)
                    }}
                    className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-50 transition-colors ${
                      language === 'en' ? 'text-mineral font-medium' : 'text-gray-600'
                    }`}
                  >
                    🇬🇧 English
                  </button>
                </div>
              )}
            </div>

            {loading ? (
              <div className="w-10 h-10 bg-gray-200 rounded-full animate-pulse"></div>
            ) : user ? (
              <UserDropdown />
            ) : (
              <Link 
                href="/login" 
                className="bg-[#00BFA6] hover:bg-[#00A693] text-white px-4 py-2 rounded-lg font-medium transition-colors duration-200"
              >
                {t('nav.login')}
              </Link>
            )}
          </div>

          {/* Mobile menu button */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden p-2 rounded-lg text-gray-600 hover:text-mineral hover:bg-gray-50"
          >
            {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden border-t border-gray-100 bg-white">
            <nav className="py-4 space-y-2">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className="block px-4 py-2 text-gray-600 hover:text-mineral hover:bg-gray-50 rounded-lg transition-colors"
                  onClick={() => setIsMenuOpen(false)}
                >
                  {item.name}
                </Link>
              ))}
              <div className="px-4 pt-4 space-y-2">
                {/* Mobile Language Selector */}
                <div className="flex items-center justify-center space-x-4 py-2">
                  <button
                    onClick={() => {
                      changeLanguage('de')
                      setIsMenuOpen(false)
                    }}
                    className={`flex items-center space-x-2 px-3 py-1 rounded-lg transition-colors ${
                      language === 'de' ? 'bg-mineral text-white' : 'bg-gray-100 text-gray-600'
                    }`}
                  >
                    <span>🇩🇪</span>
                    <span className="text-sm">DE</span>
                  </button>
                  <button
                    onClick={() => {
                      changeLanguage('en')
                      setIsMenuOpen(false)
                    }}
                    className={`flex items-center space-x-2 px-3 py-1 rounded-lg transition-colors ${
                      language === 'en' ? 'bg-mineral text-white' : 'bg-gray-100 text-gray-600'
                    }`}
                  >
                    <span>🇬🇧</span>
                    <span className="text-sm">EN</span>
                  </button>
                </div>
                
                {loading ? (
                  <div className="w-full h-10 bg-gray-200 rounded-lg animate-pulse"></div>
                ) : user ? (
                  <div className="flex justify-center">
                    <UserDropdown />
                  </div>
                ) : (
                  <Link
                    href="/login"
                    className="block w-full text-center bg-[#00BFA6] hover:bg-[#00A693] text-white py-2 rounded-lg font-medium transition-colors duration-200"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    {t('nav.login')}
                  </Link>
                )}
              </div>
            </nav>
          </div>
        )}
      </div>
    </header>
  )
}
