const jwt = require('jsonwebtoken');
const { JWT_SECRET, JWT_EXPIRES_IN, COOKIE_NAME, COOKIE_MAX_AGE, NODE_ENV } = require('../config/env');

const generateToken = (userId) => {
  return jwt.sign({ id: userId }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
};

const sendTokenCookie = (res, token) => {
  const isProduction = NODE_ENV === 'production';
  res.cookie(COOKIE_NAME, token, {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? 'none' : 'lax',
    maxAge: COOKIE_MAX_AGE,
  });
};

const clearTokenCookie = (res) => {
  const isProduction = NODE_ENV === 'production';
  res.clearCookie(COOKIE_NAME, {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? 'none' : 'lax',
  });
};

module.exports = { generateToken, sendTokenCookie, clearTokenCookie };
