<script lang="ts">
    import { latitude, longitude, precision, zoom, geohash } from "./stores"

	import L from "leaflet";
    import Menu from "./Menu.svelte";
    import Geohash from "./geohash";

	let map, marker, bounds, label;

    $: if (map) map.panTo([$latitude, $longitude]);
    $: if (marker) marker.setLatLng([$latitude, $longitude]);
    $: if (Geohash.valid($geohash)) {
        let bb = Geohash.bounds($geohash);
        if (bounds) bounds.setBounds(L.latLngBounds([[bb.ne.lat, bb.sw.lon], [bb.sw.lat, bb.ne.lon]]));
        if (label) label.setLatLng([(bb.ne.lat + bb.sw.lat) / 2, (bb.ne.lon + bb.sw.lon) / 2])
            .setIcon(labelIcon($geohash.toUpperCase()));
    }
    let url = new URL(window.location.href);
    if (url.hash) {
        const [lat, lon, prc] = url.hash.substr(1).split(",");
        if (isFinite(Number(lat))) $latitude = Number(lat);
        if (isFinite(Number(lon))) $longitude = Number(lon);
        if (isFinite(Number(prc))) $precision = Number(prc);
    }
    $: {
        url.hash = $latitude + "," + $longitude + "," + $precision;
        window.location.href = url.toString();
    }

	function initMap(container) {
		let initialPosition = [$latitude, $longitude];

		map = L.map(container, {
			center: initialPosition,
			zoom: 12,
			maxZoom: 19,
			minZoom: 2,
			zoomControl: false
		});

		L.control.zoom({
			position: 'topright'
		}).addTo(map);

		L.tileLayer('https://{s}.tile.osm.org/{z}/{x}/{y}.png', {
			maxZoom: 20,
			attribution: '&copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors'
		}).addTo(map);

        marker = L.marker([0, 0], { icon: markerIcon("⏺") }).addTo(map);
        bounds = L.rectangle([[0,0], [0,0]], { color: "#0d6efd", fillOpacity: 0.1 }).addTo(map);
        label = L.marker([0, 0], { icon: labelIcon("null") }).addTo(map);

        map.on('zoom', function(e) {
            if ($zoom) $precision = Math.round(e.target.getZoom() / 2.5);
            map.panTo([$latitude, $longitude], { animate: false });
        });

        map.on('click', function(e) {
            let {lat, lng} = e.latlng;
            $latitude = lat;
            $longitude = lng;
        });
	}

    function labelIcon(label: String) {
        return L.divIcon({ className: `marker`, html: `<div class="marker label"> ${label} </div>`});
    }

    function markerIcon(label: String) {
        return L.divIcon({ className: `marker`, html: `
            <div class="marker base blue">
              <span class="marker text">${label}</span>
            </div>
        `});
    }
</script>

<Menu/>
<div class="map" use:initMap></div>

<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap@5.1.3/dist/css/bootstrap.min.css">
<link rel="stylesheet" href="https://unpkg.com/leaflet@1.7.1/dist/leaflet.css"/>
<link rel="stylesheet" href="https://fonts.googleapis.com/icon?family=Material+Icons" >

<style>
	.map {
        position: absolute;
		width: 100vw;
		height: 100vh;
	}
</style>
