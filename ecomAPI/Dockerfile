FROM node:22-alpine

# Install MySQL client for data import
RUN apk add --no-cache mysql-client

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install --legacy-peer-deps

# Copy source code
COPY . .

# Expose port
EXPOSE 8080

# Wait for database and start application
CMD ["sh", "-c", "sleep 10 && npm start"]
