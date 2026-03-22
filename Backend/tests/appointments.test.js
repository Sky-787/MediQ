const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../src/app');
const Appointment = require('../src/models/Appointment');
const Doctor = require('../src/models/Doctor');
const User = require('../src/models/User');

let doctorDetails, pacienteCookie;

beforeAll(async () => {
  require('dotenv').config();
  const uri = process.env.MONGODB_URI 
    ? process.env.MONGODB_URI.replace('mediq_db', 'mediq_test') 
    : 'mongodb://127.0.0.1:27017/mediq_test';
  await mongoose.connect(uri);
  await Appointment.deleteMany({});
  await Doctor.deleteMany({});
  await User.deleteMany({});

  // Crear médico
  const resDoc = await request(app).post('/api/auth/register').send({
    nombre: 'Dr. House', email: 'house@test.com', contrasena: '12345678', rol: 'medico'
  });
  let docUserId;
  if (resDoc.status === 201 && resDoc.body.data) {
    docUserId = resDoc.body.data._id;
  } else {
    const docUser = await User.findOne({ email: 'house@test.com' });
    docUserId = docUser ? docUser._id : null;
  }
  
  if (!docUserId) throw new Error("Could not create doctor user: " + JSON.stringify(resDoc.body));
  
  doctorDetails = await Doctor.create({ 
    userId: docUserId, 
    especialidad: 'General', 
    experiencia: 5,
    registroMedico: 'RM-12345'
  });

  // Crear paciente
  const resPac = await request(app).post('/api/auth/register').send({
    nombre: 'Paciente Test', email: 'paciente@test.com', contrasena: '12345678', rol: 'paciente'
  });
  const resLoginPac = await request(app).post('/api/auth/login').send({
    email: 'paciente@test.com', contrasena: '12345678'
  });
  pacienteCookie = resLoginPac.headers['set-cookie'];
});

afterAll(async () => {
  await mongoose.connection.close();
});

describe('Appointments Conflict', () => {
  it('Intentar crear una cita en un horario ya ocupado por el mismo médico debe devolver un error 409 (Conflict)', async () => {
    const fechaHora = new Date();
    fechaHora.setHours(fechaHora.getHours() + 24); // Mañana

    // 1. Crear primera cita (éxito)
    const res1 = await request(app)
      .post('/api/appointments')
      .set('Cookie', pacienteCookie)
      .send({
        doctorId: doctorDetails._id,
        fechaHora: fechaHora.toISOString(),
        motivo: 'Dolor de cabeza'
      });
    expect(res1.status).toBe(201); // O el estado que devuelva tu controlador por éxito

    // 2. Intentar crear segunda cita en el mismo horario y médico
    const res2 = await request(app)
      .post('/api/appointments')
      .set('Cookie', pacienteCookie)
      .send({
        doctorId: doctorDetails._id,
        fechaHora: fechaHora.toISOString(),
        motivo: 'Dolor de espalda'
      });
    
    expect(res2.status).toBe(409);
    expect(res2.body.message).toBe('El médico ya tiene una cita en ese horario');
  });
});
