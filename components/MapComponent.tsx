'use client'

import dynamic from 'next/dynamic'
import type { LatLngBounds } from 'leaflet'
import { useState, useRef, useEffect, useCallback, useMemo } from 'react'
import { RefreshCw, MapPin } from 'lucide-react'
import { useMap } from 'react-leaflet'
import { createPortal } from 'react-dom'
import React from 'react'
// Import de Leaflet avec vérification côté client
import L from 'leaflet'

// Import dynamique simple pour éviter les problèmes SSR
const MapContainer = dynamic(() => import('react-leaflet').then(mod => ({ default: mod.MapContainer })), {
  ssr: false,
  loading: () => <div className="w-full h-full bg-gray-200 flex items-center justify-center">Loading map...</div>
})

const TileLayer = dynamic(() => import('react-leaflet').then(mod => ({ default: mod.TileLayer })), {
  ssr: false
})

const CircleMarker = dynamic(() => import('react-leaflet').then(mod => ({ default: mod.CircleMarker })), {
  ssr: false
})

const Popup = dynamic(() => import('react-leaflet').then(mod => ({ default: mod.Popup })), {
  ssr: false
})

const Marker = dynamic(() => import('react-leaflet').then(mod => ({ default: mod.Marker })), {
  ssr: false
})


interface Listing {
  id: string
  title: string
  description: string
  price: string | number
  currency: string
  location: string
  city: string
  district?: string
  rooms: number
  size: number
  images: string[]
  url: string
  source: string
  features: string[]
  lat: number
  lng: number
  type: 'Room' | 'Studio' | 'Apartment' | 'House'
  furnished: boolean
  address?: string
  platform?: string
  link?: string
  scrapedAt?: string
  createdAt?: string
}

interface MapComponentProps {
  listings: Listing[]
  selectedListing: Listing | null
  clickedListing: Listing | null
  onListingSelect: (listing: Listing) => void
  onBoundsChange: (bounds: LatLngBounds) => void
  onRefreshVisibleListings?: (visibleListings: Listing[]) => void
  onListingClick?: (listing: Listing) => void
}

// Composant pour zoomer sur une annonce spécifique (SEULEMENT au clic)
function MapZoomToListing({ 
  clickedListing 
}: { 
  clickedListing: Listing | null 
}) {
  const map = useMap()

  useEffect(() => {
    if (clickedListing && map) {
      // Centrer entre le 3ème et 2ème tiers (pas au milieu de l'écran)
      const mapContainer = map.getContainer()
      const mapSize = map.getSize()
      
      // Calculer la position pour centrer entre 1/3 et 2/3
      const centerX = mapSize.x * 0.4 // 40% de la largeur (entre 1/3 et 2/3)
      const centerY = mapSize.y * 0.5 // 50% de la hauteur (milieu vertical)
      
      // Convertir les coordonnées de l'écran en coordonnées géographiques
      const point = L.point(centerX, centerY)
      const latLng = map.containerPointToLatLng(point)
      
      // Zoomer sur l'annonce cliquée avec animation rapide et fluide
      map.setView([clickedListing.lat, clickedListing.lng], 13, {
        animate: true,
        duration: 1.2, // Animation plus rapide mais fluide
        easeLinearity: 0.1, // Animation équilibrée
        noMoveStart: false // Permet l'animation de démarrage
      })
    }
  }, [clickedListing, map])

  return null
}

// Composant pour les marqueurs stables gérés par Leaflet (zéro flicker)
function StableMarkersLayer({ 
  listings, 
  selectedListing,
  onListingSelect, 
  onListingClick 
}: { 
  listings: Listing[]
  selectedListing: Listing | null
  onListingSelect: (listing: Listing) => void
  onListingClick?: (listing: Listing) => void
}) {
  const map = useMap()
  const layerRef = useRef<L.LayerGroup | null>(null)
  const markersRef = useRef<Record<string, L.Marker>>({})
  const hideTimeouts = useRef<Record<string, NodeJS.Timeout>>({})

  useEffect(() => {
    if (!map) return

    // Créer un groupe de couches stable (une seule fois)
    if (!layerRef.current) {
      layerRef.current = L.layerGroup().addTo(map)
    }

    const layer = layerRef.current
    const markers = markersRef.current

    const createCustomIcon = (price: string | number, isSelected: boolean) => {
      const priceText = typeof price === 'number' ? `${price}€` : price
      const bgColor = isSelected ? '#000000' : '#ffffff'
      const textColor = isSelected ? '#ffffff' : '#000000'
      
      return L.divIcon({
        html: `
          <div style="
            background-color: ${bgColor};
            color: ${textColor};
            border: 2px solid #000000;
            border-radius: 20px;
            padding: 4px 8px;
            font-size: 12px;
            font-weight: bold;
            text-align: center;
            white-space: nowrap;
            box-shadow: 0 2px 4px rgba(0,0,0,0.2);
            transition: all 0.2s ease;
          ">
            ${priceText}
          </div>
        `,
        className: 'custom-price-marker',
        iconSize: [Math.max(60, priceText.length * 8), 30],
        iconAnchor: [Math.max(30, priceText.length * 4), 15]
      })
    }

    const updateMarkers = () => {
      const bounds = map.getBounds()

      for (const listing of listings) {
        const inside =
          listing.lat > bounds.getSouth() &&
          listing.lat < bounds.getNorth() &&
          listing.lng > bounds.getWest() &&
          listing.lng < bounds.getEast()

        if (inside && !markers[listing.id]) {
          // Créer le marqueur une seule fois
          const isSelected = selectedListing?.id === listing.id
          const marker = L.marker([listing.lat, listing.lng], {
            icon: createCustomIcon(listing.price, isSelected)
          })
          
          // Popup avec contenu détaillé
          const popupContent = `
            <div style="padding: 8px; min-width: 200px;">
              <h3 style="font-weight: 600; font-size: 14px; margin: 0 0 4px 0;">${listing.title}</h3>
              <p style="font-size: 12px; color: #666; margin: 0 0 8px 0;">${listing.location}</p>
              <p style="font-weight: bold; font-size: 14px; margin: 0 0 8px 0; color: #2563eb;">
                ${typeof listing.price === 'number' ? `${listing.price} €` : listing.price}
              </p>
              <button onclick="if (typeof window !== 'undefined' && window.selectListing) window.selectListing('${listing.id}')" 
                      style="width: 100%; background: #2563eb; color: white; border: none; padding: 6px 12px; border-radius: 4px; font-size: 12px; cursor: pointer;">
                View Details
              </button>
            </div>
          `
          
          marker.bindPopup(popupContent)
          
          // Gestion des clics
          marker.on('click', () => {
            onListingSelect(listing)
            if (onListingClick) {
              onListingClick(listing)
            }
          })
          
          marker.addTo(layer)
          markers[listing.id] = marker
          
          // Annuler le timeout de suppression s'il existe
          if (hideTimeouts.current[listing.id]) {
            clearTimeout(hideTimeouts.current[listing.id])
            delete hideTimeouts.current[listing.id]
          }
        } else if (!inside && markers[listing.id]) {
          // Ne pas supprimer immédiatement : délai anti-flicker
          if (!hideTimeouts.current[listing.id]) {
            hideTimeouts.current[listing.id] = setTimeout(() => {
              layer.removeLayer(markers[listing.id])
              delete markers[listing.id]
              delete hideTimeouts.current[listing.id]
            }, 500) // délai anti-flicker
          }
        }
      }
    }

    // Mettre à jour les icônes des marqueurs existants quand la sélection change
    const updateMarkerIcons = () => {
      for (const [id, marker] of Object.entries(markers)) {
        const listing = listings.find(l => l.id === id)
        if (listing) {
          const isSelected = selectedListing?.id === id
          marker.setIcon(createCustomIcon(listing.price, isSelected))
        }
      }
    }

    // Événements de carte
    map.on('moveend zoomend', updateMarkers)
    updateMarkers()

    // Mettre à jour les icônes quand la sélection change
    updateMarkerIcons()

    // Cleanup seulement au démontage du composant, pas à chaque changement
    return () => {
      map.off('moveend zoomend', updateMarkers)
      // Ne pas nettoyer les marqueurs ici pour qu'ils persistent
    }
  }, [map, selectedListing, onListingSelect, onListingClick]) // Retirer listings des dépendances

  // Effet séparé pour gérer les changements de listings sans recréer les marqueurs
  useEffect(() => {
    if (!map || !layerRef.current) return

    const layer = layerRef.current
    const markers = markersRef.current

    const createCustomIcon = (price: string | number, isSelected: boolean) => {
      const priceText = typeof price === 'number' ? `${price}€` : price
      const bgColor = isSelected ? '#000000' : '#ffffff'
      const textColor = isSelected ? '#ffffff' : '#000000'
      
      return L.divIcon({
        html: `
          <div style="
            background-color: ${bgColor};
            color: ${textColor};
            border: 2px solid #000000;
            border-radius: 20px;
            padding: 4px 8px;
            font-size: 12px;
            font-weight: bold;
            text-align: center;
            white-space: nowrap;
            box-shadow: 0 2px 4px rgba(0,0,0,0.2);
            transition: all 0.2s ease;
          ">
            ${priceText}
          </div>
        `,
        className: 'custom-price-marker',
        iconSize: [Math.max(60, priceText.length * 8), 30],
        iconAnchor: [Math.max(30, priceText.length * 4), 15]
      })
    }

    const updateMarkersForListings = () => {
      const bounds = map.getBounds()

      for (const listing of listings) {
        const inside =
          listing.lat > bounds.getSouth() &&
          listing.lat < bounds.getNorth() &&
          listing.lng > bounds.getWest() &&
          listing.lng < bounds.getEast()

        if (inside && !markers[listing.id]) {
          // Créer le marqueur s'il n'existe pas
          const isSelected = selectedListing?.id === listing.id
          const marker = L.marker([listing.lat, listing.lng], {
            icon: createCustomIcon(listing.price, isSelected)
          })
          
          const popupContent = `
            <div style="padding: 8px; min-width: 200px;">
              <h3 style="font-weight: 600; font-size: 14px; margin: 0 0 4px 0;">${listing.title}</h3>
              <p style="font-size: 12px; color: #666; margin: 0 0 8px 0;">${listing.location}</p>
              <p style="font-weight: bold; font-size: 14px; margin: 0 0 8px 0; color: #2563eb;">
                ${typeof listing.price === 'number' ? `${listing.price} €` : listing.price}
              </p>
              <button onclick="if (typeof window !== 'undefined' && window.selectListing) window.selectListing('${listing.id}')" 
                      style="width: 100%; background: #2563eb; color: white; border: none; padding: 6px 12px; border-radius: 4px; font-size: 12px; cursor: pointer;">
                View Details
              </button>
            </div>
          `
          
          marker.bindPopup(popupContent)
          marker.on('click', () => {
            onListingSelect(listing)
            if (onListingClick) {
              onListingClick(listing)
            }
          })
          
          marker.addTo(layer)
          markers[listing.id] = marker
        }
      }
    }

    updateMarkersForListings()
  }, [listings, selectedListing, onListingSelect, onListingClick])

  return null
}

// Composant pour les contrôles de la carte (simplifié)
function MapControls({ 
  listings,
  onRefreshVisibleListings 
}: { 
  listings: Listing[]
  onRefreshVisibleListings?: (visibleListings: Listing[]) => void 
}) {
  const map = useMap()
  const [isRefreshing, setIsRefreshing] = useState(false)

  const handleRefresh = async () => {
    if (!map || !onRefreshVisibleListings) return
    
    setIsRefreshing(true)
    
    try {
      // Obtenir les limites actuelles de la carte
      const bounds = map.getBounds()
      
      // Calculer les listings visibles dans les limites actuelles
      const visibleListings = listings.filter(listing => {
        if (!listing.lat || !listing.lng || isNaN(listing.lat) || isNaN(listing.lng)) {
          return false
        }
        
        return listing.lat > bounds.getSouth() &&
               listing.lat < bounds.getNorth() &&
               listing.lng > bounds.getWest() &&
               listing.lng < bounds.getEast()
      })
      
      console.log(`🔄 Refresh: ${visibleListings.length} annonces visibles sur la carte`)
      
      // Notifier le composant parent avec les listings visibles
      onRefreshVisibleListings(visibleListings)
      
    } catch (error) {
      console.error('Error refreshing visible listings:', error)
    } finally {
      setIsRefreshing(false)
    }
  }

  return (
    <div className="absolute top-4 right-4 z-[1000]">
      {/* Bouton d'actualisation */}
      <button
        onClick={handleRefresh}
        disabled={isRefreshing}
        className="bg-white hover:bg-gray-50 border border-gray-300 rounded-lg p-3 shadow-lg transition-all duration-200 flex items-center gap-2 text-sm font-medium text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
        title="Refresh visible listings"
      >
        <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
        <span className="hidden sm:inline">
          {isRefreshing ? 'Refreshing...' : 'Refresh'}
        </span>
      </button>
    </div>
  )
}

function MapComponent({ 
  listings, 
  selectedListing, 
  clickedListing,
  onListingSelect, 
  onBoundsChange, 
  onRefreshVisibleListings,
  onListingClick
}: MapComponentProps) {
  // Stabiliser la prop listings pour éviter les re-renders inutiles
  const stableListings = useMemo(() => listings, [listings.length, listings.map(l => l.id).join(',')])
  
  // Vérifier que nous sommes côté client et que Leaflet est disponible
  if (typeof window === 'undefined' || !L) {
    return (
      <div className="relative w-full h-full bg-gray-200 flex items-center justify-center">
        <div className="text-gray-600">Loading map...</div>
      </div>
    )
  }

  return (
    <div className="relative w-full h-full">
      <MapContainer
        center={[52.5208, 13.4095]}
        zoom={12}
        zoomSnap={0.8}
        zoomDelta={1}
        wheelPxPerZoomLevel={160}
        wheelDebounceTime={15}
        style={{ 
          height: '100%', 
          width: '100%', 
          zIndex: 0,
          transition: 'all 0.2s ease-in-out'
        }}
        scrollWheelZoom={true}
        touchZoom={true}
        doubleClickZoom={true}
        zoomControl={true}
        maxZoom={18}
        minZoom={8}
        zoomAnimation={true}
        fadeAnimation={true}
        markerZoomAnimation={true}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        
        {/* Zoom automatique sur l'annonce cliquée */}
        <MapZoomToListing clickedListing={clickedListing} />
        
        {/* Contrôles de la carte */}
        <MapControls 
          listings={stableListings}
          onRefreshVisibleListings={onRefreshVisibleListings}
        />
        
        {/* Marqueurs stables gérés par Leaflet (zéro flicker) */}
        <StableMarkersLayer
          listings={stableListings}
          selectedListing={selectedListing}
          onListingSelect={onListingSelect}
          onListingClick={onListingClick}
        />
      </MapContainer>
    </div>
  )
}

// Export avec React.memo pour éviter les re-renders inutiles
export default React.memo(MapComponent)
