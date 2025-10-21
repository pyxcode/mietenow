'use client'

import dynamic from 'next/dynamic'
import type { LatLngBounds } from 'leaflet'

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

interface Listing {
  id: string
  title: string
  description: string
  price: number
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
}

interface MapComponentProps {
  listings: Listing[]
  selectedListing: Listing | null
  onListingSelect: (listing: Listing) => void
  onBoundsChange: (bounds: LatLngBounds) => void
}

export default function MapComponent({ listings, selectedListing, onListingSelect, onBoundsChange }: MapComponentProps) {
  return (
    <MapContainer
      center={[52.5208, 13.4095]}
      zoom={12}
      zoomSnap={1}
      zoomDelta={1}
      wheelPxPerZoomLevel={100}
      wheelDebounceTime={50}
      style={{ height: '100%', width: '100%', zIndex: 0 }}
      scrollWheelZoom={true}
      touchZoom={true}
      doubleClickZoom={true}
      zoomControl={true}
      maxZoom={18}
      minZoom={8}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      
      {listings.map((listing) => (
        <CircleMarker
          key={listing.id}
          center={[listing.lat, listing.lng]}
          radius={8}
          fillColor={selectedListing?.id === listing.id ? '#00BFA6' : '#004AAD'}
          color={selectedListing?.id === listing.id ? '#00BFA6' : '#004AAD'}
          weight={2}
          opacity={1}
          fillOpacity={0.8}
          eventHandlers={{
            click: () => onListingSelect(listing),
          }}
        >
          <Popup>
            <div className="p-2">
              <h3 className="font-semibold text-sm">{listing.title}</h3>
              <p className="text-xs text-gray-600">{listing.location}</p>
              <p className="text-sm font-bold text-mineral">
                {listing.price}€
              </p>
            </div>
          </Popup>
        </CircleMarker>
      ))}
    </MapContainer>
  )
}
