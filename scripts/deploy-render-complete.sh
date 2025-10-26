#!/bin/bash

# 🚀 Script de déploiement Render pour MieteNow avec Cron Jobs
# Ce script déploie l'application et configure tous les cron jobs

set -e  # Arrêter en cas d'erreur

# Couleurs pour les logs
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Fonction de log coloré
log() {
    echo -e "${BLUE}[$(date +'%Y-%m-%d %H:%M:%S')]${NC} $1"
}

error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

# Vérifier les prérequis
check_prerequisites() {
    log "🔍 Vérification des prérequis..."
    
    if [ -z "$RENDER_API_KEY" ]; then
        error "RENDER_API_KEY n'est pas défini"
        echo "💡 Définissez votre clé API Render :"
        echo "   export RENDER_API_KEY=your_api_key"
        echo "   Ou ajoutez-la à votre fichier .env.local"
        exit 1
    fi
    
    if ! command -v curl &> /dev/null; then
        error "curl n'est pas installé"
        exit 1
    fi
    
    if ! command -v git &> /dev/null; then
        error "git n'est pas installé"
        exit 1
    fi
    
    success "Prérequis OK"
}

# Vérifier le statut d'un service
check_service_status() {
    local service_id=$1
    local service_name=$2
    
    log "🔍 Vérification du statut de $service_name..."
    
    local response=$(curl -s -H "Authorization: Bearer $RENDER_API_KEY" \
        "https://api.render.com/v1/services/$service_id")
    
    local status=$(echo "$response" | grep -o '"serviceState":"[^"]*"' | cut -d'"' -f4)
    
    if [ "$status" = "live" ]; then
        success "$service_name est en ligne"
        return 0
    else
        warning "$service_name statut: $status"
        return 1
    fi
}

# Déclencher un déploiement
trigger_deploy() {
    local service_id=$1
    local service_name=$2
    
    log "🚀 Déclenchement du déploiement de $service_name..."
    
    local response=$(curl -s -X POST \
        -H "Authorization: Bearer $RENDER_API_KEY" \
        -H "Content-Type: application/json" \
        "https://api.render.com/v1/services/$service_id/deploys")
    
    local deploy_id=$(echo "$response" | grep -o '"id":"[^"]*"' | cut -d'"' -f4)
    
    if [ -z "$deploy_id" ]; then
        error "Échec du déclenchement du déploiement pour $service_name"
        echo "Response: $response"
        return 1
    fi
    
    log "📋 ID du déploiement: $deploy_id"
    echo "$deploy_id"
}

# Suivre le statut d'un déploiement
follow_deploy() {
    local service_id=$1
    local deploy_id=$2
    local service_name=$3
    
    log "⏳ Suivi du déploiement de $service_name..."
    
    local max_attempts=60  # 10 minutes max
    local attempt=0
    
    while [ $attempt -lt $max_attempts ]; do
        local response=$(curl -s -H "Authorization: Bearer $RENDER_API_KEY" \
            "https://api.render.com/v1/services/$service_id/deploys/$deploy_id")
        
        local status=$(echo "$response" | grep -o '"status":"[^"]*"' | cut -d'"' -f4)
        
        case $status in
            "created"|"build_in_progress"|"update_in_progress"|"live_in_progress")
                log "📊 Statut: $status (tentative $((attempt + 1))/$max_attempts)"
                sleep 10
                ;;
            "live")
                success "Déploiement de $service_name réussi !"
                return 0
                ;;
            "build_failed"|"update_failed"|"live_failed"|"deactivated")
                error "Échec du déploiement de $service_name: $status"
                return 1
                ;;
            *)
                warning "Statut inconnu pour $service_name: $status"
                sleep 10
                ;;
        esac
        
        attempt=$((attempt + 1))
    done
    
    error "Timeout du déploiement de $service_name"
    return 1
}

# Déployer tous les services
deploy_all_services() {
    log "🚀 Début du déploiement de tous les services..."
    
    # IDs des services (à remplacer par vos vrais IDs)
    local services=(
        "srv-d3ue6bvdiees73e74g70:mietenow-web:Application Web"
        "crn-scraper:mietenow-scraper:Cron Scraping"
        "crn-cleanup:mietenow-cleanup:Cron Cleanup"
        "crn-plans:mietenow-plans:Cron Plans"
        "crn-unpaid:mietenow-unpaid:Cron Unpaid"
        "crn-daily:mietenow-daily-cleanup:Cron Daily"
        "crn-hourly:mietenow-hourly:Cron Hourly"
    )
    
    local failed_deploys=()
    
    for service_info in "${services[@]}"; do
        IFS=':' read -r service_id service_name display_name <<< "$service_info"
        
        if [ "$service_id" = "crn-scraper" ] || [ "$service_id" = "crn-cleanup" ] || 
           [ "$service_id" = "crn-plans" ] || [ "$service_id" = "crn-unpaid" ] || 
           [ "$service_id" = "crn-daily" ] || [ "$service_id" = "crn-hourly" ]; then
            warning "Service $display_name nécessite un ID réel (actuellement: $service_id)"
            continue
        fi
        
        log "🔄 Déploiement de $display_name..."
        
        local deploy_id=$(trigger_deploy "$service_id" "$display_name")
        if [ $? -eq 0 ] && [ -n "$deploy_id" ]; then
            if follow_deploy "$service_id" "$deploy_id" "$display_name"; then
                success "$display_name déployé avec succès"
            else
                error "Échec du déploiement de $display_name"
                failed_deploys+=("$display_name")
            fi
        else
            error "Impossible de déclencher le déploiement de $display_name"
            failed_deploys+=("$display_name")
        fi
        
        echo ""
    done
    
    # Résumé
    if [ ${#failed_deploys[@]} -eq 0 ]; then
        success "🎉 Tous les déploiements ont réussi !"
    else
        error "❌ Déploiements échoués:"
        for failed in "${failed_deploys[@]}"; do
            echo "  - $failed"
        done
        exit 1
    fi
}

# Fonction principale
main() {
    log "🚀 Déploiement Render pour MieteNow"
    log "=================================="
    
    check_prerequisites
    deploy_all_services
    
    log ""
    success "🎉 Déploiement terminé !"
    log "📊 Vérifiez vos services dans le Dashboard Render"
    log "🔗 https://dashboard.render.com"
}

# Exécuter le script
main "$@"
