import { describe, it, expect } from "vitest";
import {
    removeDuplicates,
    removeBracketedText,
    arrayRange,
    getFormattedDate,
    camelcaseToTitleCase,
    formatBuyUrl,
    generateSlug,
    getRelevantBuyLinks,
    capitaliseWords,
} from "../utils";
import type { Track, IBuyLink } from "../types";

const track: Track = {
    id: "t1",
    title: "Morning Light",
    artist: "Solar Fields",
    genre: "Techno",
    releaseTitle: "Album",
    releaseYear: 2023,
    releaseDate: "2023-01-01",
    thumbnail: "",
    purchaseUrl: "",
    platform: "spotify",
    platformId: "sp-1",
};

describe("removeDuplicates", () => {
    it("removes duplicate strings", () => {
        expect(removeDuplicates(["a", "b", "a", "c", "b"])).toEqual(["a", "b", "c"]);
    });

    it("returns empty array for empty input", () => {
        expect(removeDuplicates([])).toEqual([]);
    });

    it("preserves order of first occurrence", () => {
        expect(removeDuplicates(["c", "a", "c", "b"])).toEqual(["c", "a", "b"]);
    });
});

describe("removeBracketedText", () => {
    it("removes parenthesized text", () => {
        expect(removeBracketedText("Track Name (Remix)")).toBe("Track Name");
    });

    it("removes multiple bracketed sections", () => {
        expect(removeBracketedText("Name (feat. X) (Remix)")).toBe("Name");
    });

    it("returns original if no brackets", () => {
        expect(removeBracketedText("Track Name")).toBe("Track Name");
    });
});

describe("arrayRange", () => {
    it("generates range with step 1", () => {
        expect(arrayRange(1, 5, 1)).toEqual([1, 2, 3, 4, 5]);
    });

    it("generates range with step 10", () => {
        expect(arrayRange(0, 30, 10)).toEqual([0, 10, 20, 30]);
    });

    it("returns single element when start equals stop", () => {
        expect(arrayRange(5, 5, 1)).toEqual([5]);
    });
});

describe("getFormattedDate", () => {
    it("formats a date string", () => {
        const result = getFormattedDate("2023-06-15");
        expect(result).toMatch(/Jun 15/);
    });

    it("returns null for empty string", () => {
        expect(getFormattedDate("")).toBeNull();
    });

    it("pads year with leading zero for years < 2010", () => {
        const result = getFormattedDate("2005-01-01");
        expect(result).toContain("'05");
    });
});

describe("camelcaseToTitleCase", () => {
    it("converts camelCase to Title Case", () => {
        expect(camelcaseToTitleCase("releaseTitle")).toBe("Release Title");
    });

    it("handles single word", () => {
        expect(camelcaseToTitleCase("title")).toBe("Title");
    });

    it("handles multiple capitals", () => {
        expect(camelcaseToTitleCase("releaseDate")).toBe("Release Date");
    });
});

describe("formatBuyUrl", () => {
    it("generates juno URL", () => {
        const url = formatBuyUrl(track, "juno");
        expect(url).toContain("juno.co.uk");
        expect(url).toContain("Solar Fields");
        expect(url).toContain("Morning Light");
    });

    it("generates beatport URL", () => {
        const url = formatBuyUrl(track, "beatport");
        expect(url).toContain("beatport.com");
    });

    it("generates discogs URL", () => {
        const url = formatBuyUrl(track, "discogs");
        expect(url).toContain("discogs.com");
    });

    it("generates bandcamp URL", () => {
        const url = formatBuyUrl(track, "bandcamp");
        expect(url).toContain("bandcamp.com");
    });

    it("generates apple music URL", () => {
        const url = formatBuyUrl(track, "apple music");
        expect(url).toContain("music.apple.com");
    });

    it("generates bleep URL", () => {
        const url = formatBuyUrl(track, "bleep");
        expect(url).toContain("bleep.com");
    });

    it("generates juno download URL", () => {
        const url = formatBuyUrl(track, "juno download");
        expect(url).toContain("junodownload.com");
    });
});

describe("generateSlug", () => {
    it("generates a lowercase hyphenated slug", () => {
        const slug = generateSlug("Solar Fields", "Morning Light", "sp-1");
        expect(slug).toBe("solar-fields-morning-light-sp-1");
    });

    it("includes genre when provided", () => {
        const slug = generateSlug("Artist", "Title", "id", "Techno");
        expect(slug).toBe("artist-title-id-techno");
    });

    it("strips special characters", () => {
        const slug = generateSlug("Artist & Co.", "Track (Remix)", "id-1");
        expect(slug).toBe("artist-co-track-remix-id-1");
    });

    it("trims leading and trailing hyphens", () => {
        const slug = generateSlug("", "Track", "id");
        expect(slug).not.toMatch(/^-/);
        expect(slug).not.toMatch(/-$/);
    });
});

describe("getRelevantBuyLinks", () => {
    const allLinks: IBuyLink[] = [
        { platform: "beatport", logo: "/logos/beatport.png" },
        { platform: "juno", logo: "/logos/juno.jpeg" },
        { platform: "discogs", logo: "/logos/discogs.jpeg" },
        { platform: "bandcamp", logo: "/logos/bandcamp.png" },
        { platform: "apple music", logo: "/logos/apple_music.jpeg" },
        { platform: "bleep", logo: "/logos/bleep.png" },
    ];

    it("returns specialist stores for Techno", () => {
        const links = getRelevantBuyLinks(allLinks, "Techno");
        const platforms = links.map((l) => l.platform);
        expect(platforms).toContain("beatport");
        expect(platforms).toContain("bleep");
    });

    it("excludes specialist stores for unrelated genres", () => {
        const links = getRelevantBuyLinks(allLinks, "Country");
        const platforms = links.map((l) => l.platform);
        expect(platforms).not.toContain("beatport");
        expect(platforms).not.toContain("bleep");
        expect(platforms).not.toContain("juno");
    });

    it("always includes general stores", () => {
        const links = getRelevantBuyLinks(allLinks, "Country");
        const platforms = links.map((l) => l.platform);
        expect(platforms).toContain("discogs");
        expect(platforms).toContain("bandcamp");
        expect(platforms).toContain("apple music");
    });
});

describe("capitaliseWords", () => {
    it("capitalises each word", () => {
        expect(capitaliseWords("hello world")).toBe("Hello World");
    });

    it("handles single word", () => {
        expect(capitaliseWords("hello")).toBe("Hello");
    });
});
