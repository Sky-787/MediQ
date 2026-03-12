const Appointment = require('../models/Appointment');
const { sendSuccess, sendCreated, sendPaginated } = require('../utils/response');

// GET /api/appointments
const getAppointments = async (req, res, next) => {
  try {
    // TODO: Filtrar por rol:
    //   admin    → todas las citas
    //   medico   → sus citas (por doctorId)
    //   paciente → sus citas (por pacienteId)
    res.status(501).json({ success: false, message: 'Por implementar: GET /api/appointments' });
  } catch (error) {
    next(error);
  }
};

// GET /api/appointments/:id
const getAppointmentById = async (req, res, next) => {
  try {
    // TODO: Buscar cita por ID
    res.status(501).json({ success: false, message: 'Por implementar: GET /api/appointments/:id' });
  } catch (error) {
    next(error);
  }
};

// POST /api/appointments
const createAppointment = async (req, res, next) => {
  try {
    // TODO: Verificar disponibilidad del médico en esa fechaHora, crear cita
    res.status(501).json({ success: false, message: 'Por implementar: POST /api/appointments' });
  } catch (error) {
    next(error);
  }
};

// PATCH /api/appointments/:id/status
const updateAppointmentStatus = async (req, res, next) => {
  try {
    // TODO: Actualizar estado (pendiente → confirmada → completada / cancelada)
    res.status(501).json({ success: false, message: 'Por implementar: PATCH /api/appointments/:id/status' });
  } catch (error) {
    next(error);
  }
};

// DELETE /api/appointments/:id
const deleteAppointment = async (req, res, next) => {
  try {
    // TODO: Cancelar o eliminar cita
    res.status(501).json({ success: false, message: 'Por implementar: DELETE /api/appointments/:id' });
  } catch (error) {
    next(error);
  }
};

module.exports = { getAppointments, getAppointmentById, createAppointment, updateAppointmentStatus, deleteAppointment };
