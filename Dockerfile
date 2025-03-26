# Stage 1: Build the React application
FROM node:20-alpine AS build

# Set working directory
WORKDIR /app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy all files
COPY . .

# Set the API URL from build arg (defaults to browser-accessible URL for local development)
ARG API_URL=http://localhost:30080
ENV VITE_WMS_API_GATEWAY_URL=${API_URL}

# Build the app
RUN npm run build

# Stage 2: Serve the app with Nginx
FROM nginx:stable-alpine

# Install gettext for envsubst
RUN apk add --no-cache gettext

# Copy the nginx configuration for the React app
COPY --from=build /app/dist /usr/share/nginx/html

# Copy custom nginx config for SPA routing
RUN rm /etc/nginx/conf.d/default.conf
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Add Nginx module for environment variables
RUN echo "load_module /usr/lib/nginx/modules/ngx_http_js_module.so;" > /etc/nginx/modules.conf
RUN echo "include /etc/nginx/modules.conf;" >> /etc/nginx/nginx.conf

# Expose port 80
EXPOSE 80

# Generate env-config.js at container startup to allow runtime configuration
COPY docker-entrypoint.sh /
RUN chmod +x /docker-entrypoint.sh
ENTRYPOINT ["/docker-entrypoint.sh"]

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 CMD wget -qO- http://localhost/ || exit 1

# Start Nginx
CMD ["nginx", "-g", "daemon off;"] 