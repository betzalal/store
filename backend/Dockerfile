FROM node:20-slim

# Instalar OpenSSL
RUN apt-get update -y && apt-get install -y openssl

WORKDIR /app

# Copiar archivos de configuración
COPY package*.json ./
COPY prisma ./prisma/

# Instalar dependencias
RUN npm install

# Copiar el resto del código
COPY . .

# Regeneramos el binario de Prisma para Linux interno en el Dockerfile
RUN npx prisma generate

# Exponemos el puerto de backend
EXPOSE 3001

# Comando final: Empujar base de datos (crear tablas) y Encender
CMD npx prisma db push && npm start
