const { Router } = require('express');
const authRoutes = require('./auth.routes');
const userRoutes = require('./user.routes');
const doctorRoutes = require('./doctor.routes');
const appointmentRoutes = require('./appointment.routes');
const reportRoutes = require('./report.routes');

const router = Router();

router.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'MediQ API funcionando correctamente',
    timestamp: new Date().toISOString(),
    version: '1.0.0',
  });
});

router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/doctors', doctorRoutes);
router.use('/appointments', appointmentRoutes);
router.use('/reports', reportRoutes);

module.exports = router;
