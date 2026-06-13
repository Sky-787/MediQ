const User = require('../../models/User');
const { generateToken, sendTokenCookie } = require('../../utils/jwt');
const { sendCreated } = require('../../utils/response');

/**
 * POST /api/auth/register
 * Registra un nuevo usuario y devuelve JWT en cookie HTTP-only.
 */
const ROLES_PUBLICOS = ['paciente', 'medico'];

const register = async (req, res, next) => {
  try {
    const { nombre, email, contrasena, rol } = req.body;

    // Evitar que la API pública cree admins
    if (rol && !ROLES_PUBLICOS.includes(rol)) {
      return res.status(403).json({
        success: false,
        message: 'No se permite registrar usuarios con ese rol desde la API pública.',
      });
    }

    const existe = await User.findOne({ email });
    if (existe) {
      return res.status(409).json({ success: false, message: 'El email ya está registrado' });
    }

    // Si no envían rol, forzar paciente por defecto
    const rolFinal = ROLES_PUBLICOS.includes(rol) ? rol : 'paciente';
    const user = await User.create({ nombre, email, contrasena, rol: rolFinal });

    const token = generateToken(user._id);
    sendTokenCookie(res, token);

    sendCreated(res, {
      _id: user._id,
      nombre: user.nombre,
      email: user.email,
      rol: user.rol,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { register };
