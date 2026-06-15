jest.mock('../../src/models/User', () => ({
  findOne: jest.fn(),
  create: jest.fn(),
}));

jest.mock('../../src/utils/jwt', () => ({
  generateToken: jest.fn(() => 'token'),
  sendTokenCookie: jest.fn(),
  clearTokenCookie: jest.fn(),
}));

jest.mock('../../src/utils/response', () => ({
  sendSuccess: jest.fn(),
  sendCreated: jest.fn(),
}));

const User = require('../../src/models/User');
const jwtUtils = require('../../src/utils/jwt');
const responseUtils = require('../../src/utils/response');
const { login } = require('../../src/controllers/auth/login.controller');
const { register } = require('../../src/controllers/auth/register.controller');
const { logout, getMe } = require('../../src/controllers/auth/session.controller');

const createRes = () => ({
  status: jest.fn().mockReturnThis(),
  json: jest.fn().mockReturnThis(),
});

describe('auth controllers', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('register rechaza rol no público y email duplicado', async () => {
    const res = createRes();
    const next = jest.fn();

    await register({ body: { rol: 'admin' } }, res, next);
    expect(res.status).toHaveBeenCalledWith(403);

    User.findOne.mockResolvedValueOnce({ _id: 'exists' });
    await register({ body: { nombre: 'A', email: 'a@test.com', contrasena: '123456', rol: 'paciente' } }, res, next);
    expect(res.status).toHaveBeenCalledWith(409);
  });

  it('register crea usuario paciente por defecto', async () => {
    const res = createRes();
    const next = jest.fn();
    User.findOne.mockResolvedValueOnce(null);
    User.create.mockResolvedValueOnce({
      _id: 'u1',
      nombre: 'Ana',
      email: 'ana@test.com',
      rol: 'paciente',
    });

    await register({ body: { nombre: 'Ana', email: 'ana@test.com', contrasena: '123456' } }, res, next);

    expect(User.create).toHaveBeenCalledWith(expect.objectContaining({ rol: 'paciente' }));
    expect(jwtUtils.generateToken).toHaveBeenCalledWith('u1');
    expect(responseUtils.sendCreated).toHaveBeenCalled();
  });

  it('login cubre usuario inexistente, contraseña inválida y éxito', async () => {
    const res = createRes();
    const next = jest.fn();

    User.findOne.mockReturnValueOnce({
      select: jest.fn().mockResolvedValue(null),
    });
    await login({ body: { email: 'x@test.com', contrasena: 'bad' } }, res, next);
    expect(res.status).toHaveBeenCalledWith(401);

    User.findOne.mockReturnValueOnce({
      select: jest.fn().mockResolvedValue({
        compararContrasena: jest.fn().mockResolvedValue(false),
      }),
    });
    await login({ body: { email: 'x@test.com', contrasena: 'bad' } }, res, next);
    expect(res.status).toHaveBeenCalledWith(401);

    User.findOne.mockReturnValueOnce({
      select: jest.fn().mockResolvedValue({
        _id: 'u1',
        nombre: 'Ana',
        email: 'ana@test.com',
        rol: 'paciente',
        compararContrasena: jest.fn().mockResolvedValue(true),
      }),
    });
    await login({ body: { email: 'ana@test.com', contrasena: '123456' } }, res, next);
    expect(jwtUtils.sendTokenCookie).toHaveBeenCalled();
    expect(responseUtils.sendSuccess).toHaveBeenCalled();
  });

  it('logout y getMe usan helpers correctamente', async () => {
    const res = createRes();
    const next = jest.fn();

    await logout({}, res, next);
    expect(jwtUtils.clearTokenCookie).toHaveBeenCalledWith(res);
    expect(responseUtils.sendSuccess).toHaveBeenCalledWith(res, null, 'Sesión cerrada correctamente');

    await getMe({ user: { _id: 'u1' } }, res, next);
    expect(responseUtils.sendSuccess).toHaveBeenCalledWith(res, { _id: 'u1' });
  });
});
