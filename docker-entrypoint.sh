#!/bin/sh

# Print the actual environment variable for debugging
echo "ENVIRONMENT VARIABLE FROM KUBERNETES:"
echo "VITE_WMS_API_GATEWAY_URL=${VITE_WMS_API_GATEWAY_URL}"

# Create runtime environment configuration file that directly uses the passed environment variable
cat << EOF > /usr/share/nginx/html/env-config.js
window.ENV = {
  VITE_WMS_API_GATEWAY_URL: "${VITE_WMS_API_GATEWAY_URL}"
};
console.log("env-config.js loaded, VITE_WMS_API_GATEWAY_URL:", "${VITE_WMS_API_GATEWAY_URL}");
EOF

# Ensure env-config.js is loaded before the main application script
# Find the index.html file and add the script tag if it doesn't exist
if [ -f /usr/share/nginx/html/index.html ]; then
  # Check if the script tag already exists
  if ! grep -q "env-config.js" /usr/share/nginx/html/index.html; then
    # Insert the script tag before the first existing script tag
    sed -i 's/<script/<script src="\/env-config.js"><\/script>\n    <script/' /usr/share/nginx/html/index.html
    echo "Added env-config.js script tag to index.html"
  else
    echo "env-config.js script tag already exists in index.html"
  fi
else
  echo "Warning: index.html not found"
fi

# Create a new main nginx.conf with proper ordering
# 1. First load the module
# 2. Then declare environment variables
# 3. Then include the original nginx.conf content (except for the module loading part)
cat << EOF > /tmp/new_nginx.conf
load_module /usr/lib/nginx/modules/ngx_http_js_module.so;
env VITE_WMS_API_GATEWAY_URL;
EOF

# Append the original nginx.conf content (excluding the include modules line)
grep -v "include /etc/nginx/modules.conf" /etc/nginx/nginx.conf >> /tmp/new_nginx.conf

# Replace the original nginx.conf
cp /tmp/new_nginx.conf /etc/nginx/nginx.conf

# Execute the CMD with the environment variable
exec "$@"