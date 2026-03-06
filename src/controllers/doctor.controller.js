const Doctor = require('../models/Doctor');
const { sendSuccess, sendCreated, sendPaginated } = require('../utils/response');

// GET /api/doctors
const getDoctors = async (req, res, next) => {
  try {
    // TODO: Listar médicos con paginación y filtro por especialidad
    res.status(501).json({ success: false, message: 'Por implementar: GET /api/doctors' });
  } catch (error) {
    next(error);
  }
};

// GET /api/doctors/:id
const getDoctorById = async (req, res, next) => {
  try {
    // TODO: Buscar médico por ID, popular datos del usuario asociado
    res.status(501).json({ success: false, message: 'Por implementar: GET /api/doctors/:id' });
  } catch (error) {
    next(error);
  }
};

// POST /api/doctors
const createDoctor = async (req, res, next) => {
  try {
    // TODO: Verificar que userId tenga rol 'medico', crear perfil de doctor
    res.status(501).json({ success: false, message: 'Por implementar: POST /api/doctors' });
  } catch (error) {
    next(error);
  }
};

// PUT /api/doctors/:id
const updateDoctor = async (req, res, next) => {
  try {
    // TODO: Actualizar especialidad, registroMedico, disponibilidad
    res.status(501).json({ success: false, message: 'Por implementar: PUT /api/doctors/:id' });
  } catch (error) {
    next(error);
  }
};

// DELETE /api/doctors/:id
const deleteDoctor = async (req, res, next) => {
  try {
    // TODO: Eliminar perfil de médico (solo admin)
    res.status(501).json({ success: false, message: 'Por implementar: DELETE /api/doctors/:id' });
  } catch (error) {
    next(error);
  }
};

module.exports = { getDoctors, getDoctorById, createDoctor, updateDoctor, deleteDoctor };
