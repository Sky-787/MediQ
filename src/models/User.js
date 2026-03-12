const mongoose = require('mongoose');
const bcrypt   = require('bcryptjs');

// ─────────────────────────────────────────────
//  Schema
// ─────────────────────────────────────────────
const userSchema = new mongoose.Schema(
  {
    nombre: {
      type:     String,
      required: [true, 'El nombre es obligatorio'],
      trim:     true,
      minlength: [2, 'El nombre debe tener al menos 2 caracteres'],
    },

    email: {
      type:      String,
      required:  [true, 'El email es obligatorio'],
      unique:    true,
      lowercase: true,
      trim:      true,
      match: [
        /^\S+@\S+\.\S+$/,
        'El formato del email no es válido',
      ],
    },

    password: {
      type:      String,
      required:  [true, 'La contraseña es obligatoria'],
      minlength: [8, 'La contraseña debe tener al menos 8 caracteres'],
      select:    false, // nunca se devuelve en queries por defecto
    },

    rol: {
      type:     String,
      enum: {
        values:  ['Paciente', 'Médico', 'Administrador'],
        message: 'Rol no válido: {VALUE}',
      },
      default: 'Paciente',
    },
  },
  {
    timestamps: true, // createdAt / updatedAt automáticos
  }
);

// ─────────────────────────────────────────────
//  Middleware: hashear contraseña antes de guardar
// ─────────────────────────────────────────────
userSchema.pre('save', async function (next) {
  // Solo hashea si la contraseña fue modificada (o es nueva)
  if (!this.isModified('password')) return next();

  try {
    const salt    = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (err) {
    next(err);
  }
});

// ─────────────────────────────────────────────
//  Método de instancia: comparar contraseñas
// ─────────────────────────────────────────────
userSchema.methods.compararPassword = async function (passwordPlano) {
  return bcrypt.compare(passwordPlano, this.password);
};

// ─────────────────────────────────────────────
//  Método de instancia: objeto seguro para JWT
//  (nunca expone el hash de la contraseña)
// ─────────────────────────────────────────────
userSchema.methods.toPublicJSON = function () {
  return {
    id:     this._id,
    nombre: this.nombre,
    email:  this.email,
    rol:    this.rol,
  };
};

module.exports = mongoose.model('User', userSchema);
