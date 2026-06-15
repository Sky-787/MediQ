import { test, expect } from '@playwright/test';

test.describe('Navegación Inicial y Landing Page', () => {
  test('debe cargar la Landing Page con el título y las secciones correctas', async ({ page }) => {
    await page.goto('/');

    await expect(page.locator('h1')).toHaveText('Agenda tus citas médicas de forma rápida y clara');

    const iniciarSesionBtn = page.getByRole('button', { name: 'Iniciar sesión' });
    const crearCuentaBtn = page.getByRole('button', { name: 'Crear cuenta' });
    
    await expect(crearCuentaBtn).toBeVisible();
    await expect(iniciarSesionBtn).toBeVisible();

    await expect(page.getByText('1. Regístrate')).toBeVisible();
    await expect(page.getByText('2. Agenda')).toBeVisible();
    await expect(page.getByText('3. Gestiona')).toBeVisible();
  });

  test('debe navegar a la página de login al hacer clic en Iniciar Sesión', async ({ page }) => {
    await page.goto('/');
    
    await page.getByRole('button', { name: 'Iniciar sesión' }).click();

    await expect(page).toHaveURL(/\/login/);
    await expect(page.locator('h2')).toContainText('Iniciar Sesión en MediQ');
  });

  test('debe navegar a la página de registro al hacer clic en Reservar Cita', async ({ page }) => {
    await page.goto('/');
    
    await page.getByRole('button', { name: 'Crear cuenta' }).click();

    await expect(page).toHaveURL(/\/register/);
    await expect(page.locator('h2')).toContainText('Crea tu cuenta en MediQ');
  });
});
