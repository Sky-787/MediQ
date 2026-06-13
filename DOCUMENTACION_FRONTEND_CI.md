# 🚀 DOCUMENTACIÓN WORKFLOW DE INTEGRACIÓN CONTINUA (CI) - MediQ Frontend

**Objetivo:** Validar automáticamente la calidad, estabilidad y corrección del frontend en cada push o pull request hacia las ramas principales.
**Integrante:** Farid
**Fecha:** 13 de Junio de 2026
**Estado:** ✅ COMPLETADO

---

## 🎯 Objetivo

Establecer un workflow de GitHub Actions que actúe como red de seguridad automática para el frontend. El pipeline asegura que ningún cambio que rompa la compilación, falle las pruebas unitarias o viole las reglas de estilo (linting) sea integrado en las ramas principales (`main`, `develop`).

---

## ⚙️ Configuración del Pipeline

El workflow está definido en [.github/workflows/frontend-ci.yml](file:///Users/faridzemanate/Docs/MediQ/.github/workflows/frontend-ci.yml) y realiza los siguientes pasos de forma secuencial en un entorno limpio (`ubuntu-latest`):

1. **Instalación limpia de dependencias:** Utiliza `npm ci` para asegurar que las dependencias se instalen de manera reproducible a partir del archivo `package-lock.json`.
2. **Análisis de calidad de código (Linter):** Ejecuta `npm run lint` (`eslint .`) para buscar inconsistencias, errores de estilo o bugs potenciales de JavaScript/React en el código fuente.
3. **Compilación de producción (Build):** Ejecuta `npm run build` (`vite build`) para asegurar que el frontend compila correctamente y no contiene errores de importación ni fallos del compilador.
4. **Ejecución de Pruebas Unitarias:** Ejecuta `npm test -- --run` (`vitest --run`) para correr toda la suite de pruebas del frontend en un entorno no interactivo y certificar que todas las pruebas pasan correctamente.

Si cualquiera de estos pasos falla, el pipeline aborta de inmediato y marca la ejecución como fallida.

---

## 🔗 Disparadores del Workflow

El pipeline se ejecuta automáticamente bajo las siguientes condiciones:
- **Eventos:** `push` y `pull_request`
- **Ramas objetivo:** `main` y `develop`
- **Filtro de rutas:** Solo se activa si hay cambios en los archivos dentro de la carpeta `Frontend/**` o en el propio archivo del workflow `.github/workflows/frontend-ci.yml`. Esto evita ejecuciones innecesarias cuando solo se modifica el backend u otros archivos del repositorio.

---

## 🛠️ Ejecución Local

Para verificar que tu código pasará la validación del CI antes de subirlo al repositorio, puedes ejecutar los mismos comandos localmente en la carpeta `Frontend`:

```bash
# 1. Instalar dependencias limpias
npm install

# 2. Ejecutar análisis estático (Lint)
npm run lint

# 3. Compilar el proyecto para producción
npm run build

# 4. Correr la suite de pruebas
npm test -- --run
```
