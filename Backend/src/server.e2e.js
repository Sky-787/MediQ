// Debe estar ANTES de cualquier require para que los módulos lo lean correctamente
process.env.NODE_ENV = 'e2e';

require('dotenv').config();

const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');

process.env.JWT_SECRET = process.env.JWT_SECRET || 'supersecret_test_key_12345';

const seedUsers = require('./seeds/seedUsers');
const seedDoctors = require('./seeds/seedDoctors');
const seedAppointments = require('./seeds/seedAppointments');

let mongoServer;
let httpServer;

const start = async () => {
  try {
    mongoServer = await MongoMemoryServer.create();
    process.env.MONGODB_URI = mongoServer.getUri('mediq_e2e');

    const app = require('./app');
    const PORT = process.env.PORT || 5001;

    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ MongoDB en memoria listo para E2E');

    await seedUsers();
    await seedDoctors();
    await seedAppointments();
    console.log('✅ Datos E2E sembrados');

    httpServer = app.listen(PORT, () => {
      console.log(`🚀 Backend E2E en: http://127.0.0.1:${PORT}`);
    });
  } catch (error) {
    console.error('❌ Error levantando entorno E2E:', error);
    process.exit(1);
  }
};

const shutdown = async () => {
  try {
    if (httpServer) {
      await new Promise((resolve, reject) => {
        httpServer.close((error) => (error ? reject(error) : resolve()));
      });
    }

    await mongoose.connection.close();

    if (mongoServer) {
      await mongoServer.stop();
    }
  } catch (error) {
    console.error('❌ Error cerrando entorno E2E:', error);
  } finally {
    process.exit(0);
  }
};

process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);

start();
