const request = require('supertest');
const app = require('../src/app');
const User = require('../src/models/User');
const {
  connectTestDB,
  clearTestDB,
  disconnectTestDB,
} = require('./helpers/testDatabase');

beforeAll(async () => {
  await connectTestDB();
  await clearTestDB(User);
});

afterAll(async () => {
  await disconnectTestDB();
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
  it('POST /api/auth/login debe fallar con contraseña incorrecta (401)', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'juan@test.com',
        contrasena: 'wrongpassword'
      });
    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
  });

  it('POST /api/auth/logout debe cerrar sesión y limpiar cookie (200)', async () => {
    const res = await request(app)
      .post('/api/auth/logout')
      .set('Cookie', cookie);
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.message).toBe('Sesión cerrada correctamente');
  });

  it('POST /api/auth/logout también responde 200 aunque no llegue cookie', async () => {
    const res = await request(app).post('/api/auth/logout');

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });
});
