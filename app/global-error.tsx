'use client'

import { useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error(error)
  }, [error])

  return (
    <html lang="de">
      <body>
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 flex flex-col items-center justify-center text-white p-4">
          <Image
            src="/Logos/L1.png"
            alt="MieteNow Logo"
            width={150}
            height={150}
            className="mb-8"
          />
          <h1 className="text-6xl font-bold mb-4">500</h1>
          <h2 className="text-2xl mb-8 text-center">Une erreur est survenue</h2>
          <p className="text-lg text-center mb-12">
            Désolé, quelque chose s'est mal passé.
          </p>
          <button
            onClick={() => reset()}
            className="bg-[#00BFA6] hover:bg-[#00A693] text-white px-6 py-3 rounded-lg font-semibold text-lg transition-colors duration-200 mb-4"
          >
            Réessayer
          </button>
          <Link href="/" className="text-blue-300 hover:underline">
            Retour à l'accueil
          </Link>
        </div>
      </body>
    </html>
  )
}