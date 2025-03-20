#!/bin/sh

# Create runtime environment configuration to allow overriding the API URL
# This will be loaded by the app at runtime

cat << EOF > /usr/share/nginx/html/env-config.js
window.ENV = {
  VITE_API_GATEWAY_URL: "${VITE_API_GATEWAY_URL:-http://api-gateway-service}"
};
EOF

# Execute the CMD
exec "$@" 