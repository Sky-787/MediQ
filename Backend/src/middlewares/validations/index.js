/**
 * Barrel de validaciones.
 * Centraliza todas las validaciones de express-validator del proyecto.
 */
const { validateRegister, validateLogin } = require('./auth.validations');
const { validateCreateUser, validateUpdateUser } = require('./user.validations');

module.exports = {
  validateRegister,
  validateLogin,
  validateCreateUser,
  validateUpdateUser,
};
