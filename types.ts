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

export interface IArtist {
    anv: string;
    id: number;
    join: string;
    name: string;
    resource_url: string;
    role: string;
    tracks: string;
}

export interface IContributer {
    resource_url: string;
    username: string;
}

export interface IRating {
    average: number;
    count: number;
}

export interface ISubmitter {
    resource_url: string;
    username: string;
}

export interface ICommunity {
    contributors: IContributer[];
    data_quality: string;
    have: number;
    rating: IRating;
    status: string;
    submitter: ISubmitter;
    want: number;
}

export interface ICompany {
    catno: string;
    entity_type: number;
    entity_type_name: string;
    id: number;
    name: string;
    resource_url: string;
}

export interface IFormat {
    descriptions: string[];
    name: string;
    qty: string;
}

export interface IIdentifier {
    type: string;
    value: string;
}

export interface IImage {
    height: number;
    resource_url: string;
    type: string;
    uri: string;
    uri150: string;
    width: number;
}

export interface ILabel {
    catno: string;
    entity_type: string;
    id: number;
    name: string;
    resource_url: string;
}

export interface ITracklistTrack {
    duration: string;
    position: string;
    title: string;
    type_: string;
}

export interface IVideo {
    description: string;
    duration: number;
    embed: true;
    title: string;
    uri: string;
}

export interface IRelease {
    title: string;
    id: number;
    artists: IArtist[];
    data_quality: string;
    thumb: string;
    community: ICommunity;
    companies: ICompany[];
    country: string;
    date_added: string;
    date_changed: string;
    estimated_weight: number;
    extraartists: IArtist[];
    format_quantity: number;
    formats: IFormat[];
    genres: string[];
    identifiers: IIdentifier[];
    images: IImage[];
    labels: ILabel[];
    lowest_price: number;
    master_id: number;
    master_url: string;
    notes: string;
    num_for_sale: number;
    released: string;
    released_formatted: string;
    resource_url: string;
    series: [];
    status: string;
    styles: string[];
    tracklist: ITracklistTrack[];
    uri: string;
    videos: IVideo[];
    year: number;
}
