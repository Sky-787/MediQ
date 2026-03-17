const User = require('../models/User');
const { generateToken, sendTokenCookie, clearTokenCookie } = require('../utils/jwt');
const { sendSuccess, sendCreated } = require('../utils/response');

// POST /api/auth/register
const register = async (req, res, next) => {
  try {
    const { nombre, email, contrasena, rol } = req.body;

    // 1. Verificar que el email no exista
    const existe = await User.findOne({ email });
    if (existe) {
      return res.status(400).json({ success: false, message: 'El email ya está registrado' });
    }

    // 2. Crear usuario (el hash de contraseña es automático en pre-save)
    const user = await User.create({ nombre, email, contrasena, rol });

    // 3. Generar JWT y enviarlo en cookie HTTP-only
    const token = generateToken(user._id);
    sendTokenCookie(res, token);

    // 4. Responder con datos del usuario sin contraseña
    sendCreated(res, { _id: user._id, nombre: user.nombre, email: user.email, rol: user.rol });
  } catch (error) {
    next(error);
  }
};

// POST /api/auth/login
const login = async (req, res, next) => {
  try {
    const { email, contrasena } = req.body;

    // 1. Buscar usuario por email incluyendo contraseña
    const user = await User.findOne({ email }).select('+contrasena');
    if (!user) {
      return res.status(401).json({ success: false, message: 'Credenciales inválidas' });
    }

    // 2. Comparar contraseña
    const valida = await user.compararContrasena(contrasena);
    if (!valida) {
      return res.status(401).json({ success: false, message: 'Credenciales inválidas' });
    }

    // 3. Generar JWT y enviarlo en cookie HTTP-only
    const token = generateToken(user._id);
    sendTokenCookie(res, token);

    // 4. Responder con datos del usuario
    sendSuccess(res, { _id: user._id, nombre: user.nombre, email: user.email, rol: user.rol });
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
