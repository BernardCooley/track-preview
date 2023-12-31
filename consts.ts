import { Decades, IBuyLink } from "./types";
import { getCurrentYear } from "./utils";

export const decades = [
    {
        title: "60s",
        from: 1960,
        to: 1969,
    },
    {
        title: "70s",
        from: 1970,
        to: 1979,
    },
    {
        title: "80s",
        from: 1980,
        to: 1989,
    },
    {
        title: "90s",
        from: 1990,
        to: 1999,
    },
    {
        title: "00s",
        from: 2000,
        to: 2009,
    },
    {
        title: "10s",
        from: 2010,
        to: 2019,
    },
    {
        title: "20s",
        from: 2020,
        to: getCurrentYear(),
    },
] satisfies Decades[];

export const buyLinks = [
    {
        platform: "beatport",
        logo: "/logos/beatport.png",
    },
    {
        platform: "juno download",
        logo: "/logos/juno_download.jpeg",
    },
    {
        platform: "juno",
        logo: "/logos/juno.jpeg",
    },
    {
        platform: "discogs",
        logo: "/logos/discogs.jpeg",
    },
    {
        platform: "bandcamp",
        logo: "/logos/bandcamp.png",
    },
    {
        platform: "apple music",
        logo: "/logos/apple_music.jpeg",
    },
] satisfies IBuyLink[];
