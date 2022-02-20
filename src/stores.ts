import { writable } from 'svelte/store';

export const latitude = writable(52.0906548);
export const longitude = writable(5.1213056);
export const precision = writable(5);
export const zoom = writable(true);
export const geohash = writable("");