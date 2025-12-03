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

# Build the backend for cloud deployment
RUN npx esbuild server/index-cloud.ts --platform=node --packages=external --bundle --format=esm --outdir=dist

# Remove devDependencies after build
RUN npm prune --production

# Expose port (Cloud Run uses PORT env variable)
EXPOSE 8080

# Set environment to production
ENV NODE_ENV=production
ENV PORT=8080

# Start the server
CMD ["node", "dist/index-cloud.js"]
