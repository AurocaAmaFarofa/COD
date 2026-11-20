FROM node:24-alpine

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci --omit=dev

COPY src ./src

ENV NODE_ENV=production
ENV PORT=3000
EXPOSE 3000

# Sem root: se um dia houver uma falha que execute código, ela fica limitada ao usuário "node".
USER node

CMD ["node", "src/server.js"]
