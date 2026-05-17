# Passo 1: Construir a aplicação React
FROM node:20-alpine AS builder

WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

# Passo 2: Servir a aplicação compilada com NGINX
FROM nginx:alpine

# Copiar os ficheiros compilados do Passo 1 para o servidor NGINX
COPY --from=builder /app/dist /usr/share/nginx/html

# Copiar configuração customizada do NGINX (opcional, para lidar com React Router)
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
