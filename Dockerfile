# Use Node.js 20 LTS
FROM node:20-slim

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install all dependencies
RUN npm ci

# Copy all source code
COPY . .

# Build routes with esbuild
RUN npx esbuild server/routes.ts \
  --platform=node \
  --bundle \
  --format=cjs \
  --outfile=server/dist/routes.js \
  --external:@neondatabase/serverless \
  --external:ws \
  --external:bufferutil \
  --external:utf-8-validate \
  --external:better-sqlite3 \
  --external:pg-native

# Keep production dependencies
RUN npm prune --production

# Expose port
EXPOSE 8080

ENV NODE_ENV=production
ENV PORT=8080

# Start server
CMD ["node", "server/server-cloud.js"]
