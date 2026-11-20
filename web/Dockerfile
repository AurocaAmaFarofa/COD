# Etapa 1: gera os arquivos estáticos do React
FROM node:24-alpine AS build
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci
COPY . .
RUN npm run build

# Etapa 2: serve os arquivos com Nginx (HTTPS)
FROM nginx:1.28-alpine
RUN apk add --no-cache openssl
# O template vira conf.d/default.conf ao subir, com ${HTTPS_PORT} preenchido.
COPY nginx.conf /etc/nginx/templates/default.conf.template
COPY docker/15-certificado.sh /docker-entrypoint.d/15-certificado.sh
RUN chmod +x /docker-entrypoint.d/15-certificado.sh && rm -f /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist /usr/share/nginx/html
EXPOSE 80 443
