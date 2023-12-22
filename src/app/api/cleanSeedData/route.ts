import { NextResponse } from "next/server";
import { Track } from "../../../../types";
const DeezerPublicApi = require("deezer-public-api");
const fs = require("fs");

export async function GET() {
    const writeFileSyncRecursive = (
        filename: string,
        content: any,
        charset: string
    ) => {
        let filepath = filename.replace(/\\/g, "/");

        let root = "";
        if (filepath[0] === "/") {
            root = "/";
            filepath = filepath.slice(1);
        } else if (filepath[1] === ":") {
            root = filepath.slice(0, 3);
            filepath = filepath.slice(3);
        }

        const folders = filepath.split("/").slice(0, -1);
        folders.reduce((acc, folder) => {
            const folderPath = acc + folder + "/";
            if (!fs.existsSync(folderPath)) {
                fs.mkdirSync(folderPath);
            }
            return folderPath;
        }, root);

        fs.writeFileSync(root + filepath, content, charset);
    };

    try {
        try {
            let startTime = Date.now();
            let elapsedTime = 0;
            let averageTimePerAlbum = 0;
            let remainingAlbums = 0;
            let remainingTime = 0;

            const delay = (ms: number) =>
                new Promise((res) => setTimeout(res, ms));

            const data = fs.readFileSync(`scraping_tracks/seed/3.json`);
            const tracks = JSON.parse(data);

            let existingNotFoundTracks: Track[] = [];
            let existingFoundTracks: Track[] = [];

            try {
                existingNotFoundTracks = JSON.parse(
                    fs.readFileSync(`scraping_tracks/seedCleaned/notFound.json`)
                );
            } catch (error) {}

            try {
                existingFoundTracks = JSON.parse(
                    fs.readFileSync(`scraping_tracks/seedCleaned/found/3.json`)
                );
            } catch (error) {}

            const allExistingTracks = [
                ...existingNotFoundTracks,
                ...existingFoundTracks,
            ];

            const filteredTracks = tracks.filter(
                (track: Track) =>
                    !allExistingTracks
                        .map((track: Track) => track.slug)
                        .includes(track.slug)
            );

            const deezer = new DeezerPublicApi();

            const processArray = async (array: Track[]) => {
                console.log(`scraping_tracks/seed/3.json`);
                for (const item of array) {
                    const index = array.indexOf(item);
                    elapsedTime = Date.now() - startTime;
                    averageTimePerAlbum = elapsedTime / index;
                    remainingAlbums = array.length - index;
                    remainingTime = remainingAlbums * averageTimePerAlbum;
                    const urlPercentage = (index / array.length) * 100;

                    try {
                        const t = await deezer.search.track(
                            `${item.artist} - ${item.title}`
                        );

                        try {
                            existingNotFoundTracks = JSON.parse(
                                fs.readFileSync(
                                    `scraping_tracks/seedCleaned/notFound.json`
                                )
                            );
                        } catch (error) {}

                        try {
                            existingFoundTracks = JSON.parse(
                                fs.readFileSync(
                                    `scraping_tracks/seedCleaned/found/3.json`
                                )
                            );
                        } catch (error) {}

                        if (t?.data?.length > 0) {
                            const userTrack: Track = {
                                releaseDate: item.releaseDate,
                                id: item.id,
                                artist: t.data[0].artist.name,
                                title: t.data[0].title,
                                previewUrl: t.data[0].preview,
                                platformId: t.data[0].id,
                                thumbnail: t.data[0].album.cover_medium,
                                url: t.data[0].link,
                                releaseYear: item.releaseYear,
                                genre: item.genre,
                                purchaseUrl: item.purchaseUrl,
                                platform: "deezer",
                                slug: `${t.data[0].artist.name
                                    .toLowerCase()
                                    .replace(/[^a-z0-9]+/g, "-")
                                    .replace(/^-|-$/g, "")}-${t.data[0].title
                                    .toLowerCase()
                                    .replace(/[^a-z0-9]+/g, "-")
                                    .replace(/^-|-$/g, "")}`,
                                releaseTitle: item.releaseTitle,
                            };

                            writeFileSyncRecursive(
                                `scraping_tracks/seedCleaned/found/3.json`,
                                JSON.stringify(
                                    [...existingFoundTracks, userTrack],
                                    null,
                                    4
                                ),
                                "utf8"
                            );
                        } else {
                            writeFileSyncRecursive(
                                `scraping_tracks/seedCleaned/notFound.json`,
                                JSON.stringify(
                                    [...existingNotFoundTracks, item],
                                    null,
                                    4
                                ),
                                "utf8"
                            );
                        }

                        console.log(
                            `${array.indexOf(item)} of ${array.length}\t${
                                t?.data?.length > 0 ? "true\t" : "false\t"
                            }${Math.floor(remainingTime / 1000 / 60)}m ${
                                Math.floor(remainingTime / 1000) % 60
                            }s remaining\t${Math.floor(urlPercentage)}%`
                        );
                    } catch (error) {
                        console.error(error);
                    }

                    await delay(0);
                }
            };

            processArray(filteredTracks);
        } catch (error) {}

        const response = NextResponse.json(
            {},
            {
                status: 200,
            }
        );

        return response;
    } catch (error: any) {
        console.error(error);

        return NextResponse.json(
            { error: error },
            {
                status: error.status || 500,
            }
        );
    }
}
