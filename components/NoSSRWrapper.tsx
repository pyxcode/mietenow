'use client'

import dynamic from 'next/dynamic'
import { ReactNode } from 'react'

interface NoSSRWrapperProps {
  children: ReactNode
}

const NoSSRWrapper = ({ children }: NoSSRWrapperProps) => {
  return <>{children}</>
}

export default dynamic(() => Promise.resolve(NoSSRWrapper), {
  ssr: false,
  loading: () => <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 flex items-center justify-center">
    <div className="text-white text-xl">Loading...</div>
  </div>
})
