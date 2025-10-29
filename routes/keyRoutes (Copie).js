// routes/keyRoutes.js
const express = require("express");
const router = express.Router();
const { authenticateApi } = require("../middleware/authenticateApi");
const { protectPersonalData, restorePersonalData } = require("../utils/security");
const { logAudit } = require("../utils/audit");
const { validateApiKey } = require("../controllers/keyController");

// ✅ Route publique : création de clé
const { generateApiKey } = require("../controllers/keyController");
router.post("/generate", generateApiKey);

// ✅ Route protégée : chiffrement
router.post("/encrypt", authenticateApi, (req, res) => {
  const { data } = req.body;
  const apiKey = req.headers["x-api-key"];
  const ip = req.ip || req.connection.remoteAddress;

  try {
    if (!data) throw new Error("Aucune donnée fournie");
    const encrypted = protectPersonalData(data);

    logAudit({
      apiKey,
      ip,
      action: "ENCRYPT",
      status: "SUCCESS",
      message: `Chiffrement réussi pour ${Object.keys(data).join(", ")}`,
    });

    return res.json({ encrypted });
  } catch (error) {
    logAudit({
      apiKey,
      ip,
      action: "ENCRYPT",
      status: "FAIL",
      message: error.message,
    });
    return res.status(400).json({ error: error.message });
  }
});

// ✅ Route protégée : déchiffrement
router.post("/decrypt", authenticateApi, (req, res) => {
  const { encrypted } = req.body;
  const apiKey = req.headers["x-api-key"];
  const ip = req.ip || req.connection.remoteAddress;

  try {
    if (!encrypted) throw new Error("Aucune donnée chiffrée fournie");
    const decrypted = restorePersonalData(encrypted);

    logAudit({
      apiKey,
      ip,
      action: "DECRYPT",
      status: "SUCCESS",
      message: "Déchiffrement réussi",
    });

    return res.json({ decrypted });
  } catch (error) {
    logAudit({
      apiKey,
      ip,
      action: "DECRYPT",
      status: "FAIL",
      message: error.message,
    });
    return res.status(400).json({ error: error.message });
  }
});

module.exports = router;
