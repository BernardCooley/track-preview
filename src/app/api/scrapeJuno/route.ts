import { NextResponse } from "next/server";
import puppeteer from "puppeteer";
const fs = require("fs");
import { v4 as uuidv4 } from "uuid";

export async function GET() {
    const getTracks = async () => {
        const browser = await puppeteer.launch({
            headless: true,
        });
        const page = await browser.newPage();
        const allTracks = [];

        const latestRelease = fs.readFileSync(
            "juno_scraped_tracks/latestRelease.txt",
            "utf-8"
        );

        for (let i = 1; i < 50; i++) {
            console.log(`getting page ${i} of 1142`);
            console.log(
                `https://www.juno.co.uk/all/back-cat/${i}/?media_type=vinyl&order=date_down`
            );
            await page.goto(
                `https://www.juno.co.uk/all/back-cat/${i}/?media_type=vinyl&order=date_down`
            );

            page.on("console", async (msg) => {
                const msgArgs = msg.args();
                for (let i = 0; i < msgArgs.length; ++i) {
                    console.log(await msgArgs[i].jsonValue());
                }
            });

            const pageTracks: any[] = await page.$$eval(".dv-item", (nodes) => {
                const monthMap = {
                    Jan: "01",
                    Feb: "02",
                    Mar: "03",
                    Apr: "04",
                    May: "05",
                    Jun: "06",
                    Jul: "07",
                    Aug: "08",
                    Sep: "09",
                    Oct: "10",
                    Nov: "11",
                    Dec: "12",
                };
                if (nodes && nodes !== undefined) {
                    try {
                        if (nodes && nodes !== undefined && nodes.length > 0) {
                            return nodes
                                .map((n) => {
                                    const purchaseUrl = n
                                        .querySelector("a[href]")
                                        ?.getAttribute("href");

                                    const trackDetailsSection =
                                        n.querySelector(".pl-info");

                                    const trackDetailsListElements =
                                        trackDetailsSection?.querySelectorAll(
                                            ".vi-text"
                                        );

                                    const trackDetailsListElementsArray =
                                        Array.from(trackDetailsListElements!);

                                    const artist =
                                        trackDetailsListElementsArray[0]
                                            .textContent;

                                    const releaseTitle =
                                        trackDetailsListElementsArray[1]
                                            .textContent;

                                    const releaseDate =
                                        trackDetailsListElementsArray[3]
                                            .textContent;

                                    const releaseDateSplit = releaseDate
                                        ?.replace(" Add to playlist", "")
                                        .substring(
                                            releaseDate.indexOf("Rel:") + 5
                                        )
                                        .split(" ");

                                    const releaseDateObject = {
                                        day: Number(releaseDateSplit![0]),
                                        month: Number(
                                            monthMap[
                                                releaseDateSplit![1] as keyof typeof monthMap
                                            ]
                                        ),
                                        year: Number(
                                            `20${releaseDateSplit![2]}`
                                        ),
                                    };

                                    const genre =
                                        trackDetailsListElementsArray[4]
                                            .textContent;

                                    const trackListContainer =
                                        n.querySelector(".vi-tracklist");

                                    const trackListElements =
                                        trackListContainer?.querySelectorAll(
                                            ".listing-track"
                                        );
                                    const trackListElementsArray = Array.from(
                                        trackListElements!
                                    );

                                    if (
                                        trackListElementsArray &&
                                        trackListElementsArray !== undefined &&
                                        trackListElementsArray.length > 0
                                    ) {
                                        return trackListElementsArray.map(
                                            (t) => {
                                                let fullString = t.textContent!;

                                                const indexFrom =
                                                    fullString.lastIndexOf("(");

                                                if (indexFrom !== -1) {
                                                    const toRemove =
                                                        fullString.substring(
                                                            indexFrom - 1,
                                                            fullString.length
                                                        );

                                                    fullString =
                                                        fullString.replace(
                                                            toRemove,
                                                            ""
                                                        );
                                                }

                                                const text = fullString
                                                    .replaceAll("\t", "")
                                                    .replaceAll("\n", "")
                                                    .replaceAll('"', "");

                                                if (
                                                    purchaseUrl &&
                                                    artist &&
                                                    releaseTitle &&
                                                    releaseDate &&
                                                    genre &&
                                                    text
                                                ) {
                                                    return {
                                                        platform: "juno",
                                                        purchaseUrl: `https://www.juno.co.uk${purchaseUrl}`,
                                                        artist,
                                                        releaseTitle:
                                                            releaseTitle?.replace(
                                                                / *\([^)]*\) */g,
                                                                ""
                                                            ),
                                                        genre,
                                                        title: text,
                                                        releaseDate:
                                                            releaseDateObject,
                                                        id: "",
                                                    };
                                                } else {
                                                    return {};
                                                }
                                            }
                                        );
                                    } else {
                                        return [];
                                    }
                                })
                                .flat();
                        } else {
                            return [];
                        }
                    } catch (error) {
                        return [];
                    }
                }
                return [];
            });

            var data = fs.readFileSync("juno_scraped_tracks/new.json");
            var myObject = JSON.parse(data);

            myObject.push(...pageTracks);

            const purchaseUrls = myObject.map((t: any) => t.purchaseUrl);

            const ind = purchaseUrls.indexOf(latestRelease);

            if (ind !== -1) {
                myObject.splice(ind, purchaseUrls.length);

                await browser.close();
                console.log("DONE");
            }

            if (myObject.length > 0) {
                const tracksWithIds = myObject.map((t: any) => {
                    return {
                        ...t,
                        id: uuidv4(),
                    };
                });

                fs.writeFileSync(
                    "juno_scraped_tracks/latestRelease.txt",
                    tracksWithIds[0].purchaseUrl,
                    (err: any) => {
                        if (err) console.log(err);
                    }
                );

                fs.writeFileSync(
                    "juno_scraped_tracks/new.json",
                    JSON.stringify(tracksWithIds, null, 4),
                    (err: any) => {
                        if (err) console.log(err);
                    }
                );
            }

            allTracks.push(...pageTracks);
        }
        await browser.close();
        console.log("DONE");
        return allTracks;
    };

    const util = async () => {
        for (let i = 1; i < 67; i++) {
            try {
                var data = await fs.readFileSync(
                    `juno_scraped_tracks/stillToUpload/${i}.json`
                );
                console.log(
                    "🚀 ~ file: route.ts:245 ~ util ~ `juno_scraped_tracks/stillToUpload/${i}.json`:",
                    `juno_scraped_tracks/stillToUpload/${i}.json`
                );
                const tracks = JSON.parse(data);
                console.log(
                    "🚀 ~ file: route.ts:246 ~ util ~ tracks:",
                    tracks.length
                );

                // const tracksWithUpdatedDates = tracks.map((t: any) => {
                //     return {
                //         ...t,
                //         releaseYear: new Date(t.releaseDate).getFullYear(),
                //     };
                // });

                // fs.writeFileSync(
                //     `juno_scraped_tracks/stillToUpload/withYear/${i}.json`,
                //     JSON.stringify(tracksWithUpdatedDates, null, 4),
                //     (err: any) => {
                //         if (err) console.log(err);
                //     }
                // );
            } catch (error) {}
        }
    };

    // await util();

    try {
        const tracks: any = [];
        // const tracks = await getTracks();

        if (tracks) {
            const response = NextResponse.json(tracks, {
                status: 200,
            });

            return response;
        } else {
            const response = NextResponse.json(null, {
                status: 200,
            });

            return response;
        }
    } catch (error) {
        console.log("🚀 ~ file: route.ts:46 ~ POST ~ error:", error);

        return NextResponse.json(
            { error: "Failed to scrape data" },
            {
                status: 500,
            }
        );
    }
}
