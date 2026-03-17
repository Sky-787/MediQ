const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { JWT_SECRET, COOKIE_NAME } = require('../config/env');

const authenticate = async (req, res, next) => {
  try {
    const token = req.cookies?.[COOKIE_NAME];

    if (!token) {
      return res.status(401).json({ success: false, message: 'Acceso denegado. Token no encontrado.' });
    }

    const decoded = jwt.verify(token, JWT_SECRET);
    const user = await User.findById(decoded.id).select('-contrasena');

    if (!user) {
      return res.status(401).json({ success: false, message: 'Token inválido. Usuario no encontrado.' });
    }

    req.user = user;
    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ success: false, message: 'Token inválido.' });
    }
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ success: false, message: 'Token expirado. Inicia sesión nuevamente.' });
    }
    next(error);
  }
};

module.exports = { authenticate };
