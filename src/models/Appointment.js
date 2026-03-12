const mongoose = require('mongoose');

const appointmentSchema = new mongoose.Schema(
  {
    pacienteId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'El pacienteId es obligatorio'],
    },
    doctorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Doctor',
      required: [true, 'El doctorId es obligatorio'],
    },
    fechaHora: {
      type: Date,
      required: [true, 'La fecha y hora son obligatorias'],
    },
    estado: {
      type: String,
      enum: ['pendiente', 'confirmada', 'cancelada', 'completada'],
      default: 'pendiente',
    },
    motivo: {
      type: String,
      required: [true, 'El motivo es obligatorio'],
      trim: true,
    },
  },
  { timestamps: true, versionKey: false }
);

module.exports = mongoose.model('Appointment', appointmentSchema);
