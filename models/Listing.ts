import mongoose, { Document, Schema } from 'mongoose'

export interface IListing extends Document {
  _id: mongoose.Types.ObjectId
  title: string
  description: string
  price: number
  location: string
  district: string
  surface: number
  rooms: number
  type: 'studio' | 'apartment' | 'WG' | 'house'
  images: string[]
  url_source: string
  source_name: string
  scraped_at: Date
  is_active: boolean
  available_from: Date
  owner_id?: mongoose.Types.ObjectId
  created_at: Date
}

const ListingSchema = new Schema<IListing>({
  title: {
    type: String,
    required: true,
    trim: true,
    maxlength: 200
  },
  description: {
    type: String,
    required: true,
    trim: true,
    maxlength: 2000
  },
  price: {
    type: Number,
    required: true,
    min: 0
  },
  location: {
    type: String,
    required: true,
    trim: true,
    maxlength: 100
  },
  district: {
    type: String,
    required: true,
    trim: true,
    maxlength: 50
  },
  surface: {
    type: Number,
    required: true,
    min: 0
  },
  rooms: {
    type: Number,
    required: true,
    min: 0
  },
  type: {
    type: String,
    required: true,
    enum: ['studio', 'apartment', 'WG', 'house']
  },
  images: [{
    type: String,
    validate: {
      validator: function(v: string) {
        return /^https?:\/\/.+\.(jpg|jpeg|png|webp)$/i.test(v)
      },
      message: 'Images must be valid URLs with image extensions'
    }
  }],
  url_source: {
    type: String,
    required: true,
    validate: {
      validator: function(v: string) {
        return /^https?:\/\/.+/.test(v)
      },
      message: 'Source URL must be a valid HTTP/HTTPS URL'
    }
  },
  source_name: {
    type: String,
    required: true,
    trim: true,
    maxlength: 50
  },
  scraped_at: {
    type: Date,
    default: Date.now
  },
  is_active: {
    type: Boolean,
    default: true
  },
  available_from: {
    type: Date,
    required: true
  },
  owner_id: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: false
  },
  created_at: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
})

// Index pour optimiser les recherches
ListingSchema.index({ location: 1 })
ListingSchema.index({ district: 1 })
ListingSchema.index({ price: 1 })
ListingSchema.index({ type: 1 })
ListingSchema.index({ is_active: 1 })
ListingSchema.index({ available_from: 1 })
ListingSchema.index({ created_at: -1 })

// Index composé pour les recherches complexes
ListingSchema.index({ 
  location: 1, 
  type: 1, 
  price: 1, 
  is_active: 1 
})

// Méthode virtuelle pour le prix par m²
ListingSchema.virtual('price_per_sqm').get(function() {
  return this.surface > 0 ? Math.round(this.price / this.surface) : 0
})

// Méthode pour vérifier si l'annonce est récente (moins de 7 jours)
ListingSchema.methods.isRecent = function() {
  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
  return this.created_at > sevenDaysAgo
}

// Méthode pour vérifier si l'annonce est disponible
ListingSchema.methods.isAvailable = function() {
  return this.is_active && this.available_from <= new Date()
}

// Méthode statique pour rechercher des annonces
ListingSchema.statics.findByCriteria = function(criteria: {
  location?: string
  type?: string
  maxPrice?: number
  minSurface?: number
  district?: string
}) {
  const query: any = { is_active: true }
  
  if (criteria.location) {
    query.location = new RegExp(criteria.location, 'i')
  }
  
  if (criteria.district) {
    query.district = new RegExp(criteria.district, 'i')
  }
  
  if (criteria.type) {
    query.type = criteria.type
  }
  
  if (criteria.maxPrice) {
    query.price = { $lte: criteria.maxPrice }
  }
  
  if (criteria.minSurface) {
    query.surface = { $gte: criteria.minSurface }
  }
  
  return this.find(query).sort({ created_at: -1 })
}

export default mongoose.models.Listing || mongoose.model<IListing>('Listing', ListingSchema)