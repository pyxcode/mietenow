'use client'

import { useEffect } from 'react'

export default function CrispChat() {
  useEffect(() => {
    // Initialiser Crisp uniquement côté client
    window.$crisp = []
    window.CRISP_WEBSITE_ID = "e9057db7-b421-440c-8276-ce74d7f617e7"
    
    const script = document.createElement('script')
    script.src = 'https://client.crisp.chat/l.js'
    script.async = true
    document.getElementsByTagName('head')[0].appendChild(script)
  }, [])

  return null
}
