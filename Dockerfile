# Use Node.js 20 LTS
FROM node:20-slim

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install ALL dependencies (need devDeps for build)
RUN npm ci

# Copy source code
COPY . .

# Build the backend - bundle everything including node_modules
RUN npx esbuild server/index-cloud.ts --platform=node --bundle --format=cjs --outfile=dist/server.js --external:@neondatabase/serverless --external:ws --external:bufferutil --external:utf-8-validate

# Expose port (Cloud Run uses PORT env variable)
EXPOSE 8080

# Set environment to production
ENV NODE_ENV=production
ENV PORT=8080

# Start the server
CMD ["node", "dist/server.js"]
