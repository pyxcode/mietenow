'use client'

import { useMapEvents } from 'react-leaflet'
import type { LatLngBounds } from 'leaflet'

interface MapEventsProps {
  onBoundsChange: (bounds: LatLngBounds) => void
}

export function MapEvents({ onBoundsChange }: MapEventsProps) {
  useMapEvents({
    moveend: (e) => {
      const map = e.target
      onBoundsChange(map.getBounds())
    },
    zoomend: (e) => {
      const map = e.target
      onBoundsChange(map.getBounds())
    },
  })
  return null
}
