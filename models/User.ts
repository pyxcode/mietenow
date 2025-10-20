import mongoose, { Document, Schema } from 'mongoose'

export interface IUser extends Document {
  firstName: string
  lastName: string
  email: string
  password: string
  address?: string
  phone?: string
  isActive: boolean
  subscription?: {
    plan: 'free' | 'pro' | 'premium'
    status: 'active' | 'inactive' | 'cancelled'
    startDate: Date
    endDate?: Date
  }
  searchCriteria?: {
    city: string
    minPrice?: number
    maxPrice?: number
    minRooms?: number
    maxRooms?: number
    minBedrooms?: number
    maxBedrooms?: number
    minSize?: number
    maxSize?: number
    propertyType?: string[]
    furnishing?: string[]
    districts?: string[]
  }
  createdAt: Date
  updatedAt: Date
}

const UserSchema = new Schema<IUser>({
  firstName: {
    type: String,
    required: [true, 'First name is required'],
    trim: true,
    maxlength: [50, 'First name cannot be more than 50 characters']
  },
  lastName: {
    type: String,
    required: [true, 'Last name is required'],
    trim: true,
    maxlength: [50, 'Last name cannot be more than 50 characters']
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [6, 'Password must be at least 6 characters']
  },
  address: {
    type: String,
    trim: true
  },
  phone: {
    type: String,
    trim: true
  },
  isActive: {
    type: Boolean,
    default: true
  },
  subscription: {
    plan: {
      type: String,
      enum: ['free', 'pro', 'premium'],
      default: 'free'
    },
    status: {
      type: String,
      enum: ['active', 'inactive', 'cancelled'],
      default: 'inactive'
    },
    startDate: {
      type: Date,
      default: Date.now
    },
    endDate: Date
  },
  searchCriteria: {
    city: {
      type: String,
      default: 'Berlin'
    },
    minPrice: Number,
    maxPrice: Number,
    minRooms: Number,
    maxRooms: Number,
    minBedrooms: Number,
    maxBedrooms: Number,
    minSize: Number,
    maxSize: Number,
    propertyType: [String],
    furnishing: [String],
    districts: [String]
  }
}, {
  timestamps: true
})

// Index pour les recherches fréquentes
UserSchema.index({ email: 1 })
UserSchema.index({ 'subscription.status': 1 })
UserSchema.index({ 'searchCriteria.city': 1 })

export default mongoose.models.User || mongoose.model<IUser>('User', UserSchema)
