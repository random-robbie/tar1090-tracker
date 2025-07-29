#!/bin/bash

# Configuration
TAR1090_HOST=${TAR1090_HOST:-"192.168.1.175"}
TAR1090_PORT=${TAR1090_PORT:-"8080"}
MAP_CENTER_LAT=${MAP_CENTER_LAT:-"40.7128"}
MAP_CENTER_LON=${MAP_CENTER_LON:-"-74.0060"}
WEB_PORT=${WEB_PORT:-"8099"}

echo "Starting Tar1090 Aircraft Tracker..."
echo "Connecting to tar1090 at ${TAR1090_HOST}:${TAR1090_PORT}"
echo "Web interface will be at http://$(hostname -I | awk '{print $1}'):${WEB_PORT}"

# Export environment variables
export TAR1090_HOST
export TAR1090_PORT 
export UPDATE_INTERVAL=1
export SHOW_HISTORY=true
export MAP_CENTER_LAT
export MAP_CENTER_LON
export MAP_ZOOM=8

# Start Python Flask app
cd /private/tmp/tar1090/tar1090/rootfs/app
python3 app.py