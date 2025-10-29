const express = require("express");
const { logAccess, getLogs } = require("../controllers/auditController");

const router = express.Router();

// Journaliser un accès (action: VIEW_PROFILE, UPDATE_EMAIL, etc.)
router.post("/log", logAccess);

// Récupérer les logs (réservé à l’administrateur)
router.get("/all", getLogs);

module.exports = router;
