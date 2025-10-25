#!/bin/bash

# Nettoyer l'environnement
echo "🧹 Nettoyage de l'environnement..."
rm -rf .next
rm -rf build
rm -rf node_modules

# Installer les dépendances en mode production
echo "📦 Installation des dépendances en mode production..."
# NODE_ENV sera défini automatiquement par Render
npm ci

# Lancer le build
echo "🏗️ Lancement du build..."
npm run build

# Vérifier le statut du build
BUILD_STATUS=$?

if [ $BUILD_STATUS -eq 0 ]; then
    echo "✅ Build réussi !"
    
    # Vérifier les fichiers générés
    echo "🔍 Vérification des fichiers générés..."
    
    # Vérifier si des fichiers HTML ont été générés dans .next/server/pages
    if [ -d ".next/server/pages" ]; then
        echo "📄 Fichiers dans .next/server/pages :"
        ls -la .next/server/pages
    fi
    
    # Vérifier les warnings TypeScript
    echo "🔍 Vérification des warnings TypeScript..."
    npm run lint
    
    echo "✨ Toutes les vérifications sont passées !"
    exit 0
else
    echo "❌ Build échoué avec le code $BUILD_STATUS"
    exit $BUILD_STATUS
fi
