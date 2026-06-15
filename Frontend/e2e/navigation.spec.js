import { test, expect } from '@playwright/test';

test.describe('Navegación Inicial y Landing Page', () => {
  test('debe cargar la Landing Page con el título y las secciones correctas', async ({ page }) => {
    // Ir a la página de inicio
    await page.goto('/');

    // Verificar el título principal
    await expect(page.locator('h1')).toHaveText('Tu salud, en tus manos');

    // Verificar que existen los botones de acción principales
    const reservarBtn = page.locator('button:has-text("Reservar Cita")');
    const iniciarSesionBtn = page.locator('button:has-text("Iniciar Sesión")');
    await expect(reservarBtn).toBeVisible();
    await expect(iniciarSesionBtn).toBeVisible();

    // Verificar las características principales
    await expect(page.locator('text=Reserva Fácil')).toBeVisible();
    await expect(page.locator('text=Médicos Certificados')).toBeVisible();
  });

  test('debe navegar a la página de login al hacer clic en Iniciar Sesión', async ({ page }) => {
    await page.goto('/');
    
    // Hacer clic en "Iniciar Sesión"
    await page.click('button:has-text("Iniciar Sesión")');

    // Verificar la URL
    await expect(page).toHaveURL(/\/login/);

    // Verificar que el título de login esté visible
    await expect(page.locator('h2')).toContainText('Iniciar Sesión en MediQ');
  });

  test('debe navegar a la página de registro al hacer clic en Reservar Cita', async ({ page }) => {
    await page.goto('/');
    
    // Hacer clic en "Reservar Cita"
    await page.click('button:has-text("Reservar Cita")');

    // Verificar la URL
    await expect(page).toHaveURL(/\/register/);

    // Verificar que el título de registro esté visible
    await expect(page.locator('h2')).toContainText('Crea tu cuenta en MediQ');
  });
});
