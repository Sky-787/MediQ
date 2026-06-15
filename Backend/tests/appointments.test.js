const request = require('supertest');
const app = require('../src/app');
const Appointment = require('../src/models/Appointment');
const Doctor = require('../src/models/Doctor');
const User = require('../src/models/User');
const {
  connectTestDB,
  clearTestDB,
  disconnectTestDB,
} = require('./helpers/testDatabase');

let doctorDetails, pacienteCookie;

beforeAll(async () => {
  await connectTestDB();
  await clearTestDB(Appointment, Doctor, User);

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
  await request(app).post('/api/auth/register').send({
    nombre: 'Paciente Test', email: 'paciente@test.com', contrasena: '12345678', rol: 'paciente'
  });
  const resLoginPac = await request(app).post('/api/auth/login').send({
    email: 'paciente@test.com', contrasena: '12345678'
  });
  pacienteCookie = resLoginPac.headers['set-cookie'];
});

afterAll(async () => {
  await disconnectTestDB();
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

  it('GET /api/appointments debe devolver las citas del paciente (200)', async () => {
    const res = await request(app)
      .get('/api/appointments')
      .set('Cookie', pacienteCookie);
    expect(res.status).toBe(200);
    expect(res.body.data.length).toBeGreaterThan(0);
    expect(res.body.data[0]).toHaveProperty('_id');
  });

  it('PATCH /api/appointments/:id/status debe actualizar el estado si es médico (200)', async () => {
    // Obtener la cita
    const getRes = await request(app)
      .get('/api/appointments')
      .set('Cookie', pacienteCookie);
    const citaId = getRes.body.data[0]._id;

    // Login doctor
    const loginDoc = await request(app).post('/api/auth/login').send({
      email: 'house@test.com', contrasena: '12345678'
    });
    const docCookie = loginDoc.headers['set-cookie'];

    const patchRes = await request(app)
      .patch(`/api/appointments/${citaId}/status`)
      .set('Cookie', docCookie)
      .send({ estado: 'confirmada' });
    
    expect(patchRes.status).toBe(200);
    expect(patchRes.body.data.estado).toBe('confirmada');
  });

  it('DELETE /api/appointments/:id debe eliminar la cita (200)', async () => {
    // Obtener la cita
    const getRes = await request(app)
      .get('/api/appointments')
      .set('Cookie', pacienteCookie);
    const citaId = getRes.body.data[0]._id;

    // Crear y login admin directamente por modelo ya que API no permite
    await User.create({
      nombre: 'Admin Test', email: 'admin@test.com', contrasena: '12345678', rol: 'admin'
    });
    const loginAdmin = await request(app).post('/api/auth/login').send({
      email: 'admin@test.com', contrasena: '12345678'
    });
    const adminCookie = loginAdmin.headers['set-cookie'];

    const delRes = await request(app)
      .delete(`/api/appointments/${citaId}`)
      .set('Cookie', adminCookie);
    
    expect(delRes.status).toBe(200);
  });
});
