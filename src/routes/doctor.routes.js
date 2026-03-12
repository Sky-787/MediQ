const { Router } = require('express');
const { getDoctors, getDoctorById, createDoctor, updateDoctor, deleteDoctor } = require('../controllers/doctor.controller');
const { authenticate } = require('../middlewares/auth.middleware');
const { authorize } = require('../middlewares/role.middleware');

const router = Router();

router.get('/', getDoctors);
router.get('/:id', getDoctorById);
router.post('/', authenticate, authorize('admin'), createDoctor);
router.put('/:id', authenticate, authorize('admin', 'medico'), updateDoctor);
router.delete('/:id', authenticate, authorize('admin'), deleteDoctor);

module.exports = router;
