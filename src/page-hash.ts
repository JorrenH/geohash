import { createEffect, createSignal } from "solid-js";

export function usePageHash() {
    const [hash, setter] = createSignal('');
    const setHash = (hash: string) => {
        setter(hash.replaceAll('#', '').toLowerCase());
    };
    setHash(window.location.hash);
    window.addEventListener('hashchange', () => {
        setHash(window.location.hash)
    });

    createEffect(() => {
        if (window.location.hash !== '#' + hash()) window.history.pushState(undefined, '', '#' + hash());
    });

    return [hash, setHash] as const;
}