const mongoose = require('mongoose')

const AlertSchema = new mongoose.Schema({
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
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

module.exports = mongoose.model('Alert', AlertSchema)
