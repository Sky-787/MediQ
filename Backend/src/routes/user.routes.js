const { Router } = require('express');
const { getUsers, getUserById, updateUser, deleteUser } = require('../controllers/user.controller');
const { authenticate } = require('../middlewares/auth.middleware');
const { authorize, authorizeOwnerOrAdmin } = require('../middlewares/role.middleware');
const { body } = require('express-validator');
const { validateRequest } = require('../utils/validators');

const router = Router();

router.use(authenticate);

router.get('/', authorize('admin'), getUsers);
router.get('/:id', authorizeOwnerOrAdmin('id'), getUserById);
router.put(
  '/:id',
  authorizeOwnerOrAdmin('id'),
  [
    body('nombre').optional().trim().notEmpty().withMessage('El nombre no puede estar vacío'),
    body('email').optional().isEmail().withMessage('Email inválido').normalizeEmail(),
    validateRequest
  ],
  updateUser
);
router.delete('/:id', authorize('admin'), deleteUser);

module.exports = router;
