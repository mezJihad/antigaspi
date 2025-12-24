FROM node:20-alpine

WORKDIR /app

# Copy root package files
COPY package.json package-lock.json ./

# Copy workspace package files
COPY client/package.json ./client/
COPY server/package.json ./server/

# Install dependencies (from root to handle hoisting and workspaces)
RUN npm install

# Copy source code
COPY . .

# Build client
RUN npm run build

# Expose port (default for Express)
EXPOSE 5000

# Start server
CMD ["npm", "start"]
