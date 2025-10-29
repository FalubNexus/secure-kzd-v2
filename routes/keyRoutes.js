// routes/keyRoutes.js
const express = require("express");
const router = express.Router();
const { authenticateApi } = require("../middleware/authenticateApi");
const { protectPersonalData, restorePersonalData } = require("../utils/security");
const { logAudit } = require("../utils/audit");
const { generateApiKey } = require("../controllers/keyController");

/**
 * ✅ Génération d'une clé API (publique)
 */
router.post("/generate", generateApiKey);

/**
 * ✅ Chiffrement (protégé)
 */
router.post("/encrypt", authenticateApi, (req, res) => {
  const apiKey = req.headers["x-api-key"];
  const data = req.body?.data || req.body || {}; // plus tolérant
  const ip =
    req.headers["x-forwarded-for"]?.split(",")[0]?.trim() ||
    req.socket?.remoteAddress ||
    req.connection?.remoteAddress ||
    "unknown";

  try {
    if (!data || Object.keys(data).length === 0) {
      throw new Error("Aucune donnée fournie (format attendu : { data: { ... } } ou { ... })");
    }

    const encryptedPayload = protectPersonalData(data, apiKey);

    logAudit({
      apiKey,
      ip,
      action: "ENCRYPT",
      status: "SUCCESS",
      message: `Chiffrement réussi pour ${Object.keys(data).join(", ")}`,
    });

    return res.json(encryptedPayload);
  } catch (error) {
    logAudit({
      apiKey,
      ip,
      action: "ENCRYPT",
      status: "FAIL",
      message: error.message,
    });
    return res.status(400).json({ error: "Erreur serveur : " + error.message });
  }
});

/**
 * ✅ Déchiffrement (protégé)
 */
router.post("/decrypt", authenticateApi, (req, res) => {
  const apiKey = req.headers["x-api-key"];
  const body = req.body;
  const ip =
    req.headers["x-forwarded-for"]?.split(",")[0]?.trim() ||
    req.socket?.remoteAddress ||
    req.connection?.remoteAddress ||
    "unknown";

  try {
    // 🧠 Accepte plusieurs formats possibles :
    let payload = {};
    if (body.encrypted && body.signature) {
      payload = body; // format complet { encrypted, signature }
    } else if (body.data && body.signature) {
      payload = { encrypted: body.data, signature: body.signature };
    } else if (body.encrypted && !body.signature) {
      payload = { encrypted: body.encrypted, signature: null };
    } else {
      throw new Error("Aucune donnée chiffrée détectée dans la requête");
    }

    const result = restorePersonalData(payload, apiKey);

    logAudit({
      apiKey,
      ip,
      action: "DECRYPT",
      status: "SUCCESS",
      message: "Déchiffrement réussi",
    });

    return res.json(result);
  } catch (error) {
    logAudit({
      apiKey,
      ip,
      action: "DECRYPT",
      status: "FAIL",
      message: error.message,
    });
    return res.status(400).json({ error: "Erreur serveur : " + error.message });
  }
});

module.exports = router;
