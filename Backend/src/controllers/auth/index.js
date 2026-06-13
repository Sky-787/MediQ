/**
 * Barrel de controladores de autenticación.
 * Importar desde aquí para mantener rutas limpias.
 *
 * Ejemplo:
 *   const { register, login, logout, getMe } = require('../controllers/auth');
 */
const { register } = require('./register.controller');
const { login } = require('./login.controller');
const { logout, getMe } = require('./session.controller');

module.exports = { register, login, logout, getMe };
