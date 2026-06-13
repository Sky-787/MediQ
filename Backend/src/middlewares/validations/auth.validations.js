const { body } = require('express-validator');
const { validateRequest } = require('../../utils/validators');

/**
 * Validaciones para POST /api/auth/register
 */
const validateRegister = [
  body('nombre')
    .trim()
    .notEmpty()
    .withMessage('El nombre es obligatorio'),
  body('email')
    .isEmail()
    .withMessage('Email inválido')
    .normalizeEmail(),
  body('contrasena')
    .isLength({ min: 6 })
    .withMessage('La contraseña debe tener al menos 6 caracteres'),
  body('rol')
    .optional()
    .isIn(['paciente', 'medico', 'admin'])
    .withMessage('Rol inválido'),
  validateRequest,
];

/**
 * Validaciones para POST /api/auth/login
 */
const validateLogin = [
  body('email')
    .isEmail()
    .withMessage('Email inválido')
    .normalizeEmail(),
  body('contrasena')
    .notEmpty()
    .withMessage('La contraseña es obligatoria'),
  validateRequest,
];

module.exports = { validateRegister, validateLogin };
