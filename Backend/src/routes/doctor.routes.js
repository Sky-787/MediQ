const { Router } = require('express');
const { getDoctors, getDoctorById, createDoctor, updateDoctor, deleteDoctor } = require('../controllers/doctor.controller');
const { authenticate, authorize } = require('../middlewares');

const router = Router();

router.get('/', authenticate, getDoctors);
router.get('/:id', authenticate, getDoctorById);
router.post('/', authenticate, authorize('admin'), createDoctor);
router.put('/:id', authenticate, authorize('admin', 'medico'), updateDoctor);
router.delete('/:id', authenticate, authorize('admin'), deleteDoctor);

module.exports = router;
