# Use Node.js 20 LTS
FROM node:20-slim

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production

# Copy server source
COPY server ./server
COPY shared ./shared

# Install esbuild for build
RUN npm install esbuild

# Build minimal server
RUN npx esbuild server/index-cloud.ts --platform=node --bundle --format=cjs --outfile=dist/server.js

# Expose port
EXPOSE 8080

# Set environment
ENV NODE_ENV=production
ENV PORT=8080

# Start server
CMD ["node", "dist/server.js"]
