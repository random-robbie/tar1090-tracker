class AircraftTracker {
    constructor() {
        this.map = null;
        this.aircraftMarkers = {};
        this.aircraftTrails = {};
        this.config = {};
        this.showHistory = false;
        
        this.init();
    }

    async init() {
        try {
            await this.loadConfig();
            this.initMap();
            this.setupEventListeners();
            this.startDataUpdates();
        } catch (error) {
            console.error('Failed to initialize:', error);
            this.updateConnectionStatus(false);
        }
    }

    async loadConfig() {
        // Simplified URL handling for ingress mode
        const apiUrls = [
            'config',                // Simple relative path (works best in ingress)
            './config',              // Explicit relative path
            '/config',               // Absolute path (fallback)
            'api/config'             // With api prefix (fallback)
        ];
        
        for (const url of apiUrls) {
            try {
                const response = await fetch(url);
                if (response.ok) {
                    this.config = await response.json();
                    console.log('Config loaded from:', url);
                    return;
                }
            } catch (error) {
                console.warn(`Failed to load config from ${url}:`, error);
            }
        }
        
        // If all fail, use defaults
        console.warn('Using default configuration');
        this.config = {
            map_center_lat: 54.7023,
            map_center_lon: -3.2765,
            map_zoom: 8,
            update_interval: 1
        };
    }

    initMap() {
        // Initialize map with configured center and zoom
        this.map = L.map('map').setView(
            [this.config.map_center_lat, this.config.map_center_lon], 
            this.config.map_zoom
        );

        // Add tile layers
        this.osmLayer = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '© OpenStreetMap contributors'
        });

        this.satelliteLayer = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
            attribution: '© Esri'
        });

        // Add default layer
        this.osmLayer.addTo(this.map);

        console.log('Map initialized');
    }

    setupEventListeners() {
        // Toggle history button
        document.getElementById('toggle-history').addEventListener('click', () => {
            this.showHistory = !this.showHistory;
            document.getElementById('toggle-history').textContent = 
                this.showHistory ? 'Hide History' : 'Show History';
            this.clearTrails();
        });

        // Center map button
        document.getElementById('center-map').addEventListener('click', () => {
            this.map.setView(
                [this.config.map_center_lat, this.config.map_center_lon], 
                this.config.map_zoom
            );
        });

        // Toggle aircraft list button
        document.getElementById('toggle-list').addEventListener('click', () => {
            const aircraftList = document.getElementById('aircraft-list');
            const toggleBtn = document.getElementById('toggle-list');
            
            if (aircraftList.style.display === 'none') {
                aircraftList.style.display = 'block';
                toggleBtn.textContent = 'Hide Aircraft List';
            } else {
                aircraftList.style.display = 'none';
                toggleBtn.textContent = 'Show Aircraft List';
            }
        });

        // Map layer selector
        document.getElementById('map-layer').addEventListener('change', (e) => {
            const layer = e.target.value;
            this.map.eachLayer((mapLayer) => {
                if (mapLayer !== this.osmLayer && mapLayer !== this.satelliteLayer) return;
                this.map.removeLayer(mapLayer);
            });
            
            if (layer === 'satellite') {
                this.satelliteLayer.addTo(this.map);
            } else {
                this.osmLayer.addTo(this.map);
            }
        });
    }

    async fetchAPI(endpoint) {
        // Simplified URL handling for ingress mode
        const apiUrls = [
            endpoint,                // Simple relative path (works best in ingress)
            `./${endpoint}`,         // Explicit relative path
            `/${endpoint}`,          // Absolute path (fallback)
            `api/${endpoint}`        // With api prefix (fallback)
        ];
        
        for (const url of apiUrls) {
            try {
                const response = await fetch(url);
                if (response.ok) {
                    return await response.json();
                }
            } catch (error) {
                console.warn(`Failed to fetch from ${url}:`, error);
            }
        }
        
        throw new Error(`Failed to fetch ${endpoint} from all URLs`);
    }

    async startDataUpdates() {
        const updateData = async () => {
            try {
                const [aircraftData, statsData] = await Promise.all([
                    this.fetchAPI('aircraft'),
                    this.fetchAPI('stats')
                ]);

                this.updateAircraft(aircraftData);
                this.updateStats(statsData);
                this.updateConnectionStatus(true);
            } catch (error) {
                console.error('Failed to fetch data:', error);
                this.updateConnectionStatus(false);
            }
        };

        // Initial update
        await updateData();
        
        // Set up periodic updates
        setInterval(updateData, this.config.update_interval * 1000);
    }

    updateAircraft(data) {
        const currentAircraft = data.aircraft || [];
        const currentHexIds = new Set(currentAircraft.map(a => a.hex));

        // Remove aircraft that are no longer present
        Object.keys(this.aircraftMarkers).forEach(hex => {
            if (!currentHexIds.has(hex)) {
                this.removeAircraft(hex);
            }
        });

        // Update or add aircraft
        currentAircraft.forEach(aircraft => {
            this.updateAircraftMarker(aircraft);
        });

        this.updateAircraftList(currentAircraft);
    }

    updateAircraftMarker(aircraft) {
        const hex = aircraft.hex;
        
        // Skip aircraft without position
        if (!aircraft.lat || !aircraft.lon) return;

        const position = [aircraft.lat, aircraft.lon];
        
        if (this.aircraftMarkers[hex]) {
            // Update existing marker
            const marker = this.aircraftMarkers[hex];
            const oldPos = marker.getLatLng();
            marker.setLatLng(position);
            
            // Update rotation if track is available
            if (aircraft.track !== undefined) {
                const iconContainer = marker.getElement()?.querySelector('.aircraft-icon-container');
                if (iconContainer) {
                    iconContainer.style.transform = `rotate(${aircraft.track}deg)`;
                }
            }
            
            // Update trail if history is enabled
            if (this.showHistory) {
                this.updateTrail(hex, [oldPos.lat, oldPos.lng], position);
            }
            
            // Update popup content
            marker.setPopupContent(this.createPopupContent(aircraft));
        } else {
            // Create aircraft icon with proper rotation and size based on aircraft type
            const iconSize = this.getAircraftIconSize(aircraft);
            const rotation = aircraft.track || 0;
            const color = this.getAircraftColor(aircraft);
            
            const aircraftIcon = L.divIcon({
                html: `<div class="aircraft-icon-container" style="transform: rotate(${rotation}deg); width: ${iconSize}px; height: ${iconSize}px;">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="${iconSize}" height="${iconSize}" style="display: block;">
                        <!-- Aircraft body -->
                        <path fill="${color}" stroke="#000" stroke-width="0.5" d="M12 2L13 9L20 7L13.5 12L20 17L13 15L12 22L11 15L4 17L10.5 12L4 7L11 9L12 2Z"/>
                        <!-- Aircraft highlight -->
                        <path fill="#ffffff" stroke="#000000" stroke-width="0.2" d="M12 3L12.5 8.5L18 7.5L13 12L18 16.5L12.5 15.5L12 21L11.5 15.5L6 16.5L11 12L6 7.5L11.5 8.5L12 3Z"/>
                        <!-- Center dot -->
                        <circle cx="12" cy="12" r="1" fill="#ff0000" stroke="#fff" stroke-width="0.5"/>
                    </svg>
                </div>`,
                className: 'aircraft-marker',
                iconSize: [iconSize, iconSize],
                iconAnchor: [iconSize/2, iconSize/2]
            });

            // Create new marker
            const marker = L.marker(position, { icon: aircraftIcon });
            marker.bindPopup(this.createPopupContent(aircraft));
            marker.addTo(this.map);
            
            this.aircraftMarkers[hex] = marker;
            
            // Initialize trail
            if (this.showHistory) {
                this.aircraftTrails[hex] = [position];
            }
        }
    }

    updateTrail(hex, oldPos, newPos) {
        if (!this.aircraftTrails[hex]) {
            this.aircraftTrails[hex] = [];
        }
        
        this.aircraftTrails[hex].push(newPos);
        
        // Keep only last 50 positions to prevent performance issues
        if (this.aircraftTrails[hex].length > 50) {
            this.aircraftTrails[hex].shift();
        }
        
        // Remove existing trail polyline
        if (this.aircraftTrails[hex + '_line']) {
            this.map.removeLayer(this.aircraftTrails[hex + '_line']);
        }
        
        // Draw new trail
        if (this.aircraftTrails[hex].length > 1) {
            const trail = L.polyline(this.aircraftTrails[hex], {
                color: this.getAircraftColor({ hex }),
                weight: 2,
                opacity: 0.6
            });
            trail.addTo(this.map);
            this.aircraftTrails[hex + '_line'] = trail;
        }
    }

    removeAircraft(hex) {
        // Remove marker
        if (this.aircraftMarkers[hex]) {
            this.map.removeLayer(this.aircraftMarkers[hex]);
            delete this.aircraftMarkers[hex];
        }
        
        // Remove trail
        if (this.aircraftTrails[hex + '_line']) {
            this.map.removeLayer(this.aircraftTrails[hex + '_line']);
            delete this.aircraftTrails[hex + '_line'];
        }
        
        delete this.aircraftTrails[hex];
    }

    clearTrails() {
        Object.keys(this.aircraftTrails).forEach(key => {
            if (key.endsWith('_line')) {
                this.map.removeLayer(this.aircraftTrails[key]);
                delete this.aircraftTrails[key];
            }
        });
        
        if (!this.showHistory) {
            Object.keys(this.aircraftTrails).forEach(hex => {
                if (!hex.endsWith('_line')) {
                    delete this.aircraftTrails[hex];
                }
            });
        }
    }

    getAircraftColor(aircraft) {
        // Color based on altitude
        const altitude = aircraft.alt_baro || aircraft.alt_geom || 0;
        
        if (altitude < 5000) return '#ff4444';      // Red - Low altitude
        if (altitude < 15000) return '#ffaa00';     // Orange - Medium altitude  
        if (altitude < 25000) return '#00aaff';     // Blue - High altitude
        return '#00ff88';                           // Green - Very high altitude
    }

    getAircraftIconSize(aircraft) {
        // Size based on aircraft category or type
        const category = aircraft.category || '';
        const type = aircraft.t || '';
        
        // Large aircraft (A380, B747, etc.)
        if (type.includes('A38') || type.includes('B74') || category === 'A7') return 28;
        
        // Wide-body aircraft (B777, A330, etc.)
        if (type.includes('B77') || type.includes('A33') || type.includes('A34') || category === 'A5') return 24;
        
        // Narrow-body aircraft (A320, B737, etc.)  
        if (type.includes('A32') || type.includes('B73') || category === 'A3') return 20;
        
        // Regional/Small aircraft
        if (category === 'A1' || category === 'A2') return 16;
        
        // Default size
        return 20;
    }

    createPopupContent(aircraft) {
        const callsign = aircraft.flight ? aircraft.flight.trim() : 'N/A';
        const altitude = aircraft.alt_baro || aircraft.alt_geom || 'N/A';
        const speed = aircraft.gs || 'N/A';
        const track = aircraft.track || 'N/A';
        const squawk = aircraft.squawk || 'N/A';
        
        return `
            <div class="popup-callsign">${callsign}</div>
            <div class="popup-details">
                <div><strong>Hex:</strong> ${aircraft.hex}</div>
                <div><strong>Altitude:</strong> ${altitude} ft</div>
                <div><strong>Speed:</strong> ${speed} kts</div>
                <div><strong>Track:</strong> ${track}°</div>
                <div><strong>Squawk:</strong> ${squawk}</div>
                ${aircraft.category ? `<div><strong>Category:</strong> ${aircraft.category}</div>` : ''}
            </div>
        `;
    }

    updateAircraftList(aircraft) {
        const listContainer = document.getElementById('aircraft-items');
        listContainer.innerHTML = '';
        
        // Sort by callsign, then by hex
        aircraft.sort((a, b) => {
            const aCall = a.flight ? a.flight.trim() : a.hex;
            const bCall = b.flight ? b.flight.trim() : b.hex;
            return aCall.localeCompare(bCall);
        });
        
        aircraft.forEach(ac => {
            const item = document.createElement('div');
            item.className = 'aircraft-item';
            
            const callsign = ac.flight ? ac.flight.trim() : ac.hex;
            const altitude = ac.alt_baro || ac.alt_geom || 'N/A';
            const speed = ac.gs || 'N/A';
            
            item.innerHTML = `
                <div class="aircraft-callsign">${callsign}</div>
                <div class="aircraft-details">
                    <span class="aircraft-altitude">${altitude} ft</span> | 
                    <span class="aircraft-speed">${speed} kts</span>
                </div>
            `;
            
            // Click to center on aircraft
            item.addEventListener('click', () => {
                if (ac.lat && ac.lon && this.aircraftMarkers[ac.hex]) {
                    this.map.setView([ac.lat, ac.lon], 12);
                    this.aircraftMarkers[ac.hex].openPopup();
                }
            });
            
            listContainer.appendChild(item);
        });
    }

    updateStats(stats) {
        document.getElementById('aircraft-count').textContent = 
            `${stats.total_aircraft} aircraft`;
        
        const lastUpdate = stats.last_update ? 
            new Date(stats.last_update * 1000).toLocaleTimeString() : '--';
        document.getElementById('last-update').textContent = 
            `Last update: ${lastUpdate}`;
    }

    updateConnectionStatus(connected) {
        const statusElement = document.getElementById('connection-status');
        statusElement.textContent = connected ? 'Connected' : 'Disconnected';
        statusElement.className = connected ? 'status-connected' : 'status-disconnected';
    }
}

// Initialize the tracker when the page loads
document.addEventListener('DOMContentLoaded', () => {
    new AircraftTracker();
});