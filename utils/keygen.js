const crypto = require('crypto');

/**
 * 🔢 Génère un ID court (lisible, base36)
 */
function genKeyId(length = 22) {
  const buf = crypto.randomBytes(16).toString('hex'); // 32 caractères hex
  return parseInt(buf, 16).toString(36).slice(0, length);
}

/**
 * 🔐 Génère une API Key KAZADI identique à la première version
 * Exemple : kzd-sk-f7a92d9e2bcbd2329b87f4a1c6d57e90
 */
function genApiKey() {
  const raw = crypto.randomBytes(16).toString('hex'); // 128 bits
  const apiKey = `kzd-sk-${raw}`;
  const keyHash = crypto.createHash('sha256').update(apiKey, 'utf8').digest('hex');
  const last4 = keyHash.slice(-4);
  return { apiKey, keyHash, last4 };
}

module.exports = { genKeyId, genApiKey };
