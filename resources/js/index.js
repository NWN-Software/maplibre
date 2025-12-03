import {Map, Marker, FullscreenControl, Popup} from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';

export default function maplibre({
    locale,
    container,
    style,
    center,
    zoom,
    allowFullscreen,
    showWeatherOverlay = false,
    initialStartDate = null,
}) {
    return {
        map: null,
        markers: {},
        weatherOverlayVisible: showWeatherOverlay,
        weatherVariable: 'temperature', // Keep for backward compatibility
        activeWeatherVariables: [], // Array of active variables - start empty
        weatherVariableOpacities: {}, // Store opacity per variable
        weatherDateTime: 'now', // Current datetime for weather overlay
        weatherPlaybackActive: false, // Whether playback is active
        weatherPlaybackInterval: null, // Interval ID for playback
        weatherTimeRange: { start: 6, end: 22 }, // Hours range for playback (6-22)
        weatherUpdateTimeout: null, // Timeout for debouncing datetime updates
        weatherVariables: {
            'temperature': { label: 'Temperatuur', colormap: 'temperature_2m_metric' },
            'feels_like_temperature': { label: 'Gevoelstemperatuur', colormap: 'apparent_temperature_2m_metric' },
            'clouds': { label: 'Bewolking', colormap: 'cloud_cover_total_metric' },
            'precipitation': { label: 'Neerslag', colormap: 'total_precipitation_metric' },
            'wind_speed': { label: 'Windsnelheid', colormap: 'wind_spd_10m_metric' },
            'wind_gust': { label: 'Windstoten', colormap: 'wind_gust_metric' },
            'pressure': { label: 'Luchtdruk', colormap: 'pressure_msl_metric' },
            'humidity': { label: 'Luchtvochtigheid', colormap: 'relative_humidity_metric' },
            'wave_height': { label: 'Golfhoogte', colormap: 'wave_height_metric' },
            'wave_period': { label: 'Golfperiode', colormap: 'wave_period_metric' },
            'sea_temperature': { label: 'Zeetemperatuur', colormap: 'sea_temperature_metric' },
            'air_quality': { label: 'Luchtkwaliteit', colormap: 'air_quality_metric' },
            'ozone_surface': { label: 'Ozon oppervlak', colormap: 'ozone_surface_metric' },
            'ozone_total': { label: 'Totaal ozon', colormap: 'ozone_total_metric' },
            'no2': { label: 'Stikstofdioxide', colormap: 'no2_surface_metric' },
            'pm2.5': { label: 'PM2.5', colormap: 'pm25_metric' },
        },

        init() {
            // Set initial weather datetime from startDate if provided
            if (initialStartDate) {
                try {
                    const startDate = new Date(initialStartDate);
                    if (!isNaN(startDate.getTime())) {
                        // formatWeatherDateTime will check if date is in past and return 'now' if so
                        this.weatherDateTime = this.formatWeatherDateTime(startDate);
                        console.log('Weather datetime initialized to:', this.weatherDateTime, 'from startDate:', initialStartDate);
                    } else {
                        console.warn('Invalid initialStartDate:', initialStartDate);
                    }
                } catch (e) {
                    console.error('Error parsing initialStartDate:', e);
                }
            } else {
                console.log('No initialStartDate provided, using default:', this.weatherDateTime);
            }

            this.createMap();

            this.map.on('load', () => {
                this.setItemsOnMap();
                this.setFullscreen(allowFullscreen);

                if (this.weatherOverlayVisible) {
                    setTimeout(() => {
                        console.log('Updating weather overlays with datetime:', this.weatherDateTime);
                        this.updateWeatherOverlays();
                    }, 100);
                }
            });

            this.map.on('sourcedata', (e) => {
                if (e.sourceId === 'weather-tiles' && e.isSourceLoaded && e.source && e.source.type === 'raster') {
                    // Source loaded successfully
                }
            });

            window.addEventListener('maplibre--flyTo', ({detail}) => this.flyTo(detail[0]));
            window.addEventListener('maplibre--updateMap', ({detail}) => this.resetMap(detail[0]));
            window.addEventListener('maplibre--updateMarkers', ({detail}) => this.updateMarkers(detail[0]));
            window.addEventListener('maplibre--deleteMarker', ({detail}) => this.deleteMarker(detail[0]));
            window.addEventListener('maplibre--addMarker', ({detail}) => this.addMarker(detail[0]));
            window.addEventListener('maplibre--saveMarker', ({detail}) => this.saveMarker(detail[0]));
            window.addEventListener('maplibre--goToMarker', ({detail}) => this.goToMarker(detail[0]));

            window.addEventListener('weather--updateDateTime', (event) => {
                console.log('weather--updateDateTime event received', event);
                console.log('this', this);
                if (event.detail && event.detail[0].startDate) {
                    console.log('event.detail.startDate', event.detail[0].startDate);
                    const startDate = new Date(event.detail[0].startDate);
                    const formatted = this.formatWeatherDateTime(startDate);
                    // this.setWeatherDateTime(formatted);
                }
            });
        },

        createMap() {
            this.map = new Map({
                container: container,
                style: style,
                center: center,
                zoom: zoom,
                locale: locale,
            });
        },

        addMarkers(markers) {
            markers.forEach(marker => {
                this.addMarker(marker);
            });
        },

        addMarker({
            id,
            coordinates,
            draggable,
            color,
            url,
            shouldOpenUrlInNewTab,
            popupText,
            avatarIconSize,
            avatarUrl,
        }) {
            const el = document.createElement('div');
            if (avatarUrl) {
                el.style.backgroundImage = `url(${avatarUrl})`;
                el.style.width = `${avatarIconSize}px`;
                el.style.height = `${avatarIconSize}px`;
                el.style.backgroundSize = 'cover';
                el.style.backgroundPosition = 'center';
                el.style.verticalAlign = 'middle';
                el.style.borderRadius = '50%';
                el.style.boxShadow = 'var(--tw-ring-inset) 0 0 0 calc(2px + var(--tw-ring-offset-width)) var(--tw-ring-color)';
                el.style.padding = '2px';
            }

            const marker = new Marker({
                id: id,
                draggable: draggable,
                color: color,
                ...(avatarUrl ? {element: el} : {})
            })
                .setLngLat(coordinates)
                .addTo(this.map);

            this.markers[id] = marker;

            if (popupText) {
                const popup = new Popup().setHTML(popupText);
                marker.setPopup(popup);
                return;
            }

            marker.getElement().addEventListener('click', (event) => {
                event.preventDefault();

                if (url) {
                    const isNotPlainLeftClick = e =>
                        (e.which > 1) || e.altKey || e.ctrlKey || e.metaKey || e.shiftKey;
                    return window.open(
                        url,
                        (shouldOpenUrlInNewTab || isNotPlainLeftClick(event)) ? '_blank' : '_self'
                    );
                }

                this.$wire.onEventClick(id);
            });
        },

        setFullscreen(allowFullscreen) {
            if (allowFullscreen) {
                this.map.addControl(new FullscreenControl());
            }
        },

        flyTo(center) {
            this.map.flyTo({ center });
        },

        goToMarker(markerId) {
            const marker = this.markers[markerId];
            if (!marker) {
                return;
            }

            const coordinates = marker.getLngLat();
            this.map.flyTo({
                center: [coordinates.lng, coordinates.lat]
            });

            marker.getElement().click();
        },

        resetMap(markers = null) {
            // Preserve weather state before resetting
            const preservedWeatherDateTime = this.weatherDateTime;
            const preservedActiveVariables = [...(this.activeWeatherVariables || [])];
            const preservedVariableOpacities = {...(this.weatherVariableOpacities || {})};
            const preservedOverlayVisible = this.weatherOverlayVisible;
            
            this.markers = {};

            if (this.map) {
                this.map.remove();
            }

            this.createMap();

            // Restore weather state after reset
            this.weatherDateTime = preservedWeatherDateTime;
            this.activeWeatherVariables = preservedActiveVariables;
            this.weatherVariableOpacities = preservedVariableOpacities;
            this.weatherOverlayVisible = preservedOverlayVisible;

            this.map.on('load', () => {
                this.setItemsOnMap(markers ? markers.markers : null);
                this.setFullscreen(allowFullscreen);

                if (this.weatherOverlayVisible && this.activeWeatherVariables && this.activeWeatherVariables.length > 0) {
                    setTimeout(() => {
                        console.log(
                            'Re-adding weather overlays after map reset, datetime:',
                            this.weatherDateTime,
                            'variables:',
                            this.activeWeatherVariables
                        );
                        this.updateWeatherOverlays();
                    }, 500);
                }
            });
        },

        setItemsOnMap(markers = null) {
            if (markers) {
                this.addMarkers(markers);
            } else {
                this.$wire.getMarkers().then((markers) => {
                    this.addMarkers(markers);
                });
            }

            this.$wire.getSources().then(sources => {
                sources.forEach(source => {
                    this.map.addSource(source.id, {
                        'type': source.type,
                        'data': source.data
                    });
                });
            });
            
            this.$wire.getLayers().then(layers => {
                layers.forEach(layer => {
                    this.map.addLayer(layer);
                });
            });
        },

        updateMarkers(data) {
            this.markers = {};
            
            if (this.map) {
                this.map.remove();
            }

            this.createMap();

            this.map.on('load', () => {
                this.addMarkers(data.markers);
                
                if (this.weatherOverlayVisible) {
                    this.updateWeatherOverlays();
                }
            });
        },

        deleteMarker(marker) {
            const markerToDelete = this.markers[marker.id];
            if (markerToDelete) {
                markerToDelete.remove();
                delete this.markers[marker.id];
            }
        },

        saveMarker(data) {
            this.deleteMarker(data.marker);
            this.addMarker(data.marker); 
        },

        addWeatherOverlay(variable = 'temperature', opacity = 1) {
            console.log('addWeatherOverlay called', {
                map: !!this.map,
                loaded: this.map?.loaded(),
                variable: variable,
                opacity: opacity
            });
            
            if (!this.map) {
                console.warn('Map not initialized in addWeatherOverlay');
                return;
            }
            
            if (!this.map.loaded()) {
                console.warn('Map not loaded in addWeatherOverlay, skipping for now');
                return;
            }

            const layerId = `weather-overlay-${variable}`;
            const sourceId = `weather-tiles-${variable}`;

            if (this.map.getLayer(layerId)) {
                this.map.removeLayer(layerId);
            }
            if (this.map.getSource(sourceId)) {
                this.map.removeSource(sourceId);
            }

            const proxyUrl = window.location.origin + '/weather-tiles';
            const datetime = this.weatherDateTime || 'now';

            this.map.addSource(sourceId, {
                'type': 'raster',
                'tiles': [
                    `${proxyUrl}?tile_x={x}&tile_y={y}&tile_zoom={z}&datetime=${datetime}&variable=${variable}`
                ],
                'tileSize': 256,
            });

            const layerConfig = {
                'id': layerId,
                'type': 'raster',
                'source': sourceId,
                'minzoom': 0,
                'maxzoom': 22,
                'paint': {
                    'raster-opacity': opacity
                }
            };

            let labelLayer = null;
            try {
                const style = this.map.getStyle();
                const layers = style.layers || [];
                labelLayer = layers.find(layer => 
                    layer && layer.id && (
                        layer.id.includes('label') || 
                        layer.id.includes('text') ||
                        layer.id.includes('symbol')
                    )
                );
            } catch (e) {
                console.debug('Error reading map style for label layer:', e);
            }

            if (labelLayer) {
                this.map.addLayer(layerConfig, labelLayer.id);
            } else {
                this.map.addLayer(layerConfig);
            }
        },

        removeWeatherOverlay(variable) {
            if (!this.map || !this.map.loaded()) {
                return;
            }

            const layerId = `weather-overlay-${variable}`;
            const sourceId = `weather-tiles-${variable}`;

            try {
                if (this.map.getLayer(layerId)) {
                    this.map.removeLayer(layerId);
                }
            } catch (e) {
                console.debug('Layer already removed:', layerId);
            }

            try {
                if (this.map.getSource(sourceId)) {
                    this.map.removeSource(sourceId);
                }
            } catch (e) {
                console.debug('Source already removed:', sourceId);
            }
        },

        updateWeatherOverlays(retryCount = 0) {
            const maxRetries = 10;
            
            if (!this.map) {
                console.log('Map not initialized, retrying...', retryCount);
                if (retryCount < maxRetries) {
                    setTimeout(() => {
                        this.updateWeatherOverlays(retryCount + 1);
                    }, 200);
                }
                return;
            }
            
            if (!this.map.loaded()) {
                console.log('Map not loaded yet, retrying...', retryCount);
                if (retryCount < maxRetries) {
                    setTimeout(() => {
                        this.updateWeatherOverlays(retryCount + 1);
                    }, 200);
                }
                return;
            }

            console.log('updateWeatherOverlays executing, retryCount:', retryCount);

            const activeVars = this.activeWeatherVariables || [];
            
            let existingLayers = [];
            try {
                const style = this.map.getStyle();
                existingLayers = (style.layers || [])
                    .filter(layer => layer && layer.id && layer.id.startsWith('weather-overlay-'))
                    .map(layer => layer.id.replace('weather-overlay-', ''));
            } catch (e) {
                console.debug('Error reading map style layers:', e);
                existingLayers = [];
            }

            existingLayers.forEach(variable => {
                if (!activeVars.includes(variable)) {
                    this.removeWeatherOverlay(variable);
                }
            });

            activeVars.forEach(variable => {
                const opacity = this.weatherVariableOpacities[variable] || 1;
                const layerId = `weather-overlay-${variable}`;
                if (!this.map.getLayer(layerId)) {
                    this.addWeatherOverlay(variable, opacity);
                } else {
                    try {
                        this.map.setPaintProperty(layerId, 'raster-opacity', opacity);
                    } catch (e) {
                        console.debug('Layer not ready for opacity update:', layerId);
                    }
                }
            });
        },

        toggleWeatherOverlay(forceVisible = null) {
            if (!this.map || !this.map.loaded()) {
                return;
            }
            
            if (typeof forceVisible === 'boolean') {
                this.weatherOverlayVisible = forceVisible;
            } else {
                this.weatherOverlayVisible = !this.weatherOverlayVisible;
            }
            
            if (this.weatherOverlayVisible) {
                if (!this.activeWeatherVariables || !this.activeWeatherVariables.length) {
                    this.activeWeatherVariables = ['temperature'];
                    this.weatherVariable = 'temperature';
                }
                this.updateWeatherOverlays();
            } else {
                if (this.weatherPlaybackActive) {
                    this.toggleWeatherPlayback();
                }
                
                let existingLayers = [];
                try {
                    const style = this.map.getStyle();
                    existingLayers = (style.layers || [])
                        .filter(layer => layer && layer.id && layer.id.startsWith('weather-overlay-'))
                        .map(layer => layer.id.replace('weather-overlay-', ''));
                } catch (e) {
                    console.debug('Error reading map style layers:', e);
                }

                existingLayers.forEach(variable => {
                    this.removeWeatherOverlay(variable);
                });
            }
        },

        toggleWeatherVariable(variable) {
            if (!this.activeWeatherVariables) {
                this.activeWeatherVariables = [];
            }

            const index = this.activeWeatherVariables.indexOf(variable);
            if (index > -1) {
                this.activeWeatherVariables.splice(index, 1);
                if (this.map && this.map.loaded()) {
                    this.removeWeatherOverlay(variable);
                }
            } else {
                this.activeWeatherVariables.push(variable);
                if (this.weatherOverlayVisible && this.map && this.map.loaded()) {
                    const opacity = this.weatherVariableOpacities[variable] || 1;
                    this.addWeatherOverlay(variable, opacity);
                }
            }

            if (this.activeWeatherVariables.length > 0) {
                this.weatherVariable = this.activeWeatherVariables[0];
            } else {
                this.weatherVariable = null;
            }

            if (this.weatherOverlayVisible && this.map && this.map.loaded()) {
                this.updateWeatherOverlays();
            }
        },

        changeWeatherVariable(variable) {
            this.activeWeatherVariables = [variable];
            this.weatherVariable = variable;
            if (this.weatherOverlayVisible && this.map && this.map.loaded()) {
                this.updateWeatherOverlays();
            }
        },

        setVariableOpacity(variable, opacity) {
            this.weatherVariableOpacities[variable] = opacity;
            if (this.weatherOverlayVisible && this.map && this.map.loaded()) {
                const layerId = `weather-overlay-${variable}`;
                if (this.map.getLayer(layerId)) {
                    this.map.setPaintProperty(layerId, 'raster-opacity', opacity);
                }
            }
        },

        getColormapUrl(variable) {
            const varConfig = this.weatherVariables[variable];
            if (!varConfig) {
                return null;
            }
            return `https://www.meteosource.com/static/img/documentation/${varConfig.colormap}.png`;
        },

        isVariableActive(variable) {
            return this.activeWeatherVariables && this.activeWeatherVariables.includes(variable);
        },

        // Weather datetime and playback functions
        getCurrentWeatherDateTime() {
            if (!this.weatherDateTime || this.weatherDateTime === 'now') {
                return new Date();
            }
            if (typeof this.weatherDateTime === 'string' && (this.weatherDateTime.startsWith('+') || this.weatherDateTime.startsWith('-'))) {
                const match = this.weatherDateTime.match(/([+-])(\d+)(hours?|minutes?|days?)/);
                if (match) {
                    const sign = match[1] === '+' ? 1 : -1;
                    const value = parseInt(match[2]);
                    const unit = match[3];
                    const now = new Date();
                    if (unit.startsWith('hour')) {
                        now.setHours(now.getHours() + sign * value);
                    } else if (unit.startsWith('minute')) {
                        now.setMinutes(now.getMinutes() + sign * value);
                    } else if (unit.startsWith('day')) {
                        now.setDate(now.getDate() + sign * value);
                    }
                    return now;
                }
            }
            const parsed = new Date(this.weatherDateTime);
            return isNaN(parsed.getTime()) ? new Date() : parsed;
        },

        formatWeatherDateTime(date) {
            if (!date) {
                date = this.getCurrentWeatherDateTime();
            }
            if (!(date instanceof Date)) {
                date = new Date(date);
            }
            if (isNaN(date.getTime())) {
                date = new Date();
            }
            
            const now = new Date();
            now.setMinutes(now.getMinutes() - 1);
            if (date < now) {
                return 'now';
            }
            
            const year = date.getFullYear();
            const month = String(date.getMonth() + 1).padStart(2, '0');
            const day = String(date.getDate()).padStart(2, '0');
            const hours = String(date.getHours()).padStart(2, '0');
            const minutes = String(date.getMinutes()).padStart(2, '0');
            return `${year}-${month}-${day}T${hours}:${minutes}`;
        },

        setWeatherDateTime(datetime) {
            this.weatherDateTime = datetime;
            console.log('Weather datetime set to:', this.weatherDateTime);
            if (this.weatherOverlayVisible && this.map && this.map.loaded()) {
                console.log('lets get it')
                this.updateWeatherOverlayDateTime();
            }
        },

        updateWeatherOverlayDateTime(isPlayback = false) {
            if (!this.weatherOverlayVisible) {
                console.log('Weather overlay not visible, skipping');
                return;
            }

            if (this.weatherUpdateTimeout) {
                clearTimeout(this.weatherUpdateTimeout);
            }

            const delay = isPlayback ? 3000 : 0;
            console.log('Setting timeout for', delay, 'ms (playback:', isPlayback, ')');

            this.weatherUpdateTimeout = setTimeout(() => {
                console.log('Timeout callback executed');

                if (!this.map || !this.map.loaded()) {
                    console.log('Map not ready, skipping weather datetime update');
                    this.weatherUpdateTimeout = null;
                    return;
                }

                const datetime = this.weatherDateTime || 'now';
                const activeVars = this.activeWeatherVariables || [];

                console.log('Updating overlays for datetime:', datetime, 'variables:', activeVars);

                if (activeVars.length === 0) {
                    console.log('No active variables, returning');
                    this.weatherUpdateTimeout = null;
                    return;
                }

                activeVars.forEach(variable => {
                    console.log('Processing variable:', variable);
                    const opacity = this.weatherVariableOpacities[variable] || 1;
                    const currentLayerId = `weather-overlay-${variable}`;
                    const currentSourceId = `weather-tiles-${variable}`;
                    const proxyUrl = window.location.origin + '/weather-tiles';
                    
                    let allLayers = [];
                    try {
                        const style = this.map.getStyle();
                        allLayers = style.layers || [];
                    } catch (e) {
                        console.debug('Error reading map style layers:', e);
                    }
                    
                    allLayers.forEach(layer => {
                        if (layer && layer.id && layer.id.startsWith(`weather-overlay-${variable}`)) {
                            try {
                                if (this.map.getLayer(layer.id)) {
                                    this.map.removeLayer(layer.id);
                                    console.log('Removed layer:', layer.id);
                                }
                            } catch (e) {
                                console.debug('Error removing layer:', e);
                            }
                        }
                    });
                    
                    try {
                        const style = this.map.getStyle();
                        if (style.sources) {
                            Object.keys(style.sources).forEach(sourceId => {
                                if (sourceId.startsWith(`weather-tiles-${variable}`)) {
                                    try {
                                        if (this.map.getSource(sourceId)) {
                                            this.map.removeSource(sourceId);
                                            console.log('Removed source:', sourceId);
                                        }
                                    } catch (e) {
                                        console.debug('Error removing source:', e);
                                    }
                                }
                            });
                        }
                    } catch (e) {
                        console.debug('Error reading map style sources:', e);
                    }
                    
                    setTimeout(() => {
                        if (!this.map || !this.map.loaded()) {
                            console.log('Map not ready after cleanup');
                            return;
                        }
                        
                        try {
                            this.map.addSource(currentSourceId, {
                                'type': 'raster',
                                'tiles': [
                                    `${proxyUrl}?tile_x={x}&tile_y={y}&tile_zoom={z}&datetime=${datetime}&variable=${variable}`
                                ],
                                'tileSize': 256,
                            });
                            
                            const layerConfig = {
                                'id': currentLayerId,
                                'type': 'raster',
                                'source': currentSourceId,
                                'minzoom': 0,
                                'maxzoom': 22,
                                'paint': {
                                    'raster-opacity': opacity
                                }
                            };
                            
                            let labelLayer = null;
                            try {
                                const style = this.map.getStyle();
                                const allLayersAfter = style.layers || [];
                                labelLayer = allLayersAfter.find(layer => 
                                    layer && layer.id && (
                                        layer.id.includes('label') || 
                                        layer.id.includes('text') ||
                                        layer.id.includes('symbol')
                                    )
                                );
                            } catch (e) {
                                console.debug('Error reading map style for label layer:', e);
                            }
                            
                            if (labelLayer) {
                                this.map.addLayer(layerConfig, labelLayer.id);
                            } else {
                                this.map.addLayer(layerConfig);
                            }
                            
                            console.log('Updated overlay for variable:', variable, 'with datetime:', datetime);
                        } catch (e) {
                            console.error('Error updating overlay:', e);
                        }
                    }, 50);
                });
                
                this.weatherUpdateTimeout = null;
            }, delay);
        },

        toggleWeatherPlayback() {
            if (this.weatherPlaybackActive) {
                if (this.weatherPlaybackInterval) {
                    clearInterval(this.weatherPlaybackInterval);
                    this.weatherPlaybackInterval = null;
                }
                this.weatherPlaybackActive = false;
            } else {
                this.startWeatherPlayback();
            }
        },

        startWeatherPlayback() {
            if (this.weatherPlaybackActive) {
                return;
            }

            this.weatherPlaybackActive = true;
            const startHour = this.weatherTimeRange.start || 6;
            const endHour = this.weatherTimeRange.end || 22;
            
            const now = new Date();
            now.setHours(startHour, 0, 0, 0);
            this.setWeatherDateTime(this.formatWeatherDateTime(now));

            let currentHour = startHour;
            this.weatherPlaybackInterval = setInterval(() => {
                currentHour++;
                
                if (currentHour > endHour) {
                    currentHour = startHour;
                }

                const playbackDate = new Date();
                playbackDate.setHours(currentHour, 0, 0, 0);
                this.setWeatherDateTime(this.formatWeatherDateTime(playbackDate));
                this.updateWeatherOverlayDateTime(true);
            }, 4000);
        },

        setWeatherTimeFromSlider(hours) {
            try {
                const hourValue = parseInt(hours);
                if (isNaN(hourValue)) {
                    console.error('Invalid hour value:', hours);
                    return;
                }
                const now = new Date();
                now.setHours(hourValue, 0, 0, 0);
                const formatted = this.formatWeatherDateTime(now);
                this.setWeatherDateTime(formatted);
                this.updateWeatherOverlayDateTime();
            } catch (e) {
                console.error('Error in setWeatherTimeFromSlider:', e);
            }
        },

        getWeatherTimeSliderValue() {
            try {
                const date = this.getCurrentWeatherDateTime();
                if (!date || !(date instanceof Date) || isNaN(date.getTime())) {
                    return new Date().getHours();
                }
                return date.getHours();
            } catch (e) {
                console.error('Error in getWeatherTimeSliderValue:', e);
                return new Date().getHours();
            }
        }

    };

};
