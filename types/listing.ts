// Types pour les annonces immobilières
export interface Listing {
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
  sourceId: string
  publishedAt: Date
  updatedAt: Date
  isActive: boolean
  features: string[]
  contactInfo?: {
    name?: string
    phone?: string
    email?: string
  }
}

export interface SearchCriteria {
  city: string
  minPrice?: number
  maxPrice?: number
  minRooms?: number
  maxRooms?: number
  minSize?: number
  maxSize?: number
  districts?: string[]
  features?: string[]
}

export interface ScraperConfig {
  name: string
  baseUrl: string
  searchUrl: string
  selectors: {
    listingContainer: string
    title: string
    price: string
    location: string
    rooms: string
    size: string
    description: string
    images: string
    link: string
  }
  pagination?: {
    nextPageSelector: string
    maxPages: number
  }
  rateLimit: {
    delay: number
    maxRequests: number
  }
}

export interface ScraperResult {
  listings: Listing[]
  totalFound: number
  hasMore: boolean
  nextPageUrl?: string
  errors: string[]
}
