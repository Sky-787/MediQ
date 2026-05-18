const { Router } = require('express');
const {
  getDoctors,
  getDoctorById,
  createDoctor,
  updateDoctor,
  deleteDoctor,
} = require('../controllers/doctor.controller');

const { authenticate, authorize } = require('../middlewares');

const router = Router();

// Públicos
router.get('/', getDoctors);
router.get('/:id', getDoctorById);

// Protegidos
router.post('/', authenticate, authorize('admin'), createDoctor);

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

module.exports = router;s