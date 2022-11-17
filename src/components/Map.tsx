
import { createEffect, onMount } from 'solid-js';
import { map as leaflet, control, marker, divIcon, svgOverlay, tileLayer, LatLngBounds } from 'leaflet';
import type { Map as Leaflet, Marker, SVGOverlay } from 'leaflet';

import { state, setState } from "../store/state";
import Geohash from '../geohash';

import './Map.css';

export default function Map() {
    let mapDOM : HTMLDivElement | undefined, 
        map: Leaflet,
        focusPoint: Marker,
        geoBox: SVGOverlay;
    
    onMount(() => {
        map = leaflet(mapDOM!, {
            center: [52, 5],
            zoom: 10,
            minZoom: 2,
            maxZoom: 23,
            zoomControl: false
        }).addLayer(tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
            maxZoom: 23,
            attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>, ' + 
                            '&copy; <a href="https://carto.com/attributions">CARTO</a>'
        })).addControl(control.zoom({ position: 'topright' }));

        geoBox = svgOverlay(<svg>
            <rect width="100%" height="100%" stroke="#0d6efd" stroke-opacity="0.8" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" fill="#0d6efd" fill-opacity="0.2"></rect>
            <text fill="#343a40" x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" font-size={(7 / state.geohash.length) + 'vw'} font-weight="bold">{state.geohash.toUpperCase()}</text>
        </svg> as SVGElement, [[0, 0],[0, 0]]).addTo(map);

        focusPoint = marker([0, 0], { icon: divIcon({
            html: <div class="marker">
                <div class="marker base">
                    <span class="marker hole"></span>
                </div>
            </div> as HTMLElement
        })}).addTo(map);

        map.on('click', e => {
            setState(e.latlng);
        });

        map.on('zoomend', e => {
            if (state.zoom) setState('precision', Math.round(e.target.getZoom() / 2.5));
        });

        createEffect(() => {
            let desiredZoom = map.getZoom();

            let n = state.precision, 
               lo = 2 * n + Math.floor((n - 1) / 2), 
               hi = 1 + 2 * n + Math.floor(n / 2);
            if (desiredZoom < lo || desiredZoom > hi) {
                desiredZoom = Math.round(state.precision * 2.5);
            }

            map.flyTo([state.lat, state.lng], desiredZoom);
            focusPoint.setLatLng([state.lat, state.lng]);
        });

        createEffect(() => {
            let { ne, sw } = Geohash.bounds(state.geohash);
            geoBox.setBounds(new LatLngBounds(sw, ne));
        });
    });

    return <div ref={mapDOM} class="background-map"></div>;
}