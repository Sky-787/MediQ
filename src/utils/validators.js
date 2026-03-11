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

/**
 * Valida el campo `motivo` de una cita.
 * - No puede estar vacío o ausente.
 * - Debe tener al menos 10 caracteres.
 * Retorna un objeto { valid, message } para usarse en controladores.
 */
const validateMotivo = (motivo) => {
  if (!motivo || typeof motivo !== 'string' || motivo.trim().length === 0) {
    return { valid: false, message: 'El motivo de la cita es obligatorio' };
  }
  if (motivo.trim().length < 10) {
    return { valid: false, message: 'El motivo debe tener al menos 10 caracteres' };
  }
  return { valid: true };
};

module.exports = { validateRequest, validateMotivo };
