const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../src/app');
const User = require('../src/models/User');

beforeAll(async () => {
  require('dotenv').config();
  const uri = process.env.MONGODB_URI 
    ? process.env.MONGODB_URI.replace('mediq_db', 'mediq_test') 
    : 'mongodb://127.0.0.1:27017/mediq_test';
  await mongoose.connect(uri);
  await User.deleteMany({});
});

afterAll(async () => {
  await mongoose.connection.close();
});

describe('Auth Flow', () => {
  let cookie;

  it('POST /api/auth/register debe registrar un usuario (201)', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({
        nombre: 'Juan Perez',
        email: 'juan@test.com',
        contrasena: '12345678',
        rol: 'paciente'
      });
    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
  });

  it('POST /api/auth/login debe iniciar sesión y devolver cookie (200)', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'juan@test.com',
        contrasena: '12345678'
      });
    expect(res.status).toBe(200);
    expect(res.headers['set-cookie']).toBeDefined();
    cookie = res.headers['set-cookie'];
  });

  it('GET /api/auth/me debe validar el perfil usando la cookie del paso anterior (200)', async () => {
    const res = await request(app)
      .get('/api/auth/me')
      .set('Cookie', cookie);
    expect(res.status).toBe(200);
    expect(res.body.data.email).toBe('juan@test.com');
  });
});
