FROM node:20-alpine
WORKDIR /app

# Usa node_modules já construído localmente para acelerar o build
COPY frontend/package.json ./package.json
COPY frontend/node_modules ./node_modules
COPY frontend ./

EXPOSE 3000
CMD ["npm", "run", "dev"]
