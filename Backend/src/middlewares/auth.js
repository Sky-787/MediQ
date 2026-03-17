const jwt = require('jsonwebtoken');

// ─────────────────────────────────────────────
//  Middleware: verificar JWT en cada petición
// ─────────────────────────────────────────────
function verificarToken(req, res, next) {
  try {
    // 1. Extraer el header Authorization
    const authHeader = req.headers['authorization'];

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        message: 'Acceso denegado. Token no proporcionado.',
      });
    }

    // 2. Aislar el token (quitar el prefijo "Bearer ")
    const token = authHeader.split(' ')[1];

    // 3. Verificar y decodificar
    const payload = jwt.verify(token, process.env.JWT_SECRET);

    // 4. Adjuntar los datos del usuario al request para uso posterior
    req.usuario = {
      id:     payload.sub,
      email:  payload.email,
      nombre: payload.nombre,
      rol:    payload.rol,
    };

    next();

  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({ message: 'Sesión expirada. Inicia sesión de nuevo.' });
    }
    if (err.name === 'JsonWebTokenError') {
      return res.status(401).json({ message: 'Token inválido.' });
    }

    console.error('[AuthMiddleware] Error inesperado:', err);
    return res.status(500).json({ message: 'Error interno al verificar autenticación.' });
  }
}

// ─────────────────────────────────────────────
//  Middleware: verificar rol autorizado
//  Uso: verificarRol('Administrador', 'Médico')
// ─────────────────────────────────────────────
function verificarRol(...rolesPermitidos) {
  return (req, res, next) => {
    if (!req.usuario) {
      return res.status(401).json({ message: 'No autenticado.' });
    }

    if (!rolesPermitidos.includes(req.usuario.rol)) {
      return res.status(403).json({
        message: `Acceso prohibido. Se requiere rol: ${rolesPermitidos.join(' o ')}.`,
      });
    }

    next();
  };
}

module.exports = { verificarToken, verificarRol };
