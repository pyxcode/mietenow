#!/bin/bash

# 🚀 Script de déploiement Render pour MieteNow
# Ce script déploie l'application web et configure tous les cron jobs

# Vérifier si le token API est défini
if [ -z "$RENDER_API_KEY" ]; then
    echo "❌ RENDER_API_KEY n'est pas défini"
    echo "💡 Définissez votre clé API Render : export RENDER_API_KEY=your_api_key"
    exit 1
fi

# IDs des services (extraits de l'URL du dashboard Render)
WEB_SERVICE_ID="srv-d3ue6bvdiees73e74g70"  # Service web principal
CRON_SCRAPER_ID="crn-xxxxx"  # À remplacer par l'ID réel du cron scraper
CRON_CLEANUP_ID="crn-xxxxx"  # À remplacer par l'ID réel du cron cleanup
CRON_ALERTS_ID="crn-xxxxx"  # À remplacer par l'ID réel du cron alerts
CRON_PLANS_ID="crn-xxxxx"   # À remplacer par l'ID réel du cron plans

# Fonction pour vérifier le statut du déploiement
check_deploy_status() {
    local deploy_id=$1
    local status=$(curl -s -H "Authorization: Bearer $RENDER_API_KEY" \
        "https://api.render.com/v1/services/$SERVICE_ID/deploys/$deploy_id" | \
        grep -o '"status":"[^"]*"' | cut -d'"' -f4)
    echo $status
}

# Déclencher un nouveau déploiement
echo "🚀 Déclenchement d'un nouveau déploiement..."
DEPLOY_RESPONSE=$(curl -s -X POST \
    -H "Authorization: Bearer $RENDER_API_KEY" \
    "https://api.render.com/v1/services/$SERVICE_ID/deploys")

# Extraire l'ID du déploiement
DEPLOY_ID=$(echo $DEPLOY_RESPONSE | grep -o '"id":"[^"]*"' | cut -d'"' -f4)

if [ -z "$DEPLOY_ID" ]; then
    echo "❌ Échec du déclenchement du déploiement"
    exit 1
fi

echo "📋 ID du déploiement : $DEPLOY_ID"

# Suivre le statut du déploiement
echo "⏳ Suivi du déploiement..."
while true; do
    STATUS=$(check_deploy_status $DEPLOY_ID)
    echo "📊 Statut : $STATUS"
    
    case $STATUS in
        "created"|"build_in_progress"|"update_in_progress"|"live_in_progress")
            sleep 10
            ;;
        "live")
            echo "✅ Déploiement réussi !"
            exit 0
            ;;
        "build_failed"|"update_failed"|"live_failed"|"deactivated")
            echo "❌ Échec du déploiement"
            exit 1
            ;;
        *)
            echo "❓ Statut inconnu : $STATUS"
            exit 1
            ;;
    esac
done
