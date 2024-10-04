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
        init() {
            this.createMap();
            console.log("lmao ,zokfozekf");

            map.on('load', () => {


                this.setItemsOnMap();

                // this.flyTo(4.814360966314035, 50.82656269324911);

                this.setFullscreen(allowFullscreen);

            });

            window.addEventListener('maplibre--flyTo', ({detail}) => this.flyTo(detail[0]))
            window.addEventListener('maplibre--updateMap', ({detail}) => this.resetMap())
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

        resetMap() {
            map.remove();

            this.createMap();

            map.on('load', () => {

                console.log("lmao blo");

                this.setItemsOnMap();

                // this.flyTo(4.814360966314035, 50.82656269324911);

                this.setFullscreen(allowFullscreen);

            });
        },

        setItemsOnMap() {
            this.$wire.getMarkers().then((markers) => {
                this.addMarkers(markers);
            });

            this.$wire.getSources().then(sources => {
                console.log("sources", sources);

                sources.forEach(source => {
                    console.log("source", source);
                    map.addSource(source.id, {
                        'type': source.type,
                        'data': source.data
                    });
                });

                console.log("map", map.sources);
            });
            
            this.$wire.getLayers().then(layers => {
                console.log("layers", layers);
                layers.forEach(layer => {
                    console.log("layer", layer);
                    map.addLayer(layer);
                })

                console.log("map", map.layers);

            });
        }

    }

};
