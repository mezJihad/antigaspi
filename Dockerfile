FROM node:20

WORKDIR /app

# Copy root package files
COPY package.json ./

# Copy workspace package files
COPY client/package.json ./client/
COPY server/package.json ./server/

# Install dependencies (ensure devDependencies are installed for build)
ENV NODE_ENV=development

# DEBUG: Check OS
RUN cat /etc/os-release

# FORCE CLEAN: Remove any lockfiles that might have snuck in
RUN rm -f package-lock.json client/package-lock.json server/package-lock.json

# Workaround for npm workspace optional dependency bug
RUN npm install @rollup/rollup-linux-x64-gnu --save-optional
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
