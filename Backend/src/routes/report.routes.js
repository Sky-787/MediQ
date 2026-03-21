const { Router } = require('express');

const { authenticate } = require('../middlewares/auth.middleware');
const { authorize } = require('../middlewares/role.middleware');

const {
  getOcupacion,
  getByEspecialidad,
  getByPeriodo,
} = require('../controllers/report.controller');

const router = Router();

// proteger TODO → solo admin
//router.use(authenticate, authorize('admin'));

router.get('/ocupacion', getOcupacion);
router.get('/especialidades', getByEspecialidad);
router.get('/periodo', getByPeriodo);

module.exports = router;