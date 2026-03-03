# ---------- Build Stage ----------
FROM node:20-alpine AS build

WORKDIR /app

# Copy root workspace files
COPY package*.json ./

# Copy backend package.json
COPY apps/backend/package*.json ./apps/backend/

# Install workspace dependencies
RUN npm install --workspace=apps/backend

# Copy entire monorepo
COPY . .

# Build backend
WORKDIR /app/apps/backend
RUN npm run build


# ---------- Production Stage ----------
FROM node:20-alpine

WORKDIR /app

# Copy root + backend package.json
COPY package*.json ./
COPY apps/backend/package*.json ./apps/backend/

# Install only backend production deps
RUN npm install --omit=dev --workspace=apps/backend

# Copy built files
COPY --from=build /app/apps/backend/dist ./apps/backend/dist

WORKDIR /app/apps/backend

EXPOSE 4000

ENV NODE_ENV=production

CMD ["node", "dist/server.js"]