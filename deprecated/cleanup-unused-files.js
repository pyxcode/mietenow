#!/usr/bin/env node

/**
 * Cleanup Unused Files
 * 
 * This script removes files that are no longer needed:
 * - Test files
 * - Backup files
 * - Debug files
 * - One-time use scripts
 */

import { unlinkSync, existsSync, readdirSync, statSync } from 'fs'
import { join } from 'path'

// Files to delete
const filesToDelete = [
  // Test files
  'scripts/test-*.js',
  'scripts/test-*.html',
  'scripts/test-*.json',
  'scripts/debug-*.html',
  'scripts/debug-*.js',
  
  // Backup files
  'app/search/page.tsx.backup',
  '.env.local.backup',
  '*.backup',
  
  // Debug files
  'debug-immobilienscout24.html',
  'test-page.html',
  'test-button.html',
  'generate-buttons.html',
  
  // One-time use scripts (already executed)
  'scripts/clean-database.js',
  'scripts/update-coordinates.js',
  'scripts/deep-search.js',
  
  // Test report files
  'scripts/cron-test-report-*.json',
  
  // Log files (keep recent ones)
  'logs/cron-test-*.log',
  'logs/debug-*.log'
]

// Directories to clean
const directoriesToClean = [
  'logs',
  'scripts'
]

function deleteFile(filePath) {
  try {
    if (existsSync(filePath)) {
      unlinkSync(filePath)
      console.log(`✅ Deleted: ${filePath}`)
      return true
    } else {
      console.log(`⚠️ Not found: ${filePath}`)
      return false
    }
  } catch (error) {
    console.log(`❌ Error deleting ${filePath}: ${error.message}`)
    return false
  }
}

function cleanDirectory(dirPath) {
  try {
    if (!existsSync(dirPath)) {
      console.log(`⚠️ Directory not found: ${dirPath}`)
      return
    }
    
    const files = readdirSync(dirPath)
    let deletedCount = 0
    
    files.forEach(file => {
      const filePath = join(dirPath, file)
      const stats = statSync(filePath)
      
      if (stats.isFile()) {
        // Check if file matches patterns to delete
        const shouldDelete = filesToDelete.some(pattern => {
          if (pattern.includes('*')) {
            const regex = new RegExp(pattern.replace(/\*/g, '.*'))
            return regex.test(file)
          }
          return file === pattern
        })
        
        if (shouldDelete) {
          if (deleteFile(filePath)) {
            deletedCount++
          }
        }
      }
    })
    
    console.log(`📁 Cleaned ${dirPath}: ${deletedCount} files deleted`)
    
  } catch (error) {
    console.log(`❌ Error cleaning directory ${dirPath}: ${error.message}`)
  }
}

function main() {
  console.log('🧹 Starting cleanup of unused files...')
  console.log(`📅 ${new Date().toISOString()}`)
  
  let totalDeleted = 0
  
  // Delete specific files
  console.log('\n📄 Deleting specific files...')
  filesToDelete.forEach(filePattern => {
    if (filePattern.includes('*')) {
      // Handle wildcard patterns
      const dir = filePattern.split('/')[0]
      const pattern = filePattern.split('/').slice(1).join('/')
      cleanDirectory(dir)
    } else {
      if (deleteFile(filePattern)) {
        totalDeleted++
      }
    }
  })
  
  // Clean directories
  console.log('\n📁 Cleaning directories...')
  directoriesToClean.forEach(dir => {
    cleanDirectory(dir)
  })
  
  console.log(`\n✅ Cleanup completed! Total files deleted: ${totalDeleted}`)
  console.log('\n📋 Remaining important files:')
  console.log('   - scripts/master-cron.js (main cron script)')
  console.log('   - scripts/http-only-crawler.js (crawler)')
  console.log('   - scripts/multi-site-crawler.js (orchestrator)')
  console.log('   - scripts/test-websites.js (website tester)')
  console.log('   - lib/openai-extractor.js (OpenAI integration)')
  console.log('   - All app/ and components/ files')
  console.log('   - All model/ and type/ files')
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main()
}

export { main as cleanupUnusedFiles }
