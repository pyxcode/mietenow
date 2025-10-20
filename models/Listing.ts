import mongoose, { Document, Schema } from 'mongoose'

export interface IListing extends Document {
  title: string
  description: string
  price: number
  currency: string
  location: string
  city: string
  district?: string
  address?: string
  rooms: number
  bedrooms: number
  size: number
  propertyType: string // 'apartment', 'house', 'room', 'studio'
  furnishing: string // 'furnished', 'unfurnished', 'partially_furnished'
  images: string[]
  url: string
  source: string
  sourceId: string
  publishedAt: Date
  updatedAt: Date
  lastChecked: Date
  isActive: boolean
  isAvailable: boolean
  features: string[]
  contactInfo?: {
    name?: string
    phone?: string
    email?: string
  }
  coordinates?: {
    lat: number
    lng: number
  }
  energyRating?: string
  deposit?: number
  utilities?: number
  availableFrom?: Date
}

const ListingSchema = new Schema<IListing>({
  title: {
    type: String,
    required: [true, 'Title is required'],
    trim: true,
    maxlength: [200, 'Title cannot be more than 200 characters']
  },
  description: {
    type: String,
    required: [true, 'Description is required'],
    trim: true
  },
  price: {
    type: Number,
    required: [true, 'Price is required'],
    min: [0, 'Price cannot be negative']
  },
  currency: {
    type: String,
    default: 'EUR',
    enum: ['EUR', 'USD', 'CHF']
  },
  location: {
    type: String,
    required: [true, 'Location is required'],
    trim: true
  },
  city: {
    type: String,
    required: [true, 'City is required'],
    trim: true
  },
  district: {
    type: String,
    trim: true
  },
  address: {
    type: String,
    trim: true
  },
  rooms: {
    type: Number,
    required: [true, 'Number of rooms is required'],
    min: [1, 'Must have at least 1 room']
  },
  bedrooms: {
    type: Number,
    required: [true, 'Number of bedrooms is required'],
    min: [0, 'Bedrooms cannot be negative']
  },
  size: {
    type: Number,
    required: [true, 'Size is required'],
    min: [1, 'Size must be at least 1 m²']
  },
  propertyType: {
    type: String,
    required: [true, 'Property type is required'],
    enum: ['apartment', 'house', 'room', 'studio', 'loft', 'penthouse']
  },
  furnishing: {
    type: String,
    required: [true, 'Furnishing status is required'],
    enum: ['furnished', 'unfurnished', 'partially_furnished']
  },
  images: [{
    type: String,
    validate: {
      validator: function(v: string) {
        return /^https?:\/\/.+\.(jpg|jpeg|png|gif|webp)$/i.test(v)
      },
      message: 'Invalid image URL'
    }
  }],
  url: {
    type: String,
    required: [true, 'URL is required'],
    unique: true
  },
  source: {
    type: String,
    required: [true, 'Source is required'],
    enum: ['WG-Gesucht', 'Immowelt', 'ImmoScout24', 'Nestpick', 'Wunderflats']
  },
  sourceId: {
    type: String,
    required: [true, 'Source ID is required']
  },
  publishedAt: {
    type: Date,
    required: [true, 'Published date is required']
  },
  updatedAt: {
    type: Date,
    default: Date.now
  },
  lastChecked: {
    type: Date,
    default: Date.now
  },
  isActive: {
    type: Boolean,
    default: true
  },
  isAvailable: {
    type: Boolean,
    default: true
  },
  features: [{
    type: String,
    trim: true
  }],
  contactInfo: {
    name: String,
    phone: String,
    email: {
      type: String,
      validate: {
        validator: function(v: string) {
          return !v || /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/.test(v)
        },
        message: 'Invalid email format'
      }
    }
  },
  coordinates: {
    lat: {
      type: Number,
      min: -90,
      max: 90
    },
    lng: {
      type: Number,
      min: -180,
      max: 180
    }
  },
  energyRating: {
    type: String,
    enum: ['A+', 'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H']
  },
  deposit: {
    type: Number,
    min: [0, 'Deposit cannot be negative']
  },
  utilities: {
    type: Number,
    min: [0, 'Utilities cannot be negative']
  },
  availableFrom: Date
}, {
  timestamps: true
})

// Index pour les recherches optimisées
ListingSchema.index({ city: 1, isActive: 1, isAvailable: 1 })
ListingSchema.index({ price: 1 })
ListingSchema.index({ rooms: 1, bedrooms: 1 })
ListingSchema.index({ size: 1 })
ListingSchema.index({ propertyType: 1 })
ListingSchema.index({ furnishing: 1 })
ListingSchema.index({ source: 1, sourceId: 1 })
ListingSchema.index({ publishedAt: -1 })
ListingSchema.index({ lastChecked: 1 })

// Index composé pour les recherches complexes
ListingSchema.index({ 
  city: 1, 
  price: 1, 
  rooms: 1, 
  bedrooms: 1, 
  size: 1, 
  propertyType: 1, 
  furnishing: 1,
  isActive: 1,
  isAvailable: 1
})

export default mongoose.models.Listing || mongoose.model<IListing>('Listing', ListingSchema)
