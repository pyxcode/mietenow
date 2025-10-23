'use client'

export const dynamic = 'force-dynamic'

import SimpleHeader from '@/components/SimpleHeader'
import Link from 'next/link'

export default function PaymentCancel() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900">
      <SimpleHeader />
      <div className="flex items-center justify-center min-h-[80vh]">
        <div className="text-center text-white max-w-md mx-auto">
          <div className="text-6xl mb-6">❌</div>
          <h1 className="text-4xl font-bold mb-4">Paiement annulé</h1>
          <p className="text-xl mb-8">
            Votre paiement a été annulé. Aucun montant n'a été débité.
          </p>
          <div className="space-y-4">
            <Link 
              href="/payment"
              className="block bg-[#00BFA6] hover:bg-[#00A693] text-white px-8 py-3 rounded-lg font-bold text-lg transition-colors duration-200"
            >
              Réessayer
            </Link>
            <Link 
              href="/"
              className="block text-white hover:text-blue-300 transition-colors duration-200"
            >
              Retour à l'accueil
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
