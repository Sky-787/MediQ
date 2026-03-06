const { Router } = require('express');
const { getAppointments, getAppointmentById, createAppointment, updateAppointmentStatus, deleteAppointment } = require('../controllers/appointment.controller');
const { authenticate } = require('../middlewares/auth.middleware');
const { authorize } = require('../middlewares/role.middleware');

const router = Router();

router.use(authenticate);

router.get('/', getAppointments);
router.get('/:id', getAppointmentById);
router.post('/', authorize('paciente', 'admin'), createAppointment);
router.patch('/:id/status', authorize('medico', 'admin'), updateAppointmentStatus);
router.delete('/:id', deleteAppointment);

module.exports = router;
