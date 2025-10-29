// controllers/keyController.js
const crypto = require('crypto');
const bcrypt = require('bcryptjs');
const fs = require('fs');
const path = require('path');
const { getDeviceId } = require('../utils/device');

const KEYS_FILE = path.join(__dirname, '../keys.json');
const SALT_ROUNDS = 12;
const SERVER_SECRET = process.env.SERVER_SECRET || 'default-kzd-secret';
const KEY_LIFETIME_MS = 60 * 60 * 1000; // ⏳ 1 heure

let ApiKeys = new Map();

/**
 * 🔐 Crée une signature cryptographique SHA-256 pour chaque clé
 */
function signEntry(entry) {
  const base = `${entry.apiKey}-${entry.deviceId}-${entry.clientSecretHash}-${SERVER_SECRET}`;
  return crypto.createHash('sha256').update(base, 'utf8').digest('hex');
}

/**
 * 💾 Sauvegarde les clés sur disque
 */
function saveKeys() {
  const data = Array.from(ApiKeys.values());
  fs.writeFileSync(KEYS_FILE, JSON.stringify(data, null, 2));
}

/**
 * ♻️ Charge les clés valides (non expirées et correctement signées)
 */
function loadKeys() {
  if (!fs.existsSync(KEYS_FILE)) return;
  try {
    const saved = JSON.parse(fs.readFileSync(KEYS_FILE, 'utf8'));
    const now = Date.now();

    saved.forEach(entry => {
      const expectedSig = signEntry(entry);
      const expired = now - entry.createdAt > KEY_LIFETIME_MS;

      if (expired) {
        console.warn(`🕒 Clé expirée ignorée : ${entry.apiKey}`);
        return;
      }

      if (entry.signature !== expectedSig) {
        console.warn(`⚠️ Signature invalide détectée pour ${entry.apiKey}`);
        return;
      }

      ApiKeys.set(entry.apiKey, entry);
    });

    console.log(`✅ ${ApiKeys.size} clés valides restaurées depuis keys.json`);
  } catch (err) {
    console.error('❌ Erreur lors du chargement de keys.json :', err);
  }
}

loadKeys();

/**
 * 🧠 Génère une nouvelle clé API (expire après 1 h)
 */
const generateApiKey = async (req, res) => {
  const { clientSecret } = req.body;
  if (!clientSecret || clientSecret.length < 8) {
    return res.status(400).json({ error: 'clientSecret requis (min. 8 caractères)' });
  }

  const apiKey = 'kzd-sk-' + crypto.randomBytes(16).toString('hex');
  const deviceId = getDeviceId();
  const clientSecretHash = await bcrypt.hash(clientSecret, SALT_ROUNDS);
  const createdAt = Date.now();
  const expiresAt = createdAt + KEY_LIFETIME_MS;

  const entry = { apiKey, deviceId, clientSecretHash, createdAt, expiresAt };
  entry.signature = signEntry(entry);

  ApiKeys.set(apiKey, entry);
  saveKeys();

  console.log(`🔑 Nouvelle clé créée : ${apiKey} (expire dans 1 h)`);
  res.json({ apiKey, deviceId, expiresAt });
};

/**
 * ✅ Vérifie si une clé API est valide et non expirée
 */
const validateApiKey = apiKey => {
  const entry = ApiKeys.get(apiKey);
  if (!entry) return false;

  const now = Date.now();
  if (now > entry.expiresAt) {
    console.warn(`⏳ Clé expirée : ${apiKey}`);
    ApiKeys.delete(apiKey);
    saveKeys();
    return false;
  }

  const expectedSig = signEntry(entry);
  return entry.signature === expectedSig;
};

module.exports = { generateApiKey, validateApiKey, ApiKeys };
