# Changelog

All notable changes to the Tar1090 Aircraft Tracker will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [1.0.10] - 2025-07-30

### Fixed
- Fixed API routing issues in Home Assistant ingress mode
- Resolved all 404 errors for aircraft, stats, and config endpoints
- Simplified JavaScript API URL patterns for better ingress compatibility

### Technical
- Added dual route decorators to Flask app (with and without /api/ prefix)
- Optimized fetchAPI() function to use simple relative paths first
- Enhanced URL fallback strategy for different deployment scenarios

## [1.0.9] - 2025-07-30

### Fixed
- Fixed missing changelog issue in Home Assistant addon interface
- Added CHANGELOG.md file to addon directory for HA compatibility

### Technical
- Copied changelog to /tar1090/CHANGELOG.md for proper HA addon store integration
- Ensured changelog is accessible through HA addon interface

## [1.0.3] - 2025-07-29

### Added
- Comprehensive Home Assistant configuration interface
- New `auto_center` option to automatically center map on aircraft
- User-configurable tar1090 server IP and port through HA UI
- Input validation and default values for all configuration options
- Step-by-step configuration guide in README

### Changed
- Enhanced config.yaml with proper schema validation
- Updated Python app to read all configuration variables from HA
- Default tar1090_host changed from hardcoded IP to user-configurable
- Improved README with detailed configuration instructions

### Technical
- Modified run.sh to pass all configuration variables to Python app
- Added AUTO_CENTER environment variable support
- Enhanced configuration API endpoint with new options

## [1.0.2] - 2025-07-29

### Added
- Enhanced aircraft icons with proper airplane shapes instead of circles
- Aircraft icons now rotate based on flight heading/track direction
- Dynamic icon sizing based on aircraft type (A380/B747 larger, regional smaller)
- Altitude-based color coding (red=low, orange=medium, blue=high, green=very high)
- Hideable aircraft list panel with toggle button
- Hover effects with scaling and drop shadows on aircraft icons
- Red center dot on aircraft icons for better visibility

### Changed
- Replaced simple circular markers with detailed aircraft SVG icons
- Improved aircraft marker CSS with proper transparency and effects

### Technical
- Added `getAircraftIconSize()` function for dynamic sizing
- Enhanced `aircraft-marker` CSS classes with animation support
- Added toggle functionality for aircraft list visibility

## [1.0.1] - 2025-07-29

### Added
- Home Assistant ingress support for seamless dashboard integration
- Aircraft tracker now appears directly in HA sidebar with airplane icon
- Panel icon configuration for better HA integration

### Changed
- Simplified Flask app to serve static files directly for ingress mode
- Removed nginx dependency when running in ingress mode
- Updated configuration for better HA compatibility

### Technical
- Modified config.yaml to enable ingress mode
- Updated Flask app routes to serve static content
- Fixed config validation issues with float schema

## [1.0.0] - 2025-07-29

### Added
- Initial release of Tar1090 Aircraft Tracker
- Real-time aircraft tracking from tar1090 servers
- Interactive Leaflet-based map with OpenStreetMap and satellite layers
- Aircraft position display with clickable details (callsign, altitude, speed, track)
- Optional flight history trails showing aircraft movement
- Dark theme interface optimized for Home Assistant
- REST API with multiple endpoints (/aircraft, /health, /stats, /config, /history)
- Home Assistant add-on structure with proper Docker configuration
- Standalone installation option for systems without add-on support
- Multi-architecture support (aarch64, amd64, armhf, armv7, i386)

### Features
- Configurable update intervals (1-60 seconds)
- Customizable map center coordinates and zoom levels
- Aircraft statistics and health monitoring
- Connection status indicator
- Responsive web interface
- Multiple dashboard integration methods (Webpage Card, Panel, Map integration)

### Technical
- Python Flask backend for API and data processing
- Nginx reverse proxy for web serving
- Background threading for continuous data updates
- Docker containerization with Home Assistant base images
- bashio integration for Home Assistant configuration management

## [Initial Development] - 2025-07-29

### Development Milestones
- Created interactive web interface with Leaflet maps
- Implemented aircraft data fetching from tar1090 API
- Added CSS styling with dark theme
- Developed JavaScript for real-time map updates
- Built Docker containerization
- Created Home Assistant add-on structure
- Implemented repository structure for HA add-on store

---

## Release Notes

### Upgrade Instructions
- For Home Assistant add-on users: Update through the add-on store
- For standalone users: Download the latest release and restart the service

### Breaking Changes
- None in current releases

### Security Updates
- All releases include security best practices
- No known vulnerabilities in current versions

### Support
- Report issues: [GitHub Issues](https://github.com/random-robbie/tar1090-tracker/issues)
- Documentation: [README.md](README.md)
- Discussions: [GitHub Discussions](https://github.com/random-robbie/tar1090-tracker/discussions)