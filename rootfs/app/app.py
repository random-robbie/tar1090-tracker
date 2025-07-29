#!/usr/bin/env python3

import os
import json
import time
import threading
from datetime import datetime
from flask import Flask, jsonify, request
import requests
import logging

app = Flask(__name__)

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Configuration from environment variables
TAR1090_HOST = os.getenv('TAR1090_HOST', '192.168.1.175')
TAR1090_PORT = int(os.getenv('TAR1090_PORT', '8080'))
UPDATE_INTERVAL = int(os.getenv('UPDATE_INTERVAL', '1'))
SHOW_HISTORY = os.getenv('SHOW_HISTORY', 'true').lower() == 'true'

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
            
        except Exception as e:
            logger.error(f"Error in update thread: {e}")
        
        time.sleep(UPDATE_INTERVAL)

@app.route('/aircraft', methods=['GET'])
def get_aircraft():
    """Get current aircraft data"""
    with data_lock:
        return jsonify(aircraft_data)

@app.route('/aircraft/history', methods=['GET'])
def get_aircraft_history():
    """Get aircraft history data"""
    if not SHOW_HISTORY:
        return jsonify({"error": "History not enabled"}), 400
    
    with data_lock:
        return jsonify({"history": aircraft_history})

@app.route('/config', methods=['GET'])
def get_config():
    """Get addon configuration"""
    return jsonify({
        "tar1090_host": TAR1090_HOST,
        "tar1090_port": TAR1090_PORT,
        "update_interval": UPDATE_INTERVAL,
        "show_history": SHOW_HISTORY,
        "map_center_lat": float(os.getenv('MAP_CENTER_LAT', '40.7128')),
        "map_center_lon": float(os.getenv('MAP_CENTER_LON', '-74.0060')),
        "map_zoom": int(os.getenv('MAP_ZOOM', '8'))
    })

@app.route('/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({
        "status": "healthy",
        "timestamp": datetime.now().isoformat(),
        "aircraft_count": len(aircraft_data.get('aircraft', [])),
        "last_update": aircraft_data.get('now', 0)
    })

@app.route('/stats', methods=['GET'])
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

if __name__ == '__main__':
    logger.info("Starting Tar1090 Aircraft Tracker API")
    logger.info(f"Connecting to tar1090 at {TAR1090_HOST}:{TAR1090_PORT}")
    
    # Start background thread for data updates
    update_thread = threading.Thread(target=update_aircraft_data, daemon=True)
    update_thread.start()
    
    # Start Flask app
    app.run(host='0.0.0.0', port=5000, debug=False)
