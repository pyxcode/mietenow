'use client'

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <html lang="de">
      <body>
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 flex items-center justify-center px-4">
          <div className="text-center">
            <h1 className="text-6xl font-bold text-white mb-4">500</h1>
            <h2 className="text-2xl font-semibold text-blue-200 mb-8">
              Ein Fehler ist aufgetreten
            </h2>
            <p className="text-gray-300 mb-8">
              {error.message || 'Etwas ist schief gelaufen. Bitte versuchen Sie es später erneut.'}
            </p>
            <button
              onClick={() => reset()}
              className="bg-[#00BFA6] hover:bg-[#00A693] text-white px-6 py-3 rounded-lg font-semibold transition-colors duration-200"
            >
              Erneut versuchen
            </button>
          </div>
        </div>
      </body>
    </html>
  )
}
