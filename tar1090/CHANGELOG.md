# Changelog

All notable changes to the Tar1090 Aircraft Tracker will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [1.0.12] - 2025-07-30

### Added
- FlightRadar24 integration - click aircraft icons to view on FR24
- Registration display in aircraft popup details
- Enhanced aircraft SVG icons with cockpit and wing highlights
- Right-click and Ctrl+click support for direct FR24 links

### Changed  
- Improved aircraft icon design with larger, more visible airplane shapes
- Increased default icon sizes for better visibility (24-36px range)
- Enhanced SVG with 32x32 viewBox for better scaling

### Fixed
- Replaced pin-style markers with proper airplane-shaped icons
- Better aircraft icon visibility and contrast on map

## [1.0.11] - 2025-07-30

### Added
- Improved aircraft icon visibility and rendering
- Better SVG aircraft icons with enhanced styling

### Changed
- Changed default map center from New York to UK (54.7023, -3.2765)
- Enhanced aircraft icon CSS with stronger drop shadows and better contrast
- Improved aircraft icon rotation handling for smoother updates

### Fixed
- Fixed missing aircraft icons on map display
- Resolved SVG rendering issues in Leaflet markers
- Enhanced icon visibility with better styling and positioning

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

## [1.0.8] - 2025-07-30

### Fixed
- Fixed web interface API connection issues in Home Assistant ingress mode
- Resolved "disconnected" status showing despite successful tar1090 connection
- Added intelligent API URL detection for different deployment scenarios

### Technical
- Enhanced JavaScript fetchAPI() function with multiple URL fallback strategies
- Improved error handling for API requests in ingress environments
- Added comprehensive URL pattern matching for HA integration

## [1.0.7] - 2025-07-30

### Fixed
- Resolved 502 gateway errors caused by null configuration values
- Fixed environment variable handling when values come as 'null' strings
- Improved configuration reading with proper JSON fallback

### Technical
- Enhanced get_config_value() function with null value detection
- Added proper error handling for configuration file reading
- Improved logging for configuration debugging

## [1.0.6] - 2025-07-30

### Fixed
- Fixed configuration validation errors in Home Assistant
- Corrected float schema format in config.yaml
- Added required arch field for multi-architecture support

### Technical
- Updated config.yaml with proper YAML schema validation
- Fixed addon structure for Home Assistant compatibility

## [1.0.5] - 2025-07-30

### Added
- Professional repository structure for Home Assistant addon store
- Automated release management with version tagging
- Repository metadata and addon store integration

### Technical
- Added repository.json for HA addon store compatibility
- Created release.sh script for automated version management
- Structured addon files in proper subdirectory

## [1.0.4] - 2025-07-29

### Added
- Git repository initialization and version control
- Main branch as default (removed master branch)
- Comprehensive commit history and changelog integration

### Technical
- Initialized git repository with proper branching
- Added .gitignore for Python and Node.js projects
- Linked commits to changelog documentation

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