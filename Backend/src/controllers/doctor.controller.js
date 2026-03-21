const Doctor = require('../models/Doctor');
const User = require('../models/User');
const { sendSuccess, sendCreated, sendPaginated } = require('../utils/response');

// 1. getDoctors
const getDoctors = async (req, res, next) => {
  try {
    const filtro = req.query.especialidad ? { especialidad: req.query.especialidad } : {};
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const [doctors, total] = await Promise.all([
      Doctor.find(filtro).populate('userId', 'nombre email').skip(skip).limit(limit),
      Doctor.countDocuments(filtro)
    ]);

    sendPaginated(res, doctors, total, page, limit);
  } catch (error) {
    next(error);
  }
};

// 2. getDoctorById
const getDoctorById = async (req, res, next) => {
  try {
    const doctor = await Doctor.findById(req.params.id).populate('userId', 'nombre email');

    if (!doctor) {
      return res.status(404).json({ success: false, message: 'Médico no encontrado' });
    }

    sendSuccess(res, doctor);
  } catch (error) {
    next(error);
  }
};

// 3. createDoctor (solo admin)
const createDoctor = async (req, res, next) => {
  try {
    const { userId, especialidad, registroMedico, disponibilidad } = req.body;

    const user = await User.findById(userId);

    if (!user || user.rol !== 'medico') {
      return res.status(400).json({ success: false, message: 'El usuario debe tener rol medico' });
    }

    const doctor = await Doctor.create({ userId, especialidad, registroMedico, disponibilidad: disponibilidad || [] });

    sendCreated(res, doctor);
  } catch (error) {
    next(error);
  }
};

// 4. updateDoctor
const updateDoctor = async (req, res, next) => {
  try {
    const doctor = await Doctor.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });

    if (!doctor) {
      return res.status(404).json({ success: false, message: 'Médico no encontrado' });
    }

    sendSuccess(res, doctor);
  } catch (error) {
    next(error);
  }
};

// 5. deleteDoctor (solo admin)
const deleteDoctor = async (req, res, next) => {
  try {
    const doctor = await Doctor.findByIdAndDelete(req.params.id);

    if (!doctor) {
      return res.status(404).json({ success: false, message: 'Médico no encontrado' });
    }

    sendSuccess(res, null, 'Médico eliminado correctamente');
  } catch (error) {
    next(error);
  }
};

module.exports = { getDoctors, getDoctorById, createDoctor, updateDoctor, deleteDoctor };