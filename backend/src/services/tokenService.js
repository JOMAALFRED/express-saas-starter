const jwt    = require('jsonwebtoken');
const config = require('../config/jwt');

function generateAccessToken(user) {
  return jwt.sign(
    {
      user_id:   user.id,
      tenant_id: user.tenant_id,
      role:      user.role,
      email:     user.email,
    },
    config.secret,
    { expiresIn: config.accessExpiry }
  );
}

function generateRefreshToken(user) {
  return jwt.sign(
    { user_id: user.id },
    config.secret,
    { expiresIn: config.refreshExpiry }
  );
}

function verifyToken(token) {
  return jwt.verify(token, config.secret);
}

module.exports = { generateAccessToken, generateRefreshToken, verifyToken };
