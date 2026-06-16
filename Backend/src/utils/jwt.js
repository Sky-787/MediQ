const jwt = require('jsonwebtoken');
const {
  JWT_SECRET,
  JWT_EXPIRES_IN,
  COOKIE_NAME,
  COOKIE_MAX_AGE,
  NODE_ENV,
} = require('../config/env');

const isSecureDeployment = () =>
  NODE_ENV === 'production' ||
  process.env.RENDER === 'true' ||
  Boolean(process.env.RENDER_EXTERNAL_URL);

const getCookieOptions = () => {
  const secure = isSecureDeployment();

  return {
    httpOnly: true,
    secure,
    sameSite: secure ? 'none' : 'lax',
  };
};

const generateToken = (userId) => {
  return jwt.sign({ id: userId }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
};

const sendTokenCookie = (res, token) => {
  res.cookie(COOKIE_NAME, token, {
    ...getCookieOptions(),
    maxAge: COOKIE_MAX_AGE,
  });
};

const clearTokenCookie = (res) => {
  res.clearCookie(COOKIE_NAME, {
    ...getCookieOptions(),
  });
};

module.exports = {
  generateToken,
  sendTokenCookie,
  clearTokenCookie,
  isSecureDeployment,
};
