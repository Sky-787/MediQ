const { Router } = require('express');
const { authenticate, authorize } = require('../middlewares');
const { getOcupacion, getByEspecialidad, getByPeriodo } = require('../controllers/report.controller');

const router = Router();

// Todas las rutas de reportes: solo admin autenticado
router.use(authenticate, authorize('admin'));

router.get('/ocupacion', getOcupacion);
router.get('/especialidades', getByEspecialidad);
router.get('/periodo', getByPeriodo);

module.exports = router;
