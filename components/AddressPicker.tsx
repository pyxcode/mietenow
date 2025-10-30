'use client'

import { useState, useEffect, useRef } from 'react'
import { MapPin, Search, X } from 'lucide-react'

interface AddressPickerProps {
  onAddressSelect: (address: {
    address: string
    coordinates: { lat: number; lng: number }
  }) => void
  initialAddress?: string
  initialCoordinates?: { lat: number; lng: number }
  placeholder?: string
}

interface SearchResult {
  display_name: string
  lat: string
  lon: string
  place_id: number
}

export default function AddressPicker({ 
  onAddressSelect, 
  initialAddress = '',
  initialCoordinates,
  placeholder = "Search for an address..."
}: AddressPickerProps) {
  const [searchQuery, setSearchQuery] = useState(initialAddress)
  const [searchResults, setSearchResults] = useState<SearchResult[]>([])
  const [isSearching, setIsSearching] = useState(false)
  const [showResults, setShowResults] = useState(false)
  const [selectedAddress, setSelectedAddress] = useState(initialAddress)
  const [selectedCoordinates, setSelectedCoordinates] = useState(initialCoordinates)
  const searchTimeoutRef = useRef<NodeJS.Timeout>()

  // Search for addresses using OpenStreetMap Nominatim API
  const searchAddresses = async (query: string) => {
    if (!query.trim() || query.length < 3) {
      setSearchResults([])
      return
    }

    setIsSearching(true)
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=5&addressdetails=1&countrycodes=de`
      )
      const results = await response.json()
      setSearchResults(results)
    } catch (error) {
      console.error('Error searching addresses:', error)
      setSearchResults([])
    } finally {
      setIsSearching(false)
    }
  }

  // Handle search input with debouncing
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value
    setSearchQuery(query)
    setShowResults(true)

    // Clear previous timeout
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current)
    }

    // Set new timeout for search
    searchTimeoutRef.current = setTimeout(() => {
      searchAddresses(query)
    }, 500)
  }

  // Handle address selection
  const handleAddressSelect = (result: SearchResult) => {
    const address = result.display_name
    const coordinates = {
      lat: parseFloat(result.lat),
      lng: parseFloat(result.lon)
    }

    setSelectedAddress(address)
    setSelectedCoordinates(coordinates)
    setSearchQuery(address)
    setShowResults(false)
    setSearchResults([])

    // Notify parent component
    onAddressSelect({ address, coordinates })
  }

  // Clear selection
  const handleClear = () => {
    setSearchQuery('')
    setSelectedAddress('')
    setSelectedCoordinates(undefined)
    setSearchResults([])
    setShowResults(false)
    onAddressSelect({ address: '', coordinates: { lat: 0, lng: 0 } })
  }

  // Handle click outside to close results
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement
      if (!target.closest('.address-picker')) {
        setShowResults(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current)
      }
    }
  }, [])

  return (
    <div className="address-picker relative w-full">
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Search className="h-5 w-5 text-gray-400" />
        </div>
        <input
          type="text"
          value={searchQuery}
          onChange={handleSearchChange}
          onFocus={() => setShowResults(true)}
          placeholder={placeholder}
          className="w-full pl-10 pr-10 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
        />
        {searchQuery && (
          <button
            onClick={handleClear}
            className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
          >
            <X className="h-5 w-5" />
          </button>
        )}
      </div>

      {/* Search Results Dropdown */}
      {showResults && (searchResults.length > 0 || isSearching) && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
          {isSearching ? (
            <div className="px-4 py-3 text-center text-gray-500">
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-500 mx-auto mb-2"></div>
              Searching...
            </div>
          ) : searchResults.length > 0 ? (
            <div className="py-1">
              {searchResults.map((result) => (
                <button
                  key={result.place_id}
                  onClick={() => handleAddressSelect(result)}
                  className="w-full px-4 py-3 text-left hover:bg-gray-50 focus:bg-gray-50 focus:outline-none border-b border-gray-100 last:border-b-0"
                >
                  <div className="flex items-start">
                    <MapPin className="h-4 w-4 text-gray-400 mt-0.5 mr-2 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <div className="text-sm text-gray-900 truncate">
                        {result.display_name}
                      </div>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          ) : searchQuery.length >= 3 && (
            <div className="px-4 py-3 text-center text-gray-500">
              No addresses found
            </div>
          )}
        </div>
      )}

      {/* Selected Address Display */}
      {selectedAddress && (
        <div className="mt-2 p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="flex items-start">
            <MapPin className="h-4 w-4 text-blue-500 mt-0.5 mr-2 flex-shrink-0" />
            <div className="flex-1">
              <div className="text-sm font-medium text-blue-900">
                Selected Address:
              </div>
              <div className="text-sm text-blue-700 mt-1">
                {selectedAddress}
              </div>
              {selectedCoordinates && (
                <div className="text-xs text-blue-600 mt-1">
                  Coordinates: {selectedCoordinates.lat.toFixed(6)}, {selectedCoordinates.lng.toFixed(6)}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
