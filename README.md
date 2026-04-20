# 🏥 MediQ

> **Sistema de Agendamiento Médico — Full Stack**
> React · Vite · TailwindCSS · Node.js · Express · MongoDB Atlas · JWT

---

## 📋 Contexto del Proyecto

MediQ es un Sistema de Agendamiento Médico (SPA) desarrollado con React. Tiene tres roles de usuario:

- **Paciente:** busca médicos, reserva y gestiona citas.
- **Médico:** ve su agenda, confirma/rechaza citas, edita disponibilidad.
- **Administrador:** gestiona todos los usuarios, citas y genera reportes.

El **Backend** está desarrollado con Node.js + Express + MongoDB Atlas + JWT en la carpeta `/Backend`.
El **Frontend** está desarrollado con React + Vite + TailwindCSS en la carpeta `/Frontend`.
La autenticación usa cookies HttpOnly (el backend las setea en `/api/auth/login`).

---

## 🛠️ Stack Tecnológico

### Frontend

| Categoría           | Librería / Herramienta      | Versión  |
| -------------------- | ---------------------------- | -------- |
| Bundler              | Vite                         | ^7.3.1   |
| UI Library           | React                        | ^19.2.4  |
| Routing              | React Router DOM             | ^7.13.1  |
| Formularios          | React Hook Form              | ^7.71.2  |
| Validaciones         | Zod                          | ^4.3.6   |
| Integración RHF+Zod | @hookform/resolvers          | ^5.2.2   |
| HTTP Client          | Axios                        | ^1.13.6  |
| Estilos              | TailwindCSS                  | ^4.2.1   |
| Íconos              | Lucide React                 | ^0.577.0 |
| Gráficas            | Recharts                     | ^3.8.0   |
| Cookies              | js-cookie                    | ^3.0.5   |
| Estado global        | Context API (built-in React) | —       |

### Backend

| Categoría       | Librería / Herramienta | Versión |
| ---------------- | ----------------------- | -------- |
| Runtime          | Node.js                 | v18+     |
| Framework        | Express                 | ^4.18.2  |
| Base de Datos    | MongoDB (Mongoose)      | ^8.0.3   |
| Autenticación   | JSON Web Token (JWT)    | ^9.0.2   |
| Encriptación    | bcryptjs                | ^2.4.3   |
| Validaciones     | express-validator       | ^7.0.1   |
| Documentación   | Swagger (swagger-jsdoc) | ^6.2.8   |
| Logging          | Morgan                  | ^1.10.0  |
| Testing          | Jest + Supertest        | ^29.7.0  |

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
# Entrar a la carpeta del backend
cd Backend

# Instalar dependencias
npm install

# Crear archivo de entorno
cp .env.example .env
```

Editar el archivo `Backend/.env` con las siguientes variables:

```env
PORT=5000
MONGODB_URI=mongodb+srv://<usuario>:<password>@<cluster>.mongodb.net/mediq
JWT_SECRET=tu_clave_secreta_jwt
NODE_ENV=development
```

### 3. Configurar el Frontend

```bash
# Desde la raíz del proyecto, entrar a la carpeta del frontend
cd Frontend

# Instalar dependencias
npm install

# Crear archivo de entorno
cp .env.example .env
```

Editar el archivo `Frontend/.env`:

```env
VITE_API_URL=http://localhost:5000/api
```

---

## ⚡ Scripts de Ejecución

### Backend (`/Backend`)

| Comando           | Descripción                                    |
| ------------------ | ----------------------------------------------- |
| `npm run dev`      | Inicia el servidor con **nodemon** (auto-reload) |
| `npm start`        | Inicia el servidor en modo producción           |
| `npm test`         | Ejecuta las pruebas con Jest                     |

### Frontend (`/Frontend`)

| Comando             | Descripción                                  |
| -------------------- | --------------------------------------------- |
| `npm run dev`        | Inicia el servidor de desarrollo Vite         |
| `npm run build`      | Genera el build de producción                 |
| `npm run preview`    | Previsualiza el build de producción           |
| `npm run lint`       | Ejecuta ESLint para verificar el código       |

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

> ⚠️ El **Backend debe estar corriendo** antes de usar el Frontend para que las llamadas a la API funcionen correctamente.

---

## 📬 Pruebas de API con Postman

Hemos documentado y probado todos los endpoints de la API usando **Postman**. Puedes importar nuestra colección para probar los endpoints directamente.

[<img src="https://run.pstmn.io/button.svg" alt="Run In Postman" style="width: 128px; height: 32px;">](https://app.getpostman.com/run-collection/43571081-7a36246b-8fae-4893-95e1-8267bf3fe0a8?action=collection%2Ffork&source=rip_markdown&collection-url=entityId%3D43571081-7a36246b-8fae-4893-95e1-8267bf3fe0a8%26entityType%3Dcollection%26workspaceId%3Daf66e3b3-958a-44a6-9f75-53ec7f020754)

> También puedes importar manualmente el archivo `Backend/postman_collection.json` desde Postman.

### Endpoints principales disponibles

| Módulo           | Método | Endpoint                        | Descripción                  |
| ----------------- | ------- | -------------------------------- | ----------------------------- |
| **Auth**          | POST   | `/api/auth/register`            | Registrar usuario             |
| **Auth**          | POST   | `/api/auth/login`               | Iniciar sesión               |
| **Auth**          | POST   | `/api/auth/logout`              | Cerrar sesión                |
| **Usuarios**      | GET    | `/api/users/profile`            | Ver perfil del usuario        |
| **Citas**         | POST   | `/api/appointments`             | Crear una cita                |
| **Citas**         | GET    | `/api/appointments`             | Listar citas                  |
| **Citas**         | PATCH  | `/api/appointments/:id/status`  | Cambiar estado de cita        |
| **Disponibilidad**| GET    | `/api/availability/:doctorId`   | Ver disponibilidad del médico |
| **Admin**         | GET    | `/api/admin/users`              | Listar todos los usuarios     |
| **Admin**         | GET    | `/api/admin/reports`            | Generar reportes              |

> 📖 Documentación Swagger disponible en: `http://localhost:5000/api-docs` (cuando el backend está corriendo)

---

## 📁 Estructura de Carpetas

```
MediQ/
├── Backend/
│   └── src/
│       ├── config/          ← Configuración de DB y variables de entorno
│       ├── controllers/     ← Lógica de los endpoints
│       ├── middleware/       ← Autenticación, validaciones, manejo de errores
│       ├── models/          ← Esquemas de Mongoose
│       ├── routes/          ← Definición de rutas Express
│       ├── swagger/         ← Documentación Swagger/OpenAPI
│       ├── app.js           ← Configuración de Express
│       └── server.js        ← Punto de entrada del servidor
│
├── Frontend/
│   └── src/
│       ├── api/             ← axiosInstance.js + llamadas a la API
│       ├── components/
│       │   ├── ui/          ← MyButton, CustomCard, FormInput, Modal, Navbar...
│       │   └── shared/      ← LoadingSpinner, ToastNotification, Pagination...
│       ├── context/         ← AuthContext.jsx (estado global de autenticación)
│       ├── hooks/           ← hooks personalizados (useAuth, useApi...)
│       ├── pages/
│       │   ├── public/      ← LandingPage, LoginPage, RegisterPage
│       │   ├── patient/     ← SearchDoctorsPage, BookAppointmentPage, MyAppointmentsPage
│       │   ├── doctor/      ← AgendaPage, AvailabilityPage, NotificationsPage
│       │   └── admin/       ← DashboardPage, ReportsPage, UsersManagementPage
│       ├── utils/           ← validationSchemas.js (Zod schemas)
│       ├── App.jsx          ← AppRouter con todas las rutas
│       └── main.jsx         ← Punto de entrada, envuelve con AuthProvider
│
└── README.md
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

## 👥 Equipo de Desarrollo

| # | Integrante                                |
| - | ------------------------------------------ |
| 1 | **Deyvid Alejandro Rodríguez Portilla**   |
| 2 | **Farid Esteban Semanate Castellanos**     |
| 3 | **Niyerieth Fernanda Ruiz Solarte**        |
| 4 | **María Isabel Carrillo Vidales**          |
| 5 | **Aura Camila Arteaga Castillo**           |
| 6 | **Daniel Yanguatin Jacanamijoy**           |

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

*MediQ — Institución Universitaria del Putumayo · Tecnología en Desarrollo de Software · 2026-1*
