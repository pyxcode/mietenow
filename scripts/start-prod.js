// Vérification de l'environnement de production
if (process.env.NODE_ENV !== 'production') {
  console.error('❌ NODE_ENV doit être défini sur "production" pour le démarrage en production')
  process.exit(1)
}

// Démarrer Next.js
require('next/dist/bin/next').default.startServer()
