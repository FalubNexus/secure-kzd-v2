// Simulation d’un modèle utilisateur
const users = [];

function createUser(user) {
  users.push(user);
  return user;
}

function findUserByEmail(email) {
  return users.find(u => u.email === email);
}

module.exports = { createUser, findUserByEmail };
