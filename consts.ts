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
        regions: [],
    },
    {
        platform: "juno",
        logo: "/logos/juno.jpeg",
        regions: ["GB", "IE", "FR", "DE", "NL", "BE", "ES", "IT", "PT", "AT", "CH", "SE", "NO", "DK", "FI", "PL"],
    },
    {
        platform: "rough trade",
        logo: "/logos/rough_trade.png",
        regions: ["GB", "IE", "FR", "DE", "NL", "BE", "ES", "IT", "PT", "AT", "CH", "SE", "NO", "DK", "FI", "PL"],
    },
    {
        platform: "bleep",
        logo: "/logos/bleep.png",
        regions: ["GB", "IE", "FR", "DE", "NL", "BE", "ES", "IT", "PT", "AT", "CH", "SE", "NO", "DK", "FI", "PL"],
    },
    {
        platform: "hhv",
        logo: "/logos/hhv.png",
        regions: ["DE", "AT", "CH", "NL", "BE", "FR", "ES", "IT", "PT", "SE", "NO", "DK", "FI", "PL"],
    },
    {
        platform: "dusty groove",
        logo: "/logos/dusty_groove.png",
        regions: ["US", "CA", "MX"],
    },
    {
        platform: "turntable lab",
        logo: "/logos/turntable_lab.png",
        regions: ["US", "CA", "MX"],
    },
    {
        platform: "disk union",
        logo: "/logos/disk_union.png",
        regions: ["JP"],
    },
    {
        platform: "red eye records",
        logo: "/logos/red_eye_records.png",
        regions: ["AU", "NZ"],
    },
    {
        platform: "discogs",
        logo: "/logos/discogs.jpeg",
        regions: [],
    },
    {
        platform: "bandcamp",
        logo: "/logos/bandcamp.png",
        regions: [],
    },
    {
        platform: "apple music",
        logo: "/logos/apple_music.jpeg",
        regions: [],
    },
] satisfies IBuyLink[];

