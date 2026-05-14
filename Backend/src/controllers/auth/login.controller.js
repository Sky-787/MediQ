const User = require('../../models/User');
const { generateToken, sendTokenCookie } = require('../../utils/jwt');
const { sendSuccess } = require('../../utils/response');

/**
 * POST /api/auth/login
 * Autentica al usuario y devuelve JWT en cookie HTTP-only.
 */
const login = async (req, res, next) => {
  try {
    const { email, contrasena } = req.body;

    const user = await User.findOne({ email }).select('+contrasena');
    if (!user) {
      return res.status(401).json({ success: false, message: 'Credenciales inválidas' });
    }

    const valida = await user.compararContrasena(contrasena);
    if (!valida) {
      return res.status(401).json({ success: false, message: 'Credenciales inválidas' });
    }

    const token = generateToken(user._id);
    sendTokenCookie(res, token);

    sendSuccess(res, {
      _id: user._id,
      nombre: user.nombre,
      email: user.email,
      rol: user.rol,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { login };
