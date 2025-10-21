import mongoose, { Document, Schema } from 'mongoose'

export interface ITransaction extends Document {
  _id: mongoose.Types.ObjectId
  user_id: mongoose.Types.ObjectId
  stripe_id: string
  plan: string // Free / Premium / Pro
  amount: number
  currency: string
  payment_status: 'pending' | 'completed' | 'failed'
  created_at: Date
  expires_at: Date
}

const TransactionSchema = new Schema<ITransaction>({
  user_id: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  stripe_id: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  plan: {
    type: String,
    required: true,
    enum: ['Free', 'Premium', 'Pro', '2-week', '1-month', '3-month'],
    trim: true
  },
  amount: {
    type: Number,
    required: true,
    min: 0
  },
  currency: {
    type: String,
    default: 'EUR',
    enum: ['EUR', 'USD', 'GBP'],
    uppercase: true
  },
  payment_status: {
    type: String,
    enum: ['pending', 'completed', 'failed'],
    default: 'pending'
  },
  created_at: {
    type: Date,
    default: Date.now
  },
  expires_at: {
    type: Date,
    required: true
  }
}, {
  timestamps: true
})

// Index pour optimiser les recherches
TransactionSchema.index({ user_id: 1 })
TransactionSchema.index({ stripe_id: 1 })
TransactionSchema.index({ payment_status: 1 })
TransactionSchema.index({ plan: 1 })
TransactionSchema.index({ expires_at: 1 })
TransactionSchema.index({ created_at: -1 })

// Index composé pour les requêtes complexes
TransactionSchema.index({ 
  user_id: 1, 
  payment_status: 1, 
  expires_at: 1 
})

// Méthode pour vérifier si la transaction est expirée
TransactionSchema.methods.isExpired = function() {
  return new Date() > this.expires_at
}

// Méthode pour vérifier si la transaction est valide
TransactionSchema.methods.isValid = function() {
  return this.payment_status === 'completed' && !this.isExpired()
}

// Méthode pour calculer les jours restants
TransactionSchema.methods.getDaysRemaining = function() {
  if (this.isExpired()) return 0
  const now = new Date()
  const diffTime = this.expires_at.getTime() - now.getTime()
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24))
}

// Méthode statique pour trouver les transactions actives d'un utilisateur
TransactionSchema.statics.findActiveByUserId = function(userId: mongoose.Types.ObjectId) {
  return this.find({
    user_id: userId,
    payment_status: 'completed',
    expires_at: { $gt: new Date() }
  }).sort({ created_at: -1 })
}

// Méthode statique pour trouver les transactions expirées
TransactionSchema.statics.findExpired = function() {
  return this.find({
    expires_at: { $lt: new Date() },
    payment_status: 'completed'
  })
}

// Méthode statique pour obtenir les statistiques de revenus
TransactionSchema.statics.getRevenueStats = function(startDate?: Date, endDate?: Date) {
  const matchStage: any = { payment_status: 'completed' }
  
  if (startDate || endDate) {
    matchStage.created_at = {}
    if (startDate) matchStage.created_at.$gte = startDate
    if (endDate) matchStage.created_at.$lte = endDate
  }
  
  return this.aggregate([
    { $match: matchStage },
    {
      $group: {
        _id: null,
        totalRevenue: { $sum: '$amount' },
        totalTransactions: { $sum: 1 },
        averageAmount: { $avg: '$amount' }
      }
    }
  ])
}

export default mongoose.models.Transaction || mongoose.model<ITransaction>('Transaction', TransactionSchema)
