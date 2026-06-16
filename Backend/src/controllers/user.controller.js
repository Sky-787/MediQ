const User = require('../models/User');
const { sendSuccess, sendPaginated } = require('../utils/response');

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

    sendPaginated(res, users, total, page, limit);
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
    sendSuccess(res, user);
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

module.exports = { getUsers, getUserById, updateUser, deleteUser };
