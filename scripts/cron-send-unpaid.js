#!/usr/bin/env node

const { sendUnpaidUserEmails } = require('./send-unpaid-direct.js')

// Exécuter si appelé directement
if (require.main === module) {
  sendUnpaidUserEmails()
}

module.exports = { sendUnpaidUserEmails }
