import React from 'react'
import { Listing } from '@/types/listing'

interface MobileListingPopupProps {
  listing: Listing | null
  isOpen: boolean
  onClose: () => void
}

const MobileListingPopup: React.FC<MobileListingPopupProps> = ({ 
  listing, 
  isOpen, 
  onClose 
}) => {
  if (!listing || !isOpen) return null

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
      <div 
        className={`fixed inset-0 bg-black bg-opacity-50 z-50 transition-opacity duration-300 ${
          isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        onClick={onClose}
      />
      
      {/* Popup */}
      <div 
        className={`fixed bottom-0 left-0 right-0 bg-white rounded-t-3xl z-50 transform transition-transform duration-300 ease-out ${
          isOpen ? 'translate-y-0' : 'translate-y-full'
        }`}
        style={{ height: '33vh', minHeight: '300px' }}
      >
        {/* Handle bar */}
        <div className="flex justify-center pt-3 pb-2">
          <div className="w-12 h-1 bg-gray-300 rounded-full" />
        </div>

        {/* Content */}
        <div className="flex flex-col h-full px-4 pb-4">
          {/* Header */}
          <div className="flex justify-between items-start mb-3">
            <h3 className="text-lg font-semibold text-gray-900 line-clamp-2 flex-1 pr-2">
              {listing.title}
            </h3>
            <button
              onClick={onClose}
              className="ml-2 p-1 text-gray-400 hover:text-gray-600"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Price */}
          <div className="text-2xl font-bold text-[#00BFA6] mb-3">
            {listing.price}
          </div>

          {/* Details */}
          <div className="flex flex-wrap gap-2 mb-3">
            {listing.rooms && (
              <span className="px-2 py-1 bg-gray-100 rounded-full text-sm">
                {listing.rooms} Zimmer
              </span>
            )}
            {listing.size && (
              <span className="px-2 py-1 bg-gray-100 rounded-full text-sm">
                {listing.size} m²
              </span>
            )}
            {listing.type && (
              <span className="px-2 py-1 bg-gray-100 rounded-full text-sm">
                {listing.type}
              </span>
            )}
          </div>

          {/* Location */}
          {listing.location && (
            <div className="flex items-center text-sm text-gray-600 mb-3">
              <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              {listing.location}
            </div>
          )}

          {/* Apply Button */}
          <div className="mt-auto">
            <button
              onClick={handleApply}
              className={`w-full py-3 px-4 rounded-lg font-semibold text-white transition-colors ${
                listing.link || listing.url
                  ? 'bg-[#00BFA6] hover:bg-[#00A693]'
                  : 'bg-gray-400 cursor-not-allowed'
              }`}
              disabled={!listing.link && !listing.url}
            >
              {listing.link || listing.url ? 'Jetzt bewerben' : 'Kein Link verfügbar'}
            </button>
          </div>
        </div>
      </div>
    </>
  )
}

export default MobileListingPopup
