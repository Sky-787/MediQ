const { Router } = require('express');
const { body } = require('express-validator');
const { register, login, logout, getMe } = require('../controllers/auth.controller');
const { authenticate } = require('../middlewares/auth.middleware');
const { validateRequest } = require('../utils/validators');

const router = Router();

router.post(
  '/register',
  [
    body('nombre').trim().notEmpty().withMessage('El nombre es obligatorio'),
    body('email').isEmail().withMessage('Email inválido').normalizeEmail(),
    body('contrasena').isLength({ min: 6 }).withMessage('La contraseña debe tener al menos 6 caracteres'),
    body('rol').optional().isIn(['paciente', 'medico', 'admin']).withMessage('Rol inválido'),
    validateRequest,
  ],
  register
);

router.post(
  '/login',
  [
    body('email').isEmail().withMessage('Email inválido').normalizeEmail(),
    body('contrasena').notEmpty().withMessage('La contraseña es obligatoria'),
    validateRequest,
  ],
  login
);

router.post('/logout', authenticate, logout);
router.get('/me', authenticate, getMe);

module.exports = router;
