/**
 * Barrel de middlewares.
 * Permite importar todos los middlewares desde un solo punto:
 *
 *   const { authenticate, authorize, authorizeOwnerOrAdmin } = require('../middlewares');
 */
const { authenticate } = require('./auth.middleware');
const { authorize, authorizeOwnerOrAdmin } = require('./role.middleware');
const { errorHandler, notFound } = require('./error.middleware');

module.exports = { authenticate, authorize, authorizeOwnerOrAdmin, errorHandler, notFound };
