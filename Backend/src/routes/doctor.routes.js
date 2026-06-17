const { Router } = require('express');
const {
  getDoctors,
  getDoctorById,
  getOwnDoctorProfile,
  createDoctor,
  updateDoctor,
  updateOwnDoctorProfile,
  deleteDoctor,
} = require('../controllers/doctor.controller');

const { authenticate, authorize } = require('../middlewares');

const router = Router();

// Públicos
router.get('/', getDoctors);
router.get('/profile', authenticate, authorize('medico'), getOwnDoctorProfile);
router.get('/:id', getDoctorById);

// Protegidos
router.post('/', authenticate, authorize('admin'), createDoctor);

router.put(
  '/profile',
  authenticate,
  authorize('medico'),
  updateOwnDoctorProfile
);

router.put(
  '/:id',
  authenticate,
  authorize('admin', 'medico'),
  updateDoctor
);

router.delete(
  '/:id',
  authenticate,
  authorize('admin'),
  deleteDoctor
);

module.exports = router;
