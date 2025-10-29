// utils/device.js
const os = require('os');
const crypto = require('crypto');

/**
 * 🔑 Génère un identifiant unique pour le serveur (machine locale)
 * Combine le nom d’hôte et les adresses MAC principales.
 */
function getDeviceId() {
  const hostname = os.hostname();
  const networkInterfaces = os.networkInterfaces();
  const macs = Object.values(networkInterfaces)
    .flat()
    .filter(iface => !iface.internal && iface.mac)
    .map(iface => iface.mac)
    .join('-');

  const raw = `${hostname}-${macs}`;
  return crypto.createHash('sha256').update(raw).digest('hex').substring(0, 16);
}

/**
 * 🧠 Vérifie si la clé utilisée provient du même device
 * @param {string} storedDeviceId - Device enregistré lors de la génération
 * @returns {boolean} - true si le device correspond, sinon false
 */
function verifyDevice(storedDeviceId) {
  const currentDeviceId = getDeviceId();
  return currentDeviceId === storedDeviceId;
}

module.exports = { getDeviceId, verifyDevice };
