
export function searchParams() : Record<string,string> {
    return Object.fromEntries(new URLSearchParams(window.location.search));
}

export function setSearchParam(key: string, value: string) {
    const newParams = {...searchParams()};
    newParams[key] = value;
    window.history.pushState(undefined, '', '?' + new URLSearchParams(newParams).toString());
}
