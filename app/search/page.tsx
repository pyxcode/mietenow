'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import { Search, MapPin, Euro, Home, Filter, Loader2 } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import { useLanguage } from '@/contexts/LanguageContext'
import UserDropdown from '@/components/UserDropdown'
import Link from 'next/link'
import Image from 'next/image'
import 'leaflet/dist/leaflet.css'
import {
  MapContainer,
  TileLayer,
  CircleMarker,
  Popup,
  useMapEvents,
} from 'react-leaflet'
import type { LatLngBounds } from 'leaflet'
import { useTranslation } from '@/hooks/useTranslation'

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

export default function SearchPage() {
  const { language } = useTranslation()
  const { user, loading: authLoading } = useAuth()
  const { language: currentLanguage, changeLanguage } = useLanguage()
  const [showMoreFilters, setShowMoreFilters] = useState(false)
  const [isLanguageOpen, setIsLanguageOpen] = useState(false)
  const [searchCriteria, setSearchCriteria] = useState({
    city: 'Berlin',
    minPrice: '',
    maxPrice: '',
    minRooms: '',
    minSize: '',
    type: 'Any' as 'Any' | 'Room' | 'Studio' | 'Apartment' | 'House',
    furnishing: 'Any' as 'Any' | 'Furnished' | 'Unfurnished',
    minBedrooms: '',
  })

  const [allListings] = useState<Listing[]>(() => {
    // Simple fake dataset around Berlin center
    const base: Omit<Listing, 'id'> = {
      title: 'Bright studio near city center',
      description: 'Modern place close to U-Bahn with great light.',
      price: 980,
      currency: '€',
      location: 'Berlin',
      city: 'Berlin',
      rooms: 1,
      size: 28,
      images: [],
      url: '#',
      source: 'demo',
      features: ['Balcony', 'Near transport'],
      lat: 52.5208,
      lng: 13.4095,
      type: 'Studio',
      furnished: true,
    }
    const variants: Listing[] = [
      { id: '1', ...base },
      { id: '2', ...base, title: 'Room in shared flat', type: 'Room', price: 650, rooms: 1, size: 15, lat: 52.515, lng: 13.45, furnished: true },
      { id: '3', ...base, title: '2-room Apartment Prenzlauer Berg', type: 'Apartment', price: 1450, rooms: 2, size: 48, lat: 52.542, lng: 13.424, furnished: false },
      { id: '4', ...base, title: 'Family House outside Ring', type: 'House', price: 2200, rooms: 4, size: 110, lat: 52.49, lng: 13.37, furnished: false },
      { id: '5', ...base, title: 'Cozy studio Kreuzberg', type: 'Studio', price: 1050, rooms: 1, size: 30, lat: 52.496, lng: 13.422, furnished: true },
      { id: '6', ...base, title: '3-room Apartment Friedrichshain', type: 'Apartment', price: 1750, rooms: 3, size: 72, lat: 52.513, lng: 13.455, furnished: true },
      { id: '7', ...base, title: 'Large room Wedding', type: 'Room', price: 700, rooms: 1, size: 18, lat: 52.547, lng: 13.35, furnished: false },
    ]
    return variants
  })

  const [bounds, setBounds] = useState<LatLngBounds | null>(null)
  const [activeId, setActiveId] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const filtered = useMemo(() => {
    const minPrice = Number(searchCriteria.minPrice || 0)
    const maxPrice = Number(searchCriteria.maxPrice || Number.MAX_SAFE_INTEGER)
    const minRooms = Number(searchCriteria.minRooms || 0)
    const minSize = Number(searchCriteria.minSize || 0)
    const minBedrooms = Number(searchCriteria.minBedrooms || 0)
    return allListings.filter((l) => {
      if (searchCriteria.type !== 'Any' && l.type !== searchCriteria.type) return false
      if (searchCriteria.furnishing !== 'Any') {
        const wantFurnished = searchCriteria.furnishing === 'Furnished'
        if (l.furnished !== wantFurnished) return false
      }
      if (!(l.price >= minPrice && l.price <= maxPrice)) return false
      if (l.rooms < minRooms) return false
      if (l.size < minSize) return false
      // Bedrooms proxy: assume bedrooms = Math.max(1, rooms - 1)
      const bedrooms = Math.max(1, l.rooms - 1)
      if (bedrooms < minBedrooms) return false
      if (bounds) {
        const within = bounds.contains({ lat: l.lat, lng: l.lng })
        if (!within) return false
      }
      return true
    })
  }, [allListings, searchCriteria, bounds])

  const listingCountLabel = useMemo(() => {
    const n = filtered.length
    const plus = n >= 1000 ? '+' : ''
    const count = n.toLocaleString()
    return `${count}${plus} ${language === 'de' ? 'Anzeigen' : 'listings'}`
  }, [filtered.length, language])

  const handleSearch = async () => {
    // Placeholder to mimic async search
    setLoading(true)
    setError('')
    setTimeout(() => {
      setLoading(false)
    }, 300)
  }

  function MapEvents() {
    useMapEvents({
      moveend: (e) => {
        setBounds(e.target.getBounds())
      },
      zoomend: (e) => {
        setBounds(e.target.getBounds())
      },
    })
    return null
  }

  return (
    <div className="min-h-screen bg-cream">
      {/* Custom Header - Full Width */}
      <header className="bg-white shadow-sm border-b border-gray-100 sticky top-0 z-[2000]">
        <div className="w-full px-4 md:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            {/* Logo - Left */}
            <Link href="/" className="flex items-center">
              <Image
                src="/Logos/L1.png"
                alt="MieteNow"
                width={120}
                height={55}
                className="h-52 w-auto"
              />
            </Link>

            {/* Right Side - Language & Profile */}
            <div className="flex items-center space-x-4">
              {/* Language Selector */}
              <div className="relative">
                <button
                  onClick={() => setIsLanguageOpen(!isLanguageOpen)}
                  className="flex items-center space-x-2 text-gray-600 hover:text-mineral transition-colors bg-gray-50 hover:bg-gray-100 px-3 py-2 rounded-lg"
                >
                  <span className="text-lg">{currentLanguage === 'de' ? '🇩🇪' : '🇬🇧'}</span>
                  <span className="text-sm font-medium">{currentLanguage.toUpperCase()}</span>
                </button>
                
                {isLanguageOpen && (
                  <div className="absolute right-0 mt-2 w-32 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50">
                    <button
                      onClick={() => {
                        changeLanguage('de')
                        setIsLanguageOpen(false)
                      }}
                      className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-50 transition-colors ${
                        currentLanguage === 'de' ? 'text-mineral font-medium' : 'text-gray-600'
                      }`}
                    >
                      🇩🇪 Deutsch
                    </button>
                    <button
                      onClick={() => {
                        changeLanguage('en')
                        setIsLanguageOpen(false)
                      }}
                      className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-50 transition-colors ${
                        currentLanguage === 'en' ? 'text-mineral font-medium' : 'text-gray-600'
                      }`}
                    >
                      🇬🇧 English
                    </button>
                  </div>
                )}
              </div>

              {/* User Profile */}
              {authLoading ? (
                <div className="w-10 h-10 bg-gray-200 rounded-full animate-pulse"></div>
              ) : user ? (
                <UserDropdown />
              ) : (
                <Link 
                  href="/login" 
                  className="bg-[#00BFA6] hover:bg-[#00A693] text-white px-4 py-2 rounded-lg font-medium transition-colors duration-200"
                >
                  {language === 'de' ? 'Anmelden' : 'Sign In'}
                </Link>
              )}
            </div>
          </div>
        </div>
      </header>
      
      <main className="px-4 md:px-6 lg:px-8 max-w-none pt-4 h-[calc(100vh-80px)] overflow-hidden">
        {/* Airbnb-like compact bar: City | Max price | Search + More filters */}
        <div className="flex items-center mb-2 sticky top-0 z-10">
          <div className="flex items-center gap-3 bg-white border border-gray-200 rounded-full px-3 py-2 shadow-sm">
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-gray-500" />
              <input type="text" value={searchCriteria.city} onChange={(e)=>setSearchCriteria({...searchCriteria, city: e.target.value})} placeholder={language==='de'?'Berlin':'Berlin'} className="w-40 md:w-56 bg-transparent outline-none text-sm"/>
            </div>
            <div className="h-5 w-px bg-gray-200"/>
            <div className="flex items-center gap-2">
              <Euro className="w-4 h-4 text-gray-500" />
              <input type="number" value={searchCriteria.maxPrice} onChange={(e)=>setSearchCriteria({...searchCriteria, maxPrice: e.target.value})} placeholder={language==='de'?'Max. Preis':'Max price'} className="w-28 bg-transparent outline-none text-sm"/>
            </div>
            <button onClick={handleSearch} disabled={loading} className="ml-2 w-8 h-8 rounded-full bg-mineral text-white flex items-center justify-center">
              <Search className="w-4 h-4" />
            </button>
          </div>
          <div className="hidden md:block text-sm text-gray-600 ml-3">{listingCountLabel}</div>
          <button onClick={()=>setShowMoreFilters(!showMoreFilters)} className="ml-auto flex items-center gap-2 bg-white border border-gray-200 rounded-full px-3 py-2 text-sm">
            <Filter className="w-4 h-4" />
            {language==='de'?'Weitere Filter':'More filters'}
          </button>
        </div>

        {showMoreFilters && (
          <div className="absolute right-6 mt-1 bg-white border border-gray-200 rounded-xl shadow-lg p-4 w-[320px] z-20">
            <div className="grid grid-cols-2 gap-3 mb-3">
              <div>
                <label className="block text-xs text-gray-600 mb-1">{language==='de'?'Zimmer (min)':'Rooms (min)'}</label>
                <input type="number" value={searchCriteria.minRooms} onChange={(e)=>setSearchCriteria({...searchCriteria, minRooms: e.target.value})} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"/>
              </div>
              <div>
                <label className="block text-xs text-gray-600 mb-1">{language==='de'?'Min. Fläche (m²)':'Min surface (m²)'}</label>
                <input type="number" value={searchCriteria.minSize} onChange={(e)=>setSearchCriteria({...searchCriteria, minSize: e.target.value})} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"/>
              </div>
              <div>
                <label className="block text-xs text-gray-600 mb-1">{language==='de'?'Wohnungstyp':'Housing type'}</label>
                <select value={searchCriteria.type} onChange={(e)=>setSearchCriteria({...searchCriteria, type: e.target.value as any})} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm">
                  <option>{language==='de'?'Egal':'Any'}</option>
                  <option>{language==='de'?'Zimmer':'Room'}</option>
                  <option>Studio</option>
                  <option>{language==='de'?'Wohnung':'Apartment'}</option>
                  <option>{language==='de'?'Haus':'House'}</option>
                </select>
              </div>
              <div>
                <label className="block text-xs text-gray-600 mb-1">{language==='de'?'Möblierung':'Furnishing'}</label>
                <select value={searchCriteria.furnishing} onChange={(e)=>setSearchCriteria({...searchCriteria, furnishing: e.target.value as any})} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm">
                  <option>{language==='de'?'Egal':'Any'}</option>
                  <option>{language==='de'?'Möbliert':'Furnished'}</option>
                  <option>{language==='de'?'Unmöbliert':'Unfurnished'}</option>
                </select>
              </div>
              <div className="col-span-2">
                <label className="block text-xs text-gray-600 mb-1">{language==='de'?'Schlafzimmer (min)':'Bedrooms (min)'}</label>
                <select value={searchCriteria.minBedrooms} onChange={(e)=>setSearchCriteria({...searchCriteria, minBedrooms: e.target.value})} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm">
                  <option value="">{language==='de'?'Kein Minimum':'No minimum'}</option>
                  <option value="1">1+</option>
                  <option value="2">2+</option>
                  <option value="3">3+</option>
                  <option value="4">4+</option>
                </select>
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <button onClick={()=>setShowMoreFilters(false)} className="px-3 py-2 text-sm rounded-lg border">{language==='de'?'Schließen':'Close'}</button>
              <button onClick={()=>{setShowMoreFilters(false);handleSearch()}} className="btn-primary px-4 py-2 text-sm">{language==='de'?'Anwenden':'Apply'}</button>
            </div>
          </div>
        )}

        {/* Split layout: 2/3 listings, 1/3 map */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 h-[calc(100%-56px)] w-full">
          {/* Left: scrollable listings (2/3) */}
          <div className="flex flex-col h-full pr-2 overflow-hidden lg:col-span-2">
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-2 mb-2">
                <p className="text-red-600 text-sm">{error}</p>
              </div>
            )}
            <div className="flex-1 overflow-auto">
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                {filtered.map((listing) => (
                  <div key={listing.id} onMouseEnter={()=>setActiveId(listing.id)} onMouseLeave={()=>setActiveId(prev=>prev===listing.id?null:prev)} onClick={()=>setActiveId(listing.id)} className={`card hover:shadow-xl transition-all duration-300 cursor-pointer ${activeId===listing.id?'ring-2 ring-mineral':''}`}>
                    <div className="h-48 bg-gray-200 rounded-lg mb-4 flex items-center justify-center">
                      <Home className="w-12 h-12 text-gray-400" />
                    </div>
                    <div className="space-y-3">
                      <div className="flex justify-between items-start">
                        <h3 className="text-lg font-semibold text-gray-900 line-clamp-2">{listing.title}</h3>
                        <span className="text-2xl font-bold text-mineral">{listing.price}€</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-700">
                        <span className="px-2 py-1 bg-gray-100 rounded-full">{listing.type}</span>
                        <span className="px-2 py-1 bg-gray-100 rounded-full">{listing.rooms} {language==='de'?'Zimmer':'rooms'}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right: full-height map (1/3) */}
          <div className="rounded-2xl overflow-hidden h-full lg:col-span-1">
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
              <TileLayer attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors' url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
              <MapEvents />
              {filtered.map((l) => (
                <CircleMarker key={l.id} center={[l.lat, l.lng]} radius={activeId===l.id?10:6} pathOptions={{ color: activeId===l.id?'#00BFA6':'#002E73', weight: 2, fillOpacity: 0.7 }}>
                  <Popup>
                    <div className="text-sm">
                      <div className="font-semibold mb-1">{l.title}</div>
                      <div className="text-gray-600 mb-1">{l.price}€ • {l.size} m² • {l.type}</div>
                    </div>
                  </Popup>
                </CircleMarker>
              ))}
            </MapContainer>
          </div>
        </div>
      </main>

      {/* Footer intentionally removed on this page to reduce visual load */}
    </div>
  )
}
