import { z } from 'zod'

export const loginSchema = z.object({
  email: z.string().email('Email inválido').min(1, 'El email es requerido'),
  contrasena: z.string().min(6, 'Mínimo 6 caracteres'),
})

export const registerSchema = z.object({
  nombre: z.string().min(2, 'El nombre debe tener al menos 2 caracteres'),
  email: z.string().email('Email inválido'),
  contrasena: z.string().min(6, 'Mínimo 6 caracteres'),
  confirmarContrasena: z.string(),
  rol: z.enum(['paciente'], { message: 'Rol inválido' }),
}).refine(d => d.contrasena === d.confirmarContrasena, {
  message: 'Las contraseñas no coinciden',
  path: ['confirmarContrasena'],
})
