# Use lightweight Node.js image
FROM node:20-alpine

# Set working directory
WORKDIR /app

# Copy package files first
COPY package*.json ./

# Install production dependencies
RUN npm install --omit=dev

# Copy application source
COPY . .

# Create uploads directory
RUN mkdir -p uploads

# Expose backend port
EXPOSE 8070

# Start backend server
CMD ["npm", "start"]