import { createEffect } from "solid-js";
import { createStore } from "solid-js/store";

import Geohash from "../geohash";

const [ state, setState ] = createStore({
    lat: 52.0906548,
    lng: 5.1213056,
    precision: 5,
    zoom: true,
    geohash: '',
    get latitude() { return Number.parseFloat(this.lat.toFixed(10)) },
    get longitude() { return Number.parseFloat(this.lng.toFixed(10)) },
});

createEffect(() => {
    setState('geohash', Geohash.encode(state.lat, state.lng, state.precision));
});

export { state, setState };