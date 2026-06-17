const Doctor = require('../models/Doctor');
const User = require('../models/User');
const {
  sendSuccess,
  sendCreated,
  sendPaginated,
} = require('../utils/response');

const DAY_NAME_BY_ID = {
  0: 'Domingo',
  1: 'Lunes',
  2: 'Martes',
  3: 'Miércoles',
  4: 'Jueves',
  5: 'Viernes',
  6: 'Sábado',
};

const normalizeAvailability = (availability = []) =>
  (Array.isArray(availability) ? availability : [])
    .map((item) => {
      if (item?.dia && Array.isArray(item?.horas)) {
        return {
          dia: item.dia,
          horas: item.horas,
        };
      }

      if (typeof item?.diaSemana === 'number' && Array.isArray(item?.slots)) {
        return {
          dia: DAY_NAME_BY_ID[item.diaSemana],
          horas: item.slots,
        };
      }

      return null;
    })
    .filter(Boolean);

// 1. getDoctors
const getDoctors = async (req, res, next) => {
  try {
    const filtro = req.query.especialidad
      ? { especialidad: req.query.especialidad }
      : {};

    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const [doctors, total] = await Promise.all([
      Doctor.find(filtro)
        .populate('userId', 'nombre email')
        .skip(skip)
        .limit(limit),
      Doctor.countDocuments(filtro),
    ]);

    sendPaginated(res, doctors, total, page, limit);
  } catch (error) {
    next(error);
  }
};

// 2. getDoctorById
const getDoctorById = async (req, res, next) => {
  try {
    const doctor = await Doctor.findById(req.params.id).populate(
      'userId',
      'nombre email'
    );

    if (!doctor) {
      return res
        .status(404)
        .json({ success: false, message: 'Médico no encontrado' });
    }

    sendSuccess(res, doctor);
  } catch (error) {
    next(error);
  }
};

const getOwnDoctorProfile = async (req, res, next) => {
  try {
    const doctor = await Doctor.findOne({ userId: req.user._id }).populate(
      'userId',
      'nombre email'
    );

    if (!doctor) {
      return res
        .status(404)
        .json({ success: false, message: 'Perfil de médico no encontrado' });
    }

    sendSuccess(res, doctor);
  } catch (error) {
    next(error);
  }
};

// 3. createDoctor (solo admin)
const createDoctor = async (req, res, next) => {
  try {
    const { userId, especialidad, registroMedico, disponibilidad } =
      req.body;

    const user = await User.findById(userId);

    if (!user || user.rol !== 'medico') {
      return res.status(400).json({
        success: false,
        message: 'El usuario debe tener rol medico',
      });
    }

    // ⚠️ evitar duplicado de doctor
    const exists = await Doctor.findOne({ userId });
    if (exists) {
      return res.status(400).json({
        success: false,
        message: 'Este usuario ya tiene perfil de doctor',
      });
    }

    const doctor = await Doctor.create({
      userId,
      especialidad,
      registroMedico,
      disponibilidad: disponibilidad || [],
    });

    sendCreated(res, doctor);
  } catch (error) {
    next(error);
  }
};

// 4. updateDoctor (PROTEGIDO)
const updateDoctor = async (req, res, next) => {
  try {
    const doctor = await Doctor.findById(req.params.id);

    if (!doctor) {
      return res
        .status(404)
        .json({ success: false, message: 'Médico no encontrado' });
    }

    // 🔐 CONTROL DE CAMPOS PERMITIDOS (evita req.body libre)
    const { especialidad, registroMedico, disponibilidad } = req.body;

    const updatedDoctor = await Doctor.findByIdAndUpdate(
      req.params.id,
      { especialidad, registroMedico, disponibilidad },
      { new: true, runValidators: true }
    );

    sendSuccess(res, updatedDoctor);
  } catch (error) {
    next(error);
  }
};

const updateOwnDoctorProfile = async (req, res, next) => {
  try {
    const doctor = await Doctor.findOne({ userId: req.user._id });

    if (!doctor) {
      return res
        .status(404)
        .json({ success: false, message: 'Perfil de médico no encontrado' });
    }

    const { especialidad, registroMedico, disponibilidad } = req.body;
    const updateData = {};

    if (typeof especialidad !== 'undefined') {
      updateData.especialidad = especialidad;
    }

    if (typeof registroMedico !== 'undefined') {
      updateData.registroMedico = registroMedico;
    }

    if (typeof disponibilidad !== 'undefined') {
      updateData.disponibilidad = normalizeAvailability(disponibilidad);
    }

    const updatedDoctor = await Doctor.findByIdAndUpdate(doctor._id, updateData, {
      new: true,
      runValidators: true,
    }).populate('userId', 'nombre email');

    sendSuccess(res, updatedDoctor);
  } catch (error) {
    next(error);
  }
};

// 5. deleteDoctor (solo admin seguro)
const deleteDoctor = async (req, res, next) => {
  try {
    const doctor = await Doctor.findById(req.params.id);

    if (!doctor) {
      return res
        .status(404)
        .json({ success: false, message: 'Médico no encontrado' });
    }

    await Doctor.findByIdAndDelete(req.params.id);

    sendSuccess(res, null, 'Médico eliminado correctamente');
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getDoctors,
  getDoctorById,
  getOwnDoctorProfile,
  createDoctor,
  updateDoctor,
  updateOwnDoctorProfile,
  deleteDoctor,
};
