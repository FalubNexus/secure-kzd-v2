function authenticateUser(req, res, next) {
  if (!req.user) {
    return res.status(401).json({ error: "Utilisateur non authentifié" });
  }
  next();
}

module.exports = { authenticateUser };
