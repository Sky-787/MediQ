jest.mock('../../src/config/env', () => ({
  JWT_SECRET: 'secret',
  JWT_EXPIRES_IN: '7d',
  COOKIE_NAME: 'token',
  COOKIE_MAX_AGE: 123456,
  NODE_ENV: 'development',
}));

jest.mock('jsonwebtoken', () => ({
  sign: jest.fn(() => 'signed-token'),
  verify: jest.fn(),
}));

jest.mock('express-validator', () => ({
  validationResult: jest.fn(),
}));

jest.mock('../../src/models/User', () => ({
  findById: jest.fn(),
}));

const jwt = require('jsonwebtoken');
const { validationResult } = require('express-validator');
const User = require('../../src/models/User');
const { sendSuccess, sendCreated, sendPaginated } = require('../../src/utils/response');
const {
  generateToken,
  sendTokenCookie,
  clearTokenCookie,
  isSecureDeployment,
} = require('../../src/utils/jwt');
const { validateRequest, validateMotivo } = require('../../src/utils/validators');
const { authenticate } = require('../../src/middlewares/auth.middleware');
const { authorize, authorizeOwnerOrAdmin } = require('../../src/middlewares/role.middleware');
const { errorHandler, notFound } = require('../../src/middlewares/error.middleware');

const createRes = () => ({
  status: jest.fn().mockReturnThis(),
  json: jest.fn().mockReturnThis(),
  cookie: jest.fn(),
  clearCookie: jest.fn(),
});

describe('utils/response', () => {
  it('sendSuccess responde con data opcional', () => {
    const res = createRes();
    sendSuccess(res, { ok: true }, 'Listo', 202);

    expect(res.status).toHaveBeenCalledWith(202);
    expect(res.json).toHaveBeenCalledWith({
      success: true,
      message: 'Listo',
      data: { ok: true },
    });
  });

  it('sendSuccess omite data cuando recibe null', () => {
    const res = createRes();
    sendSuccess(res, null, 'Sin datos');

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      success: true,
      message: 'Sin datos',
    });
  });

  it('sendCreated usa status 201', () => {
    const res = createRes();
    sendCreated(res, { id: 1 });

    expect(res.status).toHaveBeenCalledWith(201);
  });

  it('sendPaginated devuelve metadata correcta', () => {
    const res = createRes();
    sendPaginated(res, [1, 2], 11, '2', '5');

    expect(res.json).toHaveBeenCalledWith({
      success: true,
      data: [1, 2],
      pagination: {
        total: 11,
        page: 2,
        limit: 5,
        totalPages: 3,
      },
    });
  });
});

describe('utils/jwt', () => {
  const originalRender = process.env.RENDER;
  const originalRenderExternalUrl = process.env.RENDER_EXTERNAL_URL;

  afterEach(() => {
    process.env.RENDER = originalRender;
    process.env.RENDER_EXTERNAL_URL = originalRenderExternalUrl;
  });

  it('generateToken firma con el secreto configurado', () => {
    expect(generateToken('user-1')).toBe('signed-token');
    expect(jwt.sign).toHaveBeenCalledWith({ id: 'user-1' }, 'secret', { expiresIn: '7d' });
  });

  it('sendTokenCookie configura cookie httpOnly', () => {
    delete process.env.RENDER;
    delete process.env.RENDER_EXTERNAL_URL;

    const res = createRes();
    sendTokenCookie(res, 'token');

    expect(res.cookie).toHaveBeenCalledWith('token', 'token', expect.objectContaining({
      httpOnly: true,
      sameSite: 'lax',
      secure: false,
      maxAge: 123456,
    }));
  });

  it('clearTokenCookie limpia cookie de sesión', () => {
    delete process.env.RENDER;
    delete process.env.RENDER_EXTERNAL_URL;

    const res = createRes();
    clearTokenCookie(res);

    expect(res.clearCookie).toHaveBeenCalledWith('token', expect.objectContaining({
      httpOnly: true,
      sameSite: 'lax',
      secure: false,
    }));
  });

  it('detecta despliegues seguros en Render aunque NODE_ENV no sea production', () => {
    process.env.RENDER = 'true';
    delete process.env.RENDER_EXTERNAL_URL;

    expect(isSecureDeployment()).toBe(true);

    const res = createRes();
    sendTokenCookie(res, 'token');

    expect(res.cookie).toHaveBeenCalledWith('token', 'token', expect.objectContaining({
      httpOnly: true,
      sameSite: 'none',
      secure: true,
      maxAge: 123456,
    }));
  });
});

describe('utils/validators', () => {
  it('validateMotivo cubre vacío, corto y válido', () => {
    expect(validateMotivo('')).toEqual({
      valid: false,
      message: 'El motivo de la cita es obligatorio',
    });
    expect(validateMotivo('corto')).toEqual({
      valid: false,
      message: 'El motivo debe tener al menos 10 caracteres',
    });
    expect(validateMotivo('motivo suficientemente largo')).toEqual({ valid: true });
  });

  it('validateRequest responde 400 cuando hay errores', () => {
    const req = {};
    const res = createRes();
    const next = jest.fn();
    validationResult.mockReturnValueOnce({
      isEmpty: () => false,
      array: () => [{ path: 'email', msg: 'invalido' }],
    });

    validateRequest(req, res, next);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(next).not.toHaveBeenCalled();
  });
});

describe('middlewares/auth', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('rechaza cuando no hay token', async () => {
    const req = { cookies: {} };
    const res = createRes();
    const next = jest.fn();

    await authenticate(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
  });

  it('rechaza cuando el usuario no existe', async () => {
    jwt.verify.mockReturnValueOnce({ id: 'u1' });
    User.findById.mockReturnValueOnce({
      select: jest.fn().mockResolvedValue(null),
    });

    const req = { cookies: { token: 'abc' } };
    const res = createRes();
    const next = jest.fn();

    await authenticate(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
  });

  it('inyecta req.user cuando el token es válido', async () => {
    const user = { _id: 'u1', nombre: 'Ana' };
    jwt.verify.mockReturnValueOnce({ id: 'u1' });
    User.findById.mockReturnValueOnce({
      select: jest.fn().mockResolvedValue(user),
    });

    const req = { cookies: { token: 'abc' } };
    const res = createRes();
    const next = jest.fn();

    await authenticate(req, res, next);

    expect(req.user).toBe(user);
    expect(next).toHaveBeenCalled();
  });

  it('maneja JsonWebTokenError y TokenExpiredError', async () => {
    const req = { cookies: { token: 'abc' } };
    const res = createRes();
    const next = jest.fn();

    jwt.verify.mockImplementationOnce(() => {
      const error = new Error('bad');
      error.name = 'JsonWebTokenError';
      throw error;
    });
    await authenticate(req, res, next);
    expect(res.status).toHaveBeenCalledWith(401);

    res.status.mockClear();
    jwt.verify.mockImplementationOnce(() => {
      const error = new Error('expired');
      error.name = 'TokenExpiredError';
      throw error;
    });
    await authenticate(req, res, next);
    expect(res.status).toHaveBeenCalledWith(401);
  });
});

describe('middlewares/role', () => {
  it('authorize cubre 401, 403 y next', () => {
    const res = createRes();
    const next = jest.fn();

    authorize('admin')({}, res, next);
    expect(res.status).toHaveBeenCalledWith(401);

    authorize('admin')({ user: { rol: 'paciente' } }, res, next);
    expect(res.status).toHaveBeenCalledWith(403);

    authorize('admin')({ user: { rol: 'admin' } }, res, next);
    expect(next).toHaveBeenCalled();
  });

  it('authorizeOwnerOrAdmin cubre 401, 403, owner y admin', () => {
    const res = createRes();
    const next = jest.fn();

    authorizeOwnerOrAdmin()({ params: {} }, res, next);
    expect(res.status).toHaveBeenCalledWith(401);

    authorizeOwnerOrAdmin()(
      { user: { rol: 'paciente', _id: { toString: () => '1' } }, params: { id: '2' } },
      res,
      next,
    );
    expect(res.status).toHaveBeenCalledWith(403);

    authorizeOwnerOrAdmin()(
      { user: { rol: 'paciente', _id: { toString: () => '2' } }, params: { id: '2' } },
      res,
      next,
    );
    authorizeOwnerOrAdmin()(
      { user: { rol: 'admin', _id: { toString: () => '1' } }, params: { id: '2' } },
      res,
      next,
    );
    expect(next).toHaveBeenCalledTimes(2);
  });
});

describe('middlewares/error', () => {
  it('errorHandler cubre validation, duplicate y cast error', () => {
    const res = createRes();

    errorHandler({
      name: 'ValidationError',
      errors: { a: { message: 'fallo A' }, b: { message: 'fallo B' } },
      stack: 'stack',
    }, {}, res);
    expect(res.status).toHaveBeenCalledWith(400);

    errorHandler({
      code: 11000,
      keyValue: { email: 'x@test.com' },
      message: 'dup',
      stack: 'stack',
    }, {}, res);
    expect(res.status).toHaveBeenCalledWith(409);

    errorHandler({
      name: 'CastError',
      value: 'bad-id',
      stack: 'stack',
    }, {}, res);
    expect(res.status).toHaveBeenCalledWith(400);
  });

  it('notFound crea error 404 y llama next', () => {
    const next = jest.fn();
    notFound({ originalUrl: '/missing' }, {}, next);
    expect(next).toHaveBeenCalledWith(expect.objectContaining({
      statusCode: 404,
      message: 'Ruta no encontrada: /missing',
    }));
  });
});
