# Tar1090 Aircraft Tracker - Home Assistant Add-on

[![Open your Home Assistant instance and show the add add-on repository dialog with a specific repository URL pre-filled.](https://my.home-assistant.io/badges/supervisor_add_addon_repository.svg)](https://my.home-assistant.io/redirect/supervisor_add_addon_repository/?repository_url=https%3A%2F%2Fgithub.com%2Frandom-robbie%2Ftar1090-tracker)

A Home Assistant add-on that displays aircraft tracking data from a tar1090 server on an interactive map with full dashboard integration.

## Features

- **Real-time Aircraft Tracking**: Connect to your tar1090 server and display live aircraft positions
- **Interactive Map**: Leaflet-based map with OpenStreetMap and satellite layers
- **Aircraft Details**: Click on aircraft for detailed information including callsign, altitude, speed, and track
- **Flight History**: Optional trail display showing aircraft movement history
- **Home Assistant Integration**: Seamless dashboard integration with ingress support
- **Responsive UI**: Dark theme interface optimized for Home Assistant
- **Configurable**: Customizable update intervals, map center, and display options

## Installation Methods

### Method 1: Home Assistant Add-on (Recommended)

1. Add this repository to your Home Assistant:
   [![Add Repository](https://my.home-assistant.io/badges/supervisor_add_addon_repository.svg)](https://my.home-assistant.io/redirect/supervisor_add_addon_repository/?repository_url=https%3A%2F%2Fgithub.com%2Frandom-robbie%2Ftar1090-tracker)

2. Install the "Tar1090 Aircraft Tracker" add-on
3. Configure the add-on with your tar1090 server details
4. Start the add-on
5. The add-on will appear in your sidebar with an airplane icon

### Method 2: Standalone Installation

If the add-on method has issues, you can run it standalone:

1. SSH into your Home Assistant system
2. Install dependencies:
   ```bash
   apk add --no-cache py3-flask py3-requests
   ```
3. Download and run:
   ```bash
   wget https://raw.githubusercontent.com/random-robbie/tar1090-tracker/main/simple-start.sh
   chmod +x simple-start.sh
   TAR1090_HOST=192.168.1.175 ./simple-start.sh
   ```
4. Access at `http://your-ha-ip:8099`

## Adding to Home Assistant Dashboard

Once running (either method), integrate into your HA dashboard:

### Option 1: Webpage Card
1. **Edit your dashboard**
2. **Add Card → Webpage Card**
3. **Settings:**
   - **URL:** `http://your-ha-ip:8099` (for standalone) or use the add-on's ingress URL
   - **Title:** `Aircraft Tracker`
   - **Aspect Ratio:** `16:9` (recommended)

### Option 2: Panel Dashboard
1. **Settings → Dashboards → Add Dashboard**
2. **Create new dashboard:**
   - **Type:** Panel (iframe)
   - **URL:** `http://your-ha-ip:8099`
   - **Title:** `Aircraft Tracker`
   - **Icon:** `mdi:airplane`
3. This creates a dedicated full-screen aircraft tracking tab

### Option 3: Map Integration
For basic aircraft positions on HA's built-in map:
1. Create `device_tracker` entities using the REST API
2. Add to `configuration.yaml`:
   ```yaml
   device_tracker:
     - platform: rest
       resource: http://your-ha-ip:8099/api/aircraft
       name: aircraft_tracker
       json_attributes_path: "$.aircraft[*]"
       json_attributes:
         - hex
         - flight  
         - lat
         - lon
         - alt_baro
   ```

## Configuration

```yaml
tar1090_host: "192.168.1.175"  # IP address of your tar1090 server
tar1090_port: 8080             # Port of your tar1090 server (usually 8080)
update_interval: 1             # Data update interval in seconds (1-60)
show_history: true             # Show aircraft movement trails
map_center_lat: 40.7128        # Map center latitude (your location)
map_center_lon: -74.0060       # Map center longitude (your location)
map_zoom: 8                    # Initial map zoom level (1-18)
```

## API Endpoints

The tracker provides several REST API endpoints:

- `/api/aircraft` - Current aircraft data
- `/api/history` - Historical aircraft positions (if enabled)
- `/api/config` - Current configuration
- `/api/health` - Service health status
- `/api/stats` - Aircraft statistics

## Requirements

- A running tar1090 server (part of ADS-B aircraft tracking setup)
- Network access from Home Assistant to the tar1090 server
- For add-on: Home Assistant OS or Supervised installation
- For standalone: Python 3 with Flask and Requests libraries

## Troubleshooting

### Add-on Not Appearing
- Check Home Assistant logs for validation errors
- Ensure repository URL is correct
- Try the standalone installation method

### No Aircraft Data
- Verify tar1090 server is running and accessible
- Check network connectivity between HA and tar1090 server
- Confirm tar1090_host and tar1090_port settings

### Dashboard Integration Issues
- For ingress mode, use the add-on's internal URL
- For standalone, use `http://your-ha-ip:8099`
- Ensure HTTPS/HTTP protocol matches your HA setup

## Support

For issues and feature requests, please use the [GitHub Issues](https://github.com/random-robbie/tar1090-tracker/issues) page.