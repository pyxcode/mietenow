/**
 * Debug HTML pour trouver les bons sélecteurs CSS
 */

require('dotenv').config({ path: '.env.local' })

const token = process.env.BROWSERLESS_TOKEN

async function debugHTML() {
  try {
    console.log('🔍 Debug HTML ImmobilienScout24...')
    
    const response = await fetch(`https://production-sfo.browserless.io/content?token=${token}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        url: 'https://www.immobilienscout24.de/Suche/S-T/Wohnung-Miete/Berlin/Berlin'
      })
    })
    
    if (!response.ok) {
      console.log('❌ Erreur:', response.status)
      return
    }
    
    const html = await response.text()
    console.log('✅ Page chargée! Taille:', html.length)
    
    // Sauvegarder le HTML pour inspection
    const fs = require('fs')
    fs.writeFileSync('debug-immobilienscout24.html', html)
    console.log('💾 HTML sauvegardé dans debug-immobilienscout24.html')
    
    // Chercher des patterns dans le HTML
    console.log('\n🔍 Recherche de patterns...')
    
    const patterns = [
      'result-list-entry',
      'result-list__listing',
      'listing-item',
      'search-result',
      'expose',
      'wohnung',
      'apartment',
      'miete',
      'rent'
    ]
    
    patterns.forEach(pattern => {
      const regex = new RegExp(pattern, 'gi')
      const matches = html.match(regex)
      if (matches) {
        console.log(`  - "${pattern}": ${matches.length} occurrences`)
      }
    })
    
    // Chercher des classes CSS
    console.log('\n🎨 Recherche de classes CSS...')
    const classRegex = /class="([^"]+)"/g
    const classes = new Set()
    let match
    
    while ((match = classRegex.exec(html)) !== null) {
      const classList = match[1].split(' ')
      classList.forEach(cls => {
        if (cls.includes('result') || cls.includes('listing') || cls.includes('expose')) {
          classes.add(cls)
        }
      })
    }
    
    console.log('Classes trouvées:')
    Array.from(classes).slice(0, 20).forEach(cls => {
      console.log(`  - .${cls}`)
    })
    
  } catch (error) {
    console.log('❌ Erreur:', error.message)
  }
}

debugHTML()
