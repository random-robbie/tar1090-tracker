# Tar1090 Aircraft Tracker - Home Assistant Add-on

[![Open your Home Assistant instance and show the add add-on repository dialog with a specific repository URL pre-filled.](https://my.home-assistant.io/badges/supervisor_add_addon_repository.svg)](https://my.home-assistant.io/redirect/supervisor_add_addon_repository/?repository_url=https%3A%2F%2Fgithub.com%2Frandom-robbie%2Ftar1090-tracker)

A Home Assistant add-on that displays aircraft tracking data from a tar1090 server on an interactive map.

## Features

- **Real-time Aircraft Tracking**: Connect to your tar1090 server and display live aircraft positions
- **Interactive Map**: Leaflet-based map with OpenStreetMap and satellite layers
- **Aircraft Details**: Click on aircraft for detailed information including callsign, altitude, speed, and track
- **Flight History**: Optional trail display showing aircraft movement history
- **Responsive UI**: Dark theme interface optimized for Home Assistant
- **Configurable**: Customizable update intervals, map center, and display options

## Installation

1. Add this repository to your Home Assistant:
   [![Add Repository](https://my.home-assistant.io/badges/supervisor_add_addon_repository.svg)](https://my.home-assistant.io/redirect/supervisor_add_addon_repository/?repository_url=https%3A%2F%2Fgithub.com%2Frandom-robbie%2Ftar1090-tracker)

2. Install the "Tar1090 Aircraft Tracker" add-on
3. Configure the add-on with your tar1090 server details
4. Start the add-on
5. Access the interface at `http://your-ha-ip:8099`

## Configuration

```yaml
tar1090_host: "192.168.1.175"  # IP address of your tar1090 server
tar1090_port: 8080             # Port of your tar1090 server (usually 8080)
update_interval: 1             # Data update interval in seconds (1-60)
show_history: true             # Show aircraft movement trails
map_center_lat: 40.7128        # Map center latitude
map_center_lon: -74.0060       # Map center longitude  
map_zoom: 8                    # Initial map zoom level (1-18)
```

## Requirements

- A running tar1090 server (part of ADS-B aircraft tracking setup)
- Network access from Home Assistant to the tar1090 server

## Support

For issues and feature requests, please use the [GitHub Issues](https://github.com/random-robbie/tar1090-tracker/issues) page.