const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const cookieParser = require('cookie-parser');

const { CORS_ORIGIN, NODE_ENV } = require('./config/env');
const routes = require('./routes');
const { errorHandler, notFound } = require('./middlewares/error.middleware');

const app = express();

app.use(cors({
  origin: CORS_ORIGIN,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

if (NODE_ENV !== 'test') {
  app.use(morgan('dev'));
}

app.use('/api', routes);

app.get('/', (req, res) => {
  res.json({
    message: 'Bienvenido a MediQ API 🏥',
    health: '/api/health',
  });
});

app.use(notFound);
app.use(errorHandler);

module.exports = app;
