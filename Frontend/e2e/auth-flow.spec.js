import { test, expect } from '@playwright/test';

test.describe('Flujo de Autenticación y Funcionalidades Principales', () => {
  
  test('debe mostrar errores de validación en el formulario de inicio de sesión', async ({ page }) => {
    await page.goto('/login');

    // Intentar iniciar sesión con campos vacíos
    await page.click('button[type="submit"]');

    // Deben mostrarse mensajes de validación
    // En Zod, si el email está vacío o es inválido, muestra "Email inválido"
    await expect(page.locator('text=Email inválido')).toBeVisible();
    await expect(page.locator('text=Mínimo 6 caracteres')).toBeVisible();

    // Intentar con un formato de email inválido
    await page.fill('#email', 'correo-invalido');
    await page.fill('#contrasena', '123');
    await page.click('button[type="submit"]');

    await expect(page.locator('text=Email inválido')).toBeVisible();
    await expect(page.locator('text=Mínimo 6 caracteres')).toBeVisible();
  });

  test('debe mostrar errores de validación en el formulario de registro', async ({ page }) => {
    await page.goto('/register');

    // Intentar registrarse con campos vacíos
    await page.click('button[type="submit"]');

    // Validar mensajes
    await expect(page.locator('text=El nombre debe tener al menos 2 caracteres')).toBeVisible();
    await expect(page.locator('text=Email inválido')).toBeVisible();
    await expect(page.locator('text=Mínimo 6 caracteres')).toBeVisible();

    // Intentar con contraseñas que no coinciden
    await page.fill('#nombre', 'Juan Pérez');
    await page.fill('#email', 'juan@mediq.com');
    await page.fill('#contrasena', '123456');
    await page.fill('#confirmarContrasena', '654321');
    await page.click('button[type="submit"]');

    await expect(page.locator('text=Las contraseñas no coinciden')).toBeVisible();
  });

  test('debe iniciar sesión con éxito, realizar una búsqueda de médico y cerrar sesión', async ({ page }) => {
    await page.goto('/login');
    await page.fill('#email', 'paciente@mediq.com');
    await page.fill('#contrasena', 'Paciente123*');
    await page.click('button[type="submit"]');

    await expect(page).toHaveURL(/\/patient\/search/);
    const searchInput = page.locator('input[placeholder="Especialidad"]');
    await expect(searchInput).toBeVisible();
    await searchInput.fill('Cardiología');

    const doctorCard = page.locator('text=Doctor Demo');
    await expect(doctorCard).toBeVisible();

    await page.getByRole('button', { name: 'Ver disponibilidad' }).click();

    await expect(page.getByRole('heading', { level: 3, name: /Disponibilidad — Doctor Demo/ })).toBeVisible();
    
    await expect(page.getByRole('button', { name: /Lunes/ })).toBeVisible();

    await page.getByRole('button', { name: 'Cerrar', exact: true }).click();
    await expect(page.getByRole('heading', { level: 3, name: /Disponibilidad — Doctor Demo/ })).not.toBeVisible();

    await page.getByRole('button', { name: 'Cerrar sesión' }).click();

    await expect(page).toHaveURL(/\/login/);
    await expect(page.locator('h2')).toContainText('Iniciar Sesión en MediQ');
  });

});
