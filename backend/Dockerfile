FROM node:22-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY prisma.config.ts ./
COPY prisma ./prisma

# Temporary build-time value used only so Prisma can load prisma.config.ts
# The real DATABASE_URL will be supplied at container runtime.
ENV DATABASE_URL="postgresql://build:build@localhost:5432/build"

RUN npx prisma generate

COPY src ./src

EXPOSE 4000

CMD ["npm", "run", "start"]
