#!/usr/bin/env bashio

CONFIG_PATH=/data/options.json

# Read configuration
TAR1090_HOST=$(bashio::config 'tar1090_host')
TAR1090_PORT=$(bashio::config 'tar1090_port')
UPDATE_INTERVAL=$(bashio::config 'update_interval')
SHOW_HISTORY=$(bashio::config 'show_history')
MAP_CENTER_LAT=$(bashio::config 'map_center_lat')
MAP_CENTER_LON=$(bashio::config 'map_center_lon')
MAP_ZOOM=$(bashio::config 'map_zoom')

bashio::log.info "Starting Tar1090 Aircraft Tracker..."
bashio::log.info "Tar1090 Host: ${TAR1090_HOST}:${TAR1090_PORT}"
bashio::log.info "Update Interval: ${UPDATE_INTERVAL} seconds"

# Create nginx configuration
cat > /etc/nginx/http.d/default.conf << EOF
server {
    listen 8099;
    server_name _;
    root /var/www/tar1090;
    index index.html;

    location / {
        try_files \$uri \$uri/ =404;
    }

    location /api/ {
        proxy_pass http://127.0.0.1:5000/;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
    }
}
EOF

# Start nginx
nginx -g "daemon off;" &

# Export environment variables for Python app
export TAR1090_HOST
export TAR1090_PORT
export UPDATE_INTERVAL
export SHOW_HISTORY
export MAP_CENTER_LAT
export MAP_CENTER_LON
export MAP_ZOOM

# Start the Python Flask app
cd /app
python3 app.py &

# Wait for any process to exit
wait -n

# Exit with status of process that exited first
exit $?
