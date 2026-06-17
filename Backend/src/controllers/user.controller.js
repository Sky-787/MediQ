const User = require('../models/User');
const Doctor = require('../models/Doctor');
const { sendSuccess, sendCreated, sendPaginated } = require('../utils/response');

const createRegistroMedico = () =>
  `RM-${Date.now()}-${Math.floor(100 + Math.random() * 900)}`;

const serializeUser = (user) =>
  typeof user?.toObject === 'function' ? user.toObject() : user;

const enrichUsersWithDoctorData = async (users) => {
  if (!users.length) return [];

  const userIds = users.map((user) => user._id);
  const doctors = await Doctor.find({ userId: { $in: userIds } })
    .select('userId especialidad registroMedico');

  const doctorByUserId = new Map(
    doctors.map((doctor) => [doctor.userId.toString(), doctor])
  );

  return users.map((user) => {
    const doctor = doctorByUserId.get(user._id.toString());

    return {
      ...serializeUser(user),
      especialidad: doctor?.especialidad || null,
      registroMedico: doctor?.registroMedico || null,
    };
  });
};

// POST /api/users
const createUser = async (req, res, next) => {
  let user = null;

  try {
    const { nombre, email, contrasena, rol, especialidad } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: 'El email ya está registrado',
      });
    }

    user = await User.create({ nombre, email, contrasena, rol });

    let doctor = null;
    if (rol === 'medico') {
      doctor = await Doctor.create({
        userId: user._id,
        especialidad,
        registroMedico: createRegistroMedico(),
        disponibilidad: [],
      });
    }

    sendCreated(res, {
      ...serializeUser(user),
      especialidad: doctor?.especialidad || null,
      registroMedico: doctor?.registroMedico || null,
    }, 'Usuario creado correctamente');
  } catch (error) {
    if (user?._id) {
      await User.findByIdAndDelete(user._id).catch(() => {});
    }
    next(error);
  }
};

// GET /api/users
const getUsers = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const [users, total] = await Promise.all([
      User.find().skip(skip).limit(limit),
      User.countDocuments(),
    ]);

    const enrichedUsers = await enrichUsersWithDoctorData(users);

    sendPaginated(res, enrichedUsers, total, page, limit);
  } catch (error) {
    next(error);
  }
};

// GET /api/users/:id
const getUserById = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'Usuario no encontrado' });
    }

    const [enrichedUser] = await enrichUsersWithDoctorData([user]);
    sendSuccess(res, enrichedUser);
  } catch (error) {
    next(error);
  }
};

// PUT /api/users/:id
const updateUser = async (req, res, next) => {
  try {
    const { nombre, email, rol } = req.body;

    const updateData = {};
    if (nombre !== undefined) updateData.nombre = nombre;
    if (email !== undefined) updateData.email = email;
    if (rol !== undefined && req.user.rol === 'admin') {
      updateData.rol = rol;
    }

    const user = await User.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    );

    if (!user) {
      return res.status(404).json({ success: false, message: 'Usuario no encontrado' });
    }

    sendSuccess(res, user);
  } catch (error) {
    next(error);
  }
};

// DELETE /api/users/:id
const deleteUser = async (req, res, next) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'Usuario no encontrado' });
    }
    sendSuccess(res, null, 'Usuario eliminado correctamente');
  } catch (error) {
    next(error);
  }
};

module.exports = { createUser, getUsers, getUserById, updateUser, deleteUser };
