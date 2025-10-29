// controllers/auditController.js
const CryptoJS = require("crypto-js");

let auditLogs = [];

/**
 * Journalise un accès à des données identitaires
 */
exports.logAccess = (req, res) => {
  const apiKey = req.headers["x-api-key"];
  const { action, target } = req.body;

  if (!action || !target) {
    return res.status(400).json({ error: "Paramètres manquants" });
  }

  const record = `${Date.now()}|${apiKey}|${action}|${target}`;
  const hash = CryptoJS.SHA256(record).toString();

  const logEntry = {
    timestamp: new Date().toISOString(),
    apiKey,
    action,
    target,
    signature: hash,
  };

  auditLogs.push(logEntry);
  console.log("🧾 Audit log:", logEntry);

  return res.json({
    status: "logged",
    signature: hash,
  });
};

/**
 * Récupère l’historique des accès (pour admin uniquement)
 */
exports.getLogs = (req, res) => {
  res.json({ logs: auditLogs });
};
