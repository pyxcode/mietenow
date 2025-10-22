import mongoose, { Document, Schema } from 'mongoose'

export interface IAlert extends Document {
  _id: mongoose.Types.ObjectId
  user_id: mongoose.Types.ObjectId
  email: string
  title: string
  criteria: {
    city: string
    type: string
    max_price: number
    min_price?: number
    min_surface?: number
    max_surface?: number
    districts?: string[]
    furnishing?: 'Any' | 'Furnished' | 'Unfurnished'
  }
  frequency: 'hourly' | 'daily'
  last_triggered_at: Date
  active: boolean
  created_at: Date
}

const AlertSchema = new Schema<IAlert>({
  user_id: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  email: {
    type: String,
    required: true,
    trim: true,
    lowercase: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
  },
  title: {
    type: String,
    required: true,
    trim: true,
    maxlength: 100
  },
  criteria: {
    city: {
      type: String,
      required: true,
      trim: true,
      maxlength: 50
    },
    type: {
      type: String,
      required: true,
      enum: ['Any', 'Room', 'Studio', 'Apartment', 'House'],
      default: 'Any'
    },
    max_price: {
      type: Number,
      required: true,
      min: 0,
      max: 10000
    },
    min_price: {
      type: Number,
      min: 0,
      max: 10000
    },
    min_surface: {
      type: Number,
      min: 0,
      max: 500
    },
    max_surface: {
      type: Number,
      min: 0,
      max: 500
    },
    districts: [{
      type: String,
      trim: true
    }],
    furnishing: {
      type: String,
      enum: ['Any', 'Furnished', 'Unfurnished'],
      default: 'Any'
    }
  },
  frequency: {
    type: String,
    enum: ['hourly', 'daily'],
    default: 'daily'
  },
  last_triggered_at: {
    type: Date,
    default: Date.now
  },
  active: {
    type: Boolean,
    default: true
  },
  created_at: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
})

// Index pour optimiser les recherches
AlertSchema.index({ user_id: 1 })
AlertSchema.index({ active: 1 })
AlertSchema.index({ frequency: 1 })
AlertSchema.index({ last_triggered_at: 1 })
AlertSchema.index({ 'criteria.city': 1 })
AlertSchema.index({ 'criteria.type': 1 })

// Index composé pour les requêtes de matching
AlertSchema.index({ 
  active: 1, 
  'criteria.city': 1, 
  'criteria.type': 1 
})

// Méthode pour vérifier si l'alerte doit être déclenchée
AlertSchema.methods.shouldTrigger = function() {
  if (!this.active) return false
  
  const now = new Date()
  const timeSinceLastTrigger = now.getTime() - this.last_triggered_at.getTime()
  
  if (this.frequency === 'hourly') {
    return timeSinceLastTrigger >= 60 * 60 * 1000 // 1 heure
  } else if (this.frequency === 'daily') {
    return timeSinceLastTrigger >= 24 * 60 * 60 * 1000 // 24 heures
  }
  
  return false
}

// Méthode pour mettre à jour le timestamp de déclenchement
AlertSchema.methods.markAsTriggered = function() {
  this.last_triggered_at = new Date()
  return this.save()
}

// Méthode pour désactiver l'alerte
AlertSchema.methods.deactivate = function() {
  this.active = false
  return this.save()
}

// Méthode pour activer l'alerte
AlertSchema.methods.activate = function() {
  this.active = true
  return this.save()
}

// Méthode statique pour trouver les alertes actives d'un utilisateur
AlertSchema.statics.findActiveByUserId = function(userId: mongoose.Types.ObjectId) {
  return this.find({
    user_id: userId,
    active: true
  }).sort({ created_at: -1 })
}

// Méthode statique pour trouver les alertes prêtes à être déclenchées
AlertSchema.statics.findReadyToTrigger = function() {
  const now = new Date()
  const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000)
  const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000)
  
  return this.find({
    active: true,
    $or: [
      {
        frequency: 'hourly',
        last_triggered_at: { $lt: oneHourAgo }
      },
      {
        frequency: 'daily',
        last_triggered_at: { $lt: oneDayAgo }
      }
    ]
  })
}

// Méthode statique pour matcher les alertes avec des annonces
AlertSchema.statics.findMatchingAlerts = function(listing: any) {
  return this.find({
    active: true,
    'criteria.city': new RegExp(listing.location, 'i'),
    'criteria.type': listing.type,
    'criteria.max_price': { $gte: listing.price },
    'criteria.min_surface': { $lte: listing.surface }
  })
}

// Méthode statique pour obtenir les statistiques des alertes
AlertSchema.statics.getAlertStats = function() {
  return this.aggregate([
    {
      $group: {
        _id: null,
        totalAlerts: { $sum: 1 },
        activeAlerts: {
          $sum: { $cond: ['$active', 1, 0] }
        },
        hourlyAlerts: {
          $sum: { $cond: [{ $eq: ['$frequency', 'hourly'] }, 1, 0] }
        },
        dailyAlerts: {
          $sum: { $cond: [{ $eq: ['$frequency', 'daily'] }, 1, 0] }
        }
      }
    }
  ])
}

export default mongoose.models.Alert || mongoose.model<IAlert>('Alert', AlertSchema)
