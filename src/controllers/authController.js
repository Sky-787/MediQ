const jwt  = require('jsonwebtoken');
const User = require('../models/User');

// ─────────────────────────────────────────────
//  Helper: generar JWT firmado
// ─────────────────────────────────────────────
function generarToken(payload) {
  return jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN ?? '8h',
  });
}

// ─────────────────────────────────────────────
//  POST /api/auth/login
// ─────────────────────────────────────────────
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // 1. Validar que lleguen ambos campos
    if (!email || !password) {
      return res.status(400).json({
        message: 'Email y contraseña son obligatorios',
      });
    }

    // 2. Buscar usuario — incluimos password explícitamente
    //    porque el schema lo tiene como select: false
    const user = await User.findOne({ email }).select('+password');

    if (!user) {
      // Mensaje genérico: no revelamos si el email existe o no
      return res.status(401).json({ message: 'Credenciales inválidas' });
    }

    // 3. Comparar contraseña con el hash almacenado
    const passwordValida = await user.compararPassword(password);

    if (!passwordValida) {
      return res.status(401).json({ message: 'Credenciales inválidas' });
    }

    // 4. Construir payload del JWT (sin datos sensibles)
    const payload = {
      sub:    user._id,
      email:  user.email,
      nombre: user.nombre,
      rol:    user.rol,
    };

    // 5. Generar token
    const token = generarToken(payload);

    // 6. Responder con token y datos públicos del usuario
    return res.status(200).json({
      token,
      user: user.toPublicJSON(),
    });

  } catch (err) {
    console.error('[AuthController] Error en login:', err);
    return res.status(500).json({
      message: 'Error interno del servidor. Intenta de nuevo más tarde.',
    });
  }
};

// ─────────────────────────────────────────────
//  POST /api/auth/register  (bonus)
// ─────────────────────────────────────────────
exports.register = async (req, res) => {
  try {
    const { nombre, email, password, rol } = req.body;

    // Verificar email duplicado con mensaje claro
    const existe = await User.findOne({ email });
    if (existe) {
      return res.status(409).json({ message: 'El email ya está registrado' });
    }

    // El pre-save hook de bcrypt hashea automáticamente
    const nuevoUsuario = await User.create({ nombre, email, password, rol });

    const payload = {
      sub:    nuevoUsuario._id,
      email:  nuevoUsuario.email,
      nombre: nuevoUsuario.nombre,
      rol:    nuevoUsuario.rol,
    };

    const token = generarToken(payload);

    return res.status(201).json({
      token,
      user: nuevoUsuario.toPublicJSON(),
    });

  } catch (err) {
    // Errores de validación de Mongoose
    if (err.name === 'ValidationError') {
      const errores = Object.values(err.errors).map((e) => e.message);
      return res.status(422).json({ message: 'Datos inválidos', errores });
    }

    console.error('[AuthController] Error en register:', err);
    return res.status(500).json({
      message: 'Error interno del servidor. Intenta de nuevo más tarde.',
    });
  }
};
