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
    if (platform === "juno") {
        return `https://www.juno.co.uk/search/?q%5Ball%5D%5B%5D=${track.artist} ${title}&hide_forthcoming=0`;
    } else if (platform === "beatport") {
        return `https://www.beatport.com/search?q=${track.artist} ${title}`;
    } else if (platform === "juno download") {
        return `https://www.junodownload.com/search/?q%5Ball%5D%5B%5D=${track.artist} ${title}`;
    } else if (platform === "discogs") {
        return `https://www.discogs.com/search/?q=${track.artist} ${title}`;
    } else if (platform === "bandcamp") {
        return `https://bandcamp.com/search?q=${track.artist} ${title}`;
    } else if (platform === "apple music") {
        return `https://music.apple.com/search?term=${track.artist} ${title}`;
    } else if (platform === "bleep") {
        return `https://bleep.com/search/query?q=${track.artist}+-+${title}`;
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
};

export const getRelevantBuyLinks = (buyLinks: IBuyLink[], genre: string): IBuyLink[] => {
    return buyLinks.filter((link) => {
        const allowedGenres = specialistStoreGenres[link.platform];
        if (!allowedGenres) return true;
        return allowedGenres.some(
            (g) => g.toLowerCase() === genre.toLowerCase()
        );
    });
};

export const capitaliseWords = (str: string) => {
    return str
        .split(" ")
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(" ");
};
