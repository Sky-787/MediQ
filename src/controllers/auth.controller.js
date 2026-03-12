const User = require('../models/User');
const { generateToken, sendTokenCookie, clearTokenCookie } = require('../utils/jwt');
const { sendSuccess, sendCreated } = require('../utils/response');

// POST /api/auth/register
const register = async (req, res, next) => {
  try {
    // TODO: 1. Verificar que el email no exista
    //       2. Crear usuario (el hash de contraseña es automático en pre-save)
    //       3. Generar JWT y enviarlo en cookie HTTP-only
    //       4. Responder con datos del usuario sin contraseña
    res.status(501).json({ success: false, message: 'Por implementar: POST /api/auth/register' });
  } catch (error) {
    next(error);
  }
};

// POST /api/auth/login
const login = async (req, res, next) => {
  try {
    // TODO: 1. Buscar usuario por email (usar .select('+contrasena'))
    //       2. Comparar contraseña con user.compararContrasena()
    //       3. Generar JWT y enviarlo en cookie HTTP-only
    //       4. Responder con datos del usuario
    res.status(501).json({ success: false, message: 'Por implementar: POST /api/auth/login' });
  } catch (error) {
    next(error);
  }
};

// POST /api/auth/logout
const logout = async (req, res, next) => {
  try {
    clearTokenCookie(res);
    sendSuccess(res, null, 'Sesión cerrada correctamente');
  } catch (error) {
    next(error);
  }
};

// GET /api/auth/me
const getMe = async (req, res, next) => {
  try {
    sendSuccess(res, req.user);
  } catch (error) {
    next(error);
  }
};

module.exports = { register, login, logout, getMe };
