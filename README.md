# 🏥 MediQ

> **Sistema de Agendamiento Médico — Full Stack**
> React · Vite · TailwindCSS v4 · Zustand · Node.js · Express · MongoDB Atlas · JWT

---

## 📋 Descripción del Proyecto

MediQ es un Sistema de Agendamiento Médico (SPA) desarrollado con React. Tiene tres roles de usuario:

- **Paciente:** busca médicos, reserva y gestiona citas.
- **Médico:** ve su agenda semanal, confirma/rechaza citas, configura disponibilidad.
- **Administrador:** gestiona todos los usuarios, citas y genera reportes estadísticos.

El **Backend** está desarrollado con Node.js + Express + MongoDB Atlas + JWT en la carpeta `/Backend`.
El **Frontend** está desarrollado con React + Vite + TailwindCSS v4 + Zustand en la carpeta `/Frontend`.
La autenticación usa cookies HttpOnly (el backend las setea en `/api/auth/login`).

---

## 🛠️ Stack Tecnológico

### Frontend

| Categoría            | Librería / Herramienta | Versión   |
| --------------------- | ----------------------- | --------- |
| Bundler               | Vite                    | ^7.3.1    |
| UI Library            | React                   | ^19.2.4   |
| Routing               | React Router DOM        | ^7.13.1   |
| Estado global         | **Zustand**             | ^5.x      |
| Formularios           | React Hook Form         | ^7.71.2   |
| Validaciones          | Zod                     | ^4.3.6    |
| Integración RHF+Zod   | @hookform/resolvers     | ^5.2.2    |
| HTTP Client           | Axios                   | ^1.13.6   |
| Estilos               | TailwindCSS             | **^4.2.1** |
| Íconos               | Lucide React            | ^0.577.0  |
| Gráficas             | Recharts                | ^3.8.0    |
| Cookies               | js-cookie               | ^3.0.5    |

### Backend

| Categoría        | Librería / Herramienta | Versión  |
| ----------------- | ----------------------- | -------- |
| Runtime           | Node.js                 | v18+     |
| Framework         | Express                 | ^4.18.2  |
| Base de Datos     | MongoDB (Mongoose)      | ^8.0.3   |
| Autenticación    | JSON Web Token (JWT)    | ^9.0.2   |
| Encriptación     | bcryptjs                | ^2.4.3   |
| Validaciones      | express-validator       | ^7.0.1   |
| Documentación    | Swagger UI Express      | —        |
| Logging           | Morgan                  | ^1.10.0  |
| Testing           | Jest + Supertest        | ^29.7.0  |

> **Node.js requerido:** v18 o superior

---

## 🚀 Guía de Instalación

### Prerrequisitos

- [Node.js](https://nodejs.org/) v18 o superior
- [Git](https://git-scm.com/)
- Una cuenta en [MongoDB Atlas](https://www.mongodb.com/atlas) (o MongoDB local)
- [Postman](https://www.postman.com/) (opcional, para pruebas de API)

### 1. Clonar el repositorio

```bash
git clone https://github.com/Sky-787/MediQ.git
cd MediQ
git checkout develop
```

### 2. Configurar el Backend

```bash
cd Backend
npm install
cp .env.example .env
```

Editar `Backend/.env`:

```env
PORT=5000
MONGODB_URI=mongodb+srv://<usuario>:<password>@<cluster>.mongodb.net/mediq
JWT_SECRET=tu_clave_secreta_jwt_minimo_32_caracteres
NODE_ENV=development
```

### 3. Configurar el Frontend

```bash
cd Frontend
npm install
cp .env.example .env
```

Editar `Frontend/.env`:

```env
VITE_API_URL=http://localhost:5000/api
```

---

## ⚡ Scripts de Ejecución

### Backend (`/Backend`)

| Comando        | Descripción                                     |
| --------------- | ----------------------------------------------- |
| `npm run dev`   | Inicia el servidor con **nodemon** (auto-reload) |
| `npm start`     | Inicia el servidor en modo producción            |
| `npm test`      | Ejecuta las pruebas con Jest                     |

### Frontend (`/Frontend`)

| Comando           | Descripción                            |
| ------------------ | -------------------------------------- |
| `npm run dev`      | Inicia el servidor de desarrollo Vite  |
| `npm run build`    | Genera el build de producción          |
| `npm run preview`  | Previsualiza el build de producción    |
| `npm run lint`     | Ejecuta ESLint                         |

### Ejecución Completa (Backend + Frontend)

```bash
# Terminal 1 — Backend
cd Backend
npm run dev
# ✅ Servidor corriendo en http://localhost:5000

# Terminal 2 — Frontend
cd Frontend
npm run dev
# ✅ App corriendo en http://localhost:5173
```

> ⚠️ El **Backend debe estar corriendo** antes de usar el Frontend.

---

## 📬 Pruebas de API con Postman

Importar el archivo `Backend/postman_collection.json` desde Postman.

[<img src="https://run.pstmn.io/button.svg" alt="Run In Postman" style="width: 128px; height: 32px;">](https://app.getpostman.com/run-collection/43571081-7a36246b-8fae-4893-95e1-8267bf3fe0a8?action=collection%2Ffork&source=rip_markdown&collection-url=entityId%3D43571081-7a36246b-8fae-4893-95e1-8267bf3fe0a8%26entityType%3Dcollection%26workspaceId%3Daf66e3b3-958a-44a6-9f75-53ec7f020754)

### Endpoints disponibles

| Módulo           | Método | Endpoint                         | Auth requerida | Rol mínimo |
| ----------------- | ------- | --------------------------------- | -------------- | ---------- |
| **Health**        | GET    | `/api/health`                    | No             | —          |
| **Auth**          | POST   | `/api/auth/register`             | No             | —          |
| **Auth**          | POST   | `/api/auth/login`                | No             | —          |
| **Auth**          | POST   | `/api/auth/logout`               | Sí            | cualquiera |
| **Auth**          | GET    | `/api/auth/me`                   | Sí            | cualquiera |
| **Users**         | GET    | `/api/users`                     | Sí            | admin      |
| **Users**         | GET    | `/api/users/:id`                 | Sí            | dueño/admin|
| **Users**         | PUT    | `/api/users/:id`                 | Sí            | dueño/admin|
| **Users**         | DELETE | `/api/users/:id`                 | Sí            | admin      |
| **Doctors**       | GET    | `/api/doctors`                   | No             | —          |
| **Doctors**       | GET    | `/api/doctors/:id`               | No             | —          |
| **Doctors**       | POST   | `/api/doctors`                   | Sí            | admin      |
| **Doctors**       | PUT    | `/api/doctors/:id`               | Sí            | admin/médico|
| **Doctors**       | DELETE | `/api/doctors/:id`               | Sí            | admin      |
| **Appointments**  | GET    | `/api/appointments`              | Sí            | cualquiera |
| **Appointments**  | GET    | `/api/appointments/:id`          | Sí            | cualquiera |
| **Appointments**  | POST   | `/api/appointments`              | Sí            | paciente/admin|
| **Appointments**  | PATCH  | `/api/appointments/:id/status`   | Sí            | médico/admin|
| **Appointments**  | DELETE | `/api/appointments/:id`          | Sí            | cualquiera |
| **Reports**       | GET    | `/api/reports/ocupacion`         | Sí            | admin      |
| **Reports**       | GET    | `/api/reports/especialidades`    | Sí            | admin      |
| **Reports**       | GET    | `/api/reports/periodo`           | Sí            | admin      |

> 📖 Documentación Swagger interactiva: `http://localhost:5000/api-docs`

---

## 📁 Estructura de Carpetas

```
MediQ/
├── Backend/
│   ├── src/
│   │   ├── config/          ← db.js, env.js, swagger.json
│   │   ├── controllers/     ← appointment, auth, doctor, report, user
│   │   ├── middlewares/     ← auth.middleware.js, role.middleware.js, error.middleware.js
│   │   ├── models/          ← User.js, Doctor.js, Appointment.js
│   │   ├── routes/          ← appointment, auth, doctor, report, user routes
│   │   ├── utils/           ← jwt.js, response.js, validators.js
│   │   ├── app.js           ← Configuración de Express
│   │   └── server.js        ← Punto de entrada
│   ├── tests/               ← auth.test.js, appointments.test.js
│   ├── postman_collection.json
│   └── swagger-spec.yml
│
└── Frontend/
    └── src/
        ├── api/             ← axiosInstance.js (withCredentials: true)
        ├── components/
        │   ├── ui/          ← MyButton, CustomCard, FormInput, Modal, Navbar,
        │   │                   AdminNavbar, DoctorNavbar, PatientNavbar,
        │   │                   MobileMenu, ThemeToggle, Badge, LoadingSpinner,
        │   │                   Skeleton, Tooltip, AuthFeedback
        │   └── shared/      ← ProtectedRoute, ToastNotification, Pagination,
        │                       EmptyState, ModalWrapper, ErrorBoundary
        ├── hooks/           ← useApi.js
        ├── pages/
        │   ├── public/      ← LandingPage, LoginPage, RegisterPage, NotFoundPage
        │   ├── patient/     ← SearchDoctorsPage, BookAppointmentPage, MyAppointmentsPage
        │   ├── doctor/      ← DoctorDashboardPage, AgendaPage, AvailabilityPage, NotificationsPage
        │   └── admin/       ← DashboardPage, ReportsPage, UsersManagementPage
        ├── stores/          ← useAuthStore.js, useAppointmentStore.js,
        │                       useDoctorStore.js, useToastStore.js, useThemeStore.js
        ├── utils/           ← validationSchemas.js
        ├── App.jsx          ← AppRouter con rutas anidadas por rol
        └── main.jsx         ← Punto de entrada
```

---

## 🗺️ Mapa de Rutas

```
App (React Router DOM v7)
└── AppRouter
    ├── [Públicas]
    │   ├── /                    → LandingPage
    │   ├── /login               → LoginPage
    │   ├── /register            → RegisterPage
    │   └── *                    → NotFoundPage
    │
    ├── [Paciente 🔒] PatientLayout (requiere rol: paciente)
    │   ├── /patient/search      → SearchDoctorsPage
    │   ├── /patient/book/:id    → BookAppointmentPage
    │   └── /patient/appointments→ MyAppointmentsPage
    │
    ├── [Médico 🔒] DoctorLayout (requiere rol: medico)
    │   ├── /doctor              → DoctorDashboardPage
    │   ├── /doctor/agenda       → AgendaPage
    │   ├── /doctor/availability → AvailabilityPage
    │   └── /doctor/notifications→ NotificationsPage
    │
    └── [Admin 🔒] AdminLayout (requiere rol: admin)
        ├── /admin/dashboard     → DashboardPage
        ├── /admin/reports       → ReportsPage
        └── /admin/users         → UsersManagementPage
```

---

## 🗄️ Modelo de Datos (DER simplificado)

```
User (_id, nombre, email, contrasena, rol, timestamps)
  │
  └──< Doctor (_id, userId→User, especialidad, registroMedico, disponibilidad[], timestamps)
                │
                └──< Appointment (_id, pacienteId→User, doctorId→Doctor,
                                  fechaHora, estado, motivo, timestamps)
```

**Estados de una cita:** `pendiente` → `confirmada` → `completada` / `cancelada`

---

## 🌙 Dark Mode

El proyecto soporta dark mode con persistencia en `localStorage`. Usar el botón `ThemeToggle` en cualquier navbar para alternar. Implementado con Zustand (`useThemeStore`) y clases `dark:` de Tailwind v4.

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

## 👥 Equipo de Desarrollo

| # | Integrante                                | Rama                                    |
| - | ------------------------------------------ | --------------------------------------- |
| 1 | **Deyvid Alejandro Rodríguez Portilla**   | `feature/alejandro-docs-responsive`     |
| 2 | **Farid Esteban Semanate Castellanos**     | `feature/farid-router-layouts`          |
| 3 | **Niyerieth Fernanda Ruiz Solarte**        | `feature/fernanda-zustand-appointments` |
| 4 | **María Isabel Carrillo Vidales**          | `feature/isabel-darkmode-ui`            |
| 5 | **Aura Camila Arteaga Castillo**           | `feature/camila-zustand-auth` (rama anterior) |
| 6 | **Daniel Yanguatin Jacanamijoy**           | `feature/daniel-api-integration`        |

---

*MediQ — Institución Universitaria del Putumayo · Tecnología en Desarrollo de Software · 2026-1*
