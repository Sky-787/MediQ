/**
 * Middleware de autorización por rol.
 * Uso: authorize('admin', 'medico')
 * Debe usarse DESPUÉS de authenticate.
 */
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ success: false, message: 'No autenticado.' });
    }
    if (!roles.includes(req.user.rol)) {
      return res.status(403).json({
        success: false,
        message: `Acceso prohibido. Se requiere uno de los roles: ${roles.join(', ')}.`,
      });
    }
    next();
  };
};

/**
 * Verifica que el usuario es dueño del recurso o tiene rol admin.
 */
const authorizeOwnerOrAdmin = (paramId = 'id') => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ success: false, message: 'No autenticado.' });
    }
    const isAdmin = req.user.rol === 'admin';
    const isOwner = req.user._id.toString() === req.params[paramId];
    if (!isAdmin && !isOwner) {
      return res.status(403).json({ success: false, message: 'No tienes permiso para acceder a este recurso.' });
    }
    next();
  };
};

module.exports = { authorize, authorizeOwnerOrAdmin };
