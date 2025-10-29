// utils/audit.js
const fs = require('fs');
const path = require('path');

const LOG_FILE = path.join(__dirname, '../logs/audit.json');

/**
 * 🧠 Enregistre un événement d'audit dans le fichier logs/audit.json
 * @param {Object} entry - { apiKey, action, ip, status, message }
 */
function logAudit(entry) {
  const now = new Date().toISOString();
  const data = {
    timestamp: now,
    ...entry,
  };

  try {
    let logs = [];
    if (fs.existsSync(LOG_FILE)) {
      const existing = fs.readFileSync(LOG_FILE, 'utf8');
      logs = existing ? JSON.parse(existing) : [];
    }
    logs.push(data);
    fs.writeFileSync(LOG_FILE, JSON.stringify(logs, null, 2));
  } catch (err) {
    console.error('❌ Erreur lors de l’écriture du journal d’audit :', err);
  }
}

module.exports = { logAudit };
