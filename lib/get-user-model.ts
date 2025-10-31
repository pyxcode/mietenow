/**
 * Helper simple pour obtenir le modèle User sur mietenow-prod
 */

import mongoose, { Model, Schema } from 'mongoose'
import { IUser } from '@/models/User'

const DB_NAME = 'mietenow-prod'

// Cache du schéma
let UserSchema: Schema | null = null

async function getUserSchema(): Promise<Schema> {
  if (!UserSchema) {
    const UserModule = await import('@/models/User')
    UserSchema = UserModule.UserSchema as Schema
    if (!UserSchema) {
      throw new Error('UserSchema not found')
    }
  }
  return UserSchema
}

/**
 * Obtient le modèle User sur mietenow-prod
 * CRITIQUE: Force toujours l'utilisation de mietenow-prod
 */
export async function getUserModel(): Promise<Model<IUser>> {
  if (mongoose.connection.readyState !== 1) {
    throw new Error('MongoDB connection is not ready. Call connectDB() first.')
  }
  
  // VÉRIFICATION STRICTE: S'assurer qu'on utilise bien mietenow-prod
  const dbName = mongoose.connection.db?.databaseName
  if (!dbName || dbName !== DB_NAME) {
    const errorMsg = `CRITICAL: getUserModel() appelé sur la base "${dbName}" au lieu de "${DB_NAME}"`
    console.error(`❌ ${errorMsg}`)
    throw new Error(errorMsg)
  }
  
  // Si le modèle existe déjà sur cette connexion, le retourner
  if (mongoose.connection.models.User) {
    // Vérifier que le modèle est bien sur la bonne base
    const modelDb = (mongoose.connection.models.User as any).db?.databaseName
    if (modelDb && modelDb !== DB_NAME) {
      console.warn(`⚠️ Modèle User sur mauvaise base: ${modelDb}, recréation...`)
      delete mongoose.connection.models.User
    } else {
      return mongoose.connection.models.User as Model<IUser>
    }
  }
  
  // Créer le modèle sur la connexion active (qui doit être mietenow-prod grâce à connectDB)
  const schema = await getUserSchema()
  const model = mongoose.connection.model<IUser>('User', schema)
  
  // Vérification finale
  const modelDb = (model as any).db?.databaseName
  if (modelDb && modelDb !== DB_NAME) {
    throw new Error(`CRITICAL: Modèle User créé sur "${modelDb}" au lieu de "${DB_NAME}"`)
  }
  
  return model
}
