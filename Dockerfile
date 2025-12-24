FROM node:20-slim

WORKDIR /app

# Copy root package files
COPY package.json ./

# Copy workspace package files
COPY client/package.json ./client/
COPY server/package.json ./server/

# Install dependencies (ensure devDependencies are installed for build)
ENV NODE_ENV=development
RUN npm install

# Copy source code
COPY . .

# Build client
RUN npm run build

# Set to production for runtime
ENV NODE_ENV=production

# Expose port (default for Express)
EXPOSE 5000

# Start server
CMD ["npm", "start"]
