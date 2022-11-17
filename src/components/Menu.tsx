import { onMount } from "solid-js";
import { state, setState } from "../store/state";
import { Tooltip } from 'bootstrap';
import Geohash from "../geohash";

export default function Menu() {
    let zoomDOM: HTMLLabelElement | undefined;

    onMount(() => {
        new Tooltip(zoomDOM!, {
            title: 'Adjust precision according to map zoom',
            placement: 'right',
         });
    })
    
    function persistGeohash(e: Event & { currentTarget: HTMLInputElement }) {
        let geohash = e.currentTarget.value;
        if (Geohash.valid(geohash)) {
            setState({ geohash, ...Geohash.decode(geohash), precision: geohash.length });
        } else {
            setState('geohash', Geohash.encode(state.lat, state.lng, state.precision));
        }
    }

    return (
        <div class="card m-3" style="max-width: 28rem;">
            <menu class="card-body">
                <h5 class="card-title">Input</h5>
                <div class="input-group mb-3">
                    <span class="input-group-text">lat</span>
                    <input class="form-control" type="number" min={-90} max={90} step={0.00001} lang="en-150" placeholder="Latitude" aria-label="latitude"
                        value={state.latitude} onInput={e => setState('lat', Number.parseFloat(e.currentTarget.value)) }/>
                    <span class="input-group-text">lon</span>
                    <input class="form-control" type="number" min={-180} max={180} step={0.00001} lang="en-150" placeholder="Longitude" aria-label="longitude"
                        value={state.longitude} onInput={e => setState('lng', Number.parseFloat(e.currentTarget.value)) }/>
                </div>
                <div class="input-group mb-3">
                    <span class="input-group-text">precision</span>
                    <input class="form-control" type="number" min={1} max={9} step={1} placeholder="Precision" aria-label="precision"
                        value={state.precision} onInput={e => setState('precision', Number.parseInt(e.currentTarget.value)) }/>
                    <div class="input-group-text">
                        <input id="input-zoom" class="form-check-input mt-0" type="checkbox" aria-label="Checkbox for following text input" 
                            checked={state.zoom} onInput={e => setState('zoom', e.currentTarget.checked) }/>
                        <label class="ps-2" for="input-zoom" ref={zoomDOM}> zoom </label>
                    </div>
                </div>
                <div class="input-group mb-3">
                    <span class="input-group-text">geohash</span>
                    <input class="form-control" type="text" placeholder="Geohash" aria-label="geohash"
                        value={state.geohash} /*onInput={modifyGeohash}*/ onInput={persistGeohash}/>
                </div>
                <hr/>
            </menu>
        </div>
    );
}
