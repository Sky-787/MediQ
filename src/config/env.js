require('dotenv').config();

const requiredVars = ['MONGODB_URI', 'JWT_SECRET'];

requiredVars.forEach((varName) => {
  if (!process.env[varName]) {
    console.error(`❌ Variable de entorno requerida no encontrada: ${varName}`);
    process.exit(1);
  }
});

module.exports = {
  PORT: process.env.PORT || 5000,
  NODE_ENV: process.env.NODE_ENV || 'development',

  MONGODB_URI: process.env.MONGODB_URI,

  JWT_SECRET: process.env.JWT_SECRET,
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || '7d',

  COOKIE_NAME: process.env.COOKIE_NAME || 'token',
  COOKIE_MAX_AGE: parseInt(process.env.COOKIE_MAX_AGE) || 7 * 24 * 60 * 60 * 1000,

  CORS_ORIGIN: process.env.CORS_ORIGIN || 'http://localhost:5173',
};
