import prisma from "@/lib/prisma";
import { notifyDiscord } from "@/lib/notifyDiscord";
import { deezer } from "@/lib/deezer";
import { NextResponse } from "next/server";
import { genres } from "../../../../../data/genres";
import { deezerGenreMap, appGenreToDeezerIds } from "../../../../../data/deezerGenreMap";

const CONCURRENCY = 5;

const genreSearchTerms: Record<string, string[]> = {
    "Rock": ["rock music", "classic rock", "rock band"],
    "Metal": ["metal music", "thrash metal", "death metal"],
    "Heavy Metal": ["heavy metal", "iron maiden", "metal band"],
    "Hip Hop/R&B": ["hip hop", "r&b", "rap music"],
    "Soul": ["soul music", "northern soul", "neo soul"],
    "Funk": ["funk music", "funk band", "funky"],
    "Soundtracks": ["movie soundtrack", "film score", "original soundtrack"],
    "Techno": ["techno music", "detroit techno", "techno DJ"],
    "Punk/Hardcore": ["punk rock", "hardcore punk", "punk band"],
    "Psych/Garage Rock": ["psychedelic rock", "garage rock", "psych rock"],
    "Experimental/Electronic": ["experimental electronic", "avant-garde electronic"],
    "50s/60s": ["60s hits", "50s rock and roll", "60s pop"],
    "Coldwave/Synth": ["coldwave", "synthwave", "synth pop"],
    "Industrial/Noise": ["industrial music", "noise rock", "industrial band"],
    "Ambient/Drone": ["ambient music", "drone ambient", "ambient electronic"],
    "Progressive Rock": ["progressive rock", "prog rock"],
    "Disco/Nu-Disco": ["nu disco", "disco funk", "disco music"],
    "Reggae Classics/Ska": ["reggae classics", "ska music", "reggae"],
    "Broken Beat/Nu Jazz": ["broken beat", "nu jazz"],
    "Minimal/Tech House": ["minimal techno", "tech house"],
    "Electro House": ["electro house"],
    "Post Rock/Experimental": ["post rock", "post rock band"],
    "International": ["world music", "international music"],
    "Balearic/Downtempo": ["downtempo", "balearic", "chill out music"],
    "Roots/Lovers Rock": ["lovers rock", "roots reggae"],
    "Modern Classical": ["modern classical", "contemporary classical", "neo classical"],
    "Uplifting Trance": ["uplifting trance"],
    "Drum & Bass / Jungle": ["drum and bass", "jungle music", "dnb"],
    "Dub": ["dub music", "dub reggae"],
    "Library/Archive": ["library music"],
    "Funky/Club House": ["funky house"],
    "Dancehall/Ragga": ["dancehall", "ragga"],
    "Hardstyle": ["hardstyle"],
    "Breakbeat": ["breakbeat", "big beat"],
    "Dirty Dubstep/Trap/Grime": ["grime music", "trap music"],
    "UK Garage": ["uk garage", "2step"],
    "Bass": ["bass music"],
    "Gabba": ["gabber"],
    "Hard Techno": ["hard techno"],
    "Footwork/Juke": ["footwork juke"],
    "Deep Dubstep": ["deep dubstep"],
    "Hard House": ["hard house"],
    "Progressive House": ["progressive house"],
    "DJ Tools": ["dj tools"],
    "Hard Trance": ["hard trance"],
    "Psy/Goa Trance": ["goa trance", "psytrance"],
    "UK Hardcore": ["uk hardcore rave"],
    "Bassline": ["bassline"],
    "Pop Trance": ["vocal trance"],
    "Acoustic": ["acoustic music", "acoustic guitar"],
    "Christian": ["christian music"],
    "Christmas": ["christmas songs"],
    "Contemporary Christian": ["contemporary christian"],
    "Easy Listening": ["easy listening"],
    "Gospel": ["gospel music", "gospel choir"],
    "Holiday": ["holiday music"],
    "Instrumental": ["instrumental music", "instrumental"],
    "Inspirational": ["inspirational music"],
    "Karaoke": ["karaoke"],
    "Modern Rock": ["modern rock", "alternative rock"],
    "New Age": ["new age music"],
    "Pakistan": ["pakistani music"],
    "Spiritual": ["spiritual music"],
    "Spoken Word": ["spoken word"],
    "House": ["house music", "deep house"],
    "Dance": ["dance music", "edm"],
    "Deep House": ["deep house", "deep house music"],
    "Dubstep": ["dubstep"],
    "Trance": ["trance music"],
    "Electro": ["electro music", "electro funk", "electro bass"],
    "Electronica": ["electronica"],
    "Pop": ["pop music", "pop hits"],
    "Jazz": ["jazz music", "modern jazz", "jazz fusion"],
    "Blues": ["blues music", "blues guitar", "blues rock"],
    "Folk/Americana": ["folk music", "americana", "folk singer"],
    "Indie/Alternative": ["indie music", "alternative music", "indie rock"],
    "Classical": ["classical music", "orchestra", "symphony"],
    "Country": ["country music", "country songs"],
    "African": ["african music", "afrobeats"],
    "Brazilian": ["brazilian music", "bossa nova", "samba"],
    "Latin": ["latin music", "salsa", "bachata"],
    "Reggae": ["reggae music", "reggae"],
    "Reggaeton": ["reggaeton"],
    "World": ["world music"],
    "Children": ["children music", "kids songs"],
    "Indie Rock": ["indie rock", "indie rock band"],
    "Indie Pop": ["indie pop", "indie pop music"],
};

function mapDeezerGenre(deezerGenreName: string | undefined): string {
    if (!deezerGenreName) return "Electronica";
    return deezerGenreMap[deezerGenreName] || deezerGenreName;
}

function extractYear(track: any): number {
    const releaseDate = track.album?.release_date;
    if (releaseDate) {
        const year = new Date(releaseDate).getFullYear();
        if (!isNaN(year)) return year;
    }
    return new Date().getFullYear();
}

function mapTrack(track: any, genre: string) {
    const artist = track.artist?.name || "Unknown";
    const title = track.title || "";
    const platformId = String(track.id);

    return {
        platform: "deezer",
        platformId,
        deezerTrackId: platformId,
        purchaseUrl: track.link || "",
        artist,
        releaseTitle: track.album?.title || "",
        genre,
        title,
        thumbnail: track.album?.cover_medium || "",
        releaseYear: extractYear(track),
        releaseDate: track.album?.release_date || "",
    };
}

async function deezerFetch(url: string): Promise<any> {
    const res = await fetch(url);
    if (!res.ok) return null;
    const data = await res.json();
    if (data?.error) return null;
    return data;
}

async function searchWithPagination(term: string, limit: number): Promise<any[]> {
    const tracks: any[] = [];
    for (let index = 0; index < limit; index += 25) {
        const data = await deezerFetch(
            `https://api.deezer.com/search/track?q=${encodeURIComponent(term)}&limit=25&index=${index}`
        );
        if (!data?.data?.length) break;
        tracks.push(...data.data);
        if (data.data.length < 25) break;
    }
    return tracks;
}

async function fetchGenreTracks(genre: string): Promise<any[]> {
    const tracks: any[] = [];
    const seen = new Set<string>();

    const addTrack = (track: any, g: string) => {
        const id = String(track.id);
        if (seen.has(id)) return;
        seen.add(id);
        tracks.push(mapTrack(track, g));
    };

    const deezerIds = appGenreToDeezerIds[genre];
    if (deezerIds) {
        const chartResults = await Promise.allSettled(
            deezerIds.map(async (deezerGenreId) => {
                const data = await deezerFetch(
                    `https://api.deezer.com/chart/${deezerGenreId}/tracks?limit=50`
                );
                return data;
            })
        );
        for (const result of chartResults) {
            if (result.status === "fulfilled" && result.value?.data) {
                for (const track of result.value.data) {
                    addTrack(track, genre);
                }
            }
        }
    }

    const searchTerms = genreSearchTerms[genre] || [genre];
    const searchResults = await Promise.allSettled(
        searchTerms.map((term) => searchWithPagination(term, 50))
    );
    for (const result of searchResults) {
        if (result.status === "fulfilled") {
            for (const track of result.value) {
                addTrack(track, genre);
            }
        }
    }

    return tracks;
}

async function processInBatches<T, R>(
    items: T[],
    concurrency: number,
    fn: (item: T) => Promise<R>
): Promise<R[]> {
    const results: R[] = [];
    for (let i = 0; i < items.length; i += concurrency) {
        const batch = items.slice(i, i + concurrency);
        const batchResults = await Promise.allSettled(batch.map(fn));
        for (const result of batchResults) {
            if (result.status === "fulfilled") {
                results.push(result.value);
            }
        }
    }
    return results;
}

export async function GET(req: Request) {
    const authHeader = req.headers.get("authorization");
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const allTracks: any[] = [];
        const seen = new Set<string>();

        const addTracks = (tracks: any[]) => {
            for (const track of tracks) {
                if (!seen.has(track.platformId)) {
                    seen.add(track.platformId);
                    allTracks.push(track);
                }
            }
        };

        const chartResponse = await deezer.chart.tracks(100);
        if (chartResponse?.data) {
            addTracks(
                chartResponse.data.map((track: any) =>
                    mapTrack(track, mapDeezerGenre(track.genre?.name))
                )
            );
        }

        const genreResults = await processInBatches(
            [...genres],
            CONCURRENCY,
            fetchGenreTracks
        );

        for (const tracks of genreResults) {
            addTracks(tracks);
        }

        if (!prisma) {
            return NextResponse.json(
                { error: "Database client not initialized" },
                { status: 500 }
            );
        }

        const result = await prisma.track.createMany({
            data: allTracks,
            skipDuplicates: true,
        });

        const genreCounts: Record<string, number> = {};
        for (const t of allTracks) {
            genreCounts[t.genre] = (genreCounts[t.genre] || 0) + 1;
        }
        const topGenres = Object.entries(genreCounts)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 15)
            .map(([g, c]) => `${g}: ${c}`)
            .join(", ");

        await notifyDiscord(
            `**Deezer cron sync complete**\nInserted: ${result.count}/${allTracks.length} tracks\nGenres processed: ${genres.length}\nTop: ${topGenres}`
        );

        return NextResponse.json({
            inserted: result.count,
            total: allTracks.length,
            genres: genres.length,
        });
    } catch (error: any) {
        console.error("Deezer sync error:", error);
        await notifyDiscord(
            `**Deezer cron sync failed**\nError: ${error.message || "Unknown error"}`
        );
        return NextResponse.json(
            {
                error: error.message || "Sync failed",
                code: error.code,
                meta: error.meta,
            },
            { status: 500 }
        );
    }
}
