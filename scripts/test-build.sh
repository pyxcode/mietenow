#!/bin/bash

# Nettoyer les dossiers de build
echo "🧹 Nettoyage des dossiers de build..."
rm -rf .next
rm -rf out

# Installer les dépendances
echo "📦 Installation des dépendances..."
NODE_ENV=production npm ci

# Lancer le build
echo "🏗️ Lancement du build..."
NODE_ENV=production npm run build

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
        
        # Vérifier spécifiquement 404.html et 500.html
        if [ -f ".next/server/pages/404.html" ] || [ -f ".next/server/pages/500.html" ]; then
            echo "⚠️ ATTENTION : Les pages 404.html/500.html sont encore générées !"
            exit 1
        fi
    fi
    
    # Vérifier s'il y a des références à next/document
    echo "🔍 Recherche de références à next/document..."
    if grep -r "next/document" .next/static 2>/dev/null; then
        echo "⚠️ ATTENTION : Références à next/document trouvées dans le build !"
        exit 1
    fi
    
    echo "✨ Toutes les vérifications sont passées !"
    exit 0
else
    echo "❌ Build échoué avec le code $BUILD_STATUS"
    exit $BUILD_STATUS
fi
