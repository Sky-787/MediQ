# MediQ Deployment Checklist

## Render services

### Frontend
- Service type: `Static Site`
- Root directory: `Frontend`
- Build command: `npm ci && npm run build`
- Publish directory: `dist`
- Environment variable:
  - `VITE_API_URL=https://<backend-service>.onrender.com/api`

### Backend
- Service type: `Web Service`
- Root directory: `Backend`
- Build command: `npm ci`
- Start command: `npm start`
- Environment variables:
  - `PORT=5000`
  - `MONGODB_URI=<mongodb-uri>`
  - `JWT_SECRET=<jwt-secret>`
  - `NODE_ENV=production`
  - `CORS_ORIGIN=http://localhost:5173,http://localhost:3000,https://<frontend-service>.onrender.com`

## GitHub Secrets

- `RENDER_FRONTEND_DEPLOY_HOOK`
- `RENDER_BACKEND_DEPLOY_HOOK`

## Sustentation checks

- `GET /api/health` responde `200`
- login desde frontend desplegado consume backend real
- forzar `401` con sesion vencida y validar redireccion a `/login`
- forzar `403` con usuario autenticado sin permisos sobre la ruta o recurso
- revisar historial limpio de workflows en GitHub Actions
- ejecutar Lighthouse sobre el dominio productivo del frontend
- configurar pings de UptimeRobot al endpoint `https://<backend-service>.onrender.com/api/health`
