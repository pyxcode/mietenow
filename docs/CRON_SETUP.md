# Configuration du Cron Job pour MieteNow

## Script de Cron

Le script `scripts/cron-scraper.sh` est prêt à être utilisé pour automatiser le scraping.

### Installation du Cron Job

1. **Ouvrir le crontab :**
   ```bash
   crontab -e
   ```

2. **Ajouter une ligne pour exécuter le scraping toutes les heures :**
   ```bash
   # Scraper MieteNow toutes les heures
   0 * * * * cd /Users/louan/Desktop/PROJETS/mietenow && ./scripts/cron-scraper.sh
   ```

3. **Ou toutes les 6 heures (recommandé pour éviter la surcharge) :**
   ```bash
   # Scraper MieteNow toutes les 6 heures
   0 */6 * * * cd /Users/louan/Desktop/PROJETS/mietenow && ./scripts/cron-scraper.sh
   ```

4. **Ou une fois par jour à 2h du matin :**
   ```bash
   # Scraper MieteNow une fois par jour
   0 2 * * * cd /Users/louan/Desktop/PROJETS/mietenow && ./scripts/cron-scraper.sh
   ```

### Vérification

- **Voir les logs :** `tail -f logs/scraper-cron.log`
- **Tester manuellement :** `./scripts/cron-scraper.sh`
- **Vérifier le cron :** `crontab -l`

### Configuration en Production

Pour la production (Vercel), utiliser Vercel Cron Jobs :

1. **Créer `vercel.json` :**
   ```json
   {
     "crons": [
       {
         "path": "/api/scraper/all-platforms-extended",
         "schedule": "0 */6 * * *"
       }
     ]
   }
   ```

2. **Créer l'endpoint cron :**
   ```typescript
   // app/api/cron/scraper/route.ts
   export async function GET() {
     // Appeler le scraper
     const response = await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/scraper/all-platforms-extended`, {
       method: 'POST'
     })
     
     return Response.json({ success: true })
   }
   ```

### Plateformes Supportées

- ✅ **ImmobilienScout24** - API mobile (rapide et fiable)
- ✅ **eBay Kleinanzeigen** - Puppeteer scraping
- ✅ **Immowelt** - Puppeteer scraping
- ❌ **Immonet** - Protection anti-bot (à investiguer)
- ❌ **WG-Gesucht** - Protection anti-bot (à investiguer)

### Résultats Actuels

- **77 annonces** trouvées par scraping
- **54 annonces** en base de données
- **Déduplication** automatique par hash
- **Logs détaillés** pour monitoring
