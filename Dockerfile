# Use Node.js 20 LTS
FROM node:20-slim

WORKDIR /app

# Only need express
RUN npm init -y && npm install express

# Copy the server file
COPY server/server-cloud.js ./server.js

# Expose port
EXPOSE 8080

ENV NODE_ENV=production
ENV PORT=8080

# Start server
CMD ["node", "server.js"]
