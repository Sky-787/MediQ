const { Router } = require('express');
const { getUsers, getUserById, updateUser, deleteUser } = require('../controllers/user.controller');
const { authenticate } = require('../middlewares/auth.middleware');
const { authorize, authorizeOwnerOrAdmin } = require('../middlewares/role.middleware');

const router = Router();

router.use(authenticate);

router.get('/', authorize('admin'), getUsers);
router.get('/:id', authorizeOwnerOrAdmin('id'), getUserById);
router.put('/:id', authorizeOwnerOrAdmin('id'), updateUser);
router.delete('/:id', authorize('admin'), deleteUser);

module.exports = router;
