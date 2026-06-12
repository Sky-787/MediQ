# Etapa 1: Construcción (Build)
FROM node:24-alpine AS build

WORKDIR /app

# Copiar archivos de dependencias
COPY package*.json ./

# Instalar dependencias
RUN npm ci

# Copiar el resto del código
COPY . .

# Declarar ARG para la URL de la API en tiempo de construcción
ARG VITE_API_URL
ENV VITE_API_URL=$VITE_API_URL

# Construir la aplicación (salida en dist/)
RUN npm run build

# Etapa 2: Producción
FROM node:24-alpine

WORKDIR /app

# Instalar un servidor estático ligero
RUN npm install -g serve

# Copiar solo la carpeta dist generada en la etapa de construcción
COPY --from=build /app/dist ./dist

# Cambiar al usuario no-root provisto por la imagen node
USER node

# Exponer el puerto
EXPOSE 3000

# Comando de arranque para servir la aplicación
CMD ["serve", "-s", "dist", "-l", "3000"]
