'use client'

import React, { useState, useEffect } from 'react'
import { useLanguage } from '@/contexts/LanguageContext'
import { X, Save, Bell, MapPin, Euro, Home, Users } from 'lucide-react'

interface MyAlertsModalProps {
  isOpen: boolean
  onClose: () => void
}

const MyAlertsModal: React.FC<MyAlertsModalProps> = ({ isOpen, onClose }) => {
  const { language } = useLanguage()
  const [filters, setFilters] = useState({
    minPrice: 500,
    maxPrice: 1500,
    minSurface: 0,
    rooms: 1,
    bedrooms: 1,
    housingType: 'apartment',
    furnishing: 'any',
    districts: [] as string[]
  })
  const [loading, setLoading] = useState(false)

  const translations = {
    de: {
      title: 'Meine Alerts',
      subtitle: 'Passen Sie Ihre Suchkriterien an, um relevante Benachrichtigungen zu erhalten',
      minPrice: 'Mindestpreis (€)',
      maxPrice: 'Höchstpreis (€)',
      minSurface: 'Mindestfläche (m²)',
      rooms: 'Zimmer',
      bedrooms: 'Schlafzimmer',
      housingType: 'Wohnungstyp',
      furnishing: 'Ausstattung',
      districts: 'Bezirke',
      save: 'Speichern',
      cancel: 'Abbrechen',
      housingTypes: {
        room: 'Zimmer',
        studio: 'Studio',
        apartment: 'Wohnung',
        house: 'Haus'
      },
      furnishingOptions: {
        any: 'Beliebig',
        furnished: 'Möbliert',
        unfurnished: 'Unmöbliert'
      },
      berlinDistricts: [
        'Mitte', 'Friedrichshain-Kreuzberg', 'Pankow', 'Charlottenburg-Wilmersdorf',
        'Spandau', 'Steglitz-Zehlendorf', 'Tempelhof-Schöneberg', 'Neukölln',
        'Treptow-Köpenick', 'Marzahn-Hellersdorf', 'Lichtenberg', 'Reinickendorf'
      ]
    },
    en: {
      title: 'My Alerts',
      subtitle: 'Adjust your search criteria to receive relevant notifications',
      minPrice: 'Min Price (€)',
      maxPrice: 'Max Price (€)',
      minSurface: 'Min Surface (m²)',
      rooms: 'Rooms',
      bedrooms: 'Bedrooms',
      housingType: 'Housing Type',
      furnishing: 'Furnishing',
      districts: 'Districts',
      save: 'Save',
      cancel: 'Cancel',
      housingTypes: {
        room: 'Room',
        studio: 'Studio',
        apartment: 'Apartment',
        house: 'House'
      },
      furnishingOptions: {
        any: 'Any',
        furnished: 'Furnished',
        unfurnished: 'Unfurnished'
      },
      berlinDistricts: [
        'Mitte', 'Friedrichshain-Kreuzberg', 'Pankow', 'Charlottenburg-Wilmersdorf',
        'Spandau', 'Steglitz-Zehlendorf', 'Tempelhof-Schöneberg', 'Neukölln',
        'Treptow-Köpenick', 'Marzahn-Hellersdorf', 'Lichtenberg', 'Reinickendorf'
      ]
    }
  }

  const t = translations[language]

  // Empêcher le scroll du body quand la modale est ouverte
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }
    
    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [isOpen])

  const handleInputChange = (field: string, value: any) => {
    setFilters(prev => ({ ...prev, [field]: value }))
  }

  const handleDistrictToggle = (district: string) => {
    setFilters(prev => ({
      ...prev,
      districts: prev.districts.includes(district)
        ? prev.districts.filter(d => d !== district)
        : [...prev.districts, district]
    }))
  }

  const handleSave = async () => {
    setLoading(true)
    // TODO: Sauvegarder les filtres via API
    console.log('Saving filters:', filters)
    
    // Simuler une sauvegarde
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    setLoading(false)
    onClose()
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Overlay */}
      <div className="fixed inset-0 bg-black bg-opacity-50 transition-opacity" onClick={onClose}></div>
      
      {/* Modal */}
      <div className="flex min-h-full items-center justify-center p-4">
        <div className="relative bg-white rounded-2xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-[#00BFA6] rounded-lg flex items-center justify-center">
                <Bell className="w-5 h-5 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900">{t.title}</h2>
                <p className="text-sm text-gray-500">{t.subtitle}</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors duration-200"
            >
              <X className="w-5 h-5 text-gray-500" />
            </button>
          </div>

          {/* Content */}
          <div className="p-6 space-y-6">
            {/* Price Range */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Euro className="w-4 h-4 inline mr-1" />
                  {t.minPrice}
                </label>
                <input
                  type="number"
                  value={filters.minPrice}
                  onChange={(e) => handleInputChange('minPrice', parseInt(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#00BFA6] focus:border-[#00BFA6]"
                  placeholder="500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Euro className="w-4 h-4 inline mr-1" />
                  {t.maxPrice}
                </label>
                <input
                  type="number"
                  value={filters.maxPrice}
                  onChange={(e) => handleInputChange('maxPrice', parseInt(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#00BFA6] focus:border-[#00BFA6]"
                  placeholder="1500"
                />
              </div>
            </div>

            {/* Surface and Rooms */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Home className="w-4 h-4 inline mr-1" />
                  {t.minSurface}
                </label>
                <input
                  type="number"
                  value={filters.minSurface}
                  onChange={(e) => handleInputChange('minSurface', parseInt(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#00BFA6] focus:border-[#00BFA6]"
                  placeholder="0"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Users className="w-4 h-4 inline mr-1" />
                  {t.rooms}
                </label>
                <select
                  value={filters.rooms}
                  onChange={(e) => handleInputChange('rooms', parseInt(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#00BFA6] focus:border-[#00BFA6]"
                >
                  <option value={1}>1+</option>
                  <option value={2}>2+</option>
                  <option value={3}>3+</option>
                  <option value={4}>4+</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Users className="w-4 h-4 inline mr-1" />
                  {t.bedrooms}
                </label>
                <select
                  value={filters.bedrooms}
                  onChange={(e) => handleInputChange('bedrooms', parseInt(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#00BFA6] focus:border-[#00BFA6]"
                >
                  <option value={1}>1+</option>
                  <option value={2}>2+</option>
                  <option value={3}>3+</option>
                  <option value={4}>4+</option>
                </select>
              </div>
            </div>

            {/* Housing Type and Furnishing */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t.housingType}
                </label>
                <select
                  value={filters.housingType}
                  onChange={(e) => handleInputChange('housingType', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#00BFA6] focus:border-[#00BFA6]"
                >
                  <option value="room">{t.housingTypes.room}</option>
                  <option value="studio">{t.housingTypes.studio}</option>
                  <option value="apartment">{t.housingTypes.apartment}</option>
                  <option value="house">{t.housingTypes.house}</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t.furnishing}
                </label>
                <select
                  value={filters.furnishing}
                  onChange={(e) => handleInputChange('furnishing', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#00BFA6] focus:border-[#00BFA6]"
                >
                  <option value="any">{t.furnishingOptions.any}</option>
                  <option value="furnished">{t.furnishingOptions.furnished}</option>
                  <option value="unfurnished">{t.furnishingOptions.unfurnished}</option>
                </select>
              </div>
            </div>

            {/* Districts */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                <MapPin className="w-4 h-4 inline mr-1" />
                {t.districts}
              </label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                {t.berlinDistricts.map((district) => (
                  <button
                    key={district}
                    onClick={() => handleDistrictToggle(district)}
                    className={`px-3 py-2 text-sm rounded-lg border transition-colors duration-200 ${
                      filters.districts.includes(district)
                        ? 'bg-[#00BFA6] text-white border-[#00BFA6]'
                        : 'bg-white text-gray-700 border-gray-300 hover:border-[#00BFA6]'
                    }`}
                  >
                    {district}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-end space-x-3 p-6 border-t border-gray-200">
            <button
              onClick={onClose}
              className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors duration-200"
            >
              {t.cancel}
            </button>
            <button
              onClick={handleSave}
              disabled={loading}
              className="px-6 py-2 bg-[#00BFA6] hover:bg-[#00A693] text-white rounded-lg transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
            >
              <Save className="w-4 h-4" />
              <span>{loading ? 'Saving...' : t.save}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default MyAlertsModal
