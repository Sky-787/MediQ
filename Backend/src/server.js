const app = require('./app');
const { connectDB } = require('./config/db');
const { PORT } = require('./config/env');

const startServer = async () => {
  try {
    await connectDB();

    app.listen(PORT, () => {
      console.log('');
      console.log('🏥 ================================');
      console.log('   MediQ Backend API');
      console.log('🏥 ================================');
      console.log(`🚀 Servidor corriendo en: http://localhost:${PORT}`);
      console.log(`💚 Health check en:        http://localhost:${PORT}/api/health`);
      console.log('🏥 ================================');
      console.log('');
    });
  } catch (error) {
    console.error('❌ Error al iniciar el servidor:', error.message);
    process.exit(1);
  }
};

startServer();
