/**
 * @deprecated
 * Este archivo ha sido refactorizado. Usa en su lugar:
 *
 *   const { register }       = require('./auth/register.controller');
 *   const { login }          = require('./auth/login.controller');
 *   const { logout, getMe }  = require('./auth/session.controller');
 *
 * O el barrel completo:
 *   const { register, login, logout, getMe } = require('./auth');
 */
module.exports = require('./auth');
