# Stage 1: Build the React application
FROM node:alpine3.18 as build

# Declare build-time environment variables
ARG VITE_BACKEND_URL

# Set the backend URL as an environment variable
ENV VITE_BACKEND_URL=$VITE_BACKEND_URL

# Set working directory
WORKDIR /app

# Install dependencies
COPY ./frontend/package.json ./
RUN npm install

# Copy application source code and build the app
COPY ./frontend ./
RUN npm run build

# Stage 2: Serve the React application with Nginx
FROM nginx:1.23-alpine

# Set working directory for Nginx
WORKDIR /usr/share/nginx/html

# Clean the default Nginx directory
RUN rm -rf *

# Copy build output from the previous stage
COPY --from=build /app/dist . 

# Expose port 80
EXPOSE 80

# Start Nginx server
ENTRYPOINT [ "nginx", "-g", "daemon off;" ]
