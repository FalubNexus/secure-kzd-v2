const CryptoJS = require("crypto-js");

/** Génération d'une clé dynamique via formule de Kazadi (simplifiée) */
function generateKZDKey(seed) {
  const now = Date.now().toString();
  const base = seed + now;
  const hash = CryptoJS.SHA256(base).toString();
  return hash.substring(0, 32); // AES-256
}

/** Protection des données personnelles */
function protectPersonalData(data, seed = "secure-kzd-seed") {
  const key = generateKZDKey(seed);

  return {
    nom: data.nom ? CryptoJS.AES.encrypt(data.nom, key).toString() : null,
    prenom: data.prenom ? CryptoJS.AES.encrypt(data.prenom, key).toString() : null,
    adresse: data.adresse ? CryptoJS.AES.encrypt(data.adresse, key).toString() : null,
    email: data.email ? CryptoJS.AES.encrypt(data.email, key).toString() : null,
    telephone: data.telephone ? CryptoJS.AES.encrypt(data.telephone, key).toString() : null,
    dob: data.dob ? CryptoJS.SHA256(data.dob).toString() : null, // Hash irréversible
    medical: data.medical ? CryptoJS.AES.encrypt(data.medical, key).toString() : null
  };
}

/** Restauration des données (sauf dob) */
function restorePersonalData(encrypted, seed = "secure-kzd-seed") {
  const key = generateKZDKey(seed);

  return {
    nom: encrypted.nom ? CryptoJS.AES.decrypt(encrypted.nom, key).toString(CryptoJS.enc.Utf8) : null,
    prenom: encrypted.prenom ? CryptoJS.AES.decrypt(encrypted.prenom, key).toString(CryptoJS.enc.Utf8) : null,
    adresse: encrypted.adresse ? CryptoJS.AES.decrypt(encrypted.adresse, key).toString(CryptoJS.enc.Utf8) : null,
    email: encrypted.email ? CryptoJS.AES.decrypt(encrypted.email, key).toString(CryptoJS.enc.Utf8) : null,
    telephone: encrypted.telephone ? CryptoJS.AES.decrypt(encrypted.telephone, key).toString(CryptoJS.enc.Utf8) : null,
    dob: "⚠️ Non réversible",
    medical: encrypted.medical ? CryptoJS.AES.decrypt(encrypted.medical, key).toString(CryptoJS.enc.Utf8) : null
  };
}

module.exports = { protectPersonalData, restorePersonalData };
