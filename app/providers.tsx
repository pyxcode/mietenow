'use client'

import { useEffect } from 'react'
import { AuthProvider } from '@/contexts/AuthContext'
import { LanguageProvider } from '@/contexts/LanguageContext'

export default function Providers({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    // Initialize Crisp Chat
    if (typeof window !== 'undefined') {
      const initCrisp = () => {
        window.$crisp = []
        window.CRISP_WEBSITE_ID = "e9057db7-b421-440c-8276-ce74d7f617e7"
        const d = document
        const s = d.createElement("script")
        s.src = "https://client.crisp.chat/l.js"
        s.async = true
        d.getElementsByTagName("head")[0].appendChild(s)
      }

      if (window.requestAnimationFrame) {
        window.requestAnimationFrame(initCrisp)
      } else {
        setTimeout(initCrisp, 0)
      }
    }
  }, [])

  return (
    <AuthProvider>
      <LanguageProvider>
        {children}
      </LanguageProvider>
    </AuthProvider>
  )
}
