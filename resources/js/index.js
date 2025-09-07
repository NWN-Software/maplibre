import {Map, Marker, FullscreenControl, Popup} from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';

export default function maplibre({
    locale,
    container,
    style,
    center,
    zoom,
    allowFullscreen,
}) {
    let map = null;

    return {
        markers: {},
        init() {
            this.createMap();

            map.on('load', () => {

                this.setItemsOnMap();

                this.setFullscreen(allowFullscreen);

            });

            window.addEventListener('maplibre--flyTo', ({detail}) => this.flyTo(detail[0]))
            window.addEventListener('maplibre--updateMap', ({detail}) => this.resetMap(detail[0]))
            window.addEventListener('maplibre--updateMarkers', ({detail}) => this.updateMarkers(detail[0]))
            window.addEventListener('maplibre--deleteMarker', ({detail}) => this.deleteMarker(detail[0]))
            window.addEventListener('maplibre--addMarker', ({detail}) => this.addMarker(detail[0]))
            window.addEventListener('maplibre--saveMarker', ({detail}) => this.saveMarker(detail[0]))
            window.addEventListener('maplibre--goToMarker', ({detail}) => this.goToMarker(detail[0]))
        },

        createMap() {
            map = new Map({
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
                .addTo(map);

                this.markers[id] = marker;

            if (popupText) {
                const popup = new Popup()
                    .setHTML(popupText);

                marker.setPopup(popup);

                return;
            }

            // Add click event
            marker.getElement().addEventListener('click', (event) => {
                event.preventDefault();

                if (url) {
                    const isNotPlainLeftClick = e => (e.which > 1) || (e.altKey) || (e.ctrlKey) || (e.metaKey) || (e.shiftKey)
                    return window.open(url, (shouldOpenUrlInNewTab || isNotPlainLeftClick(event)) ? '_blank' : '_self')
                }

                this.$wire.onEventClick(id);
            });
        },

        setFullscreen(allowFullscreen) {
            if (allowFullscreen) {
                map.addControl(new FullscreenControl());
            }
        },

        flyTo(center) {
            map.flyTo({
                center: center
            });
        },

        goToMarker(markerId) {
            const marker = this.markers[markerId];

            if (!marker) {
                return;
            }

            const coordinates = marker.getLngLat();
            map.flyTo({
                center: [coordinates.lng, coordinates.lat]
            });

            marker.getElement().click();
        },

        resetMap(markers=null) {
            this.markers = {};

            map.remove();

            this.createMap();

            map.on('load', () => {

                this.setItemsOnMap(markers ? markers.markers : null);

                this.setFullscreen(allowFullscreen);

            });
        },

        setItemsOnMap(markers=null) {
            if (markers) {
                this.addMarkers(markers);
            }
            else {
                this.$wire.getMarkers().then((markers) => {
                    this.addMarkers(markers);
                });
            }

            this.$wire.getSources().then(sources => {

                sources.forEach(source => {
                    map.addSource(source.id, {
                        'type': source.type,
                        'data': source.data
                    });
                });

            });
            
            this.$wire.getLayers().then(layers => {
                layers.forEach(layer => {
                    map.addLayer(layer);
                })
            });
        },

        updateMarkers(data) {
            this.markers = {};
            
            map.remove();

            this.createMap();

            map.on('load', () => {
                this.addMarkers(data.markers);
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
        }

    }

};
