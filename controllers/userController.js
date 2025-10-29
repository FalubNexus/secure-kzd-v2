const { createUser, findUserByEmail } = require("../models/userModel");

exports.registerUser = (req, res) => {
  const { email, nom, prenom } = req.body;
  if (findUserByEmail(email)) {
    return res.status(400).json({ error: "Utilisateur déjà existant" });
  }
  const user = createUser({ email, nom, prenom });
  return res.json({ status: "created", user });
};
