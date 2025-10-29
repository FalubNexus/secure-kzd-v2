const fs = require("fs");
const path = require("path");
const { genApiKey } = require("../utils/keygen");

const KEYS_FILE = path.join(__dirname, "../keys.json");
let keys = [];

// Charger les clés sauvegardées au démarrage
if (fs.existsSync(KEYS_FILE)) {
  keys = JSON.parse(fs.readFileSync(KEYS_FILE, "utf8"));
}

function saveKeys() {
  fs.writeFileSync(KEYS_FILE, JSON.stringify(keys, null, 2));
}

function generateKazadiKey(clientName = "anonymous") {
  const { apiKey, keyHash, last4 } = genApiKey();
  const entry = {
    clientName,
    apiKey,
    keyHash,
    last4,
    createdAt: new Date().toISOString(),
  };
  keys.push(entry);
  saveKeys();
  console.log(`🔑 Nouvelle clé enregistrée : ${apiKey}`);
  return apiKey;
}

function validateApiKey(key) {
  return keys.some(k => k.apiKey === key);
}

module.exports = { generateKazadiKey, validateApiKey };
