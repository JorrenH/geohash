import { createEffect } from "solid-js";
import { createFluentStore } from "solid-fluent-store";

import Geohash from "../geohash";

export type Corner = 'center' | 'northwest' | 'northeast' | 'southwest' | 'southeast';

const [ state, setState ] = createFluentStore({
    lat: 52.0906548,
    lng: 5.1213056,
    precision: 5,
    zoom: true,
    geohash: '',
    corner: 'center' as Corner,
    get latitude() { return truncate(this.lat) },
    get longitude() { return truncate(this.lng) },
    get cornerLatitude() { return truncate(getCorner(this.geohash, this.corner, 'lat')); },
    get cornerLongitude() { return truncate(getCorner(this.geohash, this.corner, 'lng')); },
});

function truncate(nr: number, precision: number = 10) : number {
    return Number.parseFloat(nr.toFixed(precision));
}

function getCorner(geohash: string, corner: Corner, type: 'lat' | 'lng') : number {
    let { sw, ne } = Geohash.bounds(geohash);
    switch (corner) {
        case 'center':
            return type === 'lat' ? state.lat : state.lng;
        case 'northwest':
            return type === 'lat' ? sw.lat : ne.lng;
        case 'northeast':
            return type === 'lat' ? ne.lat : ne.lng;
        case 'southwest':
            return type === 'lat' ? sw.lat : sw.lng;
        case 'southeast':
            return type === 'lat' ? ne.lat : sw.lng; 
    }
}

createEffect(() => {
    setState.geohash(Geohash.encode(state.lat, state.lng, state.precision));
});

export { state, setState };