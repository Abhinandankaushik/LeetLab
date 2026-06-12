FROM node:22-alpine

WORKDIR /app

ARG DATABASE_URL=postgresql://postgres:postgres@localhost:5432/postgres
ENV DATABASE_URL=${DATABASE_URL}

COPY package*.json ./

RUN npm install

COPY . .

RUN npx prisma generate

EXPOSE 3000

CMD ["sh", "-c", "until nc -z postgres-db 5432; do echo waiting for postgres; sleep 1; done; npx prisma migrate deploy && npm run start"]

