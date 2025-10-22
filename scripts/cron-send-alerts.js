#!/usr/bin/env node

const { sendAlertEmails } = require('./send-alerts-direct.js')

// Exécuter si appelé directement
if (require.main === module) {
  sendAlertEmails()
}

module.exports = { sendAlertEmails }
