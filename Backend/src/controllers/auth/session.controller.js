const { clearTokenCookie } = require('../../utils/jwt');
const { sendSuccess } = require('../../utils/response');

/**
 * POST /api/auth/logout
 * Limpia la cookie de sesión.
 */
const logout = async (req, res, next) => {
  try {
    clearTokenCookie(res);
    sendSuccess(res, null, 'Sesión cerrada correctamente');
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/auth/me
 * Retorna el usuario autenticado (inyectado por authenticate).
 */
const getMe = async (req, res, next) => {
  try {
    sendSuccess(res, req.user);
  } catch (error) {
    next(error);
  }
};

module.exports = { logout, getMe };
