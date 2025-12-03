# Use Node.js 20 LTS
FROM node:20-slim

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install ALL dependencies (need esbuild for build)
RUN npm ci

# Copy source code
COPY server ./server
COPY shared ./shared

# Build the server
RUN npx esbuild server/index-cloud.ts --platform=node --bundle --format=cjs --outfile=dist/server.js

# Remove node_modules to reduce size (bundle is self-contained)
RUN rm -rf node_modules && npm ci --only=production

# Expose port
EXPOSE 8080

# Set environment
ENV NODE_ENV=production
ENV PORT=8080

# Start server
CMD ["node", "dist/server.js"]
