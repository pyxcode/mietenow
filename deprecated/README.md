# Deprecated Scripts

This folder contains scripts that are no longer needed in the current optimized setup.

## What's Here

### Old Cron Scripts
- `cron-*.js` - Old individual cron scripts (replaced by `scrape-and-alert.js`)
- `master-cron.js` - Complex master cron (replaced by simpler approach)
- `cron-local-runner.js` - Local cron runner (not needed for production)

### Test Scripts
- `test-*.js` - Various test scripts
- `test-websites.js` - Website testing script (useful for debugging but not production)

### One-time Use Scripts
- `clean-database.js` - Database cleanup (replaced by new version)
- `update-coordinates.js` - One-time coordinate update script
- `cleanup-unused-files.js` - File cleanup script (already executed)

### Alert Scripts
- `send-alerts-direct.js` - Old alert system (integrated into main script)

## Current Active Scripts

The current optimized setup only uses:

1. **`scripts/scrape-and-alert.js`** - Main scraping and alerting script (runs every minute)
2. **`scripts/cleanup-database.js`** - Database cleanup script (runs every night)
3. **`scripts/http-only-crawler.js`** - Core crawler engine
4. **`scripts/multi-site-crawler.js`** - Site configuration and orchestration

## Why These Are Deprecated

- **Simplified Architecture**: The new setup uses only 2 main scripts instead of 10+
- **Rate Limiting**: Built-in rate limiting prevents being blocked
- **Better Error Handling**: More robust error handling and recovery
- **Optimized for Render**: Designed specifically for Render deployment
- **Real-time Alerts**: Alerts sent immediately after scraping, not in separate cron jobs

## If You Need These Scripts

These scripts are kept for reference and can be restored if needed:

```bash
# Move back to scripts folder
mv deprecated/script-name.js scripts/

# Or copy specific functionality
cp deprecated/script-name.js scripts/new-script-name.js
```

## Monitoring

The new monitoring dashboard is available at `/monitoring` and provides:
- Real-time scraping statistics
- Hourly charts for each website
- Upload vs scraped comparisons
- Website health status
