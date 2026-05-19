const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const cookieParser = require('cookie-parser');
const swaggerUi = require('swagger-ui-express');
const YAML = require('yamljs');
const path = require('path');
const rateLimit = require('express-rate-limit');

const { CORS_ORIGIN, NODE_ENV } = require('./config/env');
const routes = require('./routes');
const { errorHandler, notFound } = require('./middlewares');

const app = express();

app.use(
  cors({
    origin: CORS_ORIGIN,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  }),
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

if (NODE_ENV !== 'test') {
  app.use(morgan('dev'));
}

// Rate limiting para rutas de autenticación (protección contra fuerza bruta)
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // ventana de 15 minutos
  max: 20,                   // máx 20 intentos por IP
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Demasiados intentos. Intenta de nuevo en 15 minutos.',
  },
  skip: () => NODE_ENV === 'test', // no limitar en tests
});

app.use('/api/auth/login', authLimiter);
app.use('/api/auth/register', authLimiter);

app.use('/api', routes);

const swaggerDocument = YAML.load(path.join(__dirname, '../swagger-spec.yml'));
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

app.get('/', (req, res) => {
  res.json({
    message: 'Bienvenido a MediQ API 🏥',
    health: '/api/health',
  });
});

app.use(notFound);
app.use(errorHandler);

module.exports = app;
