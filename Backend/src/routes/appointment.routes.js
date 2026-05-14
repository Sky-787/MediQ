const { Router } = require('express');
const { getAppointments, getAppointmentById, createAppointment, updateAppointmentStatus, deleteAppointment } = require('../controllers/appointment.controller');
const { authenticate, authorize } = require('../middlewares');

const router = Router();

router.use(authenticate);

router.get('/', getAppointments);
router.get('/:id', getAppointmentById);
router.post('/', authorize('paciente', 'admin'), createAppointment);
router.patch('/:id/status', authorize('medico', 'admin'), updateAppointmentStatus);
router.delete('/:id', authorize('admin'), deleteAppointment);

module.exports = router;
