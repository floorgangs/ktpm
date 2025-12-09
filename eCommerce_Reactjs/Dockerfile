FROM node:18-alpine

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install --legacy-peer-deps

# Copy source code
COPY . .

# Build for production
RUN npm run build

# Install serve to run static files
RUN npm install -g serve

# Expose port
EXPOSE 3000

# Start static server
CMD ["sh", "-c", "serve -s build -p ${PORT:-3000}"]
