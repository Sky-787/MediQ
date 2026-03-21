const Appointment = require('../models/Appointment');
const Doctor = require('../models/Doctor');
const { sendSuccess, sendCreated, sendPaginated } = require('../utils/response');
const { validateMotivo } = require('../utils/validators');

// GET /api/appointments
const getAppointments = async (req, res, next) => {
  try {
    const filtro = {};
    if (req.user.rol === 'paciente') {
      filtro.pacienteId = req.user.id;
    } else if (req.user.rol === 'medico') {
      const doctor = await Doctor.findOne({ userId: req.user.id });
      if (!doctor) return res.status(404).json({ success: false, message: 'Doctor no encontrado' });
      filtro.doctorId = doctor._id;
    }

    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const [appointments, total] = await Promise.all([
      Appointment.find(filtro)
        .skip(skip)
        .limit(limit)
        .populate('pacienteId', 'nombre email')
        .populate('doctorId', 'especialidad userId')
        .sort({ fechaHora: 1 }),
      Appointment.countDocuments(filtro),
    ]);

    sendPaginated(res, appointments, total, page, limit);
  } catch (error) {
    next(error);
  }
};

// GET /api/appointments/:id
const getAppointmentById = async (req, res, next) => {
  try {
    const appointment = await Appointment.findById(req.params.id)
      .populate('pacienteId', 'nombre email')
      .populate('doctorId', 'especialidad userId');

    if (!appointment) return res.status(404).json({ success: false, message: 'Cita no encontrada' });

    if (req.user.rol === 'paciente' && appointment.pacienteId._id.toString() !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Acceso denegado' });
    }

    sendSuccess(res, appointment);
  } catch (error) {
    next(error);
  }
};

// POST /api/appointments
const createAppointment = async (req, res, next) => {
  try {
    const { doctorId, fechaHora, motivo } = req.body;

    const motivoValidation = validateMotivo(motivo);
    if (!motivoValidation.valid) return res.status(400).json({ success: false, message: motivoValidation.message });

    const doctor = await Doctor.findById(doctorId);
    if (!doctor) return res.status(404).json({ success: false, message: 'Doctor no encontrado' });

    const existe = await Appointment.findOne({
      doctorId,
      fechaHora: new Date(fechaHora),
      estado: { $ne: 'cancelada' }
    });
    if (existe) return res.status(409).json({ success: false, message: 'El médico ya tiene una cita en ese horario' });

    const pacienteId = req.user.id;

    const appointment = await Appointment.create({
      pacienteId,
      doctorId,
      fechaHora: new Date(fechaHora),
      motivo: motivo.trim(),
    });

    sendCreated(res, appointment);
  } catch (error) {
    next(error);
  }
};

// PATCH /api/appointments/:id/status
const updateAppointmentStatus = async (req, res, next) => {
  try {
    if (!['medico', 'admin'].includes(req.user.rol)) {
      return res.status(403).json({ success: false, message: 'No autorizado' });
    }

    const { estado } = req.body;
    const estadosValidos = ['pendiente', 'confirmada', 'cancelada', 'completada'];
    if (!estadosValidos.includes(estado)) return res.status(400).json({ success: false, message: 'Estado inválido' });

    const appointment = await Appointment.findByIdAndUpdate(
      req.params.id,
      { estado },
      { new: true, runValidators: true }
    );

    if (!appointment) return res.status(404).json({ success: false, message: 'Cita no encontrada' });

    sendSuccess(res, appointment, 'Estado actualizado');
  } catch (error) {
    next(error);
  }
};

// DELETE /api/appointments/:id
const deleteAppointment = async (req, res, next) => {
  try {
    const appointment = await Appointment.findByIdAndDelete(req.params.id);

    if (!appointment) return res.status(404).json({ success: false, message: 'Cita no encontrada' });

    sendSuccess(res, null, 'Cita eliminada correctamente');
  } catch (error) {
    next(error);
  }
};

module.exports = { getAppointments, getAppointmentById, createAppointment, updateAppointmentStatus, deleteAppointment };

// const Appointment = require('../models/Appointment');
// const Doctor = require('../models/Doctor');
// const { sendSuccess, sendCreated, sendPaginated } = require('../utils/response');
// const { validateMotivo } = require('../utils/validators');

// // GET /api/appointments
// const getAppointments = async (req, res, next) => {
//   try {
//     const filtro = {};
//     if (req.user.rol === 'paciente') {
//       filtro.pacienteId = req.user.id;
//     } else if (req.user.rol === 'medico') {
//       const doctor = await Doctor.findOne({ userId: req.user.id });
//       if (doctor) {
//         filtro.doctorId = doctor._id;
//       }
//     }

//     const page = parseInt(req.query.page) || 1;
//     const limit = parseInt(req.query.limit) || 10;
//     const skip = (page - 1) * limit;

//     const [appointments, total] = await Promise.all([
//       Appointment.find(filtro)
//         .skip(skip)
//         .limit(limit)
//         .populate('pacienteId', 'nombre email')
//         .populate('doctorId', 'especialidad userId'),
//       Appointment.countDocuments(filtro),
//     ]);

//     sendPaginated(res, appointments, total, page, limit);
//   } catch (error) {
//     next(error);
//   }
// };

// // GET /api/appointments/:id
// const getAppointmentById = async (req, res, next) => {
//   try {
//     const appointment = await Appointment.findById(req.params.id)
//       .populate('pacienteId', 'nombre email')
//       .populate('doctorId', 'especialidad userId');

//     if (!appointment) {
//       return res.status(404).json({ success: false, message: 'Cita no encontrada' });
//     }

//     // Si no es admin, verificar propiedad
//     if (req.user.rol === 'paciente' && appointment.pacienteId._id.toString() !== req.user.id) {
//       return res.status(403).json({ success: false, message: 'Acceso denegado' });
//     }

//     sendSuccess(res, appointment);
//   } catch (error) {
//     next(error);
//   }
// };

// // POST /api/appointments
// const createAppointment = async (req, res, next) => {
//   try {
//     const { doctorId, fechaHora, motivo } = req.body;

//     // Validar motivo antes de persistir
//     const motivoValidation = validateMotivo(motivo);
//     if (!motivoValidation.valid) {
//       return res.status(400).json({ success: false, message: motivoValidation.message });
//     }

//     let pacienteId = req.user.id;
//     if (req.user.rol === 'admin' && req.body.pacienteId) {
//       pacienteId = req.body.pacienteId;
//     }

//     const appointment = await Appointment.create({
//       pacienteId,
//       doctorId,
//       fechaHora,
//       motivo: motivo.trim(),
//     });

//     sendCreated(res, appointment);
//   } catch (error) {
//     next(error);
//   }
// };

// // PATCH /api/appointments/:id/status
// const updateAppointmentStatus = async (req, res, next) => {
//   try {
//     const { estado } = req.body;
    
//     const appointment = await Appointment.findByIdAndUpdate(
//       req.params.id,
//       { estado },
//       { new: true, runValidators: true }
//     );

//     if (!appointment) {
//       return res.status(404).json({ success: false, message: 'Cita no encontrada' });
//     }

//     sendSuccess(res, appointment);
//   } catch (error) {
//     next(error);
//   }
// };

// // DELETE /api/appointments/:id
// const deleteAppointment = async (req, res, next) => {
//   try {
//     const appointment = await Appointment.findByIdAndDelete(req.params.id);

//     if (!appointment) {
//       return res.status(404).json({ success: false, message: 'Cita no encontrada' });
//     }

//     sendSuccess(res, null, 'Cita eliminada correctamente');
//   } catch (error) {
//     next(error);
//   }
// };

// module.exports = { getAppointments, getAppointmentById, createAppointment, updateAppointmentStatus, deleteAppointment };
