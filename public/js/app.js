import Geohash from "./geohash.js";

var map = L.map('map', {
    maxZoom: 19,
    minZoom: 2,
    zoomControl: false
}).setView([52.09065486038299, 5.121305635451483], 12);

L.control.zoom({
    position: 'topright'
}).addTo(map);

L.tileLayer('http://{s}.tile.osm.org/{z}/{x}/{y}.png', {
    maxZoom: 20,
    attribution: '&copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors'
}).addTo(map);

let icon = L.divIcon({
    className: `marker`, html: `
  <div class="marker base blue">
    <span class="marker text">⏺</span>
  </div>
`});
let marker = L.marker([0, 0], { icon }).addTo(map);

let labelIcon = L.divIcon({
    className: `marker`, html: `
    <div class="marker label"> U155K </div>
    `});

let label = L.marker([0,0], { icon: labelIcon }).addTo(map);



let bounds = L.rectangle([[0, 0], [0, 0]], {color: 'blue', weight: 1}).addTo(map);

function computeGeoHash() {
    let lat = document.getElementById("input-lat").value;
    let lon = document.getElementById("input-lon").value;
    let precision = document.getElementById("input-prc").value;
    let geohash = Geohash.encode(lat, lon, precision);
    document.getElementById("input-ghs").value = geohash;
    let bb = Geohash.bounds(geohash);
    bounds.setBounds(L.latLngBounds([[bb.sw.lat, bb.sw.lon], [bb.ne.lat, bb.ne.lon]]));
    label.setLatLng([(bb.sw.lat + bb.ne.lat) / 2, (bb.sw.lon + bb.ne.lon) / 2]);
}

map.on('click', function (e) {
    let {lat, lng} = e.latlng;
    document.getElementById("input-lat").value = lat;
    document.getElementById("input-lon").value = lng;
    marker.setLatLng([lat, lng]);
    computeGeoHash();
});

map.on('zoom', function (e) {
    let zoom = e.target.getZoom();
    document.getElementById("input-prc").value = Math.round(zoom / 2.5);
    computeGeoHash();
});