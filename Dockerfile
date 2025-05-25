# Build stage
FROM node:20-slim AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install all dependencies (including devDependencies)
RUN npm ci

# Copy source code
COPY . .

# Build TypeScript code
RUN npm run build

# Production stage
FROM node:20-slim

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install only production dependencies
RUN npm ci --only=production

# Copy built files from builder stage
COPY --from=builder /app/dist ./dist

# Create non-root user
RUN useradd -r -u 1001 -g root nodeuser
USER nodeuser

# Expose port
EXPOSE 3004

# Set environment variables
ENV NODE_ENV=production

# Start the application using the compiled JavaScript
CMD ["node", "dist/index.js"]