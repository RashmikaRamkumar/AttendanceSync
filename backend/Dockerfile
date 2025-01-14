# Use Node.js Alpine as the base image
FROM node:alpine3.18

# Set working directory
WORKDIR /app

# Install dependencies
COPY package.json ./
RUN npm install

# Copy application source code
COPY . .

# Expose the backend port
EXPOSE 4000

# Start the backend server using `node server.js`
CMD [ "node", "server.js" ]
