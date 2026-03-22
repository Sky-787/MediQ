const app = require('./app');
const mongoose = require('mongoose');
require('dotenv').config();

const PORT = process.env.PORT || 5000;

mongoose.connect(process.env.MONGODB_URI)
  .then(() => {
    console.log('✅ MongoDB conectado');
    app.listen(PORT, () => {
      console.log(`🚀 Servidor en: http://localhost:${PORT}`);
      console.log(`📖 Swagger en: http://localhost:${PORT}/api-docs`);
    });
  })
  .catch((err) => console.error('❌ Error DB:', err));