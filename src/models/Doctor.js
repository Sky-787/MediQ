const mongoose = require('mongoose');

const doctorSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'El userId es obligatorio'],
      unique: true,
    },
    especialidad: {
      type: String,
      required: [true, 'La especialidad es obligatoria'],
      trim: true,
    },
    registroMedico: {
      type: String,
      required: [true, 'El registro médico es obligatorio'],
      unique: true,
      trim: true,
    },
    disponibilidad: {
      type: Array,
      default: [],
    },
  },
  { timestamps: true, versionKey: false }
);

module.exports = mongoose.model('Doctor', doctorSchema);
