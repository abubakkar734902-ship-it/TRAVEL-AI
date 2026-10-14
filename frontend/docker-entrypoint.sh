#!/bin/sh

# Docker entrypoint for frontend
# Allows passing environment variables at runtime

set -e

# Substitute environment variables in index.html if needed
# This allows configuration without rebuilding the Docker image
if [ -n "$API_URL" ]; then
    sed -i "s|__API_URL__|$API_URL|g" /usr/share/nginx/html/index.html
fi

if [ -n "$SOCKET_URL" ]; then
    sed -i "s|__SOCKET_URL__|$SOCKET_URL|g" /usr/share/nginx/html/index.html
fi

# Execute the main command
exec "$@"
