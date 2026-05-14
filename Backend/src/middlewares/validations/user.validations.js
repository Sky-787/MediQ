const { body } = require('express-validator');
const { validateRequest } = require('../../utils/validators');

/**
 * Validaciones para PUT /api/users/:id
 */
const validateUpdateUser = [
  body('nombre')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('El nombre no puede estar vacío'),
  body('email')
    .optional()
    .isEmail()
    .withMessage('Email inválido')
    .normalizeEmail(),
  validateRequest,
];

module.exports = { validateUpdateUser };
