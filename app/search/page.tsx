'use client'

export const dynamic = 'force-dynamic'

import { useEffect, useMemo, useRef, useState, useCallback } from 'react'
import { Search, MapPin, Euro, Home, Filter, Loader2, Bell, Info, Map } from 'lucide-react'
import { useSession } from 'next-auth/react'
import { useLanguage } from '@/contexts/LanguageContext'
import UserDropdown from '@/components/UserDropdown'
import Link from 'next/link'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import 'leaflet/dist/leaflet.css'
import dynamicImport from 'next/dynamic'

const MapComponent = dynamicImport(() => import('@/components/MapComponent'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full bg-gray-200 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
        <p className="text-gray-600">Loading map...</p>
      </div>
    </div>
  )
})
import ListingDetailView from '@/components/ListingDetailView'
import ListingPopup from '@/components/ListingPopup'
import type { LatLngBounds } from 'leaflet'
import { useTranslation } from '@/hooks/useTranslation'
import { usePlanCheck } from '@/hooks/usePlanCheck'
import PlanModal from '@/components/PlanModal'

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
  scrapedAt?: string
  createdAt?: string
  address?: string
  platform?: string
  link?: string
}

export default function SearchPage() {
  const { language } = useTranslation()
  const { data: session, status } = useSession()
  const { language: currentLanguage, changeLanguage } = useLanguage()
  const { isPlanValid, isLoading: planLoading } = usePlanCheck()
  const router = useRouter()

  const user = session?.user
  const authLoading = status === 'loading'

  // Tous les hooks doivent être déclarés avant les returns conditionnels
  const [showMoreFilters, setShowMoreFilters] = useState(false)
  const [isLanguageOpen, setIsLanguageOpen] = useState(false)
  const [searchCriteria, setSearchCriteria] = useState({
    city: 'Berlin',
    minPrice: '',
    maxPrice: '',
    minSize: '',
    type: 'Any' as 'Any' | 'Room' | 'Studio' | 'Apartment' | 'House',
    furnishing: 'Any' as 'Any' | 'Furnished' | 'Unfurnished',
    minBedrooms: '',
    address: '',
    radius: 5, // Rayon en km
  })

  const [allListings, setAllListings] = useState<Listing[]>([])
  const [visibleListings, setVisibleListings] = useState<Listing[]>([])
  const [isFilteredByMap, setIsFilteredByMap] = useState(false)
  const [isAlertActive, setIsAlertActive] = useState(false)
  const [showPlanModal, setShowPlanModal] = useState(false)
  const [alertButtonText, setAlertButtonText] = useState('')
  const [selectedListing, setSelectedListing] = useState<Listing | null>(null)
  const [showListingDetail, setShowListingDetail] = useState(false)
  const [clickedListing, setClickedListing] = useState<Listing | null>(null)
  const [cameFromMap, setCameFromMap] = useState(false)
  const [cameFromMobileMap, setCameFromMobileMap] = useState(false)
  const [showPopup, setShowPopup] = useState(false)
  const [popupListing, setPopupListing] = useState<Listing | null>(null)

  const [bounds, setBounds] = useState<LatLngBounds | null>(null)
  const [activeId, setActiveId] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  // États pour l'autocomplétion d'adresse
  const [addressSuggestions, setAddressSuggestions] = useState<any[]>([])
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [addressCoordinates, setAddressCoordinates] = useState<{lat: number, lng: number} | null>(null)

  // Fonction pour rechercher des adresses avec OpenStreetMap Nominatim
  const searchAddresses = async (query: string) => {
    if (query.length < 3) {
      setAddressSuggestions([])
      setShowSuggestions(false)
      return
    }

    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query + ', Berlin, Germany')}&limit=5&addressdetails=1`
      )
      const data = await response.json()
      setAddressSuggestions(data)
      setShowSuggestions(true)
    } catch (error) {
      console.error('Error searching addresses:', error)
      setAddressSuggestions([])
    }
  }

  // Fonction pour sélectionner une adresse
  const selectAddress = (suggestion: any) => {
    setSearchCriteria(prev => ({
      ...prev,
      address: suggestion.display_name
    }))
    setAddressCoordinates({
      lat: parseFloat(suggestion.lat),
      lng: parseFloat(suggestion.lon)
    })
    setShowSuggestions(false)
  }

  // Fonction pour calculer la distance entre deux points GPS (formule de Haversine)
  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
    const R = 6371 // Rayon de la Terre en km
    const dLat = (lat2 - lat1) * Math.PI / 180
    const dLon = (lon2 - lon1) * Math.PI / 180
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
      Math.sin(dLon/2) * Math.sin(dLon/2)
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a))
    return R * c
  }

  // Protection d'authentification
  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login')
    }
  }, [user, authLoading, router])

  // Vérifier le plan utilisateur
  useEffect(() => {
    if (!authLoading && !planLoading && user && !isPlanValid) {
      // L'utilisateur est connecté mais n'a pas de plan valide
      // On affiche la modale de plan après un court délai
      const timer = setTimeout(() => {
        setShowPlanModal(true)
      }, 1000)
      
      return () => clearTimeout(timer)
    }
  }, [user, authLoading, planLoading, isPlanValid])

  // Fonction pour gérer le clic sur une annonce
  const handleListingClick = useCallback((listing: Listing, fromMap: boolean = false, fromMobileMap: boolean = false) => {
    console.log('🎯 handleListingClick called with:', {
      title: listing.title,
      id: listing.id,
      fromMap,
      fromMobileMap
    })
    
    console.log('📊 Current state before update:', {
      showListingDetail,
      selectedListing: selectedListing?.title || 'null'
    })
    
    // Toujours ouvrir la page de détail, que ce soit depuis la carte ou la liste
    setSelectedListing(listing)
    setClickedListing(listing) // Pour déclencher le zoom
    setShowListingDetail(true)
    setCameFromMap(fromMap)
    setCameFromMobileMap(fromMobileMap)
    
    console.log('✅ State update calls made')
    
    // Vérifier l'état après un court délai
    setTimeout(() => {
      console.log('📊 State after update (delayed check):', {
        showListingDetail,
        selectedListing: selectedListing?.title || 'null'
      })
    }, 100)
  }, [])

  // Fonction pour fermer la popup
  const handleClosePopup = useCallback(() => {
    setShowPopup(false)
    setPopupListing(null)
  }, [])


  // Debug pour voir l'état de showListingDetail
  useEffect(() => {
    console.log('🔍 showListingDetail state changed:', showListingDetail)
    if (showListingDetail && selectedListing) {
      console.log('📋 Selected listing:', selectedListing.title)
    }
    
    // Debug supplémentaire pour voir pourquoi l'état ne change pas
    if (!showListingDetail && selectedListing) {
      console.log('⚠️ WARNING: selectedListing exists but showListingDetail is false!')
    }
  }, [showListingDetail, selectedListing])
  useEffect(() => {
    const fetchListingsAndPreferences = async () => {
      try {
        setLoading(true)
        
        // Récupérer les préférences utilisateur en parallèle
        const [listingsResponse, preferencesResponse] = await Promise.all([
          fetch('/api/search?city=Berlin&limit=50'),
          user ? fetch('/api/user/preferences') : Promise.resolve(null)
        ])
        
        const listingsData = await listingsResponse.json()
        
        if (listingsData.success) {
          // Transformer les données de l'API vers le format attendu par le composant
          const transformedListings: Listing[] = listingsData.data.listings.map((listing: any) => ({
            id: listing._id || listing.id,
            title: listing.title || 'Furnished Room',
            description: listing.description || listing.title || 'Beautiful accommodation in Berlin',
            price: listing.price || 'N/A',
            currency: '€',
            location: listing.address || 'Berlin, Germany',
            city: 'Berlin',
            district: listing.district || '',
            rooms: listing.rooms || 1,
            size: listing.size || null,
            images: listing.images || (listing.image ? [listing.image] : []),
            url: listing.link || '#',
            source: listing.platform || 'unknown',
            features: listing.features || [],
            lat: listing.lat || 52.5208, // Fallback vers le centre de Berlin
            lng: listing.lng || 13.4095,
            type: listing.type === 'WG' ? 'Room' : 
                  listing.type === 'studio' ? 'Studio' :
                  listing.type === 'apartment' ? 'Apartment' :
                  listing.type === 'house' ? 'House' : 'Room',
            furnished: listing.furnished || false,
            scrapedAt: listing.scrapedAt || listing.createdAt || new Date().toISOString(),
            createdAt: listing.createdAt || new Date().toISOString(),
            address: listing.address || 'Berlin, Germany',
            platform: listing.platform || 'unknown',
            link: listing.link || '#'
          }))
          
          setAllListings(transformedListings)
        } else {
          setError('Failed to load listings')
        }
        
        // Appliquer les préférences utilisateur si disponibles
        if (preferencesResponse && preferencesResponse.ok) {
          const preferencesData = await preferencesResponse.json()
          if (preferencesData.success && preferencesData.data.search_preferences) {
            const prefs = preferencesData.data.search_preferences
            setSearchCriteria({
              city: prefs.city || 'Berlin',
              minPrice: prefs.min_price?.toString() || '',
              maxPrice: prefs.max_price?.toString() || '',
              minSize: prefs.min_surface?.toString() || '',
              type: prefs.type || 'Any',
              furnishing: prefs.furnishing || 'Any',
              minBedrooms: prefs.min_bedrooms?.toString() || '',
              address: prefs.address || '',
              radius: prefs.radius || 5,
            })
            
            // Activer l'alerte par défaut si l'utilisateur a des préférences
            if (prefs.address || prefs.min_price || prefs.max_price || prefs.type !== 'Any' || prefs.furnishing !== 'Any') {
              setIsAlertActive(true)
              setAlertButtonText(language === 'de' ? 'Alerte aktualisieren' : 'Update alert')
              
              // Créer automatiquement l'alerte avec les préférences
              createAlertFromPreferences(prefs)
            }
          }
        }
        
      } catch (err) {
        console.error('Error fetching listings:', err)
        setError('Failed to load listings')
      } finally {
        setLoading(false)
      }
    }

    if (user) {
      fetchListingsAndPreferences()
    }
  }, [user])

  // Fonction pour gérer l'actualisation des annonces visibles
  const handleRefreshVisibleListings = useCallback((visibleListings: Listing[]) => {
    // DÈS QUE LA CARTE BOUGE : remettre toutes les annonces puis re-filtrer
    console.log(`🗺️ Carte bougée: ${visibleListings.length} annonces visibles sur ${allListings.length} total`)
    
    // 1. Remettre TOUTES les annonces d'abord
    setVisibleListings(allListings)
    setIsFilteredByMap(false)
    
    // 2. Puis filtrer par la zone visible
    setTimeout(() => {
      setVisibleListings(visibleListings)
      setIsFilteredByMap(true)
    }, 100) // Petit délai pour que l'utilisateur voie toutes les annonces
  }, [allListings])

  const resetMapFilter = () => {
    // Réinitialiser le filtre de carte - remettre toutes les annonces
    setIsFilteredByMap(false)
    setVisibleListings([])
    console.log('🔄 Map filter reset - showing all listings')
  }
  
  // Fonction pour gérer le mouvement de carte
  const handleMapMove = useCallback((visibleListings: Listing[]) => {
    // À chaque mouvement de carte, on remet toutes les annonces puis on filtre
    console.log(`🗺️ Map moved: ${visibleListings.length} annonces visibles sur ${allListings.length} total`)
    setVisibleListings(visibleListings)
    setIsFilteredByMap(true)
  }, [allListings])

  // Fonction pour créer automatiquement une alerte à partir des préférences
  const createAlertFromPreferences = async (prefs: any) => {
    if (!user) return

    try {
      const alertData = {
        title: `Alert for ${prefs.city || 'Berlin'} - ${prefs.type || 'Any'}`,
        criteria: {
          city: prefs.city || 'Berlin',
          type: prefs.type || 'Any',
          max_price: prefs.max_price || 10000,
          min_price: prefs.min_price || 0,
          min_surface: prefs.min_surface || 0,
          min_bedrooms: prefs.min_bedrooms || 0,
          furnishing: prefs.furnishing || 'Any',
          address: prefs.address || '',
          radius: prefs.radius || 5
        },
        frequency: 'daily',
        email: user.email
      }

      const response = await fetch('/api/alerts/simple', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(alertData)
      })

      if (response.ok) {
        console.log('Alert created automatically from preferences')
      } else {
        console.error('Failed to create alert from preferences')
      }
    } catch (error) {
      console.error('Error creating alert from preferences:', error)
    }
  }

  // Fonction pour gérer l'alerte email
  const handleEmailAlert = async () => {
    if (!user) {
      // Rediriger vers la page de connexion si pas connecté
      router.push('/login')
      return
    }

    try {
      // Réinitialiser le texte du bouton
      setAlertButtonText('')
      
      // Toujours mettre à jour l'alerte avec les critères actuels
      const alertData = {
        title: `Alert for ${searchCriteria.city} - ${searchCriteria.type}`,
        criteria: {
          city: searchCriteria.city,
          type: searchCriteria.type,
          max_price: searchCriteria.maxPrice ? parseInt(searchCriteria.maxPrice) : 10000,
          min_price: searchCriteria.minPrice ? parseInt(searchCriteria.minPrice) : 0,
          min_surface: searchCriteria.minSize ? parseInt(searchCriteria.minSize) : 0,
          min_bedrooms: searchCriteria.minBedrooms ? parseInt(searchCriteria.minBedrooms) : 0,
          furnishing: searchCriteria.furnishing,
          address: searchCriteria.address,
          radius: searchCriteria.radius
        },
        frequency: 'daily',
        email: user.email
      }

      const response = await fetch('/api/alerts/simple', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(alertData)
      })

      if (response.ok) {
        setIsAlertActive(true)
        setAlertButtonText(language === 'de' ? 'Alerte mise à jour' : 'Alert updated')
        console.log('Alert updated successfully')
        
        // Changer le texte après 1 seconde
        setTimeout(() => {
          setAlertButtonText(language === 'de' ? 'Mettre à jour mon alerte' : 'Update my alert')
        }, 1000)
      } else {
        console.error('Failed to update alert')
        alert(language === 'de' ? 'Erreur lors de la mise à jour de l\'alerte' : 'Error updating alert')
      }
    } catch (error) {
      console.error('Error managing alert:', error)
    }
  }

  // Fonction pour gérer le survol (sans aucun effet sur la carte)
  const handleListingHover = (listing: Listing) => {
    setActiveId(listing.id)
    // Ne pas mettre à jour selectedListing au survol
  }

  // Fonction pour revenir à la liste des annonces
  const handleBackToList = () => {
    setShowListingDetail(false)
    setSelectedListing(null)
    setClickedListing(null)
    
    // Réinitialiser les flags de navigation
    setCameFromMap(false)
    setCameFromMobileMap(false)
  }


  const filtered = useMemo(() => {
    // TOUJOURS commencer avec toutes les annonces
    let sourceListings = allListings
    
    // Si on est en mode filtre carte ET qu'il y a des annonces visibles, on filtre
    if (isFilteredByMap && visibleListings.length > 0) {
      sourceListings = visibleListings
    }
    
    const minPrice = Number(searchCriteria.minPrice || 0)
    const maxPrice = Number(searchCriteria.maxPrice || Number.MAX_SAFE_INTEGER)
    const minSize = Number(searchCriteria.minSize || 0)
    const minBedrooms = Number(searchCriteria.minBedrooms || 0)
    
    console.log('Filtrage avec critères:', { minPrice, maxPrice, minSize, minBedrooms, type: searchCriteria.type, furnishing: searchCriteria.furnishing })
    console.log('Source des annonces:', (isFilteredByMap && visibleListings.length > 0) ? 'visibleListings (carte)' : 'allListings (toutes)')
    console.log('État:', { isFilteredByMap, visibleListingsLength: visibleListings.length, allListingsLength: allListings.length })
    const filteredListings = sourceListings.filter((l) => {
      // Filtre par type
      if (searchCriteria.type !== 'Any' && l.type !== searchCriteria.type) {
        console.log(`Filtré par type: ${l.title} (${l.type} !== ${searchCriteria.type})`)
        return false
      }
      
      // Filtre par meublé/non-meublé
      if (searchCriteria.furnishing !== 'Any') {
        const wantFurnished = searchCriteria.furnishing === 'Furnished'
        if (l.furnished !== wantFurnished) {
          console.log(`Filtré par furnishing: ${l.title} (${l.furnished} !== ${wantFurnished})`)
          return false
        }
      }
      
      // Filtre par prix
      const priceNum = Number(String(l.price).replace(/[^\d]/g, ''))
      if (!(priceNum >= minPrice && priceNum <= maxPrice)) {
        console.log(`Filtré par prix: ${l.title} (${priceNum} pas entre ${minPrice} et ${maxPrice})`)
        return false
      }
      
      // Filtre par distance si une adresse est sélectionnée
      if (addressCoordinates && searchCriteria.address) {
        const distance = calculateDistance(
          addressCoordinates.lat,
          addressCoordinates.lng,
          l.lat,
          l.lng
        )
        if (distance > searchCriteria.radius) return false
      }
      
      // Filtre par surface minimum
      if (minSize > 0) {
        const sizeNum = Number(l.size) || 0
        if (sizeNum < minSize) {
          console.log(`Filtré par surface: ${l.title} (${sizeNum} < ${minSize})`)
          return false
        }
      }
      
      // Filtre par nombre de chambres minimum
      if (minBedrooms > 0) {
        const roomsNum = Number(l.rooms) || 0
        const bedrooms = Math.max(1, roomsNum - 1) // bedrooms = rooms - 1 (salle de bain)
        if (bedrooms < minBedrooms) {
          console.log(`Filtré par chambres: ${l.title} (${bedrooms} < ${minBedrooms})`)
          return false
        }
      }
      
      console.log(`Annonce acceptée: ${l.title}`)
      return true
    })
    
    console.log(`Résultat du filtrage: ${filteredListings.length} annonces sur ${sourceListings.length}`)
    return filteredListings
  }, [allListings, visibleListings, isFilteredByMap, searchCriteria, addressCoordinates])

  // Exposer la fonction selectListing globalement pour les boutons externes
  useEffect(() => {
    const selectListing = (listingId: string) => {
      console.log('External selectListing called with ID:', listingId)
      const listing = allListings.find(l => l.id === listingId)
      if (listing) {
        handleListingClick(listing, false, false)
      } else {
        console.error('Listing not found with ID:', listingId)
      }
    }

    // Exposer seulement la fonction selectListing
    if (typeof window !== 'undefined') {
      (window as any).selectListing = selectListing
    }

    // Cleanup function
    return () => {
      if (typeof window !== 'undefined') {
        delete (window as any).selectListing
      }
    }
  }, [allListings, handleListingClick])

  const listingCountLabel = useMemo(() => {
    const n = filtered.length
    const plus = n >= 1000 ? '+' : ''
    const count = n.toLocaleString()
    return `${count}${plus} ${language === 'de' ? 'Anzeigen' : 'listings'}`
  }, [filtered.length, language])

  // Afficher un loader pendant la vérification d'authentification
  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-[#00BFA6]" />
      </div>
    )
  }

  // Si pas connecté, ne rien afficher (redirection en cours)
  if (!user) {
    return null
  }

  const handleSearch = async () => {
    // Placeholder to mimic async search
    setLoading(true)
    setError('')
    setTimeout(() => {
      setLoading(false)
    }, 300)
  }

  return (
    <div className="min-h-screen bg-cream">
      {/* Custom Header - Full Width avec barre de recherche intégrée */}
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
                priority
              />
            </Link>

            {/* Barre de recherche centrale - Style Airbnb */}
            <div className="flex-1 max-w-2xl mx-8">
              <div className="flex items-center bg-white border border-gray-200 rounded-full px-4 py-2 shadow-sm hover:shadow-md transition-shadow">
                {/* Ville */}
                <div className="flex items-center gap-2 flex-1 min-w-0">
                  <MapPin className="w-4 h-4 text-gray-500 flex-shrink-0" />
                  <input 
                    type="text" 
                    value={searchCriteria.city} 
                    onChange={(e)=>setSearchCriteria({...searchCriteria, city: e.target.value})} 
                    placeholder={language==='de'?'Berlin':'Berlin'} 
                    className="w-full bg-transparent outline-none text-sm font-medium"
                  />
                </div>
                
                <div className="h-6 w-px bg-gray-200 mx-2"/>
                
                {/* Prix minimum */}
                <div className="flex items-center gap-2 min-w-0">
                  <Euro className="w-4 h-4 text-gray-500 flex-shrink-0" />
                  <input 
                    type="number" 
                    value={searchCriteria.minPrice} 
                    onChange={(e)=>setSearchCriteria({...searchCriteria, minPrice: e.target.value})} 
                    placeholder={language==='de'?'Min':'Min'} 
                    className="w-20 bg-transparent outline-none text-sm"
                  />
                </div>
                
                <div className="h-6 w-px bg-gray-200 mx-2"/>
                
                {/* Prix maximum */}
                <div className="flex items-center gap-2 min-w-0">
                  <Euro className="w-4 h-4 text-gray-500 flex-shrink-0" />
                  <input 
                    type="number" 
                    value={searchCriteria.maxPrice} 
                    onChange={(e)=>setSearchCriteria({...searchCriteria, maxPrice: e.target.value})} 
                    placeholder={language==='de'?'Max':'Max'} 
                    className="w-20 bg-transparent outline-none text-sm"
                  />
                </div>
                
                {/* Bouton de recherche */}
                <button 
                  onClick={handleSearch} 
                  disabled={loading} 
                  className="ml-3 w-10 h-10 rounded-full bg-mineral text-white flex items-center justify-center hover:bg-mineral/90 transition-colors disabled:opacity-50"
                >
                  <Search className="w-4 h-4" />
                </button>
                
                <div className="h-6 w-px bg-gray-200 mx-2"/>
                
                {/* Bouton filtres avancés avec dropdown */}
                <div className="relative">
                  <button 
                    onClick={()=>setShowMoreFilters(!showMoreFilters)} 
                    className="flex items-center gap-2 bg-transparent hover:bg-gray-50 rounded-full px-3 py-2 text-sm transition-colors"
                  >
                    <Filter className="w-4 h-4" />
                    <span className="hidden sm:inline">
                      {language==='de'?'Filter':'Filters'}
                    </span>
                  </button>
                  
                  {/* Dropdown des filtres */}
                  {showMoreFilters && (
                    <div className="absolute top-full right-0 mt-2 bg-white border border-gray-200 rounded-xl shadow-lg p-4 w-[320px] z-20">
                      <div className="grid grid-cols-2 gap-3 mb-3">
                        {/* Première ligne : Type et Furnishing */}
                        <div>
                          <label className="block text-xs text-gray-600 mb-1">{language==='de'?'Typ':'Type'}</label>
                          <select value={searchCriteria.type} onChange={(e)=>setSearchCriteria({...searchCriteria, type: e.target.value as any})} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm">
                            <option>{language==='de'?'Beliebig':'Any'}</option>
                            <option>{language==='de'?'Zimmer':'Room'}</option>
                            <option>{language==='de'?'Studio':'Studio'}</option>
                            <option>{language==='de'?'Wohnung':'Apartment'}</option>
                            <option>{language==='de'?'Haus':'House'}</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-xs text-gray-600 mb-1">{language==='de'?'Möblierung':'Furnishing'}</label>
                          <select value={searchCriteria.furnishing} onChange={(e)=>setSearchCriteria({...searchCriteria, furnishing: e.target.value as any})} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm">
                            <option>{language==='de'?'Beliebig':'Any'}</option>
                            <option>{language==='de'?'Möbliert':'Furnished'}</option>
                            <option>{language==='de'?'Unmöbliert':'Unfurnished'}</option>
                          </select>
                        </div>
                        
                        {/* Deuxième ligne : Bedrooms et Min Surface */}
                        <div>
                          <label className="block text-xs text-gray-600 mb-1">{language==='de'?'Schlafzimmer (min)':'Bedrooms (min)'}</label>
                          <select value={searchCriteria.minBedrooms} onChange={(e)=>setSearchCriteria({...searchCriteria, minBedrooms: e.target.value})} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm">
                            <option value="">{language==='de'?'Kein Minimum':'No minimum'}</option>
                            <option value="1">1+</option>
                            <option value="2">2+</option>
                            <option value="3">3+</option>
                            <option value="4">4+</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-xs text-gray-600 mb-1">{language==='de'?'Min. Fläche (m²)':'Min surface (m²)'}</label>
                          <input type="number" value={searchCriteria.minSize} onChange={(e)=>setSearchCriteria({...searchCriteria, minSize: e.target.value})} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"/>
                        </div>
                      </div>
                      
                      {/* Filtre Adresse + Rayon */}
                      <div className="mb-4">
                        <label className="block text-xs text-gray-600 mb-2">{language==='de'?'Adresse':'Address'}</label>
                        <div className="relative">
                          <input
                            type="text"
                            value={searchCriteria.address}
                            onChange={(e) => {
                              setSearchCriteria(prev => ({ ...prev, address: e.target.value }))
                              searchAddresses(e.target.value)
                            }}
                            onFocus={() => setShowSuggestions(true)}
                            onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
                            placeholder={language==='de'?'Adresse eingeben...':'Enter address...'}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                          />
                          
                          {/* Suggestions d'adresses */}
                          {showSuggestions && addressSuggestions.length > 0 && (
                            <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-50 max-h-48 overflow-y-auto">
                              {addressSuggestions.map((suggestion, index) => (
                                <button
                                  key={index}
                                  onClick={() => selectAddress(suggestion)}
                                  className="w-full px-3 py-2 text-left text-sm hover:bg-gray-100 border-b border-gray-100 last:border-b-0"
                                >
                                  <div className="font-medium">{suggestion.display_name}</div>
                                  {suggestion.address && (
                                    <div className="text-xs text-gray-500">
                                      {suggestion.address.road && `${suggestion.address.road}, `}
                                      {suggestion.address.suburb && `${suggestion.address.suburb}, `}
                                      {suggestion.address.city_district && `${suggestion.address.city_district}`}
                                    </div>
                                  )}
                                </button>
                              ))}
                            </div>
                          )}
                        </div>
                        
                        {/* Sélecteur de rayon */}
                        {searchCriteria.address && (
                          <div className="mt-3">
                            <label className="block text-xs text-gray-600 mb-1">
                              {language==='de'?'Rayon':'Radius'}: {searchCriteria.radius} km
                            </label>
                            <input
                              type="range"
                              min="1"
                              max="20"
                              value={searchCriteria.radius}
                              onChange={(e) => setSearchCriteria(prev => ({ ...prev, radius: parseInt(e.target.value) }))}
                              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                            />
                            <div className="flex justify-between text-xs text-gray-500 mt-1">
                              <span>1 km</span>
                              <span>20 km</span>
                            </div>
                          </div>
                        )}
                      </div>
                      
                      {/* Bouton d'alerte */}
                      <div className="mb-4 pt-3 border-t border-gray-100">
                        <button 
                          onClick={handleEmailAlert}
                          className={`w-full flex items-center justify-center gap-2 border rounded-lg px-4 py-3 text-sm font-medium transition-all duration-200 group relative ${
                            isAlertActive 
                              ? 'bg-green-50 hover:bg-green-100 border-green-200 text-green-700' 
                              : 'bg-blue-50 hover:bg-blue-100 border-blue-200 text-blue-700'
                          }`}
                          title={isAlertActive 
                            ? (language === 'de' ? 'Benachrichtigung aktiviert - Klicken Sie zum Deaktivieren' : 'Alert active - Click to deactivate')
                            : (language === 'de' ? 'Klicken Sie hier, um E-Mails zu erhalten, sobald ein neues Angebot, das diesen Kriterien entspricht, veröffentlicht wird' : 'Click here to receive emails when new listings matching these criteria are published')
                          }
                        >
                          {isAlertActive ? (
                            <Bell className="w-4 h-4 animate-pulse" />
                          ) : (
                            <Bell className="w-4 h-4" />
                          )}
                          <span>
                            {isAlertActive 
                              ? (alertButtonText || (language === 'de' ? 'Meine Benachrichtigung aktualisieren' : 'Update my alert'))
                              : (language === 'de' ? 'E-Mail-Benachrichtigung' : 'Email alert')
                            }
                          </span>
                          {!isAlertActive && <Info className="w-3 h-3" />}
                          
                          {/* Tooltip */}
                          <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-gray-900 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-50">
                            {isAlertActive 
                              ? (language === 'de' ? 'Klicken Sie hier, um Ihre Benachrichtigungskriterien zu aktualisieren' : 'Click to update your alert criteria')
                              : (language === 'de' ? 'Erhalten Sie E-Mails für neue Angebote, die diesen Kriterien entsprechen' : 'Get emails for new listings matching these criteria')
                            }
                            <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-t-gray-900"></div>
                          </div>
                        </button>
                      </div>
                      
                      <div className="flex justify-end gap-2">
                        <button onClick={()=>setShowMoreFilters(false)} className="px-3 py-2 text-sm rounded-lg border">{language==='de'?'Schließen':'Close'}</button>
                        <button onClick={()=>{setShowMoreFilters(false);handleSearch()}} className="btn-primary px-4 py-2 text-sm">{language==='de'?'Anwenden':'Apply'}</button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

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
      
      <main className="px-4 md:px-6 lg:px-8 max-w-none pt-4 h-[calc(100vh-100px)] overflow-hidden">
        {/* Compteur d'annonces */}
        <div className="mb-4 flex justify-between items-center">
          <div className="text-sm text-gray-600">{listingCountLabel}</div>
        </div>


        {/* Layout mobile avec carte en bas (1/3) */}
        <div className="lg:hidden flex flex-col h-[calc(100%-56px)]">
          {/* Liste des annonces (2/3) */}
          <div className="flex-1 overflow-auto pr-2">
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-2 mb-2">
                <p className="text-red-600 text-sm">{error}</p>
              </div>
            )}
            {showListingDetail && selectedListing ? (
              <ListingDetailView 
                listing={selectedListing}
                onBack={handleBackToList}
              />
            ) : (
              <div className="grid grid-cols-1 gap-4">
                {filtered.map((listing) => (
                  <div key={listing.id} data-listing-id={listing.id} onMouseEnter={()=>handleListingHover(listing)} onMouseLeave={()=>setActiveId(prev=>prev===listing.id?null:prev)} className={`card hover:shadow-xl transition-all duration-300 cursor-pointer ${activeId===listing.id?'ring-2 ring-mineral':''}`} onClick={() => handleListingClick(listing, false, false)}>
                    <div className="h-48 bg-gray-200 rounded-lg mb-4 overflow-hidden">
                      {listing.images && listing.images.length > 0 ? (
                        <img 
                          src={listing.images[0]} 
                          alt={listing.title}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            e.currentTarget.style.display = 'none'
                            const nextElement = e.currentTarget.nextElementSibling as HTMLElement
                            if (nextElement) {
                              nextElement.style.display = 'flex'
                            }
                          }}
                        />
                      ) : null}
                      <div className="w-full h-full flex items-center justify-center" style={{display: listing.images && listing.images.length > 0 ? 'none' : 'flex'}}>
                        <Home className="w-12 h-12 text-gray-400" />
                      </div>
                    </div>
                    <div className="space-y-3">
                      <div className="flex justify-between items-start">
                        <h3 className="text-lg font-semibold text-gray-900 line-clamp-2 flex-1 pr-2">{listing.title}</h3>
                        <span className="text-2xl font-bold text-mineral whitespace-nowrap">{listing.price}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-700">
                        {listing.size && (
                          <span className="px-2 py-1 bg-gray-100 rounded-full">{listing.size} m²</span>
                        )}
                        <span className="px-2 py-1 bg-gray-100 rounded-full">{listing.type}</span>
                        <span className="px-2 py-1 bg-gray-100 rounded-full">
                          {(() => {
                            const dateStr = listing.scrapedAt || listing.createdAt || new Date().toISOString()
                            const listingDate = new Date(dateStr)
                            const today = new Date()
                            const isToday = listingDate.toLocaleDateString() === today.toLocaleDateString()
                            
                            if (isToday) {
                              return language === 'de' ? 'Heute' : 'Today'
                            } else {
                              const diffDays = Math.ceil((Date.now() - listingDate.getTime()) / (1000 * 60 * 60 * 24))
                              return `${diffDays} ${language === 'de' ? 'Tage' : 'days'} ago`
                            }
                          })()}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Carte mobile en bas (1/3) */}
          <div className="h-1/3 rounded-2xl overflow-hidden mt-4">
            <MapComponent 
              listings={filtered}
              selectedListing={filtered.find(l => l.id === activeId) || null}
              clickedListing={clickedListing}
              onListingSelect={(listing) => setActiveId(listing.id)}
              onBoundsChange={(newBounds) => setBounds(newBounds)}
              onRefreshVisibleListings={handleRefreshVisibleListings}
              onListingClick={(listing) => {
                console.log('Mobile MapComponent onListingClick called with:', listing.title)
                handleListingClick(listing, true, false) // fromMap = true, fromMobileMap = false
              }}
              onBackToList={handleBackToList}
            />
          </div>
        </div>

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
              {showListingDetail && selectedListing ? (
                <ListingDetailView 
                  listing={selectedListing}
                  onBack={handleBackToList}
                />
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                  {filtered.map((listing) => (
                    <div key={listing.id} data-listing-id={listing.id} onMouseEnter={()=>handleListingHover(listing)} onMouseLeave={()=>setActiveId(prev=>prev===listing.id?null:prev)} className={`card hover:shadow-xl transition-all duration-300 cursor-pointer ${activeId===listing.id?'ring-2 ring-mineral':''}`} onClick={() => handleListingClick(listing, false, false)}>
                      <div className="h-48 bg-gray-200 rounded-lg mb-4 overflow-hidden">
                        {listing.images && listing.images.length > 0 ? (
                          <img 
                            src={listing.images[0]} 
                            alt={listing.title}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              e.currentTarget.style.display = 'none'
                              const nextElement = e.currentTarget.nextElementSibling as HTMLElement
                              if (nextElement) {
                                nextElement.style.display = 'flex'
                              }
                            }}
                          />
                        ) : null}
                        <div className="w-full h-full flex items-center justify-center" style={{display: listing.images && listing.images.length > 0 ? 'none' : 'flex'}}>
                          <Home className="w-12 h-12 text-gray-400" />
                        </div>
                      </div>
                      <div className="space-y-3">
                        <div className="flex justify-between items-start">
                          <h3 className="text-lg font-semibold text-gray-900 line-clamp-2 flex-1 pr-2">{listing.title}</h3>
                          <span className="text-2xl font-bold text-mineral whitespace-nowrap">{listing.price}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray-700">
                          {listing.size && (
                            <span className="px-2 py-1 bg-gray-100 rounded-full">{listing.size} m²</span>
                          )}
                          <span className="px-2 py-1 bg-gray-100 rounded-full">{listing.type}</span>
                          <span className="px-2 py-1 bg-gray-100 rounded-full">
                            {(() => {
                              const dateStr = listing.scrapedAt || listing.createdAt || new Date().toISOString()
                              const listingDate = new Date(dateStr)
                              const today = new Date()
                              const isToday = listingDate.toLocaleDateString() === today.toLocaleDateString()
                              
                              if (isToday) {
                                return language === 'de' ? 'Heute' : 'Today'
                              } else {
                                const diffDays = Math.ceil((Date.now() - listingDate.getTime()) / (1000 * 60 * 60 * 24))
                                return `${diffDays} ${language === 'de' ? 'Tage' : 'days'} ago`
                              }
                            })()}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Right: full-height map (1/3) */}
              <div className="rounded-2xl overflow-hidden h-full lg:col-span-1">
                <MapComponent 
                  listings={filtered}
                  selectedListing={filtered.find(l => l.id === activeId) || null}
                  clickedListing={clickedListing}
                  onListingSelect={(listing) => setActiveId(listing.id)}
                  onBoundsChange={(newBounds) => setBounds(newBounds)}
                  onRefreshVisibleListings={handleRefreshVisibleListings}
                  onListingClick={(listing) => {
                    console.log('Desktop MapComponent onListingClick called with:', listing.title)
                    handleListingClick(listing, true, false)
                  }}
                  onBackToList={handleBackToList}
                />
              </div>
        </div>
      </main>

      {/* Footer intentionally removed on this page to reduce visual load */}
      
      {/* Plan Modal */}
      <PlanModal 
        isOpen={showPlanModal} 
        onClose={() => setShowPlanModal(false)} 
      />
    </div>
  )
}
