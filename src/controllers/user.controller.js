const User = require('../models/User');
const { sendSuccess, sendCreated, sendPaginated } = require('../utils/response');

// GET /api/users
const getUsers = async (req, res, next) => {
  try {
    // TODO: Listar usuarios con paginación (solo admin)
    res.status(501).json({ success: false, message: 'Por implementar: GET /api/users' });
  } catch (error) {
    next(error);
  }
};

// GET /api/users/:id
const getUserById = async (req, res, next) => {
  try {
    // TODO: Buscar usuario por ID
    res.status(501).json({ success: false, message: 'Por implementar: GET /api/users/:id' });
  } catch (error) {
    next(error);
  }
};

// PUT /api/users/:id
const updateUser = async (req, res, next) => {
  try {
    // TODO: Actualizar campos permitidos (nombre, email). No actualizar contraseña aquí.
    res.status(501).json({ success: false, message: 'Por implementar: PUT /api/users/:id' });
  } catch (error) {
    next(error);
  }
};

// DELETE /api/users/:id
const deleteUser = async (req, res, next) => {
  try {
    // TODO: Eliminar usuario (solo admin)
    res.status(501).json({ success: false, message: 'Por implementar: DELETE /api/users/:id' });
  } catch (error) {
    next(error);
  }
};

module.exports = { getUsers, getUserById, updateUser, deleteUser };
