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
3. **Configure the add-on** by clicking on the "Configuration" tab:
   - **Tar1090 Host**: Enter your tar1090 server IP (e.g., `192.168.1.100`)
   - **Tar1090 Port**: Usually `8080` (default)
   - **Update Interval**: How often to fetch data in seconds (1-60)
   - **Show History**: Enable/disable flight trails
   - **Map Center**: Set your location coordinates for map centering
   - **Map Zoom**: Initial zoom level (1=world view, 18=street level)
   - **Auto Center**: Automatically center map on aircraft
4. Click **Save** and then **Start** the add-on
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

### Option 3: Map Card Integration (Recommended for Dashboard)

The best way to integrate aircraft tracking into your Home Assistant dashboard is using the **Webpage Card** method (Option 1). However, if you want aircraft data as Home Assistant entities:

#### Native Home Assistant Map Integration

To show aircraft on Home Assistant's built-in map card, add this to your `configuration.yaml`:

```yaml
# Aircraft data sensor
sensor:
  - platform: rest
    resource: http://192.168.1.212:8099/api/aircraft
    name: aircraft_data
    json_attributes:
      - aircraft
    value_template: "{{ value_json.aircraft | length }}"
    unit_of_measurement: "aircraft"
    scan_interval: 2

# Template device trackers for each aircraft
template:
  - sensor:
      - name: "Aircraft Count"
        state: "{{ state_attr('sensor.aircraft_data', 'aircraft') | length if state_attr('sensor.aircraft_data', 'aircraft') else 0 }}"
        unit_of_measurement: "aircraft"

# Device trackers for up to 10 aircraft
device_tracker:
  - platform: template
    trackers:
      aircraft_1:
        friendly_name: "Aircraft 1"
        latitude_template: >
          {% set aircraft = state_attr('sensor.aircraft_data', 'aircraft') %}
          {% if aircraft and aircraft|length >= 1 and aircraft[0].lat %}
            {{ aircraft[0].lat }}
          {% endif %}
        longitude_template: >
          {% set aircraft = state_attr('sensor.aircraft_data', 'aircraft') %}
          {% if aircraft and aircraft|length >= 1 and aircraft[0].lon %}
            {{ aircraft[0].lon }}
          {% endif %}
        attributes_template: >
          {% set aircraft = state_attr('sensor.aircraft_data', 'aircraft') %}
          {% if aircraft and aircraft|length >= 1 %}
            {
              "callsign": "{{ aircraft[0].flight | default('Unknown') }}",
              "altitude": "{{ aircraft[0].alt_baro | default('N/A') }} ft",
              "speed": "{{ aircraft[0].gs | default('N/A') }} kts",
              "hex": "{{ aircraft[0].hex }}"
            }
          {% endif %}
          
      aircraft_2:
        friendly_name: "Aircraft 2"
        latitude_template: >
          {% set aircraft = state_attr('sensor.aircraft_data', 'aircraft') %}
          {% if aircraft and aircraft|length >= 2 and aircraft[1].lat %}
            {{ aircraft[1].lat }}
          {% endif %}
        longitude_template: >
          {% set aircraft = state_attr('sensor.aircraft_data', 'aircraft') %}
          {% if aircraft and aircraft|length >= 2 and aircraft[1].lon %}
            {{ aircraft[1].lon }}
          {% endif %}
        attributes_template: >
          {% set aircraft = state_attr('sensor.aircraft_data', 'aircraft') %}
          {% if aircraft and aircraft|length >= 2 %}
            {
              "callsign": "{{ aircraft[1].flight | default('Unknown') }}",
              "altitude": "{{ aircraft[1].alt_baro | default('N/A') }} ft", 
              "speed": "{{ aircraft[1].gs | default('N/A') }} kts",
              "hex": "{{ aircraft[1].hex }}"
            }
          {% endif %}
          
      aircraft_3:
        friendly_name: "Aircraft 3"
        latitude_template: >
          {% set aircraft = state_attr('sensor.aircraft_data', 'aircraft') %}
          {% if aircraft and aircraft|length >= 3 and aircraft[2].lat %}
            {{ aircraft[2].lat }}
          {% endif %}
        longitude_template: >
          {% set aircraft = state_attr('sensor.aircraft_data', 'aircraft') %}
          {% if aircraft and aircraft|length >= 3 and aircraft[2].lon %}
            {{ aircraft[2].lon }}
          {% endif %}
          
      # Add aircraft_4 through aircraft_10 following the same pattern...
```

**Then add this map card to your dashboard:**

```yaml
type: map
entities:
  - device_tracker.aircraft_1
  - device_tracker.aircraft_2
  - device_tracker.aircraft_3
  - device_tracker.aircraft_4
  - device_tracker.aircraft_5
  - device_tracker.aircraft_6
  - device_tracker.aircraft_7
  - device_tracker.aircraft_8
  - device_tracker.aircraft_9
  - device_tracker.aircraft_10
auto_fit: true
default_zoom: 8
title: Live Aircraft Map
theme_mode: auto
```

**Note:** This method shows aircraft as points on the map but has limitations:
- No flight trails or detailed aircraft information
- Less interactive than the full web interface
- Updates limited to Home Assistant's sensor scan intervals

#### Using the Map Card
For the best aircraft tracking experience in your dashboard:

1. **Add a Webpage Card** (Option 1 above) - This shows the full interactive map
2. **Set card height** to `400px` or more for better visibility
3. **Position it prominently** on your main dashboard

#### Alternative: Browser Mod Integration
If you have [Browser Mod](https://github.com/thomasloven/hass-browser_mod) installed:

```yaml
# In a button card or automation
service: browser_mod.popup
data:
  title: "Aircraft Tracker"
  content:
    type: iframe
    url: "http://192.168.1.212:8099"
    aspect_ratio: "16:9"
```

**Why Webpage Card is Recommended:**
- ✅ Full interactive map with aircraft details
- ✅ Real-time updates and flight trails  
- ✅ Aircraft information on click
- ✅ No complex configuration needed
- ✅ Works immediately after tracker installation

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

## Changelog

See [CHANGELOG.md](CHANGELOG.md) for a detailed history of changes, new features, and bug fixes in each release.

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Release Process

For maintainers, use the release script:
```bash
./scripts/release.sh 1.0.4 "Added new feature description"
```

This will:
- Update version in config.yaml
- Add changelog entry  
- Create git tag
- Push to GitHub
- Trigger automated release

## Support

- **Issues & Bug Reports**: [GitHub Issues](https://github.com/random-robbie/tar1090-tracker/issues)
- **Feature Requests**: [GitHub Issues](https://github.com/random-robbie/tar1090-tracker/issues)
- **Discussions**: [GitHub Discussions](https://github.com/random-robbie/tar1090-tracker/discussions)
- **Changelog**: [CHANGELOG.md](CHANGELOG.md)