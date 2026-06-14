# Build context is the monorepo ROOT (see docker-compose.yml) so the shared
# @repo/db workspace package is available to the WebSocket service.
FROM node:20-alpine

WORKDIR /app

COPY package.json package-lock.json turbo.json ./
COPY packages/db/package.json ./packages/db/package.json
COPY apps/ws/package.json ./apps/ws/package.json
RUN npm install --ignore-scripts

COPY packages/db ./packages/db
COPY apps/ws ./apps/ws

# Generate the Prisma client so @repo/db is importable at runtime.
RUN npm run db:generate -w @repo/db

EXPOSE 4001

CMD ["npm", "run", "start", "-w", "leetlab-ws"]
