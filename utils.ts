import { BuyPlatforms, IBuyLink, Track } from "./types";

export const removeDuplicates = (arr: string[]) => {
    return arr.filter((item, index) => arr.indexOf(item) === index);
};

export const removeBracketedText = (str: string) => {
    return str.replace(/ *\([^)]*\) */g, "");
};

export const arrayRange = (start: number, stop: number, step: number) =>
    Array.from(
        { length: (stop - start) / step + 1 },
        (value, index) => start + index * step
    );

export const getCurrentYear = () => {
    return new Date().getFullYear();
};

export const getFormattedDate = (dateString: string) => {
    if (dateString && dateString.length > 0) {
        const date = new Date(dateString);
        const monthNames = [
            "Jan",
            "Feb",
            "Mar",
            "Apr",
            "May",
            "Jun",
            "Jul",
            "Aug",
            "Sept",
            "Oct",
            "Nov",
            "Dec",
        ];
        const month = monthNames[date.getMonth()];
        const day = date.getDate();
        const year = date.getFullYear() % 100;

        return `${month} ${day}, '${year < 10 ? "0" + year : year}`;
    }

    return null;
};

export const camelcaseToTitleCase = (str: string) => {
    return str
        .replace(/([A-Z])/g, " $1")
        .replace(/^./, (str) => str.toUpperCase());
};

export const formatBuyUrl = (track: Track, platform: BuyPlatforms, searchTitle?: string) => {
    if (!track) return "";
    const title = searchTitle || track.title;
    const query = `${track.artist} ${title}`;
    switch (platform) {
        case "juno":
            return `https://www.juno.co.uk/search/?q%5Ball%5D%5B%5D=${query}&hide_forthcoming=0`;
        case "beatport":
            return `https://www.beatport.com/search?q=${query}`;
        case "juno download":
            return `https://www.junodownload.com/search/?q%5Ball%5D%5B%5D=${query}`;
        case "discogs":
            return `https://www.discogs.com/search/?q=${query}`;
        case "bandcamp":
            return `https://bandcamp.com/search?q=${query}`;
        case "apple music":
            return `https://music.apple.com/search?term=${query}`;
        case "bleep":
            return `https://bleep.com/search/query?q=${track.artist}+-+${title}`;
        case "rough trade":
            return `https://www.roughtrade.com/search?q=${query}`;
        case "hhv":
            return `https://www.hhv.de/shop/en/search?q=${query}`;
        case "dusty groove":
            return `https://www.dustygroove.com/search.php?q=${query}`;
        case "turntable lab":
            return `https://www.turntablelab.com/search?q=${query}`;
        case "disk union":
            return `https://diskunion.net/portal/ct/search?q=${query}`;
        case "red eye records":
            return `https://www.redeye.com.au/search?q=${query}`;
        default:
            return "";
    }
};

export const generateSlug = (artist: string, title: string, platformId: string, genre?: string): string => {
    const parts = genre
        ? `${artist}-${title}-${platformId}-${genre}`
        : `${artist}-${title}-${platformId}`;
    return parts
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, "");
};

const specialistStoreGenres: Partial<Record<BuyPlatforms, string[]>> = {
    beatport: [
        "Deep House",
        "Techno",
        "Experimental/Electronic",
        "Coldwave/Synth",
        "Electro",
        "Disco/Nu-Disco",
        "Minimal/Tech House",
        "Electro House",
        "Balearic/Downtempo",
        "Uplifting Trance",
        "Drum & Bass / Jungle",
        "Funky/Club House",
        "Hardstyle",
        "Breakbeat",
        "Dirty Dubstep/Trap/Grime",
        "UK Garage",
        "Bass",
        "Gabba",
        "Hard Techno",
        "Footwork/Juke",
        "Deep Dubstep",
        "Hard House",
        "Progressive House",
        "DJ Tools",
        "Hard Trance",
        "Psy/Goa Trance",
        "UK Hardcore",
        "Bassline",
        "Pop Trance",
        "Dance",
        "Dubstep",
        "Electronica",
        "House",
        "Trance",
        "Broken Beat/Nu Jazz",
        "Dancehall/Ragga",
        "Dub",
        "Industrial/Noise",
    ],
    bleep: [
        "Experimental/Electronic",
        "Techno",
        "Ambient/Drone",
        "Coldwave/Synth",
        "Electro",
        "Industrial/Noise",
        "Post Rock/Experimental",
        "Modern Classical",
        "Minimal/Tech House",
        "Electronica",
        "Deep House",
        "Balearic/Downtempo",
        "Broken Beat/Nu Jazz",
        "Dub",
    ],
    juno: [
        "Deep House",
        "Techno",
        "Electro",
        "Disco/Nu-Disco",
        "Minimal/Tech House",
        "Electro House",
        "Funky/Club House",
        "Drum & Bass / Jungle",
        "Breakbeat",
        "UK Garage",
        "Bass",
        "Hard Techno",
        "Footwork/Juke",
        "Deep Dubstep",
        "Hard House",
        "Progressive House",
        "DJ Tools",
        "Hardstyle",
        "Gabba",
        "Hard Trance",
        "Psy/Goa Trance",
        "UK Hardcore",
        "Bassline",
        "Pop Trance",
        "Uplifting Trance",
        "Dance",
        "Dubstep",
        "Electronica",
        "House",
        "Trance",
        "Balearic/Downtempo",
        "Dirty Dubstep/Trap/Grime",
        "Dancehall/Ragga",
        "Dub",
        "Hip Hop/R&B",
        "Funk",
        "Soul",
        "Experimental/Electronic",
        "Coldwave/Synth",
        "Reggae Classics/Ska",
        "Roots/Lovers Rock",
    ],
    "rough trade": [
        "Indie/Alternative",
        "Post Rock/Experimental",
        "Experimental/Electronic",
        "Coldwave/Synth",
        "Electronica",
        "Ambient/Drone",
        "Modern Classical",
        "Punk",
        "Indie Rock",
        "Shoegaze",
        "New Wave",
        "Folk/World",
        "Jazz",
        "Soul",
        "Funk",
        "Hip Hop/R&B",
    ],
    hhv: [
        "Hip Hop/R&B",
        "Funk",
        "Soul",
        "Jazz",
        "Deep House",
        "Techno",
        "Electro",
        "Disco/Nu-Disco",
        "Broken Beat/Nu Jazz",
        "Balearic/Downtempo",
        "Electronica",
        "Experimental/Electronic",
        "Dub",
        "Reggae Classics/Ska",
        "Roots/Lovers Rock",
        "Dancehall/Ragga",
        "Afrobeat",
        "Latin",
        "Folk/World",
    ],
    "dusty groove": [
        "Jazz",
        "Funk",
        "Soul",
        "Hip Hop/R&B",
        "Broken Beat/Nu Jazz",
        "Latin",
        "Afrobeat",
        "Folk/World",
        "Disco/Nu-Disco",
        "Reggae Classics/Ska",
        "Roots/Lovers Rock",
        "Balearic/Downtempo",
    ],
    "turntable lab": [
        "Hip Hop/R&B",
        "Deep House",
        "Techno",
        "Electro",
        "Disco/Nu-Disco",
        "Funk",
        "Soul",
        "Jazz",
        "Indie/Alternative",
        "Electronica",
        "Experimental/Electronic",
        "Ambient/Drone",
        "Broken Beat/Nu Jazz",
    ],
    "disk union": [
        "Jazz",
        "Funk",
        "Soul",
        "Hip Hop/R&B",
        "Techno",
        "Deep House",
        "Electro",
        "Experimental/Electronic",
        "Ambient/Drone",
        "Electronica",
        "Indie/Alternative",
        "Post Rock/Experimental",
        "Punk",
        "New Wave",
        "Disco/Nu-Disco",
        "Dub",
        "Reggae Classics/Ska",
        "Folk/World",
        "Modern Classical",
    ],
    "red eye records": [
        "Indie/Alternative",
        "Jazz",
        "Funk",
        "Soul",
        "Hip Hop/R&B",
        "Electronica",
        "Deep House",
        "Techno",
        "Folk/World",
        "Punk",
        "Post Rock/Experimental",
        "Disco/Nu-Disco",
        "Reggae Classics/Ska",
        "Roots/Lovers Rock",
        "Dub",
    ],
};

export const getRelevantBuyLinks = (buyLinks: IBuyLink[], genre: string, country?: string): IBuyLink[] => {
    return buyLinks.filter((link) => {
        const allowedGenres = specialistStoreGenres[link.platform];
        const genreMatch = !allowedGenres || allowedGenres.some(
            (g) => g.toLowerCase() === genre.toLowerCase()
        );
        if (!genreMatch) return false;

        if (country && link.regions.length > 0) {
            return link.regions.includes(country);
        }
        return true;
    });
};

export const capitaliseWords = (str: string) => {
    return str
        .split(" ")
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(" ");
};
