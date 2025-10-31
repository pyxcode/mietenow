#!/usr/bin/env node

/**
 * Calculate OpenAI API Costs
 * 
 * Calcule le coût réel d'utilisation de GPT-4.1-nano pour le scraping
 */

// Prix GPT-4.1-nano (à mettre à jour selon les tarifs OpenAI)
const PRICING = {
  input: 0.15 / 1000000,   // $0.15 par million de tokens d'entrée
  output: 0.60 / 1000000,  // $0.60 par million de tokens de sortie
  // En euros (taux approximatif: 1$ = 0.92€)
  inputEUR: (0.15 * 0.92) / 1000000,   // ~0.138€ par million
  outputEUR: (0.60 * 0.92) / 1000000,  // ~0.552€ par million
}

// Estimation des tokens par appel (APRÈS OPTIMISATION - réduit de ~8x)
const TOKENS_PER_CALL = {
  // HTML envoyé: maintenant seulement 15,000 caractères (optimisé!)
  htmlChars: 15000,
  // HTML en tokens: ~4 caractères = 1 token (HTML est verbeux)
  htmlTokens: 3750,  // 15k chars / 4 (réduction de 30k à 3.75k = 8x)
  
  // Prompt système + utilisateur (prompt raccourci drastiquement)
  promptTokens: 500,  // Prompt simplifié (~300 chars)
  
  // Réponse JSON
  responseTokens: 800,  // JSON structuré (inchangé)
  
  // Total (AVANT: 32k tokens → APRÈS: 4.25k tokens = réduction ~7.5x)
  inputTotal: 4250,   // 3.75k HTML + 500 prompt (vs 32k avant)
  outputTotal: 800,    // Réponse JSON
}

// Calculer le coût par appel
function calculateCostPerCall() {
  const inputCostUSD = TOKENS_PER_CALL.inputTotal * PRICING.input
  const outputCostUSD = TOKENS_PER_CALL.outputTotal * PRICING.output
  const totalCostUSD = inputCostUSD + outputCostUSD
  
  const inputCostEUR = TOKENS_PER_CALL.inputTotal * PRICING.inputEUR
  const outputCostEUR = TOKENS_PER_CALL.outputTotal * PRICING.outputEUR
  const totalCostEUR = inputCostEUR + outputCostEUR
  
  return {
    inputCostUSD,
    outputCostUSD,
    totalCostUSD,
    inputCostEUR,
    outputCostEUR,
    totalCostEUR
  }
}

// Scénarios d'utilisation
const SCENARIOS = {
  perListing: {
    name: 'Par annonce scrapée',
    calls: 1
  },
  perSite: {
    name: 'Par site (5 annonces max)',
    calls: 5
  },
  perHour: {
    name: 'Par heure (limite configurée: 2000 appels/heure)',
    calls: 2000
  },
  perDay: {
    name: 'Par jour (si scraped 24h/24 au max)',
    calls: 2000 * 24  // 48,000 appels max par jour
  },
  perMonth: {
    name: 'Par mois (30 jours au max)',
    calls: 2000 * 24 * 30  // 1,440,000 appels max par mois
  },
  realisticDaily: {
    name: 'Réaliste: 10 sites × 5 annonces × 4 fois/jour',
    calls: 10 * 5 * 4  // 200 appels par jour
  },
  realisticMonthly: {
    name: 'Réaliste: 200 appels/jour × 30 jours',
    calls: 200 * 30  // 6,000 appels par mois
  }
}

function main() {
  console.log('💰 CALCUL DES COÛTS OpenAI GPT-4.1-nano\n')
  console.log('=' .repeat(70))
  
  const costPerCall = calculateCostPerCall()
  
  console.log('\n📊 COÛT PAR APPEL API:')
  console.log('-'.repeat(70))
  console.log(`Input:  ${TOKENS_PER_CALL.inputTotal.toLocaleString()} tokens × $${PRICING.input * 1000000}/M = $${costPerCall.inputCostUSD.toFixed(6)} (${costPerCall.inputCostEUR.toFixed(6)}€)`)
  console.log(`Output: ${TOKENS_PER_CALL.outputTotal.toLocaleString()} tokens × $${PRICING.output * 1000000}/M = $${costPerCall.outputCostUSD.toFixed(6)} (${costPerCall.outputCostEUR.toFixed(6)}€)`)
  console.log(`TOTAL:  $${costPerCall.totalCostUSD.toFixed(6)} (${costPerCall.totalCostEUR.toFixed(6)}€) par appel`)
  console.log(`        ≈ ${(costPerCall.totalCostEUR * 100).toFixed(3)} centimes d'euro par appel`)
  
  console.log('\n📈 COÛTS PAR SCÉNARIO:')
  console.log('='.repeat(70))
  
  Object.entries(SCENARIOS).forEach(([key, scenario]) => {
    const totalCostUSD = costPerCall.totalCostUSD * scenario.calls
    const totalCostEUR = costPerCall.totalCostEUR * scenario.calls
    
    console.log(`\n${scenario.name}:`)
    console.log(`  Appels: ${scenario.calls.toLocaleString()}`)
    console.log(`  Coût:   $${totalCostUSD.toFixed(2)} (${totalCostEUR.toFixed(2)}€)`)
    
    if (scenario.calls >= 1000) {
      console.log(`  Soit:   ${(totalCostEUR / scenario.calls * 1000).toFixed(3)}€ pour 1000 appels`)
    }
  })
  
  console.log('\n⚠️  POURQUOI ÇA PEUT ÊTRE CHER:')
  console.log('='.repeat(70))
  console.log('1. 1 appel GPT par annonce = beaucoup d\'appels si tu scrapes beaucoup')
  console.log('2. Chaque appel envoie ~120k caractères de HTML (30k tokens)')
  console.log('3. Même si GPT-4.1-nano est moins cher, le volume fait monter la facture')
  console.log('4. Limite configurée: jusqu\'à 2000 appels/heure possible')
  console.log('')
  console.log('💡 OPTIMISATIONS POSSIBLES:')
  console.log('='.repeat(70))
  console.log('1. Réduire maxListingsPerSite (actuellement: 5)')
  console.log('2. Scraper moins souvent (pas 24/7)')
  console.log('3. Filtrer les URLs avant d\'appeler GPT (regex basique)')
  console.log('4. Utiliser GPT seulement pour les sites complexes')
  console.log('5. Mettre en cache les extractions similaires')
  console.log('')
  console.log('📝 NOTE:')
  console.log('='.repeat(70))
  console.log('Le scénario "réaliste" (200 appels/jour) = ~5.5€/mois')
  console.log('C\'est raisonnable si tu scrapes régulièrement mais pas 24/7.')
}

main()

