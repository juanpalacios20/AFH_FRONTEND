# Stage 1: Build de la aplicación Angular
FROM node:18-alpine AS build

# Instalar dependencias del sistema necesarias para compilación nativa
RUN apk add --no-cache python3 make g++

# Establecer directorio de trabajo
WORKDIR /app

# Copiar archivos de configuración de dependencias
COPY package*.json ./

# Instalar dependencias incluyendo devDependencies
RUN npm ci --include=dev

# Copiar el código fuente
COPY . .


# Construir la aplicación para producción
RUN npm run build

# Stage 2: Servir la aplicación con nginx
FROM nginx:alpine

# Copiar archivos de build desde el stage anterior
# El directorio de salida es dist/afh_frontend según angular.json
COPY --from=build /app/dist/afh_frontend/browser/ /usr/share/nginx/html/

# Crear configuración básica de nginx para SPA
RUN echo 'server { \
    listen 80; \
    server_name localhost; \
    root /usr/share/nginx/html; \
    index index.html; \
    \
    # Configuración para archivos estáticos \
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ { \
        expires 1y; \
        add_header Cache-Control "public, immutable"; \
        try_files $uri =404; \
    } \
    \
    # Configuración para archivos de recursos \
    location /resource/ { \
        expires 1y; \
        add_header Cache-Control "public, immutable"; \
        try_files $uri =404; \
    } \
    \
    # Configuración para SPA \
    location / { \
        try_files $uri $uri/ /index.html; \
    } \
}' > /etc/nginx/conf.d/default.conf

# Exponer el puerto 80
EXPOSE 80

# Comando por defecto
CMD ["nginx", "-g", "daemon off;"]