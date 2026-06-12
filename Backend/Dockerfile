FROM node:24-alpine

# Crear directorio de trabajo
WORKDIR /app

# Copiar primero archivos clave para aprovechar caché de Docker
COPY package*.json ./

# Instalar dependencias de forma limpia (solo para producción)
RUN npm ci --omit=dev

# Copiar el resto del código
COPY . .

# Cambiar permisos si es necesario, o directamente cambiar de usuario
# La imagen de node ya trae un usuario "node" sin privilegios root
USER node

# Exponer el puerto por defecto del backend
EXPOSE 5000

# Definir correctamente el comando de inicio
CMD ["npm", "start"]
