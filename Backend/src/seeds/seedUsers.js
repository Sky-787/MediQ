const User = require('../models/User');

const seedUsers = async () => {
  try {
    // limpiar usuarios previos
    await User.deleteMany({});

    // crear usuarios
    await User.create([
      {
        nombre: 'Administrador',
        email: 'admin@mediq.com',
        contrasena: 'Admin123*',
        rol: 'admin',
        estado: 'activo',
      },
      {
        nombre: 'Doctor Demo',
        email: 'doctor@mediq.com',
        contrasena: 'Doctor123*',
        rol: 'medico',
        estado: 'activo',
      },
      {
        nombre: 'Paciente Demo',
        email: 'paciente@mediq.com',
        contrasena: 'Paciente123*',
        rol: 'paciente',
        estado: 'activo',
      },
      {
        nombre: 'Paciente Inactivo',
        email: 'inactivo@mediq.com',
        contrasena: 'Inactivo123*',
        rol: 'paciente',
        estado: 'inactivo',
      },
    ]);

    console.log('Usuarios seed creados');
  } catch (error) {
    console.error(error);
  }
};

module.exports = seedUsers;