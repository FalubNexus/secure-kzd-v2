// server.js
const express = require("express");
const bodyParser = require("body-parser");
const path = require("path");
const cors = require("cors");
require("dotenv").config();

const keyRoutes = require("./routes/keyRoutes");

const app = express();
app.use(bodyParser.json());
app.set("trust proxy", true);

// ✅ Activer CORS pour permettre les requêtes depuis le navigateur
app.use(
  cors({
    origin: "*", // Autorise tout domaine (utile pour test)
    methods: ["GET", "POST"],
    allowedHeaders: ["Content-Type", "x-api-key"],
  })
);

// ✅ Logger simple pour debug
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});

// ✅ Servir les fichiers HTML / JS du dossier public
app.use(express.static(path.join(__dirname, "public")));

// ✅ Routes principales pour les API keys
app.use("/api/key", keyRoutes);

// ✅ Route GET de test
app.get("/", (req, res) => {
  res.json({ message: "Secure KZD API active ✅" });
});

// ✅ Gestion d’erreur 404 pour autres routes
app.use((req, res) => {
  res.status(404).json({ error: "Route introuvable" });
});

// ✅ Démarrage du serveur
const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`✅ Secure KZD Server running on port ${PORT}`);
});
