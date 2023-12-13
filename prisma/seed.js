const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
const fs = require("fs");
const path = require("path");

async function main() {
    const dir = "./juno_scraped_tracks/seed";

    fs.readdir(dir, (err, files) => {
        files.map(async (file) => {
            const filePath = path.join(dir, file);
            const fileContents = fs.readFileSync(filePath, "utf8");
            const data = JSON.parse(fileContents);

            try {
                await prisma?.storedTrack.createMany({
                    data,
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
