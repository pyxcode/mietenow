/**
 * Helper pour obtenir les modèles Mongoose sur la bonne base de données (mietenow-prod)
 */

import mongoose from 'mongoose'
import { User as UserModel } from '@/models'

const DB_NAME = 'mietenow-prod'

/**
 * Obtient une connexion Mongoose vers mietenow-prod
 */
export function getMietenowProdConnection() {
  if (mongoose.connection.readyState !== 1) {
    throw new Error('MongoDB connection is not ready')
  }
  
  // Si la connexion par défaut est déjà sur mietenow-prod, l'utiliser
  if (mongoose.connection.name === DB_NAME) {
    return mongoose.connection
  }
  
  // Sinon, créer une connexion vers mietenow-prod
  return mongoose.connection.useDb(DB_NAME)
}

/**
 * Obtient le modèle User sur la base mietenow-prod
 */
export function getUserModel() {
  const connection = getMietenowProdConnection()
  return connection.models.User || UserModel
}

