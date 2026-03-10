# ── Stage 1: Build the React app ─────────────────────────────────────────────
FROM node:18-alpine AS build

WORKDIR /app

# Copy package files first for better layer caching
COPY ui/package.json ui/package-lock.json ./

# Copy the locally generated daml.js types (referenced as a file dependency)
COPY ui/daml.js/ ./daml.js/

# Install dependencies
RUN npm ci

# Copy the rest of the UI source
COPY ui/public/ ./public/
COPY ui/src/ ./src/
COPY ui/tsconfig.json ./

# Build the production bundle
ENV NODE_OPTIONS=--openssl-legacy-provider
RUN npm run build

# ── Stage 2: Serve with nginx ────────────────────────────────────────────────
FROM nginx:alpine

# Remove default nginx config
RUN rm /etc/nginx/conf.d/default.conf

# Copy our custom nginx config
COPY docker/ui/nginx.conf /etc/nginx/conf.d/default.conf

# Copy the built React app from the build stage
COPY --from=build /app/build /usr/share/nginx/html

EXPOSE 3000

CMD ["nginx", "-g", "daemon off;"]
