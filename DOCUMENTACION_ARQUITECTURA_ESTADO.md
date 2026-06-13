# 🧠 ARQUITECTURA DE ESTADO - Zustand

**Documentación Técnica de Gestión de Estado Global**  
**Proyecto:** MediQ - Sistema de Gestión Médica  
**Generado:** 3 de Mayo de 2026

---

## 📋 Resumen Ejecutivo

El proyecto MediQ ha completado la **migración total de Context API a Zustand**, implementando una arquitectura de estado global moderna, escalable y performante.

**Stores Implementados:**
- ✅ `useAuthStore` - Autenticación y sesión
- ✅ `useAppointmentStore` - Gestión de citas (datos)

---

## 🏗️ Arquitectura General

```
┌─────────────────────────────────────────────┐
│           React Components                   │
│    (LoginPage, DashboardPage, etc.)         │
└──────────────┬──────────────────────────────┘
               │
       ┌───────┴────────┐
       ▼                 ▼
  useAuthStore    useAppointmentStore
   (Zustand)       (Zustand)
       │                 │
       └─────────┬───────┘
               ▼
       Backend API (Axios)
   - POST /auth/login
   - GET /auth/me
   - GET /appointments
   - POST /appointments
   - etc.
```

---

## 1️⃣ useAuthStore - Autenticación y Sesión

**Ubicación:** `src/stores/useAuthStore.js`

### Estado

```javascript
{
  // ─── Datos del usuario ─────────────────────────────────────
  user: null,                  // { id, nombre, email, rol }
  isAuthenticated: false,      // Boolean - sesión activa
  isLoading: true,             // Boolean - verificación en curso
  error: null                  // String - último error
}
```

### Acciones (Mutations)

#### 1. **checkSession()**
**Tipo:** Asincrónica (async)

**Propósito:** Verificar si el usuario tiene una sesión activa al cargar la app.

**Flujo:**
```javascript
1. set({ isLoading: true })
2. GET /auth/me (validar cookie activa)
3. if (response.ok) → set({ user: data, isAuthenticated: true })
4. else → set({ user: null, isAuthenticated: false })
5. finally → set({ isLoading: false })
```

**Uso:**
```jsx
// App.jsx
useEffect(() => {
  checkSession()  // Llamado UNA SOLA VEZ al montar la app
}, [checkSession])
```

**Beneficio:** Evita flicker al recargar la página (F5).

---

#### 2. **login(email, password)**
**Tipo:** Asincrónica (async)

**Propósito:** Autenticar usuario con credenciales.

**Flujo:**
```javascript
1. set({ error: null })
2. POST /auth/login { email, contrasena: password }
3. if (success) → set({ 
     user: response.data, 
     isAuthenticated: true 
   })
4. else → set({ error: errorMessage })
```

**Parámetros:**
- `email` (string) - Email del usuario
- `password` (string) - Contraseña

**Respuesta esperada:**
```json
{
  "data": {
    "id": "user123",
    "nombre": "Juan Pérez",
    "email": "juan@example.com",
    "rol": "paciente",
    "token": "jwt_token_here"
  }
}
```

**Uso en componente:**
```jsx
const { login, error, isSubmitting } = useAuthStore()

const handleSubmit = async (data) => {
  await login(data.email, data.password)
  // El efecto de useAuthStore ya redirige automáticamente
}
```

---

#### 3. **logout()**
**Tipo:** Asincrónica (async)

**Propósito:** Cerrar sesión del usuario.

**Flujo:**
```javascript
1. POST /auth/logout
2. finally → set({
     user: null,
     isAuthenticated: false,
     error: null
   })
```

**Uso en componente:**
```jsx
const handleLogout = async () => {
  await logout()
  navigate('/login', { replace: true })
}
```

---

#### 4. **clearError()**
**Tipo:** Sincrónica

**Propósito:** Limpiar el último error sin hacer logout.

**Flujo:**
```javascript
set({ error: null })
```

**Uso:**
```jsx
// En LoginPage - borrar error al escribir en input
<input
  onChange={(e) => {
    clearError()
    // ... resto del handler
  }}
/>
```

---

### Helpers de Rol

```javascript
// Funciones derivadas para validar rol del usuario
isPaciente: () => get().user?.rol === 'paciente'
isMedico: () => get().user?.rol === 'medico'
isAdmin: () => get().user?.rol === 'admin'
```

**Uso:**
```jsx
const { isPaciente, isMedico, isAdmin } = useAuthStore()

if (isAdmin()) {
  // Mostrar panel de admin
}
```

### Seguridad Implementada

- ✅ **withCredentials: true** - Envía cookies HttpOnly automáticamente
- ✅ **Token en Cookie** - No se expone en localStorage
- ✅ **Validación en ProtectedRoute** - Verifica sesión antes de renderizar
- ✅ **Auto-logout en 401** - Detecta tokens expirados

---

## 2️⃣ useAppointmentStore - Gestión de Citas

**Ubicación:** `src/stores/useAppointmentStore.js`

### Estado

```javascript
{
  appointments: [],      // Array de citas
  isLoading: false,      // Boolean - operación en curso
  error: null            // String - último error
}
```

### Acciones (Mutations)

#### 1. **fetchAppointments()**
**Tipo:** Asincrónica (async)

**Propósito:** Obtener listado de citas.

**Flujo:**
```javascript
1. set({ isLoading: true, error: null })
2. GET /appointments
3. set({ appointments: response.data, isLoading: false })
4. catch → set({ error: msg, isLoading: false })
```

**Uso:**
```jsx
const { fetchAppointments, appointments, isLoading } = useAppointmentStore()

useEffect(() => {
  fetchAppointments()
}, [])

if (isLoading) return <LoadingSpinner />
return (
  <div>
    {appointments.map(apt => (
      <AppointmentCard key={apt._id} appointment={apt} />
    ))}
  </div>
)
```

---

#### 2. **createAppointment(data)**
**Tipo:** Asincrónica (async)

**Propósito:** Crear una nueva cita.

**Parámetros:**
```javascript
{
  doctorId: string,
  fechaHora: string (ISO 8601),
  motivo: string
}
```

**Flujo:**
```javascript
1. set({ isLoading: true, error: null })
2. POST /appointments { ...data }
3. set(state => ({
     appointments: [...state.appointments, response.data],
     isLoading: false
   }))
4. return response.data  // Para que componente sepa éxito
5. catch → set({ error: msg, isLoading: false }) + throw error
```

**Ejemplo de respuesta:**
```json
{
  "_id": "apt123",
  "pacienteId": "user123",
  "doctorId": "doc456",
  "medico": { "nombre": "Dr. García" },
  "fechaHora": "2026-05-10T14:30:00Z",
  "motivo": "Chequeo general",
  "estado": "pendiente"
}
```

**Uso en componente:**
```jsx
const { createAppointment } = useAppointmentStore()

const handleBooking = async () => {
  try {
    const newApt = await createAppointment({
      doctorId,
      fechaHora: selectedSlot,
      motivo
    })
    // ✅ Éxito - mostrar confirmación
    setSuccess(true)
  } catch (error) {
    // ❌ Error - mostrar toast
    showToast(error.message, 'error')
  }
}
```

---

#### 3. **updateAppointment(id, data)**
**Tipo:** Asincrónica (async)

**Propósito:** Actualizar una cita existente.

**Parámetros:**
```javascript
id: string,      // ID de la cita
data: {
  fechaHora?: string,
  motivo?: string,
  estado?: string
}
```

**Flujo:**
```javascript
1. set({ isLoading: true, error: null })
2. Detectar si es actualización de estado o datos
   - if (data.estado) → PATCH /appointments/:id/status
   - else → PUT /appointments/:id
3. set(state => ({
     appointments: state.appointments.map(apt =>
       apt._id === id ? { ...apt, ...response.data } : apt
     ),
     isLoading: false
   }))
4. return response.data
5. catch → set({ error, isLoading: false }) + throw error
```

**Uso:**
```jsx
const handleReschedule = async (newDate) => {
  await updateAppointment(appointmentId, {
    fechaHora: newDate
  })
}
```

---

#### 4. **cancelAppointment(id, motivo)**
**Tipo:** Asincrónica (async)

**Propósito:** Cancelar una cita.

**Parámetros:**
```javascript
id: string,           // ID de la cita
motivo: string = ''   // Razón de cancelación (opcional)
```

**Flujo:**
```javascript
1. set({ isLoading: true, error: null })
2. PATCH /appointments/:id/status { 
     estado: 'cancelada', 
     motivo 
   }
3. set(state => ({
     appointments: state.appointments.map(apt =>
       apt._id === id ? { ...apt, estado: 'cancelada' } : apt
     ),
     isLoading: false
   }))
4. return response.data
5. catch → set({ error, isLoading: false }) + throw error
```

**Uso:**
```jsx
const handleCancel = async (motivo) => {
  await cancelAppointment(appointmentId, motivo)
  showToast('Cita cancelada correctamente', 'success')
}
```

---

## 🔄 Integración Store + Componentes

### Patrón de Consumo

```jsx
// 1. Importar el store
import useAuthStore from '../stores/useAuthStore'

// 2. Usar el hook (no es un componente)
function MyComponent() {
  const { user, isAuthenticated, login, logout } = useAuthStore()

  // 3. Acceder a estado y acciones
  return (
    <div>
      {isAuthenticated ? (
        <div>
          <p>Hola {user.nombre}</p>
          <button onClick={logout}>Logout</button>
        </div>
      ) : (
        <button onClick={() => login(email, password)}>Login</button>
      )}
    </div>
  )
}
```

### Patrón de Carga Asincrónica

```jsx
function AppointmentsList() {
  const { appointments, isLoading, error, fetchAppointments } = useAppointmentStore()

  useEffect(() => {
    fetchAppointments()  // Llamar acción al montar
  }, [])

  if (isLoading) return <LoadingSpinner />
  if (error) return <ToastNotification message={error} type="error" />

  return (
    <div>
      {appointments.map(apt => (
        <AppointmentCard key={apt._id} appointment={apt} />
      ))}
    </div>
  )
}
```

---

## 🔄 Flujo de Estados

### Autenticación: Login

```
Initial State
    ↓
User Clicks Login
    ↓
isLoading = true  (spinner aparece)
    ↓
POST /auth/login
    ↓
✅ Success:
   - user = response.data
   - isAuthenticated = true
   - isLoading = false
   - error = null
   ↓
useEffect en LoginPage detecta isAuthenticated = true
   ↓
navigate() a /patient/search
```

### Autenticación: Página Reload (F5)

```
App.jsx monta
    ↓
useEffect llama checkSession()
    ↓
isLoading = true  (LoadingSpinner en ProtectedRoute)
    ↓
GET /auth/me (valida cookie)
    ↓
✅ Valid Cookie:
   - user = response.data
   - isAuthenticated = true
   - isLoading = false
   ↓
ProtectedRoute ve isLoading = false
   ↓
Renderiza contenido (SIN FLICKER)
```

---

## 📊 Comparativa: Context API vs Zustand

| Aspecto | Context API | Zustand |
|---------|------------|---------|
| **Setup** | Complejo (Provider, Context, Hooks) | Simple (1 línea) |
| **Re-renders** | Componentes padre + consumers | Solo consumidores actualizados |
| **Performance** | ⚠️ Re-renders innecesarios | ✅ Optimizado automáticamente |
| **Código** | ~50 líneas por store | ~30 líneas por store |
| **Debugging** | DevTools limitadas | Redux DevTools compatible |
| **Migración** | ❌ No migrado aquí | ✅ Implementado 100% |

---

## 🛡️ Patrones de Seguridad

### 1. Cookie HttpOnly
```javascript
// En axios config
{
  withCredentials: true  // Envía cookies automáticamente
}

// Backend (Node.js)
res.cookie('token', jwt, {
  httpOnly: true,    // ✅ No accesible desde JS
  secure: true,      // HTTPS only
  sameSite: 'strict' // CSRF protection
})
```

### 2. Validación en ProtectedRoute
```jsx
if (isLoading) return <Spinner />        // Esperando verificación
if (!isAuthenticated) return <Navigate to="/login" />
if (!allowedRoles.includes(user.rol)) return <Navigate to="/" />
return <Outlet />  // ✅ Ruta permitida
```

### 3. Auto-logout en 401
```javascript
// En interceptor de axios (si lo hay)
axiosInstance.interceptors.response.use(
  response => response,
  error => {
    if (error.response?.status === 401) {
      useAuthStore.setState({ 
        user: null, 
        isAuthenticated: false 
      })
      navigate('/login')
    }
    return Promise.reject(error)
  }
)
```

---

## 📝 Casos de Uso

### Caso 1: Login Exitoso
```javascript
// Usuario ingresa credenciales y hace click en "Iniciar sesión"
await login('juan@example.com', 'password123')

// Store actualiza:
{
  user: { id: '123', nombre: 'Juan', rol: 'paciente' },
  isAuthenticated: true,
  error: null
}

// LoginPage useEffect detecta isAuthenticated y redirige
```

### Caso 2: Login Fallido
```javascript
// Usuario ingresa credenciales incorrectas
await login('juan@example.com', 'wrongpassword')

// Backend retorna 401
// Store actualiza:
{
  isAuthenticated: false,
  error: 'Email o contraseña incorrectos'
}

// LoginPage muestra <AuthFeedback message={error} type="error" />
```

### Caso 3: Recarga de Página
```javascript
// Usuario en /patient/appointments presiona F5
// App.jsx monta → useEffect llama checkSession()

// checkSession():
{
  isLoading: true
}

// GET /auth/me valida cookie
// Response exitosa:
{
  user: { id: '123', ... },
  isAuthenticated: true,
  isLoading: false
}

// ProtectedRoute ve isLoading=false y renderiza AppointmentsPage
// ✅ SIN FLICKER
```

### Caso 4: Crear Cita
```javascript
// Usuario selecciona médico y horario
await createAppointment({
  doctorId: 'doc456',
  fechaHora: '2026-05-10T14:30:00Z',
  motivo: 'Chequeo general'
})

// Store actualiza:
{
  appointments: [...appointments, newAppointment],
  isLoading: false
}

// Componente muestra confirmación con CheckCircle icon
```

---

## ✅ Checklist de Implementación

- [x] Migración total de Context API a Zustand
- [x] useAuthStore con user, isAuthenticated, login, logout
- [x] useAppointmentStore con CRUD async
- [x] checkSession() previene flicker
- [x] isLoading previene renders innecesarios
- [x] Error handling en todas acciones
- [x] withCredentials configurado
- [x] ProtectedRoute valida sesión
- [x] Acciones asincrónicas con try/catch/finally
- [x] Integración con Axios sin interceptores adicionales

---

**Documentación de Arquitectura de Estado Completa**  
*Zustand v5.0.12 - React 19.2.4*  
*Actualizado: 3 de Mayo de 2026*
