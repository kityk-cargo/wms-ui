#!/bin/sh

# Create runtime environment configuration to allow overriding the API URL
# This will be loaded by the app at runtime

cat << EOF > /usr/share/nginx/html/env-config.js
window.ENV = {
  VITE_WMS_API_GATEWAY_URL: "${VITE_WMS_API_GATEWAY_URL:-http://api-gateway-service}"
};
EOF

# Pass the API URL to Nginx for the proxy configuration
# Create a .conf file that exports the environment variable
cat << EOF > /etc/nginx/conf.d/environment.conf
env VITE_WMS_API_GATEWAY_URL;
EOF

# Execute the CMD with the environment variable
export VITE_WMS_API_GATEWAY_URL="${VITE_WMS_API_GATEWAY_URL:-http://api-gateway-service}"
exec "$@" 