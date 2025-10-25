import Link from 'next/link'
import Image from 'next/image'

export const dynamic = 'force-dynamic'

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 flex flex-col items-center justify-center text-white p-4">
      <Image
        src="/Logos/L1.png"
        alt="MieteNow Logo"
        width={150}
        height={150}
        className="mb-8"
      />
      <h1 className="text-6xl font-bold mb-4">404</h1>
      <h2 className="text-2xl mb-8 text-center">Page non trouvée</h2>
      <p className="text-lg text-center mb-12">
        Désolé, la page que vous recherchez n'existe pas.
      </p>
      <Link href="/" className="bg-[#00BFA6] hover:bg-[#00A693] text-white px-6 py-3 rounded-lg font-semibold text-lg transition-colors duration-200">
        Retour à l'accueil
      </Link>
    </div>
  )
}