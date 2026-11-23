import prisma from "@/lib/prisma";
import { notifyDiscord } from "@/lib/notifyDiscord";
import { deezer } from "@/lib/deezer";
import { NextResponse } from "next/server";
import { genres } from "../../../../../data/genres";
import { deezerGenreMap, appGenreToDeezerIds } from "../../../../../data/deezerGenreMap";

const GENRES_PER_RUN = 20;

const genreSearchTerms: Record<string, string[]> = {
    "Punk/Hardcore": ["punk rock", "hardcore punk"],
    "Psych/Garage Rock": ["psychedelic rock", "garage rock"],
    "Experimental/Electronic": ["experimental electronic"],
    "50s/60s": ["60s hits", "50s rock and roll"],
    "Coldwave/Synth": ["coldwave", "synthwave"],
    "Industrial/Noise": ["industrial music", "noise rock"],
    "Ambient/Drone": ["ambient music", "drone ambient"],
    "Progressive Rock": ["progressive rock"],
    "Disco/Nu-Disco": ["nu disco", "disco funk"],
    "Reggae Classics/Ska": ["reggae classics", "ska"],
    "Broken Beat/Nu Jazz": ["broken beat", "nu jazz"],
    "Minimal/Tech House": ["minimal techno", "tech house"],
    "Electro House": ["electro house"],
    "Post Rock/Experimental": ["post rock"],
    "Balearic/Downtempo": ["downtempo", "balearic"],
    "Roots/Lovers Rock": ["lovers rock", "roots reggae"],
    "Modern Classical": ["modern classical", "contemporary classical"],
    "Uplifting Trance": ["uplifting trance"],
    "Drum & Bass / Jungle": ["drum and bass", "jungle music"],
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
    "Acoustic": ["acoustic"],
    "Christian": ["christian music"],
    "Christmas": ["christmas songs"],
    "Contemporary Christian": ["contemporary christian"],
    "Easy Listening": ["easy listening"],
    "Gospel": ["gospel"],
    "Holiday": ["holiday music"],
    "Instrumental": ["instrumental"],
    "Inspirational": ["inspirational music"],
    "Karaoke": ["karaoke"],
    "Modern Rock": ["modern rock"],
    "New Age": ["new age music"],
    "Pakistan": ["pakistani music"],
    "Spiritual": ["spiritual music"],
    "Spoken Word": ["spoken word"],
    "House": ["house music", "deep house"],
    "Dance": ["dance music", "edm"],
    "Techno": ["techno music", "detroit techno"],
    "Deep House": ["deep house", "deep house music"],
    "Dubstep": ["dubstep"],
    "Trance": ["trance music"],
    "Electro": ["electro music", "electro funk", "electro bass"],
    "Electronica": ["electronica"],
    "International": ["world music"],
};

function getDayOfYear(): number {
    const now = new Date();
    const start = new Date(now.getFullYear(), 0, 0);
    const diff = now.getTime() - start.getTime();
    return Math.floor(diff / (1000 * 60 * 60 * 24));
}

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

export async function GET(req: Request) {
    const authHeader = req.headers.get("authorization");
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const syncAll = searchParams.get("all") === "true";

    try {
        const allTracks: any[] = [];

        const chartResponse = await deezer.chart.tracks(100);
        if (chartResponse?.data) {
            for (const track of chartResponse.data) {
                allTracks.push(mapTrack(track, mapDeezerGenre(track.genre?.name)));
            }
        }

        let todaysGenres: string[];

        if (syncAll) {
            todaysGenres = [...genres];
        } else {
            const dayOfYear = getDayOfYear();
            const startIndex = (dayOfYear * GENRES_PER_RUN) % genres.length;
            todaysGenres = [];
            for (let i = 0; i < GENRES_PER_RUN; i++) {
                todaysGenres.push(genres[(startIndex + i) % genres.length]);
            }
        }

        const genreResults = await Promise.all(todaysGenres.map(async (genre) => {
            const tracks: any[] = [];
            const deezerIds = appGenreToDeezerIds[genre];

            if (deezerIds) {
                const chartResults = await Promise.allSettled(
                    deezerIds.map(async (deezerGenreId) => {
                        const chartRes = await fetch(
                            `https://api.deezer.com/chart/${deezerGenreId}/tracks?limit=25`
                        );
                        return chartRes.json();
                    })
                );
                for (const result of chartResults) {
                    if (result.status === "fulfilled" && result.value?.data) {
                        for (const track of result.value.data) {
                            tracks.push(mapTrack(track, genre));
                        }
                    }
                }
            }

            const searchTerms = genreSearchTerms[genre] || [genre];
            const searchResults = await Promise.allSettled(
                searchTerms.map((term) => deezer.search.track(term))
            );
            for (const result of searchResults) {
                if (result.status === "fulfilled" && result.value?.data) {
                    for (const track of result.value.data.slice(0, 25)) {
                        tracks.push(mapTrack(track, genre));
                    }
                }
            }

            return tracks;
        }));

        for (const tracks of genreResults) {
            allTracks.push(...tracks);
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

        await notifyDiscord(
            `**Deezer cron sync complete**\nInserted: ${result.count}/${allTracks.length} tracks\nGenres: ${todaysGenres.join(", ")}`
        );

        return NextResponse.json({
            inserted: result.count,
            total: allTracks.length,
            genres: todaysGenres,
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
