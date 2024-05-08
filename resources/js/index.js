import {Map, Marker, FullscreenControl, Popup} from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';

export default function maplibre({
    locale,
    container,
    style,
    center,
    zoom,
    allowFullscreen
}) {
    let map = null;

    return {
        init() {
            this.createMap();

            this.$wire.getMarkers().then((markers) => {
                this.addMarkers(markers);
            });

            this.setFullscreen(allowFullscreen);
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
            shouldOpenUrlInNewTab
        }) {
            const marker = new Marker({
                id: id,
                draggable: draggable,
                color: color
            })
                .setLngLat(coordinates)
                .addTo(map);

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

    }

};
