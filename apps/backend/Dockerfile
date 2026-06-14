# Build context is the monorepo ROOT (see docker-compose.yml), because the
# backend depends on the @repo/db workspace package.
FROM node:22-alpine

WORKDIR /app

ARG DATABASE_URL=postgresql://postgres:postgres@localhost:5432/postgres
ENV DATABASE_URL=${DATABASE_URL}

# Install dependencies using the workspace manifests first (better layer caching).
COPY package.json package-lock.json turbo.json ./
COPY packages/db/package.json ./packages/db/package.json
COPY apps/backend/package.json ./apps/backend/package.json
RUN npm install --ignore-scripts

# Copy the source needed by the backend (its own code + the db package).
COPY packages/db ./packages/db
COPY apps/backend ./apps/backend

# Generate the Prisma client inside the @repo/db package.
RUN npm run db:generate -w @repo/db

EXPOSE 3000

CMD ["sh", "-c", "until nc -z postgres-db 5432; do echo waiting for postgres; sleep 1; done; npm run db:deploy -w @repo/db && npm run start -w backend"]
