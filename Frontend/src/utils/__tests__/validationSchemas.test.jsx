import { describe, expect, it } from 'vitest';
import { loginSchema, registerSchema } from '../validationSchemas';

describe('validationSchemas', () => {
  it('acepta un login valido', () => {
    const result = loginSchema.safeParse({
      email: 'demo@mediq.com',
      contrasena: '123456',
    });

    expect(result.success).toBe(true);
  });

  it('rechaza emails invalidos y contrasenas cortas en login', () => {
    const result = loginSchema.safeParse({
      email: 'correo-invalido',
      contrasena: '123',
    });

    expect(result.success).toBe(false);
    expect(result.error.flatten().fieldErrors.email).toContain('Email inválido');
    expect(result.error.flatten().fieldErrors.contrasena).toContain('Mínimo 6 caracteres');
  });

  it('acepta un registro valido', () => {
    const result = registerSchema.safeParse({
      nombre: 'Laura',
      email: 'laura@mediq.com',
      contrasena: '123456',
      confirmarContrasena: '123456',
      rol: 'paciente',
    });

    expect(result.success).toBe(true);
  });

  it('rechaza registro con confirmacion distinta', () => {
    const result = registerSchema.safeParse({
      nombre: 'Laura',
      email: 'laura@mediq.com',
      contrasena: '123456',
      confirmarContrasena: '654321',
      rol: 'paciente',
    });

    expect(result.success).toBe(false);
    expect(result.error.flatten().fieldErrors.confirmarContrasena).toContain(
      'Las contraseñas no coinciden',
    );
  });
});
