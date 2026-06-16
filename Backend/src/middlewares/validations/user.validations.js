const { body } = require('express-validator');
const { validateRequest } = require('../../utils/validators');

const ALLOWED_SPECIALTIES = [
  'Medicina general',
  'Cardiologia',
  'Pediatria',
  'Dermatologia',
  'Ginecologia',
  'Neurologia',
];

/**
 * Validaciones para POST /api/users (solo admin)
 */
const validateCreateUser = [
  body('nombre')
    .trim()
    .notEmpty()
    .withMessage('El nombre es obligatorio'),
  body('email')
    .isEmail()
    .withMessage('Email inválido')
    .normalizeEmail(),
  body('contrasena')
    .isLength({ min: 8 })
    .withMessage('La contraseña debe tener al menos 8 caracteres'),
  body('rol')
    .isIn(['paciente', 'medico', 'admin'])
    .withMessage('Rol inválido'),
  body('especialidad')
    .if(body('rol').equals('medico'))
    .notEmpty()
    .withMessage('La especialidad es obligatoria para usuarios médicos')
    .bail()
    .isIn(ALLOWED_SPECIALTIES)
    .withMessage('Especialidad inválida'),
  validateRequest,
];

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

module.exports = { validateCreateUser, validateUpdateUser, ALLOWED_SPECIALTIES };
