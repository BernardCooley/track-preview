import { BuyPlatforms, Track } from "./types";

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

export const formatBuyUrl = (track: Track, platform: BuyPlatforms) => {
    if (!track) return "";
    if (platform === "juno") {
        return `https://www.juno.co.uk/search/?q%5Ball%5D%5B%5D=${track.artist} ${track.title}&hide_forthcoming=0`;
    } else if (platform === "beatport") {
        return `https://www.beatport.com/search?q=${track.artist} ${track.title}`;
    } else if (platform === "juno download") {
        return `https://www.junodownload.com/search/?q%5Ball%5D%5B%5D=${track.artist} ${track.title}`;
    } else if (platform === "discogs") {
        return `https://www.discogs.com/search/?q=${track.artist} ${track.title}`;
    } else if (platform === "bandcamp") {
        return `https://bandcamp.com/search?q=${track.artist} ${track.title}`;
    } else if (platform === "apple music") {
        return `https://music.apple.com/search?term=${track.artist} ${track.title}`;
    }
};

export const capitaliseWords = (str: string) => {
    return str
        .split(" ")
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(" ");
};
