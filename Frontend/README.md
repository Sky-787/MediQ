# 🏥 MediQ Frontend

> **Sistema de Agendamiento Médico — SPA**
> React · Vite · TailwindCSS · Context API · React Hook Form · Zod

---

## 📋 Contexto del Proyecto

MediQ es un Sistema de Agendamiento Médico (SPA) desarrollado con React. Tiene tres roles de usuario:

- **Paciente:** busca médicos, reserva y gestiona citas.
- **Médico:** ve su agenda, confirma/rechaza citas, edita disponibilidad.
- **Administrador:** gestiona todos los usuarios, citas y genera reportes.

El **Backend ya está completo** (Node.js + Express + MongoDB Atlas + JWT) en la carpeta `/Backend`.
El Frontend se conecta a él mediante Axios con base URL `http://localhost:5000/api`.
La autenticación usa cookies HttpOnly (el backend las setea en `/api/auth/login`).

---

## 🛠️ Stack Tecnológico

| Categoría           | Librería / Herramienta      | Versión |
| -------------------- | ---------------------------- | -------- |
| Bundler              | Vite                         | ^6.3.1   |
| UI Library           | React                        | ^19.1.0  |
| Routing              | React Router DOM             | ^7.5.1   |
| Formularios          | React Hook Form              | ^7.55.0  |
| Validaciones         | Zod                          | ^3.24.3  |
| Integración RHF+Zod | @hookform/resolvers          | ^5.0.1   |
| HTTP Client          | Axios                        | ^1.8.4   |
| Estilos              | TailwindCSS                  | ^4.1.4   |
| Íconos              | Lucide React                 | ^0.487.0 |
| Gráficas            | Recharts                     | ^2.15.3  |
| Cookies              | js-cookie                    | ^3.0.5   |
| Estado global        | Context API (built-in React) | —       |

> **Node.js requerido:** v18 o superior

---

## 🚀 Instalación y Ejecución

```bash
# 1. Entrar a la carpeta del frontend
cd Frontend/mediq-frontend

# 2. Instalar dependencias
npm install

# 3. Crear archivo de entorno
cp .env.example .env
# Editar .env y poner: VITE_API_URL=http://localhost:5000/api

# 4. Iniciar el servidor de desarrollo
npm run dev
```

El servidor corre en `http://localhost:5173`

> Para que funcione completo, el Backend también debe estar corriendo en el puerto 5000.

---

## 📁 Estructura de Carpetas

```
mediq-frontend/
├── src/
│   ├── api/              ← axiosInstance.js + llamadas a la API
│   ├── components/
│   │   ├── ui/           ← MyButton, CustomCard, FormInput, Modal, Navbar...
│   │   └── shared/       ← LoadingSpinner, ToastNotification, Pagination...
│   ├── context/          ← AuthContext.jsx  (estado global de autenticación)
│   ├── hooks/            ← hooks personalizados (useAuth, useApi...)
│   ├── pages/
│   │   ├── public/       ← LandingPage, LoginPage, RegisterPage
│   │   ├── patient/      ← SearchDoctorsPage, BookAppointmentPage, MyAppointmentsPage
│   │   ├── doctor/       ← AgendaPage, AvailabilityPage, NotificationsPage
│   │   └── admin/        ← DashboardPage, ReportsPage, UsersManagementPage
│   ├── utils/            ← validationSchemas.js (Zod schemas)
│   ├── App.jsx           ← AppRouter con todas las rutas
│   └── main.jsx          ← punto de entrada, envuelve con AuthProvider
├── .env                  ← VITE_API_URL=http://localhost:5000/api
├── .env.example
└── package.json
```

---

## 🗺️ Mapa de Componentes

```
App
└── AppRouter (React Router DOM)
    ├── [Públicas] PublicLayout
    │   ├── LandingPage (/)
    │   ├── LoginPage (/login)
    │   └── RegisterPage (/register)
    │
    ├── [Paciente 🔒] PatientLayout
    │   ├── SearchDoctorsPage (/patient/search)
    │   ├── BookAppointmentPage (/patient/book/:doctorId)
    │   └── MyAppointmentsPage (/patient/appointments)
    │
    ├── [Médico 🔒] DoctorLayout
    │   ├── AgendaPage (/doctor/agenda)
    │   ├── AvailabilityPage (/doctor/availability)
    │   └── NotificationsPage (/doctor/notifications)
    │
    ├── [Admin 🔒] AdminLayout
    │   ├── DashboardPage (/admin/dashboard)
    │   ├── ReportsPage (/admin/reports)
    │   └── UsersManagementPage (/admin/users)
    │
    └── [Compartidos]
        ├── ProtectedRoute
        ├── LoadingSpinner
        ├── ToastNotification
        ├── ErrorBoundary
        ├── ModalWrapper
        ├── Pagination
        └── EmptyState
```

**AuthContext expone:** `user`, `isAuthenticated`, `isLoading`, `error`, `login()`, `logout()`, `clearError()`, `isPaciente()`, `isMedico()`, `isAdministrador()`

---

## 👥 Equipo y Distribución de Tareas

| Persona | Integrante       | Área                                | Rama Git                       |
| ------- | ---------------- | ------------------------------------ | ------------------------------ |
| A       | Deyvid Rodriguez | Setup + AuthContext + ProtectedRoute | `feature/setup-auth-context` |
| B       | Farid Semanate   | Landing Page + Componentes UI        | `feature/landing-page`       |
| C       | Niyerieth Ruiz   | Auth Pages (Login + Register)        | `feature/auth-pages`         |
| D       | Maria Carrillo   | Panel Paciente                       | `feature/patient-panel`      |
| E       | Aura Arteaga     | Panel Médico + Admin (Usuarios)     | `feature/doctor-admin-panel` |
| F       | Daniel Yanguatin | Dashboard Admin + Componentes Shared | `feature/dashboard-shared`   |

---

## ⚙️ Flujo de Git

```bash
# Al inicio de cada sesión:
git checkout develop
git pull origin develop
git checkout feature/mi-rama   # o crearla si no existe

# Al terminar trabajo:
git add .
git commit -m "feat: descripción concreta de lo que hice"
git push origin feature/mi-rama
# Luego crear Pull Request: feature/mi-rama → develop
```

---

## 📝 Notas Importantes para Desarrollo

- **NO usar useState para campos de formulario.** Siempre React Hook Form.
- **NO usar Redux ni Zustand.** Solo Context API para estado global.
- **NO inventar librerías.** Solo las del stack indicado arriba.
- **Para gráficas:** exclusivamente Recharts. No Chart.js ni otros.
- **Cada persona edita solo sus archivos asignados.**
- **ProtectedRoute** verifica autenticación y rol antes de renderizar rutas privadas.
- **axiosInstance** está en `src/api/axiosInstance.js` con `withCredentials: true`.

---

## ✅ Avance del Equipo

> **INSTRUCCIÓN PARA TODOS:** Después de completar cada tarea, agrega una línea aquí con tu nombre, fecha y lo que implementaste. Esto es obligatorio para demostrar contribución individual.
> Pon tú mismo tu nombre aquí de todas formas.

**Formato:**

```
- [x] Persona X - Nombre Apellido (YYYY-MM-DD): descripción de lo implementado.
```

**Registro de avances:**

<!-- Persona A -->

- [X] Persona A - Deyvid Rodriguez (2026-03-17): Setup inicial del proyecto con Vite + instalación de dependencias (react-router-dom, axios, zod, react-hook-form, lucide-react, recharts, js-cookie, tailwindcss).
- [X] Persona A - Deyvid Rodriguez (2026-03-17): axiosInstance configurado con baseURL desde VITE_API_URL y withCredentials para cookies HttpOnly.
- [X] Persona A - Deyvid Rodriguez (2026-03-17): AuthContext con login, logout, clearError, GET /api/auth/me y helpers de roles implementado.
- [X] Persona A - Deyvid Rodriguez (2026-03-17): ProtectedRoute con guards por autenticación y rol implementado.
- [X] Persona A - Deyvid Rodriguez (2026-03-17): AppRouter completo con todas las rutas públicas y privadas definidas en App.jsx. main.jsx envuelto con AuthProvider.

<!-- Persona B -->

- [ ] Persona B - Farid Semanate: _(pendiente)_

<!-- Persona C -->

- [ ] Persona C - Niyerieth Ruiz: _(pendiente)_

<!-- Persona D -->

- [x] Persona D - Maria Carrillo (2026-03-17): D-1 PatientLayout wrapper con Outlet y PatientNavbar con links de navegación, nombre de usuario y botón cerrar sesión (teal-700).
- [x] Persona D - Maria Carrillo (2026-03-17): D-2 SearchDoctorsPage con FilterBar, DoctorCard, AvailabilityGrid implementados.
<!-- Persona E -->

- [ ] Persona E - Aura Arteaga: _(pendiente)_

<!-- Persona F -->

- [ ] Persona F - Daniel Yanguatin: _(pendiente)_

---

## 📊 Criterios de Evaluación

| Criterio                                                                 | Peso |
| ------------------------------------------------------------------------ | ---- |
| Documentación (Historias de Usuario, Figma, Mapa de Componentes, Stack) | 20%  |
| Diseño Figma (fidelidad de colores, tipografía, layout)                | 20%  |
| Calidad de Código y Repositorio (estructura, commits, README)           | 40%  |
| Sustentación Individual                                                 | 20%  |

---

## ☑️ Checklist Final

- [ ] Todos los integrantes tienen commits en el historial de GitHub
- [ ] Hay mínimo 5 componentes reutilizables implementados (`/components/ui/`)
- [ ] Landing Page en ruta `/` con Hero + 2 secciones informativas
- [ ] Login y Register funcionan con React Hook Form + Zod
- [ ] AuthContext maneja correctamente `user`, `isAuthenticated`, `isLoading`
- [ ] Navbar cambia dinámicamente según si el usuario está autenticado
- [ ] Dashboard muestra datos del usuario autenticado + botón Logout funcional
- [ ] Los formularios muestran errores y estado `isSubmitting` ("Cargando...")
- [ ] La app es completamente Responsive (revisar en móvil y tablet)
- [ ] README.md tiene instrucciones de instalación y la sección de avances completa
- [ ] El diseño coincide con los mockups de Figma

---

*MediQ Frontend — Institución Universitaria del Putumayo · Tecnología en Desarrollo de Software · 2026-1*
