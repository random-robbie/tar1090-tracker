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
AUTO_CENTER=$(bashio::config 'auto_center')

bashio::log.info "Starting Tar1090 Aircraft Tracker with Ingress..."
bashio::log.info "Tar1090 Host: ${TAR1090_HOST}:${TAR1090_PORT}"
bashio::log.info "Update Interval: ${UPDATE_INTERVAL} seconds"

# Export environment variables for Python app
export TAR1090_HOST
export TAR1090_PORT
export UPDATE_INTERVAL
export SHOW_HISTORY
export MAP_CENTER_LAT
export MAP_CENTER_LON
export MAP_ZOOM
export AUTO_CENTER

# Start the Python Flask app with ingress support
cd /app
python3 app.py
