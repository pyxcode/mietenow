#!/bin/bash

echo "🐳 Test du build Docker pour MieteNow"
echo "======================================"

# Vérifier si Docker est installé
if ! command -v docker &> /dev/null; then
    echo "❌ Docker n'est pas installé"
    echo "📥 Installation de Docker..."
    echo "   - macOS: brew install --cask docker"
    echo "   - Linux: sudo apt-get install docker.io"
    echo "   - Windows: Télécharger Docker Desktop"
    exit 1
fi

# Vérifier si Docker est démarré
if ! docker info &> /dev/null; then
    echo "❌ Docker n'est pas démarré"
    echo "🚀 Démarrez Docker Desktop ou lancez: sudo systemctl start docker"
    exit 1
fi

echo "✅ Docker est disponible"

# Nettoyer les images précédentes
echo "🧹 Nettoyage des images précédentes..."
docker rmi mietenow 2>/dev/null || true

# Build de l'image
echo "🔨 Construction de l'image Docker..."
docker build -t mietenow .

if [ $? -eq 0 ]; then
    echo "✅ Build Docker réussi !"
    echo "🚀 Pour tester localement:"
    echo "   docker run -p 3000:3000 mietenow"
else
    echo "❌ Échec du build Docker"
    exit 1
fi
