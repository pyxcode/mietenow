# Mise à jour des sites de scraping

## ✅ Changements effectués

### 1. Fichier centralisé créé
**Fichier**: `scripts/scraping-sites.js`

Ce fichier contient maintenant la liste centralisée de tous les sites à scraper avec les URLs exactes fournies.

### 2. Liste des sites mis à jour (7 sites)

1. **WG-Gesucht**
   - URL: `https://www.wg-gesucht.de/wg-zimmer-und-1-zimmer-wohnungen-und-wohnungen-und-haeuser-in-Berlin.8.0+1+2+3.1.0.html?offer_filter=1&city_id=8&sort_order=0&noDeact=1&categories%5B%5D=0&categories%5B%5D=1&categories%5B%5D=2&categories%5B%5D=3`
   - Provider: `wg-gesucht`

2. **ImmoWelt**
   - URL: `https://www.immowelt.de/suche/mieten/wohnung/berlin/berlin-10115/ad08de8634`
   - Provider: `immowelt`

3. **ImmoNet**
   - URL: `https://www.immonet.de/suchen/miete/wohnung/berlin/berlin-10115/ad08de8634`
   - Provider: `immonet`

4. **eBay Kleinanzeigen**
   - URL: `https://www.kleinanzeigen.de/s-wohnung-mieten/berlin/c203l3331#:~:text=Mietwohnungen%20in%20Berlin%201%20,442%20Mietwohnungen%20in%20Berlin`
   - Provider: `kleinanzeigen`

5. **ImmobilienScout24**
   - URL: `https://www.immobilienscout24.de/Suche/de/berlin/berlin/wohnung-mieten`
   - Provider: `immoscout`

6. **Immopool**
   - URL: `https://www.immopool.de/ASP/immo/obj/ImmoListe.asp?LASID=24492796&GrpO=2&SL=&BEZ=Wohnungen&AnbNr=&Firma=&PRArt=2&ORTArt=1&Land=D&GeoSL=004011000000000000&Waehr=EUR&Umkreis=on&Umkr_xy=568%2C8998%5F611%2C2315&Umkr_km=16`
   - Provider: `immopool`

7. **Wohnungsboerse**
   - URL: `https://www.wohnungsboerse.net/Berlin/mieten/wohnungen#:~:text=Wohnen%20in%20Berlin`
   - Provider: `wohnungsboerse`

### 3. Fichiers mis à jour

- ✅ `scripts/scraping-sites.js` - **NOUVEAU** - Liste centralisée des sites
- ✅ `scripts/multi-site-crawler.js` - Importe maintenant depuis `scraping-sites.js`

### 4. Compatibilité maintenue

Les scripts suivants utilisent `TOP_10_SITES` et fonctionnent automatiquement avec la nouvelle liste:

- ✅ `scripts/scrape-and-alert.js` - Utilise `TOP_10_SITES`
- ✅ `scripts/optimized-scraper.js` - Utilise `TOP_10_SITES`
- ✅ `scripts/website-health-checker.js` - Utilise `TOP_10_SITES`

Tous ces scripts continuent de fonctionner sans modification car ils importent `TOP_10_SITES` depuis `multi-site-crawler.js`, qui maintenant réexporte la liste depuis `scraping-sites.js`.

## 🎯 Avantages

1. **Centralisation**: Toutes les URLs sont maintenant dans un seul fichier
2. **Facilité de maintenance**: Pour ajouter/modifier un site, il suffit d'éditer `scraping-sites.js`
3. **URLs exactes**: Utilisation des URLs exactes fournies pour garantir que les bonnes pages sont scrapées
4. **Rétrocompatibilité**: Les exports `TOP_5_SITES`, `TOP_10_SITES`, et `TOP_20_SITES` sont maintenus pour la compatibilité

## 📝 Notes

- Toutes les URLs sont exactement telles que fournies par l'utilisateur (fragments inclus si présents)
- Chaque site a un `provider` unique pour l'identification dans la base de données
- Le statut de tous les sites est défini à `'active'`

## 🧪 Test

Pour vérifier que tout fonctionne:

```bash
node -e "import('./scripts/scraping-sites.js').then(m => console.log('Sites:', m.SCRAPING_SITES.length));"
```

Doit afficher: `Sites: 7`

