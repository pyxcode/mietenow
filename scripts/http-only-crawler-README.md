# HTTP-Only Real Estate Crawler

A pure HTTP crawler for real estate listings that works without JavaScript execution or headless browsers.

## Features

- ✅ **HTTP-only**: Uses GET requests only, no JavaScript execution
- ✅ **Robots.txt compliance**: Respects robots.txt disallow rules
- ✅ **Sitemap parsing**: Automatically finds and parses sitemap.xml files
- ✅ **Smart discovery**: Finds listing pages from homepage if no sitemap exists
- ✅ **JSON-LD extraction**: Prefers structured data (schema.org) when available
- ✅ **HTML fallback**: Falls back to HTML parsing when JSON-LD is unavailable
- ✅ **Pagination support**: Automatically follows pagination links
- ✅ **Unified schema**: Normalizes all listings to a consistent format

## Usage

```bash
node scripts/http-only-crawler.js <root-url>
```

### Example

```bash
node scripts/http-only-crawler.js https://www.immobilienscout24.de
```

## Output Schema

Each listing is normalized to this structure:

```json
{
  "price": 1200,                    // number: monthly rent in EUR
  "surface": 65,                    // number: surface in square meters
  "rooms": 2,                       // number: number of rooms
  "type": "apartment",              // string: "studio"|"apartment"|"WG"|"house"|"other"
  "furnished": false,               // boolean: furnished or not
  "location": "Berlin",             // string: city or town
  "district": "Mitte",              // string|null: district/neighborhood
  "address": "Main St 123",         // string|null: full address
  "lat": 52.52,                     // number|null: latitude
  "lng": 13.405,                    // number|null: longitude
  "description": "...",              // string|null: listing description
  "pictures": ["url1", "url2"],     // string[]: array of image URLs
  "scrapedAt": "2024-01-01T12:00:00Z", // string: ISO timestamp
  "url": "https://..."              // string: original listing URL
}
```

## How It Works

1. **Robots.txt Check**: Checks `/robots.txt` and respects Disallow rules
2. **Sitemap Discovery**: Looks for `/sitemap.xml` and extracts listing URLs
3. **Homepage Discovery**: If no sitemap, searches homepage for listing links
4. **Index Detection**: Identifies listings index pages (>8 listing blocks)
5. **Pagination**: Follows pagination links to collect all listing URLs
6. **Extraction**: For each listing:
   - First tries JSON-LD structured data
   - Falls back to HTML parsing with regex patterns
7. **Normalization**: Converts all data to unified schema

## Extraction Methods

### JSON-LD (Preferred)
- Extracts from `<script type="application/ld+json">`
- Maps schema.org fields:
  - `offers.price` → price
  - `floorSize.value` → surface
  - `numberOfRooms` → rooms
  - `address.addressLocality` → location
  - `geo.latitude/longitude` → lat/lng

### HTML Fallback
- **Price**: `/(€|EUR|Euro)\s*([\d.,]+)/i`
- **Surface**: `/([\d.,]+)\s*(m²|qm|m2)/i`
- **Rooms**: `/(\d+)\s*(Zimmer|rooms|pièces)/i`
- **Type**: Keywords in title/description ("WG", "Studio", "Apartment", "Haus")
- **Furnished**: Keywords ("möbliert", "furnished", "unmöbliert")
- **Location**: Meta tags (`og:locality`, `og:title`)

## Rate Limiting

- 500ms delay between listing page requests
- 1000ms delay between pagination requests
- Respects robots.txt disallow rules

## Output

Results are saved to `crawl-results-<timestamp>.json` with:
- `totalUrls`: Total listing URLs found
- `listings`: Array of extracted listings
- `errors`: Array of errors encountered

## Notes

- Limits to 50 listings per run for testing (modify line 643 to change)
- Works best with sites that expose listings via sitemap or HTML
- Some sites may require JavaScript for full functionality (will skip those)

