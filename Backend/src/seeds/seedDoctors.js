const Doctor = require('../models/Doctor');
const User = require('../models/User');

const seedDoctors = async () => {
  try {
    await Doctor.deleteMany({});

    const doctorUser = await User.findOne({
      email: 'doctor@mediq.com',
    });

    if (!doctorUser) {
      console.log('Usuario doctor no encontrado');
      return;
    }

    await Doctor.create({
      userId: doctorUser._id,
      especialidad: 'Cardiología',
      registroMedico: 'RM-1001',
      disponibilidad: [
        {
          dia: 'Lunes',
          horas: ['08:00-12:00'],
        },
      ],
    });

    console.log('Doctores seed creados');
  } catch (error) {
    console.error('Error seedDoctors:', error);
  }
};

module.exports = seedDoctors;