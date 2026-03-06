const { validationResult } = require('express-validator');

/**
 * Verifica los resultados de express-validator.
 * Úsalo al final de cada array de validaciones en las rutas.
 */
const validateRequest = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Error de validación',
      errors: errors.array().map((e) => ({ field: e.path, message: e.msg })),
    });
  }
  next();
};

module.exports = { validateRequest };
