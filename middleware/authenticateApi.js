const { validateApiKey } = require('../controllers/keyController');

const authenticateApi = (req, res, next) => {
  const apiKey = req.headers['x-api-key'];
  if (!apiKey || !validateApiKey(apiKey)) {
    return res.status(403).json({ error: 'Clé API invalide ou expirée' });
  }
  next();
};

module.exports = { authenticateApi };
