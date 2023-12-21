const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
const fs = require("fs");
const path = require("path");

async function main() {
    const dir = "./scraping_tracks/seed";

    fs.readdir(dir, (err, files) => {
        files.map(async (file) => {
            const filePath = path.join(dir, file);
            const fileContents = fs.readFileSync(filePath, "utf8");
            const records = JSON.parse(fileContents);

            try {
                const main = async () => {
                    for (let record of records) {
                        await prisma.$executeRawUnsafe(
                            `INSERT INTO "StoredTrack" (platform, "purchaseUrl", artist, "releaseTitle", genre, title, "releaseDate", "releaseYear", id, slug) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) ON CONFLICT DO NOTHING`,
                            record.platform,
                            record.purchaseUrl,
                            record.artist,
                            record.releaseTitle,
                            record.genre,
                            record.title,
                            record.releaseDate,
                            record.releaseYear,
                            record.id,
                            record.slug
                        );
                    }
                };

                main()
                    .catch((e) => {
                        throw e;
                    })
                    .finally(async () => {
                        await prisma.$disconnect();
                    });
            } catch (error) {
                console.log("🚀 ~ file: route.ts:17 ~ GET ~ error:", error);
            }
        });
    });
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma?.$disconnect();
    });
