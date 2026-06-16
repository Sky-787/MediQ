# 🏥 MediQ API — Sistema de Gestión de Citas Médicas

> **Backend RESTful** desarrollado con Node.js y Express. 
> Proporciona la lógica de negocio, autenticación segura y persistencia de datos para la plataforma MediQ.

---

## 🛠️ Stack Tecnológico

| Tecnología | Propósito |
| :--- | :--- |
| **Node.js** | Entorno de ejecución |
| **Express.js** | Framework web para la API |
| **MongoDB Atlas** | Base de Datos NoSQL (Cloud) |
| **Mongoose** | ODM para modelado de datos |
| **JWT** | Autenticación basada en tokens |
| **Swagger** | Documentación interactiva (OpenAPI 3.0) |
| **Bcryptjs** | Encriptación de contraseñas |

---

## 📖 Documentación de la API

### 1. Swagger UI (Interactivo)
Una vez que el servidor esté en marcha, puedes explorar y probar los endpoints en tiempo real:
👉 [http://localhost:5000/api-docs](http://localhost:5000/api-docs)

### 2. Postman Collection
En la raíz de esta carpeta se encuentra el archivo `postman_collection.json`. 
- **Importación:** Abre Postman -> Import -> Arrastra el archivo.
- **Variable de entorno:** Asegúrate de tener `{{baseUrl}}` configurado como `http://localhost:5000/api`.

---

## 🚀 Instalación y Configuración

Sigue estos pasos para levantar el entorno de desarrollo local:

1. **Entrar a la carpeta del servidor:**
   ```bash
   cd Backend
   ```

2. **Configurar las variables de entorno:**
   Copia el archivo de plantilla `.env.example` a un nuevo archivo `.env` (el cual está excluido del control de versiones bajo los principios de 12-Factor App) y completa los valores correspondientes:
   ```bash
   cp .env.example .env
   ```

3. **Instalar dependencias:**
   ```bash
   npm install
   ```

4. **Sembrar la base de datos (opcional):**
   ```bash
   npm run seed
   ```

5. **Iniciar el servidor en desarrollo:**
   ```bash
   npm run dev
   ```