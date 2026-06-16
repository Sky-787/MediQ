const app = require('./app');
const mongoose = require('mongoose');
const { PORT, MONGODB_URI } = require('./config/env');

mongoose.connect(MONGODB_URI)
  .then(() => {
    console.log('✅ MongoDB conectado');
    app.listen(PORT, () => {
      console.log(`🚀 Servidor en: http://localhost:${PORT}`);
      console.log(`📖 Swagger en: http://localhost:${PORT}/api-docs`);
    });
  })
  .catch((err) => console.error('❌ Error DB:', err));