#!/usr/bin/env python3

import os
import json
import time
import threading
from datetime import datetime
from flask import Flask, jsonify, request, send_from_directory
import requests
import logging

# Create Flask app with support for Home Assistant ingress
app = Flask(__name__, static_folder='/var/www/tar1090', static_url_path='')

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Configuration from environment variables with JSON fallback
def get_config_value(key, default, value_type=str):
    """Get configuration value from env vars or options.json"""
    # First try environment variable
    value = os.getenv(key.upper(), None)
    
    # If env var is null/empty, try reading from options.json
    if value is None or value == 'null' or value == '':
        try:
            with open('/data/options.json', 'r') as f:
                config = json.load(f)
                value = config.get(key.lower(), default)
                logger.info(f"Read {key} from options.json: {value}")
        except:
            logger.warning(f"Could not read options.json, using default for {key}")
            value = default
    else:
        logger.info(f"Read {key} from environment: {value}")
    
    # Convert to proper type
    if value_type == int:
        return int(value)
    elif value_type == float:
        return float(value)
    elif value_type == bool:
        return str(value).lower() in ('true', '1', 'yes', 'on')
    else:
        return str(value)

TAR1090_HOST = get_config_value('TAR1090_HOST', '192.168.1.100')
TAR1090_PORT = get_config_value('TAR1090_PORT', 8080, int)
UPDATE_INTERVAL = get_config_value('UPDATE_INTERVAL', 1, int)
SHOW_HISTORY = get_config_value('SHOW_HISTORY', True, bool)
AUTO_CENTER = get_config_value('AUTO_CENTER', False, bool)

# Global variables to store aircraft data
aircraft_data = {"aircraft": [], "now": 0, "messages": 0}
aircraft_history = []
data_lock = threading.Lock()

def fetch_aircraft_data():
    """Fetch aircraft data from tar1090"""
    try:
        url = f"http://{TAR1090_HOST}:{TAR1090_PORT}/data/aircraft.json"
        response = requests.get(url, timeout=5)
        response.raise_for_status()
        return response.json()
    except requests.exceptions.RequestException as e:
        logger.error(f"Error fetching aircraft data: {e}")
        return None

def update_aircraft_data():
    """Background thread to continuously update aircraft data"""
    global aircraft_data, aircraft_history
    
    # Initialize with empty data to prevent 502 errors
    with data_lock:
        aircraft_data = {"aircraft": [], "now": 0, "messages": 0}
    
    while True:
        try:
            new_data = fetch_aircraft_data()
            if new_data:
                with data_lock:
                    aircraft_data = new_data
                    # Add timestamp for history tracking
                    new_data['timestamp'] = datetime.now().isoformat()
                    
                    if SHOW_HISTORY:
                        aircraft_history.append(new_data)
                        # Keep only last 100 records to prevent memory issues
                        if len(aircraft_history) > 100:
                            aircraft_history.pop(0)
                
                logger.info(f"Updated aircraft data: {len(new_data.get('aircraft', []))} aircraft")
            else:
                logger.warning("No data received from tar1090 server")
            
        except Exception as e:
            logger.error(f"Error in update thread: {e}")
        
        time.sleep(UPDATE_INTERVAL)

# API routes - both with and without /api/ prefix for compatibility
@app.route('/aircraft', methods=['GET'])
@app.route('/api/aircraft', methods=['GET'])
def get_aircraft():
    """Get current aircraft data"""
    with data_lock:
        return jsonify(aircraft_data)

@app.route('/aircraft/history', methods=['GET'])
@app.route('/api/aircraft/history', methods=['GET'])
def get_aircraft_history():
    """Get aircraft history data"""
    if not SHOW_HISTORY:
        return jsonify({"error": "History not enabled"}), 400
    
    with data_lock:
        return jsonify({"history": aircraft_history})

@app.route('/config', methods=['GET'])
@app.route('/api/config', methods=['GET'])
def get_config():
    """Get addon configuration"""
    return jsonify({
        "tar1090_host": TAR1090_HOST,
        "tar1090_port": TAR1090_PORT,
        "update_interval": UPDATE_INTERVAL,
        "show_history": SHOW_HISTORY,
        "auto_center": AUTO_CENTER,
        "map_center_lat": get_config_value('MAP_CENTER_LAT', 54.7023, float),
        "map_center_lon": get_config_value('MAP_CENTER_LON', -3.2765, float),
        "map_zoom": get_config_value('MAP_ZOOM', 8, int)
    })

@app.route('/health', methods=['GET'])
@app.route('/api/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({
        "status": "healthy",
        "timestamp": datetime.now().isoformat(),
        "aircraft_count": len(aircraft_data.get('aircraft', [])),
        "last_update": aircraft_data.get('now', 0)
    })

@app.route('/stats', methods=['GET'])
@app.route('/api/stats', methods=['GET'])
def get_stats():
    """Get statistics about the service"""
    with data_lock:
        current_aircraft = aircraft_data.get('aircraft', [])
        
        # Calculate some basic stats
        aircraft_with_position = [a for a in current_aircraft if 'lat' in a and 'lon' in a]
        aircraft_with_callsign = [a for a in current_aircraft if 'flight' in a and a['flight'].strip()]
        
        stats = {
            "total_aircraft": len(current_aircraft),
            "aircraft_with_position": len(aircraft_with_position),
            "aircraft_with_callsign": len(aircraft_with_callsign),
            "last_update": aircraft_data.get('now', 0),
            "messages_total": aircraft_data.get('messages', 0),
            "history_records": len(aircraft_history) if SHOW_HISTORY else 0
        }
        
        return jsonify(stats)

@app.route('/')
def index():
    """Serve the main page"""
    return send_from_directory(app.static_folder, 'index.html')

@app.route('/ping')
def ping():
    """Simple ping endpoint for ingress health check"""
    return "pong"

@app.route('/<path:filename>')
def static_files(filename):
    """Serve static files"""
    return send_from_directory(app.static_folder, filename)

if __name__ == '__main__':
    logger.info("Starting Tar1090 Aircraft Tracker API")
    logger.info(f"Connecting to tar1090 at {TAR1090_HOST}:{TAR1090_PORT}")
    
    # Test tar1090 connection first
    try:
        test_data = fetch_aircraft_data()
        if test_data:
            logger.info(f"Successfully connected to tar1090 - found {len(test_data.get('aircraft', []))} aircraft")
        else:
            logger.warning("Could not fetch data from tar1090 server - check connection")
    except Exception as e:
        logger.error(f"Failed to connect to tar1090 server: {e}")
    
    # Start background thread for data updates
    update_thread = threading.Thread(target=update_aircraft_data, daemon=True)
    update_thread.start()
    
    # Start Flask app
    logger.info("Starting Flask server on 0.0.0.0:5000")
    app.run(host='0.0.0.0', port=5000, debug=False, threaded=True)
