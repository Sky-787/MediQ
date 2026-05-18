const mongoose = require('mongoose');
const { MONGODB_URI } = require('../config/env');

const seedUsers = require('./seedUsers');
const seedDoctors = require('./seedDoctors');
const seedAppointments = require('./seedAppointments');

const runSeeds = async () => {
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