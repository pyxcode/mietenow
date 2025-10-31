'use client'

import { useState, useEffect } from 'react'

export default function DebugDBPage() {
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetch('/api/check-db')
      .then(res => res.json())
      .then(data => {
        setData(data)
        setLoading(false)
      })
      .catch(err => {
        setError(err.message)
        setLoading(false)
      })
  }, [])

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <h1 className="text-2xl font-bold mb-4">🔍 Diagnostic Base de Données</h1>
        <p>Chargement...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="container mx-auto p-6">
        <h1 className="text-2xl font-bold mb-4">🔍 Diagnostic Base de Données</h1>
        <div className="bg-red-50 border border-red-200 rounded p-4">
          <p className="text-red-800">Erreur: {error}</p>
          <p className="text-sm text-red-600 mt-2">Essayez d'ouvrir directement: <code>/api/check-db</code></p>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">🔍 Diagnostic Base de Données</h1>
      
      {data.success ? (
        <div className="space-y-4">
          <div className="bg-green-50 border border-green-200 rounded p-4">
            <h2 className="font-semibold text-green-800 mb-2">✅ Connexion réussie</h2>
            <div className="space-y-2 text-sm">
              <p><strong>Base de données:</strong> {data.database.databaseName}</p>
              <p><strong>État de connexion:</strong> {data.database.connectionState} (1=connecté, 0=déconnecté)</p>
              <p><strong>Nom de connexion:</strong> {data.database.connectionName || 'N/A'}</p>
              <p><strong>Host:</strong> {data.database.host || 'N/A'}</p>
            </div>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded p-4">
            <h2 className="font-semibold text-blue-800 mb-2">📊 Statistiques</h2>
            <div className="space-y-2 text-sm">
              <p><strong>Listings:</strong> {data.counts?.listings ?? 0}</p>
              <p><strong>Users:</strong> {data.counts?.users ?? 0}</p>
            </div>
          </div>

          {data.database.databaseName === 'mietenow-prod' ? (
            <div className="bg-green-50 border border-green-200 rounded p-4">
              <p className="text-green-800 font-semibold">✅ Vous utilisez la bonne base de données: mietenow-prod</p>
            </div>
          ) : (
            <div className="bg-red-50 border border-red-200 rounded p-4">
              <p className="text-red-800 font-semibold">❌ ATTENTION: Vous utilisez "{data.database.databaseName}" au lieu de "mietenow-prod"</p>
            </div>
          )}

          {data.counts?.users === 0 && (
            <div className="bg-yellow-50 border border-yellow-200 rounded p-4">
              <p className="text-yellow-800 font-semibold">⚠️ Aucun utilisateur trouvé dans cette base de données</p>
              <p className="text-sm text-yellow-600 mt-2">Vos utilisateurs sont peut-être dans la base "test"</p>
            </div>
          )}
        </div>
      ) : (
        <div className="bg-red-50 border border-red-200 rounded p-4">
          <p className="text-red-800">❌ Erreur: {data.error}</p>
        </div>
      )}

      <div className="mt-6 p-4 bg-gray-50 rounded">
        <h3 className="font-semibold mb-2">🔗 Routes API disponibles:</h3>
        <ul className="list-disc list-inside space-y-1 text-sm">
          <li><code>/api/check-db</code> - Vérification simple</li>
          <li><code>/api/debug/database-info</code> - Informations détaillées</li>
        </ul>
      </div>
    </div>
  )
}

