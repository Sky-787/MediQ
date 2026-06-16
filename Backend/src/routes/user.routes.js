const { Router } = require('express');
const { createUser, getUsers, getUserById, updateUser, deleteUser } = require('../controllers/user.controller');
const { authenticate, authorize, authorizeOwnerOrAdmin } = require('../middlewares');
const { validateCreateUser, validateUpdateUser } = require('../middlewares/validations');

const router = Router();

// Todas las rutas de usuarios requieren autenticación
router.use(authenticate);

router.post('/', authorize('admin'), validateCreateUser, createUser);
router.get('/', authorize('admin'), getUsers);
router.get('/:id', authorizeOwnerOrAdmin('id'), getUserById);
router.put('/:id', authorizeOwnerOrAdmin('id'), validateUpdateUser, updateUser);
router.delete('/:id', authorize('admin'), deleteUser);

module.exports = router;
