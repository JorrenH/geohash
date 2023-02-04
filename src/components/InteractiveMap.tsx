
import { createEffect, createMemo, createSignal, onMount } from 'solid-js';
import { map as leaflet, control, marker, divIcon, svgOverlay, tileLayer, LatLngBounds } from 'leaflet';
import type { Map as Leaflet, Marker, SVGOverlay } from 'leaflet';

import { state, setState } from "../store/state";
import Geohash from '../geohash';

import './InteractiveMap.css';

type Pos = [number, number];

const xMin = -6, xMax = 6;
const yMin = -5, yMax = 5;

export default function InteractiveMap() {
    let mapDOM : HTMLDivElement | undefined, 
        map: Leaflet,
        focusPoint: Marker;
    let geoBoxes: Record<string, SVGOverlay> = {};
    
    let [boxWidth, setBoxWidth] = createSignal(0);
    let geohashes = createMemo(() => {
        return getProximity(state.geohash, [0, 0]);
    });

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

        for (let pos of Object.keys(geohashes())) {
            let opacity = opacityAt(pos);
            geoBoxes[pos] = svgOverlay(<svg>
                <rect width="100%" height="100%" 
                    stroke="#0d6efd" stroke-opacity={0.8 * opacity} stroke-width="2" stroke-linecap="round" stroke-linejoin="round" 
                    fill="#0d6efd" fill-opacity={0.2 * opacity}></rect>
                <text fill={pos === '0,0' ? '#343a40' : '#6c757d'} x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" 
                    font-size={(boxWidth() / state.geohash.length) + 'px'} font-weight="bold" opacity={opacity}>{geohashes()[pos].toUpperCase()}</text>
            </svg> as SVGElement, [[0, 0], [0, 0]]).addTo(map);
        }

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
            if (state.zoom) setState.precision(Math.round(e.target.getZoom() / 2.5));
            setBoxWidth(geoBoxes['0,0'].getElement()?.getBoundingClientRect().width || 0);
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
            for (let [pos,geohash] of Object.entries(geohashes())) {
                let { ne, sw } = Geohash.bounds(geohash);
                geoBoxes[pos].setBounds(new LatLngBounds(sw, ne));
            }
        });
    });
    
    function opacityAt(pos: string) : number {
        let [x, y] = pos.split(',');
        return 1 - (Math.abs(Number.parseInt(x)) + Math.abs(Number.parseInt(y))) / 10;
    }

    function getProximity(geohash: string, pos: Pos) : Record<string, string> {
        let [x, y] = pos;
        let result = { [`${x},${y}`]: geohash };
    
        if (y == 0 && x <= 0 && x > xMin) {
            Object.assign(result, getProximity(Geohash.adjacent(geohash, 'w'), [x-1, y]));
        }
        if (y == 0 && x >= 0 && x < xMax) {
            Object.assign(result, getProximity(Geohash.adjacent(geohash, 'e'), [x+1, y]));
        }
        if (y <= 0 && y > yMin) {
            Object.assign(result, getProximity(Geohash.adjacent(geohash, 'n'), [x, y-1]));
        }
        if (y >= 0 && y < yMax) {
            Object.assign(result, getProximity(Geohash.adjacent(geohash, 's'), [x, y+1]));
        }
        return result;
    }

    return <div ref={mapDOM} class="background-map"></div>;
}