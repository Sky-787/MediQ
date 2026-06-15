const request = require('supertest');

describe('app, env, routes and model coverage', () => {
  afterEach(() => {
    jest.resetModules();
    jest.clearAllMocks();
    delete process.env.MONGODB_URI;
    delete process.env.JWT_SECRET;
    delete process.env.JWT_EXPIRES_IN;
    delete process.env.COOKIE_NAME;
    delete process.env.COOKIE_MAX_AGE;
    delete process.env.CORS_ORIGIN;
    delete process.env.PORT;
    delete process.env.NODE_ENV;
  });

  it('routes index expone /health', async () => {
    jest.doMock('../../src/routes/auth.routes', () => {
      const express = require('express');
      return express.Router();
    });
    jest.doMock('../../src/routes/user.routes', () => {
      const express = require('express');
      return express.Router();
    });
    jest.doMock('../../src/routes/doctor.routes', () => {
      const express = require('express');
      return express.Router();
    });
    jest.doMock('../../src/routes/appointment.routes', () => {
      const express = require('express');
      return express.Router();
    });
    jest.doMock('../../src/routes/report.routes', () => {
      const express = require('express');
      return express.Router();
    });

    const router = require('../../src/routes');
    const express = require('express');
    const app = express();
    app.use('/api', router);

    const response = await request(app).get('/api/health');
    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
  });

  it('env.js usa defaults y valores personalizados', () => {
    process.env.MONGODB_URI = 'mongodb://localhost:27017/mediq';
    process.env.JWT_SECRET = '12345678901234567890123456789012';
    process.env.CORS_ORIGIN = 'http://localhost:5173,https://frontend.onrender.com';
    process.env.PORT = '7000';
    process.env.NODE_ENV = 'development';
    process.env.JWT_EXPIRES_IN = '3d';
    process.env.COOKIE_NAME = 'session';
    process.env.COOKIE_MAX_AGE = '9999';

    const env = require('../../src/config/env');
    expect(env.PORT).toBe('7000');
    expect(env.JWT_EXPIRES_IN).toBe('3d');
    expect(env.COOKIE_NAME).toBe('session');
    expect(env.COOKIE_MAX_AGE).toBe(9999);
    expect(env.CORS_ORIGIN).toContain('https://frontend.onrender.com');
  });

  it('env.js aplica defaults cuando no se definen opcionales', () => {
    jest.resetModules();
    jest.doMock('dotenv', () => ({ config: jest.fn() }));
    process.env.MONGODB_URI = 'mongodb://localhost:27017/mediq';
    process.env.JWT_SECRET = '12345678901234567890123456789012';
    delete process.env.PORT;
    delete process.env.NODE_ENV;
    delete process.env.JWT_EXPIRES_IN;
    delete process.env.COOKIE_NAME;
    delete process.env.COOKIE_MAX_AGE;
    delete process.env.CORS_ORIGIN;

    const env = require('../../src/config/env');
    expect(env.PORT).toBe(5000);
    expect(env.NODE_ENV).toBe('development');
    expect(env.JWT_EXPIRES_IN).toBe('7d');
    expect(env.COOKIE_NAME).toBe('token');
    expect(env.CORS_ORIGIN).toBe('http://localhost:5173,http://localhost:3000');
  });

  it('env.js falla si falta una variable requerida', () => {
    jest.resetModules();
    jest.doMock('dotenv', () => ({ config: jest.fn() }));
    const exitSpy = jest.spyOn(process, 'exit').mockImplementation(() => {
      throw new Error('exit');
    });
    const errorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

    delete process.env.MONGODB_URI;
    process.env.JWT_SECRET = '12345678901234567890123456789012';

    expect(() => require('../../src/config/env')).toThrow('exit');
    expect(errorSpy).toHaveBeenCalled();

    exitSpy.mockRestore();
    errorSpy.mockRestore();
  });

  it('env.js falla en produccion si JWT_SECRET es corto', () => {
    jest.resetModules();
    const exitSpy = jest.spyOn(process, 'exit').mockImplementation(() => {
      throw new Error('exit');
    });
    const errorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

    process.env.MONGODB_URI = 'mongodb://localhost:27017/mediq';
    process.env.JWT_SECRET = 'corta';
    process.env.NODE_ENV = 'production';

    expect(() => require('../../src/config/env')).toThrow('exit');
    expect(errorSpy).toHaveBeenCalled();

    exitSpy.mockRestore();
    errorSpy.mockRestore();
  });

  it('User model cubre compare y toPublicJSON', async () => {
    const User = require('../../src/models/User');
    const user = new User({
      nombre: 'Ana',
      email: 'ana@test.com',
      contrasena: '12345678',
      rol: 'paciente',
      estado: 'activo',
    });

    user.contrasena = await require('bcryptjs').hash('12345678', 10);

    await expect(user.compararContrasena('12345678')).resolves.toBe(true);
    expect(user.toPublicJSON()).toEqual(expect.objectContaining({
      nombre: 'Ana',
      email: 'ana@test.com',
      rol: 'paciente',
      estado: 'activo',
    }));
  });

  it('app responde en / y filtra CORS permitido', async () => {
    process.env.MONGODB_URI = 'mongodb://localhost:27017/mediq';
    process.env.JWT_SECRET = '12345678901234567890123456789012';
    process.env.NODE_ENV = 'test';
    process.env.CORS_ORIGIN = 'http://localhost:5173,https://frontend.onrender.com';

    jest.doMock('../../src/routes', () => {
      const express = require('express');
      const router = express.Router();
      router.get('/health', (req, res) => res.json({ ok: true }));
      return router;
    });
    jest.doMock('../../src/middlewares', () => ({
      notFound: (req, res) => res.status(404).json({ success: false }),
      errorHandler: (err, req, res) => res.status(500).json({ success: false, message: err.message }),
    }));

    const app = require('../../src/app');
    const rootResponse = await request(app).get('/');
    expect(rootResponse.status).toBe(200);
    expect(rootResponse.body.health).toBe('/api/health');

    const optionsResponse = await request(app)
      .options('/api/health')
      .set('Origin', 'https://frontend.onrender.com')
      .set('Access-Control-Request-Method', 'GET');

    expect(optionsResponse.status).toBe(204);
    expect(optionsResponse.headers['access-control-allow-origin']).toBe('https://frontend.onrender.com');
  });

  it('app registra morgan cuando NODE_ENV no es test', async () => {
    process.env.MONGODB_URI = 'mongodb://localhost:27017/mediq';
    process.env.JWT_SECRET = '12345678901234567890123456789012';
    process.env.NODE_ENV = 'development';

    const useMock = jest.fn();
    const getMock = jest.fn();
    const appMock = { use: useMock, get: getMock };
    const morganMock = jest.fn(() => 'morgan-middleware');
    const rateLimitMock = jest.fn(() => 'rate-limit-middleware');
    const swaggerSetupMock = jest.fn(() => 'swagger-setup');

    jest.doMock('express', () => {
      const express = jest.fn(() => appMock);
      express.json = jest.fn(() => 'json-middleware');
      express.urlencoded = jest.fn(() => 'urlencoded-middleware');
      return express;
    });
    jest.doMock('cors', () => jest.fn(() => 'cors-middleware'));
    jest.doMock('morgan', () => morganMock);
    jest.doMock('cookie-parser', () => jest.fn(() => 'cookie-middleware'));
    jest.doMock('yamljs', () => ({ load: jest.fn(() => ({})) }));
    jest.doMock('swagger-ui-express', () => ({
      serve: 'swagger-serve',
      setup: swaggerSetupMock,
    }));
    jest.doMock('express-rate-limit', () => rateLimitMock);
    jest.doMock('../../src/routes', () => 'routes-middleware');
    jest.doMock('../../src/middlewares', () => ({
      notFound: 'not-found-middleware',
      errorHandler: 'error-middleware',
    }));

    require('../../src/app');

    expect(morganMock).toHaveBeenCalledWith('dev');
    expect(useMock).toHaveBeenCalledWith('morgan-middleware');
    expect(rateLimitMock).toHaveBeenCalled();
  });

  it('app rechaza un origen no permitido por CORS', async () => {
    process.env.MONGODB_URI = 'mongodb://localhost:27017/mediq';
    process.env.JWT_SECRET = '12345678901234567890123456789012';
    process.env.NODE_ENV = 'test';
    process.env.CORS_ORIGIN = 'https://frontend.onrender.com';
    jest.unmock('express');
    jest.unmock('cors');
    jest.unmock('morgan');
    jest.unmock('cookie-parser');
    jest.unmock('yamljs');
    jest.unmock('swagger-ui-express');
    jest.unmock('express-rate-limit');

    jest.doMock('../../src/routes', () => {
      const express = require('express');
      const router = express.Router();
      router.get('/health', (req, res) => res.json({ ok: true }));
      return router;
    });
    jest.doMock('../../src/middlewares', () => ({
      notFound: (req, res) => res.status(404).json({ success: false }),
      errorHandler: (err, req, res) => res.status(500).json({ success: false, message: err.message }),
    }));

    const app = require('../../src/app');
    const response = await request(app)
      .options('/api/health')
      .set('Origin', 'https://malicioso.example.com')
      .set('Access-Control-Request-Method', 'GET');

    expect(response.status).toBe(500);
    expect(response.headers['access-control-allow-origin']).toBeUndefined();
  });
});
