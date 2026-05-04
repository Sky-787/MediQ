# 📡 CONTRATOS DE API - MediQ Backend

**Documentación de Endpoints REST**  
**Proyecto:** MediQ - Sistema de Gestión Médica  
**Backend Base URL:** `{VITE_API_URL}` (ej: `http://localhost:3000/api`)  
**Generado:** 3 de Mayo de 2026

---

## 📋 Tabla de Contenidos

1. [Autenticación](#autenticación)
2. [Médicos](#médicos)
3. [Citas (Appointments)](#citas)
4. [Reportes](#reportes)
5. [Usuarios](#usuarios)
6. [Códigos de Estado HTTP](#códigos-de-estado-http)

---

## 🔐 Autenticación

### 1. Login

**Endpoint:** `POST /auth/login`

**Propósito:** Autenticar un usuario con email y contraseña.

**Request:**
```json
{
  "email": "juan@example.com",
  "contrasena": "password123"
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "id": "507f1f77bcf86cd799439011",
    "nombre": "Juan Pérez",
    "email": "juan@example.com",
    "rol": "paciente",
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

**Response (401 Unauthorized):**
```json
{
  "success": false,
  "error": "Email o contraseña incorrectos",
  "message": "Invalid credentials"
}
```

**Cookies Set:**
- `token` (HttpOnly, Secure, SameSite=Strict)
- `userId` (opcional)

**Uso en Frontend:**
```javascript
const { login } = useAuthStore()
await login('juan@example.com', 'password123')
```

---

### 2. Register

**Endpoint:** `POST /auth/register`

**Propósito:** Crear una nueva cuenta de usuario.

**Request:**
```json
{
  "nombre": "Juan Pérez",
  "email": "juan@example.com",
  "contrasena": "password123",
  "rol": "paciente"
}
```

**Response (201 Created):**
```json
{
  "success": true,
  "message": "Usuario creado exitosamente",
  "data": {
    "id": "507f1f77bcf86cd799439011",
    "nombre": "Juan Pérez",
    "email": "juan@example.com",
    "rol": "paciente"
  }
}
```

**Response (400 Bad Request):**
```json
{
  "success": false,
  "error": "El email ya está registrado",
  "message": "Email already exists"
}
```

**Validaciones:**
- Email debe ser válido
- Contraseña mínimo 6 caracteres
- Nombre mínimo 2 caracteres
- Email único en BD

---

### 3. Verify Session (Me)

**Endpoint:** `GET /auth/me`

**Propósito:** Verificar si el usuario tiene una sesión activa (validar cookie).

**Request:** (Sin body, envía cookie automáticamente)
```javascript
// axios con withCredentials: true envía la cookie
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "id": "507f1f77bcf86cd799439011",
    "nombre": "Juan Pérez",
    "email": "juan@example.com",
    "rol": "paciente"
  }
}
```

**Response (401 Unauthorized):**
```json
{
  "success": false,
  "error": "Token inválido o expirado"
}
```

**Uso en Frontend:**
```javascript
// App.jsx - Al montar la app
useEffect(() => {
  checkSession()  // Llama GET /auth/me
}, [checkSession])
```

---

### 4. Logout

**Endpoint:** `POST /auth/logout`

**Propósito:** Cerrar sesión y limpiar cookies.

**Request:** (Sin body)

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Sesión cerrada correctamente"
}
```

**Cookies Cleared:**
- `token`
- `userId`

**Uso en Frontend:**
```javascript
const handleLogout = async () => {
  await logout()
  navigate('/login', { replace: true })
}
```

---

## 👨‍⚕️ Médicos

### 1. Listar Médicos

**Endpoint:** `GET /doctors`

**Propósito:** Obtener listado de médicos disponibles (con filtros opcionales).

**Query Parameters:**
```
?especialidad=Cardiología
?fecha=2026-05-10
?limite=10
?pagina=1
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": [
    {
      "_id": "doc_001",
      "nombre": "Dr. García López",
      "especialidad": "Cardiología",
      "foto": "https://...",
      "calificacion": 4.8,
      "experiencia_años": 15,
      "slots": [
        {
          "fechaHora": "2026-05-10T09:00:00Z",
          "disponible": true
        },
        {
          "fechaHora": "2026-05-10T10:00:00Z",
          "disponible": true
        }
      ]
    },
    {
      "_id": "doc_002",
      "nombre": "Dra. Martínez Silva",
      "especialidad": "Pediatría",
      "foto": "https://...",
      "calificacion": 4.9,
      "experiencia_años": 12,
      "slots": [...]
    }
  ]
}
```

**Uso en Frontend:**
```jsx
// SearchDoctorsPage
const [doctors, setDoctors] = useState([])
const { fetchData } = useApi()

useEffect(() => {
  const params = { especialidad, fecha }
  const result = await fetchData({ url: '/doctors', params })
  setDoctors(result.data)
}, [especialidad, fecha])
```

---

### 2. Obtener Médico por ID

**Endpoint:** `GET /doctors/:id`

**Propósito:** Obtener información detallada de un médico específico.

**Path Parameters:**
```
:id = "doc_001"
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "_id": "doc_001",
    "nombre": "Dr. García López",
    "especialidad": "Cardiología",
    "foto": "https://...",
    "calificacion": 4.8,
    "experiencia_años": 15,
    "biografia": "Especialista en enfermedades del corazón...",
    "horario_trabajo": {
      "lunes": "09:00-17:00",
      "martes": "09:00-17:00",
      "miercoles": "09:00-17:00",
      "jueves": "09:00-17:00",
      "viernes": "09:00-14:00",
      "sabado": null,
      "domingo": null
    },
    "slots": [
      {
        "fechaHora": "2026-05-10T09:00:00Z",
        "disponible": true
      },
      {
        "fechaHora": "2026-05-10T09:30:00Z",
        "disponible": false
      }
    ]
  }
}
```

**Uso en Frontend:**
```jsx
// BookAppointmentPage
useEffect(() => {
  axiosInstance.get(`/doctors/${doctorId}`)
    .then(res => {
      setDoctor(res.data.data)
      setSlots(res.data.data.slots || [])
    })
}, [doctorId])
```

---

## 📅 Citas (Appointments)

### 1. Crear Cita

**Endpoint:** `POST /appointments`

**Propósito:** Crear una nueva cita (reserva) para el usuario autenticado.

**Request:**
```json
{
  "doctorId": "doc_001",
  "fechaHora": "2026-05-10T14:30:00Z",
  "motivo": "Chequeo general del corazón"
}
```

**Response (201 Created):**
```json
{
  "success": true,
  "message": "Cita creada exitosamente",
  "data": {
    "_id": "apt_12345",
    "pacienteId": "507f1f77bcf86cd799439011",
    "doctorId": "doc_001",
    "medico": {
      "_id": "doc_001",
      "nombre": "Dr. García López",
      "especialidad": "Cardiología"
    },
    "paciente": {
      "_id": "507f1f77bcf86cd799439011",
      "nombre": "Juan Pérez",
      "email": "juan@example.com"
    },
    "fechaHora": "2026-05-10T14:30:00Z",
    "motivo": "Chequeo general del corazón",
    "estado": "pendiente",
    "createdAt": "2026-05-03T10:20:30Z",
    "updatedAt": "2026-05-03T10:20:30Z"
  }
}
```

**Response (400 Bad Request):**
```json
{
  "success": false,
  "error": "El horario ya no está disponible",
  "message": "Slot not available"
}
```

**Validaciones:**
- doctorId debe existir
- fechaHora debe ser en el futuro
- No puede haber 2 citas en mismo slot
- Usuario debe estar autenticado

**Uso en Frontend:**
```jsx
const { createAppointment } = useAppointmentStore()

const handleConfirm = async () => {
  try {
    await createAppointment({
      doctorId,
      fechaHora: selectedSlot,
      motivo
    })
    setSuccess(true)
  } catch (error) {
    showToast(error.message, 'error')
  }
}
```

---

### 2. Listar Citas (del Usuario)

**Endpoint:** `GET /appointments`

**Propósito:** Obtener todas las citas del usuario autenticado (con filtros opcionales).

**Query Parameters:**
```
?estado=pendiente,completada,cancelada
?mes=5
?año=2026
?pagina=1
?limite=10
```

**Response (200 OK):**
```json
{
  "success": true,
  "total": 5,
  "page": 1,
  "limit": 10,
  "data": [
    {
      "_id": "apt_12345",
      "pacienteId": "507f1f77bcf86cd799439011",
      "doctorId": "doc_001",
      "medico": {
        "_id": "doc_001",
        "nombre": "Dr. García López",
        "especialidad": "Cardiología",
        "foto": "https://..."
      },
      "fechaHora": "2026-05-10T14:30:00Z",
      "motivo": "Chequeo general del corazón",
      "estado": "pendiente",
      "createdAt": "2026-05-03T10:20:30Z"
    },
    {
      "_id": "apt_12346",
      "pacienteId": "507f1f77bcf86cd799439011",
      "doctorId": "doc_002",
      "medico": {
        "_id": "doc_002",
        "nombre": "Dra. Martínez Silva",
        "especialidad": "Pediatría",
        "foto": "https://..."
      },
      "fechaHora": "2026-05-15T10:00:00Z",
      "motivo": "Control de niño sano",
      "estado": "completada",
      "createdAt": "2026-04-20T15:45:20Z"
    }
  ]
}
```

**Estados posibles:**
- `pendiente` - Cita próxima
- `completada` - Cita realizada
- `cancelada` - Cita cancelada

**Uso en Frontend:**
```jsx
const { appointments, isLoading, error, fetchAppointments } = useAppointmentStore()

useEffect(() => {
  fetchAppointments()
}, [])

const upcomingAppointments = appointments.filter(apt => apt.estado === 'pendiente')
```

---

### 3. Actualizar Cita

**Endpoint:** `PUT /appointments/:id`

**Propósito:** Actualizar los datos de una cita (reprogramar, cambiar motivo, etc.).

**Path Parameters:**
```
:id = "apt_12345"
```

**Request:**
```json
{
  "fechaHora": "2026-05-12T15:00:00Z",
  "motivo": "Chequeo actualizado"
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Cita actualizada exitosamente",
  "data": {
    "_id": "apt_12345",
    "pacienteId": "507f1f77bcf86cd799439011",
    "doctorId": "doc_001",
    "medico": {...},
    "fechaHora": "2026-05-12T15:00:00Z",
    "motivo": "Chequeo actualizado",
    "estado": "pendiente",
    "updatedAt": "2026-05-03T10:25:40Z"
  }
}
```

**Uso en Frontend:**
```jsx
const handleReschedule = async (newDate) => {
  await updateAppointment(appointmentId, {
    fechaHora: newDate
  })
  showToast('Cita reprogramada exitosamente', 'success')
}
```

---

### 4. Cambiar Estado de Cita

**Endpoint:** `PATCH /appointments/:id/status`

**Propósito:** Cambiar el estado de una cita (completar, cancelar, etc.).

**Path Parameters:**
```
:id = "apt_12345"
```

**Request:**
```json
{
  "estado": "cancelada",
  "motivo": "Conflicto de horarios"
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Estado actualizado",
  "data": {
    "_id": "apt_12345",
    "estado": "cancelada",
    "motivo": "Conflicto de horarios",
    "cancelada_en": "2026-05-03T10:30:00Z",
    "updatedAt": "2026-05-03T10:30:00Z"
  }
}
```

**Estados válidos:**
- `pendiente` → `completada` (solo médico)
- `pendiente` → `cancelada` (paciente o médico)
- `completada` → `cancelada` (solo admin)

**Uso en Frontend:**
```jsx
const handleCancel = async (motivo) => {
  await cancelAppointment(appointmentId, motivo)
  showToast('Cita cancelada', 'success')
}
```

---

## 📊 Reportes

### 1. Ocupación por Médico

**Endpoint:** `GET /reports/ocupacion`

**Propósito:** Obtener estadísticas de ocupación/carga de trabajo por médico.

**Response (200 OK):**
```json
{
  "success": true,
  "data": [
    {
      "_id": {
        "medicoId": "doc_001",
        "nombre": "Dr. García López"
      },
      "totalCitas": 45,
      "citasCompletadas": 42,
      "citasCanceladas": 3
    },
    {
      "_id": {
        "medicoId": "doc_002",
        "nombre": "Dra. Martínez Silva"
      },
      "totalCitas": 38,
      "citasCompletadas": 36,
      "citasCanceladas": 2
    }
  ]
}
```

**Uso en Frontend:**
```jsx
const [occupancyData, setOccupancyData] = useState([])

const loadOccupancy = async () => {
  const { data } = await fetchData({ url: '/reports/ocupacion' })
  const transformed = data.map(item => ({
    name: item._id.nombre,
    citas: item.totalCitas
  }))
  setOccupancyData(transformed)
}
```

---

### 2. Citas por Especialidad

**Endpoint:** `GET /reports/especialidades`

**Propósito:** Obtener distribución de citas por especialidad médica.

**Response (200 OK):**
```json
{
  "success": true,
  "data": [
    {
      "_id": "Cardiología",
      "total": 87
    },
    {
      "_id": "Pediatría",
      "total": 52
    },
    {
      "_id": "Odontología",
      "total": 38
    },
    {
      "_id": "Dermatología",
      "total": 25
    }
  ]
}
```

---

### 3. Citas por Período

**Endpoint:** `GET /reports/periodo`

**Propósito:** Obtener número de citas por fecha en un rango específico.

**Query Parameters:**
```
?startDate=2026-05-01
?endDate=2026-05-31
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": [
    {
      "fecha": "2026-05-01",
      "total": 12
    },
    {
      "fecha": "2026-05-02",
      "total": 15
    },
    {
      "fecha": "2026-05-03",
      "total": 18
    },
    {
      "fecha": "2026-05-04",
      "total": 10
    }
  ]
}
```

---

## 👥 Usuarios

### 1. Listar Usuarios

**Endpoint:** `GET /users`

**Propósito:** Obtener listado de usuarios (admin only).

**Query Parameters:**
```
?rol=paciente,medico,admin
?pagina=1
?limite=20
```

**Response (200 OK):**
```json
{
  "success": true,
  "total": 150,
  "page": 1,
  "limit": 20,
  "data": [
    {
      "_id": "507f1f77bcf86cd799439011",
      "nombre": "Juan Pérez",
      "email": "juan@example.com",
      "rol": "paciente",
      "estado": "activo",
      "createdAt": "2026-04-15T10:20:30Z"
    },
    {
      "_id": "doc_001",
      "nombre": "Dr. García López",
      "email": "garcia@example.com",
      "rol": "medico",
      "estado": "activo",
      "createdAt": "2026-03-01T08:15:00Z"
    }
  ]
}
```

---

## 🔢 Códigos de Estado HTTP

| Código | Significado | Ejemplo |
|--------|------------|---------|
| **200** | OK | GET exitoso, DELETE exitoso |
| **201** | Created | POST exitoso (crear recurso) |
| **400** | Bad Request | Datos inválidos, validación fallida |
| **401** | Unauthorized | Token expirado, no autenticado |
| **403** | Forbidden | Rol insuficiente, acceso negado |
| **404** | Not Found | Recurso no existe |
| **409** | Conflict | Recurso duplicado, conflicto de datos |
| **500** | Server Error | Error en el servidor |

---

## 🔗 Headers Requeridos

### En todas las solicitudes:
```
Content-Type: application/json
```

### En solicitudes autenticadas:
```
Cookie: token={jwt_token}  // Enviado automáticamente con withCredentials
```

---

## 📲 Ejemplo de Flujo Completo

### 1. Registro
```javascript
POST /auth/register
{
  "nombre": "Juan",
  "email": "juan@example.com",
  "contrasena": "password123",
  "rol": "paciente"
}
// Response: 201 Created
```

### 2. Login
```javascript
POST /auth/login
{
  "email": "juan@example.com",
  "contrasena": "password123"
}
// Response: 200 OK + Set-Cookie: token={jwt}
```

### 3. Verificar sesión
```javascript
GET /auth/me
// Headers: Cookie: token={jwt} (automático con withCredentials)
// Response: 200 OK { user: {...} }
```

### 4. Buscar médicos
```javascript
GET /doctors?especialidad=Cardiología
// Response: 200 OK { data: [{ _id, nombre, slots: [...] }] }
```

### 5. Crear cita
```javascript
POST /appointments
{
  "doctorId": "doc_001",
  "fechaHora": "2026-05-10T14:30:00Z",
  "motivo": "Chequeo"
}
// Response: 201 Created { _id, estado: 'pendiente' }
```

### 6. Obtener mis citas
```javascript
GET /appointments
// Response: 200 OK { data: [...] }
```

---

## ✅ Checklist de Implementación

- [x] Autenticación (Login, Register, Verify, Logout)
- [x] Listado de médicos con slots
- [x] CRUD de citas
- [x] Cambio de estado de citas
- [x] Reportes (ocupación, especialidades, período)
- [x] Gestión de usuarios (admin)
- [x] Cookies HttpOnly
- [x] Validaciones en backend
- [x] Códigos HTTP correctos
- [x] Paginación en listados

---

**Documentación de Contratos de API Completa**  
*Actualizado: 3 de Mayo de 2026*
