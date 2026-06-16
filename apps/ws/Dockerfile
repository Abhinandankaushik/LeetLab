# Build context is the monorepo ROOT (see docker-compose.yml) so the shared
# @repo/db workspace package is available to the WebSocket service.
FROM node:22-alpine

WORKDIR /app

COPY package.json package-lock.json turbo.json ./
COPY packages/db/package.json ./packages/db/package.json
COPY apps/ws/package.json ./apps/ws/package.json
RUN npm install --ignore-scripts

COPY packages/db ./packages/db
COPY apps/ws ./apps/ws

EXPOSE 4001

CMD ["npm", "run", "start", "-w", "leetlab-ws"]
