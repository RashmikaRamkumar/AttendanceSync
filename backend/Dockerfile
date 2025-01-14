# Use Node.js Alpine as the base image
FROM node:alpine3.18

# Set working directory
WORKDIR /app

# Install dependencies
COPY ./backend/package.json ./
RUN npm install

# Copy application source code
COPY ./backend ./

# Expose the backend port
EXPOSE 5000

# Start the backend server using `node server.js`
CMD [ "node", "server.js" ]
