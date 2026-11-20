const DEEZER_API = "https://api.deezer.com";

async function deezerFetch(path: string): Promise<any> {
    const res = await fetch(`${DEEZER_API}/${path}`);
    return res.json();
}

export const deezer = {
    track(id: string) {
        return deezerFetch(`track/${id}`);
    },
    search: {
        track(query: string) {
            return deezerFetch(`search/track?q=${encodeURIComponent(query)}`);
        },
    },
    chart: {
        tracks(limit: number) {
            return deezerFetch(`chart/0/tracks?limit=${limit}`);
        },
    },
};
