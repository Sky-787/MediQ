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
    // 1. Iniciar Sesión
    await page.goto('/login');
    await page.fill('#email', 'paciente@mediq.com');
    await page.fill('#contrasena', 'Paciente123*');
    await page.click('button[type="submit"]');

    // Debe redireccionar a la sección del paciente
    await expect(page).toHaveURL(/\/patient\/search/);
    await expect(page.locator('h2')).toContainText('Buscar Médico');

    // 2. Interacción con Datos (Flujo Principal - Buscar Médico)
    // Ingresar la especialidad "Cardiología" en el input
    const searchInput = page.locator('input[placeholder="Especialidad"]');
    await searchInput.fill('Cardiología');

    // Esperar a que se aplique el debounce y se renderice el médico
    const doctorCard = page.locator('text=Doctor Demo');
    await expect(doctorCard).toBeVisible();

    // Hacer clic en "Ver disponibilidad"
    await page.click('button:has-text("Ver disponibilidad")');

    // Verificar que el modal de disponibilidad se abra con el título del médico
    await expect(page.locator('h3')).toContainText('Disponibilidad — Doctor Demo');
    
    // Verificar que se muestre el día disponible "Lunes"
    await expect(page.locator('text=Lunes')).toBeVisible();

    // Cerrar el modal
    await page.getByRole('button', { name: 'Cerrar', exact: true }).click();
    await expect(page.locator('h3')).not.toBeVisible();

    // 3. Cierre de Sesión (Logout)
    // Hacer clic en el botón de "Cerrar sesión" en la barra de navegación
    await page.click('button:has-text("Cerrar sesión")');

    // Debe redireccionar a la página de login
    await expect(page).toHaveURL(/\/login/);
    await expect(page.locator('h2')).toContainText('Iniciar Sesión en MediQ');
  });

});
