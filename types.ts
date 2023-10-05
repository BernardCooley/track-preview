import { CommunityStatusesEnum, DataQualityEnum } from "discojs";

export interface ReleaseTrack {
    artist: string;
    title: string;
    releaseId: number;
}

export interface ITrack {
    artist: string;
    title: string;
    previewUrl: string;
    id: string;
    thumbnail: string;
    release: {
        url: string;
        discogsReleaseId: number;
    };
    genre: string;
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
    artists_sort: string;
}

export interface IPagination {
    page: number;
    pages: number;
    per_page: number;
    items: number;
    urls: {
        last: string;
        next: string;
    };
}

export interface IReleaseResponse {
    pagination: IPagination;
    results: IRelease[];
}

export type GetRelease = {
    resource_url: string;
} & {
    extraartists?:
        | ({
              resource_url: string;
          } & {
              id: number;
              name: string;
              anv: string;
              join: string;
              role: string;
              tracks: string;
          })[]
        | undefined;
    genres?: string[] | undefined;
    styles?: string[] | undefined;
    country?: string | undefined;
    notes?: string | undefined;
    released?: string | undefined;
    released_formatted?: string | undefined;
    tracklist?:
        | {
              type_: string;
              title: string;
              position: string;
              duration: string;
          }[]
        | undefined;
    master_id?: number | undefined;
    master_url?: string | undefined;
    estimated_weight?: number | undefined;
    images?:
        | ({
              resource_url: string;
          } & {
              type: "primary" | "secondary";
              width: number;
              height: number;
              uri: string;
              uri150: string;
          })[]
        | undefined;
    videos?:
        | {
              title: string;
              description: string;
              duration: number;
              embed: boolean;
              uri: string;
          }[]
        | undefined;
} & {
    id: number;
    title: string;
    artists: ({
        resource_url: string;
    } & {
        id: number;
        name: string;
        anv: string;
        join: string;
        role: string;
        tracks: string;
    })[];
    formats: {
        name: string;
        qty: string;
    }[];
    year: number;
    format_quantity: number;
    identifiers: {
        type: string;
        value: string;
    }[];
    labels: ({
        resource_url: string;
    } & {
        id: number;
        name: string;
        entity_type: string;
        entity_type_name: string;
        catno: string;
    })[];
    companies: ({
        resource_url: string;
    } & {
        id: number;
        name: string;
        entity_type: string;
        entity_type_name: string;
        catno: string;
    })[];
    series: ({
        resource_url: string;
    } & {
        id: number;
        name: string;
        entity_type: string;
        entity_type_name: string;
        catno: string;
    })[];
    thumb: string;
    lowest_price: number | null;
    num_for_sale: number;
    date_added: string;
    date_changed: string;
    data_quality: DataQualityEnum;
    status: CommunityStatusesEnum.ACCEPTED;
    community: {
        have: number;
        want: number;
        rating: {
            count: number;
            average: number;
        };
        submitter: {
            resource_url: string;
        } & {
            username: string;
        };
        contributors: ({
            resource_url: string;
        } & {
            username: string;
        })[];
        data_quality: DataQualityEnum;
        status: CommunityStatusesEnum.ACCEPTED;
    };
    uri: string;
};

export type ExtendedGetRelease = GetRelease & { artists_sort: string };

export interface UserData {
    email?: string;
    name?: string;
    preferredGenre: string;
    tracks: {
        id: string;
        step: number;
        furthestStep: number;
        genre: string;
    }[];
}

export interface UserTrack {
    id: string;
    step: number;
    furthestStep: number;
    genre: string;
}