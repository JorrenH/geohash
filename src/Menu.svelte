<script lang="ts">
    import { latitude, longitude, precision, zoom, geohash } from "./stores";
    import { Tooltip } from "bootstrap";
    import Geohash from "./geohash";

    let corner = "center";
    let output = [0, 0];

    $: $geohash = Geohash.encode($latitude, $longitude, $precision);
    $: if (Geohash.valid($geohash)) {
        let bounds = Geohash.bounds($geohash);
        if (corner === "center") {
            output = [(bounds.sw.lat + bounds.ne.lat) / 2, (bounds.sw.lon + bounds.ne.lon) / 2 ];
        } else if (corner === "northwest") {
            output = [bounds.ne.lat, bounds.sw.lon];
        } else if (corner === "northeast") {
            output = [bounds.ne.lat,bounds.ne.lon];
        } else if (corner === "southwest") {
            output = [bounds.sw.lat, bounds.sw.lon];
        } else if (corner === "southeast") {
            output = [bounds.sw.lat, bounds.ne.lon];
        }
    }

    function setPrecision(e) {
        $precision = Math.max(1, Math.min(9, e.target.value));
    }

    function setGeohash(e) {
        let geohash = e.target.value;
        let bounds = Geohash.bounds(geohash);
        $latitude = (bounds.sw.lat + bounds.ne.lat) / 2;
        $longitude = (bounds.sw.lon + bounds.ne.lon) / 2;
        $precision = geohash.length;
    }

    let tooltip;
    function initTooltip(element) {
        tooltip = new Tooltip(element, {  trigger: "manual", boundary: document.body, placement: 'bottom' });
    }

    let tooltipTimeout;
    function copyToClipboard() {
        navigator.clipboard.writeText(output[0] + ", " + output[1]);
        if (tooltipTimeout) clearTimeout(tooltipTimeout);
        tooltipTimeout = setTimeout(() => {
            if (tooltip) tooltip.hide();
            tooltipTimeout = null;
        }, 1500);
        if (tooltip) tooltip.show();
    }
</script>

<menu class="menu card position-absolute shadow m-2">
    <div class="card-body">
        <h5 class="card-title">Input</h5>
        <div class="input-group mb-3">
            <span class="input-group-text">lat</span>
            <input bind:value={$latitude} type="number" min="-90" max="90" step="0.00001" class="form-control" placeholder="Latitude" aria-label="latitude">
            <span class="input-group-text">lon</span>
            <input bind:value={$longitude} type="number" min="-180" max="180" step="0.00001" class="form-control" placeholder="Longitude" aria-label="longitude">
        </div>
        <div class="input-group mb-3">
            <span class="input-group-text">precision</span>
            <input on:input={setPrecision} value={$precision} type="number" class="form-control" placeholder="Precision" min="1" max="9" step="1" aria-label="precision">
            <div class="input-group-text">
                <input bind:checked={$zoom} id="input-zoom" class="form-check-input mt-0" type="checkbox" value="" aria-label="Checkbox for following text input">
                <label class="ps-2" for="input-zoom"> zoom </label>
            </div>
        </div>
        <div class="input-group mb-3">
            <span class="input-group-text">geohash</span>
            <input bind:value={$geohash} on:change={setGeohash} type="text" class="form-control" placeholder="Geohash" aria-label="geohash">
        </div>
        <h5 class="card-title">Output</h5>
        <div class="bounds position-relative m-5">
            <input id="corner-nw" type="radio" class="btn-check" name="corner" value="northwest" bind:group={corner}>
            <label class="btn btn-outline-primary position-absolute top-0 start-0 translate-middle" for="corner-nw">northwest</label>

            <input id="corner-ne" type="radio" class="btn-check" name="corner" value="northeast" bind:group={corner}>
            <label class="btn btn-outline-primary position-absolute top-0 start-100 translate-middle" for="corner-ne">northeast</label>

            <input  id="corner-ct" type="radio" class="btn-check" name="corner" value="center" bind:group={corner}>
            <label class="btn btn-outline-primary position-absolute top-50 start-50 translate-middle" for="corner-ct">center</label>

            <input id="corner-sw" type="radio" class="btn-check" name="corner" value="southwest" bind:group={corner}>
            <label class="btn btn-outline-primary position-absolute top-100 start-0 translate-middle" for="corner-sw">southwest</label>

            <input id="corner-se" type="radio" class="btn-check"  name="corner" value="southeast" bind:group={corner}>
            <label class="btn btn-outline-primary position-absolute top-100 start-100 translate-middle" for="corner-se">southeast</label>
        </div>
        <div class="input-group mb-3">
            <span class="input-group-text">lat</span>
            <input bind:value={output[0]} type="number" class="form-control output" step="0.00001" placeholder="Latitude" aria-label="latitude" readonly>
            <span class="input-group-text">lon</span>
            <input bind:value={output[1]} type="number" class="form-control output" step="0.00001" placeholder="Longitude" aria-label="longitude" readonly>
            <button on:click={copyToClipboard} use:initTooltip class="copy input-group-text material-icons" data-bs-toggle="tooltip" data-bs-placement="top" title="Copied to clipboard!">assignment</button>

        </div>
        <p class="text-sm-center mb-0"> © {new Date().getFullYear()} — Jorren Hendriks </p>
    </div>
</menu>

<style>

    button.copy {
        color: #666;
    }

    button.copy:hover, button.copy:active {
        background: #d5d7da;
    }

    input[readonly] {
        background: white;
    }

    .menu {
        z-index: 1000;
        padding: 0;
        width: 20vw;
        min-width: 300px;
    }

    .bounds {
        height: 140px;
        border: 1px solid rgba(0, 0, 0, 0.2);
    }

    .bounds * {
        background: white;
    }

    .bounds *:hover, .bounds *:active, .bounds *:focus {
        background: var(--bs-primary);
    }

    /* Chrome, Safari, Edge, Opera */
    input.output::-webkit-outer-spin-button,
    input.output::-webkit-inner-spin-button {
        -webkit-appearance: none;
        margin: 0;
    }

    /* Firefox */
    input.output[type=number] {
        -moz-appearance: textfield;
    }

</style>

