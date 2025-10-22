import mongoose, { Document, Schema } from 'mongoose'

export interface IUser extends Document {
  _id: mongoose.Types.ObjectId
  first_name: string
  last_name: string
  email: string
  password_hash: string
  plan: 'empty' | '2sem' | '1mois' | '3mois'
  plan_expires_at?: Date
  subscription_status: 'active' | 'expired' | 'canceled'
  last_payment_date?: Date
  plan_duration_days?: number
  search_preferences: {
    city: string
    min_price?: number
    max_price: number
    type: string
    min_surface?: number
    max_surface?: number
    districts?: string[]
    furnishing?: 'Any' | 'Furnished' | 'Unfurnished'
    address?: string
    radius?: number
    coordinates?: {lat: number, lng: number}
    min_bedrooms?: number
  }
  onboarding_completed: boolean
  current_step: 'rent' | 'criteria' | 'signup' | 'filters' | 'complete'
  created_at: Date
  last_login: Date
}

const UserSchema = new Schema<IUser>({
  first_name: {
    type: String,
    required: true,
    trim: true,
    maxlength: 50
  },
  last_name: {
    type: String,
    required: true,
    trim: true,
    maxlength: 50
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
  },
  password_hash: {
    type: String,
    required: true
  },
  plan: {
    type: String,
    enum: ['empty', '2sem', '1mois', '3mois'],
    default: 'empty'
  },
  plan_expires_at: {
    type: Date,
    default: null
  },
  subscription_status: {
    type: String,
    enum: ['active', 'expired', 'canceled'],
    default: 'active'
  },
  last_payment_date: {
    type: Date,
    default: null
  },
  plan_duration_days: {
    type: Number,
    min: 1,
    max: 365
  },
  search_preferences: {
    city: {
      type: String,
      default: 'Berlin',
      trim: true
    },
    min_price: {
      type: Number,
      min: 0
    },
    max_price: {
      type: Number,
      default: 1500,
      min: 0
    },
    type: {
      type: String,
      default: 'Any',
      enum: ['Any', 'Room', 'Studio', 'Apartment', 'House']
    },
    min_surface: {
      type: Number,
      min: 0
    },
    max_surface: {
      type: Number,
      min: 0
    },
    districts: [{
      type: String,
      trim: true
    }],
    furnishing: {
      type: String,
      enum: ['Any', 'Furnished', 'Unfurnished'],
      default: 'Any'
    },
    address: {
      type: String,
      trim: true
    },
    radius: {
      type: Number,
      min: 1,
      max: 50,
      default: 5
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
    min_bedrooms: {
      type: Number,
      min: 0,
      max: 10,
      default: 0
    }
  },
  onboarding_completed: {
    type: Boolean,
    default: false
  },
  current_step: {
    type: String,
    enum: ['rent', 'criteria', 'signup', 'filters', 'complete'],
    default: 'rent'
  },
  created_at: {
    type: Date,
    default: Date.now
  },
  last_login: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true // Ajoute automatiquement createdAt et updatedAt
})

// Index pour optimiser les recherches
UserSchema.index({ email: 1 })
UserSchema.index({ plan: 1 })
UserSchema.index({ subscription_status: 1 })

// Méthode virtuelle pour le nom complet
UserSchema.virtual('full_name').get(function() {
  return `${this.first_name} ${this.last_name}`
})

// Méthode pour vérifier si l'utilisateur a un plan payant
UserSchema.methods.hasPaidPlan = function() {
  return this.plan !== 'empty'
}

// Méthode pour vérifier si l'abonnement est actif
UserSchema.methods.isSubscriptionActive = function() {
  return this.subscription_status === 'active'
}

// Méthode pour vérifier si le plan est encore valide (pas expiré)
UserSchema.methods.isPlanValid = function() {
  if (this.plan === 'empty') return false
  
  const now = new Date()
  const planExpiry = this.plan_expires_at ? new Date(this.plan_expires_at) : null
  
  // Si pas de date d'expiration, considérer comme valide
  if (!planExpiry) return true
  
  // Vérifier si le plan est expiré
  return now <= planExpiry && this.subscription_status === 'active'
}

// Méthode pour calculer la date d'expiration basée sur le plan
UserSchema.methods.calculatePlanExpiry = function(planType: string) {
  const now = new Date()
  const daysToAdd = {
    '2sem': 14,    // 2 semaines
    '1mois': 30,    // 1 mois
    '3mois': 90     // 3 mois
  }
  
  const days = daysToAdd[planType as keyof typeof daysToAdd] || 0
  const expiryDate = new Date(now.getTime() + (days * 24 * 60 * 60 * 1000))
  
  return expiryDate
}

export default mongoose.models.User || mongoose.model<IUser>('User', UserSchema)