FROM node:22-slim

WORKDIR /app

ADD . .

RUN npm ci

RUN npm run build

CMD ["node", "dist/server.js"]
