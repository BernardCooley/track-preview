export interface IRelease {
    title: string;
    url: string;
}

export interface ITrack {
    artist: string;
    title: string;
    release: IRelease;
    previewUrl: string;
    listened: boolean;
    liked: boolean;
    id: string;
}