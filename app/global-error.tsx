'use client'

export default function GlobalError() {
  return (
    <html>
      <body>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-4xl font-bold mb-4">500</h1>
            <p className="text-gray-600">Une erreur est survenue</p>
          </div>
        </div>
      </body>
    </html>
  )
}
