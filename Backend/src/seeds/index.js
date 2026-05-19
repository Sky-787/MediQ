const mongoose = require('mongoose');
const { MONGODB_URI, NODE_ENV } = require('../config/env');

const seedUsers = require('./seedUsers');
const seedDoctors = require('./seedDoctors');
const seedAppointments = require('./seedAppointments');

const runSeeds = async () => {
  // Bloquear ejecución en producción para evitar borrar datos reales
  if (NODE_ENV === 'production') {
    console.error('❌ Los seeds no pueden ejecutarse en entorno de producción.');
    console.error('   Si realmente necesitas poblar la BD, hazlo manualmente.');
    process.exit(1);
  }

  try {
    await mongoose.connect(MONGODB_URI);

    console.log('MongoDB conectado');

    await seedUsers();
    await seedDoctors();
    await seedAppointments();

    console.log('Seeds ejecutados correctamente');

  } catch (error) {
    console.error('ERROR GENERAL EN SEEDS:', error);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
    process.exit();
  }
};

runSeeds();