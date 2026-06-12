# 🚀 DOCUMENTACIÓN DE DESPLIEGUE - MediQ Frontend en Render

**Issue:** Configurar despliegue del frontend como servicio independiente en Render  
**Integrante:** Camila  
**Fecha:** 12 de Junio de 2026  
**Estado:** ✅ COMPLETADO

---

## 🎯 Objetivo

Configurar el frontend para que pueda desplegarse como servicio independiente en Render,
tomando como raíz la carpeta `Frontend/`, aunque el proyecto siga siendo un monorepo.

---

## 📁 Estructura del Monorepo

```
MediQ/                          ← Raíz del repositorio
├── Backend/                    ← Servicio backend (Node.js + Express)
├── Frontend/                   ← Servicio frontend (React + Vite)
│   ├── src/
│   ├── package.json
│   ├── vite.config.js
│   ├── Dockerfile
│   ├── .env                    ← Variables locales (no se sube a GitHub)
│   └── .env.production         ← Variables de producción ✅ CREADO
├── docker-compose.yml          ← Para desarrollo local con Docker
├── render.yaml                 ← Configuración de Render ✅ CREADO
└── README.md
```

---

## ⚙️ Archivos Creados

### 1. `render.yaml` (raíz del proyecto)

Define la configuración del servicio estático en Render:

```yaml
services:
  - type: web
    name: mediq-frontend
    runtime: static
    rootDir: Frontend
    buildCommand: npm install && npm run build
    staticPublishPath: dist
    routes:
      - type: rewrite
        source: /*
        destination: /index.html
    envVars:
      - key: VITE_API_URL
        sync: false
```

### 2. `Frontend/.env.production`

Variable de entorno apuntando al backend en producción:

```
VITE_API_URL=https://mediq-backend.onrender.com/api
```

> ⚠️ Actualizar con la URL real del backend cuando esté desplegado.

---

## 🌐 Configuración en Render

### Tipo de servicio
**Static Site**

### Parámetros configurados

| Campo | Valor |
|---|---|
| **Name** | MediQ |
| **Branch** | feature/render-frontend-deploy |
| **Root Directory** | `Frontend` |
| **Build Command** | `npm install && npm run build` |
| **Publish Directory** | `dist` |

### Variable de entorno

| Key | Value |
|---|---|
| `VITE_API_URL` | `https://mediq-backend.onrender.com/api` |

### Rewrite Rule (para React Router)

| Source | Destination | Action |
|---|---|---|
| `/*` | `/index.html` | Rewrite |

> Esta regla es necesaria para que React Router funcione correctamente cuando
> el usuario recarga la página o accede directamente a una ruta como `/login`.

---

## ✅ Checklist de Cumplimiento

| Ítem | Estado |
|---|---|
| Revisar configuración necesaria para desplegar desde `Frontend/` | ✅ |
| Definir el `root directory` correcto en Render | ✅ `Frontend` |
| Confirmar comando de instalación de dependencias | ✅ `npm install` |
| Confirmar comando de build | ✅ `npm run build` |
| Confirmar directorio de salida de producción | ✅ `dist` |
| Configurar `VITE_API_URL` apuntando al backend | ✅ Configurado en Render |
| Verificar que el frontend desplegado cargue sin errores | ✅ Carga correctamente |
| Verificar que el frontend consuma la API real en producción | ⏳ Pendiente backend |
| Documentar la configuración final para la sustentación | ✅ Este documento |

---

## 🔗 URL del Frontend Desplegado

```
https://mediq-pdy3.onrender.com
```

---

## 🔄 Relación con otros servicios del equipo

### Dependencia con el Backend
El frontend depende del backend desplegado en Render para funcionar en producción.
Una vez que el compañero del backend despliegue su servicio:

1. Actualizar `VITE_API_URL` en Render con la URL real del backend
2. Pedir al compañero del backend que actualice `CORS_ORIGIN` en su servicio de Render
   con la URL del frontend: `https://mediq-pdy3.onrender.com`

### Configuración CORS requerida en el Backend
El backend tiene configurado CORS en `src/app.js`:
```javascript
cors({
  origin: CORS_ORIGIN,  // Debe incluir https://mediq-pdy3.onrender.com
  credentials: true,
})
```

---

## 🛠️ Cómo hacer Redeploy

Si se necesita actualizar el despliegue:

**Opción A — Automático:** Hacer push a la rama `feature/render-frontend-deploy`,
Render detecta el cambio y hace redeploy automáticamente.

**Opción B — Manual:** En el panel de Render, clic en **Manual Deploy**.

---

## 📝 Notas Técnicas

- El proyecto usa **Vite 7.3.1** como bundler
- El directorio de salida por defecto de Vite es `dist/` (sin configuración adicional)
- La variable `VITE_API_URL` es inyectada en tiempo de build por Vite
- El frontend usa `axios` con `withCredentials: true` para manejar cookies HttpOnly
- La rewrite rule `/* → /index.html` es obligatoria para SPAs con React Router

---

**Documento de Despliegue**  
*MediQ Frontend - Render Static Site*  
*Generado: 12 de Junio de 2026*  
*Estado: ✅ LISTO PARA SUSTENTACIÓN*
