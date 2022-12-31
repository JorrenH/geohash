import { createEffect, createSignal, onMount } from "solid-js";
import { state, setState, Corner } from "../store/state";
import { Collapse, Tooltip } from 'bootstrap';
import Geohash from "../geohash";

import github_mark from '../assets/github-mark.svg';
import './Menu.scss';

export default function Menu() {
    let zoomDOM: HTMLLabelElement | undefined,
        collapseDOM: HTMLDivElement | undefined,
        copyDOM: HTMLButtonElement | undefined;

    let [collapsed, toggleCollapsed] = createSignal(window.innerWidth < 600);
    let showClipboardTooltip: () => void;

    onMount(() => {
        // zoom tooltip
        new Tooltip(zoomDOM!, {
            title: 'Adjust precision according to map zoom',
            placement: 'right',
        });

        // clipboard tooltip
        let clipboardTooltip = new Tooltip(copyDOM!, {
            title: 'Copied to clipboard!',
            placement: 'top',
            trigger: 'manual',
        });
        let clipboardTooltipTimeout: any;
        showClipboardTooltip = () => {
            if (clipboardTooltipTimeout) clearTimeout(clipboardTooltipTimeout);
            else clipboardTooltip.show();

            clipboardTooltipTimeout = setTimeout(() => {
                clipboardTooltip.hide();
                clipboardTooltipTimeout = undefined;
            }, 1000);
        };

        // collapse
        let collapse = new Collapse(collapseDOM!, { toggle: !collapsed() });
        createEffect(() => {
            if (collapsed()) collapse.hide(); else collapse.show();
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

    function selectCorner(e: Event & { currentTarget: HTMLInputElement }) {
        setState('corner', e.currentTarget.value as Corner);
    }

    function copyToClipboard() {
        navigator.clipboard.writeText(state.cornerLatitude + ", " + state.cornerLongitude);
        showClipboardTooltip();
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
                        value={state.geohash} onInput={persistGeohash}/>
                </div>
                <hr/>
                <button onClick={() => toggleCollapsed(!collapsed())} class="btn position-absolute end-0 me-3 material-icons"> {collapsed() ? 'expand_more' : 'expand_less'} </button>
                <h5 class="card-title">Output</h5>
                <div class="collapse" ref={collapseDOM}>
                    <div class="bounds position-relative m-5">
                        <input id="corner-nw" type="radio" class="btn-check" name="corner" value="northwest" onChange={selectCorner} />
                        <label class="btn btn-outline-primary position-absolute top-0 start-0 translate-middle" for="corner-nw">northwest</label>

                        <input id="corner-ne" type="radio" class="btn-check" name="corner" value="northeast" onChange={selectCorner} />
                        <label class="btn btn-outline-primary position-absolute top-0 start-100 translate-middle" for="corner-ne">northeast</label>

                        <input  id="corner-ct" type="radio" class="btn-check" name="corner" value="center" onChange={selectCorner} checked />
                        <label class="btn btn-outline-primary position-absolute top-50 start-50 translate-middle" for="corner-ct">center</label>

                        <input id="corner-sw" type="radio" class="btn-check" name="corner" value="southwest" onChange={selectCorner} />
                        <label class="btn btn-outline-primary position-absolute top-100 start-0 translate-middle" for="corner-sw">southwest</label>

                        <input id="corner-se" type="radio" class="btn-check"  name="corner" value="southeast" onChange={selectCorner} />
                        <label class="btn btn-outline-primary position-absolute top-100 start-100 translate-middle" for="corner-se">southeast</label>
                    </div>
                    <div class="input-group mb-3">
                        <span class="input-group-text">lat</span>
                        <input value={state.cornerLatitude} type="number" class="form-control output" step="0.00001" placeholder="Latitude" lang="en-150" aria-label="latitude" readonly />
                        <span class="input-group-text">lon</span>
                        <input value={state.cornerLongitude} type="number" class="form-control output" step="0.00001" placeholder="Longitude" lang="en-150" aria-label="longitude" readonly />
                        <button ref={copyDOM} onClick={copyToClipboard} class="copy input-group-text material-icons" data-bs-toggle="tooltip" data-bs-placement="top" title="Copied to clipboard!">assignment</button>
                    </div>
                </div>
                <p class="text-sm-center mb-0"> 
                    © {new Date().getFullYear()} — Jorren Hendriks 
                    <a class="ms-3" title="Github - Source code" href="https://github.com/JorrenH/geohash">
                        <img alt="github logo" src={github_mark} width={30} height={30}/>
                    </a>
                </p>
                
            </menu>
        </div>
    );
}
