const Appointment = require('../models/Appointment');
const Doctor = require('../models/Doctor');
const { sendSuccess, sendPaginated } = require('../utils/response');

// GET /api/reports/ocupacion
const getOcupacion = async (req, res, next) => {
  try {
    const data = await Appointment.aggregate([
      {
        $group: {
          _id: '$doctorId',
          totalCitas: { $sum: 1 }
        }
      }
    ]);

    sendSuccess(res, data);
  } catch (error) {
    next(error);
  }
};

// GET /api/reports/especialidades
const getByEspecialidad = async (req, res, next) => {
  try {
    const data = await Appointment.aggregate([
      {
        $lookup: {
          from: 'doctors',
          localField: 'doctorId',
          foreignField: '_id',
          as: 'doctor'
        }
      },
      { $unwind: '$doctor' },
      {
        $group: {
          _id: '$doctor.especialidad',
          total: { $sum: 1 }
        }
      }
    ]);

    sendSuccess(res, data);
  } catch (error) {
    next(error);
  }
};
// GET /api/reports/periodo
const getByPeriodo = async (req, res, next) => {
  try {
    const { inicio, fin } = req.query;

    const filtro = {
      fechaHora: {
        $gte: new Date(inicio),
        $lte: new Date(fin)
      }
    };

    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const [citas, total] = await Promise.all([
      Appointment.find(filtro)
        .populate('pacienteId', 'nombre email')
        .populate({
          path: 'doctorId',
          populate: { path: 'userId', select: 'nombre email' }
        })
        .skip(skip)
        .limit(limit),

      Appointment.countDocuments(filtro)
    ]);

    sendPaginated(res, citas, total, page, limit);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getOcupacion,
  getByEspecialidad,
  getByPeriodo,
};