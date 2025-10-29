// server.js
const express = require("express");
const bodyParser = require("body-parser");
require("dotenv").config();

const { authenticateApi } = require("./middleware/authenticateApi");
const keyRoutes = require("./routes/keyRoutes");

const app = express();
app.use(bodyParser.json());

// ✅ Middleware de log simple (pour voir les requêtes entrantes)
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});

// ✅ Routes publiques
app.use("/api/key", keyRoutes);

// ✅ Route de test publique
app.get("/", (req, res) => {
  res.json({ message: "Secure KZD API active ✅" });
});

// ✅ Middleware d’authentification (placé APRÈS les routes publiques)
app.use(authenticateApi);

// (Tu pourras ajouter ici des routes protégées si nécessaire)

// ✅ Démarrage du serveur
const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`✅ Secure KZD Server running on port ${PORT}`);
});
