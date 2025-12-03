# Use Node.js 20 LTS
FROM node:20-slim

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install all dependencies (including tsx for running TypeScript)
RUN npm ci

# Copy all source code
COPY . .

# Expose port
EXPOSE 8080

ENV NODE_ENV=production
ENV PORT=8080

# Use tsx to run TypeScript directly
CMD ["npx", "tsx", "server/cloud-entry.ts"]
