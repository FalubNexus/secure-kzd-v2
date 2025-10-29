// utils/security.js
const CryptoJS = require("crypto-js");

/**
 * Génère une clé AES-256 stable à partir de la clé API
 */
function deriveKZDKey(apiKey = "secure-kzd-seed") {
  return CryptoJS.SHA256(apiKey); // WordArray (clé AES-256)
}

/**
 * 🔒 Chiffrement des données personnelles avec signature d'intégrité
 */
function protectPersonalData(data, apiKey = "secure-kzd-seed") {
  const key = deriveKZDKey(apiKey);
  const encrypted = {};
  const fields = [
    "nom",
    "prenom",
    "adresse",
    "email",
    "telephone",
    "dob",
    "medical",
  ];

  // Chiffrement
  for (const field of fields) {
    const value = data[field];
    if (!value) {
      encrypted[field] = null;
      continue;
    }

    if (field === "dob") {
      encrypted[field] = CryptoJS.SHA256(value).toString(); // non réversible
    } else {
      const iv = CryptoJS.lib.WordArray.random(16);
      const cipher = CryptoJS.AES.encrypt(CryptoJS.enc.Utf8.parse(value), key, {
        iv,
        mode: CryptoJS.mode.CBC,
        padding: CryptoJS.pad.Pkcs7,
      });
      encrypted[field] = JSON.stringify({
        iv: iv.toString(CryptoJS.enc.Hex),
        ciphertext: cipher.ciphertext.toString(CryptoJS.enc.Hex),
      });
    }
  }

  // Calcul de la signature KZD
  const signature = CryptoJS.SHA256(
    JSON.stringify(encrypted) + apiKey
  ).toString();

  return { encrypted, signature };
}

/**
 * 🔓 Déchiffrement + vérification d'intégrité
 */
function restorePersonalData(payload, apiKey = "secure-kzd-seed") {
  const { encrypted, signature } = payload;
  const key = deriveKZDKey(apiKey);
  const decrypted = {};
  const fields = [
    "nom",
    "prenom",
    "adresse",
    "email",
    "telephone",
    "dob",
    "medical",
  ];

  // Vérification d’intégrité
  const expectedSignature = CryptoJS.SHA256(
    JSON.stringify(encrypted) + apiKey
  ).toString();

  if (signature && expectedSignature !== signature) {
    throw new Error("Signature d’intégrité invalide — données corrompues");
  }

  // Déchiffrement
  for (const field of fields) {
    const value = encrypted[field];
    if (!value) {
      decrypted[field] = null;
      continue;
    }

    if (field === "dob") {
      decrypted[field] = "⚠️ Non réversible";
    } else {
      try {
        const parsed = JSON.parse(value);
        const iv = CryptoJS.enc.Hex.parse(parsed.iv);
        const ciphertext = CryptoJS.enc.Hex.parse(parsed.ciphertext);
        const decryptedBytes = CryptoJS.AES.decrypt(
          { ciphertext },
          key,
          { iv, mode: CryptoJS.mode.CBC, padding: CryptoJS.pad.Pkcs7 }
        );
        decrypted[field] =
          decryptedBytes.toString(CryptoJS.enc.Utf8) || "⚠️ Erreur déchiffrement";
      } catch {
        decrypted[field] = "⚠️ Erreur déchiffrement";
      }
    }
  }

  return { decrypted, verified: true };
}

module.exports = { protectPersonalData, restorePersonalData };
