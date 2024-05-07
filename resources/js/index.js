import {Map} from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';

export default function maplibre({
    locale,
    container,
    style,
    center,
    zoom
}) {
    return {
        init() {
            console.log("ridiculous");

            const map = new Map({
                container: container,
                style: style,
                center: center,
                zoom: zoom
            });
        }


    }

};
