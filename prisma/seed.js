const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
const fs = require("fs");
const path = require("path");
const crypto = require("crypto");

const TRACKS_PER_GENRE = Infinity;
const BATCH_SIZE = 200;

const FOUND_DIRS = [
    path.resolve(__dirname, "../scraping_tracks/searchedTracks/deezerFrom7Digital/found"),
    path.resolve(__dirname, "../scraping_tracks/searchedTracks/deezer/found"),
    path.resolve(__dirname, "../scraping_tracks/searchedTracks/spotify/found"),
];

function shuffle(arr) {
    for (let i = arr.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
}

async function main() {
    const existing = await prisma.user.findFirst({
        where: { firebaseId: "b5dBBCVeiYUP0armJWHPnh9bDjf2" },
    });
    if (!existing) {
        await prisma.user.create({
            data: {
                id: "b5dBBCVeiYUP0armJWHPnh9bDjf2",
                firebaseId: "b5dBBCVeiYUP0armJWHPnh9bDjf2",
            },
        });
    }
    console.log("Seeded user with Firebase ID b5dBBCVeiYUP0armJWHPnh9bDjf2");

    const genreBuckets = {};
    let totalFiles = 0;

    for (const dir of FOUND_DIRS) {
        if (!fs.existsSync(dir)) {
            console.warn(`Skipping missing directory: ${dir}`);
            continue;
        }
        const files = fs.readdirSync(dir).filter((f) => f.endsWith(".json"));
        console.log(`Reading ${files.length} JSON files from ${path.basename(path.dirname(dir))}/${path.basename(dir)}...`);
        totalFiles += files.length;

        for (const file of files) {
            const filePath = path.join(dir, file);
            let tracks;
            try {
                tracks = JSON.parse(fs.readFileSync(filePath, "utf8"));
            } catch {
                console.warn(`Skipping unreadable file: ${file}`);
                continue;
            }

            for (const track of tracks) {
                const genre = track.genre;
                if (!genre) continue;
                if (!genreBuckets[genre]) genreBuckets[genre] = [];
                genreBuckets[genre].push(track);
            }
        }
    }

    console.log(`Read ${totalFiles} files total.`);

    const genres = Object.keys(genreBuckets).sort();
    console.log(`Found ${genres.length} genres across scraped data`);

    let totalInserted = 0;

    for (const genre of genres) {
        const allTracks = genreBuckets[genre];

        const existing = await prisma.track.findMany({
            where: { genre },
            select: { platformId: true },
        });
        const existingIds = new Set(existing.map((t) => t.platformId));

        const fresh = shuffle(
            allTracks.filter((t) => !existingIds.has(String(t.platformId)))
        ).slice(0, TRACKS_PER_GENRE);

        const records = fresh.map((t) => ({
            id: t.id || crypto.randomUUID(),
            platform: t.platform || "deezer",
            platformId: String(t.platformId),
            deezerTrackId: String(t.platformId),
            purchaseUrl: t.purchaseUrl || "",
            artist: t.artist || "Unknown",
            releaseTitle: t.releaseTitle || "",
            genre: t.genre,
            title: t.title || "",
            thumbnail: t.thumbnail || "",
            releaseYear: t.releaseYear || new Date().getFullYear(),
            releaseDate: t.releaseDate || "",
        }));

        let inserted = 0;
        for (let i = 0; i < records.length; i += BATCH_SIZE) {
            const batch = records.slice(i, i + BATCH_SIZE);
            try {
                const result = await prisma.track.createMany({
                    data: batch,
                    skipDuplicates: true,
                });
                inserted += result.count;
            } catch (error) {
                console.error(
                    `Error inserting batch for ${genre}:`,
                    error.message
                );
            }
        }

        totalInserted += inserted;
        console.log(
            `  ${genre}: ${inserted} inserted, ${existingIds.size} already existed (${allTracks.length} available)`
        );
    }

    console.log(`\nDone! Inserted ${totalInserted} tracks total.`);
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
