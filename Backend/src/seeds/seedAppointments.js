const Appointment = require('../models/Appointment');
const User = require('../models/User');
const Doctor = require('../models/Doctor');

const seedAppointments = async () => {
  try {
    // limpiar citas previas
    await Appointment.deleteMany({});

    // buscar paciente
    const paciente = await User.findOne({
      email: 'paciente@mediq.com',
    });

    // buscar doctor
    const doctor = await Doctor.findOne({});

    if (!paciente || !doctor) {
      console.log('Faltan datos para citas');
      return;
    }

    // crear cita
    await Appointment.create([
      {
        pacienteId: paciente._id,
        doctorId: doctor._id,
        fechaHora: new Date(),
        estado: 'pendiente',
        motivo: 'Consulta general',
      },
    ]);

    console.log('Citas seed creadas');
  } catch (error) {
    console.error('Error seedAppointments:', error);
  }
};

module.exports = seedAppointments;