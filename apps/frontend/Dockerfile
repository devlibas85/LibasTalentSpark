# ---------- Build Stage ----------
FROM node:20-alpine AS build

WORKDIR /app

# Copy root workspace files
COPY package*.json ./

# Copy frontend package.json
COPY apps/frontend/package*.json ./apps/frontend/

# Install workspace dependencies
RUN npm install

# Copy full monorepo
COPY . .

# Build frontend
WORKDIR /app/apps/frontend
RUN npm run build


# ---------- Production Stage ----------
FROM nginx:alpine

# Copy nginx config
COPY apps/frontend/nginx.conf /etc/nginx/conf.d/default.conf

# Copy built files
COPY --from=build /app/apps/frontend/dist /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]