# --- Stage 1: Build ---------------
# Use the official Node.js 20 Alpine image (Alpine = tiny Linux, ~50MB vs ~900MB)
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package files first (Docker caches this layer — only re-runs npm install
# if package.json actually changes, making rebuilds much faster)
COPY package*.json ./

# Install only production dependencies
RUN npm ci --omit=dev

# --- Stage 2: Runtime -------------------------
FROM node:20-alpine

WORKDIR /app

# Copy installed node_modules from builder stage
COPY --from=builder /app/node_modules ./node_modules

# Copy application source code
COPY src/ ./src/
COPY package.json ./

# Create a non-root user to run the app (security best practice)
# Never run Node apps as root inside containers
RUN addgroup -S levelup && adduser -S levelup -G levelup
USER levelup

# Tell Docker this container listens on port 8000
EXPOSE 8000

# Health check - Docker will restart the container if this fails
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
  CMD wget -qO- http://localhost:8000/ || exit 1

# Start the app
CMD ["node", "src/server.js"]
