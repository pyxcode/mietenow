import mongoose, { Document, Schema } from 'mongoose'

export interface IUser extends Document {
  _id: mongoose.Types.ObjectId
  first_name: string
  last_name: string
  email: string
  password_hash: string
  plan: 'Free' | 'Premium' | 'Pro'
  subscription_status: 'active' | 'expired' | 'canceled'
  search_preferences: {
    city: string
    max_price: number
    type: string
    surface_min: number
  }
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
    required: true,
    minlength: 6
  },
  plan: {
    type: String,
    enum: ['Free', 'Premium', 'Pro'],
    default: 'Free'
  },
  subscription_status: {
    type: String,
    enum: ['active', 'expired', 'canceled'],
    default: 'active'
  },
  search_preferences: {
    city: {
      type: String,
      default: 'Berlin',
      trim: true
    },
    max_price: {
      type: Number,
      default: 1500,
      min: 0
    },
    type: {
      type: String,
      default: 'apartment',
      enum: ['studio', 'apartment', 'WG', 'house']
    },
    surface_min: {
      type: Number,
      default: 30,
      min: 0
    }
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
  return this.plan !== 'Free'
}

// Méthode pour vérifier si l'abonnement est actif
UserSchema.methods.isSubscriptionActive = function() {
  return this.subscription_status === 'active'
}

export default mongoose.models.User || mongoose.model<IUser>('User', UserSchema)