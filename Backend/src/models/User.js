const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema(
  {
    nombre: {
      type: String,
      required: [true, 'El nombre es obligatorio'],
      trim: true,
      minlength: [2, 'El nombre debe tener al menos 2 caracteres'],
    },

    email: {
      type: String,
      required: [true, 'El email es obligatorio'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, 'El formato del email no es válido'],
    },

    contrasena: {
      type: String,
      required: [true, 'La contraseña es obligatoria'],
      minlength: [8, 'La contraseña debe tener al menos 8 caracteres'],
      select: false,
    },

    rol: {
      type: String,
      enum: ['paciente', 'medico', 'admin'],
      default: 'paciente',
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

// Hash antes de guardar
userSchema.pre('save', async function (next) {
  if (!this.isModified('contrasena')) return next();

  const salt = await bcrypt.genSalt(10);
  this.contrasena = await bcrypt.hash(this.contrasena, salt);
  next();
});

// Comparar contraseña
userSchema.methods.compararContrasena = async function (contrasenaIngresada) {
  return bcrypt.compare(contrasenaIngresada, this.contrasena);
};

// Datos públicos
userSchema.methods.toPublicJSON = function () {
  return {
    id: this._id,
    nombre: this.nombre,
    email: this.email,
    rol: this.rol,
  };
};

module.exports = mongoose.model('User', userSchema);