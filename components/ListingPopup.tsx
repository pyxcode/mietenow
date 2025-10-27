'use client'

import React from 'react'
import { X, MapPin, Euro, Home, Calendar, ExternalLink } from 'lucide-react'

interface Listing {
  _id: string
  id: string
  title: string
  description?: string
  price: string
  location: string
  district?: string
  surface?: number
  size?: number
  rooms?: number
  type?: string
  images?: string[]
  image?: string
  url?: string
  link?: string
  source?: string
  platform?: string
  lat?: number
  lng?: number
  address?: string
  furnished?: boolean
  features?: string[]
  scrapedAt?: string
  createdAt?: string
  active?: boolean
}

interface ListingPopupProps {
  listing: Listing | null
  isOpen: boolean
  onClose: () => void
}

export default function ListingPopup({ listing, isOpen, onClose }: ListingPopupProps) {
  if (!listing) return null

  const handleApply = () => {
    const link = listing.link || listing.url
    if (link) {
      window.open(link, '_blank')
    } else {
      alert('Aucun lien disponible pour cette annonce')
    }
  }

  return (
    <>
      {/* Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 transition-opacity duration-300"
          onClick={onClose}
        />
      )}
      
      {/* Popup */}
      <div className={`
        fixed bottom-0 left-0 right-0 z-50 transform transition-transform duration-300 ease-out
        ${isOpen ? 'translate-y-0' : 'translate-y-full'}
        bg-white rounded-t-3xl shadow-2xl max-h-[33vh] overflow-hidden
      `}>
        {/* Handle bar */}
        <div className="flex justify-center pt-3 pb-2">
          <div className="w-12 h-1 bg-gray-300 rounded-full"></div>
        </div>
        
        {/* Content */}
        <div className="px-6 pb-6 overflow-y-auto max-h-[calc(33vh-60px)]">
          {/* Header */}
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1 pr-4">
              <h3 className="text-lg font-semibold text-gray-900 line-clamp-2 mb-2">
                {listing.title}
              </h3>
              <div className="flex items-center text-sm text-gray-600 mb-2">
                <MapPin className="w-4 h-4 mr-1" />
                <span>{listing.location}</span>
                {listing.district && (
                  <span className="ml-2 px-2 py-1 bg-gray-100 rounded-full text-xs">
                    {listing.district}
                  </span>
                )}
              </div>
            </div>
            <button
              onClick={onClose}
              className="flex-shrink-0 p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <X className="w-5 h-5 text-gray-500" />
            </button>
          </div>

          {/* Price and details */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center text-2xl font-bold text-[#00BFA6]">
              <Euro className="w-6 h-6 mr-1" />
              {listing.price}
            </div>
            <div className="flex items-center gap-4 text-sm text-gray-600">
              {listing.rooms && (
                <div className="flex items-center">
                  <Home className="w-4 h-4 mr-1" />
                  <span>{listing.rooms} Zimmer</span>
                </div>
              )}
              {listing.surface && (
                <div className="flex items-center">
                  <span>{listing.surface} m²</span>
                </div>
              )}
            </div>
          </div>

          {/* Description */}
          {listing.description && (
            <div className="mb-4">
              <p className="text-sm text-gray-700 line-clamp-2">
                {listing.description}
              </p>
            </div>
          )}

          {/* Features */}
          {listing.features && listing.features.length > 0 && (
            <div className="mb-4">
              <div className="flex flex-wrap gap-2">
                {listing.features.slice(0, 3).map((feature, index) => (
                  <span
                    key={index}
                    className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full"
                  >
                    {feature}
                  </span>
                ))}
                {listing.features.length > 3 && (
                  <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
                    +{listing.features.length - 3} autres
                  </span>
                )}
              </div>
            </div>
          )}

          {/* Action buttons */}
          <div className="flex gap-3">
            <button
              onClick={handleApply}
              className="flex-1 bg-[#00BFA6] text-white py-3 px-4 rounded-xl font-medium hover:bg-[#00A693] transition-colors flex items-center justify-center"
            >
              <ExternalLink className="w-4 h-4 mr-2" />
              Voir l'annonce
            </button>
            <button
              onClick={onClose}
              className="px-6 py-3 border border-gray-300 text-gray-700 rounded-xl font-medium hover:bg-gray-50 transition-colors"
            >
              Fermer
            </button>
          </div>

          {/* Source info */}
          <div className="mt-3 text-xs text-gray-500 text-center">
            Source: {listing.source || listing.platform}
            {listing.scrapedAt && (
              <span className="ml-2">
                • {new Date(listing.scrapedAt).toLocaleDateString('fr-FR')}
              </span>
            )}
          </div>
        </div>
      </div>
    </>
  )
}
