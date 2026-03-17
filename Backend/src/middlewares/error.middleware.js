const { NODE_ENV } = require('../config/env');

/**
 * Manejador global de errores.
 * Debe ser el ÚLTIMO middleware registrado en app.js.
 */
const errorHandler = (err, req, res, next) => {
  let statusCode = err.statusCode || err.status || 500;
  let message = err.message || 'Error interno del servidor';

  // Error de validación de Mongoose
  if (err.name === 'ValidationError') {
    statusCode = 400;
    message = Object.values(err.errors).map((e) => e.message).join(', ');
  }

  // Clave duplicada en MongoDB
  if (err.code === 11000) {
    statusCode = 409;
    const field = Object.keys(err.keyValue || {})[0];
    message = `Ya existe un registro con ese ${field}.`;
  }

  // ID inválido
  if (err.name === 'CastError') {
    statusCode = 400;
    message = `ID inválido: ${err.value}`;
  }

  const response = { success: false, message };
  if (NODE_ENV === 'development') response.stack = err.stack;

  res.status(statusCode).json(response);
};

/**
 * Middleware para rutas no encontradas (404).
 */
const notFound = (req, res, next) => {
  const error = new Error(`Ruta no encontrada: ${req.originalUrl}`);
  error.statusCode = 404;
  next(error);
};

module.exports = { errorHandler, notFound };
