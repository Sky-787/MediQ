# 🧪 DOCUMENTACIÓN PRUEBAS END-TO-END (E2E) - MediQ Frontend

**Objetivo:** Validar flujos críticos de usuario (navegación, validación, login, búsquedas y logout) simulando el comportamiento real del navegador con Playwright.
**Integrante:** Farid
**Fecha:** 13 de Junio de 2026
**Estado:** ✅ COMPLETADO

---

## 🎯 Objetivo

Implementar pruebas automatizadas de extremo a extremo que garanticen la estabilidad de los flujos de usuario más críticos y su correcta integración con la API del backend.

---

## 🛠️ Casos de Prueba Implementados

Las pruebas E2E están divididas en dos archivos de especificación:

### 1. `Frontend/e2e/navigation.spec.js` (Navegación e Interfaz Inicial)
- **Carga de Landing Page**: Valida que la página de inicio renderice correctamente el título de la marca, los llamados a la acción ("Reservar Cita", "Iniciar Sesión") y las tarjetas de características principales.
- **Navegación a Login**: Verifica que al hacer clic en "Iniciar Sesión" redirija a `/login` y cargue el formulario correspondiente.
- **Navegación a Registro**: Verifica que al hacer clic en "Reservar Cita" redirija a `/register` y muestre el formulario de creación de cuenta.

### 2. `Frontend/e2e/auth-flow.spec.js` (Autenticación y Flujo Principal)
- **Validación de Errores de Login**: Verifica que el formulario no permita envíos vacíos o formatos de email incorrectos, mostrando los mensajes de validación correspondientes en pantalla.
- **Validación de Errores de Registro**: Verifica mensajes de error en campos requeridos y que valide contraseñas que no coincidan.
- **Login Exitoso**: Inicia sesión usando las credenciales del paciente de demostración (`paciente@mediq.com` / `Paciente123*`) y valida el redireccionamiento exitoso a la vista `/patient/search`.
- **Interacción y Flujo Principal (Búsqueda de Médicos)**:
  - Busca un médico usando el filtro de especialidad por "Cardiología".
  - Confirma la visualización de la tarjeta de "Doctor Demo".
  - Abre el modal de disponibilidad del médico, verificando el título y los horarios disponibles.
  - Cierra el modal de forma exitosa.
- **Logout (Cierre de Sesión)**: Hace clic en "Cerrar sesión" en la barra de navegación del paciente y verifica que el usuario es devuelto a la página de login de forma segura.

---

## ⚙️ Configuración Técnica

El suite utiliza **Playwright Test** y está configurado en [playwright.config.js](file:///Users/faridzemanate/Docs/MediQ/Frontend/playwright.config.js):

- **Levantamiento Automático (Escenario)**: Playwright está configurado para levantar tanto el servidor de desarrollo del frontend (`npm run dev`) en el puerto `5173` como el del backend (`npm start` en `Backend`) en el puerto `5001` de forma autónoma antes de ejecutar los tests.
- **Evidencia / Reportes**: Genera un reporte HTML detallado al finalizar.
- **Resolución de Conflictos en MacOS**: Se configuró el puerto del backend a `5001` para evitar solapamientos con el servicio *Control Center / AirPlay* que usa el puerto `5000` en macOS de forma nativa.

---

## 🚀 Ejecución de Pruebas

Para ejecutar las pruebas localmente, asegúrate de haber sembrado la base de datos primero y luego ejecuta el comando en la carpeta `Frontend`:

```bash
# 1. Sembrar la base de datos (Ejecutar en la carpeta Backend una vez)
cd Backend && npm run seed && cd ../Frontend

# 2. Ejecutar las pruebas E2E (Ejecutar en la carpeta Frontend)
npm run test:e2e
```

Para ver el reporte HTML generado interactivo tras la ejecución:
```bash
npx playwright show-report
```
